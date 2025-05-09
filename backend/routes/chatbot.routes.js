const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Chat = require('../models/chat.model');
const chatbot = require('../utils/chatbot');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get chatbot response
router.post('/query', verifyToken, async (req, res) => {
  try {
    const { query, language } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }
    
    // Get response from chatbot with optional language parameter
    const response = await chatbot.getResponse(query, language);
    
    // Save to chat history since user is authenticated (verifyToken middleware ensures this)
    let chat = await Chat.findOne({ user: req.userId });
    
    if (!chat) {
      // Create new chat if it doesn't exist
      chat = new Chat({
        user: req.userId,
        messages: []
      });
    }
    
    // Add user message
    chat.messages.push({
      sender: 'user',
      content: query,
      language: response.language || language || 'en'
    });
    
    // Add bot response
    chat.messages.push({
      sender: 'bot',
      content: response.response,
      language: response.language || language || 'en'
    });
    
    chat.updatedAt = Date.now();
    await chat.save();
    
    res.json(response);
  } catch (error) {
    console.error('Chatbot query error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get suggested questions
router.get('/suggested-questions', async (req, res) => {
  try {
    const { language } = req.query;
    const suggestedQuestions = await chatbot.getSuggestedQuestions(language || 'en');
    res.json({ suggestedQuestions });
  } catch (error) {
    console.error('Get suggested questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const chat = await Chat.findOne({ user: req.userId });
    
    if (!chat) {
      return res.json({ messages: [] });
    }
    
    res.json({ messages: chat.messages });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear chat history
router.delete('/history', verifyToken, async (req, res) => {
  try {
    await Chat.findOneAndDelete({ user: req.userId });
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Text-to-speech endpoint
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    // Get audio from chatbot
    const result = await chatbot.textToSpeech(text, language);
    
    if (result.error) {
      return res.status(500).json({ message: result.error });
    }
    
    res.json({ audio: result.audio });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get supported languages
router.get('/languages', async (req, res) => {
  try {
    const languages = chatbot.getSupportedLanguages();
    res.json({ languages });
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current language
router.get('/current-language', verifyToken, async (req, res) => {
  try {
    const currentLanguage = chatbot.getCurrentLanguage();
    res.json({ language: currentLanguage });
  } catch (error) {
    console.error('Get current language error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
