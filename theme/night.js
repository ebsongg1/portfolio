/* ─────────────────────────────────────────────────────────────
   밤에 읽기 (theme/night.js) — 상세 문서(doc.html)·슬라이드(project.html)가 head에서 싣는 작은 스크립트
   · 포트폴리오 페이지(index.html)의 ☾/☀ 버튼으로 고른 모드(이 브라우저의 localStorage 'pf-mode')를 그대로 따릅니다.
     낮(기본)이면 아무것도 바꾸지 않습니다.
   · 색은 theme/theme.css 맨 아래 html[data-mode="night"] 손잡이(--t-*)에 있습니다.
   · <script ... data-night-button>으로 실으면 머리 막대(.head-nav)에 ☾/☀ 버튼을 답니다(상세 문서).
   · 인쇄(PDF)할 때는 잠깐 낮 모드로 바꿔 흰 종이로 찍고, 끝나면 되돌립니다.
   ⚠ doc.html·project.html은 템플릿 파일이라 /portfolio-update를 하면 이 스크립트를 싣는 한 줄이 사라집니다 — 그때 "밤 모드 다시 붙여 줘" 요청.
   ───────────────────────────────────────────────────────────── */
(function () {
  var root = document.documentElement, KEY = 'pf-mode';
  var me = document.currentScript;
  var wantButton = !!(me && me.hasAttribute('data-night-button'));

  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function isNight() { return root.dataset.mode === 'night'; }
  // 강조색 글자색은 바탕 밝기에 맞춰 계산되므로(assets/common.js applyTheme) 모드를 바꾸면 다시 계산
  function reapply() { try { if (typeof PF !== 'undefined' && PF.applyTheme) PF.applyTheme(); } catch (e) {} }
  function apply(night) {
    if (night) root.dataset.mode = 'night'; else delete root.dataset.mode;
    reapply();
    syncButton();
  }
  function set(night) {
    try { localStorage.setItem(KEY, night ? 'night' : 'day'); } catch (e) {}
    apply(night);
  }

  // 처음 그리기 전에 붙여 깜빡임을 막음
  if (stored() === 'night') root.dataset.mode = 'night';

  // 다른 탭(포트폴리오 페이지)에서 바꾸면 따라감
  window.addEventListener('storage', function (e) { if (e.key === KEY) apply(e.newValue === 'night'); });

  // 인쇄는 흰 종이
  var printedNight = false;
  window.addEventListener('beforeprint', function () { printedNight = isNight(); if (printedNight) { delete root.dataset.mode; reapply(); } });
  window.addEventListener('afterprint', function () { if (printedNight) { root.dataset.mode = 'night'; reapply(); } });

  // ☾/☀ 버튼
  var btn = null;
  function syncButton() {
    if (!btn) return;
    var night = isNight(), label = night ? '밝은 화면으로' : '어두운 화면으로';
    btn.innerHTML = '<span aria-hidden="true">' + (night ? '☀' : '☾') + '</span>';
    btn.setAttribute('aria-label', label); btn.title = label; btn.setAttribute('aria-pressed', night ? 'true' : 'false');
  }
  function mount() {
    if (btn && document.contains(btn)) return true;
    var nav = document.querySelector('.head-nav');
    if (!nav) return false;
    btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'pf-mode-btn';
    btn.addEventListener('click', function () { set(!isNight()); });
    nav.appendChild(btn);
    syncButton();
    return true;
  }
  if (wantButton) {
    var mo = new MutationObserver(function () { mount(); });
    var start = function () { mount(); mo.observe(document.body, { childList: true, subtree: true }); };
    if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  }
  // 페이지가 강조색을 처음 계산한 뒤에도 한 번 더(밤 모드일 때만 필요)
  window.addEventListener('load', function () { if (isNight()) reapply(); });

  window.PFNight = { isNight: isNight, set: set };
})();
