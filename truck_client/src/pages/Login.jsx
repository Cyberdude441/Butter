import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:7000"}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        return alert(data.message);
      }

      // Save token & user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login successful!");
      navigate("/forecast_query");
    } catch {
      alert("Server connection failed");
    }
  };

  return (
    <div
      style={{ backgroundColor: "#070d18", minHeight: "100vh" }}
      className="text-white d-flex flex-column"
    >
      <Navbar />

      <main className="d-flex align-items-center justify-content-center flex-grow-1 py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-5">
              <div
                className="card border-0 shadow-lg rounded-4 p-2"
                style={{
                  backgroundColor: "#0b1320",
                  border: "1px solid #162234",
                }}
              >
                <div className="card-body p-4 p-lg-5 text-white">
                  <div className="text-center mb-4">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fs-3"
                      style={{
                        width: "56px",
                        height: "56px",
                        backgroundColor: "#1e88e5",
                      }}
                    >
                      🚢
                    </div>
                    <small
                      className="text-uppercase fw-bold tracking-wider d-block mb-1"
                      style={{ color: "#38bdf8", fontSize: "0.75rem" }}
                    >
                      AUTHENTICATION
                    </small>
                    <h2 className="fw-bold text-white mb-2">Welcome Back</h2>
                    <p className="small mb-0" style={{ color: "#8492a6" }}>
                      Sign in to the Intelligent Freight Forecasting Dashboard
                    </p>
                  </div>

                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label
                        className="form-label small fw-semibold"
                        style={{ color: "#8492a6" }}
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="form-control py-2 text-white shadow-none"
                        placeholder="procurement@company.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                        style={{
                          backgroundColor: "#070d18",
                          borderColor: "#1b2a3f",
                        }}
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        className="form-label small fw-semibold"
                        style={{ color: "#8492a6" }}
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        className="form-control py-2 text-white shadow-none"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        style={{
                          backgroundColor: "#070d18",
                          borderColor: "#1b2a3f",
                        }}
                      />
                    </div>

                    <div className="d-grid">
                      <button
                        className="btn btn-lg fw-bold py-3 text-white rounded-3"
                        style={{ backgroundColor: "#1e88e5" }}
                      >
                        Access Dashboard →
                      </button>
                    </div>
                  </form>

                  <hr style={{ borderColor: "#162234" }} className="my-4" />

                  <p className="text-center small mb-0" style={{ color: "#8492a6" }}>
                    New to the platform?{" "}
                    <Link
                      to="/register"
                      className="fw-semibold text-decoration-none"
                      style={{ color: "#38bdf8" }}
                    >
                      Create an account
                    </Link>
                  </p>
                </div>
              </div>

              <p className="text-center mt-4 small mb-0" style={{ color: "#64748b" }}>
                © 2026 Intelligent Freight Forecasting System
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;