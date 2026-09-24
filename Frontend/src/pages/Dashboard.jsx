import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";
import Navbar from "../components/Navbar";
import "./Dashboard.css";

function Dashboard() {
  const [clientCount, setClientCount] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await apiClient.get("/clients");
        setClientCount(response.data.length);
      } catch (error) {
        console.error(error);
      }
    }

    fetchStats();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="dashboard-header">
          <h1>Welcome back</h1>
          <div className="dashboard-actions">
            <Link to="/clients" className="btn-outline">View clients</Link>
            <button className="btn-primary">New client</button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Active clients</p>
            <p className="stat-value">{clientCount ?? "—"}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Appointments today</p>
            <p className="stat-value">—</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Completed today</p>
            <p className="stat-value">—</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;