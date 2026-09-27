/* ============================================================
   ONBOARDING — calm, light, skippable
   welcome · add friends · first circle · gentle permissions
   ============================================================ */
(function () {
  const { FRIENDS, friend } = window.SamlaData;
  const I = window.Icons;
  const { Avatar } = window.Samla;

  const SUGGEST = ["chloe", "alex", "maria", "samir"];

  function Onboarding({ onDone, onSheet }) {
    const [step, setStep] = React.useState(0);
    const [added, setAdded] = React.useState([]);
    const [circleName, setCircleName] = React.useState("Close friends");
    const [inCircle, setInCircle] = React.useState([]);
    const [perms, setPerms] = React.useState({ location: false, alerts: false });
    const finish = () => onDone({ added, circleName, inCircle, perms });
    const [way, setWay] = React.useState(null);

    const toggleAdd = (id) => setAdded((a) => a.includes(id) ? a.filter((x) => x !== id) : [...a, id]);
    const toggleCircle = (id) => setInCircle((a) => a.includes(id) ? a.filter((x) => x !== id) : [...a, id]);
    const next = () => setStep((s) => s + 1);

    const dots = React.createElement("div", { style: { display: "flex", gap: 7, justifyContent: "center" } },
      [0, 1, 2, 3].map((i) => React.createElement("span", { key: i, style: { width: i === step ? 22 : 7, height: 7, borderRadius: 999, background: i === step ? "var(--terracotta)" : "var(--ink-15)", transition: "all 360ms var(--ease)" } })));

    let content;
    if (step === 0) {
      content = React.createElement("div", { className: "fade", style: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 30px" } },
        React.createElement("div", { style: { display: "flex", justifyContent: "center", marginBottom: 30 } },
          React.createElement(I.GatherGlyph, { size: 96, sw: 1.3 })),
        React.createElement("div", { className: "eyebrow dusk", style: { textAlign: "center" } }, "the calm community that gathers soon"),
        React.createElement("h1", { className: "display", style: { fontSize: 50, textAlign: "center", lineHeight: 0.95, marginTop: 16 } }, "who\u2019s up for", React.createElement("br"), "something", React.createElement("span", { style: { color: "var(--terracotta)" } }, "?")),
        React.createElement("p", { className: "accent", style: { fontSize: 18, textAlign: "center", color: "var(--ink-70)", marginTop: 20, lineHeight: 1.45 } }, "leave a note for your circle. see who tags along. then put the phone away."));
    } else if (step === 1) {
      content = React.createElement("div", { className: "fade", style: { flex: 1, padding: "10px 30px 0" } },
        React.createElement("div", { className: "eyebrow terra" }, "step one"),
        React.createElement("h1", { className: "t-title", style: { marginTop: 10 } }, "bring a few", React.createElement("br"), "people in"),
        React.createElement("p", { style: { fontSize: 14, color: "var(--ink-70)", marginTop: 12, lineHeight: 1.5 } }, "no syncing your whole contact list. add only the people you actually want to gather with."),
        React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 22 } },
          React.createElement(AddWay, { icon: React.createElement(I.Qr, { size: 22 }), label: "scan code", on: way === "qr", onClick: () => { setWay("qr"); onSheet && onSheet({ type: "code" }); } }),
          React.createElement(AddWay, { icon: React.createElement(I.Link, { size: 22 }), label: "send link", on: way === "link", onClick: () => { setWay("link"); onSheet && onSheet({ type: "addFriend", tab: "link" }); } }),
          React.createElement(AddWay, { icon: React.createElement(I.Search, { size: 22 }), label: "search", on: way === "search", onClick: () => { setWay("search"); onSheet && onSheet({ type: "addFriend", tab: "search" }); } })),
        way && React.createElement("p", { className: "accent", style: { fontSize: 14, color: "var(--dusk)", marginTop: 14, lineHeight: 1.45 } },
          way === "qr" ? "show your code — they scan, you confirm." : way === "link" ? "a link they tap to connect. no app-store hunt." : "find someone by name or shared number."),
        React.createElement("div", { className: "eyebrow ink", style: { marginTop: 26, marginBottom: 6 } }, "people you may know"),
        React.createElement("div", null,
          SUGGEST.map((id) => {
            const f = friend(id); const on = added.includes(id);
            return React.createElement("div", { key: id, className: "list-row" },
              React.createElement(Avatar, { id, size: 42 }),
              React.createElement("div", { style: { flex: 1 } },
                React.createElement("div", { style: { fontSize: 16 } }, f.name),
                React.createElement("div", { className: "accent", style: { fontSize: 14, color: "var(--dusk)" } }, f.role || "friend")),
              React.createElement("button", { className: "chip" + (on ? " on" : ""), onClick: () => toggleAdd(id) }, on ? "added" : "add"));
          })));
    } else if (step === 2) {
      const pool = added.length ? added : SUGGEST;
      content = React.createElement("div", { className: "fade", style: { flex: 1, padding: "10px 30px 0" } },
        React.createElement("div", { className: "eyebrow terra" }, "step two"),
        React.createElement("h1", { className: "t-title", style: { marginTop: 10 } }, "make your", React.createElement("br"), "first circle"),
        React.createElement("p", { style: { fontSize: 14, color: "var(--ink-70)", marginTop: 12, lineHeight: 1.5 } }, "a circle is who a note goes to. you can have many — work, neighbours, the football crew."),
        React.createElement("div", { className: "field" },
          React.createElement("span", { className: "field-label" }, "name this circle"),
          React.createElement("input", { className: "input input-lg", value: circleName, onChange: (e) => setCircleName(e.target.value) })),
        React.createElement("div", { className: "eyebrow ink", style: { marginTop: 24, marginBottom: 10 } }, "who\u2019s in it"),
        React.createElement("div", { className: "row-wrap" },
          pool.map((id) => {
            const f = friend(id); const on = inCircle.includes(id);
            return React.createElement("button", { key: id, className: "chip" + (on ? " on" : ""), onClick: () => toggleCircle(id), style: { paddingLeft: 6 } },
              React.createElement(Avatar, { id, size: 22 }), f.name);
          })));
    } else {
      content = React.createElement("div", { className: "fade", style: { flex: 1, padding: "10px 30px 0" } },
        React.createElement("div", { className: "eyebrow terra" }, "step three"),
        React.createElement("h1", { className: "t-title", style: { marginTop: 10 } }, "two gentle", React.createElement("br"), "permissions"),
        React.createElement("p", { style: { fontSize: 14, color: "var(--ink-70)", marginTop: 12, lineHeight: 1.5 } }, "both optional, both off until you say so. change them anytime in settings."),
        React.createElement("div", { style: { marginTop: 22 } },
          React.createElement(PermRow, { icon: React.createElement(I.Pin, { size: 22 }), t: "approximate place", d: "only attached to a note when you choose. never tracked in the background.", on: perms.location, set: (v) => setPerms((p) => ({ ...p, location: v })) }),
          React.createElement(PermRow, { icon: React.createElement(I.Bell, { size: 22 }), t: "same-day alerts", d: "a soft note when a friend leaves something today. nothing else, ever.", on: perms.alerts, set: (v) => setPerms((p) => ({ ...p, alerts: v })) })));
    }

    return React.createElement("div", { className: "screen grain-soft" },
      window.Samla.StatusBar ? React.createElement(window.Samla.StatusBar, null) : null,
      React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", overflow: "auto" } }, content),
      React.createElement("div", { style: { padding: "18px 30px calc(30px + env(safe-area-inset-bottom, 0px))", flex: "none" } },
        dots,
        React.createElement("button", { className: "btn btn-primary btn-block", style: { marginTop: 20 }, onClick: step < 3 ? next : finish },
          step === 0 ? "begin" : step === 3 ? "enter samla" : "continue",
          React.createElement(I.Chevron, { size: 18 })),
        step > 0 && step < 3
          ? React.createElement("button", { onClick: finish, style: { display: "block", margin: "14px auto 0", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-narrow)", fontWeight: 600, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-70)" } }, "skip for now")
          : React.createElement("p", { style: { textAlign: "center", marginTop: 14, fontSize: 14, color: "var(--ink-70)" } }, step === 0 ? "no feeds · no followers · no streaks" : "")
      )
    );
  }

  function AddWay({ icon, label, on, onClick }) {
    return React.createElement("button", { onClick, className: "note", style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 9, padding: "16px 8px", cursor: "pointer", background: on ? "var(--cream)" : undefined, borderColor: on ? "var(--terracotta)" : undefined } },
      React.createElement("span", { style: { color: "var(--dusk)" } }, icon),
      React.createElement("span", { style: { fontFamily: "var(--font-narrow)", fontWeight: 600, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" } }, label));
  }

  function PermRow({ icon, t, d, on, set }) {
    return React.createElement("div", { className: "set-row" },
      React.createElement("span", { style: { color: "var(--dusk)", flex: "none" } }, icon),
      React.createElement("div", { style: { flex: 1 } },
        React.createElement("div", { className: "st" }, t),
        React.createElement("div", { className: "sd" }, d)),
      React.createElement("button", { className: "toggle" + (on ? " on" : ""), role: "switch", "aria-checked": !!on, onClick: () => set(!on), "aria-label": t }, React.createElement("span", { className: "knob" })));
  }

  window.SamlaOnboarding = { Onboarding };
})();
