/* ============================================================
   APP v2 — shell, state, nav (3 tabs + centre FAB)
   notes expire on their own · settings live inside "you"
   ============================================================ */
(function () {
  const D = window.SamlaData;
  const { INCOMING, FRIENDS, CIRCLES, SEED_BROADCASTS, SETTINGS, CIRCLE_COVERS } = D;
  const I = window.Icons;

  const LS_KEY = "samla_state_v3";
  const persisted = (() => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "null"); } catch (e) { return null; } })();
  if (persisted) {
    if (Array.isArray(persisted.circles)) { CIRCLES.length = 0; persisted.circles.forEach((c) => CIRCLES.push(c)); }
    if (Array.isArray(persisted.friends) && persisted.friends.length) { FRIENDS.length = 0; persisted.friends.forEach((f) => FRIENDS.push(f)); }
    if (persisted.settings) Object.assign(SETTINGS, persisted.settings);
  }
  const onboarded = !!(persisted && persisted.onboarded);
  const safeScreen = (s) => (["home", "circles", "profile", "settings"].includes(s) ? s : "home");
  const alive = (b, now) => !b.expiresAt || b.expiresAt > now;
  const { StatusBar, Avatar, expiryFor } = window.Samla;
  const { StreamHome, MapHome } = window.SamlaHome;
  const { Compose } = window.SamlaCompose;
  const { Detail } = window.SamlaDetail;
  const { Circles, CircleDetail, Profile, Settings } = window.SamlaScreens;
  const { Onboarding } = window.SamlaOnboarding;
  const { ActionSheet } = window.SamlaActions;
  const h = React.createElement;

  function App() {
    const [screen, setScreen] = React.useState(onboarded ? safeScreen(persisted.screen) : "onboarding");
    const [done, setDone] = React.useState(onboarded);
    const [arrived, setArrived] = React.useState(!!(persisted && persisted.arrived));
    const [homeVariant, setHomeVariant] = React.useState((persisted && persisted.homeVariant === "map") ? "map" : "stream");
    const [broadcasts, setBroadcasts] = React.useState(persisted && persisted.broadcasts ? persisted.broadcasts : SEED_BROADCASTS.slice());
    const [composeOpen, setComposeOpen] = React.useState(false);
    const [editing, setEditing] = React.useState(null);
    const [detailId, setDetailId] = React.useState(null);
    const [returnTo, setReturnTo] = React.useState("home");
    const [circleId, setCircleId] = React.useState(null);
    const [toasts, setToasts] = React.useState([]);
    const [sheet, setSheet] = React.useState(null);
    const [now, setNow] = React.useState(Date.now());
    const [, setRev] = React.useState(0);
    const bump = () => setRev((r) => r + 1);


    // notes fade on their own — re-check every minute
    React.useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(t); }, []);
    const live = broadcasts.filter((b) => alive(b, now));

    React.useEffect(() => {
      try { localStorage.setItem(LS_KEY, JSON.stringify({ broadcasts: live, homeVariant, screen: safeScreen(screen), circles: CIRCLES, friends: FRIENDS, settings: SETTINGS, onboarded: done, arrived })); } catch (e) {}
    });

    const pushToast = (node) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, node }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5600);
    };

    React.useEffect(() => {
      if (arrived || screen !== "home") return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const t = setTimeout(() => {
        setBroadcasts((b) => b.find((x) => x.id === INCOMING.id) ? b : [{ ...INCOMING, expiresAt: expiryFor("later"), shareAttendance: false, myReaction: null }, ...b]);
        pushToast(h(React.Fragment, null, h(Avatar, { id: "alex", size: 26 }),
          h("span", null, h("b", { style: { fontWeight: 600 } }, "Alex"), " is up for ", h("span", { className: "accent" }, INCOMING.title))));
        setArrived(true);
      }, reduce ? 600 : INCOMING.arrivesAt);
      return () => clearTimeout(t);
    }, [screen]);

    const updateB = (id, patch) => setBroadcasts((bs) => bs.map((b) => b.id === id ? { ...b, ...(typeof patch === "function" ? patch(b) : patch) } : b));
    const openDetail = (b) => { setReturnTo(screen); setDetailId(b.id); setScreen("detail"); };
    const detailB = live.find((b) => b.id === detailId);

    const openCompose = (note) => { setEditing(note || null); setComposeOpen(true); };
    const closeCompose = () => { setComposeOpen(false); setTimeout(() => setEditing(null), 450); };

    const publish = (payload, editId) => {
      closeCompose();
      if (editId) {
        updateB(editId, payload);
        pushToast(h(React.Fragment, null, h(I.Check, { size: 18, style: { color: "var(--amber)" } }), h("span", null, "note updated · ", h("span", { className: "accent" }, payload.title))));
        return;
      }
      const id = "b-" + Date.now();
      setBroadcasts((b) => [{ ...payload, id, author: "you", mine: true, taggedAlong: [], shareAttendance: SETTINGS.shareDefault, myReaction: null }, ...b]);
      pushToast(h(React.Fragment, null, h(I.Check, { size: 18, style: { color: "var(--amber)" } }),
        h("span", null, "left on the door · ", h("span", { className: "accent" }, payload.title))));
      setTimeout(() => {
        updateB(id, (b) => ({ taggedAlong: [...(b.taggedAlong || []), "chloe"] }));
        pushToast(h(React.Fragment, null, h(Avatar, { id: "chloe", size: 26 }),
          h("span", null, h("b", { style: { fontWeight: 600 } }, "Chloe"), " is tagging along · ", h("span", { className: "accent" }, payload.title))));
      }, 4600);
    };

    const takeDown = (id) => {
      setBroadcasts((bs) => bs.filter((b) => b.id !== id));
      setScreen(safeScreen(returnTo));
      pushToast(h(React.Fragment, null, h(I.Check, { size: 18, style: { color: "var(--amber)" } }), h("span", null, "taken down · ", h("span", { className: "accent" }, "no trace left."))));
    };

    const toggleGoing = () => {
      const going = (detailB.taggedAlong || []).includes("you");
      updateB(detailB.id, (b) => ({ taggedAlong: going ? b.taggedAlong.filter((x) => x !== "you") : [...(b.taggedAlong || []), "you"] }));
      if (!going) pushToast(h(React.Fragment, null, h(I.GatherGlyph, { size: 24, sw: 1.6 }),
        h("span", null, "you\u2019re tagging along · ", h("span", { className: "accent" }, "a gentle tap back to " + (D.friend(detailB.author) || {}).name))));
    };
    const finishOnboarding = (res) => {
      if (res) {
        SETTINGS.location = !!res.perms.location;
        SETTINGS.alerts = !!res.perms.alerts;
        const name = (res.circleName || "").trim();
        if (name && res.inCircle.length) {
          const existing = CIRCLES.find((c) => c.name.toLowerCase() === name.toLowerCase());
          if (existing) existing.friends = res.inCircle.slice();
          else CIRCLES.push({ id: "c" + Date.now(), name, friends: res.inCircle.slice(), cover: CIRCLE_COVERS[CIRCLES.length % CIRCLE_COVERS.length] });
          setTimeout(() => pushToast(h(React.Fragment, null, h(I.Check, { size: 18, style: { color: "var(--amber)" } }), h("span", null, "circle made · ", h("span", { className: "accent" }, name.toLowerCase())))), 700);
        }
      }
      setDone(true);
      bump();
      setScreen("home");
    };

    const resetDevice = () => {
      try { ["samla_state_v3", "samla_draft_v3", "samla_install_dismissed"].forEach((k) => localStorage.removeItem(k)); } catch (e) {}
      window.location.reload();
    };

    const showChrome = ["home", "circles", "profile"].includes(screen);
    let view;
    if (screen === "onboarding") {
      view = h(Onboarding, { onDone: finishOnboarding, onSheet: setSheet });
    } else if (screen === "detail" && detailB) {
      view = h(Detail, {
        b: detailB, going: (detailB.taggedAlong || []).includes("you"),
        onBack: () => setScreen(safeScreen(returnTo)), onToggleGoing: toggleGoing,
        onToggleShare: () => updateB(detailB.id, (b) => ({ shareAttendance: !b.shareAttendance })),
        onEdit: () => openCompose(detailB), onTakeDown: () => takeDown(detailB.id),
      });
    } else if (screen === "circles") {
      view = h(Circles, { onOpenCircle: (id) => { setCircleId(id); setScreen("circleDetail"); }, onNew: () => setSheet({ type: "newCircle" }) });
    } else if (screen === "circleDetail" && D.circle(circleId)) {
      view = h(CircleDetail, { id: circleId, onBack: () => setScreen("circles"), onAddFriend: () => setSheet({ type: "addFriend", circleId }), onEdit: () => setSheet({ type: "editCircle", circleId }) });
    } else if (screen === "profile") {
      view = h(Profile, { onSettings: () => setScreen("settings"), onAdd: () => setSheet({ type: "addFriend" }), onCode: () => setSheet({ type: "code" }), onEditProfile: () => setSheet({ type: "editProfile" }), onCircles: () => setScreen("circles") });
    } else if (screen === "settings") {
      view = h(Settings, { onBack: () => setScreen("profile"), onChange: bump, onEditProfile: () => setSheet({ type: "editProfile" }), onCode: () => setSheet({ type: "code" }), onReplayOnboarding: () => setScreen("onboarding"), onReset: () => setSheet({ type: "reset" }) });
    } else {
      view = h(HomeView, { variant: homeVariant, broadcasts: live, onOpen: openDetail });
    }
    const isMap = screen === "home" && homeVariant === "map";

    return h("div", { className: "stage" },
      h("div", { className: "phone grain-soft" },
        h("div", { className: "screen" },
          screen !== "onboarding" && h(StatusBar, { dark: isMap }),
          view,
          screen === "home" && h(HomeToggle, { variant: homeVariant, onSet: setHomeVariant, onMap: isMap }),
          showChrome && h(Nav, { screen, go: setScreen, onCompose: () => openCompose(null) })
        ),
        h(Compose, { open: composeOpen, editing, onClose: closeCompose, onPublish: publish }),
        h(ActionSheet, { sheet, onClose: () => setSheet(null), onChange: bump, toast: pushToast, onCircleGone: () => setScreen("circles"), onReset: resetDevice }),
        h("div", { className: "toast-zone", role: "status", "aria-live": "polite" },
          toasts.map((t) => h("div", { key: t.id, className: "toast" }, t.node))),
        showChrome && h(InstallNudge, null)
      )
    );
  }

  function HomeView({ variant, broadcasts, onOpen }) {
    const [shown, setShown] = React.useState(variant);
    const [vis, setVis] = React.useState(true);
    React.useEffect(() => {
      if (shown === variant) return;
      setVis(false);
      const t = setTimeout(() => { setShown(variant); setVis(true); }, 210);
      return () => clearTimeout(t);
    }, [variant]);
    const Inner = shown === "map" ? MapHome : StreamHome;
    return h("div", { className: "home-fade" + (vis ? " in" : ""), style: { flex: 1, display: "flex", flexDirection: "column", minHeight: 0 } }, h(Inner, { broadcasts, onOpen }));
  }

  function HomeToggle({ variant, onSet, onMap }) {
    const listIco = h("svg", { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", "aria-hidden": "true" }, h("path", { d: "M5 7h14M5 12h14M5 17h9" }));
    return h("div", { className: "home-toggle" + (onMap ? " on-map" : ""), role: "group", "aria-label": "home view" },
      h("button", { className: variant === "stream" ? "on" : "", onClick: () => onSet("stream"), "aria-pressed": variant === "stream" }, listIco, "list"),
      h("button", { className: variant === "map" ? "on" : "", onClick: () => onSet("map"), "aria-pressed": variant === "map" }, h(I.Pin, { size: 15, sw: 2 }), "map"));
  }

  /* notched bar + round FAB · once-a-day "i’m up for.." hint (B + D) */
  function Nav({ screen, go, onCompose }) {
    const item = (label, icon, target) => {
      const on = screen === target;
      return h("button", { className: "nav-item" + (on ? " on" : ""), onClick: () => go(target), "aria-current": on ? "page" : undefined }, icon, h("span", { className: "nl" }, label));
    };
    const [hint, setHint] = React.useState(false);
    React.useEffect(() => {
      const today = new Date().toDateString();
      let seen = null;
      try { seen = localStorage.getItem("samla_hint_day"); } catch (e) {}
      if (seen === today) return;
      try { localStorage.setItem("samla_hint_day", today); } catch (e) {}
      setHint(true);
      const off = () => setHint(false);
      const t = setTimeout(off, 6000);
      const d = setTimeout(() => window.addEventListener("pointerdown", off, { once: true }), 300);
      return () => { clearTimeout(t); clearTimeout(d); window.removeEventListener("pointerdown", off); };
    }, []);
    return h("nav", { className: "nav nav-v5", "aria-label": "main" },
      h("svg", { className: "nav-notch", viewBox: "0 0 430 100", preserveAspectRatio: "none", "aria-hidden": "true" },
        h("path", { d: "M0 18 H165 C181 18 178 52 215 52 C252 52 249 18 265 18 H430 V100 H0 Z" })),
      hint && h("div", { className: "nav-hint", role: "status" }, "i’m up for..", h("em", null, "leave a note for your people")),
      h("div", { className: "nav-side" }, item("home", h(I.Home, { size: 23 }), "home")),
      h("button", { className: "nav-fab", onClick: () => { setHint(false); onCompose(); }, "aria-label": "leave a note" }, h(I.GlyphMark, { size: 32, color: "var(--paper)", spark: "var(--ink)" })),
      h("div", { className: "nav-side" }, item("circles", h(I.Circles, { size: 23 }), "circles"), item("you", h(I.Person, { size: 23 }), "profile")));
  }

  function InstallNudge() {
    const [show, setShow] = React.useState(false);
    React.useEffect(() => {
      let dismissed = false;
      try { dismissed = localStorage.getItem("samla_install_dismissed") === "1"; } catch (e) {}
      if (dismissed) return;
      const sync = () => setShow(!!window.__samlaInstall);
      sync();
      const onGone = () => setShow(false);
      window.addEventListener("samla-installable", sync);
      window.addEventListener("samla-installed", onGone);
      return () => { window.removeEventListener("samla-installable", sync); window.removeEventListener("samla-installed", onGone); };
    }, []);
    if (!show) return null;
    const dismiss = () => { try { localStorage.setItem("samla_install_dismissed", "1"); } catch (e) {} setShow(false); };
    const install = async () => {
      const p = window.__samlaInstall;
      if (!p) { dismiss(); return; }
      try { p.prompt(); await p.userChoice; } catch (e) {}
      window.__samlaInstall = null; setShow(false);
    };
    return h("div", { className: "install-nudge" },
      h("span", { className: "in-mark" }, h(I.GlyphMark, { size: 22 })),
      h("div", { className: "in-copy" }, h("div", { className: "in-t" }, "keep samla close"), h("div", { className: "in-d" }, "add it to your home screen")),
      h("button", { className: "in-add", onClick: install }, "add"),
      h("button", { className: "in-x", onClick: dismiss, "aria-label": "dismiss" }, h(I.Close, { size: 18 })));
  }

  ReactDOM.createRoot(document.getElementById("root")).render(h(App));
})();
