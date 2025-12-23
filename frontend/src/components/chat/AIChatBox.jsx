import React, { useState } from "react";

function AIBox({ onAsk }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onAsk(text);
    setText("");
  };

  return (
    <div className="ai-box">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Ask AI..."
      />
      <button className="primary" onClick={submit}>Ask</button>
    </div>
  );
}

export default AIBox;
