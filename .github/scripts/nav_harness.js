#!/usr/bin/env node
/* Run assets/js/nav.js against a tiny fake DOM with a fake clock and report
   which header menu groups are open after every step. Used by test_nav.py, so
   the test checks what the script does, not what its source text says.

   Usage: node nav_harness.js SCRIPT '<json scenario>'
   Scenario: { "groups": ["product", "platforms", ...],   (default: three groups)
               "wide": true, "hover": true,
               "steps": [ {"do": "enter", "id": "product"}, {"do": "leave", "id": ...},
                          {"do": "wait", "ms": 100}, {"do": "click", "id": ...},
                          {"do": "focus", "id": ...}, {"do": "escape"},
                          {"do": "outside"}, {"do": "link"} ] }
   "focus" is a Tab onto a group's trigger: a Tab keydown, then focusout on the
   group that has focus (relatedTarget set) and focusin on the new one, as a
   browser fires them. "click" is a press on a trigger: pointerdown, the same
   focus move (unless "nofocus": true, as Safari does), then click.
   Prints: { "openIds": [...], "openCount": n, "swap": bool, "samples": [...] }
   A sample is { "after": step, "openCount", "mismatch", "swap" }, taken after
   each step and after every timer callback that fires during a wait; openCount
   is the larger of the .is-open groups and the aria-expanded=true triggers, and
   mismatch is true when those two disagree. */
"use strict";
const fs = require("fs");
const vm = require("vm");

class ClassList {
  constructor() { this.set = new Set(); }
  add(c) { this.set.add(c); }
  remove(c) { this.set.delete(c); }
  contains(c) { return this.set.has(c); }
  toggle(c, force) {
    const on = force === undefined ? !this.set.has(c) : !!force;
    if (on) this.set.add(c); else this.set.delete(c);
    return on;
  }
}

class El {
  constructor(tag, classes, attrs) {
    this.tag = tag;
    this.attrs = Object.assign({}, attrs || {});
    this.classList = new ClassList();
    (classes || []).forEach((c) => this.classList.add(c));
    this.children = [];
    this.parent = null;
    this.listeners = {};
    this.hidden = false;
    this.style = { setProperty() {} };
  }
  append(child) { child.parent = this; this.children.push(child); return child; }
  getAttribute(n) { return Object.prototype.hasOwnProperty.call(this.attrs, n) ? this.attrs[n] : null; }
  setAttribute(n, v) { this.attrs[n] = String(v); }
  addEventListener(t, fn) { (this.listeners[t] = this.listeners[t] || []).push(fn); }
  dispatch(t, extra) {
    const ev = Object.assign({ preventDefault() {} }, extra || {});
    (this.listeners[t] || []).forEach((fn) => fn(ev));
  }
  focus() {}
  getBoundingClientRect() { return { bottom: 64 }; }
  contains(other) {
    for (let n = other; n; n = n.parent) if (n === this) return true;
    return false;
  }
  closest(sel) {
    for (let n = this; n; n = n.parent) if (n.matches(sel)) return n;
    return null;
  }
  // Selectors nav.js uses: ".class", "tag" and ".class tag" (descendant).
  matches(sel) {
    const m = /^\.([a-z-]+) ([a-z]+)$/.exec(sel);
    if (m) return this.tag === m[2] && !!(this.parent && this.parent.closest("." + m[1]));
    if (/^\.[a-z-]+$/.test(sel)) return this.classList.contains(sel.slice(1));
    if (/^[a-z]+$/.test(sel)) return this.tag === sel;
    throw new Error("harness: unsupported selector " + sel);
  }
  descendants() {
    const out = [];
    this.children.forEach((c) => { out.push(c); out.push(...c.descendants()); });
    return out;
  }
  querySelectorAll(sel) { return this.descendants().filter((n) => n.matches(sel)); }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
}

const [, , scriptPath, scenarioJson] = process.argv;
const scenario = JSON.parse(scenarioJson || "{}");
const ids = scenario.groups || ["product", "platforms", "resources"];

