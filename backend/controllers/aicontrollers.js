import axios from "axios";
// Send a message to the AI assistant and return the reply
export const chatAI = async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ reply: "الرجاء كتابة رسالة أولاً." });
  }
  // Gemini API key from environment
  const geminiKey = process.env.GEMINI_API_KEY;

  const fallbackReply =
    "حالياً المساعد غير متاح بسبب إعدادات الخدمة. تقدر تسألني سؤال ثاني أو جرّب لاحقاً.";
// Ensure key is present before calling the service
  if (!geminiKey) {
    console.warn("AI service unavailable: missing GEMINI_API_KEY");
    return res.json({ reply: fallbackReply });
  }

  try {
    // ✅ موديل موجود عندك ويدعم generateContent
    const model = "models/gemini-2.5-flash";
    // بديل ممتاز لو بدك آخر إصدار دائمًا:
    // const model = "models/gemini-flash-latest";

    const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent`;

    const response = await axios.post(
      url,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are a professional home maintenance assistant.
Answer clearly and helpfully in Arabic.
User question: ${message}`
              }
            ]
          }
        ]
      },
      {
        params: { key: geminiKey },
        headers: { "Content-Type": "application/json" }
      }
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return res.json({ reply: reply || fallbackReply });
  } catch (err) {
    console.error("AI service error:", err?.response?.data || err?.message || err);
    return res.json({ reply: fallbackReply });
  }
};
