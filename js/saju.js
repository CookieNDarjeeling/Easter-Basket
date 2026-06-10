// 미니 사주 기능 (재미로 보는 콘텐츠)
(function () {
  const ZODIAC = [
    { a: "쥐", e: "🐭" }, { a: "소", e: "🐮" }, { a: "호랑이", e: "🐯" },
    { a: "토끼", e: "🐰" }, { a: "용", e: "🐲" }, { a: "뱀", e: "🐍" },
    { a: "말", e: "🐴" }, { a: "양", e: "🐑" }, { a: "원숭이", e: "🐵" },
    { a: "닭", e: "🐔" }, { a: "개", e: "🐶" }, { a: "돼지", e: "🐷" }
  ];

  // 천간 기준 오행 (연도 끝자리)
  const ELEMENTS = {
    wood:  { name: "목(木)", emoji: "🌳", color: "초록", trait: "성장과 의욕이 강하고 추진력이 좋은", lucky: "동쪽" },
    fire:  { name: "화(火)", emoji: "🔥", color: "빨강", trait: "열정적이고 표현력이 뛰어난", lucky: "남쪽" },
    earth: { name: "토(土)", emoji: "⛰️", color: "노랑", trait: "신중하고 포용력이 넓은", lucky: "중앙" },
    metal: { name: "금(金)", emoji: "⚙️", color: "흰색", trait: "원칙적이고 결단력이 있는", lucky: "서쪽" },
    water: { name: "수(水)", emoji: "💧", color: "검정/파랑", trait: "지혜롭고 유연하며 적응력이 좋은", lucky: "북쪽" }
  };

  function elementOf(year) {
    const d = year % 10;
    if (d === 4 || d === 5) return ELEMENTS.wood;
    if (d === 6 || d === 7) return ELEMENTS.fire;
    if (d === 8 || d === 9) return ELEMENTS.earth;
    if (d === 0 || d === 1) return ELEMENTS.metal;
    return ELEMENTS.water; // 2, 3
  }

  // 입력값으로 만드는 결정적 의사난수 (같은 날 같은 결과)
  function seededRand(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return function () {
      h += 0x6D2B79F5;
      let t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const FORTUNES = [
    "작은 행운이 예상치 못한 곳에서 찾아오는 하루입니다.",
    "미뤄둔 일을 시작하기 좋은 기운이 흐릅니다.",
    "주변 사람과의 대화에서 좋은 기회가 생깁니다.",
    "오늘은 무리하지 말고 컨디션 관리에 신경 쓰세요.",
    "직감을 믿고 움직이면 좋은 결과가 따릅니다.",
    "금전운이 무난한 날, 충동구매만 조심하세요.",
    "새로운 인연이나 정보가 들어올 수 있습니다.",
    "차분함을 유지하면 갈등도 자연스럽게 풀립니다."
  ];

  function bar(label, value) {
    return `<div class="luck-row"><span class="label">${label}</span>
      <span class="bar"><span style="width:${value}%"></span></span></div>`;
  }

  function showSaju(e) {
    e.preventDefault();
    const dateStr = document.getElementById("saju-date").value;
    if (!dateStr) return;
    const [y, m, d] = dateStr.split("-").map(Number);

    const zodiac = ZODIAC[((y - 1900) % 12 + 12) % 12];
    const el = elementOf(y);

    const today = "2026-06-10"; // 기준일 (오늘의 운세는 매일 갱신)
    const rand = seededRand(dateStr + "|" + today);
    const total = 50 + Math.floor(rand() * 50);
    const love = 40 + Math.floor(rand() * 60);
    const money = 40 + Math.floor(rand() * 60);
    const work = 40 + Math.floor(rand() * 60);
    const fortune = FORTUNES[Math.floor(rand() * FORTUNES.length)];
    const luckyNum = 1 + Math.floor(rand() * 45);

    const result = document.getElementById("saju-result");
    result.innerHTML = `
      <div class="saju-block">
        <h3>${zodiac.e} ${y}년생 · ${zodiac.a}띠</h3>
        <div class="saju-tags">
          <span class="saju-tag">${el.emoji} 오행: ${el.name}</span>
          <span class="saju-tag">행운의 색: ${el.color}</span>
          <span class="saju-tag">행운의 방향: ${el.lucky}</span>
          <span class="saju-tag">행운의 숫자: ${luckyNum}</span>
        </div>
        <p>${el.trait} 기질을 타고난 <strong>${zodiac.a}띠</strong>예요.</p>
        <div class="luck-bars">
          ${bar("총운", total)}
          ${bar("애정운", love)}
          ${bar("재물운", money)}
          ${bar("직장운", work)}
        </div>
        <p class="result-text">🔮 <strong>오늘의 운세</strong> — ${fortune}</p>
      </div>`;
  }

  document.getElementById("saju-form").addEventListener("submit", showSaju);
})();
