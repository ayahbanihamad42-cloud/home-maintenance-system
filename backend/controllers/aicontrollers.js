import axios from "axios";

export const chatAI = async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Input is empty" });

    try {
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/google/flan-t5-small",
            { inputs: `Maintenance expert advice for: ${message}` },
            { headers: { Authorization: `Bearer ${process.env.HF_KEY}` } }
        );
        res.json({ reply: response.data[0].generated_text });
    } catch (err) {
        res.status(500).json({ error: "AI Service Unavailable" });
    }
};