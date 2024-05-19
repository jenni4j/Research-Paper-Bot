from flask import Flask, request, jsonify
import os
import requests
from io import BytesIO
import logging
from flask_cors import CORS

from langchain_community.document_loaders import PyPDFLoader # for loading the pdf
from langchain_community.embeddings import OpenAIEmbeddings # for creating embeddings
from langchain_community.vectorstores import Chroma # for the vectorization part
from langchain.chains import ConversationalRetrievalChain
from langchain_community.chat_models import ChatOpenAI

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Enable CORS for the /api/* endpoints

logging.basicConfig(level=logging.DEBUG)

@app.route('/api/ask', methods=['POST'])

def process_paper():
    app.logger.debug("Received request to /api/ask")

    # Check if the POST request has the file part
    if 'paper' not in request.files or 'question' not in request.form:
        return jsonify({'error': 'No file or question provided'}), 400
    
    pdf_file = request.files['paper']
    question = request.form['question']

    # Save the PDF file to a temporary location
    pdf_path = os.path.join("uploads")
    pdf_file.save(pdf_path)
    
    loader = PyPDFLoader(pdf_path)
    pages = loader.load_and_split()

    embeddings = OpenAIEmbeddings(openai_api_key="")
    vectordb = Chroma.from_documents(pages, embedding=embeddings,
                                 persist_directory=".")
    vectordb.persist()
    pdf_vector = ConversationalRetrievalChain.from_llm(ChatOpenAI(temperature=0.9, model_name="gpt-3.5-turbo", openai_api_key=""),
                                    vectordb.as_retriever())
    
    result = pdf_vector({"question": question, "chat_history": ""})
    response = result["answer"]

    # os.remove(pdf_path)

    return jsonify({'answer': response})

if __name__ == '__main__':
    app.run(debug=True, port=3000)



