 
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

/* ══ 이메일 발송 설정 ══ */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

async function sendOrderEmail(info) {
  const { name, phone, sex, cal, y, m, d, hr, married, orderId, amount } = info;
  const hrStr = hr < 0 ? '시간 모름' : `${hr}시`;

  const html = `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><style>
body{font-family:sans-serif;background:#f5f5f5;margin:0;padding:20px;}
.wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.1);}
.header{background:linear-gradient(135deg,#0d0a06,#1a1208);padding:32px;text-align:center;}
.header h1{color:#c9a84c;font-size:22px;margin:0;letter-spacing:.1em;}
.header p{color:rgba(247,242,232,.5);font-size:12px;margin:8px 0 0;}
.body{padding:32px;}
.alert{background:#fff3e0;border-left:4px solid #c9a84c;padding:16px 20px;margin-bottom:24px;}
.alert h2{color:#8b5e00;font-size:16px;margin:0 0 6px;}
.alert p{color:#b07800;font-size:13px;margin:0;}
.section{margin-bottom:24px;}
.section h3{font-size:12px;color:#999;margin:0 0 12px;letter-spacing:.1em;border-bottom:1px solid #eee;padding-bottom:8px;}
.row{display:flex;padding:10px 0;border-bottom:1px solid #f5f5f5;}
.label{width:140px;font-size:13px;color:#666;flex-shrink:0;}
.value{font-size:14px;color:#333;font-weight:600;}
.phone-box{background:#fffde7;border:2px solid #ffe400;padding:16px;text-align:center;font-size:22px;font-weight:900;color:#8b5e00;margin:12px 0;}
.footer{background:#f9f9f9;padding:20px 32px;text-align:center;}
.footer p{font-size:11px;color:#bbb;margin:4px 0;}
</style></head>
<body><div class="wrap">
  <div class="header">
    <h1>天龍談 · 천용담</h1>
    <p>새로운 사주 풀이 신청이 접수되었습니다</p>
  </div>
  <div class="body">
    <div class="alert">
      <h2>🔔 새 주문 알림!</h2>
      <p>아래 번호로 카카오톡 풀이 결과를 전송해주세요 (1~2시간 이내)</p>
    </div>
    <div class="section">
      <h3>👤 고객 정보</h3>
      <div class="row"><div class="label">성함</div><div class="value">${name}</div></div>
      <div class="row"><div class="label">성별</div><div class="value">${sex}성</div></div>
      <div class="row"><div class="label">양/음력</div><div class="value">${cal === '양' ? '양력' : '음력'}</div></div>
      <div class="row"><div class="label">결혼 여부</div><div class="value">${married}</div></div>
    </div>
    <div class="section">
      <h3>📅 생년월일시</h3>
      <div class="row"><div class="label">생년월일</div><div class="value">${y}년 ${m}월 ${d}일</div></div>
      <div class="row"><div class="label">태어난 시각</div><div class="value">${hrStr}</div></div>
    </div>
    <div class="section">
      <h3>💬 카카오톡 발송 번호</h3>
      <div class="phone-box">${phone}</div>
    </div>
    <div class="section">
      <h3>💳 결제 정보</h3>
      <div class="row"><div class="label">결제 금액</div><div class="value">${Number(amount).toLocaleString()}원</div></div>
      <div class="row"><div class="label">주문 번호</div><div class="value" style="font-size:12px">${orderId}</div></div>
    </div>
  </div>
  <div class="footer">
    <p>천용담(天龍談) 자동 발송 이메일</p>
    <p>결제 완료 시 자동으로 발송됩니다.</p>
  </div>
</div></body></html>`;

  await transporter.sendMail({
    from: `"천용담 알림" <${process.env.GMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || 'alter1115@naver.com',
    subject: `[천용담] 새 주문 - ${name}님 (${phone})`,
    html
  });
}

/* ══ 1. 메인 페이지 ══ */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ══ 2. success/fail 페이지 → index.html로 처리 ══ */
app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/fail', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ══ 3. 토스 결제 승인 + 이메일 발송 ══ */
app.post('/api/payment/confirm', async (req, res) => {
  const { paymentKey, orderId, amount, name, phone, sex, cal, y, m, d, hr, married } = req.body;

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
      // ✅ 결제 성공 → 이메일 자동 발송
      try {
        await sendOrderEmail({ name, phone, sex, cal, y, m, d, hr, married, orderId, amount });
        console.log(`📧 이메일 발송 완료: ${name} (${phone})`);
      } catch (emailErr) {
        console.error('이메일 발송 실패:', emailErr.message);
      }
      res.json({ success: true, paymentKey, orderId });
    } else {
      res.status(400).json({ error: data.message || '결제 실패' });
    }
  } catch (e) {
    res.status(500).json({ error: '서버 오류: ' + e.message });
  }
});

/* ══ 4. Claude 사주 풀이 API ══ */
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
    res.status(500).json({ error: '서버 오류: ' + e.message });
  }
});

/* ══ 5. 서버 시작 ══ */
app.listen(PORT, () => {
  console.log(`✅ 천용담 서버 실행 중: http://localhost:${PORT}`);
  console.log(`📌 Anthropic 키: ${process.env.ANTHROPIC_API_KEY ? '✓ 설정됨' : '❌ 미설정'}`);
  console.log(`📌 Gmail: ${process.env.GMAIL_USER ? '✓ 설정됨' : '❌ 미설정'}`);
});