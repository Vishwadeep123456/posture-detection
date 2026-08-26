import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      console.log("Login Success:", data);
      setSuccess("Login successful ✅");
      // ✅ redirect to upload page after success
      setTimeout(() => navigate("/upload"), 1500);
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message);
    }
  };

  // ✅ Inline styles
  const styles = {
    wrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #ff416c, #ff4b2b)",
    },
    card: {
      background: "#fff",
      padding: "2rem 2.5rem",
      borderRadius: "12px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
      width: "350px",
      textAlign: "center",
    },
    title: {
      marginBottom: "0.5rem",
      color: "#333",
    },
    subtitle: {
      fontSize: "0.9rem",
      color: "#666",
      marginBottom: "1.5rem",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    },
    label: {
      textAlign: "left",
      fontWeight: "500",
      color: "#444",
    },
    input: {
      padding: "0.7rem",
      border: "1px solid #ccc",
      borderRadius: "8px",
      outline: "none",
      transition: "border 0.3s",
    },
    button: {
      background: "#ff4b2b",
      color: "#fff",
      padding: "0.8rem",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "background 0.3s",
    },
    error: {
      color: "red",
      marginTop: "1rem",
    },
    success: {
      color: "green",
      marginTop: "1rem",
      fontWeight: "bold",
    },
    registerLink: {
      marginTop: "1rem",
      fontSize: "0.9rem",
    },
    registerSpan: {
      color: "#ff4b2b",
      cursor: "pointer",
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Login to continue 🚀</p>

        <form style={styles.form} onSubmit={handleSubmit}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            style={styles.button}
            onMouseOver={(e) => (e.target.style.background = "#e63e20")}
            onMouseOut={(e) => (e.target.style.background = "#ff4b2b")}
          >
            Login
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <p style={styles.registerLink}>
          Don’t have an account?{" "}
          <span style={styles.registerSpan} onClick={() => navigate("/register")}>
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
