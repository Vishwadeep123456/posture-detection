import React, { useState, useRef } from 'react';

function WebcamCapture() {
  const videoRef = useRef(null);
  const [result, setResult] = useState(null);

  const captureAndSend = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("frame", blob, "frame.jpg");

      const res = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    }, "image/jpeg");
  };

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    });
  };

  return (
    <div>
      <video ref={videoRef} width={640} height={480} autoPlay />
      <br />
      <button onClick={startCamera}>Start Webcam</button>
      <button onClick={captureAndSend}>Capture & Analyze</button>

      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}

export default WebcamCapture;
