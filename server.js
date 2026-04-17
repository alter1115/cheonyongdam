require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

/* ════════════════════════════════════
   1. 메인 페이지
════════════════════════════════════ */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ════════════════════════════════════
   2. 토스 결제 승인 API
════════════════════════════════════ */
app.post('/api/payment/confirm', async (req, res) => {
  const { paymentKey, orderId, amount } = req.body;

  // 금액 검증 (25000원인지 확인)
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
      // 결제 성공 → 결제 정보 반환
      res.json({ success: true, paymentKey, orderId });
    } else {
      res.status(400).json({ error: data.message || '결제 실패' });
    }
  } catch (e) {
    res.status(500).json({ error: '서버 오류: ' + e.message });
  }
});

/* ════════════════════════════════════
   3. Claude AI 사주 풀이 API
════════════════════════════════════ */
app.post('/api/saju', async (req, res) => {
  const { paymentKey, orderId, prompt } = req.body;

  // 결제 키 확인 (결제 안 한 사람 차단)
  if (!paymentKey || !orderId) {
    return res.status(403).json({ error: '결제 후 이용 가능합니다.' });
  }

  if (!prompt) {
    return res.status(400).json({ error: '프롬프트가 없습니다.' });
  }

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

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.content.map(c => c.text || '').join('');
    res.json({ success: true, text });

  } catch (e) {
    res.status(500).json({ error: '서버 오류: ' + e.message });
  }
});

/* ════════════════════════════════════
   4. 서버 시작
════════════════════════════════════ */
app.listen(PORT, () => {
  console.log(`✅ 천용담 서버 실행 중: http://localhost:${PORT}`);
  console.log(`📌 Anthropic 키: ${process.env.ANTHROPIC_API_KEY ? '✓ 설정됨' : '❌ 미설정'}`);
  console.log(`📌 토스 클라이언트 키: ${process.env.TOSS_CLIENT_KEY ? '✓ 설정됨' : '❌ 미설정'}`);
  console.log(`📌 토스 시크릿 키: ${process.env.TOSS_SECRET_KEY ? '✓ 설정됨' : '❌ 미설정'}`);
});
