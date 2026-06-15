  // React library and useState hook
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

  // AI input box component
function AIBox({ onAsk }) {
  const { t } = useTranslation();

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
        placeholder={t("aiChat.askPlaceholder")}
      />

       {/* Submit question */}
      <button className="primary" onClick={submit}>{t("aiChat.ask")}</button>
    </div>
  );
}
   // Export component
     export default AIBox;