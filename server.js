const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI("AIzaSyDHQAasduHamgBCdinQqQd1ZIKILuNJfgM"); 

app.post("/analyze", async (req, res) => {
  try {
    const { followers, following, posts, bio } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    // ✅ CLEAN PROMPT
    const prompt = `
Analyze this Instagram account and tell if it is FAKE or REAL.

Followers: ${followers}
Following: ${following}
Posts: ${posts}
Bio: ${bio}

Give output in this format:
FAKE or REAL
Suspicious percentage
Short reason
`;

    const result = await model.generateContent(prompt);

    if (!result || !result.response) {
      return res.json({ result: "AI failed ❌" });
    }

    const text = result.response.text();

    console.log("AI RESULT 👉", text);

    if (!text) {
      return res.json({ result: "No AI response ❌" });
    }

    res.json({ result: text });

  } catch (err) {
    console.error("FULL ERROR 👉", err);
    res.json({ result: "Error in AI analysis ❌" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
