# 🧺 Easter-Basket

타로 · 사주 · 레크레이션 — 재미있는 것 모음

별도 설치 없이 브라우저에서 바로 즐기는 정적 웹앱입니다.

## ✨ 기능

- 🔮 **타로 (C-Tarot)** — 켈틱 크로스 7장 스프레드, 직접 고르기/맡기기, 자리별(현재·방해·과거·최근·조언·미래·결과) 풀이. API 키를 넣으면 Claude AI 종합 해석까지
- 🌙 **미니 사주** — 생년월일로 띠 · 오행 (실제 12지/천간 규칙 기반)
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
tarot.html        C-Tarot 켈틱 크로스 타로 (자체 완결형, iframe으로 삽입)
css/style.css     스타일
data/content.js   콘텐츠 데이터 (게임/벌칙/질문 모음)
js/saju.js        사주 로직
js/recreation.js  레크레이션 로직
js/main.js        탭 전환 + 타로 iframe 높이 맞춤
```

> 🔮 타로의 **AI 종합 해석**은 브라우저에서 Claude API(`api.anthropic.com`)를 직접 호출합니다.
> Claude API 키가 필요하며, 키는 입력한 브라우저(localStorage)에만 저장됩니다.
> 카드 펼치기와 자리별 풀이는 키 없이도 그대로 동작합니다.

## ➕ 콘텐츠 추가

`data/content.js`의 `REC_GAMES`, `REC_PENALTIES`, `REC_QUESTIONS` 배열에 항목을
추가하면 레크레이션에 곧바로 반영됩니다. 타로 카드 의미는 `tarot.html` 안의
`meanings` / `roots` 객체에 들어 있습니다.

> 모든 운세·사주 콘텐츠는 재미로 보는 용도입니다 🥚
