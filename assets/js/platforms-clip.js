// The platforms clip (layouts/_partials/home/platforms-clip.html, data/
// integrations.json clip). Two copies, one per OS theme; only the visible one
// ever intersects. Once about half of it is in view it plays from the start;
// when it drops below that it pauses, so a visitor never arrives mid-loop.
// Pause motion stops it until pressed again. Under prefers-reduced-motion, or
// without IntersectionObserver, nothing autoplays: the poster and native
// controls stay.
(function () {
  var fig = document.querySelector('[data-plat-clip]');
  if (!fig) return;
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (reduce || !('IntersectionObserver' in window)) return;
  var videos = fig.querySelectorAll('video');
  var btn = fig.querySelector('[data-plat-clip-pause]');
  var held = false;
  var inView = [];

  function start(v) {
    v.currentTime = 0;
    var p = v.play();
    if (p && p.catch) p.catch(function () { v.controls = true; });
  }

  Array.prototype.forEach.call(videos, function (v) {
    v.controls = false;
    v.muted = true;
  });
  btn.hidden = false;
  btn.addEventListener('click', function () {
    held = !held;
    btn.setAttribute('aria-pressed', held ? 'true' : 'false');
    btn.textContent = held ? 'Play motion' : 'Pause motion';
    Array.prototype.forEach.call(videos, function (v) {
      if (held) v.pause();
      else if (inView.indexOf(v) !== -1) v.play();
    });
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target, i = inView.indexOf(v);
      if (e.isIntersecting && e.intersectionRatio >= 0.5) {
        if (i === -1) {
          inView.push(v);
          if (!held) start(v);
        }
      } else if (i !== -1) {
        inView.splice(i, 1);
        v.pause();
      }
    });
  }, { threshold: [0, 0.5] });
  Array.prototype.forEach.call(videos, function (v) { io.observe(v); });
})();
