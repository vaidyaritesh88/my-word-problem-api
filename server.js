const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // We'll set this on Render
});
const openai = new OpenAIApi(configuration);

app.post('/word-problem', async (req, res) => {
  const { age } = req.body;

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: `Generate a fun two-digit addition or subtraction word problem for a ${age}-year-old. Use simple words and this format only:\nProblem: ...\nAnswer: ...`,
      }],
      temperature: 0.7,
    });

    const text = response.data.choices[0].message.content;
    const match = text.match(/Problem:\s*(.*)\nAnswer:\s*(\d+)/);

    if (match) {
      res.json({ problem: match[1], answer: parseInt(match[2]) });
    } else {
      res.status(500).json({ error: 'Could not parse GPT response' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch from OpenAI' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
