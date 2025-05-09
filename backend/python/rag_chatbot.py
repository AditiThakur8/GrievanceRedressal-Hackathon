import pandas as pd
import numpy as np
import json
import sys
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Loading the dataset
def load_dataset():
    try:
        import os
        script_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(script_dir, '..', 'data', 'pension_grievance_dataset_1500.csv')
        # Don't print debug info to stdout as it breaks JSON parsing
        sys.stderr.write(f"Looking for dataset at: {data_path}\n")
        data = pd.read_csv(data_path)
        data = data.dropna(subset=['query', 'sample_response'])
        data = data[data['query'].str.strip() != '']
        data = data[data['sample_response'].str.strip() != '']
        return data
    except Exception as e:
        print(f"Error loading dataset: {e}", file=sys.stderr)
        return None

# Initializing the RAG model
class RAGChatbot:
    def __init__(self):
        self.data = load_dataset()
        if self.data is None:
            raise ValueError("Failed to load dataset")
        
        # Use TF-IDF vectorizer instead of SentenceTransformer
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.query_embeddings = self.vectorizer.fit_transform(self.data['query'].tolist())
        
        # Extract suggested questions (first 10)
        self.suggested_questions = self.data['query'].head(10).tolist()
        
        # Use stderr for debug output
        sys.stderr.write(f"Loaded {len(self.data)} entries from dataset\n")
        sys.stderr.write(f"Loaded {len(self.suggested_questions)} suggested questions\n")
        sys.stderr.write("RAG Chatbot initialized successfully\n")
    
    def get_response(self, user_query):
        if not user_query or not isinstance(user_query, str):
            return "Please provide a valid query."
        
        # Check for exact match first
        exact_match = self.data[self.data['query'].str.lower() == user_query.lower()]
        if not exact_match.empty:
            return exact_match.iloc[0]['sample_response']
        
        # Vectorize the user query
        user_embedding = self.vectorizer.transform([user_query])
        
        # Calculate cosine similarities
        similarities = cosine_similarity(user_embedding, self.query_embeddings)[0]
        
        # Find the index of maximum similarity
        max_similarity_idx = np.argmax(similarities)
        max_similarity = similarities[max_similarity_idx]
        
        # Use stderr for debug output
        sys.stderr.write(f"Query: '{user_query}' matched with '{self.data.iloc[max_similarity_idx]['query']}' (score: {max_similarity:.2f})\n")
        
        if max_similarity > 0.3:
            return self.data.iloc[max_similarity_idx]['sample_response']
        else:
            return (
                "Sorry, I couldn't find a relevant answer. Please try rephrasing your query or contact the pension office. "
                "Interesting Fact: Many users report issues with the DARPG portal loading, indicating a need for improved digital infrastructure."
            )
    
    def get_suggested_questions(self):
        return self.suggested_questions

# Sample fallback dataset in case the CSV can't be loaded
SAMPLE_DATASET = [
    {
        "query": "How can I check the status of my pension application?",
        "sample_response": "You can check your pension application status by visiting the DARPG portal (https://pgportal.gov.in) and entering your registration number. Alternatively, you can call the pension helpline at 1800-11-1960."
    },
    {
        "query": "What documents are required to file a pension grievance?",
        "sample_response": "To file a pension grievance, you'll need: 1) Your pension ID/PPO number, 2) Identity proof (Aadhaar/PAN/Voter ID), 3) Details of previous correspondence with the pension department, 4) Any supporting documents related to your grievance."
    },
    {
        "query": "Why is my pension payment delayed?",
        "sample_response": "Pension payments can be delayed due to several reasons: 1) Bank account verification issues, 2) Incomplete life certificate submission, 3) Technical problems in the disbursement system, or 4) Administrative processing delays. Please provide your pension ID for specific assistance."
    },
    {
        "query": "How do I update my bank details for pension disbursal?",
        "sample_response": "To update your bank details for pension disbursal, submit Form 14 to your pension disbursing authority along with a canceled cheque or bank passbook copy. For online updates, visit the pension portal and navigate to the 'Update Bank Details' section under your profile."
    },
    {
        "query": "What should I do if the DARPG portal is not working?",
        "sample_response": "If the DARPG portal is not working, you can: 1) Try again after some time as it might be under maintenance, 2) Use alternative browsers, 3) Clear your browser cache, or 4) Contact the technical support at helpdesk-darpg@gov.in or call 1800-11-1960."
    }
]

# For command-line usage
if __name__ == "__main__":
    try:
        # Initialize the chatbot
        chatbot = RAGChatbot()
        
        # Process input from command line
        if len(sys.argv) > 1:
            if sys.argv[1] == "--get-suggested-questions":
                print(json.dumps(chatbot.get_suggested_questions()))
            else:
                # Assume the argument is a query
                query = sys.argv[1]
                response = chatbot.get_response(query)
                print(json.dumps({"response": response}))
        else:
            # Interactive mode
            print("Pension Grievance Chatbot. Type 'exit' to quit.")
            while True:
                user_input = input("Your query: ")
                if user_input.lower() == 'exit':
                    print("Goodbye!")
                    break
                response = chatbot.get_response(user_input)
                print("Bot:", response)
    except Exception as e:
        # Fallback in case of initialization error
        print(f"Error initializing chatbot: {e}", file=sys.stderr)
        
        if len(sys.argv) > 1:
            if sys.argv[1] == "--get-suggested-questions":
                # Return sample questions as fallback
                suggested_questions = [item["query"] for item in SAMPLE_DATASET]
                print(json.dumps(suggested_questions))
            else:
                # Return a fallback response
                print(json.dumps({"response": "I'm having trouble accessing my knowledge base right now. Please try again later or contact the pension office directly for assistance."}))
