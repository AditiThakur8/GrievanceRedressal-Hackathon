import os
import sys
import json
import traceback
import base64
import tempfile
from gtts import gTTS
from pydub import AudioSegment
from dotenv import load_dotenv
from groq import Groq
import langid  # Add language detection library

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

# Get Groq API key from environment
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
if not GROQ_API_KEY:
    print("Error: GROQ_API_KEY not found in environment variables", file=sys.stderr)
    sys.exit(1)

# Initialize Groq client
MODEL = "llama3-8b-8192"  # Using Llama 3 8B model which should be available in Groq

# Language mapping for supported languages
SUPPORTED_LANGUAGES = {
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
}

class GroqChatbot:
    def __init__(self):
        self.conversation_history = []
        self.current_language = 'en'  # Default language is English
        self.suggested_questions = [
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
        ]
        # Initialize the Groq client
        self.client = Groq(api_key=GROQ_API_KEY)
        
        # List available models to verify
        try:
            models = self.client.models.list()
            sys.stderr.write(f"Available models: {[model.id for model in models.data]}\n")
        except Exception as e:
            sys.stderr.write(f"Error listing models: {str(e)}\n")
        
        sys.stderr.write("Groq Chatbot initialized successfully\n")
    
    def detect_language(self, text):
        """Detect the language of the input text"""
        try:
            lang, _ = langid.classify(text)
            return lang if lang in SUPPORTED_LANGUAGES else 'en'
        except Exception as e:
            sys.stderr.write(f"Error detecting language: {str(e)}\n")
            return 'en'  # Default to English on error
    
    def get_response(self, user_query, language=None, conversation_history=None):
        if not user_query or not isinstance(user_query, str):
            return "Please provide a valid query."
        
        # Detect language if not provided
        detected_language = language or self.detect_language(user_query)
        self.current_language = detected_language
        
        # Use provided conversation history or the instance's history
        messages = conversation_history if conversation_history else self.conversation_history.copy()
        
        # Add system message if it's not already there
        if not messages or messages[0].get('role') != 'system':
            # Include language instruction in the system message
            language_name = SUPPORTED_LANGUAGES.get(detected_language, 'English')
            messages.insert(0, {
                "role": "system",
                "content": f"You are a helpful assistant for a Citizen Grievance Redressal System. Your purpose is to help citizens with their grievances related to government services, especially pension-related issues. Provide clear, concise, and accurate information. If you don't know something, admit it and suggest where they might find the information. Be empathetic and professional. IMPORTANT: Respond in {language_name} language to match the user's language preference."
            })
        
        # Add the user's query if not already in messages
        if not any(msg.get('role') == 'user' and msg.get('content') == user_query for msg in messages):
            messages.append({"role": "user", "content": user_query})
        
        try:
            # Log the request for debugging
            sys.stderr.write(f"Sending request to Groq API with model: {MODEL}\n")
            sys.stderr.write(f"Language: {detected_language} ({SUPPORTED_LANGUAGES.get(detected_language, 'Unknown')})\n")
            sys.stderr.write(f"Messages: {json.dumps(messages)}\n")
            
            # Use the Groq client to get a response
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=MODEL,
                temperature=0.7,
                max_tokens=1024,
                stream=False
            )
            
            # Extract the assistant's response
            assistant_response = chat_completion.choices[0].message.content
            
            # Log the response for debugging
            sys.stderr.write(f"Received response from Groq API: {assistant_response[:100]}...\n")
            
            # Update conversation history
            messages.append({"role": "assistant", "content": assistant_response})
            self.conversation_history = messages
            
            return {
                "response": assistant_response,
                "language": detected_language
            }
            
        except Exception as e:
            error_details = traceback.format_exc()
            sys.stderr.write(f"Error in get_response: {str(e)}\n")
            sys.stderr.write(f"Detailed error: {error_details}\n")
            
            # Return a fallback response in the detected language
            fallback_responses = {
                'en': "I'm having trouble processing your request. Please try again later.",
                'es': "Estoy teniendo problemas para procesar su solicitud. Por favor, inténtelo de nuevo más tarde.",
                'fr': "J'ai du mal à traiter votre demande. Veuillez réessayer plus tard.",
                'hi': "मुझे आपके अनुरोध को संसाधित करने में समस्या हो रही है। कृपया बाद में पुन: प्रयास करें।",
                'mr': "मला आपल्या विनंतीवर प्रक्रिया करण्यात समस्या येत आहे. कृपया नंतर पुन्हा प्रयत्न करा.",
                'ta': "உங்கள் கோரிக்கையை செயலாக்குவதில் எனக்கு சிரமம் உள்ளது. தயவுசெய்து பின்னர் மீண்டும் முயற்சிக்கவும்.",
                'te': "మీ అభ్యర్థనను ప్రాసెస్ చేయడంలో నాకు సమస్య ఉంది. దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి.",
                'bn': "আমি আপনার অনুরোধ প্রক্রিয়া করতে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।",
                'gu': "મને તમારી વિનંતી પર પ્રક્રિયા કરવામાં મુશ્કેલી પડી રહી છે. કૃપા કરીને પછી ફરી પ્રયાસ કરો.",
                'kn': "ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುವಲ್ಲಿ ನನಗೆ ತೊಂದರೆಯಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
                'ml': "നിങ്ങളുടെ അഭ്യർത്ഥന പ്രോസസ്സ് ചെയ്യുന്നതിൽ എനിക്ക് ബുദ്ധിമുട്ടുണ്ട്. ദയവായി പിന്നീട് വീണ്ടും ശ്രമിക്കുക.",
                'pa': "ਮੈਨੂੰ ਤੁਹਾਡੀ ਬੇਨਤੀ 'ਤੇ ਕਾਰਵਾਈ ਕਰਨ ਵਿੱਚ ਮੁਸ਼ਕਲ ਹੋ ਰਹੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
                'ur': "مجھے آپ کی درخواست پر کارروائی کرنے میں دشواری ہو رہی ہے۔ براہ کرم بعد میں دوبارہ کوشش کریں۔"
            }
            
            fallback = fallback_responses.get(detected_language, fallback_responses['en'])
            return {
                "response": fallback,
                "language": detected_language
            }
    
    def get_suggested_questions(self, language='en'):
        """Get suggested questions in the specified language"""
        # Translate suggested questions based on language
        # For now, we'll just return English questions
        # In a production system, you would use a translation service or pre-translated questions
        return self.suggested_questions
    
    def clear_conversation_history(self):
        """Clear the conversation history but keep the system message"""
        if self.conversation_history and self.conversation_history[0].get('role') == 'system':
            self.conversation_history = [self.conversation_history[0]]
        else:
            self.conversation_history = []
        return True
        
    def text_to_speech(self, text, language='en'):
        """
        Convert text to speech using Google's Text-to-Speech API
        Returns a base64 encoded audio string
        """
        try:
            # Create a temporary file to store the audio
            with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
                temp_filename = temp_file.name
            
            # Generate speech using gTTS
            tts = gTTS(text=text, lang=language, slow=False)
            tts.save(temp_filename)
            
            # Convert to base64 for sending over HTTP
            with open(temp_filename, 'rb') as audio_file:
                audio_data = audio_file.read()
                base64_audio = base64.b64encode(audio_data).decode('utf-8')
            
            # Clean up the temporary file
            os.remove(temp_filename)
            
            return base64_audio
        except Exception as e:
            error_details = traceback.format_exc()
            sys.stderr.write(f"Error in text_to_speech: {str(e)}\n")
            sys.stderr.write(f"Detailed error: {error_details}\n")
            return None

