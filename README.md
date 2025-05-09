# CitizenVoice - AI-Powered Grievance Redressal System

CitizenVoice is an intelligent grievance redressal platform designed to streamline the process of filing, tracking, and resolving citizen grievances through advanced AI capabilities.

## Features

- **User Authentication**: Secure login and registration system with JWT and OAuth
- **Grievance Filing**: Intuitive interface for submitting grievances with multi-modal support
- **Grievance Tracking**: Real-time status updates and transparent process tracking
- **Groq-Powered Chatbot**: Advanced conversational assistant using Mistral 7B model
- **Multi-modal Input**: Support for text, voice, and image inputs
- **Location-based Routing**: Intelligent routing of grievances based on location
- **Emotion Analysis**: Prioritization of urgent grievances through sentiment detection
- **Multilingual Support**: Communicate in multiple languages
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

### Frontend
- React.js
- Material-UI
- Redux for state management
- Socket.io client for real-time updates

### Backend
- Node.js with Express.js
- Python for AI/ML components
- MongoDB for database
- JWT and OAuth for authentication
- Socket.io for real-time communication

### AI/ML Components
- Groq API with llama3-8b-8192 model for the conversational interface
- TensorFlow for machine learning capabilities
- Natural Language Processing for grievance categorization
- Emotion analysis for prioritizing urgent grievances

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/citizen-redressal.git
cd citizen-redressal
```

2. Install backend dependencies
```
cd backend
npm install
```

3. Install frontend dependencies
```
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/citizen-redressal
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
CLIENT_URL=http://localhost:3000
GROQ_API_KEY=your-groq-api-key
```

### Running the Application

1. Start the backend server
```
cd backend
npm start
```

2. Start the frontend development server
```
cd frontend
npm start
```

3. Access the application at http://localhost:3000

## Usage

1. **Register/Login**: Create an account or log in to access the system
2. **File a Grievance**: Submit your grievance with relevant details and attachments
3. **Track Status**: Monitor the progress of your grievance in real-time
4. **Receive Updates**: Get notifications when there are updates to your grievance
5. **Use the Chatbot**: Get instant assistance from the Groq-powered chatbot with Mistral 7B model

## Project Structure

```
citizen-redressal/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── data/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── chatbot/
│   │   ├── groq_api.py
│   │   └── conversation_handler.py
│   ├── server.js
│   ├── requirements.txt
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── chatbot/
│   │   │   │   ├── Chatbot.js
│   │   │   │   ├── ChatMessage.js
│   │   │   │   └── emblem.js
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for providing the tools and libraries used in this project
- Thanks to Groq for providing the powerful LLM API that powers our chatbot

## Chatbot Features

The CitizenVoice chatbot is powered by Groq's API using the Mistral 7B model, offering:

- **Contextual Conversations**: Maintains conversation history for more coherent interactions
- **Suggested Questions**: Provides relevant question suggestions based on common grievance topics
- **Modern UI**: Clean interface with Groq branding
- **Fast Response Times**: Leveraging Groq's high-performance inference
- **Multilingual Support**: Ability to understand and respond in multiple languages

### Chatbot Technical Implementation

- **Backend**: Python integration with Node.js
- **API Integration**: Direct connection to Groq API
- **Context Management**: Maintains conversation history for more natural interactions
- **No Local Models**: Relies solely on the API for generating responses without using local CSV files or datasets
