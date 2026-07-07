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
    <div className="page-container flex items-center justify-center p-4 min-h-screen">
      <div className="glass-panel w-full max-w-md p-8 animate-slide-up hover-lift">
        <h1 className="text-3xl font-extrabold text-[var(--text-h)] mb-6 mt-0 leading-tight">
          Login
        </h1>
        
        {error && <p className="text-red-500 text-sm font-semibold mb-4 text-center">{error}</p>}
        {success && <p className="text-emerald-500 text-sm font-semibold mb-4 text-center">Login Successful! Redirecting...</p>}

        <form onSubmit={(e) => { e.preventDefault(); loginUser(); }} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--code-bg)] text-[var(--text-h)] text-sm placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 min-h-[44px]"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--code-bg)] text-[var(--text-h)] text-sm placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 min-h-[44px]"
          />

          <button
            type="submit"
            className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold shadow-lg hover:shadow-violet-500/20 active:scale-[0.98] transition-all duration-200 min-h-[44px] flex items-center justify-center cursor-pointer"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--text)] text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-[var(--accent)] hover:underline font-bold transition-all duration-200">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;