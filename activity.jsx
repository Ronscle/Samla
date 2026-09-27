/* ============================================================
   ACTIVITY — what a note is about, drawn in the icon family
   (24 grid · 1.6 stroke · round caps) + a place "fragment":
   a tiny flat map in the map view's own vocabulary.
   ============================================================ */
(function () {
  const h = React.createElement;
  const P = (d, k) => h("path", { key: k, d });
  const C = (cx, cy, r, k) => h("circle", { key: k, cx, cy, r });

  const GLYPHS = {
    coffee: [P("M5 9.5h11v4.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5Z", 1), P("M16 11h1.5a2.5 2.5 0 0 1 0 5H16", 2), P("M9 3.8c-.8 1 .8 1.6 0 2.7M12.5 3.8c-.8 1 .8 1.6 0 2.7", 3)],
    walk: [P("M8 3.5c1.7 0 2.5 1.8 2.5 4s-.9 3.5-2.5 3.5-2.5-1.3-2.5-3.5.8-4 2.5-4Z", 1), P("M16 9.5c1.7 0 2.5 1.8 2.5 4s-.9 3.5-2.5 3.5-2.5-1.3-2.5-3.5.8-4 2.5-4Z", 2), P("M6.8 14.2h2.6M14.8 20.2h2.6", 3)],
    ride: [C(6, 16, 3.6, 1), C(18, 16, 3.6, 2), P("M6 16l3.8-7h5.4L18 16M9.8 9l3.2 7H6M13.2 6.5h2.6", 3)],
    food: [P("M4 11.5h16a8 8 0 0 1-16 0Z", 1), P("M9 20.5h6", 2), P("M10 4.5c-.8 1 .8 1.6 0 2.7M14 4.5c-.8 1 .8 1.6 0 2.7", 3)],
    drink: [P("M7.5 3.5h9l-.6 5.2a3.9 3.9 0 0 1-7.8 0Z", 1), P("M12 12.6v7.4M8.5 20h7", 2), P("M8 6.5h8", 3)],
    game: [C(12, 12, 8.5, 1), P("M12 8.6l3.1 2.2-1.2 3.6h-3.8l-1.2-3.6Z", 2), P("M12 8.6V3.5M15.1 10.8l4.8-1.6M13.9 14.4l2.9 4.2M10.1 14.4l-2.9 4.2M8.9 10.8 4.1 9.2", 3)],
    water: [P("M3 8.5c2 0 2-1.5 4.5-1.5S10 8.5 12 8.5s2-1.5 4.5-1.5S19 8.5 21 8.5", 1), P("M3 13c2 0 2-1.5 4.5-1.5S10 13 12 13s2-1.5 4.5-1.5S19 13 21 13", 2), P("M3 17.5c2 0 2-1.5 4.5-1.5S10 17.5 12 17.5s2-1.5 4.5-1.5S19 17.5 21 17.5", 3)],
    film: [h("rect", { key: 1, x: 4, y: 5, width: 16, height: 14, rx: 2 }), P("M8 5v14M16 5v14", 2), P("M4 9.7h4M4 14.3h4M16 9.7h4M16 14.3h4", 3)],
    music: [P("M9 17.5V6.2l10-2.2v11.3", 1), C(7, 17.5, 2.2, 2), C(17, 15.3, 2.2, 3)],
  };

  const ACTIVITIES = [
    { k: "coffee", label: "coffee", words: ["coffee", "fika", "cafe", "café", "espresso", "tea", "pascal"] },
    { k: "walk", label: "a walk", words: ["walk", "stroll", "hike", "wander"] },
    { k: "ride", label: "a ride", words: ["ride", "bike", "cycle", "cycling"] },
    { k: "food", label: "food", words: ["lunch", "dinner", "breakfast", "brunch", "food", "eat", "pizza", "cook"] },
    { k: "drink", label: "a drink", words: ["drink", "beer", "wine", "bar", "pub", "cocktail"] },
    { k: "game", label: "a game", words: ["football", "match", "game", "world cup", "vs", "padel", "tennis"] },
    { k: "water", label: "water", words: ["swim", "sauna", "bath", "beach", "lake", "water", "kayak"] },
    { k: "film", label: "a film", words: ["film", "movie", "cinema"] },
    { k: "music", label: "music", words: ["music", "gig", "concert", "jam", "record"] },
  ];

  function detectActivity(title) {
    const t = (title || "").toLowerCase();
    const hit = ACTIVITIES.find((a) => a.words.some((w) => t.includes(w)));
    return hit ? hit.k : null;
  }

  function ActivityIcon({ kind, size = 24, sw = 1.6 }) {
    if (!GLYPHS[kind]) return h(window.Icons.GatherGlyph, { size, sw: 1.4 });
    return h("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, GLYPHS[kind]);
  }

  function hash(s) { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  const WATERY = ["strand", "viken", "sjö", "water", "beach", "harbour", "kaj", "bay", "lake", "tanto", "årsta", "brygga"];
  const PIN = { now: "#D27652", later: "#5E788E", planned: "#161412" };

  /* the note's "place fragment" — cream land, dusk water, ink-16 streets */
  function PlaceArt({ place, mode = "now", kind, height = 104, radius = 12, big }) {
    const seed = hash((place || "somewhere") + (kind || ""));
    const r = (n, m) => ((seed >> n) % m);
    const W = 320, H = 120;
    const hasPlace = !!(place && place.trim());
    const watery = hasPlace && (WATERY.some((w) => place.toLowerCase().includes(w)) || r(3, 3) === 0);
    const px = 150 + r(5, 110), py = 44 + r(9, 34);
    const streets = hasPlace ? [0, 1, 2, 3].map((i) => {
      const a = r(i * 4, 60), b = r(i * 4 + 2, 60);
      return i % 2 === 0
        ? `M-10 ${20 + a} C 90 ${10 + b}, 200 ${60 + a / 2}, 330 ${30 + b}`
        : `M${60 + a * 3} -10 C ${80 + b * 2} 40, ${40 + a * 3} 80, ${90 + b * 3} 130`;
    }) : [];
    return h("div", { className: "place-art grain-soft", style: { height, borderRadius: radius } },
      h("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMid slice", "aria-hidden": "true" },
        h("rect", { width: W, height: H, fill: "#E4D6BE" }),
        watery && h("path", { d: r(7, 2) ? `M${W} ${40 + r(2, 30)} C ${W - 70} ${50 + r(4, 20)}, ${W - 60} ${H - 20}, ${W - 120} ${H + 10} L ${W + 10} ${H + 10} Z` : `M-10 ${H - 30 - r(2, 20)} C 70 ${H - 50}, 140 ${H - 10}, 220 ${H + 10} L -10 ${H + 10} Z`, fill: "#5E788E" }),
        hasPlace && !watery && h("ellipse", { cx: 60 + r(6, 60), cy: 70 + r(8, 30), rx: 42, ry: 26, fill: "#EDE9E0", opacity: 0.8 }),
        h("g", { stroke: "#161412", strokeOpacity: 0.16, strokeWidth: big ? 1.2 : 1.4, fill: "none" }, streets.map((d, i) => h("path", { key: i, d }))),
        hasPlace && h("g", null,
          h("circle", { cx: px, cy: py, r: 14, fill: PIN[mode], fillOpacity: 0.18 }),
          h("circle", { cx: px, cy: py, r: 5.5, fill: PIN[mode], stroke: "#EDE9E0", strokeWidth: 2 }))),
      !hasPlace && h("span", { className: "place-art-ghost" }, h(ActivityIcon, { kind, size: big ? 150 : 110, sw: 1.2 })),
      h("span", { className: "place-art-badge" + (big ? " big" : "") }, h(ActivityIcon, { kind, size: big ? 30 : 24 })),
      hasPlace && h("span", { className: "place-art-place" }, h(window.Icons.Pin, { size: 13 }), place));
  }

  window.SamlaActivity = { ACTIVITIES, detectActivity, ActivityIcon, PlaceArt };
})();
