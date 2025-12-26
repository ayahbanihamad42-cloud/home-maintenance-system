/*
  Sends reset password link to user's email.
 */

import { useState } from "react";
import API from "../../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const submit = async () => {
    await API.post("/auth/forgot-password", { email });
    alert("Reset link sent to your email");
  };

  return (
    <div className="container">
      <h2>Forgot Password</h2>
      <input
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
      />
      <button className="primary" onClick={submit}>
        Send
      </button>
    </div>
  );
}

export default ForgotPassword;
