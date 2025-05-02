import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // Loads .env file
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.post('/tag', async (req, res) => {
  const { postText, topics } = req.body;

  if (!postText || !topics || !Array.isArray(topics)) {
    return res.status(400).json({ error: 'Missing postText or topics[]' });
  }

  const prompt = `
You are an AI assistant that classifies LinkedIn posts into topics.

### Allowed Topics:
${JSON.stringify(topics)}

### Instructions:
- ONLY return a JSON array (like ["AI", "Startup"]).
- DO NOT explain anything or add text outside the array.
- Match topics based on meaning, even if not explicitly named.
- If nothing matches, return an empty array: []

### Post:
"""${postText}"""

### Output:
`;

  console.log("📩 Prompt sent to LLaMA:\n", prompt);

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const raw = response.data.choices[0].message.content.trim();
    console.log("🧠 LLaMA Raw Output:", raw);

    let tags = [];
    try {
      tags = JSON.parse(raw);
    } catch (err) {
      console.error("❌ JSON parse error:", err.message);
      return res.status(500).json({ error: 'LLaMA returned invalid JSON' });
    }

    return res.json({ tags });

  } catch (err) {
    console.error("❌ Groq API error:", err.response?.data || err.message);
    return res.status(500).json({ error: 'LLaMA API failed' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
