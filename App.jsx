import { useState} from 'react'

import './App.css'

const API_KEY='';

function App() {
  const [paper, setPaper] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleFileChange = (e) => {
    setPaper(e.target.files[0]);
  };

  const callOpenAIAPI = async () => {
    if (!paper || !question) {
      alert("Please upload a PDF and enter a question.");
      return;
    }

    // Create a FormData object to send the file and the question to the backend
    const formData = new FormData();
    formData.append("paper", paper);
    formData.append("question", question);


    try {
      const response = await fetch('http://localhost:3000/api/ask', {
        method: "POST",
        body: formData,
      });


      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error("Error calling the API", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Research Paper Buddy</h1>
      </header>
      <div className="input-section">
        <div className="file-input">
          <label htmlFor="file-upload" className="custom-file-upload">
            {paper ? 'PDF Uploaded' : 'Choose PDF'}
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
          />
        </div>
        <div className="question-input">
          <textarea
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What do you want to know about the paper?"
            cols={100}
            rows={3}
          />
        </div>
        <div className="submit-button">
          <button onClick={callOpenAIAPI}>Get an answer!</button>
        </div>
      </div>
      {answer && (
        <div className="answer-section">
          <h3>Here's an answer:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default App
