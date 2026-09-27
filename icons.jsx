/* ============================================================
   ICONS — line icons + the brand mark (three friends, one point)
   All simple geometric SVGs. No detailed illustration.
   ============================================================ */
(function () {
  const S = ({ size = 24, sw = 1.6, children, fill = "none", ...rest }) =>
    React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill, stroke: "currentColor", strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round", ...rest }, children);

  // The brand mark: three "friends" (dots) gathered around a shared point,
  // joined by a soft fading arc — the moment of coming together. Terracotta
  // spark on the lead dot. (Redesigned per the Samla design system, replacing
  // the earlier two-dot-and-thread glyph.) `thread` kept for call-site compat.
  function GatherGlyph({ size = 64, color = "var(--ink)", spark = "var(--terracotta)", thread, sw = 1.4 }) {
    const w = sw * 1.7;
    return React.createElement(
      "svg",
      { width: size, height: size, viewBox: "0 0 100 100", "aria-hidden": "true", style: { display: "block" } },
      React.createElement("path", { d: "M50,24 A26,26 0 0,1 73,63", stroke: color, strokeOpacity: 0.5, strokeWidth: w, fill: "none", strokeLinecap: "round" }),
      React.createElement("path", { d: "M73,63 A26,26 0 0,1 27,63", stroke: color, strokeOpacity: 0.25, strokeWidth: w, fill: "none", strokeLinecap: "round" }),
      React.createElement("circle", { cx: 50, cy: 24, r: 6.5, fill: spark }),
      React.createElement("circle", { cx: 73, cy: 63, r: 6.5, fill: color }),
      React.createElement("circle", { cx: 27, cy: 63, r: 6.5, fill: color })
    );
  }

  // Compact single-color variant of the mark for the FAB and colored tiles:
  // same "three friends + connecting arc" geometry as GatherGlyph, but drawn
  // in one flat color at higher opacity so it stays legible on a solid,
  // saturated tile (the terracotta FAB, a circle-cover square). Pass `spark`
  // only when the backdrop can support a second accent on the lead dot.
  function GlyphMark({ size = 34, color = "var(--paper)", spark, sw = 3 }) {
    const leadDot = spark || color;
    return React.createElement(
      "svg",
      { width: size, height: size, viewBox: "0 0 100 100", "aria-hidden": "true", style: { display: "block" } },
      React.createElement("circle", { cx: 50, cy: 50, r: 34, fill: "none", stroke: color, strokeOpacity: 0.22, strokeWidth: sw * 0.85 }),
      React.createElement("circle", { cx: 50, cy: 18, r: 9.5, fill: leadDot }),
      React.createElement("circle", { cx: 80, cy: 65, r: 9.5, fill: color }),
      React.createElement("circle", { cx: 20, cy: 65, r: 9.5, fill: color })
    );
  }

  const Home = (p) => S({ ...p, children: [
    React.createElement("path", { key: 1, d: "M4 11.5 12 4l8 7.5" }),
    React.createElement("path", { key: 2, d: "M6 10.5V20h12v-9.5" }),
  ] });

  const Circles = (p) => S({ ...p, children: [
    React.createElement("circle", { key: 1, cx: 9, cy: 9, r: 5 }),
    React.createElement("circle", { key: 2, cx: 15, cy: 15, r: 5 }),
  ] });

  const Person = (p) => S({ ...p, children: [
    React.createElement("circle", { key: 1, cx: 12, cy: 8, r: 4 }),
    React.createElement("path", { key: 2, d: "M5 20c0-3.5 3-6 7-6s7 2.5 7 6" }),
  ] });

  const Pin = (p) => S({ ...p, children: [
    React.createElement("path", { key: 1, d: "M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z" }),
    React.createElement("circle", { key: 2, cx: 12, cy: 9, r: 2.4 }),
  ] });

  const Clock = (p) => S({ ...p, children: [
    React.createElement("circle", { key: 1, cx: 12, cy: 12, r: 8.5 }),
    React.createElement("path", { key: 2, d: "M12 7.5V12l3 2" }),
  ] });

  const Back = (p) => S({ ...p, children: React.createElement("path", { d: "M14.5 5 8 12l6.5 7" }) });
  const Close = (p) => S({ ...p, children: React.createElement("path", { d: "M6 6l12 12M18 6 6 18" }) });
  const Plus = (p) => S({ ...p, children: React.createElement("path", { d: "M12 5v14M5 12h14" }) });
  const Check = (p) => S({ ...p, children: React.createElement("path", { d: "M5 12.5 10 17l9-10" }) });
  const Chevron = (p) => S({ ...p, children: React.createElement("path", { d: "M9 5l7 7-7 7" }) });

  const Qr = (p) => S({ ...p, children: [
    React.createElement("rect", { key: 1, x: 4, y: 4, width: 6, height: 6, rx: 1 }),
    React.createElement("rect", { key: 2, x: 14, y: 4, width: 6, height: 6, rx: 1 }),
    React.createElement("rect", { key: 3, x: 4, y: 14, width: 6, height: 6, rx: 1 }),
    React.createElement("path", { key: 4, d: "M14 14h2v2M20 14v6M16 20h4M18 16v2", strokeWidth: 1.6 }),
  ] });

  const Link = (p) => S({ ...p, children: [
    React.createElement("path", { key: 1, d: "M10 14a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7L11 7.3" }),
    React.createElement("path", { key: 2, d: "M14 10a4 4 0 0 0-5.7 0L6 12.3a4 4 0 0 0 5.7 5.7L13 16.7" }),
  ] });

  const Search = (p) => S({ ...p, children: [
    React.createElement("circle", { key: 1, cx: 11, cy: 11, r: 6.5 }),
    React.createElement("path", { key: 2, d: "m20 20-4-4" }),
  ] });

  const Bell = (p) => S({ ...p, children: [
    React.createElement("path", { key: 1, d: "M6 16V11a6 6 0 0 1 12 0v5l1.5 2.5h-15Z" }),
    React.createElement("path", { key: 2, d: "M10 20a2 2 0 0 0 4 0" }),
  ] });

  const Lock = (p) => S({ ...p, children: [
    React.createElement("rect", { key: 1, x: 5, y: 10.5, width: 14, height: 9, rx: 2.5 }),
    React.createElement("path", { key: 2, d: "M8 10.5V8a4 4 0 0 1 8 0v2.5" }),
  ] });

  const Eye = (p) => S({ ...p, children: [
    React.createElement("path", { key: 1, d: "M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" }),
    React.createElement("circle", { key: 2, cx: 12, cy: 12, r: 2.6 }),
  ] });

  // signal/wifi/battery for status bar
  function StatusSys({ color = "var(--ink)" }) {
    return React.createElement("svg", { width: 62, height: 14, viewBox: "0 0 62 14", fill: color, "aria-hidden": "true" },
      React.createElement("rect", { x: 0, y: 8, width: 3, height: 5, rx: 1 }),
      React.createElement("rect", { x: 5, y: 6, width: 3, height: 7, rx: 1 }),
      React.createElement("rect", { x: 10, y: 4, width: 3, height: 9, rx: 1 }),
      React.createElement("rect", { x: 15, y: 2, width: 3, height: 11, rx: 1 }),
      React.createElement("path", { d: "M26 5.5c2.2-1.8 5.8-1.8 8 0M24 3c3.6-3 8.4-3 12 0M28 8c1.1-.9 2.9-.9 4 0", stroke: color, strokeWidth: 1.4, fill: "none", strokeLinecap: "round" }),
      React.createElement("rect", { x: 44, y: 2, width: 15, height: 10, rx: 2.5, stroke: color, strokeWidth: 1.2, fill: "none" }),
      React.createElement("rect", { x: 45.5, y: 3.5, width: 10, height: 7, rx: 1, fill: color }),
      React.createElement("rect", { x: 60, y: 5, width: 1.6, height: 4, rx: 0.8, fill: color })
    );
  }

  // The full Samla logo — brand mark + "Samla" wordmark — per the design
  // system's new Logo lockup. For surfaces where the app's nav/FAB context
  // doesn't apply (share/splash, letterhead, decks). Note the wordmark is
  // Archivo Black in normal case ("Samla") — the deliberate exception to the
  // lowercase-display rule, because it's the brand name, not display copy.
  const LOGO_TONES = {
    ink: { text: "var(--ink)", ring: "var(--ink)", dot: "var(--ink)", spark: "var(--terracotta)" },
    onDark: { text: "var(--paper)", ring: "var(--paper)", dot: "var(--paper)", spark: "var(--amber)" },
  };
  function Logo({ layout = "horizontal", size = 40, tone = "ink" }) {
    const t = LOGO_TONES[tone] || LOGO_TONES.ink;
    return React.createElement(
      "div",
      { style: { display: "flex", alignItems: "center", gap: size * 0.35, flexDirection: layout === "stacked" ? "column" : "row" } },
      React.createElement("svg", { width: size, height: size, viewBox: "0 0 100 100", "aria-hidden": "true", style: { display: "block", flex: "none" } },
        React.createElement("path", { d: "M50,24 A26,26 0 0,1 73,63", fill: "none", stroke: t.ring, strokeOpacity: 0.5, strokeWidth: 2.4, strokeLinecap: "round" }),
        React.createElement("path", { d: "M73,63 A26,26 0 0,1 27,63", fill: "none", stroke: t.ring, strokeOpacity: 0.25, strokeWidth: 2.4, strokeLinecap: "round" }),
        React.createElement("circle", { cx: 50, cy: 24, r: 6.5, fill: t.spark }),
        React.createElement("circle", { cx: 73, cy: 63, r: 6.5, fill: t.dot }),
        React.createElement("circle", { cx: 27, cy: 63, r: 6.5, fill: t.dot })
      ),
      React.createElement("span", { style: { fontFamily: "var(--font-black)", fontWeight: 900, letterSpacing: "-0.03em", color: t.text, fontSize: size * 0.72, lineHeight: 1 } }, "Samla")
    );
  }

  window.Icons = { GatherGlyph, GlyphMark, Logo, Home, Circles, Person, Pin, Clock, Back, Close, Plus, Check, Chevron, Qr, Link, Search, Bell, Lock, Eye, StatusSys };
})();
