/* ============================================================
   HOME v3 — list · map. "who's up for something?"
   ============================================================ */
(function () {
  const I = window.Icons;
  const { Avatar, NoteCard, dayPart, namesLine, upFor } = window.Samla;
  const h = React.createElement;

  function Header({ onMap }) {
    const dp = dayPart();
    return h("div", { className: "pad rise", style: { paddingTop: 4, paddingBottom: 22 } },
      h("div", { className: "eyebrow dusk" }, dp.label),
      h("h1", { className: "t-title", style: { marginTop: 10, maxWidth: "9ch" } }, "who\u2019s up for something", h("span", { style: { color: "var(--terracotta)" } }, "?")),
      h("p", { className: "t-sub", style: { marginTop: 12, maxWidth: "32ch" } },
        h("span", { className: "t-accent", style: { fontSize: 16 } }, dp.accent + " "),
        "what your people are up to \u2014 in case they\u2019d like company."));
  }

  function QuietState() {
    return h("div", { className: "quiet fade" },
      h("div", { className: "quiet-glyph" }, h(I.GatherGlyph, { size: 72, sw: 1.3 })),
      h("p", { className: "quiet-title" }, "nothing on the door yet."),
      h("p", { className: "quiet-sub" }, "and that\u2019s okay. a quiet " + dayPart().part + " is a feature, not an empty room."));
  }

  function SectionLabel({ children }) {
    return h("div", { className: "pad", style: { marginTop: 4, marginBottom: 12 } }, h("span", { className: "eyebrow ink", style: { whiteSpace: "nowrap" } }, children));
  }

  function StreamHome({ broadcasts, onOpen }) {
    const others = broadcasts.filter((b) => !b.mine);
    const mine = broadcasts.filter((b) => b.mine);
    return h("div", { className: "body" },
      h(Header, null),
      h(SectionLabel, null, "from your people"),
      others.length === 0
        ? h(QuietState, null)
        : h("div", { className: "pad stack" }, others.map((b, i) => h(NoteCard, { key: b.id, b, delay: i * 80, onOpen: () => onOpen(b) }))),
      mine.length > 0 && h(React.Fragment, null,
        h("div", { className: "hairline", style: { margin: "28px 22px 18px" } }),
        h(SectionLabel, null, "on your door"),
        h("div", { className: "pad stack" }, mine.map((b, i) => h(NoteCard, { key: b.id, b, delay: i * 80, onOpen: () => onOpen(b) })))),
      h("div", { style: { height: 120 } }));
  }

  function MapHome({ broadcasts, onOpen }) {
    const active = broadcasts.filter((b) => b.place);
    const coords = { "b-alex-ride": { x: 96, y: 250 } };
    const placed = active.map((b, i) => ({ b, ...(coords[b.id] || [{ x: 248, y: 322 }, { x: 178, y: 430 }, { x: 286, y: 200 }][i % 3]) }));
    const { ActivityIcon, detectActivity } = window.SamlaActivity;
    return h("div", { style: { position: "relative", flex: 1, overflow: "hidden" } },
      h("div", { className: "map-wrap grain-soft" },
        h("svg", { className: "map-svg", viewBox: "0 0 390 760", preserveAspectRatio: "xMidYMid slice", "aria-hidden": "true" },
          h("rect", { x: 0, y: 0, width: 390, height: 760, fill: "#5E788E" }),
          h("path", { d: "M-20 150 C 70 110, 150 120, 240 95 C 320 74, 410 110, 430 200 L 430 600 C 360 640, 250 610, 150 650 C 70 680, -30 640, -40 540 Z", fill: "#EDE9E0" }),
          h("path", { d: "M250 -20 C 300 40, 360 60, 430 50 L 430 -30 Z", fill: "#EDE9E0" }),
          h("path", { d: "M40 360 C 90 330, 150 340, 165 400 C 178 450, 120 480, 70 470 C 30 462, 20 400, 40 360 Z", fill: "#E4D6BE" }),
          h("g", { stroke: "#161412", strokeOpacity: 0.16, strokeWidth: 1, fill: "none" },
            ["M30 200 C 140 220, 250 180, 380 230", "M20 300 C 150 320, 260 300, 400 340", "M60 130 C 120 260, 150 420, 130 600", "M250 90 C 240 250, 280 420, 250 620", "M180 110 C 190 280, 160 460, 200 640", "M30 470 C 160 460, 280 500, 400 470"].map((d, i) => h("path", { key: i, d }))),
          h("circle", { cx: 196, cy: 360, r: 22, fill: "#D6A456", fillOpacity: 0.18 }),
          h("circle", { cx: 196, cy: 360, r: 7, fill: "#D6A456", stroke: "#EDE9E0", strokeWidth: 2 })),
        placed.map(({ b, x, y }, i) => h("button", { key: b.id, className: "map-pin", onClick: () => onOpen(b), "aria-label": upFor(b) + " " + b.title,
          style: { position: "absolute", left: `${(x / 390) * 100}%`, top: `${(y / 760) * 100}%`, transform: "translate(-50%,-100%)", background: "none", border: "none", cursor: "pointer", animation: `rise 600ms var(--ease) ${i * 120}ms both` } },
          h("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 } },
            h("div", { className: "map-chip" + (b.mine ? " mine" : "") },
              b.mine ? h(ActivityIcon, { kind: b.kind || detectActivity(b.title), size: 18 }) : h(Avatar, { id: b.author, size: 22 }),
              h("span", { className: "t-small" }, b.title)),
            h("div", { style: { width: 13, height: 13, borderRadius: "50%", background: b.mine ? "var(--terracotta)" : "var(--dusk)", border: "2px solid var(--paper)", boxShadow: "0 2px 6px rgba(22,20,18,0.4)" } }))))),
      h("div", { style: { position: "absolute", left: 22, right: 22, top: 8, zIndex: 6, pointerEvents: "none" } },
        h("div", { className: "eyebrow", style: { color: "var(--paper)", textShadow: "0 1px 3px rgba(22,20,18,0.4)" } }, dayPart().label),
        h("h1", { className: "t-title", style: { marginTop: 8, color: "var(--paper)", textShadow: "0 2px 10px rgba(22,20,18,0.35)", maxWidth: "8ch" } }, "who\u2019s up for something", h("span", { style: { color: "var(--amber)" } }, "?"))),
      h("div", { className: "map-sheet rise" },
        active.length === 0
          ? h("div", { style: { display: "flex", alignItems: "center", gap: 13 } },
              h(I.GatherGlyph, { size: 40, sw: 1.4 }),
              h("div", null, h("p", { className: "t-accent" }, "the map is quiet."), h("p", { className: "t-sub", style: { marginTop: 2 } }, "no one\u2019s left a note with a place yet.")))
          : h("div", null,
              h("div", { className: "eyebrow ink", style: { marginBottom: 10 } }, "on the map"),
              h("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
                active.slice(0, 2).map((b) => h("button", { key: b.id, onClick: () => onOpen(b), className: "map-row" },
                  h(Avatar, { id: b.mine ? "you" : b.author, size: 32 }),
                  h("div", { style: { flex: 1, minWidth: 0 } },
                    h("div", { className: "t-small" }, b.title),
                    h("div", { className: "t-sub", style: { marginTop: 2 } }, `${b.place} \u00b7 ${b.timeLabel}`)),
                  h(I.Chevron, { size: 18, style: { color: "var(--ink-70)" } })))))));
  }

  window.SamlaHome = { StreamHome, MapHome };
})();
