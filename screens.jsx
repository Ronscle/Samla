/* ============================================================
   SCREENS — Circles · Circle detail · Profile · Settings
   ============================================================ */
(function () {
  const { CIRCLES, FRIENDS, friend, circle } = window.SamlaData;
  const I = window.Icons;
  const { Avatar, AvatarStack, ScreenHead, namesLine } = window.Samla;
  const { SETTINGS } = window.SamlaData;

  /* ---------------- CIRCLES ---------------- */
  function Circles({ onBack, onOpenCircle, onNew }) {
    return React.createElement("div", { className: "body screen-anim" },
      React.createElement(ScreenHead, { eyebrow: "circles of trust", eyebrowTone: "terra", title: "your circles" }),
      React.createElement("p", { className: "pad accent", style: { fontSize: 18, color: "var(--ink-70)", marginTop: -4, marginBottom: 22 } },
        "share with chosen people, with purpose."),
      React.createElement("div", { className: "pad", style: { display: "flex", flexDirection: "column", gap: 13 } },
        CIRCLES.map((c, i) => React.createElement("button", { key: c.id, onClick: () => onOpenCircle(c.id),
          className: "note", style: { textAlign: "left", animation: `rise 600ms var(--ease) ${i * 80}ms both` } },
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14 } },
            React.createElement("span", { style: { width: 46, height: 46, borderRadius: 14, background: c.cover, display: "grid", placeItems: "center", flex: "none" } },
              React.createElement(I.GlyphMark, { size: 24, color: "var(--paper)" })),
            React.createElement("div", { style: { flex: 1, minWidth: 0 } },
              React.createElement("div", { className: "t-card" }, c.name),
              React.createElement("div", { style: { fontSize: 14, color: "var(--ink-70)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, namesLine(c.friends) || "no one yet")),
            React.createElement(AvatarStack, { ids: c.friends, size: 30, max: 3 })))),
        React.createElement("button", { className: "btn btn-ghost btn-block", style: { marginTop: 6 }, onClick: onNew },
          React.createElement(I.Plus, { size: 18 }), "new circle")),
      React.createElement("div", { style: { height: 120 } })
    );
  }

  function CircleDetail({ id, onBack, onAddFriend, onEdit }) {
    const c = circle(id);
    return React.createElement("div", { className: "body screen-anim" },
      React.createElement(ScreenHead, { onBack, right: React.createElement("button", { className: "chip", onClick: onEdit }, "edit") }),
      React.createElement("div", { className: "pad" },
        React.createElement("span", { style: { width: 58, height: 58, borderRadius: 16, background: c.cover, display: "grid", placeItems: "center" } },
          React.createElement(I.GlyphMark, { size: 30, color: "var(--paper)" })),
        React.createElement("h1", { className: "t-title", style: { marginTop: 16 } }, c.name),
        React.createElement("p", { style: { fontFamily: "var(--font-narrow)", fontWeight: 600, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-70)", marginTop: 8 } }, "only you curate this · no one is told"),
        c.friends.length === 0 && React.createElement("p", { className: "accent", style: { fontSize: 18, color: "var(--ink-70)", marginTop: 22 } }, "an empty circle, waiting. no rush."),
        React.createElement("div", { style: { marginTop: 26 } },
          c.friends.map((fid) => {
            const f = friend(fid);
            return React.createElement("div", { key: fid, className: "list-row" },
              React.createElement(Avatar, { id: fid, size: 42 }),
              React.createElement("div", { style: { flex: 1 } },
                React.createElement("div", { style: { fontSize: 16 } }, f.name),
                f.role && React.createElement("div", { className: "accent", style: { fontSize: 14, color: "var(--dusk)" } }, f.role)));
          })),
        React.createElement("button", { className: "btn btn-ghost btn-block", style: { marginTop: 22 }, onClick: onAddFriend },
          React.createElement(I.Plus, { size: 18 }), "add to circle")),
      React.createElement("div", { style: { height: 60 } })
    );
  }

  /* ---------------- PROFILE / YOU ---------------- */
  function Profile({ onBack, onSettings, onAdd, onCode, onEditProfile, onCircles }) {
    const you = friend("you");
    const nFriends = FRIENDS.filter((f) => f.id !== "you").length;
    return React.createElement("div", { className: "body screen-anim" },
      React.createElement(ScreenHead, { eyebrow: "you", eyebrowTone: "dusk", title: "your corner",
        right: React.createElement("button", { onClick: onSettings, className: "chip" }, "settings") }),
      React.createElement("div", { className: "pad" },
        React.createElement("button", { onClick: onEditProfile, style: { display: "flex", alignItems: "center", gap: 16, marginTop: 6, background: "none", border: "none", cursor: "pointer", textAlign: "left", width: "100%" } },
          React.createElement(Avatar, { id: "you", size: 64 }),
          React.createElement("div", { style: { flex: 1 } },
            React.createElement("div", { className: "t-card" }, (you.name || "sam").toLowerCase()),
            React.createElement("div", { className: "accent", style: { fontSize: 14, color: "var(--dusk)" } }, "intentional connector")),
          React.createElement("span", { className: "chip" }, "edit")),

        // QR add
        React.createElement("button", { onClick: onCode, style: { width: "100%", textAlign: "left", marginTop: 28, background: "var(--cream)", borderRadius: 20, border: "none", padding: 22, display: "flex", gap: 18, alignItems: "center", cursor: "pointer" } },
          React.createElement("div", { style: { width: 92, height: 92, background: "var(--paper)", borderRadius: 14, display: "grid", placeItems: "center", flex: "none" } },
            React.createElement(QrArt, null)),
          React.createElement("div", null,
            React.createElement("div", { className: "eyebrow ink", style: { marginBottom: 6 } }, "add a friend"),
            React.createElement("p", { className: "t-small" }, "show your code"),
            React.createElement("p", { style: { fontSize: 14, color: "var(--ink-70)", marginTop: 6, lineHeight: 1.4 } }, "they scan, you confirm. that\u2019s the whole handshake."))),

        React.createElement("div", { style: { marginTop: 16 } },
          React.createElement(LinkRow, { icon: React.createElement(I.Circles, { size: 20 }), label: "your circles", onClick: onCircles }),
          React.createElement(LinkRow, { icon: React.createElement(I.Qr, { size: 20 }), label: "add by link or search", onClick: onAdd }),
          React.createElement(LinkRow, { icon: React.createElement(I.Bell, { size: 20 }), label: "gentle alerts", onClick: onSettings }),
          React.createElement(LinkRow, { icon: React.createElement(I.Lock, { size: 20 }), label: "privacy & visibility", onClick: onSettings }),
          React.createElement(LinkRow, { icon: React.createElement(I.GatherGlyph, { size: 22, sw: 1.6 }), label: "calm settings", onClick: onSettings }))),
      React.createElement("div", { style: { height: 120 } })
    );
  }

  function StatCard({ n, l, onClick }) {
    return React.createElement("button", { onClick, style: { textAlign: "left", border: "1px solid var(--ink-15)", borderRadius: 16, padding: "16px 18px", background: "none", cursor: "pointer" } },
      React.createElement("div", { className: "display", style: { fontSize: 34 } }, n),
      React.createElement("div", { style: { fontFamily: "var(--font-narrow)", fontWeight: 600, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-70)", marginTop: 2 } }, l));
  }

  function LinkRow({ icon, label, onClick }) {
    return React.createElement("button", { onClick, className: "list-row", style: { width: "100%", background: "none", border: "none", borderBottom: "1px solid var(--ink-10)", cursor: "pointer", textAlign: "left" } },
      React.createElement("span", { style: { color: "var(--dusk)" } }, icon),
      React.createElement("span", { style: { flex: 1, fontSize: 16 } }, label),
      React.createElement(I.Chevron, { size: 18, style: { color: "var(--ink-25)" } }));
  }

  function QrArt() {
    // abstract QR — simple squares, not a real code
    const cells = [];
    const seed = [1,0,1,1,0,1,0,1,0,1,1,0,1,0,0,1,1,1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,1,0,1,0];
    for (let i = 0; i < 36; i++) if (seed[i]) cells.push(i);
    return React.createElement("svg", { width: 70, height: 70, viewBox: "0 0 70 70" },
      React.createElement("rect", { x: 4, y: 4, width: 18, height: 18, rx: 3, fill: "none", stroke: "var(--ink)", strokeWidth: 3 }),
      React.createElement("rect", { x: 10, y: 10, width: 6, height: 6, fill: "var(--ink)" }),
      React.createElement("rect", { x: 48, y: 4, width: 18, height: 18, rx: 3, fill: "none", stroke: "var(--ink)", strokeWidth: 3 }),
      React.createElement("rect", { x: 54, y: 10, width: 6, height: 6, fill: "var(--ink)" }),
      React.createElement("rect", { x: 4, y: 48, width: 18, height: 18, rx: 3, fill: "none", stroke: "var(--ink)", strokeWidth: 3 }),
      React.createElement("rect", { x: 10, y: 54, width: 6, height: 6, fill: "var(--ink)" }),
      cells.map((i) => React.createElement("rect", { key: i, x: 30 + (i % 6) * 6.2, y: 30 + Math.floor(i / 6) * 6.2, width: 5, height: 5, fill: "var(--ink)" })),
      React.createElement("circle", { cx: 35, cy: 22, r: 3, fill: "var(--terracotta)" })
    );
  }

  /* ---------------- SETTINGS ---------------- */
  function Settings({ onBack, onEditProfile, onCode, onReplayOnboarding, onReset, onChange }) {
    const [, force] = React.useState(0);
    const bind = (k) => (v) => { SETTINGS[k] = v; force((n) => n + 1); onChange && onChange(); };
    const alerts = SETTINGS.alerts, setAlerts = bind("alerts");
    const quietHours = SETTINGS.quietHours, setQuietHours = bind("quietHours");
    const discoverable = SETTINGS.discoverable, setDiscoverable = bind("discoverable");
    const shareDefault = SETTINGS.shareDefault, setShareDefault = bind("shareDefault");
    const location = SETTINGS.location, setLocation = bind("location");
    const resetDevice = onReset;

    return React.createElement("div", { className: "body screen-anim" },
      React.createElement(ScreenHead, { onBack, eyebrow: "settings", eyebrowTone: "ink", title: "calm by default" }),
      React.createElement("div", { className: "pad", style: { paddingBottom: 60 } },
        React.createElement("div", { className: "eyebrow dusk", style: { marginTop: 14, marginBottom: 4 } }, "gentle alerts"),
        React.createElement(SetToggle, { on: alerts, set: setAlerts, t: "same-day activity only", d: "a soft note when a friend leaves something today. nothing else." }),
        React.createElement(SetToggle, { on: quietHours, set: setQuietHours, t: "quiet hours", d: "nothing reaches you between 22:00 and 08:00." }),
        React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "center", padding: "14px 0", color: "var(--ink-70)" } },
          React.createElement(I.Bell, { size: 16 }),
          React.createElement("span", { style: { fontSize: 14 } }, "no engagement pings · no badges · no red dots")),

        React.createElement("div", { className: "eyebrow dusk", style: { marginTop: 24, marginBottom: 4 } }, "privacy & visibility"),
        React.createElement(SetToggle, { on: shareDefault, set: setShareDefault, t: "show who else is coming, by default", d: "off keeps the calm — attendance stays with you unless you choose to share per note." }),
        React.createElement(SetToggle, { on: discoverable, set: setDiscoverable, t: "discoverable by phone number", d: "friends who already have your number can send a request. no one can browse for you." }),
        React.createElement(SetToggle, { on: location, set: setLocation, t: "approximate place", d: "only attached to a note when you choose. never tracked in the background." }),
        React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "flex-start", padding: "14px 0", color: "var(--ink-70)" } },
          React.createElement(I.Lock, { size: 16, style: { marginTop: 2, flex: "none" } }),
          React.createElement("span", { style: { fontSize: 14, lineHeight: 1.5 } }, "your connections stay yours. no tracking, no harvesting, no feed built from your moments.")),

        React.createElement("div", { className: "eyebrow dusk", style: { marginTop: 24, marginBottom: 4 } }, "account"),
        React.createElement(LinkRow, { icon: React.createElement(I.Person, { size: 20 }), label: "name, avatar & color", onClick: onEditProfile }),
        React.createElement(LinkRow, { icon: React.createElement(I.Qr, { size: 20 }), label: "your code & links", onClick: onCode }),

        React.createElement("div", { className: "eyebrow dusk", style: { marginTop: 24, marginBottom: 4 } }, "this device"),
        onReplayOnboarding && React.createElement(LinkRow, { icon: React.createElement(I.GatherGlyph, { size: 22, sw: 1.6 }), label: "see the welcome again", onClick: onReplayOnboarding }),
        React.createElement("button", { onClick: resetDevice, className: "list-row", style: { width: "100%", background: "none", border: "none", borderBottom: "1px solid var(--ink-10)", cursor: "pointer", textAlign: "left" } },
          React.createElement("span", { style: { color: "var(--dusk)" } }, React.createElement(I.Close, { size: 20 })),
          React.createElement("span", { style: { flex: 1, fontSize: 16 } }, "reset this device"),
          React.createElement("span", { style: { fontFamily: "var(--font-narrow)", fontWeight: 600, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-70)" } }, "clear")),

        React.createElement("p", { className: "accent", style: { fontSize: 18, color: "var(--ink-70)", marginTop: 34, lineHeight: 1.4 } },
          "would you spend time here even if nothing was happening?"),
        React.createElement("p", { style: { fontFamily: "var(--font-narrow)", fontWeight: 600, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-70)", marginTop: 18 } }, "samla · gather soon"))
    );
  }

  function SetToggle({ on, set, t, d }) {
    return React.createElement("div", { className: "set-row" },
      React.createElement("div", { style: { flex: 1 } },
        React.createElement("div", { className: "st" }, t),
        React.createElement("div", { className: "sd" }, d)),
      React.createElement("button", { className: "toggle" + (on ? " on" : ""), role: "switch", "aria-checked": !!on, onClick: () => set(!on), "aria-label": t },
        React.createElement("span", { className: "knob" })));
  }

  window.SamlaScreens = { Circles, CircleDetail, Profile, Settings };
})();
