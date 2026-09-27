/* ============================================================
   COMPOSE v3 — "i'm up for…"
   what → when (a real time) → who → leave it. place & a line optional.
   ============================================================ */
(function () {
  const { MODES, CIRCLES, FRIENDS, friend, circle } = window.SamlaData;
  const I = window.Icons;
  const { Avatar, namesLine, dayPart, expiryFor, audience } = window.Samla;
  const h = React.createElement;
  const DRAFT_KEY = "samla_draft_v3";

  const pad = (n) => (n < 10 ? "0" + n : "" + n);
  const laterTimes = () => {
    const hr = new Date().getHours();
    const out = [];
    for (let x = hr + 1; x <= Math.min(hr + 4, 23); x++) out.push("around " + pad(x) + ":00");
    if (hr < 17) out.push("this evening");
    return out.length ? out : ["in a little while"];
  };
  const PLAN_DAYS = ["later today", "tomorrow", "this weekend"];
  const WEEKEND = () => (new Date().getDay() === 0 ? ["sunday"] : ["saturday", "sunday", "either day"]);
  const PLAN_TIMES = ["around 10:00", "around 14:00", "around 19:00", "any time"];
  const STARTERS = {
    up: { morning: ["coffee", "a walk", "breakfast"], afternoon: ["coffee", "a walk", "lunch"], evening: ["a drink", "dinner", "a walk"], night: ["a late walk", "a drink"] },
    going: { morning: ["get coffee", "the market", "walk by the water"], afternoon: ["the park", "get coffee", "the gym"], evening: ["get dinner", "the pub", "a film"], night: ["a late walk", "the pub"] },
  };
  const PHRASES = ["i\u2019m up for\u2026", "i\u2019m going to\u2026"];
  const PHRASE_KEYS = ["up", "going"];
  const PHRASE_HELP = { up: "an open idea \u2014 easy for anyone to say no.", going: "you\u2019re going anyway \u2014 join if you like." };

  const dayOf = (s) => s.day === "this weekend" ? (s.wkd === "either day" || !s.wkd ? "this weekend" : s.wkd) : s.day;
  const whenLabel = (s) => s.mode === "now" ? "now" : s.mode === "later" ? "later \u00b7 " + s.at : dayOf(s) + (s.at === "any time" ? "" : " \u00b7 " + s.at);
  const blank = () => ({ phrase: "up", mode: "now", title: "", kind: null, kindSet: false, place: "", note: "", at: laterTimes()[0], day: "tomorrow", wkd: "either day", circles: [CIRCLES[0] ? CIRCLES[0].id : null].filter(Boolean), people: [] });
  const loadDraft = () => { try { const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); return d && typeof d.title === "string" ? { ...blank(), ...d, phrase: d.phrase === "going" ? "going" : "up" } : null; } catch (e) { return null; } };

  function Compose({ open, editing, onClose, onPublish }) {
    const { ACTIVITIES, detectActivity, ActivityIcon } = window.SamlaActivity;
    const [s, setS] = React.useState(() => loadDraft() || blank());
    const [step, setStep] = React.useState("compose");
    const [more, setMore] = React.useState(false);
    const [pickPeople, setPickPeople] = React.useState(false);
    const [resumed, setResumed] = React.useState(false);
    const [roll, setRoll] = React.useState(true);
    const wasOpen = React.useRef(false);
    const stash = React.useRef(null);
    const set = (patch) => setS((p) => ({ ...p, ...patch }));

    React.useEffect(() => {
      if (open && !wasOpen.current) {
        setStep("compose"); setPickPeople(false); setRoll(!editing && !s.title);
        if (editing) {
          stash.current = s;
          const w = editing.when || {};
          const e = { phrase: editing.phrase || "up", mode: editing.mode, title: editing.title, kind: editing.kind || detectActivity(editing.title), kindSet: !!editing.kind, place: editing.place || "", note: editing.note || "", at: w.at || laterTimes()[0], day: w.day || "tomorrow", wkd: w.wkd || "either day", circles: editing.circles || [editing.circle].filter(Boolean), people: editing.people || [] };
          setS(e); setMore(!!(e.place || e.note)); setResumed(false);
        } else {
          if (s.mode === "later" && !laterTimes().includes(s.at)) set({ at: laterTimes()[0] });
          setResumed(s.title.trim().length > 0); setMore(!!(s.place || s.note));
        }
      }
      if (!open && wasOpen.current && stash.current) { const d = stash.current; stash.current = null; setTimeout(() => setS(d), 450); }
      wasOpen.current = open;
    }, [open]);
    React.useEffect(() => { if (!editing && !stash.current) { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(s)); } catch (e) {} } }, [s]);
    // the title rolls between the two phrases until you choose or start typing
    React.useEffect(() => {
      if (!open || !roll) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const t = setInterval(() => setS((p) => ({ ...p, phrase: p.phrase === "up" ? "going" : "up" })), 3000);
      return () => clearInterval(t);
    }, [open, roll]);
    const pickPhrase = () => { setRoll(false); set({ phrase: s.phrase === "up" ? "going" : "up" }); };

    const setTitle = (t) => { setRoll(false); setS((p) => ({ ...p, title: t, kind: p.kindSet ? p.kind : detectActivity(t) })); };
    const pickMode = (m) => set({ mode: m, at: m === "later" ? laterTimes()[0] : m === "planned" ? PLAN_TIMES[2] : s.at });
    const toggleIn = (key, id) => setS((p) => ({ ...p, [key]: p[key].includes(id) ? p[key].filter((x) => x !== id) : [...p[key], id] }));

    const inCircles = new Set(s.circles.flatMap((cid) => (circle(cid) || { friends: [] }).friends));
    const reach = Array.from(new Set([...inCircles, ...s.people]));
    const extraPool = FRIENDS.filter((f) => f.id !== "you" && !inCircles.has(f.id));
    const ready = s.title.trim().length > 0 && reach.length > 0;
    const part = dayPart().part;
    // while the title rolls, everything below stays put — only the phrase moves
    const shownPhrase = roll ? "up" : s.phrase;

    const publish = () => {
      const payload = {
        mode: s.mode, phrase: s.phrase, title: s.title.trim(), kind: s.kind, note: s.note.trim(), place: s.place.trim(),
        timeLabel: whenLabel(s), when: { at: s.at, day: s.day, wkd: s.wkd },
        circles: s.circles.slice(), circle: s.circles[0] || null, people: s.people.slice(), open: true,
        expiresAt: expiryFor(s.mode, dayOf(s)),
      };
      if (editing) { onPublish(payload, editing.id); return; }
      setStep("sending");
      setTimeout(() => { onPublish(payload); setS(blank()); setMore(false); try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} }, 2400);
    };
    const dot = (bg, size = 7) => h("span", { className: "chip-dot", style: { width: size, height: size, borderRadius: "50%", background: bg } });
    const chipRow = (opts, cur, onPick, label) => h("div", { className: "row-wrap", role: "radiogroup", "aria-label": label },
      opts.map((o) => h("button", { key: o, role: "radio", "aria-checked": cur === o, className: "chip" + (cur === o ? " on" : ""), onClick: () => onPick(o) }, o)));

    return h(React.Fragment, null,
      h("div", { className: "scrim" + (open ? " show" : ""), onClick: step === "compose" ? onClose : undefined }),
      h("div", { className: "sheet" + (open ? " show" : ""), role: "dialog", "aria-label": editing ? "edit your note" : "leave a note" },
        step === "sending"
          ? h(NoteLands, { title: s.title, to: audience({ circles: s.circles, people: s.people }) })
          : h(React.Fragment, null,
              h("div", { className: "sheet-grab" }),
              h("div", { className: "sheet-body" },
                h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 } },
                  h("div", null,
                    h("div", { className: "eyebrow terra" }, editing ? "edit your note" : "leave a note"),
                    h("button", { className: "phrase-btn", onClick: pickPhrase, "aria-label": "switch phrase — now: " + PHRASES[Math.max(0, PHRASE_KEYS.indexOf(s.phrase))] },
                      h(window.Samla.RollWords, { words: PHRASES, index: Math.max(0, PHRASE_KEYS.indexOf(s.phrase)), className: "t-title" }),
                      h("span", { className: "phrase-swap", "aria-hidden": "true" }, h(I.Chevron, { size: 14, style: { transform: "rotate(90deg)" } })))),
                  h("button", { onClick: onClose, "aria-label": "close", className: "icon-btn" }, h(I.Close, { size: 20 }))),

                resumed && !editing && h("div", { className: "resume-row" },
                  h("span", { className: "t-accent", style: { fontSize: 16 } }, "your note is still here."),
                  h("button", { className: "text-link", onClick: () => { setS(blank()); setMore(false); setResumed(false); } }, "start over")),

                h("p", { className: "helper", style: { marginTop: 8 } }, roll ? "tap to choose: an open idea, or somewhere you\u2019re going." : (PHRASE_HELP[s.phrase] || PHRASE_HELP.up)),

                // what
                h("div", { className: "field", style: { marginTop: 14 } },
                  h("input", { id: "c-title", "aria-label": PHRASES[Math.max(0, PHRASE_KEYS.indexOf(s.phrase))], className: "input input-lg", value: s.title, onChange: (e) => setTitle(e.target.value), placeholder: shownPhrase === "going" ? "the park? get coffee?" : "coffee? a walk?", maxLength: 42 }),
                  !s.title && h("div", { className: "row-wrap", style: { marginTop: 12 } },
                    (STARTERS[shownPhrase] || STARTERS.up)[part].map((t) => h("button", { key: t, className: "chip", onClick: () => setTitle(t) }, dot("var(--amber)"), t))),
                  h("div", { className: "kind-row", role: "radiogroup", "aria-label": "kind of plan" },
                    ACTIVITIES.map((a) => h("button", { key: a.k, role: "radio", "aria-checked": s.kind === a.k, "aria-label": a.label, title: a.label, className: "kind-btn" + (s.kind === a.k ? " on" : ""), onClick: () => set({ kind: s.kind === a.k ? null : a.k, kindSet: true }) }, h(ActivityIcon, { kind: a.k, size: 22 }))))),

                // when
                h("div", { className: "field" },
                  h("span", { className: "field-label" }, "when"),
                  h("div", { className: "row-wrap", role: "radiogroup", "aria-label": "tempo" },
                    ["now", "later"].concat(s.mode === "planned" ? ["planned"] : []).map((k) => h("button", { key: k, role: "radio", "aria-checked": s.mode === k, className: "chip" + (s.mode === k ? " on" : ""), onClick: () => pickMode(k) }, s.mode === k && dot("var(--amber)"), MODES[k].label))),
                  s.mode === "later" && h("div", { className: "sub-field" }, chipRow(laterTimes(), s.at, (o) => set({ at: o }), "time")),
                  s.mode === "planned" && h("div", { className: "sub-field" },
                    chipRow(PLAN_DAYS, s.day, (o) => set({ day: o }), "day"),
                    s.day === "this weekend" && h("div", { style: { marginTop: 9 } }, chipRow(WEEKEND(), WEEKEND().includes(s.wkd) ? s.wkd : WEEKEND()[0], (o) => set({ wkd: o }), "which day")),
                    h("div", { style: { height: 9 } }),
                    chipRow(PLAN_TIMES, s.at, (o) => set({ at: o }), "time")),
                  h("p", { className: "helper" }, s.mode === "now" ? "right now \u2014 it fades in about 3 hours." : "they\u2019ll see \u201c" + whenLabel(s) + "\u201d."),
                  s.mode === "planned"
                    ? h("button", { className: "text-link", onClick: () => pickMode("now") }, h(I.Back, { size: 14 }), "back to today")
                    : h("button", { className: "text-link", onClick: () => pickMode("planned") }, "or plan something further out", h(I.Chevron, { size: 14 }))),

                // who
                h("div", { className: "field" },
                  h("span", { className: "field-label" }, "who\u2019s it for?"),
                  h("div", { className: "row-wrap" },
                    CIRCLES.map((cc) => h("button", { key: cc.id, className: "chip" + (s.circles.includes(cc.id) ? " on" : ""), "aria-pressed": s.circles.includes(cc.id), onClick: () => toggleIn("circles", cc.id) }, dot(cc.cover, 9), cc.name)),
                    s.people.filter((id) => !inCircles.has(id)).map((id) => h("button", { key: id, className: "chip on", "aria-pressed": true, onClick: () => toggleIn("people", id), style: { paddingLeft: 6 } }, h(Avatar, { id, size: 22 }), friend(id).name)),
                    extraPool.length > 0 && h("button", { className: "chip chip-dashed", "aria-expanded": pickPeople, onClick: () => setPickPeople(!pickPeople) }, h(I.Plus, { size: 14 }), "a person")),
                  pickPeople && h("div", { className: "row-wrap people-pick" },
                    extraPool.filter((f) => !s.people.includes(f.id)).map((f) => h("button", { key: f.id, className: "chip", onClick: () => toggleIn("people", f.id), style: { paddingLeft: 6 } }, h(Avatar, { id: f.id, size: 22 }), f.name)))),
                h("p", { className: "reach-line" },
                  reach.length ? h(React.Fragment, null,
                    h("span", { style: { display: "flex", flex: "none" } }, reach.slice(0, 4).map((fid, i) => h("span", { key: fid, style: { marginLeft: i ? -7 : 0 } }, h(Avatar, { id: fid, size: 22, ring: "var(--paper)" })))),
                    h("span", null, namesLine(reach), " \u00b7 only they see this. they never see which circle.")) : "pick a circle or a person."),

                // optional
                h("button", { className: "more-row", "aria-expanded": more, onClick: () => setMore(!more) },
                  h("span", null, "a place, a line"), h("span", { className: "opt" }, "optional"),
                  h(I.Chevron, { size: 16, style: { transform: more ? "rotate(90deg)" : "none", transition: "transform 280ms var(--ease)" } })),
                more && h("div", { className: "fade" },
                  h("div", { className: "field" },
                    h("label", { className: "field-label", htmlFor: "c-place" }, s.mode === "now" ? "where are you?" : "roughly where"),
                    h("input", { id: "c-place", className: "input", value: s.place, onChange: (e) => set({ place: e.target.value }), placeholder: "a place, or an area" })),
                  h("div", { className: "field" },
                    h("label", { className: "field-label", htmlFor: "c-note" }, "a line"),
                    h("textarea", { id: "c-note", className: "input", rows: 2, value: s.note, onChange: (e) => set({ note: e.target.value }), placeholder: "no rush." }))),

                h("button", { className: "btn btn-primary btn-block", style: { marginTop: 26 }, disabled: !ready, onClick: publish },
                  h(I.GlyphMark, { size: 22, color: ready ? "var(--paper)" : "var(--ink-40)" }), editing ? "save changes" : "leave the note"),
                h("p", { className: "foot-line" }, "no feed \u00b7 no read receipts \u00b7 no counters")))));
  }

  function NoteLands({ title, to }) {
    return h("div", { style: { padding: "30px 0 56px", position: "relative", minHeight: 460 } },
      h("div", { className: "sheet-grab" }),
      h("div", { style: { display: "grid", placeItems: "center", height: 360, position: "relative" } },
        h("div", { className: "land-door grain-soft" },
          h("div", { className: "land-note" },
            h("div", { className: "display", style: { fontSize: 14 } }, title || "a note"),
            h("div", { style: { fontSize: 10, fontFamily: "var(--font-narrow)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--dusk)", marginTop: 5 } }, to))),
        h("div", { className: "land-caption" },
          h("p", { className: "t-accent" }, "left on the door."),
          h("p", { className: "t-sub", style: { marginTop: 6 } }, "they\u2019ll see it gently. now\u2014put the phone away."))));
  }

  window.SamlaCompose = { Compose };
})();
