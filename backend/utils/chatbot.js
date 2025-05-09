const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// This implementation uses a Python script with Groq API for the chatbot
// The Python script uses Groq API with Mistral 7B model for response generation
// No CSV files or datasets are used - responses come directly from the Groq API

// Groq Chatbot implementation using Python script
class GroqChatbot {
  constructor() {
    this.initialized = false;
    this.suggestedQuestions = [];
    this.currentLanguage = 'en'; // Default language
    
    // Initialize the chatbot
    this.init();
  }

  async init() {
    try {
      // Get suggested questions from Python script
      this.suggestedQuestions = await this.getSuggestedQuestionsFromPython();
      console.log(`Loaded ${this.suggestedQuestions.length} suggested questions`);
      this.initialized = true;
      console.log('Groq Chatbot initialized successfully');
    } catch (error) {
      console.error('Error initializing Groq Chatbot:', error);
    }
  }

  // Execute Python script and return the output
  runPythonScript(args) {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        path.join(__dirname, '../python/groq_chatbot.py'),
        ...args
      ]);

      let result = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
        console.error(`Python Error: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python process exited with code ${code}`);
          console.error(`Error: ${error}`);
          reject(new Error(`Python process exited with code ${code}: ${error}`));
        } else {
          resolve(result);
        }
      });
    });
  }

  // Get suggested questions from Python script
  async getSuggestedQuestionsFromPython(language = 'en') {
    try {
      const result = await this.runPythonScript(['--get-suggested-questions', language]);
      return JSON.parse(result);
    } catch (error) {
      console.error('Error getting suggested questions from Python:', error);
      // Fallback to default questions
      return [
        "How do I submit my life certificate?",
        "Why is my pension payment delayed?",
        "How do I update my bank details?",
        "What documents are required for family pension?",
        "How can I check my pension status online?",
        "What is the process for filing a grievance?",
        "How long does it take to resolve a grievance?",
        "Can I submit my grievance in my regional language?",
        "What happens after I submit a grievance?",
        "How do I track the status of my grievance?"
      ];
    }
  }

  async getResponse(userQuery, language = null) {
    // Wait for initialization if not ready
    if (!this.initialized) {
      await new Promise(resolve => {
        const checkInit = () => {
          if (this.initialized) {
            resolve();
          } else {
            setTimeout(checkInit, 100);
          }
        };
        checkInit();
      });
    }

    if (!userQuery || typeof userQuery !== 'string') {
      return { response: "Please provide a valid query.", language: "en" };
    }

    try {
      // Call Python script to get response
      const args = language ? [userQuery, language] : [userQuery];
      const result = await this.runPythonScript(args);
      try {
        const response = JSON.parse(result);
        // Update current language
        if (response.language) {
          this.currentLanguage = response.language;
        }
        return response;
      } catch (parseError) {
        console.error("Error parsing Python response:", parseError);
        console.log("Raw Python output:", result);
        
        // Return a generic response
        return { 
          response: "I'm having trouble processing your request. Please try rephrasing your query or contact the pension office directly.", 
          language: "en" 
        };
      }
    } catch (error) {
      console.error("Error in Groq Chatbot response generation:", error);
      return { 
        response: "I'm having trouble processing your request. Please try again later.", 
        language: "en" 
      };
    }
  }

  getSuggestedQuestions(language = 'en') {
    return this.getSuggestedQuestionsFromPython(language);
  }
  
  // Text-to-speech functionality
  async textToSpeech(text, language = 'en') {
    if (!this.initialized) {
      await new Promise(resolve => {
        const checkInit = () => {
          if (this.initialized) {
            resolve();
          } else {
            setTimeout(checkInit, 100);
          }
        };
        checkInit();
      });
    }

    if (!text || typeof text !== 'string') {
      return { error: "Please provide valid text for speech synthesis." };
    }

    try {
      // Call Python script for text-to-speech
      const result = await this.runPythonScript(['--text-to-speech', text, language]);
      try {
        return JSON.parse(result);
      } catch (parseError) {
        console.error("Error parsing Python TTS response:", parseError);
        console.log("Raw Python TTS output:", result);
        return { error: "Error processing text-to-speech request." };
      }
    } catch (error) {
      console.error("Error in text-to-speech generation:", error);
      return { error: "Failed to generate speech. Please try again later." };
    }
  }

  // Get the current language being used
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  // Get list of supported languages
  getSupportedLanguages() {
    return {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'hi': 'Hindi',
      'mr': 'Marathi',
      'ta': 'Tamil',
      'te': 'Telugu',
      'bn': 'Bengali',
      'gu': 'Gujarati',
      'kn': 'Kannada',
      'ml': 'Malayalam',
      'pa': 'Punjabi',
      'ur': 'Urdu'
    };
  }
}

// Create a singleton instance
const chatbotInstance = new GroqChatbot();

module.exports = chatbotInstance;
