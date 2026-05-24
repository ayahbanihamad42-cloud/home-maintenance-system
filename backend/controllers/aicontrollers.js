import { GoogleGenerativeAI } from "@google/generative-ai";

const fallbackReply =
  "أنا مساعد الصيانة والديكور. ابعتيلي المشكلة أو الصورة وبساعدك بخطوات واضحة.";

const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);

const genAI = hasGeminiKey
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const textModel = genAI
  ? genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    })
  : null;

const isImageRequestText = (text) =>
  /صمم|تصميم|صورة|تخيل|افرش|ارسم|اعملي|ورجيني|شكل|ديزاين|توليد|عدل|تعديل/i.test(
    text
  );

const isBase64Image = (value) => {
  if (!value) return false;
  return /^data:image\/(png|jpg|jpeg|webp);base64,/.test(String(value));
};

const isSafeImageSize = (value, maxMB = 3) => {
  if (!value) return true;
  const sizeInBytes = (String(value).length * 3) / 4;
  return sizeInBytes <= maxMB * 1024 * 1024;
};

export const chatAI = async (req, res) => {
  try {
    const { message = "", image = null } = req.body || {};
    const cleanMessage = String(message || "").trim();

    if (!cleanMessage && !image) {
      return res.status(400).json({
        message: "Message or image is required.",
      });
    }

    if (image) {
      if (!isBase64Image(image)) {
        return res.status(400).json({
          message: "Invalid image format. Use png, jpg, jpeg, or webp.",
        });
      }

      if (!isSafeImageSize(image, 3)) {
        return res.status(400).json({
          message: "Image is too large. Maximum size is 3MB.",
        });
      }
    }

    if (!textModel) {
      return res.json({
        reply: fallbackReply,
        image: null,
        url: null,
      });
    }

    const isImageRequest = isImageRequestText(cleanMessage);

    if (image && isImageRequest) {
      const mimeTypeMatch = image.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
      const base64 = image.substring(image.indexOf(",") + 1);

      const visionResult = await textModel.generateContent([
        `You are an expert interior designer. Analyze the attached image and the user's modification request.
Generate a detailed English image creation prompt that maintains the original room layout, furniture structure, and architecture, but applies the requested changes.

User request: "${cleanMessage}"

Return ONLY the final detailed English prompt.`,
        {
          inlineData: {
            mimeType,
            data: base64,
          },
        },
      ]);

      const enhancedPrompt = encodeURIComponent(
        visionResult.response.text().trim()
      );
      const imageUrl = `https://image.pollinations.ai/p/${enhancedPrompt}?width=1024&height=1024&nologo=true`;

      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = `data:image/jpeg;base64,${buffer.toString("base64")}`;

      return res.json({
        reply: `تفضلي، قمت بتحليل الصورة وتعديل التصميم بناءً على طلبك: ${cleanMessage}`,
        image: null,
        url: base64Image,
      });
    }

    if (!image && isImageRequest) {
      const translationResult = await textModel.generateContent(
        `Translate and enhance this interior design request into one detailed English image prompt. Return ONLY the prompt: "${cleanMessage}"`
      );

      const englishPrompt = encodeURIComponent(
        translationResult.response.text().trim()
      );
      const imageUrl = `https://image.pollinations.ai/p/${englishPrompt}?width=1024&height=1024&nologo=true`;

      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = `data:image/jpeg;base64,${buffer.toString("base64")}`;

      return res.json({
        reply: "تفضلي، هذا هو التصميم الفني والديكور المقترح بناءً على طلبك:",
        image: null,
        url: base64Image,
      });
    }

    if (image && !isImageRequest) {
      const mimeTypeMatch = image.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
      const base64 = image.substring(image.indexOf(",") + 1);

      const result = await textModel.generateContent([
        `أنت مساعد ديكور وصيانة محترف.
حلل الصورة المرفقة وقدم اقتراحات وحلول عملية وواضحة بنقاط مرتبة.

طلب المستخدم:
${cleanMessage || "اعطني اقتراحات تحسين لهذه الصورة."}`,
        {
          inlineData: {
            mimeType,
            data: base64,
          },
        },
      ]);

      return res.json({
        reply: result.response.text(),
        image: null,
        url: null,
      });
    }

    const result = await textModel.generateContent(`أنت مساعد صيانة وديكور خبير داخل نظام Home Maintenance System.
جاوب المستخدم بشكل واضح ومفيد باللغة العربية.

سؤال المستخدم:
${cleanMessage}`);

    return res.json({
      reply: result.response.text(),
      image: null,
      url: null,
    });
  } catch (err) {
    console.error("AI error:", err);

    return res.json({
      reply:
        "صار خطأ مؤقت بالمساعد الفني، بس تقدري تكتبي المشكلة بالتفصيل وأنا أساعدك بخطوات عامة.",
      image: null,
      url: null,
    });
  }
};

export const getAIResponses = async (req, res) => {
  return res.json([]);
};