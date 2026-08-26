import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VideoUpload from "./pages/VideoUpload";
import WebcamCapture from "./pages/WebcamCapture";

import "./App.css";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =====================
            DEFAULT PAGE
        ===================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/register"
              replace
            />
          }
        />

        {/* =====================
            REGISTER
        ===================== */}

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =====================
            LOGIN
        ===================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* =====================
            VIDEO UPLOAD
        ===================== */}

        <Route
          path="/upload"
          element={<VideoUpload />}
        />

        {/* =====================
            WEBCAM
        ===================== */}

        <Route
          path="/webcam"
          element={<WebcamCapture />}
        />

        {/* =====================
            INVALID URL
        ===================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/register"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;