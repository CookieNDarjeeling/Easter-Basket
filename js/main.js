// 탭 전환 + 타로 iframe 높이 맞추기
(function () {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".panel");
  const tarotFrame = document.getElementById("tarot-frame");

  // 같은 출처(same-origin)라 내부 문서 높이를 읽어 iframe을 내용에 맞게 늘림
  function resizeTarotFrame() {
    try {
      const doc = tarotFrame.contentDocument;
      if (!doc || !doc.body) return;
      // tarot.html은 html/body가 height:100%라 body.scrollHeight가 실제 내용 높이
      const h = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);
      if (h > 0) tarotFrame.style.height = h + "px";
    } catch (e) { /* file:// 등 접근이 막힌 환경이면 CSS min-height로 동작 */ }
  }

  function setupTarotFrame() {
    resizeTarotFrame();
    try {
      const doc = tarotFrame.contentDocument;
      const ro = new ResizeObserver(resizeTarotFrame);
      // body는 height:100%로 고정이라 실제로 자라는 내부 요소(main.frame)를 관찰
      ro.observe(doc.querySelector("main") || doc.body);
    } catch (e) {}
  }

  if (tarotFrame) {
    tarotFrame.addEventListener("load", setupTarotFrame);
    // 이 스크립트보다 iframe이 먼저 로드된 경우에도 동작하도록
    try {
      if (tarotFrame.contentDocument && tarotFrame.contentDocument.readyState === "complete") {
        setupTarotFrame();
      }
    } catch (e) {}
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", function () {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.toggle("is-active", t === tab));
      panels.forEach(p => p.classList.toggle("is-active", p.id === target));
      // 숨겨진 상태에서는 높이가 0으로 측정되므로 탭이 보일 때 다시 계산
      if (target === "tarot") resizeTarotFrame();
    });
  });
})();
