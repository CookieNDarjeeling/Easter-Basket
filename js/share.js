// 공통 도구: "내 AI에게 해석 맡기기" — 결과로 프롬프트를 만들어 복사해 가도록.
// 연결 키 없이 누구나, 평소 쓰는 AI(챗GPT·Claude·제미나이 등)에 붙여넣어 해석받게 한다.
(function () {
  function esc(t) {
    const d = document.createElement("div");
    d.textContent = (t == null ? "" : String(t));
    return d.innerHTML;
  }

  // 프롬프트 텍스트 → 복사 블록 HTML 문자열
  // introLine: 안내 문구(생략 시 기본 문구)
  window.EB_sharePrompt = function (promptText, introLine) {
    const intro = introLine ||
      "키 없이도 OK! 아래 내용을 복사해 평소 쓰는 AI(챗GPT·Claude·제미나이 등)에 붙여넣으면 해석을 받을 수 있어요.";
    return '<div class="share-block">' +
      '<div class="share-intro">🤖 ' + esc(intro) + '</div>' +
      '<textarea class="share-text" readonly rows="6">' + esc(promptText) + '</textarea>' +
      '<button type="button" class="btn-ghost eb-copy">📋 프롬프트 복사</button>' +
      '</div>';
  };

  // 복사 버튼은 이벤트 위임으로 한 번만 연결 (동적으로 생기는 버튼도 동작)
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".eb-copy");
    if (!btn) return;
    const wrap = btn.closest(".share-block");
    const ta = wrap ? wrap.querySelector(".share-text") : null;
    if (!ta) return;
    const done = function () {
      const orig = "📋 프롬프트 복사";
      btn.textContent = "✓ 복사됐어요! AI에 붙여넣기";
      setTimeout(function () { btn.textContent = orig; }, 2500);
    };
    const fallback = function () {
      try { ta.focus(); ta.select(); document.execCommand("copy"); } catch (e) {}
      done();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ta.value).then(done).catch(fallback);
    } else {
      fallback();
    }
  });
})();