// The header: Menu button, then the nav with one plain link and the groups.
const header = new El("header", ["site-header"]);
const toggle = header.append(new El("button", ["mm-toggle"], { "aria-expanded": "false" }));
toggle.hidden = true;
const nav = header.append(new El("ul", ["site-nav"]));
const plain = nav.append(new El("li", ["mm-item"]));
plain.append(new El("a", ["mm-top"], { href: "/pricing/" }));
const group = {};
ids.forEach((id) => {
  const li = nav.append(new El("li", ["mm-item"]));
  const trigger = li.append(new El("button", ["mm-trigger"], { "aria-expanded": "false" }));
  const panel = li.append(new El("div", ["mm-panel"]));
  panel.append(new El("a", [], { href: "/" + id + "/" }));
  group[id] = { li, trigger };
});
const outside = new El("main", []);

// Fake clock: timers run only when a "wait" step advances it.
let now = 0, seq = 0;
const timers = new Map();
const samples = [];
const setTimeoutFake = (fn, ms) => { const id = ++seq; timers.set(id, { at: now + (ms || 0), fn, id }); return id; };
const clearTimeoutFake = (id) => { timers.delete(id); };

function sample(after) {
  const all = Object.values(group);
  const byClass = all.filter((g) => g.li.classList.contains("is-open")).length;
  const byAria = all.filter((g) => g.trigger.getAttribute("aria-expanded") === "true").length;
  samples.push({
    after,
    openCount: Math.max(byClass, byAria),
    mismatch: byClass !== byAria,
    swap: header.classList.contains("is-mm-swap"),
  });
}

function advance(ms, label) {
  const end = now + ms;
  for (;;) {
    const due = [...timers.values()].filter((t) => t.at <= end).sort((a, b) => a.at - b.at || a.id - b.id)[0];
    if (!due) break;
    timers.delete(due.id);
    now = Math.max(now, due.at);
    due.fn();
    sample(label + ":timer");
  }
  now = end;
}

const wide = scenario.wide !== false, hover = scenario.hover !== false;
const mq = (matches) => ({ matches, addEventListener() {}, addListener() {} });
const documentListeners = {};
const sandbox = {
  setTimeout: setTimeoutFake,
  clearTimeout: clearTimeoutFake,
  document: {
    querySelector: (sel) => (sel === ".site-header" ? header : null),
    addEventListener: (t, fn) => { (documentListeners[t] = documentListeners[t] || []).push(fn); },
  },
  window: {
    matchMedia: (q) => mq(q.indexOf("min-width") >= 0 ? wide : hover),
    addEventListener() {},
    removeEventListener() {},
    requestAnimationFrame: (fn) => { fn(); return 1; },
  },
};
vm.runInNewContext(fs.readFileSync(scriptPath, "utf8"), sandbox, { filename: scriptPath });
const fire = (t, ev) => (documentListeners[t] || []).forEach((fn) => fn(ev));

let focused = null;
function moveFocus(g, label) {
  if (focused && focused !== g) {
    focused.li.dispatch("focusout", { relatedTarget: g.trigger });
    sample(label + ":focusout");
  }
  g.li.dispatch("focusin", { target: g.trigger });
  focused = g;
}
(scenario.steps || []).forEach((step, i) => {
  const label = i + ":" + step.do + (step.id ? ":" + step.id : "");
  const g = step.id ? group[step.id] : null;
  switch (step.do) {
    case "enter": g.li.dispatch("pointerenter", { pointerType: "mouse" }); break;
    case "leave": g.li.dispatch("pointerleave", { pointerType: "mouse" }); break;
    case "click":
      g.li.dispatch("pointerdown", { pointerType: step.pointer || "mouse" });
      if (!step.nofocus) { moveFocus(g, label); sample(label + ":focus"); }
      fire("pointerup", { type: "pointerup", target: g.trigger });
      g.trigger.dispatch("click");
      break;
    case "drag-off":
      g.li.dispatch("pointerdown", { pointerType: "mouse" });
      moveFocus(g, label);
      sample(label + ":focus");
      fire("pointerup", { type: "pointerup", target: outside });
      break;
    case "wait": advance(step.ms, label); break;
    case "focus":
      fire("keydown", { key: "Tab" });
      moveFocus(g, label);
      break;
    case "escape": fire("keydown", { key: "Escape" }); break;
    case "outside": fire("click", { target: outside }); break;
    case "link": fire("click", { target: group[ids[0]].li.querySelector("a") }); break;
    default: throw new Error("harness: unknown step " + step.do);
  }
  sample(label);
});

const open = ids.filter((id) => group[id].trigger.getAttribute("aria-expanded") === "true");
process.stdout.write(JSON.stringify({
  openIds: open,
  openCount: open.length,
  swap: header.classList.contains("is-mm-swap"),
  samples,
}));
