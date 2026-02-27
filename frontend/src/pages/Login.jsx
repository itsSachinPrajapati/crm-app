import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="bg-gray-900/70 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-96 border border-gray-700">
        
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Welcome Back
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="text-gray-400 text-sm">EMAIL</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full mt-1 p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm">PASSWORD</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full mt-1 p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
  type="button"
  onClick={async () => {
    await api.post("/auth/reset-admin");
    alert("Password reset to Admin@123");
  }}
  className="w-full mt-3 bg-gray-700 hover:bg-gray-600 p-2 rounded text-white text-sm"
>
  Reset Admin Password (Dev)
</button>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg text-white font-semibold"
          >
            Sign In →
          </button>

        </form>

        <p className="text-gray-400 text-sm text-center mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
        console.log("Email entered:", email);
console.log("DB result:", results);
      </div>
    </div>
  );
}

export default Login;