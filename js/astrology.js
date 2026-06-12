// 점성술 · 탄생차트
// circular-natal-horoscope-js(공용 라이선스)로 실제 행성 위치를 '계산'하고,
// 그 실제 결과를 표로 보여준 뒤, 원하면 Claude가 해석(재미용)까지 붙인다.
// 계산 라이브러리는 CDN에서 ES 모듈로 동적 로드한다(서버 불필요).
(function () {
  const KEY_STORAGE = "c-tarot-api-key"; // 타로·별자리와 같은 연결 키 공유
  const MODEL = "claude-opus-4-8";
  const LIB_URL = "https://esm.sh/circular-natal-horoscope-js@1.1.0";

  const SIGN_KO = {
    aries: "양자리", taurus: "황소자리", gemini: "쌍둥이자리", cancer: "게자리",
    leo: "사자자리", virgo: "처녀자리", libra: "천칭자리", scorpio: "전갈자리",
    sagittarius: "사수자리", capricorn: "염소자리", aquarius: "물병자리", pisces: "물고기자리"
  };
  const BODY_KO = {
    sun: "태양", moon: "달", mercury: "수성", venus: "금성", mars: "화성",
    jupiter: "목성", saturn: "토성", uranus: "천왕성", neptune: "해왕성", pluto: "명왕성"
  };
  const BODY_EMOJI = {
    sun: "☀️", moon: "🌙", mercury: "☿", venus: "♀", mars: "♂",
    jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇"
  };
  const BODY_ORDER = ["mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];

  const CITIES = [
    { name: "서울", lat: 37.5665, lon: 126.9780 },
    { name: "부산", lat: 35.1796, lon: 129.0756 },
    { name: "인천", lat: 37.4563, lon: 126.7052 },
    { name: "대구", lat: 35.8714, lon: 128.6014 },
    { name: "대전", lat: 36.3504, lon: 127.3845 },
    { name: "광주", lat: 35.1595, lon: 126.8526 },
    { name: "울산", lat: 35.5384, lon: 129.3114 },
    { name: "수원", lat: 37.2636, lon: 127.0286 },
    { name: "제주", lat: 33.4996, lon: 126.5312 },
    { name: "도쿄", lat: 35.6762, lon: 139.6503 },
    { name: "베이징", lat: 39.9042, lon: 116.4074 },
    { name: "뉴욕", lat: 40.7128, lon: -74.0060 },
    { name: "로스앤젤레스", lat: 34.0522, lon: -118.2437 },
    { name: "런던", lat: 51.5074, lon: -0.1278 },
    { name: "파리", lat: 48.8566, lon: 2.3522 }
  ];

  const form = document.getElementById("astro-form");
  const resultEl = document.getElementById("astro-result");
  const citySel = document.getElementById("astro-city");
  const latWrap = document.getElementById("astro-lat-wrap");
  const lonWrap = document.getElementById("astro-lon-wrap");
  const timeInput = document.getElementById("astro-time");
  const noTimeChk = document.getElementById("astro-notime");

  let lastChart = null; // 마지막으로 계산한 정규화 차트
  let libPromise = null;

  // 도시 선택지 채우기
  CITIES.forEach((c, i) => {
    const o = document.createElement("option");
    o.value = String(i); o.textContent = c.name;
    citySel.appendChild(o);
  });
  const etcOpt = document.createElement("option");
  etcOpt.value = "etc"; etcOpt.textContent = "기타 (좌표 직접 입력)";
  citySel.appendChild(etcOpt);

  citySel.addEventListener("change", () => {
    const isEtc = citySel.value === "etc";
    latWrap.hidden = !isEtc;
    lonWrap.hidden = !isEtc;
  });
  noTimeChk.addEventListener("change", () => {
    timeInput.disabled = noTimeChk.checked;
  });

  function esc(t) { const d = document.createElement("div"); d.textContent = (t == null ? "" : String(t)); return d.innerHTML; }
  function signKo(s) { return SIGN_KO[String(s).toLowerCase()] || s; }
  function getKey() { try { return localStorage.getItem(KEY_STORAGE); } catch (e) { return null; } }

  async function loadLib() {
    if (!libPromise) libPromise = import(LIB_URL);
    return libPromise;
  }

  // 라이브러리 결과 → 화면/프롬프트에서 쓰기 쉬운 형태로 정규화
  function normalize(horoscope, meta) {
    const cb = horoscope.CelestialBodies;
    const pick = key => ({
      key: key,
      sign: cb[key] && cb[key].Sign ? cb[key].Sign.label : "",
      house: cb[key] && cb[key].House ? cb[key].House.id : ""
    });
    return {
      sun: pick("sun"),
      moon: pick("moon"),
      asc: { sign: horoscope.Ascendant && horoscope.Ascendant.Sign ? horoscope.Ascendant.Sign.label : "" },
      mc: { sign: horoscope.Midheaven && horoscope.Midheaven.Sign ? horoscope.Midheaven.Sign.label : "" },
      bodies: BODY_ORDER.map(pick),
      meta: meta
    };
  }

  function bigCard(emoji, label, signLabel) {
    return '<div class="natal-card"><span class="nc-emoji">' + emoji + '</span>' +
      '<span class="nc-label">' + label + '</span>' +
      '<span class="nc-sign">' + esc(signKo(signLabel)) + '</span></div>';
  }

  function renderChart(c) {
    lastChart = c;
    const rows = c.bodies.map(b =>
      '<tr><td>' + (BODY_EMOJI[b.key] || "") + ' ' + (BODY_KO[b.key] || b.key) + '</td>' +
      '<td>' + esc(signKo(b.sign)) + '</td>' +
      '<td>' + (b.house !== "" ? esc(b.house) + '하우스' : '-') + '</td></tr>'
    ).join("");

    const noTimeNote = c.meta.noTime
      ? '<p class="natal-note">⚠️ 출생 시각을 모름으로 두어 정오(12:00)로 계산했어요. 상승궁(ASC)과 달 위치는 정확한 시각이 있어야 맞아떨어집니다.</p>'
      : '';

    resultEl.innerHTML =
      '<div class="saju-block">' +
        '<h3>🔭 ' + esc(c.meta.dateStr) + (c.meta.timeStr ? ' ' + esc(c.meta.timeStr) : '') + ' · ' + esc(c.meta.cityName) + '</h3>' +
        '<div class="natal-summary">' +
          bigCard("☀️", "태양 (자아)", c.sun.sign) +
          bigCard("🌙", "달 (내면)", c.moon.sign) +
          bigCard("↑", "상승궁 (첫인상)", c.asc.sign) +
        '</div>' +
        '<table class="natal-table"><thead><tr><th>천체</th><th>별자리</th><th>하우스</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table>' +
        '<p class="natal-note">위 별자리·하우스는 실제 천문 계산 결과예요 (천정 MC: ' + esc(signKo(c.mc.sign)) + ').</p>' +
        noTimeNote +
        '<div id="astro-ai-slot"></div>' +
      '</div>';

    // 이미 받아둔 AI 해석이 있으면 보여주고, 없으면 (1)복사해서 내 AI로, (2)여기서 바로 보기 제공
    let cached = null;
    try { const v = localStorage.getItem(interpCacheKey(c)); if (v) cached = v; } catch (e) {}
    const slot = document.getElementById("astro-ai-slot");
    if (cached) {
      slot.innerHTML = '<div class="ai-divider">— 재미로 보는 AI 해석 —</div><div class="astro-ai">' + esc(cached) + '</div>';
    } else {
      const share = window.EB_sharePrompt ? window.EB_sharePrompt(buildPrompt(c),
        "키 없이 바로! 위 차트는 실제 계산값이라, 아래를 복사해 평소 쓰는 AI(챗GPT·Claude·제미나이 등)에 붙여넣으면 어디서든 해석을 받을 수 있어요.") : '';
      slot.innerHTML = share +
        '<div class="connect-divider">— 또는 여기서 바로 해석 보기 (AI 계정 연결) —</div>' +
        '<button type="button" class="btn-ghost" id="astro-read">🔮 AI 해석 읽기</button>';
      document.getElementById("astro-read").addEventListener("click", () => startInterpret(c));
    }
  }

  function interpCacheKey(c) {
    const m = c.meta;
    return "c-astro-" + m.dateStr + "-" + (m.timeStr || "notime") + "-" + m.lat + "-" + m.lon;
  }

  async function compute(e) {
    e.preventDefault();
    const dateStr = document.getElementById("astro-date").value;
    if (!dateStr) return;

    let lat, lon, cityName;
    if (citySel.value === "etc") {
      lat = parseFloat(document.getElementById("astro-lat").value);
      lon = parseFloat(document.getElementById("astro-lon").value);
      if (isNaN(lat) || isNaN(lon)) {
        resultEl.innerHTML = '<div class="saju-block">위도·경도를 숫자로 입력해 주세요.</div>';
        return;
      }
      cityName = "직접 입력";
    } else {
      const city = CITIES[parseInt(citySel.value, 10)] || CITIES[0];
      lat = city.lat; lon = city.lon; cityName = city.name;
    }

    const noTime = noTimeChk.checked || !timeInput.value;
    const timeStr = noTime ? "" : timeInput.value;
    const [hh, mm] = (timeStr || "12:00").split(":").map(Number);
    const [y, mo, d] = dateStr.split("-").map(Number);

    resultEl.innerHTML = '<div class="saju-block loading-block">실제 행성 위치를 계산하는 중…</div>';
    try {
      const { Origin, Horoscope } = await loadLib();
      const origin = new Origin({
        year: y, month: mo - 1, date: d, hour: hh, minute: mm,
        latitude: lat, longitude: lon
      });
      const horoscope = new Horoscope({
        origin: origin,
        houseSystem: "whole-sign",
        zodiac: "tropical",
        language: "en"
      });
      const c = normalize(horoscope, { dateStr, timeStr, cityName, lat, lon, noTime });
      renderChart(c);
    } catch (err) {
      resultEl.innerHTML = '<div class="saju-block">차트 계산에 필요한 천문 데이터를 불러오지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.</div>';
    }
  }

  function buildPrompt(c) {
    const lines = [];
    lines.push("태양: " + signKo(c.sun.sign) + " " + c.sun.house + "하우스");
    lines.push("달: " + signKo(c.moon.sign) + " " + c.moon.house + "하우스");
    lines.push("상승궁(ASC): " + signKo(c.asc.sign));
    lines.push("천정(MC): " + signKo(c.mc.sign));
    c.bodies.forEach(b => lines.push((BODY_KO[b.key] || b.key) + ": " + signKo(b.sign) + " " + b.house + "하우스"));
    return "다음은 실제 천문 계산으로 뽑은 한 사람의 점성술 탄생차트입니다.\n\n" + lines.join("\n") +
      "\n\n이 배치를 바탕으로 한국어로 풀이해 주세요.\n" +
      "- 성격과 타고난 기질, 강점, 연애·관계 스타일, 일·진로 성향을 각각 2~3문장으로 짚어주세요.\n" +
      "- 태양(자아)·달(내면 감정)·상승궁(첫인상)을 해석의 중심으로 삼고, 다른 행성 배치도 자연스럽게 엮어주세요.\n" +
      "- 마지막에 '한 줄 조언'이라는 말머리로 한 문장 덧붙여주세요.\n" +
      "- 단정적인 예언이 아니라 부드럽게 권하는 재미용 어조로, 번역투 없이 처음부터 자연스러운 한국어로 써주세요.\n" +
      "- 별표(**)나 샵(#) 같은 마크다운 기호 없이 일반 텍스트로만 써주세요.";
  }

  function startInterpret(c) {
    const key = getKey();
    if (!key) { showConnect(c); return; }
    fetchInterpret(c, key);
  }

  async function fetchInterpret(c, key) {
    const slot = document.getElementById("astro-ai-slot");
    slot.innerHTML = '<div class="ai-divider">— 재미로 보는 AI 해석 —</div><div class="astro-ai loading" id="astro-ai-box">탄생차트를 풀이하는 중…</div>';
    const box = document.getElementById("astro-ai-box");
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
          max_tokens: 1500,
          messages: [{ role: "user", content: buildPrompt(c) }]
        })
      });
      if (res.status === 401) {
        try { localStorage.removeItem(KEY_STORAGE); } catch (e) {}
        showConnect(c, "연결 키가 올바르지 않아요. 다시 확인해서 붙여넣어 주세요.");
        return;
      }
      const data = await res.json();
      if (data.type === "error") throw new Error(data.error && data.error.message);
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim();
      try { localStorage.setItem(interpCacheKey(c), text); } catch (e) {}
      box.classList.remove("loading");
      box.textContent = text || "해석을 받지 못했어요. 다시 시도해 주세요.";
    } catch (e) {
      box.classList.remove("loading");
      box.textContent = "해석을 불러오지 못했어요. 인터넷 연결과 연결 키를 확인하고 다시 시도해 주세요.";
    }
  }

  function showConnect(c, message) {
    const slot = document.getElementById("astro-ai-slot");
    const intro = message ? '<p class="connect-msg">' + esc(message) + '</p>' : '';
    slot.innerHTML =
      '<div class="connect-block">' + intro +
        '<p>탄생차트 풀이는 AI가 써드려요. 처음 한 번만 본인 AI 계정에 로그인해 \'연결 키\'를 붙여넣으면, 다음부터는 바로 떠요. 연결 키는 이 기기에만 저장됩니다. (타로·별자리에서 이미 연결했다면 그대로 쓰여요.)</p>' +
        '<div class="connect-form"><input type="password" id="astroKeyInput" placeholder="여기에 연결 키를 붙여넣기"><button class="btn-ghost" id="astroKeySave">연결하고 해석 보기</button></div>' +
        '<p class="connect-note">처음이라면 <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a>에서 무료로 가입·로그인한 뒤 \'API Key(연결 키)\'를 만들어 붙여넣으세요.</p>' +
      '</div>';
    document.getElementById("astroKeySave").addEventListener("click", () => {
      const v = document.getElementById("astroKeyInput").value.trim();
      if (!v) return;
      try { localStorage.setItem(KEY_STORAGE, v); } catch (e) {}
      fetchInterpret(c, v);
    });
  }

  form.addEventListener("submit", compute);

  // 렌더링 검증용 훅(차트 표시 로직만 단독 테스트할 때 사용)
  window.__astroRenderForTest = renderChart;
})();
