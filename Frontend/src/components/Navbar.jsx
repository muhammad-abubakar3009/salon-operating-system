import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <span className="navbar-brand">Salon OS</span>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/clients">Clients</Link>
      <Link to="/appointments">Appointments</Link>
      <Link to="/inventory">Inventory</Link>
      {currentUser?.role === "owner" && <Link to="/staff">Staff</Link>}
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}

export default Navbar;