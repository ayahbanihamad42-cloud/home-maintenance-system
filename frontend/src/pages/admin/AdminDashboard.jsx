import React, { useCallback, useEffect, useState } from "react";
import Header from "../../components/common/Header";
import {
  getAdminUsers,
  createAdminUser,
  deleteAdminUser,
  getAdminTechnicians,
  createAdminTechnician,
  deleteAdminTechnician,
  getAdminStores,
  createAdminStore,
  deleteAdminStore,
  getAdminServices,
  createAdminService,
  deleteAdminService,
  getBackendImageUrl,
} from "../../services/adminService.jsx";

function AdminDashboard() {
  const emptyForm = {
    name: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    service_id: "",
    experience: "",
    price_per_hour: "",
    store_name: "",
    category: "",
    address: "",
    owner_id: "",
    service_name: "",
    image_url: "",
    image_base64: "",
  };

  const [view, setView] = useState("users");
  const [users, setUsers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [stores, setStores] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setForm(emptyForm);
  };

  const loadServices = useCallback(async () => {
    try {
      const data = await getAdminServices();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("loadServices error:", err?.response?.data || err.message);
      setServices([]);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      if (view === "users") {
        const data = await getAdminUsers();
        setUsers(Array.isArray(data) ? data : []);
      }

      if (view === "technicians") {
        const data = await getAdminTechnicians();
        setTechnicians(Array.isArray(data) ? data : []);
      }

      if (view === "stores") {
        const data = await getAdminStores();
        setStores(Array.isArray(data) ? data : []);
      }

      if (view === "services") {
        const data = await getAdminServices();
        setServices(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const compressImageFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const image = new Image();

      reader.onload = () => {
        image.src = reader.result;
      };

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 800;
        const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);

        canvas.width = image.width * scale;
        canvas.height = image.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };

      reader.onerror = reject;
      image.onerror = reject;

      reader.readAsDataURL(file);
    });
  };

  const handleServiceImageFile = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const compressed = await compressImageFile(file);

      setForm((prev) => ({
        ...prev,
        image_base64: compressed,
        image_url: "",
      }));
    } catch {
      alert("Failed to read image.");
    }
  };

  const handleAdd = async () => {
    try {
      if (view === "users") {
        await createAdminUser({
          name: form.name,
          email: form.email,
          phone: form.phone,
          city: form.city,
          password: form.password,
          role: "user",
        });
      }

      if (view === "technicians") {
        await createAdminTechnician({
          name: form.name,
          email: form.email,
          phone: form.phone,
          city: form.city,
          password: form.password,
          service_id: form.service_id,
          experience: form.experience,
          price_per_hour: form.price_per_hour,
        });
      }

      if (view === "stores") {
        await createAdminStore({
          store_name: form.store_name,
          category: form.category,
          city: form.city,
          address: form.address,
          owner_id: form.owner_id || null,
        });
      }

      if (view === "services") {
        await createAdminService({
          name: form.service_name,
          image_url: form.image_url,
          image_base64: form.image_base64,
        });
      }

      resetForm();
      await loadData();
      await loadServices();

      alert("Added successfully.");
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      if (type === "user") await deleteAdminUser(id);
      if (type === "technician") await deleteAdminTechnician(id);
      if (type === "store") await deleteAdminStore(id);
      if (type === "service") await deleteAdminService(id);

      setSelectedProfile(null);
      await loadData();
      await loadServices();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const changeView = (nextView) => {
    setView(nextView);
    resetForm();
    setSelectedProfile(null);
  };

  const activeClass = (name) => (view === name ? "primary" : "btn-outline");

  return (
    <>
      <Header />

      <div className="container">
        <h2>Admin Dashboard</h2>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          <button className={activeClass("users")} onClick={() => changeView("users")}>
            Manage Users
          </button>

          <button
            className={activeClass("technicians")}
            onClick={() => changeView("technicians")}
          >
            Manage Technicians
          </button>

          <button className={activeClass("stores")} onClick={() => changeView("stores")}>
            Manage Stores
          </button>

          <button
            className={activeClass("services")}
            onClick={() => changeView("services")}
          >
            Manage Services
          </button>
        </div>

        {loading ? <div className="panel">Loading...</div> : null}

        {view === "users" ? (
          <div style={{ overflowX: "auto" }}>
            <table className="card" style={{ width: "100%", minWidth: 750 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Role</th>
                  <th>View</th>
                  <th>Delete</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || "-"}</td>
                    <td>{u.city || "-"}</td>
                    <td>{u.role}</td>
                    <td>
                      <button
                        className="btn-outline"
                        onClick={() => setSelectedProfile({ type: "user", data: u })}
                      >
                        View
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-outline"
                        onClick={() => handleDelete("user", u.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {view === "technicians" ? (
          <div style={{ overflowX: "auto" }}>
            <table className="card" style={{ width: "100%", minWidth: 950 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Service</th>
                  <th>Image</th>
                  <th>Exp</th>
                  <th>Price/hr</th>
                  <th>View</th>
                  <th>Delete</th>
                </tr>
              </thead>

              <tbody>
                {technicians.map((t) => (
                  <tr key={t.technicianId}>
                    <td>{t.name}</td>
                    <td>{t.email}</td>
                    <td>{t.phone || "-"}</td>
                    <td>{t.city || "-"}</td>
                    <td>{t.service || "-"}</td>
                    <td>
                      {t.service_image ? (
                        <img
                          src={getBackendImageUrl(t.service_image)}
                          alt={t.service}
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{t.experience || 0}</td>
                    <td>{Number(t.price_per_hour || 0).toFixed(2)}</td>
                    <td>
                      <button
                        className="btn-outline"
                        onClick={() =>
                          setSelectedProfile({ type: "technician", data: t })
                        }
                      >
                        View
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-outline"
                        onClick={() => handleDelete("technician", t.technicianId)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {view === "stores" ? (
          <div style={{ overflowX: "auto" }}>
            <table className="card" style={{ width: "100%", minWidth: 800 }}>
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Category</th>
                  <th>City</th>
                  <th>Address</th>
                  <th>Owner</th>
                  <th>Delete</th>
                </tr>
              </thead>

              <tbody>
                {stores.map((s) => (
                  <tr key={s.id}>
                    <td>{s.store_name}</td>
                    <td>{s.category}</td>
                    <td>{s.city}</td>
                    <td>{s.address || "-"}</td>
                    <td>{s.owner_name || "-"}</td>
                    <td>
                      <button
                        className="btn-outline"
                        onClick={() => handleDelete("store", s.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {view === "services" ? (
          <div style={{ overflowX: "auto" }}>
            <table className="card" style={{ width: "100%", minWidth: 650 }}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Service Name</th>
                  <th>Image URL</th>
                  <th>Delete</th>
                </tr>
              </thead>

              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.image_url ? (
                        <img
                          src={getBackendImageUrl(s.image_url)}
                          alt={s.name}
                          style={{
                            width: 55,
                            height: 55,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #111",
                          }}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{s.name}</td>
                    <td>{s.image_url}</td>
                    <td>
                      <button
                        className="btn-outline"
                        onClick={() => handleDelete("service", s.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="panel admin-form" style={{ marginTop: 25 }}>
          <h3>
            {view === "users"
              ? "Add User"
              : view === "technicians"
              ? "Add Technician"
              : view === "stores"
              ? "Add Store"
              : "Add Service"}
          </h3>

          {(view === "users" || view === "technicians") && (
            <>
              <div className="input-group">
                <label>Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email"
                />
              </div>

              <div className="input-group">
                <label>Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone"
                />
              </div>

              <div className="input-group">
                <label>City</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="City"
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Password"
                />
              </div>
            </>
          )}

          {view === "technicians" && (
            <>
              <div className="input-group">
                <label>Service</label>
                <select
                  value={form.service_id}
                  onChange={(e) => setForm({ ...form, service_id: e.target.value })}
                >
                  <option value="">Select service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Experience</label>
                <input
                  type="number"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="input-group">
                <label>Price per hour</label>
                <input
                  type="number"
                  value={form.price_per_hour}
                  onChange={(e) =>
                    setForm({ ...form, price_per_hour: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
            </>
          )}

          {view === "stores" && (
            <>
              <div className="input-group">
                <label>Store Name</label>
                <input
                  value={form.store_name}
                  onChange={(e) =>
                    setForm({ ...form, store_name: e.target.value })
                  }
                  placeholder="Store name"
                />
              </div>

              <div className="input-group">
                <label>Category</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Category"
                />
              </div>

              <div className="input-group">
                <label>City</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="City"
                />
              </div>

              <div className="input-group">
                <label>Address</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Address"
                />
              </div>

              <div className="input-group">
                <label>Owner User ID</label>
                <input
                  value={form.owner_id}
                  onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </>
          )}

          {view === "services" && (
            <>
              <div className="input-group">
                <label>Service Name</label>
                <input
                  value={form.service_name}
                  onChange={(e) =>
                    setForm({ ...form, service_name: e.target.value })
                  }
                  placeholder="Example: Cleaning"
                />
              </div>

              <div className="input-group">
                <label>Service Image</label>

                <input type="file" accept="image/*" onChange={handleServiceImageFile} />

                {form.image_base64 ? (
                  <img
                    src={form.image_base64}
                    alt="preview"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginTop: 10,
                      border: "2px solid #111",
                    }}
                  />
                ) : null}

                <input
                  value={form.image_url}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      image_url: e.target.value,
                      image_base64: "",
                    })
                  }
                  placeholder="Or write URL: /images/services/plumbing.png"
                  style={{ marginTop: 10 }}
                />
              </div>
            </>
          )}

          <button className="primary" onClick={handleAdd}>
            Add
          </button>
        </div>

        {selectedProfile ? (
          <div className="panel" style={{ marginTop: 20 }}>
            <h3>
              {selectedProfile.type === "user"
                ? "User Profile"
                : "Technician Profile"}
            </h3>

            <p><b>Name:</b> {selectedProfile.data.name}</p>
            <p><b>Email:</b> {selectedProfile.data.email}</p>
            <p><b>Phone:</b> {selectedProfile.data.phone || "-"}</p>
            <p><b>City:</b> {selectedProfile.data.city || "-"}</p>

            {selectedProfile.type === "technician" ? (
              <>
                <p><b>Service:</b> {selectedProfile.data.service || "-"}</p>
                <p><b>Experience:</b> {selectedProfile.data.experience || 0}</p>
                <p>
                  <b>Price/hour:</b>{" "}
                  {Number(selectedProfile.data.price_per_hour || 0).toFixed(2)}
                </p>
              </>
            ) : null}

            <button className="btn-outline" onClick={() => setSelectedProfile(null)}>
              Close
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default AdminDashboard;