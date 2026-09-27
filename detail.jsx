/* ============================================================
   DETAIL v3 — a note, up close. tag along, or do nothing.
   no reactions: acknowledging without joining is its own pressure.
   circles are shown only to the author.
   ============================================================ */
(function () {
  const { friend } = window.SamlaData;
  const I = window.Icons;
  const { Avatar, AvatarStack, ScreenHead, ModeTag, namesLine, audience, fadesLine, upFor } = window.Samla;
  const h = React.createElement;

  function Detail({ b, going, onBack, onToggleGoing, onToggleShare, onEdit, onTakeDown }) {
    const { PlaceArt, detectActivity } = window.SamlaActivity;
    const f = friend(b.author) || { name: "someone" };
    const taggers = (b.taggedAlong || []).filter((x) => x !== "you");
    const allGoing = going ? [...taggers, "you"] : taggers;
    const [sure, setSure] = React.useState(false);
    React.useEffect(() => { if (!sure) return; const t = setTimeout(() => setSure(false), 3200); return () => clearTimeout(t); }, [sure]);

    return h("div", { className: "body screen-anim" },
      h(ScreenHead, { onBack }),
      h("div", { className: "pad", style: { paddingBottom: b.mine ? 60 : 190 } },
        h("div", { style: { position: "relative" } },
          h(PlaceArt, { place: b.place, mode: b.mode, kind: b.kind || detectActivity(b.title), height: 190, radius: 22, big: true }),
          h("span", { className: "place-art-mode" }, h(ModeTag, { mode: b.mode }))),
        h("div", { className: "note-who", style: { marginTop: 20 } },
          !b.mine && h(Avatar, { id: b.author, size: 24 }),
          h("span", { className: "t-label" }, upFor(b))),
        h("h1", { className: "t-title", style: { marginTop: 10 } }, b.title),
        b.note && h("p", { className: "t-accent", style: { marginTop: 14 } }, "\u201c" + b.note + "\u201d"),

        h("div", { className: "meta-list" },
          h(MetaRow, { icon: h(I.Clock, { size: 19 }), label: "when", value: b.timeLabel }),
          b.place && h(MetaRow, { icon: h(I.Pin, { size: 19 }), label: "where", value: b.place }),
          b.mine && h(MetaRow, { icon: h(I.Circles, { size: 19 }), label: "for", value: audience(b) })),

        b.mine
          ? h("div", { style: { marginTop: 26 } },
              h("div", { className: "eyebrow ink", style: { marginBottom: 8 } }, "tagging along"),
              taggers.length
                ? taggers.map((id) => h(GoRow, { key: id, id }))
                : h("p", { className: "t-sub" }, "quiet so far \u2014 that\u2019s fine. give it time."),
              h("div", { className: "set-row", style: { marginTop: 8 } },
                h(I.Eye, { size: 20, style: { color: "var(--dusk)", flex: "none" } }),
                h("div", { style: { flex: 1 } },
                  h("div", { className: "st", id: "share-l" }, "let them see who else is coming"),
                  h("div", { className: "sd" }, "off by default \u2014 no room to read.")),
                h("button", { className: "toggle" + (b.shareAttendance ? " on" : ""), role: "switch", "aria-checked": !!b.shareAttendance, "aria-labelledby": "share-l", onClick: onToggleShare }, h("span", { className: "knob" }))),
              h("p", { className: "fades" }, h(I.Clock, { size: 15 }), fadesLine(b)),
              h("div", { style: { display: "flex", gap: 10, marginTop: 20 } },
                h("button", { className: "btn btn-ghost", style: { flex: 1 }, onClick: onEdit }, "edit"),
                h("button", { className: "btn btn-ghost" + (sure ? " btn-sure" : ""), style: { flex: 1.4 }, onClick: () => sure ? onTakeDown() : setSure(true) }, sure ? "tap again to take down" : "take it down")),
              h("p", { className: "foot-line" }, "taking it down leaves no trace. no one is told."))
          : h("div", { style: { marginTop: 26 } },
              b.shareAttendance && allGoing.length
                ? h(React.Fragment, null,
                    h("div", { className: "eyebrow ink", style: { marginBottom: 12 } }, "tagging along"),
                    h("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, h(AvatarStack, { ids: allGoing, size: 32, max: 6 }), h("span", { className: "t-sub" }, namesLine(allGoing))))
                : h("div", { style: { display: "flex", gap: 12, alignItems: "flex-start" } },
                    h(I.Lock, { size: 18, style: { color: "var(--dusk)", marginTop: 2, flex: "none" } }),
                    h("p", { className: "t-sub" }, "who else is coming stays with ", h("b", { style: { color: "var(--ink)", fontWeight: 600 } }, f.name), ". no room to read, no pressure to match.")))),

      !b.mine && h("div", { className: "dock" },
        h("button", { className: "btn " + (going ? "btn-ghost" : "btn-primary") + " btn-block", onClick: onToggleGoing, "aria-pressed": going },
          going ? h(I.Check, { size: 20 }) : h(I.GlyphMark, { size: 20, color: "var(--paper)" }),
          going ? "you\u2019re tagging along" : "i\u2019ll tag along"),
        h("p", { className: "foot-line", style: { marginTop: 12 } }, "or do nothing \u2014 " + f.name + " won\u2019t know you looked.")));
  }

  function MetaRow({ icon, label, value }) {
    return h("div", { className: "meta-row" },
      h("span", { className: "meta-ico", "aria-hidden": "true" }, icon),
      h("span", { className: "t-label", style: { width: 52, flex: "none" } }, label),
      h("span", { className: "t-body", style: { flex: 1, minWidth: 0 } }, value));
  }

  function GoRow({ id }) {
    const f = friend(id) || { name: id };
    return h("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: "10px 0" } },
      h(Avatar, { id, size: 34 }), h("span", { className: "t-body" }, f.name));
  }

  window.SamlaDetail = { Detail };
})();