# For command-line usage
if __name__ == "__main__":
    try:
        # Initialize the chatbot
        chatbot = GroqChatbot()
        
        # Process input from command line
        if len(sys.argv) > 1:
            if sys.argv[1] == "--get-suggested-questions":
                language = sys.argv[2] if len(sys.argv) > 2 else 'en'
                print(json.dumps(chatbot.get_suggested_questions(language)))
            elif sys.argv[1] == "--text-to-speech":
                # Format: python groq_chatbot.py --text-to-speech "Text to convert" [language_code]
                if len(sys.argv) < 3:
                    print(json.dumps({"error": "No text provided for text-to-speech"}))
                else:
                    text = sys.argv[2]
                    language = sys.argv[3] if len(sys.argv) > 3 else 'en'
                    audio_base64 = chatbot.text_to_speech(text, language)
                    print(json.dumps({"audio": audio_base64}))
            else:
                # Assume the argument is a query
                query = sys.argv[1]
                language = sys.argv[2] if len(sys.argv) > 2 else None
                response = chatbot.get_response(query, language)
                print(json.dumps(response))
        else:
            # Interactive mode
            print("Citizen Grievance Chatbot powered by Groq. Type 'exit' to quit.")
            while True:
                user_input = input("Your query: ")
                if user_input.lower() == 'exit':
                    print("Goodbye!")
                    break
                response = chatbot.get_response(user_input)
                print("Bot:", response["response"])
    except Exception as e:
        # Fallback in case of initialization error
        print(f"Error initializing chatbot: {e}", file=sys.stderr)
        
        if len(sys.argv) > 1:
            if sys.argv[1] == "--get-suggested-questions":
                # Return sample questions as fallback
                suggested_questions = [
                    "How do I submit my life certificate?",
                    "Why is my pension payment delayed?",
                    "How do I update my bank details?",
                    "What documents are required for family pension?",
                    "How can I check my pension status online?"
                ]
                print(json.dumps(suggested_questions))
            elif sys.argv[1] == "--text-to-speech":
                print(json.dumps({"error": "Failed to initialize text-to-speech functionality"}))
            else:
                # Return a fallback response
                print(json.dumps({"response": "I'm having trouble accessing my knowledge base right now. Please try again later or contact the pension office directly for assistance.", "language": "en"}))
