import React, { useEffect, useRef, useState } from "react";

function VideoUpload() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  // ==========================================
  // FLASK BACKEND
  // ==========================================

  const API_URL = "http://localhost:5000";

  // ==========================================
  // CLEANUP VIDEO PREVIEW
  // ==========================================

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // ==========================================
  // FILE SELECT
  // ==========================================

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setError("");
    setResult(null);

    if (!selectedFile) {
      setFile(null);
      setPreviewUrl("");
      return;
    }

    // Check video
    if (!selectedFile.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      setFile(null);
      setPreviewUrl("");
      return;
    }

    // Optional size check: 100 MB
    const maxSize = 100 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setError("Video size must be less than 100 MB.");
      setFile(null);
      setPreviewUrl("");
      return;
    }

    // Create preview
    const newPreviewUrl = URL.createObjectURL(selectedFile);

    setFile(selectedFile);
    setPreviewUrl(newPreviewUrl);
  };

  // ==========================================
  // UPLOAD + ANALYZE
  // ==========================================

  const handleUpload = async () => {
    setError("");
    setResult(null);

    if (!file) {
      setError("Please select a video file first.");
      return;
    }

    const formData = new FormData();

    // IMPORTANT
    // Flask uses:
    // request.files.get("video")

    formData.append("video", file);

    try {
      setLoading(true);

      console.log("Uploading video:", file.name);

      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      let data;

      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error(
          "Backend returned an invalid response."
        );
      }

      console.log("Backend response:", data);

      // Flask returned error
      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Video analysis failed."
        );
      }

      // Save complete result
      setResult(data);

    } catch (err) {
      console.error("Video Upload Error:", err);

      if (err instanceof TypeError) {
        setError(
          "Unable to connect to Flask server. Make sure your backend is running on http://localhost:5000"
        );
      } else {
        setError(
          err.message ||
            "Something went wrong while analyzing the video."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RESET
  // ==========================================

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(null);
    setPreviewUrl("");
    setResult(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==========================================
  // POSTURE STATUS
  // ==========================================

  const isGood =
    result?.posture?.toLowerCase() ===
    "good posture";

  // ==========================================
  // FORMAT FILE SIZE
  // ==========================================

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 MB";

    const mb = bytes / (1024 * 1024);

    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="posture-page">

      {/* ======================================
          BACKGROUND EFFECTS
      ====================================== */}

      <div className="background-circle circle-one"></div>
      <div className="background-circle circle-two"></div>

      <div className="main-container">

        {/* ======================================
            HEADER
        ====================================== */}

        <header className="page-header">

          <div className="header-icon">
            🧍
          </div>

          <h1>
            AI Posture Analyzer
          </h1>

          <p>
            Upload your posture video and let
            AI analyze your body position.
          </p>

        </header>

        {/* ======================================
            MAIN CARD
        ====================================== */}

        <div className="main-card">

          {/* ====================================
              UPLOAD SECTION
          ==================================== */}

          {!file && !result && (
            <div
              className="upload-area"
              onClick={() =>
                fileInputRef.current?.click()
              }
            >

              <div className="upload-icon">
                🎥
              </div>

              <h2>
                Upload Posture Video
              </h2>

              <p>
                Click here or choose a video
                from your computer
              </p>

              <div className="supported-formats">
                MP4 &nbsp;•&nbsp; MOV &nbsp;•&nbsp;
                AVI &nbsp;•&nbsp; WEBM
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                hidden
              />

            </div>
          )}

          {/* ====================================
              SELECTED FILE
          ==================================== */}

          {file && !result && (
            <div className="selected-section">

              <div className="file-header">

                <div className="file-left">

                  <div className="file-icon">
                    🎬
                  </div>

                  <div className="file-details">

                    <h3>
                      {file.name}
                    </h3>

                    <p>
                      {formatFileSize(file.size)}
                    </p>

                  </div>

                </div>

                <button
                  className="remove-button"
                  onClick={handleReset}
                  type="button"
                >
                  ✕
                </button>

              </div>

              {/* VIDEO PREVIEW */}

              {previewUrl && (
                <div className="video-preview">

                  <video
                    src={previewUrl}
                    controls
                    preload="metadata"
                  />

                </div>
              )}

              {/* ANALYZE BUTTON */}

              <button
                className="analyze-button"
                onClick={handleUpload}
                disabled={loading}
                type="button"
              >

                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing Video...
                  </>
                ) : (
                  <>
                    🔍 Upload & Analyze
                  </>
                )}

              </button>

              {loading && (
                <div className="loading-box">

                  <div className="loading-bar">
                    <div className="loading-progress"></div>
                  </div>

                  <p>
                    MediaPipe is analyzing your
                    posture frame by frame...
                  </p>

                </div>
              )}

            </div>
          )}

          {/* ====================================
              ERROR
          ==================================== */}

          {error && (
            <div className="error-box">

              <div className="error-icon">
                ⚠️
              </div>

              <div>
                <strong>
                  Analysis Failed
                </strong>

                <p>
                  {error}
                </p>
              </div>

            </div>
          )}

          {/* ====================================
              RESULT
          ==================================== */}

          {result && (
            <div className="result-section">

              {/* RESULT HEADER */}

              <div
                className={`result-status ${
                  isGood ? "good-status" : "bad-status"
                }`}
              >

                <div className="status-circle">

                  {isGood ? "✓" : "!"}

                </div>

                <div>

                  <span>
                    Overall Result
                  </span>

                  <h2>
                    {result.posture ||
                      "Unknown Posture"}
                  </h2>

                </div>

              </div>

              {/* ==================================
                  SCORE
              ================================== */}

              <div className="score-section">

                <div className="score-circle">

                  <div className="score-inner">

                    <strong>
                      {result.score ?? 0}
                    </strong>

                    <span>
                      /100
                    </span>

                  </div>

                </div>

                <div className="score-info">

                  <h3>
                    Posture Score
                  </h3>

                  <p>
                    {result.score >= 80
                      ? "Excellent posture! Keep it up."
                      : result.score >= 70
                      ? "Good posture. Keep maintaining it."
                      : result.score >= 50
                      ? "Your posture needs some improvement."
                      : "Your posture needs significant improvement."
                    }
                  </p>

                </div>

              </div>

              {/* ==================================
                  FRAME STATISTICS
              ================================== */}

              <div className="section-title">

                <span>📊</span>

                <h3>
                  Frame Analysis
                </h3>

              </div>

              <div className="stats-grid">

                <div className="stat-card">

                  <div className="stat-icon blue">
                    🎞️
                  </div>

                  <span>
                    Total Frames
                  </span>

                  <strong>
                    {result.total_frames ?? 0}
                  </strong>

                </div>

                <div className="stat-card">

                  <div className="stat-icon green">
                    ✓
                  </div>

                  <span>
                    Good Frames
                  </span>

                  <strong>
                    {result.good_frames ?? 0}
                  </strong>

                </div>

                <div className="stat-card">

                  <div className="stat-icon red">
                    !
                  </div>

                  <span>
                    Bad Frames
                  </span>

                  <strong>
                    {result.bad_frames ?? 0}
                  </strong>

                </div>

              </div>

              {/* ==================================
                  PERCENTAGES
              ================================== */}

              <div className="percentage-section">

                <div className="percentage-header">

                  <span>
                    Good Posture
                  </span>

                  <strong>
                    {result.good_percentage ?? 0}%
                  </strong>

                </div>

                <div className="progress-background">

                  <div
                    className="good-progress"
                    style={{
                      width: `${Math.min(
                        result.good_percentage ?? 0,
                        100
                      )}%`,
                    }}
                  ></div>

                </div>

                <div className="percentage-header bad-header">

                  <span>
                    Bad Posture
                  </span>

                  <strong>
                    {result.bad_percentage ?? 0}%
                  </strong>

                </div>

                <div className="progress-background">

                  <div
                    className="bad-progress"
                    style={{
                      width: `${Math.min(
                        result.bad_percentage ?? 0,
                        100
                      )}%`,
                    }}
                  ></div>

                </div>

              </div>

              {/* ==================================
                  PROBLEMS
              ================================== */}

              <div className="section-title">

                <span>⚠️</span>

                <h3>
                  Problems Detected
                </h3>

              </div>

              {Array.isArray(result.problems) &&
              result.problems.length > 0 ? (

                <div className="problems-list">

                  {result.problems.map(
                    (problem, index) => (

                      <div
                        className="problem-item"
                        key={index}
                      >

                        <div className="problem-number">
                          {index + 1}
                        </div>

                        <span>
                          {problem}
                        </span>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div className="no-problems">

                  <span>
                    ✓
                  </span>

                  <p>
                    No major posture problems
                    detected.
                  </p>

                </div>

              )}

              {/* ==================================
                  RECOMMENDATIONS
              ================================== */}

              <div className="section-title">

                <span>💡</span>

                <h3>
                  AI Recommendations
                </h3>

              </div>

              {Array.isArray(
                result.recommendations
              ) &&
              result.recommendations.length > 0 ? (

                <div className="recommendation-list">

                  {result.recommendations.map(
                    (recommendation, index) => (

                      <div
                        className="recommendation-item"
                        key={index}
                      >

                        <div className="check-icon">
                          ✓
                        </div>

                        <p>
                          {recommendation}
                        </p>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div className="recommendation-item">

                  <div className="check-icon">
                    ✓
                  </div>

                  <p>
                    Maintain a comfortable
                    upright posture.
                  </p>

                </div>

              )}

              {/* ==================================
                  ANALYZE AGAIN
              ================================== */}

              <button
                className="again-button"
                onClick={handleReset}
                type="button"
              >
                🔄 Analyze Another Video
              </button>

            </div>
          )}

        </div>

        {/* ======================================
            FEATURES
        ====================================== */}

        <div className="features">

          <div className="feature">
            <span>🧠</span>
            <p>MediaPipe AI</p>
          </div>

          <div className="feature">
            <span>📐</span>
            <p>Pose Detection</p>
          </div>

          <div className="feature">
            <span>🎞️</span>
            <p>Frame Analysis</p>
          </div>

          <div className="feature">
            <span>⚡</span>
            <p>Fast Results</p>
          </div>

        </div>

      </div>

      {/* ========================================
          CSS
      ======================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;
        }

        .posture-page {
          min-height: 100vh;
          padding: 45px 20px;
          position: relative;
          overflow: hidden;

          background:
            linear-gradient(
              135deg,
              #0f172a 0%,
              #172554 50%,
              #111827 100%
            );
        }

        /* BACKGROUND */

        .background-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: .25;
          pointer-events: none;
        }

        .circle-one {
          width: 400px;
          height: 400px;
          background: #4f46e5;
          top: -180px;
          left: -150px;
        }

        .circle-two {
          width: 400px;
          height: 400px;
          background: #06b6d4;
          bottom: -200px;
          right: -150px;
        }

        .main-container {
          max-width: 760px;
          margin: auto;
          position: relative;
          z-index: 2;
        }

        /* HEADER */

        .page-header {
          text-align: center;
          color: white;
          margin-bottom: 30px;
        }

        .header-icon {
          width: 75px;
          height: 75px;
          margin: auto;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 22px;

          font-size: 38px;

          background:
            linear-gradient(
              135deg,
              #6366f1,
              #06b6d4
            );

          box-shadow:
            0 20px 45px
            rgba(99,102,241,.35);
        }

        .page-header h1 {
          margin: 18px 0 8px;

          font-size: 32px;
          font-weight: 800;
        }

        .page-header p {
          margin: 0;

          color: #cbd5e1;

          font-size: 15px;
        }

        /* MAIN CARD */

        .main-card {
          padding: 30px;

          background:
            rgba(255,255,255,.97);

          border-radius: 25px;

          box-shadow:
            0 30px 80px
            rgba(0,0,0,.35);
        }

        /* UPLOAD */

        .upload-area {
          padding: 65px 25px;

          text-align: center;

          border: 2px dashed #6366f1;

          border-radius: 20px;

          background: #f8faff;

          cursor: pointer;

          transition: all .25s ease;
        }

        .upload-area:hover {
          background: #eef2ff;
          transform: translateY(-2px);

          border-color: #4f46e5;
        }

        .upload-icon {
          width: 75px;
          height: 75px;

          margin: 0 auto 20px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 20px;

          background: #e0e7ff;

          font-size: 38px;
        }

        .upload-area h2 {
          margin: 0 0 10px;

          color: #1e293b;

          font-size: 23px;
        }

        .upload-area p {
          margin: 0 0 15px;

          color: #64748b;

          font-size: 14px;
        }

        .supported-formats {
          color: #94a3b8;

          font-size: 12px;

          font-weight: 600;
        }

        /* FILE */

        .file-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 16px;

          background: #f8fafc;

          border: 1px solid #e2e8f0;

          border-radius: 15px;
        }

        .file-left {
          display: flex;
          align-items: center;
          gap: 13px;

          min-width: 0;
        }

        .file-icon {
          width: 48px;
          height: 48px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          background: #e0e7ff;

          font-size: 23px;
        }

        .file-details {
          min-width: 0;
        }

        .file-details h3 {
          margin: 0;

          color: #1e293b;

          font-size: 14px;

          word-break: break-word;
        }

        .file-details p {
          margin: 4px 0 0;

          color: #64748b;

          font-size: 12px;
        }

        .remove-button {
          width: 36px;
          height: 36px;

          flex-shrink: 0;

          border: none;

          border-radius: 10px;

          background: #fee2e2;

          color: #dc2626;

          cursor: pointer;

          font-size: 15px;

          transition: .2s;
        }

        .remove-button:hover {
          background: #fecaca;
          transform: scale(1.05);
        }

        /* VIDEO */

        .video-preview {
          margin-top: 18px;

          overflow: hidden;

          border-radius: 16px;

          background: #020617;

          box-shadow:
            0 10px 30px
            rgba(0,0,0,.15);
        }

        .video-preview video {
          width: 100%;

          display: block;

          max-height: 400px;

          background: #000;
        }

        /* ANALYZE */

        .analyze-button {
          width: 100%;

          margin-top: 20px;

          padding: 16px;

          border: none;

          border-radius: 14px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #6366f1,
              #2563eb
            );

          font-size: 16px;

          font-weight: 700;

          cursor: pointer;

          transition: all .25s ease;
        }

        .analyze-button:hover:not(:disabled) {
          transform: translateY(-2px);

          box-shadow:
            0 12px 30px
            rgba(37,99,235,.3);
        }

        .analyze-button:disabled {
          opacity: .7;

          cursor: not-allowed;
        }

        .spinner {
          display: inline-block;

          width: 18px;
          height: 18px;

          margin-right: 10px;

          vertical-align: -3px;

          border: 3px solid
            rgba(255,255,255,.4);

          border-top-color: white;

          border-radius: 50%;

          animation:
            spin .8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* LOADING */

        .loading-box {
          margin-top: 15px;

          padding: 15px;

          text-align: center;

          background: #eff6ff;

          border-radius: 12px;
        }

        .loading-box p {
          margin: 10px 0 0;

          color: #475569;

          font-size: 13px;
        }

        .loading-bar {
          width: 100%;
          height: 6px;

          overflow: hidden;

          border-radius: 10px;

          background: #dbeafe;
        }

        .loading-progress {
          width: 40%;
          height: 100%;

          border-radius: 10px;

          background:
            linear-gradient(
              90deg,
              #6366f1,
              #06b6d4
            );

          animation:
            loading 1.4s infinite ease-in-out;
        }

        @keyframes loading {

          0% {
            transform: translateX(-120%);
          }

          50% {
            transform: translateX(100%);
          }

          100% {
            transform: translateX(280%);
          }

        }

        /* ERROR */

        .error-box {
          display: flex;

          gap: 13px;

          margin-top: 20px;

          padding: 16px;

          border-radius: 14px;

          border: 1px solid #fecdd3;

          background: #fff1f2;

          color: #be123c;
        }

        .error-icon {
          font-size: 22px;
        }

        .error-box strong {
          font-size: 14px;
        }

        .error-box p {
          margin: 5px 0 0;

          font-size: 13px;

          line-height: 1.5;
        }

        /* RESULT */

        .result-section {
          margin-top: 5px;
        }

        .result-status {
          display: flex;
          align-items: center;

          gap: 15px;

          padding: 20px;

          border-radius: 18px;
        }

        .good-status {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
        }

        .bad-status {
          background: #fff1f2;
          border: 1px solid #fecdd3;
        }

        .status-circle {
          width: 58px;
          height: 58px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          color: white;

          font-size: 28px;

          font-weight: 800;
        }

        .good-status .status-circle {
          background: #10b981;
        }

        .bad-status .status-circle {
          background: #ef4444;
        }

        .result-status span {
          display: block;

          color: #64748b;

          font-size: 12px;
        }

        .result-status h2 {
          margin: 4px 0 0;

          font-size: 24px;
        }

        .good-status h2 {
          color: #047857;
        }

        .bad-status h2 {
          color: #dc2626;
        }

        /* SCORE */

        .score-section {
          display: flex;
          align-items: center;

          gap: 25px;

          margin-top: 20px;

          padding: 22px;

          border-radius: 18px;

          background: #f8fafc;

          border: 1px solid #e2e8f0;
        }

        .score-circle {
          width: 105px;
          height: 105px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            conic-gradient(
              #6366f1
              calc(var(--score, 62) * 1%),
              #e2e8f0 0
            );

          position: relative;
        }

        .score-circle::before {
          content: "";

          position: absolute;

          width: 82px;
          height: 82px;

          border-radius: 50%;

          background: white;
        }

        .score-inner {
          position: relative;

          z-index: 2;

          text-align: center;
        }

        .score-inner strong {
          display: block;

          color: #1e293b;

          font-size: 26px;
        }

        .score-inner span {
          color: #64748b;

          font-size: 10px;
        }

        .score-info h3 {
          margin: 0;

          color: #1e293b;

          font-size: 18px;
        }

        .score-info p {
          margin: 7px 0 0;

          color: #64748b;

          font-size: 13px;

          line-height: 1.5;
        }

        /* SECTION TITLE */

        .section-title {
          display: flex;

          align-items: center;

          gap: 9px;

          margin-top: 28px;

          margin-bottom: 14px;
        }

        .section-title span {
          font-size: 20px;
        }

        .section-title h3 {
          margin: 0;

          color: #1e293b;

          font-size: 17px;
        }

        /* STATS */

        .stats-grid {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 12px;
        }

        .stat-card {
          padding: 18px 12px;

          text-align: center;

          border-radius: 15px;

          background: #f8fafc;

          border: 1px solid #e2e8f0;
        }

        .stat-icon {
          width: 42px;
          height: 42px;

          margin: 0 auto 10px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          font-weight: 800;

          font-size: 20px;
        }

        .stat-icon.blue {
          background: #dbeafe;
          color: #2563eb;
        }

        .stat-icon.green {
          background: #dcfce7;
          color: #16a34a;
        }

        .stat-icon.red {
          background: #fee2e2;
          color: #dc2626;
        }

        .stat-card span {
          display: block;

          color: #64748b;

          font-size: 11px;
        }

        .stat-card strong {
          display: block;

          margin-top: 5px;

          color: #1e293b;

          font-size: 23px;
        }

        /* PERCENTAGE */

        .percentage-section {
          margin-top: 22px;

          padding: 18px;

          border-radius: 16px;

          background: #f8fafc;
        }

        .percentage-header {
          display: flex;

          justify-content: space-between;

          align-items: center;

          margin-bottom: 7px;
        }

        .percentage-header span {
          color: #475569;

          font-size: 13px;
        }

        .percentage-header strong {
          color: #16a34a;

          font-size: 13px;
        }

        .bad-header {
          margin-top: 15px;
        }

        .bad-header strong {
          color: #dc2626;
        }

        .progress-background {
          width: 100%;

          height: 9px;

          overflow: hidden;

          border-radius: 20px;

          background: #e2e8f0;
        }

        .good-progress {
          height: 100%;

          border-radius: 20px;

          background:
            linear-gradient(
              90deg,
              #10b981,
              #34d399
            );

          transition: width 1s ease;
        }

        .bad-progress {
          height: 100%;

          border-radius: 20px;

          background:
            linear-gradient(
              90deg,
              #ef4444,
              #fb7185
            );

          transition: width 1s ease;
        }

        /* PROBLEMS */

        .problems-list {
          display: flex;

          flex-direction: column;

          gap: 10px;
        }

        .problem-item {
          display: flex;

          align-items: center;

          gap: 12px;

          padding: 13px;

          border-radius: 12px;

          background: #fff1f2;

          border: 1px solid #fecdd3;

          color: #9f1239;

          font-size: 13px;
        }

        .problem-number {
          width: 28px;
          height: 28px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #fee2e2;

          color: #dc2626;

          font-size: 12px;

          font-weight: 700;
        }

        .no-problems {
          display: flex;

          align-items: center;

          gap: 10px;

          padding: 15px;

          border-radius: 12px;

          background: #ecfdf5;

          color: #047857;
        }

        .no-problems span {
          font-size: 20px;
        }

        .no-problems p {
          margin: 0;

          font-size: 13px;
        }

        /* RECOMMENDATION */

        .recommendation-list {
          display: flex;

          flex-direction: column;

          gap: 10px;
        }

        .recommendation-item {
          display: flex;

          align-items: flex-start;

          gap: 12px;

          padding: 15px;

          border-radius: 13px;

          background: #eff6ff;

          border: 1px solid #bfdbfe;
        }

        .check-icon {
          width: 28px;
          height: 28px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #dbeafe;

          color: #2563eb;

          font-weight: 800;
        }

        .recommendation-item p {
          margin: 4px 0 0;

          color: #334155;

          font-size: 13px;

          line-height: 1.5;
        }

        /* AGAIN BUTTON */

        .again-button {
          width: 100%;

          margin-top: 25px;

          padding: 15px;

          border: none;

          border-radius: 13px;

          background: #1e293b;

          color: white;

          font-size: 15px;

          font-weight: 700;

          cursor: pointer;

          transition: .25s;
        }

        .again-button:hover {
          background: #334155;

          transform: translateY(-1px);
        }

        /* FEATURES */

        .features {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 10px;

          margin-top: 20px;
        }

        .feature {
          padding: 12px 5px;

          text-align: center;

          color: #cbd5e1;
        }

        .feature span {
          display: block;

          font-size: 22px;

          margin-bottom: 5px;
        }

        .feature p {
          margin: 0;

          font-size: 10px;
        }

        /* MOBILE */

        @media (max-width: 650px) {

          .posture-page {
            padding: 25px 12px;
          }

          .main-card {
            padding: 20px;
          }

          .page-header h1 {
            font-size: 26px;
          }

          .upload-area {
            padding: 45px 15px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .score-section {
            flex-direction: column;

            text-align: center;
          }

          .features {
            grid-template-columns:
              repeat(2, 1fr);
          }

        }

        @media (max-width: 400px) {

          .main-card {
            padding: 15px;
          }

          .result-status {
            padding: 15px;
          }

          .result-status h2 {
            font-size: 20px;
          }

        }

      `}</style>

    </div>
  );
}

export default VideoUpload;