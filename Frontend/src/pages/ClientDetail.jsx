import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../api/client";
import Navbar from "../components/Navbar";
import "./ClientDetail.css";

function ClientDetail() {
  const { id } = useParams();

  const [client, setClient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [showFormulaForm, setShowFormulaForm] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [formula, setFormula] = useState("");
  const [developer, setDeveloper] = useState("");
  const [processingTime, setProcessingTime] = useState("");
  const [stylistNotes, setStylistNotes] = useState("");
  const [formError, setFormError] = useState("");

  async function fetchClientData() {
    try {
      const [clientRes, appointmentsRes, formulasRes] = await Promise.all([
        apiClient.get(`/clients/${id}`),
        apiClient.get(`/appointments?client_id=${id}`),
        apiClient.get(`/formulas?client_id=${id}`),
      ]);

      setClient(clientRes.data);
      setAppointments(appointmentsRes.data);
      setFormulas(formulasRes.data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load client");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const appointmentIdsWithFormulas = formulas.map((f) => f.appointment.id);
  const eligibleAppointments = appointments.filter(
    (a) => a.status === "completed" && !appointmentIdsWithFormulas.includes(a.id)
  );

  function resetFormulaForm() {
    setSelectedAppointmentId("");
    setFormula("");
    setDeveloper("");
    setProcessingTime("");
    setStylistNotes("");
    setFormError("");
  }

  async function handleAddFormula(e) {
    e.preventDefault();
    setFormError("");

    if (!selectedAppointmentId || !formula) {
      setFormError("Appointment and formula are required");
      return;
    }

    try {
      await apiClient.post("/formulas", {
        appointment_id: Number(selectedAppointmentId),
        formula,
        developer: developer || undefined,
        processing_time: processingTime ? Number(processingTime) : undefined,
        stylist_notes: stylistNotes || undefined,
      });

      resetFormulaForm();
      setShowFormulaForm(false);
      fetchClientData();
    } catch (error) {
      console.error(error);
      setFormError("Failed to save formula");
    }
  }

  if (loading) return <p>Loading...</p>;
  if (errorMessage) return <p style={{ color: "var(--brick)" }}>{errorMessage}</p>;

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <Link to="/clients" className="back-link">&larr; Back to clients</Link>
        <div className="client-header">
          <h1>{client.name}</h1>
          {client.allergy_flag && <span className="allergy-badge">Allergy</span>}
        </div>
        <p className="client-meta">
          {client.phone || "No phone on file"} &middot; {client.notes || "No notes"}
        </p>

        <div className="section-header">
          <h3>Color history</h3>
          {!showFormulaForm && eligibleAppointments.length > 0 && (
            <button className="btn-primary" onClick={() => setShowFormulaForm(true)}>
              Log formula
            </button>
          )}
        </div>

        {showFormulaForm && (
          <form className="add-client-form" onSubmit={handleAddFormula}>
            {formError && <p className="form-error">{formError}</p>}

            <label>Appointment</label>
            <select
              value={selectedAppointmentId}
              onChange={(e) => setSelectedAppointmentId(e.target.value)}
            >
              <option value="">Select a completed appointment</option>
              {eligibleAppointments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.service} — {new Date(a.appointment_time).toLocaleDateString()}
                </option>
              ))}
            </select>

            <label>Formula</label>
            <input value={formula} onChange={(e) => setFormula(e.target.value)} />

            <div className="form-row">
              <div>
                <label>Developer</label>
                <input value={developer} onChange={(e) => setDeveloper(e.target.value)} />
              </div>
              <div>
                <label>Processing time (minutes)</label>
                <input
                  type="number"
                  value={processingTime}
                  onChange={(e) => setProcessingTime(e.target.value)}
                />
              </div>
            </div>

            <label>Stylist notes</label>
            <input value={stylistNotes} onChange={(e) => setStylistNotes(e.target.value)} />

            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button type="submit" className="btn-primary">Save formula</button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  resetFormulaForm();
                  setShowFormulaForm(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {formulas.length === 0 && <p className="empty-state">No formulas logged yet.</p>}
        {formulas.length > 0 && (
          <table className="clients-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Service</th>
                <th>Formula</th>
                <th>Stylist</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {formulas.map((f) => (
                <tr key={f.id}>
                  <td>{new Date(f.appointment.appointment_time).toLocaleDateString()}</td>
                  <td>{f.appointment.service}</td>
                  <td>{f.formula}</td>
                  <td>{f.appointment.stylist.name}</td>
                  <td>{f.stylist_notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3>Appointment history</h3>
        {appointments.length === 0 && <p className="empty-state">No appointments yet.</p>}
        {appointments.length > 0 && (
          <table className="clients-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Service</th>
                <th>Stylist</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.appointment_time).toLocaleString()}</td>
                  <td>{a.service}</td>
                  <td>{a.stylist.name}</td>
                  <td>
                    <span className={`status-badge status-${a.status}`}>{a.status}</span>
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

export default ClientDetail;