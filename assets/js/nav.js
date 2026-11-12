// Site header menus (layouts/_partials/header.html). Each group is a
// disclosure: a button with aria-expanded that shows its panel. Click, Enter or
// Space toggles; Escape closes and returns focus; leaving the group with Tab or
// a click elsewhere closes it, and Tab never opens one. A mouse may also open a
// group by hovering; the first click on a hover-opened group keeps it open.
// Moving to a sibling group by hover or click swaps the open panel in one step. Below
// 1080px the Menu button opens the whole nav as a sheet and groups expand in
// place. Without this script the CSS opens panels on hover and focus instead.
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;
  var nav = header.querySelector('.site-nav');
  var toggle = header.querySelector('.mm-toggle');
  var items = Array.prototype.slice.call(header.querySelectorAll('.mm-item'));
  var groups = items.filter(function (li) { return li.querySelector('.mm-trigger'); });
  var wide = window.matchMedia('(min-width: 1080px)');
  var hover = window.matchMedia('(hover: hover) and (pointer: fine)');
  var openTimer = null, closeTimer = null;
  // The group under the latest pointer press (focus moves on press, before the
  // click), the open group that focus left for it, and the group a hover opened.
  var pressed = null, leftFor = null, hovered = null;

  header.classList.add('is-enhanced');
  if (toggle) toggle.hidden = false;

  function trig(li) { return li.querySelector('.mm-trigger'); }
  function setOpen(li, open) {
    var t = trig(li);
    t.setAttribute('aria-expanded', open ? 'true' : 'false');
    li.classList.toggle('is-open', open);
    if (!open && hovered === li) hovered = null;
    // The swap mark lives only while some panel is open, so a cold open animates
    // and a later sibling swap never replays the enter animation.
    if (!groups.some(isOpen)) header.classList.remove('is-mm-swap');
  }
  function closeAll(except) {
    groups.forEach(function (li) { if (li !== except) setOpen(li, false); });
  }
  function isOpen(li) { return trig(li).getAttribute('aria-expanded') === 'true'; }
  // Moving between sibling groups is one continuous surface. Close the others
  // and open the target in the same synchronous turn, so the browser never
  // paints a zero-open frame nor two panels at once (the ghost overlap). The
  // swap mark tells the CSS to skip the enter animation, so opacity never
  // drops to 0.
  function switchTo(li) {
    var swap = groups.some(function (g) { return g !== li && isOpen(g); });
    closeAll(li);
    setOpen(li, true);
    if (swap) header.classList.add('is-mm-swap');
  }
  function hoverOpen(li) {
    switchTo(li);
    hovered = li;
  }
  // The sheet fills the screen below the header. Anything above the header
  // (the announcement bar, until it scrolls away) moves its bottom edge, so
  // measure it while the sheet is open instead of assuming --header-h.
  var sheetFrame = 0;
  function fitSheet() {
    sheetFrame = 0;
    header.style.setProperty('--sheet-top', Math.max(0, Math.round(header.getBoundingClientRect().bottom)) + 'px');
  }
  function onSheetScroll() {
    if (!sheetFrame) sheetFrame = window.requestAnimationFrame(fitSheet);
  }
  function setSheet(open) {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    header.classList.toggle('is-menu-open', open);
    if (open) {
      fitSheet();
      window.addEventListener('scroll', onSheetScroll, { passive: true });
    } else {
      window.removeEventListener('scroll', onSheetScroll);
      closeAll();
    }
  }

  groups.forEach(function (li) {
    var t = trig(li);
    t.addEventListener('click', function () {
      pressed = leftFor = null;
      clearTimeout(openTimer);
      if (hovered === li) { hovered = null; return; }
      var open = !isOpen(li);
      if (open && wide.matches) switchTo(li);
      else setOpen(li, open);
    });
    li.addEventListener('pointerdown', function () { pressed = li; });
    li.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse' || !wide.matches || !hover.matches) return;
      clearTimeout(closeTimer);
      clearTimeout(openTimer);
      if (isOpen(li)) return;
      // Sibling swaps are immediate; only a cold open waits.
      if (groups.some(function (g) { return g !== li && isOpen(g); })) { hoverOpen(li); return; }
      openTimer = setTimeout(function () { hoverOpen(li); }, 90);
    });
    li.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse' || !wide.matches || !hover.matches) return;
      clearTimeout(openTimer);
      closeTimer = setTimeout(function () { setOpen(li, false); }, 220);
    });
    li.addEventListener('focusout', function (e) {
      if (!wide.matches || li.contains(e.relatedTarget)) return;
      // A press on a sibling trigger moves focus first; its click does the swap.
      if (pressed && pressed !== li && pressed.contains(e.relatedTarget)) { leftFor = li; return; }
      setOpen(li, false);
    });
  });

  // A press that ends off its trigger never clicks, so the group focus left
  // for it closes as a plain focusout would have.
  function endPress(e) {
    if (!pressed || (e.type === 'pointerup' && pressed.contains(e.target))) return;
    if (leftFor) setOpen(leftFor, false);
    pressed = leftFor = null;
  }
  document.addEventListener('pointerup', endPress);
  document.addEventListener('pointercancel', endPress);

  if (toggle) {
    toggle.addEventListener('click', function () {
      setSheet(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  document.addEventListener('keydown', function (e) {
    pressed = leftFor = null;
    if (e.key !== 'Escape') return;
    var open = groups.filter(isOpen)[0];
    if (open) { setOpen(open, false); trig(open).focus(); return; }
    if (toggle && toggle.getAttribute('aria-expanded') === 'true') { setSheet(false); toggle.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (header.contains(e.target)) {
      // Following a link inside a panel or the sheet (an in-page anchor too) closes the menu.
      if (e.target.closest('.site-nav a')) { closeAll(); setSheet(false); }
      return;
    }
    closeAll();
    setSheet(false);
  });
  var onChange = function () { closeAll(); setSheet(false); };
  if (wide.addEventListener) wide.addEventListener('change', onChange); else wide.addListener(onChange);
})();
