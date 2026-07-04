import { useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

function Register() {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const registerUser = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await api.post("/users/register", {
        username,
        email,
        password,
      });

      setSuccess(res.data.message || "Registration Successful!");
    } catch (err) {
      console.log("REGISTER ERROR:", err);
      setError(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="page-container">

      <h1>Register</h1>

      {error && <p style={{ color: "var(--danger)", marginBottom: "15px" }}>{error}</p>}
      {success && <p style={{ color: "var(--success)", marginBottom: "15px" }}>{success}</p>}

      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <br /><br />

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

      <button onClick={registerUser}>
        Register
      </button>

      <p style={{ marginTop: "20px", fontSize: "15px" }}>
        Already have an account?{" "}
        <Link to="/" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: "600" }}>
          Login
        </Link>
      </p>

    </div>
  );
}

export default Register;