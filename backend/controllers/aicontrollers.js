const fallbackReply =
  "أنا مساعد الصيانة والديكور. ابعتيلي المشكلة أو الصورة وبساعدك بخطوات واضحة.";

const isImageEditRequest = (text) => {
  const value = String(text || "").toLowerCase();

  return (
    value.includes("عدل") ||
    value.includes("عدلي") ||
    value.includes("غير") ||
    value.includes("غيّر") ||
    value.includes("لون") ||
    value.includes("ألوان") ||
    value.includes("ديكور") ||
    value.includes("edit") ||
    value.includes("change") ||
    value.includes("color") ||
    value.includes("design")
  );
};

export const chatAI = async (req, res) => {
  try {
    const { message, image } = req.body;

    const cleanMessage = String(message || "").trim();
    const hasImage = Boolean(image);

    if (hasImage && isImageEditRequest(cleanMessage)) {
      return res.json({
        reply:
          "فهمت طلبك على الصورة. حالياً المساعد يعطي اقتراح تعديل نصي بدل ما يرجّع نفس الصورة القديمة. اقترح تطبيق التعديل المطلوب مع الحفاظ على نفس توزيع الأثاث والإضاءة. لتعديل الصورة فعلياً نحتاج ربط API خاص بتوليد/تعديل الصور.",
        image: null,
        url: null,
      });
    }

    if (hasImage) {
      return res.json({
        reply:
          "الصورة وصلت. احكيلي بالضبط شو التعديل المطلوب عليها، مثل اللون أو الستايل أو الجزء اللي بدك تغيّريه.",
        image: null,
        url: null,
      });
    }

    if (!cleanMessage) {
      return res.json({
        reply: fallbackReply,
        image: null,
        url: null,
      });
    }

    return res.json({
      reply: `بالنسبة لطلبك: ${cleanMessage}\n\nاقترح تحددي نوع الخدمة، المكان، والوقت المناسب. وإذا عندك صورة ارفعيها عشان أعطيك نصيحة أدق.`,
      image: null,
      url: null,
    });
  } catch (err) {
    console.error("AI error:", err);

    return res.json({
      reply: "صار خطأ أثناء تشغيل المساعد. جرّبي مرة ثانية.",
      image: null,
      url: null,
    });
  }
};

export const getAIResponses = async (req, res) => {
  return res.json([]);
};