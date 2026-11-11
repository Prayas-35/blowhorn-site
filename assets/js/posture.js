// Trust's Posture preview (layouts/_partials/home/posture.html). The stops
// work without this script (a radio group, CSS shows the readout). This only
// plays a stop's muted loop clip, when it has one: the selected stop's clip,
// while the preview is on screen, never under reduced motion. A clip that
// fails to load or play leaves the still pose in place.
(function () {
  var root = document.querySelector('[data-posture]');
  if (!root || !root.querySelector('.posture-loop')) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var onScreen = false;
  function sync() {
    root.querySelectorAll('.posture-figure').forEach(function (label) {
      var video = label.querySelector('.posture-loop');
      if (!video) return;
      var radio = document.getElementById(label.htmlFor);
      var play = radio && radio.checked && onScreen && !reduce.matches && !video.dataset.failed;
      if (play) {
        if (!video.src) video.src = video.dataset.src;
        video.hidden = false;
        var run = video.play();
        if (run && run.catch) run.catch(fail.bind(null, video));
      } else if (!video.hidden) {
        video.pause();
        video.hidden = true;
        video.currentTime = 0;
      }
      label.classList.toggle('is-playing', !video.hidden);
    });
  }
  function fail(video) { video.dataset.failed = '1'; video.hidden = true; sync(); }
  root.querySelectorAll('.posture-loop').forEach(function (v) { v.addEventListener('error', fail.bind(null, v)); });
  root.addEventListener('change', sync);
  if (reduce.addEventListener) reduce.addEventListener('change', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; sync(); }, { threshold: 0.25 }).observe(root);
  }
})();
