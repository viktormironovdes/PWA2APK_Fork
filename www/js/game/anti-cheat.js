// simple-anti-cheat.js

const AntiCheat = (() => {
  let lastClick = 0;
  const clickTimes = [];

  function report(reason) {
    alert("cheating detected: " + reason);
  }

  // Auto-click detection
  function handleClick() {
    const now = Date.now();
    if (lastClick) {
      const diff = now - lastClick;
      clickTimes.push(diff);
      if (clickTimes.length > 20) clickTimes.shift();

      const mean = clickTimes.reduce((a,b)=>a+b,0)/clickTimes.length;
      if (mean < 120) report("auto-clicking detected");
    }
    lastClick = now;
  }

  // Script injection detection
  function observeScripts() {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.tagName === "SCRIPT") {
            if (!node.dataset.uccexempt) report("script injected");
          }
        }
      }
    });
    observer.observe(document, {childList: true, subtree: true});
  }

  function init(clickButtonSelector) {
    if (clickButtonSelector) {
      const btn = document.querySelector(clickButtonSelector);
      if (btn) btn.addEventListener("clicker", handleClick);
    } else {
      document.addEventListener("clicker", handleClick);
    }
    observeScripts();
  }

  return { init };
})();