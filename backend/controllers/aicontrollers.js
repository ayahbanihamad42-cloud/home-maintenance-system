import { GoogleGenerativeAI } from "@google/generative-ai";

const fallbackReply = "أنا مساعد الصيانة والديكور. ابعتيلي المشكلة أو الصورة وبساعدك بخطوات واضحة.";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const textModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export const chatAI = async (req, res) => {
  try {
    const { message = "", image = null } = req.body || {};
    const cleanMessage = String(message || "").trim();

    if (!cleanMessage && !image) {
      return res.json({ reply: fallbackReply, image: null, url: null });
    }

    // التحقق من طبيعة طلب المستخدم (هل يبحث عن تصميم/تعديل مرئي؟)
    const isImageRequest = /صمم|تصميم|صورة|تخيل|افرش|ارسم|اعملي|ورجيني|شكل|ديزاين|توليد|عدل|تعديل/i.test(cleanMessage);

    // ==========================================
    // الحالة الأولى: طلب تعديل على صورة مرفوعة بالفعل
    // ==========================================
    if (image && isImageRequest) {
      const mimeTypeMatch = image.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
      const base64 = image.substring(image.indexOf(",") + 1);

      // نطلب من جيمني تحليل الصورة الحالية وصياغة وصف إنجليزي جديد يدمج التعديلات المطلوبة مع الحفاظ على الهيكل العام
      const visionResult = await textModel.generateContent([
        `You are an expert interior designer. Analyze the attached image and the user's modification request. 
         Generate a detailed English image creation prompt that maintains the exact layout, furniture structure, and architecture of the original room, but applies the user's requested changes (e.g., changing colors, themes, or materials).
         
         User request: "${cleanMessage}"
         
         Return ONLY the final detailed English prompt, without any markdown or conversational text.`,
        {
          inlineData: {
            mimeType: mimeType,
            data: base64,
          },
        },
      ]);

      const enhancedPrompt = encodeURIComponent(visionResult.response.text().trim());
      const imageUrl = `https://image.pollinations.ai/p/${enhancedPrompt}?width=1024&height=1024&nologo=true`;

      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = `data:image/jpeg;base64,${buffer.toString("base64")}`;

      return res.json({
        reply: `تفضلي، قمت بتحليل الغرفة المرفقة وتعديل التصميم والديكور والألوان بناءً على طلبك (${cleanMessage}):`,
        image: null,
        url: base64Image,
      });
    }

    // ==========================================
    // الحالة الثانية: توليد صورة جديدة من الصفر بناءً على نص فقط
    // ==========================================
    if (!image && isImageRequest) {
      const translationResult = await textModel.generateContent(
        `Translate and enhance this interior design request into a single detailed English image description prompt for AI generation. Return ONLY the English description text, absolutely no introductions or markdown: "${cleanMessage}"`
      );
      
      const englishPrompt = encodeURIComponent(translationResult.response.text().trim());
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

    // ==========================================
    // الحالة الثالثة: رفع صورة للتحليل والصيانة بدون طلب تعديل مرئي
    // ==========================================
    if (image && !isImageRequest) {
      const mimeTypeMatch = image.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
      const base64 = image.substring(image.indexOf(",") + 1);

      const result = await textModel.generateContent([
        `أنت مساعد ديكور وصيانة محترف.
        حلل الصورة المرفقة بدقة وقدم اقتراحات وحلول عملية وواضحة بناءً على طلب المستخدم.
        اكتب الاقتراحات بنقاط مرتبة ومفهومة.

        طلب المستخدم:
        ${cleanMessage || "اعطني اقتراحات تحسين لهذه الصورة ومراجعة للمشكلة الفنية."}`,
        {
          inlineData: {
            mimeType: mimeType,
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

    // ==========================================
    // الحالة الرابعة: المحادثات النصية والاستفسارات العادية
    // ==========================================
    const result = await textModel.generateContent(`أنت مساعد صيانة وديكور خبير داخل نظام Home Maintenance System.
    جاوب المستخدم بشكل مفصل، واضح، ومفيد باللغة العربية وباللهجة العامية المفهومة.

    سؤال المستخدم:
    ${cleanMessage}`);

    return res.json({
      reply: result.response.text(),
      image: null,
      url: null,
    });

  } catch (err) {
    console.error("AI error:", err);
    return res.status(500).json({
      reply: "صار خطأ بالمساعد الفني. يرجى التحقق من الاتصال ومفتاح الـ API.",
      image: null,
      url: null,
    });
  }
};

export const getAIResponses = async (req, res) => {
  return res.json([]);
};