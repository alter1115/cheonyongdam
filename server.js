require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/fail', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/payment/confirm', async (req, res) => {
  const { paymentKey, orderId, amount } = req.body;
  if (amount !== 25000) {
    return res.status(400).json({ error: '결제 금액이 올바르지 않습니다.' });
  }
  try {
    const secretKey = process.env.TOSS_SECRET_KEY;
    const encoded = Buffer.from(secretKey + ':').toString('base64');
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encoded}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ paymentKey, orderId, amount })
    });
    const data = await response.json();
    if (data.status === 'DONE') {
      res.json({ success: true, paymentKey, orderId });
    } else {
      res.status(400).json({ error: data.message || '결제 실패' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/saju', async (req, res) => {
  const { paymentKey, orderId, prompt } = req.body;
  if (!paymentKey || !orderId) return res.status(403).json({ error: '결제 후 이용 가능합니다.' });
  if (!prompt) return res.status(400).json({ error: '프롬프트가 없습니다.' });
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const text = data.content.map(c => c.text || '').join('');
    res.json({ success: true, text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('천용담 서버 실행 중');
});
