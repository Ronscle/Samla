/* ============================================================
   ACTIONS — bottom sheets that make every page do something:
   new circle · add friend · edit profile · your code
   Mutates SamlaData arrays in place, then calls onChange() to
   bump a revision counter so the app re-renders.
   ============================================================ */
(function () {
  const D = window.SamlaData;
  const { FRIENDS, CIRCLES, INVITABLE, CIRCLE_COVERS, friend, circle } = D;
  const I = window.Icons;
  const { Avatar } = window.Samla;

  function MiniQr({ size = 132 }) {
    const seed = [1,0,1,1,0,1,0,1,0,1,1,0,1,0,0,1,1,1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,1,0,1,0];
    const cells = []; for (let i = 0; i < 36; i++) if (seed[i]) cells.push(i);
    const u = size / 70;
    return React.createElement("svg", { width: size, height: size, viewBox: "0 0 70 70" },
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

  function SheetHead({ eyebrow, title, onClose }) {
    return React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 } },
      React.createElement("div", null,
        React.createElement("div", { className: "eyebrow terra" }, eyebrow),
        React.createElement("h2", { className: "t-title", style: { marginTop: 8 } }, title)),
      React.createElement("button", { onClick: onClose, "aria-label": "close",
        style: { background: "none", border: "1px solid var(--ink-15)", borderRadius: "50%", width: 38, height: 38, cursor: "pointer", display: "grid", placeItems: "center", color: "var(--ink-70)" } },
        React.createElement(I.Close, { size: 20 })));
  }

  /* ---------------- NEW CIRCLE ---------------- */
  function NewCircle({ onClose, onChange, toast }) {
    const [name, setName] = React.useState("");
    const [sel, setSel] = React.useState([]);
    const toggle = (id) => setSel((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
    const ready = name.trim().length > 0;
    const create = () => {
      const cover = CIRCLE_COVERS[CIRCLES.length % CIRCLE_COVERS.length];
      CIRCLES.push({ id: "c" + Date.now(), name: name.trim(), friends: sel, cover });
      onChange(); onClose();
      toast(React.createElement(React.Fragment, null, React.createElement(I.Check, { size: 18, style: { color: "var(--amber)" } }),
        React.createElement("span", null, "circle made · ", React.createElement("span", { className: "accent" }, name.trim()))));
    };
    const people = FRIENDS.filter((f) => f.id !== "you");
    return React.createElement("div", { className: "sheet-body" },
      React.createElement(SheetHead, { eyebrow: "circles of trust", title: "new circle", onClose }),
      React.createElement("div", { className: "field", style: { marginTop: 18 } },
        React.createElement("span", { className: "field-label" }, "name this circle"),
        React.createElement("input", { className: "input input-lg", value: name, onChange: (e) => setName(e.target.value), placeholder: "book club, work, …", maxLength: 28, autoFocus: true })),
      React.createElement("div", { className: "field" },
        React.createElement("span", { className: "field-label" }, "who\u2019s in it  ·  " + (sel.length ? sel.length + " chosen" : "optional")),
        React.createElement("div", { className: "row-wrap" },
          people.map((f) => React.createElement("button", { key: f.id, className: "chip" + (sel.includes(f.id) ? " on" : ""), onClick: () => toggle(f.id), style: { paddingLeft: 6 } },
            React.createElement(Avatar, { id: f.id, size: 22 }), f.name)))),
      React.createElement("button", { className: "btn btn-primary btn-block", style: { marginTop: 26 }, disabled: !ready, onClick: create },
        React.createElement(I.Plus, { size: 18 }), "create circle"),
      React.createElement("p", { style: { textAlign: "center", fontSize: 14, color: "var(--ink-70)", marginTop: 14 } }, "only you ever see this circle")
    );
  }

  /* ---------------- ADD FRIEND ---------------- */
  function AddFriend({ circleId, initialTab, onClose, onChange, toast }) {
    const c = circleId ? circle(circleId) : null;
    const [tab, setTab] = React.useState(initialTab || (c ? "search" : "qr"));
    const [q, setQ] = React.useState("");

    // who can be added: existing friends not in this circle, OR invitable strangers
    const pool = c
      ? FRIENDS.filter((f) => f.id !== "you" && !c.friends.includes(f.id))
      : INVITABLE.filter((f) => !FRIENDS.some((x) => x.id === f.id));
    const filtered = pool.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()));

    const add = (f) => {
      if (c) {
        c.friends.push(f.id);
        toast(React.createElement(React.Fragment, null, React.createElement(Avatar, { id: f.id, size: 26 }),
          React.createElement("span", null, React.createElement("b", { style: { fontWeight: 600 } }, f.name), " added to ", React.createElement("span", { className: "accent" }, c.name))));
      } else {
        FRIENDS.push({ ...f });
        toast(React.createElement(React.Fragment, null, React.createElement(Avatar, { id: f.id, size: 26 }),
          React.createElement("span", null, "request sent to ", React.createElement("b", { style: { fontWeight: 600 } }, f.name))));
      }
      onChange();
    };

    const copyLink = () => {
      try { navigator.clipboard && navigator.clipboard.writeText("https://samla.app/i/sam-7Q2"); } catch (e) {}
      toast(React.createElement(React.Fragment, null, React.createElement(I.Link, { size: 18, style: { color: "var(--amber)" } }),
        React.createElement("span", null, "invite link copied")));
    };

    const tabs = c
      ? [["search", "from friends"]]
      : [["qr", "my code"], ["link", "link"], ["search", "search"]];

    return React.createElement("div", { className: "sheet-body" },
      React.createElement(SheetHead, { eyebrow: c ? "add to " + c.name : "add a friend", title: c ? "bring them in" : "a small circle", onClose }),
      tabs.length > 1 && React.createElement("div", { className: "row-wrap", style: { marginTop: 18 } },
        tabs.map(([k, label]) => React.createElement("button", { key: k, className: "chip" + (tab === k ? " on" : ""), onClick: () => setTab(k) }, label))),

      tab === "qr" && React.createElement("div", { style: { textAlign: "center", padding: "26px 0 6px" } },
        React.createElement("div", { style: { width: 168, height: 168, background: "var(--cream)", borderRadius: 22, display: "grid", placeItems: "center", margin: "0 auto" } }, React.createElement(MiniQr, null)),
        React.createElement("p", { className: "accent", style: { fontSize: 18, marginTop: 18 } }, "let them scan this."),
        React.createElement("p", { style: { fontSize: 14, color: "var(--ink-70)", marginTop: 6 } }, "they scan, you confirm \u2014 the whole handshake.")),

      tab === "link" && React.createElement("div", { style: { padding: "22px 0 6px" } },
        React.createElement("span", { className: "field-label" }, "your invite link"),
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, border: "1px solid var(--ink-15)", borderRadius: 14, padding: "13px 15px", marginTop: 8 } },
          React.createElement(I.Link, { size: 18, style: { color: "var(--dusk)", flex: "none" } }),
          React.createElement("span", { style: { flex: 1, fontSize: 14, color: "var(--ink-70)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, "samla.app/i/sam-7Q2")),
        React.createElement("button", { className: "btn btn-primary btn-block", style: { marginTop: 16 }, onClick: copyLink }, "copy link"),
        React.createElement("p", { style: { textAlign: "center", fontSize: 14, color: "var(--ink-70)", marginTop: 14 } }, "send it by text or email. one tap, they\u2019re in.")),

      tab === "search" && React.createElement("div", { style: { padding: "20px 0 6px" } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--ink-25)", paddingBottom: 8 } },
          React.createElement(I.Search, { size: 18, style: { color: "var(--ink-70)" } }),
          React.createElement("input", { className: "input", style: { border: "none", fontSize: 17, padding: 0 }, value: q, onChange: (e) => setQ(e.target.value), placeholder: c ? "search your friends" : "name or phone number", autoFocus: true })),
        React.createElement("div", { style: { marginTop: 10 } },
          filtered.length === 0
            ? React.createElement("p", { className: "accent", style: { fontSize: 18, color: "var(--ink-70)", padding: "20px 0", textAlign: "center" } }, c ? "everyone\u2019s already in this circle." : "no one left to add here.")
            : filtered.map((f) => React.createElement("div", { key: f.id, className: "list-row" },
                React.createElement(Avatar, { id: f.id, size: 42 }),
                React.createElement("div", { style: { flex: 1 } },
                  React.createElement("div", { style: { fontSize: 16 } }, f.name),
                  React.createElement("div", { className: "accent", style: { fontSize: 14, color: "var(--dusk)" } }, f.role || f.hint || "")),
                React.createElement("button", { className: "chip", onClick: () => add(f) }, c ? "add" : "invite")))))
    );
  }

  /* ---------------- EDIT PROFILE ---------------- */
  function EditProfile({ onClose, onChange, toast }) {
    const you = friend("you");
    const [name, setName] = React.useState(you.name === "You" ? "Sam" : you.name);
    const [color, setColor] = React.useState(you.color);
    const opts = [D.C.amber, D.C.terracotta, D.C.dusk];
    const save = () => {
      you.name = name.trim() || "Sam";
      you.initials = (name.trim()[0] || "S").toUpperCase();
      you.color = color;
      onChange(); onClose();
      toast(React.createElement(React.Fragment, null, React.createElement(I.Check, { size: 18, style: { color: "var(--amber)" } }), React.createElement("span", null, "saved")));
    };
    return React.createElement("div", { className: "sheet-body" },
      React.createElement(SheetHead, { eyebrow: "you", title: "your look", onClose }),
      React.createElement("div", { style: { display: "flex", justifyContent: "center", margin: "20px 0 6px" } },
        React.createElement("span", { className: "av", style: { width: 88, height: 88, background: color, fontSize: 34, textTransform: "uppercase" } }, (name.trim()[0] || "S"))),
      React.createElement("div", { className: "field" },
        React.createElement("span", { className: "field-label" }, "display name"),
        React.createElement("input", { className: "input input-lg", value: name, onChange: (e) => setName(e.target.value), maxLength: 24 })),
      React.createElement("div", { className: "field" },
        React.createElement("span", { className: "field-label" }, "your colour"),
        React.createElement("div", { className: "row-wrap" },
          opts.map((cc) => React.createElement("button", { key: cc, onClick: () => setColor(cc), "aria-label": "colour",
            style: { width: 44, height: 44, borderRadius: "50%", background: cc, border: color === cc ? "2px solid var(--ink)" : "2px solid transparent", outline: color === cc ? "2px solid var(--paper)" : "none", outlineOffset: -4, cursor: "pointer", boxShadow: "0 0 0 1px var(--ink-15)" } })))),
      React.createElement("button", { className: "btn btn-primary btn-block", style: { marginTop: 26 }, onClick: save }, "save"),
      React.createElement("p", { style: { textAlign: "center", fontSize: 14, color: "var(--ink-70)", marginTop: 14 } }, "no photo needed \u2014 a colour and a name is enough")
    );
  }

  /* ---------------- YOUR CODE ---------------- */
  function YourCode({ onClose, toast }) {
    const copyLink = () => {
      try { navigator.clipboard && navigator.clipboard.writeText("https://samla.app/u/sam"); } catch (e) {}
      toast(React.createElement(React.Fragment, null, React.createElement(I.Link, { size: 18, style: { color: "var(--amber)" } }), React.createElement("span", null, "link copied")));
    };
    return React.createElement("div", { className: "sheet-body", style: { textAlign: "center" } },
      React.createElement(SheetHead, { eyebrow: "your code", title: "share you", onClose }),
      React.createElement("div", { style: { width: 196, height: 196, background: "var(--cream)", borderRadius: 24, display: "grid", placeItems: "center", margin: "24px auto 0" } }, React.createElement(MiniQr, { size: 150 })),
      React.createElement("p", { className: "accent", style: { fontSize: 18, marginTop: 20 } }, "samla.app/u/sam"),
      React.createElement("button", { className: "btn btn-ghost", style: { marginTop: 18 }, onClick: copyLink }, React.createElement(I.Link, { size: 16 }), "copy link"),
      React.createElement("p", { style: { fontSize: 14, color: "var(--ink-70)", marginTop: 18, lineHeight: 1.5 } }, "anyone with this can send a request.", React.createElement("br"), "your circles stay private.")
    );
  }

  /* ---------------- EDIT CIRCLE ---------------- */
  function EditCircle({ circleId, onClose, onChange, toast, onGone }) {
    const c = circle(circleId);
    const [name, setName] = React.useState(c ? c.name : "");
    const [sel, setSel] = React.useState(c ? c.friends.slice() : []);
    const [sure, setSure] = React.useState(false);
    React.useEffect(() => { if (!sure) return; const t = setTimeout(() => setSure(false), 3200); return () => clearTimeout(t); }, [sure]);
    if (!c) return null;
    const toggle = (id) => setSel((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
    const save = () => {
      c.name = name.trim() || c.name; c.friends = sel;
      onChange(); onClose();
      toast(React.createElement(React.Fragment, null, React.createElement(I.Check, { size: 18, style: { color: "var(--amber)" } }), React.createElement("span", null, "saved · ", React.createElement("span", { className: "accent" }, c.name.toLowerCase()))));
    };
    const letGo = () => {
      if (!sure) { setSure(true); return; }
      const nm = c.name; CIRCLES.splice(CIRCLES.indexOf(c), 1);
      onChange(); onClose(); onGone && onGone();
      toast(React.createElement(React.Fragment, null, React.createElement(I.Check, { size: 18, style: { color: "var(--amber)" } }), React.createElement("span", null, nm.toLowerCase() + " · ", React.createElement("span", { className: "accent" }, "let go. no one is told."))));
    };
    const people = FRIENDS.filter((f) => f.id !== "you");
    return React.createElement("div", { className: "sheet-body" },
      React.createElement(SheetHead, { eyebrow: "circles of trust", title: "edit circle", onClose }),
      React.createElement("div", { className: "field", style: { marginTop: 18 } },
        React.createElement("label", { className: "field-label", htmlFor: "ec-name" }, "name"),
        React.createElement("input", { id: "ec-name", className: "input input-lg", value: name, onChange: (e) => setName(e.target.value), maxLength: 28 })),
      React.createElement("div", { className: "field" },
        React.createElement("span", { className: "field-label" }, "who\u2019s in it"),
        React.createElement("div", { className: "row-wrap" },
          people.map((f) => React.createElement("button", { key: f.id, className: "chip" + (sel.includes(f.id) ? " on" : ""), "aria-pressed": sel.includes(f.id), onClick: () => toggle(f.id), style: { paddingLeft: 6 } },
            React.createElement(Avatar, { id: f.id, size: 22 }), f.name)))),
      React.createElement("p", { className: "helper" }, "removing someone is quiet — they\u2019re never told."),
      React.createElement("button", { className: "btn btn-primary btn-block", style: { marginTop: 22 }, onClick: save }, "save"),
      React.createElement("button", { className: "btn btn-ghost btn-block" + (sure ? " btn-sure" : ""), style: { marginTop: 10 }, onClick: letGo }, sure ? "tap again to let it go" : "let this circle go"));
  }

  /* ---------------- CONFIRM RESET ---------------- */
  function ConfirmReset({ onClose, onReset }) {
    return React.createElement("div", { className: "sheet-body" },
      React.createElement(SheetHead, { eyebrow: "this device", title: "clear samla?", onClose }),
      React.createElement("p", { style: { fontSize: 14, color: "var(--ink-70)", marginTop: 14, lineHeight: 1.55 } }, "your circles, notes and settings leave this phone. nothing is sent anywhere."),
      React.createElement("button", { className: "btn btn-primary btn-block", style: { marginTop: 24 }, onClick: onClose }, "keep everything"),
      React.createElement("button", { className: "btn btn-ghost btn-block", style: { marginTop: 10 }, onClick: onReset }, "clear this phone"));
  }

  function ActionSheet({ sheet, onClose, onChange, toast, onCircleGone, onReset }) {
    const open = !!sheet;
    let body = null;
    if (sheet) {
      if (sheet.type === "newCircle") body = React.createElement(NewCircle, { onClose, onChange, toast });
      else if (sheet.type === "addFriend") body = React.createElement(AddFriend, { key: sheet.tab || "x", circleId: sheet.circleId, initialTab: sheet.tab, onClose, onChange, toast });
      else if (sheet.type === "editProfile") body = React.createElement(EditProfile, { onClose, onChange, toast });
      else if (sheet.type === "code") body = React.createElement(YourCode, { onClose, toast });
      else if (sheet.type === "editCircle") body = React.createElement(EditCircle, { key: sheet.circleId, circleId: sheet.circleId, onClose, onChange, toast, onGone: onCircleGone });
      else if (sheet.type === "reset") body = React.createElement(ConfirmReset, { onClose, onReset });
    }
    return React.createElement(React.Fragment, null,
      React.createElement("div", { className: "scrim" + (open ? " show" : ""), onClick: onClose }),
      React.createElement("div", { className: "sheet" + (open ? " show" : "") },
        React.createElement("div", { className: "sheet-grab" }),
        body)
    );
  }

  window.SamlaActions = { ActionSheet };
})();
