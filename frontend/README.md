# 🧍‍♂️ Rule-Based Bad Posture Detection App

A full-stack web application that detects bad posture using video input (upload or webcam). Built as part of a technical assessment for Realfy.

---

 Features

 Upload video to detect posture
 Rule-based logic for bad posture using MediaPipe
 Summary JSON result (Good/Bad posture, frame count)
 Built with **React (frontend)** and **Flask (backend)**
 Pose detection using **MediaPipe** and **OpenCV**

---

 Demo

 Click here to view the demo video(#) <!-- Replace with your actual Google Drive/YouTube link -->

---

 Live Deployment

Frontend: https://your-frontend.vercel.app  
Backend: https://your-backend.onrender.com

_(Replace with actual links if deployed)_



Tech Stack

| Layer      | Tech Used                        |
|------------|----------------------------------|
| Frontend   | React.js, HTML/CSS, JS           |
| Backend    | Flask, Flask-CORS                |
| CV Engine  | MediaPipe, OpenCV, NumPy         |
| Deployment | Vercel (Frontend), Render (API)  |



 Rule-Based Posture Detection Logic

   Squat**:
   Bad: Knee over toe
   Bad: Back angle < 150°
   Desk Sitting**:
   Bad: Neck bent > 30°
   Bad: Back not upright

Returns a result like:
```json
{
  "posture": "Good",
  "bad_frames": 10,
  "total_frames": 140
}
