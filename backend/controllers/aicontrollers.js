import axios from "axios";

const fallbackReply =
  "حالياً المساعد غير متاح بسبب إعدادات الخدمة. جرّب لاحقاً.";

const getGeminiKey = () => process.env.GEMINI_API_KEY;

const getImagePart = (image) => {
  if (!image) return null;

  const match = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!match) return null;

  return {
    inlineData: {
      mimeType: match[1],
      data: match[2],
    },
  };
};

const extractTextReply = (data) => {
  return data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    ?.join("")
    ?.trim();
};

const callGeminiText = async (parts, geminiKey) => {
  const model = "models/gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent`;

  const response = await axios.post(
    url,
    {
      contents: [{ role: "user", parts }],
    },
    {
      params: { key: geminiKey },
      headers: { "Content-Type": "application/json" },
    }
  );

  return response.data;
};

const decideIntent = ({ message }) => {
  const text = (message || "").toLowerCase();

  const imageWords = [
    "صورة",
    "الصورة",
    "صور",
    "اعطيني صورة",
    "اعطيني الصورة",
    "طلع صورة",
    "طلع الصورة",
    "ولد صورة",
    "ولّد صورة",
    "صمم",
    "تصميم",
    "ديكور",
    "غير لون",
    "غير اللون",
    "غير الخلفية",
    "غير خلفية",
    "عدل",
    "تعديل",
    "generate image",
    "create image",
    "make image",
    "design",
    "decor",
    "decoration",
    "edit image",
  ];

  const wantsImage = imageWords.some((word) => text.includes(word));

  if (wantsImage) {
    return {
      intent: "image",
      prompt: message || "Create a modern home decoration design image.",
    };
  }

  return {
    intent: "chat",
    prompt: message || "Analyze this image.",
  };
};

const buildImagePrompt = ({ message, hasImage }) => {
  const basePrompt =
    message || "Create a modern professional home decoration design image.";

  if (hasImage) {
    return `Professional realistic home interior design inspired by the uploaded room. Apply this request: ${basePrompt}. High quality, modern decoration, realistic photo, 4k.`;
  }

  return `Professional realistic home interior design. ${basePrompt}. High quality, modern decoration, realistic photo, 4k.`;
};

const generateImageAsBase64 = async (prompt) => {
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Date.now();

  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&seed=${seed}&model=flux&nologo=true`;

  const response = await axios.get(imageUrl, {
    responseType: "arraybuffer",
    timeout: 120000,
    headers: {
      Accept: "image/png,image/jpeg,image/webp,*/*",
    },
  });

  const contentType = response.headers["content-type"] || "image/jpeg";

  if (!contentType.startsWith("image/")) {
    throw new Error("Image generator did not return an image.");
  }

  const base64 = Buffer.from(response.data, "binary").toString("base64");

  return `data:${contentType};base64,${base64}`;
};

export const chatAI = async (req, res) => {
  const { message, image } = req.body;

  if ((!message || !message.trim()) && !image) {
    return res.status(400).json({
      reply: "الرجاء كتابة رسالة أو إرسال صورة أولاً.",
      image: null,
      url: null,
    });
  }

  try {
    const imagePart = image ? getImagePart(image) : null;

    if (image && !imagePart) {
      return res.status(400).json({
        reply: "صيغة الصورة غير صحيحة. جرّبي صورة أخرى.",
        image: null,
        url: null,
      });
    }

    const decision = decideIntent({ message });

    if (decision.intent === "image") {
      const imagePrompt = buildImagePrompt({
        message: decision.prompt,
        hasImage: !!image,
      });

      const generatedImage = await generateImageAsBase64(imagePrompt);

      return res.json({
        reply: "تم توليد صورة مقترحة بناءً على طلبك.",
        image: generatedImage,
        url: generatedImage,
      });
    }

    const geminiKey = getGeminiKey();

    if (!geminiKey) {
      return res.json({
        reply: fallbackReply,
        image: null,
        url: null,
      });
    }

    const parts = [
      {
        text: `You are a professional home maintenance and decoration assistant.

Answer clearly and naturally in Arabic.

Rules:
- If an image is provided, analyze it directly.
- If the user asks about repair, maintenance, design, colors, furniture, decoration, or home improvement, give practical advice.
- Do not say you cannot see the image when an image is provided.
- Be helpful and specific.

User message:
${decision.prompt || message || "Analyze this image."}`,
      },
    ];

    if (imagePart) {
      parts.push(imagePart);
    }

    const data = await callGeminiText(parts, geminiKey);
    const reply = extractTextReply(data);

    return res.json({
      reply: reply || fallbackReply,
      image: null,
      url: null,
    });
  } catch (err) {
    console.error("AI error:", err?.response?.data || err?.message || err);

    return res.json({
      reply: "صار خطأ أثناء توليد الصورة. جرّبي مرة ثانية.",
      image: null,
      url: null,
    });
  }
};

export const getAIResponses = async (req, res) => {
  return res.json([]);
};