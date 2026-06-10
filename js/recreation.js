// 레크레이션 기능
(function () {
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function getNames() {
    return document.getElementById("rec-names").value
      .split("\n").map(s => s.trim()).filter(Boolean);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // 당첨자 뽑기
  document.getElementById("rec-pick").addEventListener("click", function () {
    const names = getNames();
    const box = document.getElementById("rec-pick-result");
    if (names.length === 0) {
      box.innerHTML = `<div class="result-text">이름을 먼저 입력해 주세요!</div>`;
      return;
    }
    box.innerHTML = `<div class="result-pill">🎉 당첨: ${pick(names)}</div>`;
  });

  // 팀 나누기
  document.getElementById("rec-teams").addEventListener("click", function () {
    const names = getNames();
    const box = document.getElementById("rec-pick-result");
    const teamCount = Math.max(2, parseInt(document.getElementById("rec-team-count").value, 10) || 2);
    if (names.length < teamCount) {
      box.innerHTML = `<div class="result-text">인원이 팀 수보다 많아야 해요!</div>`;
      return;
    }
    const shuffled = shuffle(names);
    const teams = Array.from({ length: teamCount }, () => []);
    shuffled.forEach((name, i) => teams[i % teamCount].push(name));
    box.innerHTML = `<div class="team-list">${teams.map((t, i) =>
      `<div class="team"><strong>팀 ${i + 1}</strong> — ${t.join(", ")}</div>`).join("")}</div>`;
  });

  // 게임 추천
  document.getElementById("rec-game").addEventListener("click", function () {
    const g = pick(REC_GAMES);
    document.getElementById("rec-game-result").innerHTML =
      `<div class="result-text"><strong>${g.name}</strong><br>${g.desc}</div>`;
  });

  // 벌칙
  document.getElementById("rec-penalty").addEventListener("click", function () {
    document.getElementById("rec-penalty-result").innerHTML =
      `<div class="result-pill">😈 ${pick(REC_PENALTIES)}</div>`;
  });

  // 질문 / 밸런스 게임
  document.getElementById("rec-question").addEventListener("click", function () {
    document.getElementById("rec-question-result").innerHTML =
      `<div class="result-text">💬 ${pick(REC_QUESTIONS)}</div>`;
  });
})();
