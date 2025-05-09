import React, { useState, useEffect, useRef } from 'react';
import { 
  Typography, 
  IconButton, 
  Box, 
  CircularProgress, 
  Fade,
  Zoom,
  Tooltip,
  Avatar,
  Button,
  Paper,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TranslateIcon from '@mui/icons-material/Translate';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { emblemBase64 } from './emblem';

const Chatbot = ({ show, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioQueue, setAudioQueue] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);
  const [supportedLanguages, setSupportedLanguages] = useState({});
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isExpanded, setIsExpanded] = useState(false);
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Initialize speech recognition if available in browser
  const recognition = window.SpeechRecognition || window.webkitSpeechRecognition 
    ? new (window.SpeechRecognition || window.webkitSpeechRecognition)() 
    : null;
  
  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
  }

  useEffect(() => {
    // Fetch supported languages
    const fetchSupportedLanguages = async () => {
      try {
        const res = await axios.get('/api/chatbot/languages');
        setSupportedLanguages(res.data.languages);
      } catch (error) {
        console.error('Error fetching supported languages:', error);
        // Set fallback languages
        setSupportedLanguages({
          'en': 'English',
          'es': 'Spanish',
          'fr': 'French',
          'hi': 'Hindi'
        });
      }
    };

    // Fetch suggested questions when component mounts
    const fetchSuggestedQuestions = async () => {
      try {
        const res = await axios.get(`/api/chatbot/suggested-questions?language=${selectedLanguage}`);
        setSuggestedQuestions(res.data.suggestedQuestions);
        console.log('Loaded suggested questions:', res.data.suggestedQuestions);
      } catch (error) {
        console.error('Error fetching suggested questions:', error);
        // Set some default questions as fallback
        setSuggestedQuestions([
          'How do I submit my life certificate?',
          'Why is my pension payment delayed?',
          'How do I update my bank details?',
          'What documents are required for family pension?',
          'How can I check my pension status online?'
        ]);
      }
    };

    // Fetch chat history if user is authenticated
    const fetchChatHistory = async () => {
      if (isAuthenticated) {
        try {
          const res = await axios.get('/api/chatbot/history');
          if (res.data.messages && res.data.messages.length > 0) {
            setMessages(res.data.messages);
            // Set the current language based on the last message
            const lastMessage = res.data.messages[res.data.messages.length - 1];
            if (lastMessage && lastMessage.language) {
              setCurrentLanguage(lastMessage.language);
              setSelectedLanguage(lastMessage.language);
            }
          } else {
            // Add a welcome message if no history
            setMessages([
              {
                sender: 'bot',
                content: 'Welcome to the Citizen Grievance Redressal System! How can I help you today?',
                language: 'en'
              }
            ]);
          }
        } catch (error) {
          console.error('Error fetching chat history:', error);
        }
      } else {
        // Add a welcome message for non-authenticated users
        setMessages([
          {
            sender: 'bot',
            content: 'Welcome to the Citizen Grievance Redressal System! How can I help you today?',
            language: 'en'
          }
        ]);
      }
    };

    fetchSupportedLanguages();
    fetchSuggestedQuestions();
    fetchChatHistory();
  }, [isAuthenticated, selectedLanguage]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
    
    // If voice is enabled and a new bot message is added, speak it
    const lastMessage = messages[messages.length - 1];
    if (voiceEnabled && lastMessage && lastMessage.sender === 'bot' && !isSpeaking) {
      speakText(lastMessage.content, lastMessage.language || currentLanguage);
    }
  }, [messages, voiceEnabled, isSpeaking, currentLanguage]);

  useEffect(() => {
    if (audioQueue.length > 0 && !isSpeaking) {
      playNextInQueue();
    }
  }, [audioQueue, isSpeaking]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleInputFocus = () => {
    // Hide suggestions when user focuses on input
    if (showSuggestions) {
      setShowSuggestions(false);
    }
  };

  const navigateToLogin = () => {
    navigate('/login');
    onClose();
  };

  const navigateToRegister = () => {
    navigate('/register');
    onClose();
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);
    setAutoDetectLanguage(false);
  };

  const toggleAutoDetectLanguage = () => {
    setAutoDetectLanguage(!autoDetectLanguage);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || loading) return;
    
    const userMessage = {
      sender: 'user',
      content: input,
      language: selectedLanguage
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // Send request to backend
      const response = await axios.post('/api/chatbot/query', {
        query: input,
        language: autoDetectLanguage ? null : selectedLanguage
      });
      
      // Update current language if auto-detect is enabled
      if (autoDetectLanguage && response.data.language) {
        setCurrentLanguage(response.data.language);
        setSelectedLanguage(response.data.language);
      }
      
      // Add bot response to messages
      const botMessage = {
        sender: 'bot',
        content: response.data.response,
        language: response.data.language || selectedLanguage
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
      
      // Show suggestions after bot response
      setShowSuggestions(true);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      setMessages(prevMessages => [
        ...prevMessages, 
        {
          sender: 'bot',
          content: 'Sorry, I encountered an error. Please try again later.',
          language: 'en'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = async (question) => {
    if (loading) return;
    
    const userMessage = {
      sender: 'user',
      content: question,
      language: selectedLanguage
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setShowSuggestions(false);
    setLoading(true);
    
    try {
      // Send request to backend
      const response = await axios.post('/api/chatbot/query', {
        query: question,
        language: autoDetectLanguage ? null : selectedLanguage
      });
      
      // Update current language if auto-detect is enabled
      if (autoDetectLanguage && response.data.language) {
        setCurrentLanguage(response.data.language);
        setSelectedLanguage(response.data.language);
      }
      
      // Add bot response to messages
      const botMessage = {
        sender: 'bot',
        content: response.data.response,
        language: response.data.language || selectedLanguage
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
      
      // Show suggestions after bot response
      setShowSuggestions(true);
      
    } catch (error) {
      console.error('Error sending suggested question:', error);
      
      // Add error message
      setMessages(prevMessages => [
        ...prevMessages, 
        {
          sender: 'bot',
          content: 'Sorry, I encountered an error. Please try again later.',
          language: 'en'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const playNextInQueue = () => {
    if (audioQueue.length === 0) {
      setIsSpeaking(false);
      return;
    }
    
    setIsSpeaking(true);
    const nextAudio = audioQueue[0];
    audioRef.current.src = nextAudio;
    audioRef.current.play().catch(error => {
      console.error('Error playing audio:', error);
      setIsSpeaking(false);
      setAudioQueue(prevQueue => prevQueue.slice(1));
    });
    
    // Remove this audio from the queue once it starts playing
    setAudioQueue(prevQueue => prevQueue.slice(1));
  };
  
  const handleAudioEnded = () => {
    if (audioQueue.length > 0) {
      playNextInQueue();
    } else {
      setIsSpeaking(false);
    }
  };
  
  const toggleVoiceOutput = () => {
    if (voiceEnabled) {
      // Turn off voice
      setVoiceEnabled(false);
      setIsSpeaking(false);
      setAudioQueue([]);
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    } else {
      // Turn on voice
      setVoiceEnabled(true);
    }
  };
  
  const speakText = async (text, language = 'en') => {
    try {
      const response = await axios.post('/api/chatbot/text-to-speech', {
        text,
        language
      });
      
      if (response.data.audio) {
        const audioSrc = `data:audio/mp3;base64,${response.data.audio}`;
        
        // Add to queue
        setAudioQueue(prevQueue => [...prevQueue, audioSrc]);
      }
    } catch (error) {
      console.error('Error generating speech:', error);
    }
  };
  
  const playMessageAudio = (messageContent) => {
    if (!voiceEnabled || isSpeaking) return;
    
    // Find the message
    const message = messages.find(msg => msg.content === messageContent);
    if (message) {
      speakText(message.content, message.language || currentLanguage);
    }
  };

  // Toggle chatbot size between compact and expanded
  const toggleChatbotSize = () => {
    setIsExpanded(!isExpanded);
    setTimeout(scrollToBottom, 300); // Scroll to bottom after resize animation completes
  };

  // Toggle language dialog
  const toggleLanguageDialog = () => {
    setLanguageDialogOpen(!languageDialogOpen);
  };

  // Handle language selection from dialog
  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
    setAutoDetectLanguage(false);
    setLanguageDialogOpen(false);
  };

  return (
    <Fade in={show}>
      <div className={`chatbot-container ${isExpanded ? 'chatbot-expanded' : ''}`}>
        <div className="chatbot-header">
          <div className="chatbot-header-left">
            <SmartToyIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              CitizenVoice Assistant
            </Typography>
          </div>
          <div className="chatbot-header-right">
            <Tooltip title="Change Language">
              <IconButton 
                onClick={toggleLanguageDialog} 
                size="small" 
                sx={{ color: 'white', mr: 1 }}
              >
                <TranslateIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={isExpanded ? "Minimize" : "Expand"}>
              <IconButton 
                onClick={toggleChatbotSize} 
                size="small" 
                sx={{ color: 'white', mr: 1 }}
              >
                {isExpanded ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton 
                onClick={onClose} 
                size="small" 
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <div className="chatbot-subheader">
          <div className="government-badge">
            <img 
              src={emblemBase64} 
              alt="Government Emblem" 
              className="government-emblem"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>

        <div className="chatbot-messages" ref={messagesEndRef}>
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`chatbot-message ${message.sender}`}
              ref={index === messages.length - 1 ? messagesEndRef : null}
            >
              {message.sender === 'bot' && (
                <Avatar 
                  className="chatbot-avatar bot-avatar"
                  sx={{ bgcolor: '#1976d2' }}
                >
                  <SmartToyIcon fontSize="small" />
                </Avatar>
              )}
              <div className="chatbot-message-content">
                <Typography 
                  variant="body1" 
                  component="div" 
                  sx={{ 
                    whiteSpace: 'pre-line',
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                  }}
                >
                  {message.content}
                </Typography>
                {message.sender === 'bot' && (
                  <img 
                    src={emblemBase64} 
                    alt="" 
                    className="message-emblem-watermark"
                  />
                )}
              </div>
              {message.sender === 'user' && (
                <Avatar 
                  className="chatbot-avatar user-avatar"
                  sx={{ bgcolor: '#e0e0e0', color: '#333' }}
                >
                  {isAuthenticated ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {!isAuthenticated && (
          <Paper sx={{ p: 2, m: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="body2" gutterBottom>
              Sign in to save your conversation history and get personalized assistance.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1 }}>
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<LoginIcon />}
                onClick={navigateToLogin}
                size="small"
              >
                Login
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<PersonAddIcon />}
                onClick={navigateToRegister}
                size="small"
              >
                Register
              </Button>
            </Box>
          </Paper>
        )}

        {/* Suggested questions section - now separate from input field */}
        {isAuthenticated && showSuggestions && (
          <div className="chatbot-floating-suggestions">
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1 }}>
              <QuestionAnswerIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle2" color="primary.main">
                Suggested Questions
              </Typography>
            </Box>
            <div className="chatbot-suggestions-scroll">
              <div className="chatbot-suggestions-horizontal">
                {suggestedQuestions.map((question, index) => (
                  <Tooltip title={question} key={index} placement="top" arrow>
                    <Zoom in={true} style={{ transitionDelay: `${index * 50}ms` }}>
                      <div 
                        className="chatbot-suggestion"
                        onClick={() => handleSuggestedQuestion(question)}
                      >
                        {question.length > 30 ? `${question.substring(0, 27)}...` : question}
                      </div>
                    </Zoom>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="chatbot-input">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={isListening ? "Listening..." : "Type your message..."}
            disabled={loading || isListening}
            aria-label="Type your message"
          />
          {recognition && (
            <Tooltip title={isListening ? "Stop listening" : "Start voice input"}>
              <IconButton 
                onClick={() => {
                  if (!isListening) {
                    recognition.start();
                    setIsListening(true);
                  } else {
                    recognition.stop();
                    setIsListening(false);
                  }
                }} 
                disabled={loading}
                color={isListening ? "error" : "default"}
                sx={{ 
                  mx: 0.5,
                  animation: isListening ? 'pulse 1.5s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                    '100%': { opacity: 1 }
                  }
                }}
              >
                {isListening ? <MicIcon fontSize="small" /> : <MicOffIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
          <button type="submit" disabled={loading || isListening} aria-label="Send message">
            {loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon fontSize="small" />}
          </button>
        </form>
        
        {/* Voice controls */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 1, borderTop: '1px solid #eee' }}>
          <FormControlLabel
            control={
              <Switch 
                checked={voiceEnabled} 
                onChange={toggleVoiceOutput} 
                color="primary" 
                size="small"
              />
            }
            label={
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
                <VolumeUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                Voice Output
              </Typography>
            }
          />
          
          {isAuthenticated && (
            <div className="chatbot-footer-badge">
              <Typography variant="caption" color="textSecondary">
                Secured & Verified
              </Typography>
            </div>
          )}
        </Box>
        
        {/* Hidden audio element */}
        <audio 
          ref={audioRef} 
          style={{ display: 'none' }} 
          onEnded={handleAudioEnded}
        />
        
        {/* Language selection dialog */}
        <Dialog open={languageDialogOpen} onClose={toggleLanguageDialog} maxWidth="xs" fullWidth>
          <DialogTitle>
            Select Language / भाषा चुनें / ভাষা নির্বাচন করুন
          </DialogTitle>
          <DialogContent>
            <List>
              {Object.entries(supportedLanguages).map(([code, name]) => (
                <ListItem 
                  button 
                  key={code} 
                  onClick={() => handleLanguageSelect(code)}
                  selected={selectedLanguage === code}
                >
                  <ListItemText primary={name} />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <FormControlLabel
              control={
                <Switch 
                  checked={autoDetectLanguage} 
                  onChange={toggleAutoDetectLanguage} 
                  color="primary" 
                />
              }
              label="Auto-detect language"
            />
            <Button onClick={toggleLanguageDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </Fade>
  );
};

export default Chatbot;
