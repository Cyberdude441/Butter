import { useNavigate, useLocation, Link, NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";

  const handleFeaturesClick = (event) => {
    event.preventDefault();
    if (location.pathname !== "/") {
      navigate("/#features");
      return;
    }
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  // Safe JSON parsing to prevent crashes
  const getUserData = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  const user = getUserData();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Helper to generate a 2-letter avatar from the user's name
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="navbar navbar-expand-lg border-bottom py-2 shadow-sm">
      <div className="container-fluid px-4 px-lg-5">
        <Link to="/" className="navbar-brand d-flex align-items-center me-4">
          <span className="brand-mark" aria-hidden="true">B</span>
          <span className="brand-copy">
            <strong>Butter Freight</strong>
            <small>Intelligent chartering</small>
          </span>
        </Link>

        {/* Mobile Toggle Button */}
          <button
            className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible Wrapper */}
        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Centered Navigation Links */}
          <ul className="navbar-nav mx-auto mb-3 mb-lg-0 gap-lg-3 align-items-lg-center">
            <li className="nav-item">
              <NavLink to="/" className="nav-link text-white-50">
                Home
              </NavLink>
            </li>

            <li className="nav-item">
              <a className="nav-link text-white-50" href="#features" onClick={handleFeaturesClick}>
                Features
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link text-white-50" href="#workflow">
                Solutions
              </a>
            </li>

            <li className="nav-item">
              <NavLink to="/about" className="nav-link text-white-50">
                About
              </NavLink>
            </li>

            <li className="nav-item">
              <a className="nav-link text-white-50" href="mailto:hello@butterfreight.com">
                Contact
              </a>
            </li>
          </ul>

          {/* Right Action Area (Dropdown / Login) */}
          <div className="navbar-actions-wrapper d-flex flex-column flex-lg-row align-items-lg-center pt-3 pt-lg-0">
            {isLoggedIn ? (
              <div className="nav-item dropdown">
                {/* Dropdown Trigger */}
                <button
                  className="btn btn-link text-decoration-none dropdown-toggle d-flex align-items-center gap-2 p-0 shadow-none user-trigger"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {/* Avatar Circle */}
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                    style={{
                      width: "38px",
                      height: "38px",
                      backgroundColor: "#285943",
                    }}
                  >
                    {getInitials(user?.fullName)}
                  </div>
                </button>

                {/* Dropdown Menu (Dark theme) */}
                <ul
                  className="dropdown-menu dropdown-menu-end shadow mt-3 border-1 user-menu"
                  style={{ backgroundColor: "#162234", borderColor: "#1e2d42", minWidth: "220px" }}
                >
                  {/* Organization Info Header */}
                  <li className="px-3 py-2">
                    <span className="d-block fw-semibold user-menu-name" style={{ fontSize: "14px" }}>
                      {user?.fullName || "User Account"}
                    </span>
                    <span className="d-block mt-1 d-flex align-items-center gap-2 user-menu-org" style={{ fontSize: "12px" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M14.763.075A.5.5 0 0 1 15 .5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V14h-1v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V10a.5.5 0 0 1 .342-.474L6 7.64V4.5a.5.5 0 0 1 .276-.447l8-4a.5.5 0 0 1 .487.022M6 8.694 1 10.36V15h5zM7 15h2v-1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V15h2V1.309l-7 3.5z"/>
                        <path d="M2 11h1v1H2zm2 0h1v1H4zm-2 2h1v1H2zm2 0h1v1H4zm4-4h1v1H8zm2 0h1v1h-1zm-2 2h1v1H8zm2 0h1v1h-1zm2-2h1v1h-1zm0 2h1v1h-1zM8 7h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zM8 5h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1z"/>
                      </svg>
                      {user?.organization || "No Organization"}
                    </span>
                  </li>
                  
                  <li><hr className="dropdown-divider border-secondary" /></li>
                  
                  {/* Logout Button */}
                  <li>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item text-danger d-flex align-items-center gap-2 py-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                        <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                      </svg>
                      Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              !isLoginPage && (
                <div className="navbar-action-buttons d-flex gap-2">
                  <Link
                    to="/login"
                    className="btn btn-sm px-4 py-2 fw-semibold rounded-3 text-decoration-none shadow-sm login-button"
                  >
                    Login
                  </Link>
                  <Link
                    to="/forecast_query"
                    className="btn btn-sm px-4 py-2 fw-semibold rounded-3 text-decoration-none shadow-sm get-started-button"
                  >
                    Get Started <span aria-hidden="true">→</span>
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;