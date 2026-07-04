import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const loginUser = async () => {
    setError("");
    setSuccess(false);
    try {
      const res = await api.post("/users/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      setSuccess(true);
      setTimeout(() => {
          navigate("/dashboard");
      }, 1000);
    } catch (err) {
      console.log("LOGIN ERROR:", err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="page-container">
      <h1>Login</h1>
      
      {error && <p style={{ color: "var(--danger)", marginBottom: "15px" }}>{error}</p>}
      {success && <p style={{ color: "var(--success)", marginBottom: "15px" }}>Login Successful! Redirecting...</p>}

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={loginUser}>
        Login
      </button>

      <p style={{ marginTop: "20px", fontSize: "15px" }}>
        Don't have an account?{" "}
        <Link to="/register" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: "600" }}>
          Register
        </Link>
      </p>
    </div>
  );
}

export default Login;