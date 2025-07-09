import React from 'react';
import './App.css';
import VideoUpload from './VideoUpload';
import WebcamCapture from './WebcamCapture';

function App() {
  return (
    <div className="app-container">
      <h1> Bad Posture Detection App</h1>

      <div className="section">
        <h2> Upload Video</h2>
        <VideoUpload />
      </div>

      <div className="section">
        <h2> Live Webcam Analysis</h2>
        <WebcamCapture />
      </div>
    </div>
  );
}

export default App;
