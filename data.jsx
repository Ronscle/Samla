/* ============================================================
   DATA — seed friends, circles, broadcasts + helpers
   Scenario: Saturday morning, Södermalm.
   ============================================================ */
(function () {
  // colors drawn only from the palette
  const C = { dusk: "#5E788E", terracotta: "#D27652", amber: "#D6A456", ink: "#161412" };

  const FRIENDS = [
    { id: "you", name: "Sam", initials: "S", color: C.amber },
    { id: "chloe", name: "Chloe", initials: "Ch", color: C.dusk, role: "connector" },
    { id: "alex", name: "Alex", initials: "Al", color: C.terracotta, role: "spontaneous" },
    { id: "maria", name: "Maria", initials: "Ma", color: C.amber, role: "newcomer" },
    { id: "samir", name: "Samir", initials: "Sa", color: C.dusk, role: "selective" },
    { id: "lina", name: "Lina", initials: "Li", color: C.terracotta },
    { id: "otto", name: "Otto", initials: "Ot", color: C.dusk },
    { id: "freja", name: "Freja", initials: "Fr", color: C.amber },
    { id: "emil", name: "Emil", initials: "Em", color: C.terracotta },
  ];

  const CIRCLES = [
    { id: "close", name: "Close friends", friends: ["chloe", "alex", "maria", "samir"], cover: C.terracotta },
    { id: "football", name: "Football crew", friends: ["alex", "otto", "emil", "samir"], cover: C.dusk },
    { id: "soder", name: "Söder neighbours", friends: ["lina", "freja", "maria"], cover: C.amber },
  ];

  // The single incoming broadcast that gently arrives on the quiet morning.
  const INCOMING = {
    id: "b-alex-ride",
    author: "alex",
    mode: "later",
    title: "slow ride by the water",
    note: "loop around Årstaviken, finishing with a fika. no rush.",
    place: "Tantolunden",
    timeLabel: "later · around 16:00",
    circle: "close",
    circles: ["close"],
    kind: "ride",
    when: { at: "around 16:00" },
    open: true,
    taggedAlong: ["maria"],
    reactions: {},
    mine: false,
    arrivesAt: 5200, // ms after landing on home
  };

  // Broadcasts the user creates during the scenario are added at runtime.
  const SEED_BROADCASTS = []; // home starts quiet — intentional emptiness

  // people you could invite (not yet friends)
  const INVITABLE = [
    { id: "noa", name: "Noa", initials: "No", color: C.dusk, hint: "from the climbing gym" },
    { id: "petra", name: "Petra", initials: "Pe", color: C.terracotta, hint: "book club" },
    { id: "hugo", name: "Hugo", initials: "Hu", color: C.amber, hint: "old flatmate" },
    { id: "ines", name: "Ines", initials: "In", color: C.dusk, hint: "works nearby" },
  ];

  // rotating cover palette for new circles
  const CIRCLE_COVERS = [C.dusk, C.terracotta, C.amber];

  function friend(id) { return FRIENDS.find((f) => f.id === id); }
  function circle(id) { return CIRCLES.find((c) => c.id === id); }

  const MODES = {
    now: { key: "now", label: "now", line: "i'm doing this now", helper: "a place, an optional note — sent to your circle.", cls: "mode-now" },
    later: { key: "later", label: "later today", line: "free later today", helper: "a rough window and an area. no fixed plan.", cls: "mode-later" },
    planned: { key: "planned", label: "planned", line: "a future hang", helper: "a specific time. kept small and quiet on purpose.", cls: "mode-planned" },
  };

  // gentle reaction set (locked, warm, non-gamified)
  const REACTIONS = ["👋", "🙂", "🌿", "🎉"];
  const REACTION_LABELS = { "👋": "wave", "🙂": "smile", "🌿": "take it easy", "🎉": "celebrate" };

  // device settings — privacy-first: permissions start off
  const SETTINGS = { location: false, alerts: false, quietHours: true, shareDefault: false, discoverable: false };

  window.SamlaData = { FRIENDS, CIRCLES, INCOMING, SEED_BROADCASTS, MODES, REACTIONS, REACTION_LABELS, SETTINGS, INVITABLE, CIRCLE_COVERS, friend, circle, C };
})();
