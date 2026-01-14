  // React library and useState hook
import React, { useState } from "react";

  // AI input box component
function AIBox({ onAsk }) {

   // State to store user input
  const [text, setText] = useState("");

   // Handle submit action
  const submit = () => {

    // Prevent empty input
    if (!text.trim()) return;

    // Send text to parent component
     onAsk(text);
   // Clear input after submit
     setText("");
  };

  return (
    <div className="ai-box">
      {/* Text input area */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Ask AI..."
      />

       {/* Submit question */}
      <button className="primary" onClick={submit}>Ask</button>
    </div>
  );
}
   // Export component
     export default AIBox;