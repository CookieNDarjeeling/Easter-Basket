// 미니 사주 기능 — 띠(12지)와 오행(천간) 계산
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

  function showSaju(e) {
    e.preventDefault();
    const dateStr = document.getElementById("saju-date").value;
    if (!dateStr) return;
    const y = Number(dateStr.split("-")[0]);

    const zodiac = ZODIAC[((y - 1900) % 12 + 12) % 12];
    const el = elementOf(y);

    const prompt =
      "제 사주(생년월일 기반)로 성격과 전반적인 운세를 풀이해 주세요.\n\n" +
      "생년월일: " + dateStr + "\n" +
      "띠: " + zodiac.a + "띠\n" +
      "오행: " + el.name + "\n\n" +
      "- 타고난 기질과 강점, 그리고 연애·일·건강의 전반적인 흐름을 부드럽게 권하는 어조로 풀어주세요.\n" +
      "- 단정적인 예언이 아니라 재미로 보는 느낌으로, 자연스러운 한국어로 써주세요.";

    const result = document.getElementById("saju-result");
    result.innerHTML = `
      <div class="saju-block">
        <h3>${zodiac.e} ${y}년생 · ${zodiac.a}띠</h3>
        <div class="saju-tags">
          <span class="saju-tag">${el.emoji} 오행: ${el.name}</span>
          <span class="saju-tag">행운의 색: ${el.color}</span>
          <span class="saju-tag">행운의 방향: ${el.lucky}</span>
        </div>
        <p>${el.trait} 기질을 타고난 <strong>${zodiac.a}띠</strong>예요.</p>
        ${window.EB_sharePrompt ? window.EB_sharePrompt(prompt, "이 사주 결과를 더 자세히 풀이받고 싶다면, 아래 내용을 복사해 평소 쓰는 AI에 붙여넣어 보세요.") : ""}
      </div>`;
  }

  document.getElementById("saju-form").addEventListener("submit", showSaju);
})();
