import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    organization: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:7000"}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          organization: form.organization,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return alert(data.message);
      }

      alert("Registration successful!");
      navigate("/login");
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
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
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
                      ⚓
                    </div>
                    <small
                      className="text-uppercase fw-bold tracking-wider d-block mb-1"
                      style={{ color: "#38bdf8", fontSize: "0.75rem" }}
                    >
                      GET STARTED
                    </small>
                    <h2 className="fw-bold text-white mb-2">
                      Create Your Account
                    </h2>
                    <p className="small mb-0" style={{ color: "#8492a6" }}>
                      Join the Intelligent Freight Forecasting Platform
                    </p>
                  </div>

                  <form onSubmit={handleRegister}>
                    <div className="mb-3">
                      <label
                        className="form-label small fw-semibold"
                        style={{ color: "#8492a6" }}
                      >
                        Full Name
                      </label>
                      <input
                        name="fullName"
                        className="form-control py-2 text-white shadow-none"
                        placeholder="John Doe"
                        value={form.fullName}
                        onChange={handleChange}
                        required
                        style={{
                          backgroundColor: "#070d18",
                          borderColor: "#1b2a3f",
                        }}
                      />
                    </div>

                    <div className="mb-3">
                      <label
                        className="form-label small fw-semibold"
                        style={{ color: "#8492a6" }}
                      >
                        Organization
                      </label>
                      <input
                        name="organization"
                        className="form-control py-2 text-white shadow-none"
                        placeholder="Company Name"
                        value={form.organization}
                        onChange={handleChange}
                        required
                        style={{
                          backgroundColor: "#070d18",
                          borderColor: "#1b2a3f",
                        }}
                      />
                    </div>

                    <div className="mb-3">
                      <label
                        className="form-label small fw-semibold"
                        style={{ color: "#8492a6" }}
                      >
                        Business Email
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

                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
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
                          placeholder="Create password"
                          value={form.password}
                          onChange={handleChange}
                          required
                          style={{
                            backgroundColor: "#070d18",
                            borderColor: "#1b2a3f",
                          }}
                        />
                      </div>

                      <div className="col-md-6">
                        <label
                          className="form-label small fw-semibold"
                          style={{ color: "#8492a6" }}
                        >
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          className="form-control py-2 text-white shadow-none"
                          placeholder="Confirm password"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          required
                          style={{
                            backgroundColor: "#070d18",
                            borderColor: "#1b2a3f",
                          }}
                        />
                      </div>
                    </div>

                    <div className="d-grid">
                      <button
                        className="btn btn-lg fw-bold py-3 text-white rounded-3"
                        style={{ backgroundColor: "#1e88e5" }}
                      >
                        Create Dashboard Account →
                      </button>
                    </div>
                  </form>

                  <hr style={{ borderColor: "#162234" }} className="my-4" />

                  <p
                    className="text-center small mb-0"
                    style={{ color: "#8492a6" }}
                  >
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="fw-semibold text-decoration-none"
                      style={{ color: "#38bdf8" }}
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </div>

              <p
                className="text-center mt-4 small mb-0"
                style={{ color: "#64748b" }}
              >
                © 2026 Intelligent Freight Forecasting System
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;