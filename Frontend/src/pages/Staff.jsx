import { useState, useEffect } from "react";
import apiClient from "../api/client";
import Navbar from "../components/Navbar";
import "./Staff.css";

function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("stylist");
  const [formError, setFormError] = useState("");

  async function fetchStaff() {
    try {
      const response = await apiClient.get("/users");
      setStaff(response.data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load staff");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStaff();
  }, []);

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setRole("stylist");
    setFormError("");
  }

  async function handleAddStaff(e) {
    e.preventDefault();
    setFormError("");

    if (!name || !email || !password) {
      setFormError("Name, email, and password are required");
      return;
    }

    try {
      await apiClient.post("/users", { name, email, password, role });
      resetForm();
      setShowForm(false);
      fetchStaff();
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data && error.response.data.error) {
        setFormError(error.response.data.error);
      } else {
        setFormError("Failed to add staff member");
      }
    }
  }

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1>Staff</h1>
          {!showForm && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Add staff
            </button>
          )}
        </div>

        {showForm && (
          <form className="add-client-form" onSubmit={handleAddStaff}>
            {formError && <p className="form-error">{formError}</p>}

            <div className="form-row">
              <div>
                <label>Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>Temporary password</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="stylist">Stylist</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" className="btn-primary">Add staff member</button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading && <p>Loading staff...</p>}
        {errorMessage && <p style={{ color: "var(--brick)" }}>{errorMessage}</p>}

        {!loading && !errorMessage && (
          <table className="clients-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>
                    <span className={`role-badge role-${member.role}`}>
                      {member.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Staff;