// 타로 기능
(function () {
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function drawCard() {
    const card = pick(TAROT_CARDS);
    const reversed = Math.random() < 0.5;
    return { card, reversed };
  }

  function renderCard(draw, posLabel) {
    const { card, reversed } = draw;
    const keywords = reversed ? card.down : card.up;
    const text = reversed ? card.downText : card.upText;
    return `
      <div class="tarot-card">
        ${posLabel ? `<div class="pos">${posLabel}</div>` : ""}
        <div class="emoji">${card.emoji}</div>
        <div class="name">${card.name}</div>
        <div class="orient">${reversed ? "🔄 역방향" : "⬆️ 정방향"}</div>
        <p class="keywords">${keywords.join(" · ")}</p>
        <p class="meaning">${text}</p>
      </div>`;
  }

  function drawSingle() {
    const result = document.getElementById("tarot-result");
    result.innerHTML = renderCard(drawCard());
  }

  function drawThree() {
    const result = document.getElementById("tarot-result");
    const positions = ["과거", "현재", "미래"];
    // 중복 없는 3장
    const idxs = [];
    while (idxs.length < 3) {
      const i = Math.floor(Math.random() * TAROT_CARDS.length);
      if (!idxs.includes(i)) idxs.push(i);
    }
    const cards = idxs.map((i, k) => {
      const reversed = Math.random() < 0.5;
      return renderCard({ card: TAROT_CARDS[i], reversed }, positions[k]);
    });
    result.innerHTML = `<div class="spread">${cards.join("")}</div>`;
  }

  document.getElementById("tarot-draw").addEventListener("click", drawSingle);
  document.getElementById("tarot-three").addEventListener("click", drawThree);
})();
