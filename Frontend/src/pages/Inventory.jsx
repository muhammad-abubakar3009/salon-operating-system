import { useState, useEffect } from "react";
import apiClient from "../api/client";
import Navbar from "../components/Navbar";
import "./Inventory.css";

function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [unit, setUnit] = useState("");
  const [reorderThreshold, setReorderThreshold] = useState("");
  const [formError, setFormError] = useState("");

  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [changeAmount, setChangeAmount] = useState("");
  const [reason, setReason] = useState("");
  const [adjustError, setAdjustError] = useState("");

  async function fetchProducts() {
    try {
      const response = await apiClient.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function resetForm() {
    setName("");
    setSku("");
    setUnit("");
    setReorderThreshold("");
    setFormError("");
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    setFormError("");

    if (!name || !sku) {
      setFormError("Name and SKU are required");
      return;
    }

    try {
      await apiClient.post("/products", {
        name,
        sku,
        unit: unit || undefined,
        reorder_threshold: reorderThreshold ? Number(reorderThreshold) : undefined,
      });
      resetForm();
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.error || "Failed to add product";
      setFormError(message);
    }
  }

  function openAdjustForm(product) {
    setAdjustingProduct(product);
    setChangeAmount("");
    setReason("");
    setAdjustError("");
  }

  async function handleAdjust(e) {
    e.preventDefault();
    setAdjustError("");

    const amount = Number(changeAmount);
    if (!amount || !reason) {
      setAdjustError("Amount and reason are required");
      return;
    }

    try {
      await apiClient.post(`/products/${adjustingProduct.id}/adjust`, {
        change_amount: amount,
        reason,
      });
      setAdjustingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.error || "Failed to adjust stock";
      setAdjustError(message);
    }
  }

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1>Inventory</h1>
          {!showForm && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              New product
            </button>
          )}
        </div>

        {showForm && (
          <form className="add-client-form" onSubmit={handleAddProduct}>
            {formError && <p className="form-error">{formError}</p>}

            <div className="form-row">
              <div>
                <label>Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label>SKU</label>
                <input value={sku} onChange={(e) => setSku(e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>Unit</label>
                <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="ml, g, pcs..." />
              </div>
              <div>
                <label>Reorder threshold</label>
                <input
                  type="number"
                  value={reorderThreshold}
                  onChange={(e) => setReorderThreshold(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" className="btn-primary">Add product</button>
              <button type="button" className="btn-outline" onClick={() => { resetForm(); setShowForm(false); }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {adjustingProduct && (
          <form className="add-client-form" onSubmit={handleAdjust}>
            <h3 style={{ marginBottom: "12px" }}>
              Adjust stock — {adjustingProduct.name}
            </h3>

            {adjustError && <p className="form-error">{adjustError}</p>}

            <div className="form-row">
              <div>
                <label>Change amount (+ or -)</label>
                <input
                  type="number"
                  value={changeAmount}
                  onChange={(e) => setChangeAmount(e.target.value)}
                  placeholder="e.g. 20 or -5"
                />
              </div>
              <div>
                <label>Reason</label>
                <input value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" className="btn-primary">Save adjustment</button>
              <button type="button" className="btn-outline" onClick={() => setAdjustingProduct(null)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading && <p>Loading products...</p>}
        {errorMessage && <p style={{ color: "var(--brick)" }}>{errorMessage}</p>}

        {!loading && !errorMessage && (
          <table className="clients-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Unit</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isLow = product.stock_quantity <= product.reorder_threshold;
                return (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>
                      {product.stock_quantity}
                      {isLow && <span className="low-stock-badge">Low stock</span>}
                    </td>
                    <td>{product.unit || "—"}</td>
                    <td>
                      <button className="btn-link" onClick={() => openAdjustForm(product)}>
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Inventory;