// 별자리 운세 — AI(Claude)가 오늘 날짜 기준으로 새로 작성
// 타로와 같은 '연결 키'(localStorage)를 재사용한다.
(function () {
  const KEY_STORAGE = "c-tarot-api-key"; // 타로에서 연결한 키를 그대로 공유
  const MODEL = "claude-opus-4-8";

  const SIGNS = [
    { id: "aries",       name: "양자리",   emoji: "♈", date: "3.21–4.19" },
    { id: "taurus",      name: "황소자리", emoji: "♉", date: "4.20–5.20" },
    { id: "gemini",      name: "쌍둥이자리", emoji: "♊", date: "5.21–6.21" },
    { id: "cancer",      name: "게자리",   emoji: "♋", date: "6.22–7.22" },
    { id: "leo",         name: "사자자리", emoji: "♌", date: "7.23–8.22" },
    { id: "virgo",       name: "처녀자리", emoji: "♍", date: "8.23–9.22" },
    { id: "libra",       name: "천칭자리", emoji: "♎", date: "9.23–10.22" },
    { id: "scorpio",     name: "전갈자리", emoji: "♏", date: "10.23–11.22" },
    { id: "sagittarius", name: "사수자리", emoji: "♐", date: "11.23–12.21" },
    { id: "capricorn",   name: "염소자리", emoji: "♑", date: "12.22–1.19" },
    { id: "aquarius",    name: "물병자리", emoji: "♒", date: "1.20–2.18" },
    { id: "pisces",      name: "물고기자리", emoji: "♓", date: "2.19–3.20" }
  ];

  // 구조화된 출력 스키마 (JSON으로 안정적으로 받기)
  const SCHEMA = {
    type: "object",
    properties: {
      overall: { type: "string" },
      love: { type: "string" },
      money: { type: "string" },
      advice: { type: "string" },
      score: { type: "integer" },
      lucky_color: { type: "string" },
      lucky_number: { type: "integer" }
    },
    required: ["overall", "love", "money", "advice", "score", "lucky_color", "lucky_number"],
    additionalProperties: false
  };

  const grid = document.getElementById("zodiac-grid");
  const resultEl = document.getElementById("horoscope-result");

  // 별자리 버튼 생성
  SIGNS.forEach(s => {
    const b = document.createElement("button");
    b.className = "zodiac-btn";
    b.dataset.id = s.id;
    b.innerHTML = '<span class="z-emoji">' + s.emoji + '</span>' +
      '<span class="z-name">' + s.name + '</span>' +
      '<span class="z-date">' + s.date + '</span>';
    b.addEventListener("click", () => selectSign(s));
    grid.appendChild(b);
  });

  function todayStr() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function getKey() { try { return localStorage.getItem(KEY_STORAGE); } catch (e) { return null; } }
  function cacheKeyFor(s) { return "c-horoscope-" + todayStr() + "-" + s.id; }
  function esc(t) { const d = document.createElement("div"); d.textContent = (t == null ? "" : String(t)); return d.innerHTML; }

  function selectSign(s) {
    document.querySelectorAll(".zodiac-btn").forEach(btn => btn.classList.toggle("is-active", btn.dataset.id === s.id));

    // 오늘 같은 별자리는 이미 받은 운세를 그대로 보여줌 (하루 동안 고정)
    try {
      const v = localStorage.getItem(cacheKeyFor(s));
      if (v) { renderResult(s, JSON.parse(v)); return; }
    } catch (e) {}

    const key = getKey();
    if (!key) { showConnect(s); return; }
    fetchHoroscope(s, key);
  }

  function bar(label, value) {
    return '<div class="score-row"><span class="label">' + label + '</span>' +
      '<span class="bar"><span style="width:' + value + '%"></span></span></div>';
  }

  function renderResult(s, data) {
    const score = Math.max(0, Math.min(100, parseInt(data.score, 10) || 50));
    resultEl.innerHTML =
      '<div class="saju-block">' +
        '<h3>' + s.emoji + ' ' + s.name + ' · 오늘의 운세</h3>' +
        '<div class="saju-tags">' +
          '<span class="saju-tag">🎨 행운의 색: ' + esc(data.lucky_color) + '</span>' +
          '<span class="saju-tag">🔢 행운의 숫자: ' + (data.lucky_number != null ? esc(data.lucky_number) : '-') + '</span>' +
        '</div>' +
        '<div class="score-bars">' + bar("총운", score) + '</div>' +
        '<p class="result-text">🌟 <strong>총운</strong> — ' + esc(data.overall) + '</p>' +
        '<p class="result-text">💗 <strong>애정운</strong> — ' + esc(data.love) + '</p>' +
        '<p class="result-text">💰 <strong>금전운</strong> — ' + esc(data.money) + '</p>' +
        '<p class="result-text">🧭 <strong>오늘의 조언</strong> — ' + esc(data.advice) + '</p>' +
      '</div>';
  }

  function buildPrompt(s) {
    return "오늘은 " + todayStr() + "입니다. 별자리 '" + s.name + "'(" + s.date + ")의 오늘 하루 운세를 한국어로 써주세요.\n" +
      "- overall(총운), love(애정운), money(금전운)은 각각 2~3문장으로, 따뜻하고 구체적인 조언처럼 써주세요.\n" +
      "- advice(오늘의 조언)는 오늘 실천할 수 있는 제안을 한 문장으로 담아주세요.\n" +
      "- score는 오늘 총운을 1~100 사이 정수로 표현해주세요.\n" +
      "- lucky_color는 한국어 색 이름(예: 코랄빛 분홍), lucky_number는 1~99 사이 정수로 정해주세요.\n" +
      "- 재미로 보는 콘텐츠이니 단정적인 예언보다 부드럽게 권하는 어조로 써주세요.\n" +
      "- 번역투 없이 처음부터 자연스러운 한국어로 써주세요.";
  }

  async function fetchHoroscope(s, key) {
    resultEl.innerHTML = '<div class="saju-block loading-block">' + s.emoji + ' ' + s.name + '의 오늘 운세를 불러오는 중…</div>';
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1200,
          messages: [{ role: "user", content: buildPrompt(s) }],
          output_config: { format: { type: "json_schema", schema: SCHEMA } }
        })
      });
      if (res.status === 401) {
        try { localStorage.removeItem(KEY_STORAGE); } catch (e) {}
        showConnect(s, "연결 키가 올바르지 않아요. 다시 확인해서 붙여넣어 주세요.");
        return;
      }
      const data = await res.json();
      if (data.type === "error") throw new Error(data.error && data.error.message);
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("").trim();
      const parsed = JSON.parse(text);
      try { localStorage.setItem(cacheKeyFor(s), JSON.stringify(parsed)); } catch (e) {}
      renderResult(s, parsed);
    } catch (e) {
      resultEl.innerHTML = '<div class="saju-block">오늘 운세를 불러오지 못했어요. 인터넷 연결과 연결 키를 확인하고 다시 시도해 주세요.</div>';
    }
  }

  function showConnect(s, message) {
    const intro = message ? '<p class="connect-msg">' + esc(message) + '</p>' : '';
    resultEl.innerHTML =
      '<div class="saju-block connect-block">' + intro +
        '<p>오늘의 별자리 운세는 AI가 새로 써드려요. 처음 한 번만 본인 AI 계정에 로그인해 \'연결 키\'를 붙여넣으면, 다음부터는 별자리를 고르는 즉시 바로 떠요. 연결 키는 이 기기에만 저장됩니다.</p>' +
        '<div class="connect-form"><input type="password" id="horoKeyInput" placeholder="여기에 연결 키를 붙여넣기"><button class="btn-ghost" id="horoKeySave">연결하고 운세 보기</button></div>' +
        '<p class="connect-note">처음이라면 <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a>에서 무료로 가입·로그인한 뒤 \'API Key(연결 키)\'를 만들어 붙여넣으세요. 타로에서 이미 연결했다면 그대로 쓰여요.</p>' +
      '</div>';
    document.getElementById("horoKeySave").addEventListener("click", () => {
      const v = document.getElementById("horoKeyInput").value.trim();
      if (!v) return;
      try { localStorage.setItem(KEY_STORAGE, v); } catch (e) {}
      fetchHoroscope(s, v);
    });
  }
})();
