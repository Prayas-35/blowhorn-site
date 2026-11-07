/* Platform product pages (layouts/platform-page.html, docs/platform-pages.md).

   Without this file the page is complete: every activity type's intent is listed,
   the local stage shows its three scenes stacked as text (its diagram and replay
   button stay hidden), the action matrix is a plain table and the setups rail is a
   native scroll area. With it (.is-enhanced on the page):

   - The activity type radios ([data-pp-choice]) swap every [data-pp-for] element
     (the intent and the Activities illustration) and mark the matrix rows bound to
     the type ([data-pp-row]); no row is hidden. The change is announced in
     [data-pp-announce].
   - The local stage ([data-pp-local]) shows one scene at a time. Its scene radios
     ([data-pp-scene-choice]) hide the other text panels ([data-pp-scene-panel]) and
     set data-scene on the stage, which the CSS reads to draw that scene's diagram.
     Each change plays the diagram once (a class restarted by the script, never a
     loop) and announces the scene in [data-pp-stage-announce], once, from the user's
     own choice. The replay button ([data-pp-replay]) plays the diagram again.
     data-pp-run counts the plays, so the page's state is checkable without motion.
   - The rail ([data-pp-rail]) gets previous and next buttons that page it by hand,
     never on a timer, and a count of the items in view (plain text; only a
     button press is announced, once, in [data-pp-rail-announce]). The buttons use
     aria-disabled, never disabled, so a focused button keeps focus at either end.

   The script makes no request, reads no storage or cookie, talks to no extension
   and inspects no browser session: the stage is an illustration of how the
   extension works, never a live view of anything. No library and no request to
   another host. Motion is CSS; under reduced motion nothing here scrolls smoothly
   and the diagram does not move. Tested through platform_page_harness.js by
   check_platform_pages.py (make check-platform-pages) and test_platform_pages.py. */
