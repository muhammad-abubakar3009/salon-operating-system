import { useState, useEffect } from "react";
import apiClient from "../api/client";
import Navbar from "../components/Navbar";
import "./Appointments.css";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [clientId, setClientId] = useState("");
  const [stylistId, setStylistId] = useState("");
  const [service, setService] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [formError, setFormError] = useState("");

  async function fetchAppointments() {
    try {
      const response = await apiClient.get("/appointments");
      setAppointments(response.data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }

  async function fetchDropdownData() {
    try {
      const [clientsRes, stylistsRes] = await Promise.all([
        apiClient.get("/clients"),
        apiClient.get("/users"),
      ]);
      setClients(clientsRes.data);
      setStylists(stylistsRes.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchAppointments();
    fetchDropdownData();
  }, []);

  function resetForm() {
    setClientId("");
    setStylistId("");
    setService("");
    setAppointmentTime("");
    setFormError("");
  }

  async function handleCreateAppointment(e) {
    e.preventDefault();
    setFormError("");

    if (!clientId || !stylistId || !service || !appointmentTime) {
      setFormError("All fields are required");
      return;
    }

    try {
      await apiClient.post("/appointments", {
        client_id: Number(clientId),
        stylist_id: Number(stylistId),
        service,
        appointment_time: new Date(appointmentTime).toISOString(),
      });

      resetForm();
      setShowForm(false);
      fetchAppointments();
    } catch (error) {
      console.error(error);
      setFormError("Failed to create appointment");
    }
  }

  async function handleStatusChange(appointmentId, newStatus) {
    try {
      await apiClient.patch(`/appointments/${appointmentId}`, {
        status: newStatus,
      });
      fetchAppointments();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1>Appointments</h1>
          {!showForm && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              New appointment
            </button>
          )}
        </div>

        {showForm && (
          <form className="add-client-form" onSubmit={handleCreateAppointment}>
            {formError && <p className="form-error">{formError}</p>}

            <div className="form-row">
              <div>
                <label>Client</label>
                <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Stylist</label>
                <select value={stylistId} onChange={(e) => setStylistId(e.target.value)}>
                  <option value="">Select stylist</option>
                  {stylists.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <label>Service</label>
            <input value={service} onChange={(e) => setService(e.target.value)} />

            <label>Date &amp; time</label>
            <input
              type="datetime-local"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
            />

            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button type="submit" className="btn-primary">Book appointment</button>
              <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading && <p>Loading appointments...</p>}
        {errorMessage && <p style={{ color: "var(--brick)" }}>{errorMessage}</p>}

        {!loading && !errorMessage && (
          <table className="clients-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Stylist</th>
                <th>Service</th>
                <th>Date &amp; time</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id}>
                  <td>{appt.client.name}</td>
                  <td>{appt.stylist.name}</td>
                  <td>{appt.service}</td>
                  <td>{new Date(appt.appointment_time).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge status-${appt.status}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td>
                    {appt.status === "booked" && (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="btn-link"
                          onClick={() => handleStatusChange(appt.id, "completed")}
                        >
                          Complete
                        </button>
                        <button
                          className="btn-link"
                          onClick={() => handleStatusChange(appt.id, "cancelled")}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
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

export default Appointments;