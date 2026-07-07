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
    <div className="page-container flex items-center justify-center p-4 min-h-screen">
      <div className="glass-panel w-full max-w-md p-6 sm:p-8 animate-slide-up hover-lift">
        <h1 className="text-3xl font-extrabold text-[var(--text-h)] mb-6 mt-0 leading-tight">
          Register
        </h1>

        {error && <p className="text-red-500 text-sm font-semibold mb-4 text-center">{error}</p>}
        {success && <p className="text-emerald-500 text-sm font-semibold mb-4 text-center">{success}</p>}

        <form onSubmit={(e) => { e.preventDefault(); registerUser(); }} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--code-bg)] text-[var(--text-h)] text-base placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 min-h-[48px]"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--code-bg)] text-[var(--text-h)] text-base placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 min-h-[48px]"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--code-bg)] text-[var(--text-h)] text-base placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 min-h-[48px]"
          />

          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-base font-bold shadow-lg hover:shadow-violet-500/20 active:scale-[0.98] transition-all duration-200 min-h-[48px] flex items-center justify-center cursor-pointer"
          >
            Register
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--text)] text-center">
          Already have an account?{" "}
          <Link to="/" className="text-[var(--accent)] hover:underline font-bold transition-all duration-200">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;