(function () {
  "use strict";

  function all(root, sel) {
    return Array.prototype.slice.call(root.querySelectorAll(sel));
  }

  function reduced() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function enhance(root) {
    var choices = all(root, "[data-pp-choice]");
    if (!choices.length) return;
    var announce = root.querySelector("[data-pp-announce]");

    function intentOf(id) {
      var text = "";
      all(root, "[data-pp-intent]").forEach(function (el) {
        if (el.getAttribute("data-pp-for") === id) text = el.textContent;
      });
      return text;
    }

    function select(id, say) {
      var known = choices.some(function (input) { return input.value === id; });
      if (!known) return;
      root.setAttribute("data-pp-type", id);
      choices.forEach(function (input) { input.checked = input.value === id; });
      all(root, "[data-pp-for]").forEach(function (el) {
        el.hidden = el.getAttribute("data-pp-for") !== id;
      });
      all(root, "[data-pp-row]").forEach(function (el) {
        el.classList.toggle("is-picked", el.getAttribute("data-pp-row") === id);
      });
      if (announce && say) announce.textContent = say;
    }

    /* Selecting a different radio (pointer, arrow keys or assistive technology)
       fires change. Clicking the radio that is already checked fires no change
       and needs nothing: the page already shows that type. */
    choices.forEach(function (input) {
      input.addEventListener("change", function () {
        if (!input.checked) return;
        select(input.value, intentOf(input.value));
      });
    });

    var initial = "";
    choices.forEach(function (input) { if (input.checked) initial = input.value; });
    select(initial || choices[0].value, "");
    root.classList.add("is-enhanced");
  }

  function enhanceLocal(root) {
    var box = root.querySelector("[data-pp-local]");
    if (!box) return;
    var choices = all(box, "[data-pp-scene-choice]");
    if (!choices.length) return;
    var announce = box.querySelector("[data-pp-stage-announce]");
    var replay = box.querySelector("[data-pp-replay]");
    var runs = 0;

    /* Restarting the diagram: drop the class, force a layout, add it back. The
       animation is declared under .is-playing and runs once. */
    function play() {
      runs += 1;
      box.setAttribute("data-pp-run", String(runs));
      box.classList.remove("is-playing");
      void box.offsetWidth;
      box.classList.add("is-playing");
    }

    function show(id) {
      var known = choices.some(function (input) { return input.value === id; });
      if (!known) return;
      box.setAttribute("data-scene", id);
      choices.forEach(function (input) { input.checked = input.value === id; });
      all(box, "[data-pp-scene-panel]").forEach(function (el) {
        el.hidden = el.getAttribute("data-pp-scene-panel") !== id;
      });
      play();
    }

    /* Only a scene the visitor picks is announced, once, by its title. The
       replay button and the first scene at load say nothing. */
    choices.forEach(function (input) {
      input.addEventListener("change", function () {
        if (!input.checked) return;
        show(input.value);
        if (announce) announce.textContent = (input.getAttribute("data-title") || "") + " is showing.";
      });
    });

    if (replay) {
      replay.addEventListener("click", function () { play(); });
    }

    var initial = "";
    choices.forEach(function (input) { if (input.checked) initial = input.value; });
    show(initial || choices[0].value);
    box.classList.add("is-enhanced");
  }

  function enhanceRail(root) {
    var rail = root.querySelector("[data-pp-rail]");
    var controls = root.querySelector("[data-pp-rail-controls]");
    var prev = root.querySelector("[data-pp-prev]");
    var next = root.querySelector("[data-pp-next]");
    var count = root.querySelector("[data-pp-rail-count]");
    var announce = root.querySelector("[data-pp-rail-announce]");
    if (!rail || !controls || !prev || !next) return;
    var slides = all(rail, "[data-pp-slide]");
    if (slides.length < 2) return;

    function origin() { return slides[0].offsetLeft; }

    /* A slide is in view when at least 60% of it is inside the scroller. */
    function inView(at) {
      var left = at === undefined ? rail.scrollLeft : at;
      var right = left + rail.clientWidth;
      var first = -1;
      var last = -1;
      slides.forEach(function (slide, i) {
        var start = slide.offsetLeft - origin();
        var end = start + slide.offsetWidth;
        var seen = Math.min(end, right) - Math.max(start, left);
        if (seen >= slide.offsetWidth * 0.6) {
          if (first < 0) first = i;
          last = i;
        }
      });
      if (first < 0) { first = 0; last = 0; }
      return { first: first, last: last };
    }

    function atStart() { return rail.scrollLeft <= 1; }
    function atEnd() { return rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1; }

    function describe(v) {
      return (v.first === v.last ? String(v.first + 1) : (v.first + 1) + "-" + (v.last + 1)) + " of " + slides.length;
    }

    /* The count is plain text, kept current as the rail scrolls by any means. It
       is not a live region: a swipe would otherwise announce every frame. */
    function update() {
      var fits = rail.scrollWidth <= rail.clientWidth + 1;
      controls.hidden = fits;
      if (count) count.textContent = describe(inView());
      prev.setAttribute("aria-disabled", atStart() ? "true" : "false");
      next.setAttribute("aria-disabled", atEnd() ? "true" : "false");
    }

    /* A button press scrolls to a known place, so the new range is announced
       once, from where the rail will land, not from its scroll events. */
    function go(index) {
      var i = Math.max(0, Math.min(slides.length - 1, index));
      var max = Math.max(0, rail.scrollWidth - rail.clientWidth);
      var left = Math.min(max, slides[i].offsetLeft - origin());
      if (announce) announce.textContent = "Showing " + describe(inView(left));
      rail.scrollTo({ left: left, behavior: reduced() ? "auto" : "smooth" });
    }

    prev.addEventListener("click", function () {
      if (prev.getAttribute("aria-disabled") === "true") return;
      var v = inView();
      go(v.first - (v.last - v.first + 1));
    });
    next.addEventListener("click", function () {
      if (next.getAttribute("aria-disabled") === "true") return;
      go(inView().last + 1);
    });

    var pending = false;
    function schedule() {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(function () {
        pending = false;
        update();
      });
    }
    rail.addEventListener("scroll", schedule);
    window.addEventListener("resize", schedule);
    update();
  }

  function init() {
    all(document, "[data-platform-page]").forEach(function (root) {
      enhance(root);
      enhanceLocal(root);
      enhanceRail(root);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
