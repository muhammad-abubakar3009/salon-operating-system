import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";
import Navbar from "../components/Navbar";
import "./Clients.css";

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingClientId, setEditingClientId] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [allergyFlag, setAllergyFlag] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteError, setDeleteError] = useState("");

  async function fetchClients() {
    try {
      const response = await apiClient.get("/clients");
      setClients(response.data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClients();
  }, []);

  function resetForm() {
    setName("");
    setPhone("");
    setNotes("");
    setAllergyFlag(false);
    setEditingClientId(null);
    setFormError("");
  }

  function handleStartAdd() {
    resetForm();
    setShowForm(true);
  }

  function handleStartEdit(client) {
    setEditingClientId(client.id);
    setName(client.name);
    setPhone(client.phone || "");
    setNotes(client.notes || "");
    setAllergyFlag(client.allergy_flag);
    setFormError("");
    setShowForm(true);
  }

  function handleCancelForm() {
    resetForm();
    setShowForm(false);
  }

  async function handleSubmitForm(e) {
    e.preventDefault();
    setFormError("");

    if (!name) {
      setFormError("Name is required");
      return;
    }

    const payload = {
      name,
      phone: phone || undefined,
      notes: notes || undefined,
      allergy_flag: allergyFlag,
    };

    try {
      if (editingClientId) {
        await apiClient.patch(`/clients/${editingClientId}`, payload);
      } else {
        await apiClient.post("/clients", payload);
      }

      resetForm();
      setShowForm(false);
      fetchClients();
    } catch (error) {
      console.error(error);
      setFormError(editingClientId ? "Failed to update client" : "Failed to add client");
    }
  }

  async function handleDeleteClient(clientId) {
    setDeleteError("");

    const confirmed = window.confirm("Delete this client? This cannot be undone.");
    if (!confirmed) return;

    try {
      await apiClient.delete(`/clients/${clientId}`);
      fetchClients();
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 409) {
        setDeleteError(error.response.data.error);
      } else {
        setDeleteError("Failed to delete client");
      }
    }
  }

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <Link to="/dashboard" className="back-link">&larr; Back to dashboard</Link>

        <div className="page-header">
          <h1>Clients</h1>
          {!showForm && (
            <button className="btn-primary" onClick={handleStartAdd}>
              New client
            </button>
          )}
        </div>

        {deleteError && <p className="form-error">{deleteError}</p>}

        {showForm && (
          <form className="add-client-form" onSubmit={handleSubmitForm}>
            <h3 style={{ marginBottom: "12px" }}>
              {editingClientId ? "Edit client" : "New client"}
            </h3>

            {formError && <p className="form-error">{formError}</p>}

            <div className="form-row">
              <div>
                <label>Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label>Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <label>Notes</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} />

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={allergyFlag}
                onChange={(e) => setAllergyFlag(e.target.checked)}
              />
              Has allergy/sensitivity
            </label>

            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" className="btn-primary">
                {editingClientId ? "Save changes" : "Save client"}
              </button>
              <button type="button" className="btn-outline" onClick={handleCancelForm}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading && <p>Loading clients...</p>}
        {errorMessage && <p style={{ color: "var(--brick)" }}>{errorMessage}</p>}

        {!loading && !errorMessage && (
          <table className="clients-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Notes</th>
                <th>Allergy</th>
                <th>Status</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td><Link to={`/clients/${client.id}`}>{client.name}</Link></td>
                  <td>{client.phone || "—"}</td>
                  <td>{client.notes || "—"}</td>
                  <td>
                    {client.allergy_flag && <span className="allergy-badge">Allergy</span>}
                  </td>
                  <td>
  {client.appointments && client.appointments.length > 0 ? (
    <span className={`status-badge status-${client.appointments[0].status}`}>
      {client.appointments[0].status}
    </span>
  ) : (
    <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>No appointments</span>
  )}
</td>
                  <td>
                    <button className="btn-link" onClick={() => handleStartEdit(client)}>
                      Edit
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteClient(client.id)}
                      aria-label={`Delete ${client.name}`}
                    >
                      &times;
                    </button>
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

export default Clients;