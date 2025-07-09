import React, { useState } from 'react';

function VideoUpload() {
  const [result, setResult] = useState(null);
  const [video, setVideo] = useState(null);

  const handleChange = (e) => {
    setVideo(e.target.files[0]);
    console.log("Selected video:", e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!video) return alert("Please select a video");

    const formData = new FormData();
    formData.append("video", video);
    console.log(" Uploading...");

    const res = await fetch("http://localhost:5000/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log(" Response from backend:", data);
    setResult(data);
  };

  return (
    <div style={{ padding: "20px" }}>
      <input type="file" accept="video/*" onChange={handleChange} />
      <button onClick={handleUpload} style={{ marginLeft: "10px" }}>Analyze</button>

      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}

export default VideoUpload;
