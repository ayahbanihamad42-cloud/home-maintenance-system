/**
 * TechnicianAvailability Page
 * ---------------------------
 * Technician defines working hours per day
 */
  
import { useEffect, useState } from "react";
// React hooks

import API from "../../services/api";
// Axios API instance

import Header from "../../components/common/Header";
// Header component

// Technician availability management component
function TechnicianAvailability() {

  // Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // Store technician ID
  const [technicianId, setTechnicianId] = useState(null);

  // Track technician profile status
  const [technicianStatus, setTechnicianStatus] = useState("loading");

  // Feedback message state
  const [message, setMessage] = useState("");

  // Availability form state
  const [form, setForm] = useState({
    day: "",
    start_time: "",
    end_time: ""
  });

  // Fetch technician profile using user ID
  useEffect(() => {

    // Stop if user is not available
    if (!user?.id) return;

    // Set loading state
    setTechnicianStatus("loading");

    // Request technician data
    API.get(`/technicians/user/${user.id}`)
      .then((res) => {

        // Save technician ID
        setTechnicianId(res.data.technicianId);

        // Mark profile as ready
        setTechnicianStatus("ready");

        // Clear messages
        setMessage("");
      })
      .catch(() => {

        // Handle missing technician profile
        setTechnicianId(null);
        setTechnicianStatus("error");
      });

  }, [user?.id]);

  // Submit availability data
  const submit = async () => {

    // Validate form inputs
    if (!form.day || !form.start_time || !form.end_time) {
      setMessage("Please choose a date and time range.");
      return;
    }

    // Handle missing technician profile
    if (!technicianId && technicianStatus === "error") {
      setMessage("Technician profile not found. Please contact the admin.");
      return;
    }

    try {
      // Send availability data to backend
      await API.post("/technicians/availability", {

        // Include technician ID if available
        ...(technicianId ? { technician_id: technicianId } : {}),

        // Include availability form data
        ...form
      });

      // Show success message
      setMessage("Availability saved");

    } catch (error) {

      // Handle API error
      setMessage(
        error.response?.data?.message ||
        "Failed to save availability."
      );
    }
  };

  return (
    <>
      {/* Page header */}
      <Header />

      <div className="container">

        {/* Page title */}
        <h2 className="section-title">Set Availability</h2>

        <div className="panel">

          {/* Date input */}
          <div className="input-group">
            <label>Date</label>
            <input
              type="date"
              onChange={e =>
                setForm({ ...form, day: e.target.value })
              }
            />
          </div>

          {/* Start time input */}
          <div className="input-group">
            <label>Start Time</label>
            <input
              type="time"
              onChange={e =>
                setForm({ ...form, start_time: e.target.value })
              }
            />
          </div>

          {/* End time input */}
          <div className="input-group">
            <label>End Time</label>
            <input
              type="time"
              onChange={e =>
                setForm({ ...form, end_time: e.target.value })
              }
            />
          </div>

          {/* Feedback message */}
          {message ? (
            <p className="helper-text">{message}</p>
          ) : null}

          {/* Submit button */}
          <button className="primary" onClick={submit}>
            Save
          </button>

        </div>
      </div>
    </>
  );
}

// Export component
export default TechnicianAvailability;
