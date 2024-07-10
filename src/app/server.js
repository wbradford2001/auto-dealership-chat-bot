const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/deepgram-tts', async (req, res) => {
  const { text } = req.body;

  try {
    const response = await axios.post(
      'https://api.deepgram.com/v1/listen',
      {
        text: text,
      },
      {
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error calling Deepgram API:', error);
    res.status(500).send('Error calling Deepgram API');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
