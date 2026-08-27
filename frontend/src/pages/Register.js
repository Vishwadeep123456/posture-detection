import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(
        "https://posture-detection-16.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      console.log("Register Success:", data);

      navigate("/login");
    } catch (err) {
      console.error("Register Error:", err);
      setError(err.message || "Something went wrong");
    }
  };

  const styles = {
    wrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #6a11cb, #2575fc)",
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
    },

    button: {
      background: "#2575fc",
      color: "#fff",
      padding: "0.8rem",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
    },

    error: {
      color: "red",
      marginTop: "1rem",
    },

    loginLink: {
      marginTop: "1rem",
      fontSize: "0.9rem",
    },

    loginSpan: {
      color: "#2575fc",
      cursor: "pointer",
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>

        <p style={styles.subtitle}>
          Join us and start your journey 🚀
        </p>

        <form style={styles.form} onSubmit={handleSubmit}>
          <label style={styles.label}>Name</label>

          <input
            style={styles.input}
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            placeholder="Choose a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" style={styles.button}>
            Register
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        <p style={styles.loginLink}>
          Already have an account?{" "}

          <span
            style={styles.loginSpan}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;