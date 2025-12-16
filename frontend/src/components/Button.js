
import React from "react";
const Button = ({ text, onClick, type = "button" }) => (
  <button className="btn" type={type} onClick={onClick}>
    {text}
  </button>
);

export default Button;
