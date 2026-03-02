import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const inputCls =
  "w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all duration-200";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/auth/register", { name, email, password });
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c12] flex items-center justify-center px-4">

      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm">

        {/* Logo / Brand mark */}
        <div className="flex justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white text-base font-bold">A</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-7 shadow-2xl shadow-black/40">

          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-white tracking-tight">Create an account</h2>
            <p className="text-xs text-slate-500 mt-1">Get started — it's free</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">

            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="John Smith"
                className={inputCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-widest mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-widest mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={inputCls}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-1 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors duration-200 text-white disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Creating account..." : "Create Account →"}
            </button>

          </form>

          <div className="mt-5 pt-5 border-t border-white/[0.06] text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link to="/" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;