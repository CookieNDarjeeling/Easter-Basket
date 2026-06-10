# 🧺 Easter-Basket

타로 · 사주 · 레크레이션 — 재미있는 것 모음

별도 설치 없이 브라우저에서 바로 즐기는 정적 웹앱입니다.

## ✨ 기능

- 🔮 **타로** — 메이저 아르카나 22장, 한 장 뽑기 / 3장 스프레드(과거·현재·미래), 정·역방향 해석
- 🌙 **미니 사주** — 생년월일로 띠 · 오행 · 행운 정보 · 오늘의 운세 (재미로 보는 용도)
- 🎲 **레크레이션** — 랜덤 당첨자 뽑기, 팀 나누기, 게임 추천, 벌칙 룰렛, 밸런스 게임 질문

## ▶️ 실행 방법

`index.html` 파일을 브라우저로 열기만 하면 됩니다.

```bash
# 또는 로컬 서버로 실행
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

## 📁 구조

```
index.html        진입점 (탭 UI)
css/style.css     스타일
data/content.js   콘텐츠 데이터 (타로 카드, 게임/벌칙/질문 모음)
js/tarot.js       타로 로직
js/saju.js        사주 로직
js/recreation.js  레크레이션 로직
js/main.js        탭 전환
```

## ➕ 콘텐츠 추가

`data/content.js`의 `TAROT_CARDS`, `REC_GAMES`, `REC_PENALTIES`, `REC_QUESTIONS`
배열에 항목을 추가하면 곧바로 반영됩니다.

> 모든 운세·사주 콘텐츠는 재미로 보는 용도입니다 🥚
