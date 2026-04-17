# 천용담(天龍談) 종합사주 서비스

## 📁 파일 구조
```
cheonyongdam/
├── server.js          ← Node.js 백엔드 (API 키 보관)
├── package.json       ← 패키지 설정
├── vercel.json        ← Vercel 배포 설정
├── .env               ← API 키 설정 (절대 공개 금지!)
└── public/
    └── index.html     ← 메인 사이트
```

---

## ⚙️ 1단계 — .env 파일 설정

`.env` 파일을 열고 아래 항목을 본인 키로 교체하세요:

```
ANTHROPIC_API_KEY=sk-ant-api03-여기에실제키입력
TOSS_CLIENT_KEY=test_ck_aBX7zk2yd8y7jPJazJXVx9POLqKQ
TOSS_SECRET_KEY=test_sk_여기에실제시크릿키입력
```

---

## 💻 2단계 — 로컬 테스트

```bash
# 폴더로 이동
cd cheonyongdam

# 패키지 설치
npm install

# 서버 실행
npm start

# 브라우저에서 확인
# http://localhost:3000
```

---

## 🚀 3단계 — Vercel 배포 (무료)

### Vercel 가입
1. [vercel.com](https://vercel.com) 접속
2. GitHub로 회원가입

### GitHub에 코드 올리기
1. [github.com](https://github.com) 가입
2. New Repository 생성 (이름: cheonyongdam)
3. 코드 업로드

### Vercel 배포
1. Vercel 대시보드에서 "New Project"
2. GitHub 저장소 선택
3. **Environment Variables** 에 .env 내용 입력:
   - `ANTHROPIC_API_KEY` = 실제 API 키
   - `TOSS_CLIENT_KEY` = 토스 클라이언트 키
   - `TOSS_SECRET_KEY` = 토스 시크릿 키
4. Deploy 클릭
5. `cheonyongdam.vercel.app` 주소로 접속 가능!

---

## 🌐 4단계 — 도메인 연결 (cheonyongdam.com)

1. Vercel 대시보드 → 프로젝트 → Settings → Domains
2. `cheonyongdam.com` 입력 후 Add
3. Vercel이 DNS 설정 안내 표시
4. 가비아(gabia.com) → 도메인 관리 → DNS 설정
5. Vercel이 알려준 값 입력
6. 24시간 내 자동 연결!

---

## 💳 5단계 — 토스 실제 결제 전환

테스트가 완료되면:
1. 토스페이먼츠 대시보드 → **라이브** 탭
2. `live_ck_...` 와 `live_sk_...` 키 발급
3. `.env` 파일의 `test_` 키를 `live_` 키로 교체
4. `index.html` 의 클라이언트 키도 `live_ck_...` 로 교체

---

## 💰 수익 구조

| 항목 | 비용 |
|---|---|
| Vercel 호스팅 | 무료 |
| 도메인 | 연 19,800원 |
| Claude API (1회) | 약 30~70원 |
| 판매가 | 25,000원 |
| **1회 순수익** | **약 24,930원** |

---

## 📞 문의
설치나 배포 중 문제가 생기면 Claude에게 문의하세요!
