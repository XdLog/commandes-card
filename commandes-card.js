/*
 * Carte Commandes — custom:commandes-card
 *
 * Tout ce qui s'allume dans la maison, rangé par pièce, dans une seule carte : lampes, prises, interrupteurs,
 * ventilateurs, volets. Une prise ou une lampe qui mesure sa consommation affiche sa puissance, son énergie,
 * sa tension et son courant, avec la barre de charge du vert au rouge.
 *
 * Fusion de prises-card et lumieres-card de Marlboro62 (MIT) : https://github.com/Marlboro62
 * Le style, les gestes et une partie du code viennent de ces deux cartes.
 */
(() => {
const CARD_VERSION = "0.2.0";

const DEFAULTS = {
  title: "",
  icon: "mdi:home-lightning-bolt-outline",
  entities: [],
  labels: [],
  domains: ["light", "switch", "fan"],
  areas: [],
  rooms: [],
  exclude: [],
  locked: [],
  groups: "auto",
  off_button: "all",
  show_off: true,
  show_details: true,
  show_filter: true,
  show_scenes: false,
  scenes: [],
  max_scenes: 8,
  confirm: "auto",
  sort: "name",
  layout: "list",
  show_header: true,
  max_power: 2500,
  theme: "v2",
  language: "auto",
};

/* ---------------------------------------------------------------- textes */

const I18N = {
  fr: {
    title: "Maison", off: "Éteint", on: "Allumé", unavailable: "Indisponible", open: "Ouvert", closed: "Fermé", opening: "Ouverture…", closing: "Fermeture…",
    n_on: { one: "{n} appareil allumé", other: "{n} appareils allumés" }, none_on: "Tout est éteint",
    other_room: "Sans pièce", confirm_off: "Éteindre ?", confirm_on: "Allumer ?", locked: "Verrouillé : pas de commande depuis la carte",
    total: "Puissance totale", today: "aujourd'hui", collapse: "Replier ou déplier la pièce", history: "Historique",
    all_off: "Tout éteindre", lights_off: "Lumières", off_t: "Éteindre tout ce qui est allumé ici (sauf les appareils verrouillés)", confirm_all: "Éteindre {n} ?",
    brightness: "Luminosité", speed: "Vitesse", white: "Blanc", warm: "Chaud", cold: "Froid", color: "Couleur", details: "Plus de réglages", more: "Fiche complète",
    toggle: "Allumer ou éteindre", hold: "Appui : allumer ou éteindre ; appui long : fiche", run: "Lancer", done: "Lancé",
    up: "Ouvrir", stop: "Arrêter", down: "Fermer", shared: "Mesure commune à plusieurs sorties de l'appareil",
    f_all: "Tout", f_light: "Lumières", f_plug: "Prises", f_other: "Autres", scenes: "Scènes",
    none: "Rien à afficher", none_hint: "La carte cherche les lumières, prises et interrupteurs rangés dans une pièce. Vous pouvez aussi les choisir avec les options entities ou labels.",
  },
  en: {
    title: "Home", off: "Off", on: "On", unavailable: "Unavailable", open: "Open", closed: "Closed", opening: "Opening…", closing: "Closing…",
    n_on: { one: "{n} device on", other: "{n} devices on" }, none_on: "Everything is off",
    other_room: "No room", confirm_off: "Turn off?", confirm_on: "Turn on?", locked: "Locked: no control from the card",
    total: "Total power", today: "today", collapse: "Collapse or expand the room", history: "History",
    all_off: "Turn all off", lights_off: "Lights", off_t: "Turn off everything that is on here (except locked devices)", confirm_all: "Turn off {n}?",
    brightness: "Brightness", speed: "Speed", white: "White", warm: "Warm", cold: "Cold", color: "Colour", details: "More settings", more: "Details",
    toggle: "Turn on or off", hold: "Tap: on or off; long press: details", run: "Run", done: "Done",
    up: "Open", stop: "Stop", down: "Close", shared: "Measurement shared by several outputs of the device",
    f_all: "All", f_light: "Lights", f_plug: "Plugs", f_other: "Other", scenes: "Scenes",
    none: "Nothing to show", none_hint: "The card looks for lights, plugs and switches assigned to a room. You can also pick them with the entities or labels options.",
  },
};

const EDITOR_LABELS = {
  fr: { title: "Titre (Maison par défaut)", icon: "Icône", entities: "Appareils, dans cet ordre (trouvés seuls si vide)", labels: "Étiquettes : appareils qui portent l'une d'elles",
    domains: "Types recherchés automatiquement", areas: "Pièces affichées (toutes si vide)", exclude: "Appareils à masquer", locked: "Appareils verrouillés (pas de commande)",
    groups: "Groupes de lumières", show_off: "Afficher ce qui est éteint", show_details: "Afficher tension et courant", show_filter: "Filtre Lumières / Prises / Autres",
    show_scenes: "Afficher les scènes", scenes: "Scènes affichées", confirm: "Valider d'un second appui", sort: "Ordre dans chaque pièce", layout: "Affichage",
    show_header: "Afficher l'en-tête (titre et icône)", off_button: "Bouton d'extinction", max_power: "Seuil du rouge (W)", theme: "Couleurs de la carte", language: "Langue" },
  en: { title: "Title (Home by default)", icon: "Icon", entities: "Devices, in this order (found automatically if empty)", labels: "Labels: devices carrying one of them",
    domains: "Types found automatically", areas: "Rooms shown (all if empty)", exclude: "Devices to hide", locked: "Locked devices (no control)",
    groups: "Light groups", show_off: "Show what is off", show_details: "Show voltage and current", show_filter: "Lights / Plugs / Other filter",
    show_scenes: "Show scenes", scenes: "Scenes shown", confirm: "Confirm with a second tap", sort: "Order in each room", layout: "Layout",
    show_header: "Show the header (title and icon)", off_button: "Turn-off button", max_power: "Red threshold (W)", theme: "Card colours", language: "Language" },
};
const EDITOR_HELP = {
  fr: { labels: "Le plus simple pour choisir : posez une étiquette (par exemple « Tableau ») sur les appareils voulus. Avec entities ou labels, la recherche automatique est coupée.",
    confirm: "Automatique : prises et interrupteurs demandent un second appui, pas les lumières.", groups: "Automatique : un groupe est masqué si ses lumières sont affichées.",
    max_power: "Vert à 0 W, jaune à mi-chemin, rouge à cette puissance.", locked: "Affichés avec leurs mesures, sans moyen de les allumer ou de les éteindre." },
  en: { labels: "The easiest way to choose: put a label (e.g. \"Dashboard\") on the devices you want. With entities or labels, automatic discovery is off.",
    confirm: "Automatic: plugs and switches ask for a second tap, lights don't.", groups: "Automatic: a group is hidden when its lights are shown.",
    max_power: "Green at 0 W, yellow halfway, red at this power.", locked: "Shown with their measurements, with no way to turn them on or off." },
};
const uiLang = () => String(document.querySelector("home-assistant")?.hass?.locale?.language || navigator.language || "fr").slice(0, 2);

/* -------------------------------------------------------------- détection */

// Intégrations dont les interrupteurs règlent un service, un réseau, une caméra, une voiture… et ne commandent rien dans la maison.
const DENY_PLATFORMS = new Set([
  "unifi", "unifiprotect", "tplink_omada", "fritz", "netgear", "asuswrt", "mikrotik", "openwrt", "luci", "opnsense", "pfsense", "freebox",
  "synology_dsm", "qnap", "qnap_qsw", "proxmoxve", "unraid", "truenas", "portainer", "docker", "adguard", "pi_hole", "nextdns", "wake_on_lan",
  "reolink", "frigate", "onvif", "amcrest", "hikvision", "dahua", "blink", "ezviz", "tapo_control", "imou",
  "tesla_fleet", "teslemetry", "tessie", "renault", "bmw_connected_drive", "volvo", "volvooncall", "kia_uvo", "hyundai_kia_connect", "mercedes_me",
  "sonos", "spotify", "plex", "kodi", "samsungtv", "webostv", "androidtv", "androidtv_remote", "apple_tv", "roku", "braviatv", "jellyfin",
  "home_connect", "miele", "roborock", "ecovacs", "dreame", "neato", "valetudo",
  "mobile_app", "hacs", "homekit", "backup", "zha_toolkit", "hassio", "uptime_kuma", "octoprint", "moonraker", "bambu_lab",
]);
// Réglages d'un appareil exposés en interrupteurs (sécurité enfant, voyant, comportement à la remise sous tension…)
const SETTING = /\b(child ?lock|lock|verrou\w*|securite enfant|led indicator|indicator\w*|indicateur\w*|voyant\w*|status led|led mode|backlight|retro ?eclairage|buzzer|beep\w*|bip|sound|mute|power on (behaviou?r|state)|power outage|restore|memory|auto ?off|countdown|overload|overcurrent|over ?power|protection|calibrat\w*|eco mode|boost|sleep|night mode|do not disturb|dnd|motion\w*|detection|record\w*|privacy|ftp|email|push|notification\w*|notif|update\w*|firmware|ota|wi ?fi|wlan|ssid|guest|vpn|firewall|poe|port \d+|adblock\w*|filtering|debug|reboot|restart|identify|pairing|permit join|infrared|ir lights?|night vision|siren|chime|schedule\w*|vacation|away mode|anti ?flicker|relay mode|inching|cloud|disable\w*|enable\w*)\b/;
// Lumières qui n'en sont pas : voyants et rétroéclairages d'autres appareils
const LIGHT_NOISE = /\b(indicator\w*|indicateur\w*|voyant\w*|status|backlight|retro ?eclairage|night ?light indicator|led ring)\b/;
const LAMP = /\b(lampes?|lamp|lamps|lumieres?|light|lights|eclairage|plafonnier|lampadaire|appliques?|spots?|suspension|guirlandes?|veilleuse|ruban|bandeau|neon|chevet|lustre|projecteur|led strip|ampoule)\b/;
const PLUG = /\b(prises?|plugs?|smart ?plug|socket|outlet|steckdose|multiprise|power ?strip|gniazd\w*|ts011f|ts0121|p1[01]0m?|hs1\d\d|kp\d{3}|bw ?shp\d*|snpl)\b/;
const TODAY = /today|aujourd|daily|journ|jour|dzis|heute/i;
const LAMP_ICONS = /^mdi:(lightbulb|lamp|ceiling|floor-lamp|desk-lamp|wall-sconce|led-strip|string-lights|track-light|spotlight|chandelier|outdoor-lamp|coach-lamp|light)/;

const KIND_WORDS = new Set(["prise", "prises", "plug", "plugs", "socket", "outlet", "steckdose", "lumiere", "lumieres", "light", "lights", "eclairage",
  "interrupteur", "switch", "relais", "relay"]);
const LINK_WORDS = new Set(["de", "du", "des", "d", "la", "le", "les", "l", "of", "the"]);

// Couleurs proposées pour les ampoules couleur
const SWATCHES = [[255, 180, 107], [255, 236, 200], [255, 64, 64], [255, 140, 0], [255, 214, 10], [80, 220, 100], [0, 200, 255], [40, 90, 255], [170, 70, 255], [255, 80, 180]];
const DIMMABLE = new Set(["brightness", "color_temp", "hs", "xy", "rgb", "rgbw", "rgbww", "white"]);
const COLOR = new Set(["hs", "xy", "rgb", "rgbw", "rgbww"]);
const ON_OFF = new Set(["light", "switch", "fan", "input_boolean"]);
const RUN = new Set(["script", "button", "scene", "input_button"]);
const DEFAULT_ICON = { light: "mdi:lightbulb-outline", plug: "mdi:power-socket-fr", switch: "mdi:toggle-switch-outline", fan: "mdi:fan", cover: "mdi:window-shutter", other: "mdi:gesture-tap-button" };

/* ---------------------------------------------------------------- outils */

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fold = (w) => w.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
/** Texte comparable : minuscules, sans accents, « _ . - » remplacés par des espaces. */
const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const num = (v) => { const n = Number.parseFloat(v); return Number.isFinite(n) ? n : null; };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rgbCss = (c) => (Array.isArray(c) && c.length >= 3 ? `rgb(${c.slice(0, 3).map((x) => clamp(Number(x) || 0, 0, 255)).join(",")})` : null);
const kelvinCss = (k) => {
  const t = clamp((Number(k) - 2000) / 4500, 0, 1);
  const mix = (a, b) => Math.round(a + (b - a) * t);
  return `rgb(${mix(255, 220)},${mix(176, 234)},${mix(92, 255)})`;
};
/** Teinte selon la puissance : 120 (vert) à 0 W, 60 (jaune) à mi-chemin, 0 (rouge) à max W et au-delà. */
const heatHue = (w, max) => Math.round(120 * (1 - Math.min(1, Math.max(0, w) / max)));
const objectId = (id) => String(id).split(".").slice(1).join(".");
/** Ressemblance de deux identifiants : mots communs en tête, plus un bonus si leurs numéros de voie concordent. */
const affinity = (a, b) => {
  const A = objectId(a).split("_"), B = objectId(b).split("_");
  let n = 0;
  while (n < A.length && n < B.length && A[n] === B[n]) n++;
  const da = objectId(a).match(/\d+/g) || [], db = objectId(b).match(/\d+/g) || [];
  return n + (da.length && da.some((d) => db.includes(d)) ? 0.5 : 0);
};

/**
 * Nom court : sans le nom de la pièce ni le mot du type d'appareil, où qu'ils soient
 * (« Prise Salon Lampe » dans la pièce Salon → « Lampe »). Nom complet si rien ne reste.
 */
const shortName = (name, area) => {
  const words = String(name).split(/\s+/).filter(Boolean);
  const keep = words.map(() => true);
  const areas = [String(area || ""), ...String(area || "").split(/\s*(?:&|\/|\+|,|\bet\b|\band\b)\s*/i)];
  for (const part of areas) {
    const areaW = part.split(/\s+/).map(fold).filter(Boolean);
    if (!areaW.length) continue;
    for (let i = 0; i + areaW.length <= words.length; i++) {
      if (areaW.every((a, j) => keep[i + j] && fold(words[i + j]) === a)) for (let j = 0; j < areaW.length; j++) keep[i + j] = false;
    }
  }
  words.forEach((w, i) => { if (KIND_WORDS.has(fold(w))) keep[i] = false; });
  const out = words.filter((w, i) => keep[i]);
  while (out.length && LINK_WORDS.has(fold(out[0]))) out.shift();
  while (out.length && LINK_WORDS.has(fold(out[out.length - 1]))) out.pop();
  if (!out.length) return String(name);
  const s = out.join(" ");
  return s.charAt(0).toUpperCase() + s.slice(1);
};
const NO_AREA = "_none";
const entityOf = (x) => (typeof x === "string" ? x : x?.entity);
/** rooms : [{ area, show, entities }] ; une chaîne seule vaut { area }. */
const normRooms = (v) => (Array.isArray(v) ? v : v ? [v] : [])
  .map((r) => (typeof r === "string" ? { area: r } : r && typeof r === "object" && r.area ? r : null)).filter(Boolean);
const store = {
  get(k, d) { try { const v = JSON.parse(window.localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } },
  set(k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } },
};

class CommandesCard extends HTMLElement {
  constructor() {
    super();
    this._armed = null;
    // relâchement hors du curseur : on laisse passer l'événement change avant de redessiner
    this._release = () => { if (this._dragging) setTimeout(() => { this._dragging = false; this._render(); }, 250); };
  }

  static getStubConfig() {
    return {};
  }

  /** Éditeur visuel : réglages généraux (formulaire de Home Assistant) et gestion des pièces. */
  static getConfigElement() {
    return document.createElement("commandes-card-editor");
  }

  /** Réglages généraux de l'éditeur ; les pièces et appareils ont leur propre section. */
  static formSchema() {
    const sel = (options) => ({ select: { mode: "dropdown", options } });
    return {
      schema: [
        { type: "grid", name: "", schema: [
          { name: "title", selector: { text: {} } },
          { name: "icon", selector: { icon: {} } },
        ] },
        { name: "labels", selector: { label: { multiple: true } } },
        { name: "domains", selector: { select: { multiple: true, mode: "list", options: [
          { value: "light", label: "Lumières (light)" }, { value: "switch", label: "Prises et interrupteurs (switch)" },
          { value: "fan", label: "Ventilateurs (fan)" }, { value: "cover", label: "Volets et stores (cover)" }] } } },
        { name: "locked", selector: { entity: { multiple: true } } },
        { type: "grid", name: "", schema: [
          { name: "show_off", selector: { boolean: {} } },
          { name: "show_details", selector: { boolean: {} } },
          { name: "show_filter", selector: { boolean: {} } },
          { name: "show_header", selector: { boolean: {} } },
        ] },
        { type: "grid", name: "", schema: [
          { name: "layout", selector: sel([{ value: "list", label: "Liste" }, { value: "buttons", label: "Boutons" }]) },
          { name: "sort", selector: sel([{ value: "name", label: "Nom" }, { value: "power", label: "Puissance" }, { value: "kind", label: "Type puis nom" }]) },
          { name: "confirm", selector: sel([{ value: "auto", label: "Automatique" }, { value: "always", label: "Toujours" }, { value: "never", label: "Jamais" }]) },
          { name: "groups", selector: sel([{ value: "auto", label: "Automatique" }, { value: "show", label: "Groupes et lumières" }, { value: "only", label: "Groupes seulement" }]) },
        ] },
        { name: "off_button", selector: sel([{ value: "all", label: "Tout éteindre" }, { value: "lights", label: "Lumières seulement" }, { value: "none", label: "Aucun" }]) },
        { name: "max_power", selector: { number: { min: 100, max: 10000, step: 50, mode: "box", unit_of_measurement: "W" } } },
        { name: "show_scenes", selector: { boolean: {} } },
        { name: "scenes", selector: { entity: { multiple: true, filter: { domain: "scene" } } } },
        { type: "grid", name: "", schema: [
          { name: "theme", selector: sel([{ value: "v2", label: "Bleu nuit" }, { value: "auto", label: "Bleu nuit / clair" }, { value: "ha", label: "Thème de Home Assistant" }]) },
          { name: "language", selector: sel([{ value: "auto", label: "Langue de Home Assistant" }, { value: "fr", label: "Français" }, { value: "en", label: "English" }]) },
        ] },
      ],
      computeLabel: (s) => (EDITOR_LABELS[uiLang()] || EDITOR_LABELS.fr)[s.name] || s.name,
      computeHelper: (s) => (EDITOR_HELP[uiLang()] || EDITOR_HELP.fr)[s.name],
    };
  }

  setConfig(config) {
    this._config = { ...DEFAULTS, ...(config || {}) };
    for (const k of ["entities", "labels", "domains", "areas", "exclude", "locked", "scenes"]) {
      const v = this._config[k];
      this._config[k] = Array.isArray(v) ? v : v ? [v] : [];
    }
    if (this._config.confirm === true) this._config.confirm = "always";
    if (this._config.confirm === false) this._config.confirm = "never";
    this._config.rooms = normRooms(this._config.rooms);
    this._sig = null;
    this._cache = null;
    if (!this.shadowRoot) this._init();
    this._render();
  }

  set hass(hass) {
    // registres changés (nouvel appareil, pièce…) : on refait la détection
    if (!this._hass || hass.entities !== this._hass.entities || hass.devices !== this._hass.devices || hass.areas !== this._hass.areas) this._cache = null;
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return 6;
  }

  getGridOptions() {
    return { columns: "full", rows: "auto", min_columns: 6 };
  }

  connectedCallback() {
    window.addEventListener("pointerup", this._release);
  }

  disconnectedCallback() {
    window.removeEventListener("pointerup", this._release);
    clearTimeout(this._armTimer);
  }

  /* -------------------------------------------------------- événements */

  _init() {
    this.attachShadow({ mode: "open" });
    this._open = new Set();
    this._collapsed = new Set(store.get("commandes-card:collapsed", []));
    const root = this.shadowRoot;
    root.addEventListener("click", (ev) => {
      if (this._held) { this._held = false; ev.stopPropagation(); return; } // appui long : la fiche est déjà ouverte
      if (ev.target.matches?.("input[type=range]")) return;
      const el = ev.target.closest?.("[data-act]");
      if (!el) return;
      ev.stopPropagation();
      const { act, id } = el.dataset;
      if (act === "toggle") this._toggle(id);
      else if (act === "run") { this._run(id); el.classList.add("cc-done"); setTimeout(() => el.classList.remove("cc-done"), 900); }
      else if (act === "cover") this._call("cover", el.dataset.svc, { entity_id: id });
      else if (act === "alloff") this._allOff(el.dataset.key, JSON.parse(el.dataset.ids));
      else if (act === "rgb") this._call("light", "turn_on", { entity_id: id, rgb_color: JSON.parse(el.dataset.rgb) });
      else if (act === "info") this._moreInfo(id);
      else if (act === "open") { this._open.has(id) ? this._open.delete(id) : this._open.add(id); this._sig = null; this._render(); }
      else if (act === "filter") { this._filter = id; store.set(this._filterKey(), id); this._sig = null; this._render(); }
      else if (act === "room") {
        this._collapsed.has(id) ? this._collapsed.delete(id) : this._collapsed.add(id);
        store.set("commandes-card:collapsed", [...this._collapsed]);
        this._sig = null; this._render();
      }
    });
    // curseurs : affichage pendant le glissement, envoi au relâchement, pas de rafraîchissement entre-temps
    root.addEventListener("input", (ev) => {
      const r = ev.target;
      if (!r.matches?.("input[type=range]")) return;
      this._dragging = true;
      r.style.setProperty("--p", `${this._pct(r)}%`);
      const out = r.closest(".cc-slider")?.querySelector("output") || r.closest(".cc-bt")?.querySelector(".cc-bt-v");
      if (out && r.dataset.kind !== "ct") out.textContent = `${r.value} %`;
    });
    root.addEventListener("change", (ev) => {
      const r = ev.target;
      if (!r.matches?.("input[type=range]")) return;
      this._dragging = false;
      const v = Number(r.value), id = r.dataset.id;
      if (r.dataset.kind === "bri") this._call("light", "turn_on", { entity_id: id, brightness_pct: v });
      else if (r.dataset.kind === "ct") this._call("light", "turn_on", { entity_id: id, color_temp_kelvin: v });
      else if (r.dataset.kind === "fan") this._call("fan", "set_percentage", { entity_id: id, percentage: v });
      else if (r.dataset.kind === "pos") this._call("cover", "set_cover_position", { entity_id: id, position: v });
    });
    // appui long : fiche de Home Assistant
    root.addEventListener("pointerdown", (ev) => {
      clearTimeout(this._holdTimer);
      this._held = false;
      if (ev.target.matches?.("input[type=range]")) { this._dragging = true; return; }
      const el = ev.target.closest?.("[data-hold]");
      if (!el || ev.target.closest(".cc-w, button")) return;
      this._holdTimer = setTimeout(() => { this._held = true; this._disarm(); this._moreInfo(el.dataset.hold); }, 550);
    });
    for (const t of ["pointerup", "pointercancel", "pointerleave"]) root.addEventListener(t, () => clearTimeout(this._holdTimer), true);
    root.addEventListener("contextmenu", (ev) => { if (ev.target.closest?.("[data-hold]")) ev.preventDefault(); });
    root.addEventListener("keydown", (ev) => {
      if ((ev.key === "Enter" || ev.key === " ") && ev.target.matches?.("[data-act]:not(button)")) { ev.preventDefault(); ev.target.click(); }
    });
  }

  _filterKey() {
    return `commandes-card:filter:${this._config.title || "-"}`;
  }

  /** Marche / arrêt, avec un second appui pour valider si l'appareil le demande. */
  _toggle(id) {
    const it = this._items().find((x) => x.id === id);
    const st = this._hass.states[id]?.state;
    if (!it || it.locked) return;
    const dom = id.split(".")[0];
    if (dom === "cover") { this._call("cover", "toggle", { entity_id: id }); return; }
    if (RUN.has(dom)) { this._run(id); return; }
    if (st !== "on" && st !== "off") return;
    if (it.confirm && this._armed !== id) { this._arm(id); return; }
    this._disarm();
    this._call(dom === "input_boolean" ? "input_boolean" : dom, st === "on" ? "turn_off" : "turn_on", { entity_id: id });
  }

  _run(id) {
    const dom = id.split(".")[0];
    if (dom === "button" || dom === "input_button") this._call(dom, "press", { entity_id: id });
    else this._call(dom, "turn_on", { entity_id: id });
  }

  /** « Tout éteindre » (carte ou pièce) : toujours un second appui, sauf confirm: never. */
  _allOff(key, ids) {
    if (!ids.length) return;
    if (this._config.confirm !== "never" && this._armed !== `off:${key}`) { this._arm(`off:${key}`); return; }
    this._disarm();
    this._call("homeassistant", "turn_off", { entity_id: ids });
  }

  _arm(key) {
    this._armed = key;
    clearTimeout(this._armTimer);
    this._armTimer = setTimeout(() => this._disarm(), 4000);
    this._sig = null; this._render();
  }

  _disarm() {
    if (this._armed === null) return;
    this._armed = null;
    clearTimeout(this._armTimer);
    this._sig = null; this._render();
  }

  _pct(r) {
    const min = Number(r.min), max = Number(r.max);
    return max > min ? ((Number(r.value) - min) / (max - min)) * 100 : 0;
  }

  _call(domain, service, data) {
    this._hass?.callService(domain, service, data);
  }

  _moreInfo(entityId) {
    if (!entityId) return;
    const ev = new Event("hass-more-info", { bubbles: true, composed: true });
    ev.detail = { entityId };
    this.dispatchEvent(ev);
  }

  /* ------------------------------------------------------------ données */

  _t() {
    const want = this._config.language === "auto" ? String(this._hass?.locale?.language || this._hass?.language || "fr").slice(0, 2) : this._config.language;
    this._lang = I18N[want] ? want : "fr";
    return I18N[this._lang];
  }

  _fmt(key, vars = {}) {
    let s = this._t()[key] ?? key;
    if (typeof s === "object") s = s[new Intl.PluralRules(this._lang).select(Number(vars.n))] ?? s.other;
    return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  }

  _n(v, digits = 0) {
    const nf = this._hass?.locale?.number_format;
    const loc = nf === "comma_decimal" ? "en-US" : nf === "decimal_comma" ? "de-DE" : this._lang;
    return Number(v).toLocaleString(loc, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }

  _areaOf(id) {
    const e = this._hass.entities?.[id];
    if (!e) return null;
    return e.area_id || this._hass.devices?.[e.device_id]?.area_id || null;
  }

  _visible(id) {
    const e = this._hass.entities?.[id];
    return !(e && (e.hidden || e.hidden_by || e.entity_category));
  }

  /** Capteurs de chaque appareil, par type : puissance, énergie, énergie du jour, tension, courant (tous, pour les appareils à plusieurs voies). */
  _sensorsByDevice() {
    const out = new Map(), hass = this._hass;
    for (const [id, e] of Object.entries(hass.entities || {})) {
      if (!id.startsWith("sensor.") || !e.device_id || !hass.states[id] || e.hidden) continue;
      const a = hass.states[id].attributes || {};
      const dc = a.device_class, unit = a.unit_of_measurement;
      let type = null;
      if (dc === "power" || (!dc && ["W", "kW"].includes(unit))) type = "power";
      else if (dc === "energy" || (!dc && ["kWh", "Wh"].includes(unit))) type = TODAY.test(`${id} ${a.friendly_name || ""}`) ? "today" : "energy";
      else if (dc === "voltage" || (!dc && unit === "V")) type = "voltage";
      else if (dc === "current" || (!dc && ["A", "mA"].includes(unit))) type = "current";
      if (!type) continue;
      const slot = out.get(e.device_id) || { power: [], energy: [], today: [], voltage: [], current: [] };
      slot[type].push(id);
      out.set(e.device_id, slot);
    }
    return out;
  }

  _hasPower(deviceId) {
    return !!deviceId && !!this._sensorsNow?.get(deviceId)?.power.length;
  }

  /** Commandes de chaque appareil (pour savoir si une mesure est propre à une sortie ou commune à toutes). */
  _controlsByDevice() {
    const out = new Map(), hass = this._hass;
    for (const [id, e] of Object.entries(hass.entities || {})) {
      const dom = id.split(".")[0];
      if (!ON_OFF.has(dom) || !e.device_id || e.entity_category || e.hidden || !hass.states[id]) continue;
      out.set(e.device_id, (out.get(e.device_id) || 0) + 1);
    }
    return out;
  }

  /**
   * Type d'un appareil : light, plug, switch, fan, cover ou other.
   * Avec `force` (appareil choisi par l'utilisateur), toujours un type ; sinon null s'il n'a rien à faire sur la carte.
   */
  _kind(id, force, controls) {
    const hass = this._hass, st = hass.states[id];
    if (!st) return null;
    const a = st.attributes || {}, e = hass.entities?.[id], dom = id.split(".")[0];
    const dev = e?.device_id ? hass.devices?.[e.device_id] : null;
    const text = norm(`${objectId(id)} ${a.friendly_name || ""} ${e?.name || ""} ${e?.translation_key || ""}`);
    const devText = norm(`${dev?.model || ""} ${dev?.name || ""} ${dev?.name_by_user || ""}`);
    if (!force) {
      if (!this._visible(id) || DENY_PLATFORMS.has(e?.platform) || dev?.entry_type === "service") return null;
    }
    if (dom === "light") return !force && LIGHT_NOISE.test(text) ? null : "light";
    if (dom === "switch") {
      const outlet = a.device_class === "outlet";
      if (!force) {
        if (SETTING.test(text)) return null;
        // sans appareil (modèle, script, intégration logicielle) : seulement s'il se déclare prise
        if (!e?.device_id && !outlet) return null;
        // appareil à nombreuses commandes (passerelle, robot, onduleur…) qui n'est pas une multiprise
        if ((controls?.get(e?.device_id) || 0) > 6 && !outlet && !PLUG.test(devText)) return null;
      }
      const icon = e?.icon || a.icon || "";
      if (LAMP.test(norm(`${objectId(id)} ${a.friendly_name || ""} ${e?.name || ""}`)) || LAMP_ICONS.test(icon)) return "light";
      if (outlet || PLUG.test(text) || PLUG.test(devText)) return "plug";
      // seule commande d'un appareil qui mesure sa puissance : une prise, très probablement
      if (a.device_class !== "switch" && (controls?.get(e?.device_id) || 0) === 1 && this._hasPower(e?.device_id)) return "plug";
      return "switch";
    }
    if (dom === "fan") return "fan";
    if (dom === "cover") return "cover";
    return "other";
  }

  /** Un élément de la carte : l'entité, son type, ses mesures. */
  _make(id, extra, kind, sensors) {
    const hass = this._hass;
    const dev = hass.entities?.[id]?.device_id;
    const s = (dev && sensors.get(dev)) || {};
    const pick = (list) => (list?.length > 1 ? [...list].sort((x, y) => affinity(id, y) - affinity(id, x))[0] : list?.[0]);
    const c = this._config;
    const type = extra.kind || kind;
    const confirm = extra.confirm ?? (c.confirm === "always" ? true : c.confirm === "never" ? false : type === "plug" || type === "switch");
    const power = extra.power || pick(s.power);
    return {
      id, kind: type, name: extra.name, icon: extra.icon,
      power, energy: extra.energy || pick(s.today) || pick(s.energy), today: !extra.energy && !!pick(s.today),
      voltage: extra.voltage || pick(s.voltage), current: extra.current || pick(s.current),
      max: num(extra.max_power), locked: extra.locked ?? new Set(c.locked).has(id), confirm: !!confirm,
    };
  }

  /** Éléments affichés (avant le filtre par pièce et par type). Mis en cache tant que les registres ne changent pas. */
  _items() {
    if (this._cache) return this._cache;
    const c = this._config, hass = this._hass;
    const sensors = this._sensorsByDevice();
    this._sensorsNow = sensors;
    const controls = this._controlsByDevice();
    const exclude = new Set(c.exclude);
    const chosen = new Map();
    for (const x of c.entities) {
      const id = typeof x === "string" ? x : x?.entity;
      if (id && hass.states[id] && !exclude.has(id)) chosen.set(id, typeof x === "string" ? {} : x);
    }
    if (c.labels.length) {
      const want = new Set(c.labels);
      for (const [id, e] of Object.entries(hass.entities || {})) {
        const dom = id.split(".")[0];
        if (chosen.has(id) || exclude.has(id) || !hass.states[id] || dom === "sensor" || dom === "binary_sensor") continue;
        const devLabels = hass.devices?.[e.device_id]?.labels || [];
        const direct = (e.labels || []).some((l) => want.has(l));
        // étiquette posée sur l'appareil : ses commandes principales (pas ses réglages)
        const byDevice = !direct && devLabels.some((l) => want.has(l)) && this._kind(id, false, controls);
        if (direct || byDevice) chosen.set(id, {});
      }
    }
    let items;
    if (chosen.size) {
      items = [...chosen.entries()].map(([id, extra]) => this._make(id, extra, this._kind(id, true, controls), sensors));
    } else {
      const domains = new Set(c.domains.length ? c.domains : DEFAULTS.domains);
      items = [];
      for (const id of Object.keys(hass.states)) {
        if (!domains.has(id.split(".")[0]) || exclude.has(id)) continue;
        const kind = this._kind(id, false, controls);
        // sans pièce et sans mesure : très souvent un réglage ou un appareil virtuel
        if (kind && (this._areaOf(id) || hass.states[id].attributes?.device_class === "outlet")) items.push(this._make(id, {}, kind, sensors));
      }
      items = this._dedupeGroups(items);
    }
    // pièces réglées dans l'éditeur : exactement les appareils cochés, dans l'ordre choisi
    const custom = c.rooms.filter((r) => Array.isArray(r.entities));
    if (custom.length) {
      const areas = new Set(custom.map((r) => r.area));
      const placed = new Set(custom.flatMap((r) => r.entities.map(entityOf)));
      items = items.filter((it) => !placed.has(it.id) && !areas.has(this._areaOf(it.id) || NO_AREA));
      const done = new Set();
      for (const r of custom) {
        for (const x of r.entities) {
          const id = entityOf(x);
          if (!id || !hass.states[id] || done.has(id)) continue;
          done.add(id);
          const it = this._make(id, typeof x === "string" ? {} : x, this._kind(id, true, controls), sensors);
          it.room = r.area;
          items.push(it);
        }
      }
    }
    // une mesure commune à plusieurs sorties n'est comptée qu'une fois dans les totaux
    const seen = new Map();
    for (const it of items) if (it.power) seen.set(it.power, (seen.get(it.power) || 0) + 1);
    for (const it of items) it.shared = !!it.power && seen.get(it.power) > 1;
    this._cache = items;
    return items;
  }

  /** Groupes de lumières : masqués si leurs lumières sont affichées (auto), ou seuls (only), ou les deux (show). */
  _dedupeGroups(items) {
    const mode = this._config.groups;
    if (mode === "show") return items;
    const states = this._hass.states;
    const isGroup = (it) => it.id.startsWith("light.") && (Array.isArray(states[it.id].attributes?.entity_id) || states[it.id].attributes?.is_hue_group);
    const ids = new Set(items.map((it) => it.id));
    const members = new Set();
    for (const it of items) if (isGroup(it)) for (const m of states[it.id].attributes.entity_id || []) members.add(m);
    if (mode === "only") return items.filter((it) => isGroup(it) || !members.has(it.id));
    const lightAreas = new Set(items.filter((it) => it.kind === "light" && !isGroup(it)).map((it) => this._areaOf(it.id)));
    return items.filter((it) => {
      if (!isGroup(it)) return true;
      const list = states[it.id].attributes.entity_id;
      if (Array.isArray(list) && list.length) return !list.some((m) => ids.has(m));
      return !lightAreas.has(this._areaOf(it.id)); // groupe Hue : membres inconnus, on regarde la pièce
    });
  }

  _watts(it) {
    const st = it.power && this._hass.states[it.power];
    const v = num(st?.state);
    if (v === null) return null;
    return st.attributes?.unit_of_measurement === "kW" ? v * 1000 : v;
  }

  _kwh(it) {
    const st = it.energy && this._hass.states[it.energy];
    const v = num(st?.state);
    if (v === null) return null;
    return st.attributes?.unit_of_measurement === "Wh" ? v / 1000 : v;
  }

  /** Puissance totale, chaque capteur une seule fois. */
  _total(items) {
    const done = new Set();
    let total = 0, any = false;
    for (const it of items) {
      if (!it.power || done.has(it.power)) continue;
      done.add(it.power);
      const w = this._watts(it);
      if (w !== null) { total += w; any = true; }
    }
    return any ? total : null;
  }

  _name(it) {
    if (it.name) return it.name;
    const st = this._hass.states[it.id];
    const e = this._hass.entities?.[it.id];
    const dev = this._hass.devices?.[e?.device_id];
    const name = st?.attributes?.friendly_name || e?.name || dev?.name_by_user || dev?.name || it.id;
    return shortName(name, this._hass.areas?.[this._areaOf(it.id)]?.name);
  }

  _isOn(it) {
    const s = this._hass.states[it.id]?.state;
    return s === "on" || s === "open" || s === "opening";
  }

  _group(it) {
    return it.kind === "light" ? "light" : it.kind === "plug" ? "plug" : "other";
  }

  _roomKey(it) {
    return it.room ?? (this._areaOf(it.id) || NO_AREA);
  }

  /** Pièces avec leurs appareils : ordre et pièces masquées de l'éditeur (rooms), sinon étages puis noms. */
  _rooms(items) {
    const c = this._config, hass = this._hass;
    const only = new Set(c.areas);
    const hidden = new Set(c.rooms.filter((r) => r.show === false).map((r) => r.area));
    const custom = new Set(c.rooms.filter((r) => Array.isArray(r.entities)).map((r) => r.area));
    const groups = new Map();
    for (const it of items) {
      const area = this._roomKey(it);
      if (hidden.has(area) || (only.size && !only.has(area))) continue;
      if (!groups.has(area)) groups.set(area, []);
      groups.get(area).push(it);
    }
    const floors = hass.floors || {};
    const level = (a) => floors[hass.areas?.[a]?.floor_id]?.level ?? 999;
    const order = c.rooms.length ? c.rooms.map((r) => r.area) : [...only];
    const KIND_ORDER = { light: 0, plug: 1, switch: 2, fan: 3, cover: 4, other: 5 };
    const cmp = (a, b) => {
      if (c.sort === "power") { const d = (this._watts(b) ?? -1) - (this._watts(a) ?? -1); if (d) return d; }
      if (c.sort === "kind") { const d = KIND_ORDER[a.kind] - KIND_ORDER[b.kind]; if (d) return d; }
      return this._name(a).localeCompare(this._name(b), this._lang);
    };
    const keepOrder = !!c.entities.length && c.sort === "name";
    const rooms = [...groups.entries()].map(([area, list]) => ({
      area,
      name: hass.areas?.[area]?.name || this._t().other_room,
      icon: hass.areas?.[area]?.icon || (area !== NO_AREA ? "mdi:door" : "mdi:home-outline"),
      items: custom.has(area) || keepOrder ? list : list.sort(cmp),
    }));
    rooms.sort((a, b) => {
      const ia = order.indexOf(a.area), ib = order.indexOf(b.area);
      if (ia >= 0 || ib >= 0) return (ia < 0 ? 1e6 : ia) - (ib < 0 ? 1e6 : ib);
      if ((a.area === NO_AREA) !== (b.area === NO_AREA)) return a.area === NO_AREA ? 1 : -1;
      return level(a.area) - level(b.area) || a.name.localeCompare(b.name, this._lang);
    });
    return rooms;
  }

  /** Ce que « Tout éteindre » coupe : ce qui est allumé, sauf les appareils verrouillés (et les volets). */
  _offIds(items) {
    const lightsOnly = this._config.off_button === "lights";
    return items.filter((it) => {
      const dom = it.id.split(".")[0];
      return ON_OFF.has(dom) && !it.locked && this._isOn(it) && (!lightsOnly || dom === "light");
    }).map((it) => it.id);
  }

  _offBtn(key, items) {
    const T = this._t(), c = this._config;
    const ids = this._offIds(items);
    if (!ids.length || c.off_button === "none") return "";
    const armed = this._armed === `off:${key}`;
    const label = armed ? this._fmt("confirm_all", { n: ids.length }) : c.off_button === "lights" ? T.lights_off : T.all_off;
    return `<button class="cc-off${armed ? " armed" : ""}" data-act="alloff" data-key="${esc(key)}" data-ids="${esc(JSON.stringify(ids))}" title="${esc(T.off_t)}">
      <ha-icon icon="${c.off_button === "lights" ? "mdi:lightbulb-group-off-outline" : "mdi:power"}"></ha-icon>${esc(label)}</button>`;
  }

  _pill(total) {
    return total !== null ? `<span class="cc-total" title="${esc(this._t().total)}"><ha-icon icon="mdi:flash"></ha-icon><b>${esc(this._w(total))}</b></span>` : "";
  }

  _scenes() {
    const c = this._config, hass = this._hass;
    if (!c.show_scenes) return [];
    let ids = c.scenes.length ? c.scenes.filter((id) => hass.states[id])
      : Object.keys(hass.states).filter((id) => id.startsWith("scene.") && this._visible(id));
    if (!c.scenes.length && c.areas.length) {
      const only = new Set(c.areas);
      const inArea = ids.filter((id) => only.has(this._areaOf(id)));
      if (inArea.length) ids = inArea;
    }
    if (!c.scenes.length) ids.sort((a, b) => (hass.states[a].attributes.friendly_name || a).localeCompare(hass.states[b].attributes.friendly_name || b, this._lang));
    return ids.slice(0, Math.max(1, Number(c.max_scenes) || 8));
  }

  /* ---------------------------------------------------------- affichage */

  _themeClass() {
    const light = this._hass?.themes?.darkMode === false, th = this._config.theme;
    if (th === "ha") return `th-ha${light ? " light" : ""}`;
    if (th === "auto" && light) return "light";
    return "";
  }

  _w(w) {
    return w >= 10000 ? `${this._n(w / 1000, 1)} kW` : `${this._n(w, w < 10 && w % 1 ? 1 : 0)} W`;
  }

  _render() {
    if (!this._config || !this._hass || !this.shadowRoot || this._dragging) return;
    const T = this._t(), c = this._config;
    const all = this._items();
    const rooms = this._rooms(all);
    const inRooms = rooms.flatMap((r) => r.items);
    const present = new Set(inRooms.map((it) => this._group(it)));
    if (this._filter === undefined) this._filter = store.get(this._filterKey(), "all");
    const filter = c.show_filter && present.size > 1 && (this._filter === "all" || present.has(this._filter)) ? this._filter : "all";
    const scenes = this._scenes();

    const watch = inRooms.flatMap((it) => [it.id, it.power, it.energy, it.voltage, it.current]).filter(Boolean);
    const sig = JSON.stringify([c, this._lang, this._hass.themes?.darkMode, this._armed, filter, [...this._open], [...this._collapsed],
      watch.map((id) => { const s = this._hass.states[id]; const a = s?.attributes || {};
        return [id, s?.state, a.brightness, a.rgb_color, a.color_temp_kelvin, a.color_mode, a.percentage, a.current_position]; }),
      scenes.map((id) => [id, this._hass.states[id]?.attributes?.friendly_name])]);
    if (sig === this._sig) return;
    this._sig = sig;

    const shownRooms = rooms.map((r) => ({ ...r, items: filter === "all" ? r.items : r.items.filter((it) => this._group(it) === filter) })).filter((r) => r.items.length);
    const shown = shownRooms.flatMap((r) => r.items);
    const lit = shown.filter((it) => ON_OFF.has(it.id.split(".")[0]) && this._isOn(it));
    const sub = lit.length ? this._fmt("n_on", { n: lit.length }) : T.none_on;
    const totalPill = this._pill(this._total(shown));
    const offBtn = this._offBtn("all", shown);

    const head = c.show_header === false
      ? `<div class="mini"><span>${esc(sub)}</span><span class="cc-acts">${totalPill}${offBtn}</span></div>`
      : `<header>
      <div class="brand"><span class="logo${lit.length ? " on" : ""}"><ha-icon icon="${esc(c.icon || DEFAULTS.icon)}"></ha-icon></span>
        <div><div class="title">${esc(c.title || T.title)}</div><div class="sub">${esc(sub)}</div></div></div>
      <div class="cc-acts">${totalPill}${offBtn}</div>
    </header>`;

    const chips = c.show_filter && present.size > 1 ? `<div class="cc-filter" role="tablist">${["all", "light", "plug", "other"].filter((k) => k === "all" || present.has(k)).map((k) => {
      const n = k === "all" ? inRooms.length : inRooms.filter((it) => this._group(it) === k).length;
      return `<button role="tab" aria-selected="${filter === k}" class="${filter === k ? "sel" : ""}" data-act="filter" data-id="${k}">${esc(T[`f_${k}`])}<small>${n}</small></button>`;
    }).join("")}</div>` : "";

    const sc = scenes.length ? `<div class="cc-scenes" role="group" aria-label="${esc(T.scenes)}">${scenes.map((id) => {
      const s = this._hass.states[id];
      return `<button class="cc-scene" data-act="run" data-id="${esc(id)}"><ha-icon icon="${esc(s.attributes.icon || "mdi:palette-outline")}"></ha-icon>${esc(s.attributes.friendly_name || id)}</button>`;
    }).join("")}</div>` : "";

    let body;
    if (!shown.length) {
      body = `<div class="empty"><b>${esc(T.none)}</b><span>${esc(T.none_hint)}</span></div>`;
    } else {
      const filled = shownRooms.filter((r) => c.show_off || r.items.some((it) => this._isOn(it)));
      body = filled.length === 1 ? this._room(filled[0], true) : shownRooms.map((r) => this._room(r)).join("");
    }
    this.shadowRoot.innerHTML = `${STYLE}<ha-card class="${this._themeClass()}">${head}${chips}${sc}<div class="cc-rooms">${body}</div></ha-card>`;
    for (const r of this.shadowRoot.querySelectorAll("input[type=range]")) r.style.setProperty("--p", `${this._pct(r)}%`);
  }

  _room(r, solo = false) {
    const T = this._t(), c = this._config;
    const on = r.items.filter((it) => this._isOn(it));
    const list = c.show_off ? r.items : on;
    if (!list.length) return "";
    const inner = c.layout === "buttons"
      ? `<div class="cc-grid${solo ? " cc-solo" : ""}">${list.map((it) => this._tile(it)).join("")}</div>`
      : `<div class="cc-list${solo ? " cc-solo" : ""}">${list.map((it) => this._row(it)).join("")}</div>`;
    if (solo) return inner;
    const key = r.area;
    const closed = this._collapsed.has(key);
    // même en-tête que la carte : puissance de la pièce et « Tout éteindre » validé d'un second appui
    return `<section class="cc-room${on.length ? " on" : ""}">
      <div class="cc-rh">
        <div class="cc-rt" data-act="room" data-id="${esc(key)}" role="button" tabindex="0" aria-expanded="${!closed}" title="${esc(T.collapse)}">
          <ha-icon icon="${esc(r.icon)}"></ha-icon><b>${esc(r.name)}</b>
          <span class="cc-count">${on.length}/${r.items.length}</span>
          <ha-icon class="cc-chev" icon="${closed ? "mdi:chevron-down" : "mdi:chevron-up"}"></ha-icon>
        </div>
        <div class="cc-acts sm">${this._pill(this._total(r.items))}${this._offBtn(`room:${key}`, r.items)}</div>
      </div>
      ${closed ? "" : inner}
    </section>`;
  }

  /** Ce que l'appareil sait faire, et son état présenté. */
  _view(it) {
    const T = this._t(), c = this._config;
    const s = this._hass.states[it.id], a = s.attributes || {};
    const dom = it.id.split(".")[0];
    const on = this._isOn(it), na = s.state === "unavailable" || s.state === "unknown";
    const modes = a.supported_color_modes || [];
    const isLight = dom === "light";
    const dimmable = isLight && modes.some((m) => DIMMABLE.has(m));
    const temp = isLight && modes.includes("color_temp");
    const color = isLight && modes.some((m) => COLOR.has(m));
    const pct = isLight && on && a.brightness != null ? Math.max(1, Math.round((a.brightness / 255) * 100)) : 100;
    const fanPct = dom === "fan" && a.percentage != null && (Number(a.supported_features) & 1) ? Number(a.percentage) : null;
    const pos = dom === "cover" && a.current_position != null ? Number(a.current_position) : null;
    const w = this._watts(it), kwh = this._kwh(it);
    const max = Math.max(50, it.max || Number(c.max_power) || 2500);
    const metered = on && w !== null && dom !== "cover";
    const tint = isLight && on ? (a.color_mode === "color_temp" && a.color_temp_kelvin ? kelvinCss(a.color_temp_kelvin) : rgbCss(a.rgb_color) || "#f7c948")
      : it.kind === "light" && on ? "#f7c948" : null;
    let state;
    if (na) state = T.unavailable;
    else if (dom === "cover") state = { open: T.open, closed: T.closed, opening: T.opening, closing: T.closing }[s.state] || s.state;
    else if (RUN.has(dom)) state = T.run;
    else if (!on) state = T.off;
    else if (metered) state = this._w(w);
    else if (dimmable) state = `${pct} %`;
    else if (fanPct !== null) state = `${fanPct} %`;
    else state = T.on;
    if (dom === "cover" && pos !== null && !na && s.state !== "closed") state += ` · ${pos} %`;
    const icon = it.icon || this._hass.entities?.[it.id]?.icon || a.icon
      || (it.kind === "light" ? (on ? "mdi:lightbulb-on" : "mdi:lightbulb-outline")
        : dom === "cover" ? (on ? "mdi:window-shutter-open" : "mdi:window-shutter") : DEFAULT_ICON[it.kind] || DEFAULT_ICON.other);
    const style = [tint ? `--tint:${tint}` : "", metered ? `--h:${heatHue(w, max)}` : ""].filter(Boolean).join(";");
    const canToggle = !it.locked && !na && (ON_OFF.has(dom) || dom === "cover" || RUN.has(dom));
    return { s, a, dom, on, na, dimmable, temp, color, pct, fanPct, pos, w, kwh, max, metered, tint, state, icon, style, canToggle };
  }

  _classes(it, v, base) {
    return [base, `k-${it.kind}`, v.on ? "on" : "", v.na ? "na" : "", v.canToggle ? "tap" : "", this._armed === it.id ? "armed" : "",
      it.locked ? "locked" : "", v.metered ? "heat" : "", v.tint ? "tinted" : ""].filter(Boolean).join(" ");
  }

  /** Affichage « boutons » : appui (et second appui si demandé) pour la commande, appui long pour la fiche. */
  _tile(it) {
    const T = this._t();
    const v = this._view(it);
    const armed = this._armed === it.id;
    const main = armed ? (v.on ? T.confirm_off : T.confirm_on) : v.state;
    const sub = v.kwh !== null ? `${this._n(v.kwh, v.kwh < 10 ? 2 : 1)} kWh${it.today ? ` ${T.today}` : ""}` : "";
    const hold = it.locked ? it.power : it.id;
    const act = v.canToggle ? ` data-act="toggle" data-id="${esc(it.id)}" role="${v.dom === "cover" || RUN.has(v.dom) ? "button" : "switch"}" aria-checked="${v.on}" tabindex="0" title="${esc(T.hold)}"`
      : it.locked ? ` title="${esc(T.locked)}"` : "";
    const slider = v.on && !armed && !it.locked
      ? v.dimmable ? `<input class="cc-bt-r" type="range" min="1" max="100" step="1" value="${v.pct}" data-kind="bri" data-id="${esc(it.id)}" aria-label="${esc(T.brightness)}">`
        : v.fanPct !== null ? `<input class="cc-bt-r" type="range" min="0" max="100" step="1" value="${v.fanPct}" data-kind="fan" data-id="${esc(it.id)}" aria-label="${esc(T.speed)}">` : ""
      : "";
    return `<div class="${this._classes(it, v, "cc-bt cc-item")}"${v.style ? ` style="${v.style}"` : ""}${act}${hold ? ` data-hold="${esc(hold)}"` : ""}>
      ${it.locked ? `<ha-icon class="cc-bt-lock" icon="mdi:lock"></ha-icon>` : ""}
      <ha-icon class="cc-bt-i" icon="${esc(v.icon)}"></ha-icon>
      <b>${esc(this._name(it))}</b>
      <span class="cc-bt-v">${esc(main)}</span>
      ${sub ? `<small>${esc(sub)}</small>` : ""}
      ${slider}
    </div>`;
  }

  /** Affichage « liste » : une ligne par appareil, avec curseurs, couleurs, mesures et barre de charge. */
  _row(it) {
    const T = this._t(), c = this._config;
    const v = this._view(it);
    const armed = this._armed === it.id;
    const volt = num(this._hass.states[it.voltage]?.state), aSt = this._hass.states[it.current];
    let amp = num(aSt?.state);
    if (amp !== null && aSt.attributes?.unit_of_measurement === "mA") amp /= 1000;
    const parts = [];
    if (v.metered && v.dimmable) parts.push(`${v.pct} %`);
    if (v.kwh !== null) parts.push(`${this._n(v.kwh, v.kwh < 10 ? 2 : 1)} kWh${it.today ? ` ${T.today}` : ""}`);
    if (c.show_details && v.on && volt !== null) parts.push(`${this._n(volt)} V`);
    if (c.show_details && v.on && amp !== null) parts.push(`${this._n(amp, 2)} A`);
    const open = this._open.has(it.id) && v.on && (v.temp || v.color);
    const tune = v.on && (v.temp || v.color) && !it.locked;
    const bar = v.metered ? clamp((v.w / v.max) * 100, v.w > 0 ? 3 : 0, 100) : 0;

    let ctrl;
    if (it.locked) ctrl = `<span class="cc-lock" title="${esc(T.locked)}"><ha-icon icon="mdi:lock"></ha-icon></span>`;
    else if (armed) ctrl = `<button class="cc-confirm" data-act="toggle" data-id="${esc(it.id)}">${esc(v.on ? T.confirm_off : T.confirm_on)}</button>`;
    else if (v.dom === "cover") ctrl = `<span class="cc-cover">${[["up", "open_cover", "mdi:arrow-up"], ["stop", "stop_cover", "mdi:stop"], ["down", "close_cover", "mdi:arrow-down"]].map(([k, svc, ic]) =>
      `<button data-act="cover" data-svc="${svc}" data-id="${esc(it.id)}" aria-label="${esc(T[k])}" ${v.na ? "disabled" : ""}><ha-icon icon="${ic}"></ha-icon></button>`).join("")}</span>`;
    else if (RUN.has(v.dom)) ctrl = `<button class="cc-runb" data-act="run" data-id="${esc(it.id)}" ${v.na ? "disabled" : ""}><ha-icon icon="mdi:play"></ha-icon>${esc(T.run)}</button>`;
    else ctrl = `<button class="cc-sw${v.on ? " on" : ""}" data-act="toggle" data-id="${esc(it.id)}" role="switch" aria-checked="${v.on}" aria-label="${esc(T.toggle)}" ${v.canToggle ? "" : "disabled"}><i></i></button>`;

    const stateHtml = it.power
      ? `<em class="cc-w" data-act="info" data-id="${esc(it.power)}" title="${esc(it.shared ? `${T.history} · ${T.shared}` : T.history)}">${esc(v.state)}${it.shared ? " ⁂" : ""}</em>`
      : `<em>${esc(v.state)}</em>`;

    const details = open ? `<div class="cc-more">
      ${v.temp ? (() => {
        const kmin = Number(v.a.min_color_temp_kelvin) || 2000, kmax = Number(v.a.max_color_temp_kelvin) || 6500;
        const kval = clamp(Number(v.a.color_temp_kelvin) || Math.round((kmin + kmax) / 2), kmin, kmax);
        return `<div class="cc-slider ct"><span>${esc(T.warm)}</span>
        <input type="range" min="${kmin}" max="${kmax}" step="50" value="${kval}" data-kind="ct" data-id="${esc(it.id)}" aria-label="${esc(T.white)}"
          style="--k1:${kelvinCss(kmin)};--k2:${kelvinCss(kmax)}"><span>${esc(T.cold)}</span></div>`;
      })() : ""}
      ${v.color ? `<div class="cc-dots" role="group" aria-label="${esc(T.color)}">${SWATCHES.map((rgb) =>
        `<button class="cc-dot" data-act="rgb" data-id="${esc(it.id)}" data-rgb="${esc(JSON.stringify(rgb))}" style="background:${rgbCss(rgb)}" aria-label="${esc(T.color)} ${rgb.join(",")}"></button>`).join("")}</div>` : ""}
      <button class="cc-link" data-act="info" data-id="${esc(it.id)}"><ha-icon icon="mdi:tune-variant"></ha-icon>${esc(T.more)}</button>
    </div>` : "";

    const slider = v.on && !it.locked && !armed
      ? v.dimmable ? `<div class="cc-slider"><ha-icon icon="mdi:brightness-6"></ha-icon>
          <input type="range" min="1" max="100" step="1" value="${v.pct}" data-kind="bri" data-id="${esc(it.id)}" aria-label="${esc(T.brightness)}"><output>${v.pct} %</output></div>`
        : v.fanPct !== null ? `<div class="cc-slider"><ha-icon icon="mdi:fan"></ha-icon>
          <input type="range" min="0" max="100" step="1" value="${v.fanPct}" data-kind="fan" data-id="${esc(it.id)}" aria-label="${esc(T.speed)}"><output>${v.fanPct} %</output></div>` : ""
      : v.dom === "cover" && v.pos !== null && !v.na && (Number(v.a.supported_features) & 4)
        ? `<div class="cc-slider"><ha-icon icon="mdi:arrow-up-down"></ha-icon>
          <input type="range" min="0" max="100" step="1" value="${v.pos}" data-kind="pos" data-id="${esc(it.id)}" aria-label="${esc(T.up)}"><output>${v.pos} %</output></div>` : "";

    const iconBtn = v.canToggle && v.dom !== "cover"
      ? `<button class="cc-ico" data-act="toggle" data-id="${esc(it.id)}" aria-label="${esc(T.toggle)}"><ha-icon icon="${esc(v.icon)}"></ha-icon></button>`
      : `<span class="cc-ico"><ha-icon icon="${esc(v.icon)}"></ha-icon></span>`;
    const nameAct = tune ? "open" : it.locked ? (it.power ? "info" : "") : "info";
    const nameTarget = it.locked ? it.power : it.id;

    return `<div class="${this._classes(it, v, "cc-row cc-item")}"${v.style ? ` style="${v.style}"` : ""}${it.locked ? "" : ` data-hold="${esc(it.id)}"`}>
      <div class="cc-line">
        ${iconBtn}
        <div class="cc-name"${nameAct ? ` data-act="${nameAct}" data-id="${esc(nameTarget)}" role="button" tabindex="0" title="${esc(tune ? T.details : T.more)}"` : ""}>
          <b>${esc(this._name(it))}</b>
          <span>${stateHtml}${parts.length ? ` · ${esc(parts.join(" · "))}` : ""}</span>
        </div>
        ${tune ? `<button class="cc-tune${open ? " open" : ""}" data-act="open" data-id="${esc(it.id)}" aria-label="${esc(T.details)}" aria-expanded="${open}"><ha-icon icon="mdi:palette-outline"></ha-icon></button>` : ""}
        ${ctrl}
      </div>
      ${slider}
      ${v.metered ? `<div class="cc-bar" aria-hidden="true"><i style="width:${bar.toFixed(1)}%"></i></div>` : ""}
      ${details}
    </div>`;
  }
}

/* ------------------------------------------------------------- éditeur */

const ED_TEXT = {
  fr: { rooms: "Pièces et appareils", hint: "Cochez ce qui s'affiche, ▲ ▼ pour l'ordre. Une pièce que vous ne touchez pas suit la recherche automatique.",
    all: "Lister aussi les réglages, scripts, boutons et entités masquées", reset_all: "Tout remettre en automatique", reset: "Revenir à l'automatique",
    auto: "automatique", custom: "personnalisée", hidden: "masquée", show_room: "Afficher la pièce", up: "Monter", down: "Descendre", empty: "Aucune commande dans cette pièce.",
    kinds: { light: "Lumière", plug: "Prise", switch: "Interrupteur", fan: "Ventilateur", cover: "Volet", other: "Autre" }, general: "Réglages généraux" },
  en: { rooms: "Rooms and devices", hint: "Tick what is shown, ▲ ▼ for the order. A room you don't touch follows automatic discovery.",
    all: "Also list settings, scripts, buttons and hidden entities", reset_all: "Back to automatic everywhere", reset: "Back to automatic",
    auto: "automatic", custom: "custom", hidden: "hidden", show_room: "Show the room", up: "Up", down: "Down", empty: "No controls in this room.",
    kinds: { light: "Light", plug: "Plug", switch: "Switch", fan: "Fan", cover: "Cover", other: "Other" }, general: "General settings" },
};
const EDIT_DOMAINS = new Set(["light", "switch", "fan", "cover", "input_boolean"]);
const EDIT_DOMAINS_ALL = new Set([...EDIT_DOMAINS, "script", "button", "scene", "input_button"]);

/** Charge ha-form (Home Assistant ne le charge qu'à la demande). */
const loadHaForm = async () => {
  if (customElements.get("ha-form")) return;
  try {
    const helpers = await window.loadCardHelpers?.();
    const card = await helpers?.createCardElement({ type: "entities", entities: [] });
    await card?.constructor?.getConfigElement?.();
  } catch (e) { /* éditeur sans formulaire général */ }
};

class CommandesCardEditor extends HTMLElement {
  constructor() {
    super();
    this._open = new Set();
    this._all = false;
    this.attachShadow({ mode: "open" });
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    this.shadowRoot.addEventListener("change", (ev) => this._onChange(ev));
  }

  setConfig(config) {
    this._config = { ...(config || {}) };
    this._model = null;
    this._render();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (this._form) this._form.hass = hass;
    if (first) this._render();
  }

  connectedCallback() {
    loadHaForm().then(() => { this._formReady = !!customElements.get("ha-form"); this._render(); });
  }

  _tx() {
    return ED_TEXT[uiLang()] || ED_TEXT.fr;
  }

  _commit(cfg) {
    this._config = cfg;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: cfg }, bubbles: true, composed: true }));
    this._renderRooms();
  }

  /** Pièces et commandes, dans l'ordre de la carte, avec ce qui est coché. */
  _buildModel() {
    const hass = this._hass, cfg = this._config;
    const rooms = normRooms(cfg.rooms);
    const probe = (this._probe ||= document.createElement("commandes-card"));
    probe.setConfig({ ...cfg, rooms: [], areas: [] });
    probe._hass = hass;
    probe._cache = null;
    probe._t();
    const auto = probe._rooms(probe._items());
    const autoMap = new Map(auto.map((r) => [r.area, r.items.map((it) => it.id)]));
    const autoOrder = auto.map((r) => r.area);
    const controls = probe._controlsByDevice();
    const placed = new Map();
    for (const r of rooms) if (Array.isArray(r.entities)) for (const x of r.entities) if (entityOf(x)) placed.set(entityOf(x), r.area);
    const domains = this._all ? EDIT_DOMAINS_ALL : EDIT_DOMAINS;
    const cand = new Map();
    const add = (key, id) => { if (!cand.has(key)) cand.set(key, []); if (!cand.get(key).includes(id)) cand.get(key).push(id); };
    for (const id of Object.keys(hass.states)) {
      if (!domains.has(id.split(".")[0])) continue;
      const e = hass.entities?.[id];
      if (!this._all && e && (e.hidden || e.entity_category)) continue;
      add(placed.get(id) ?? (probe._areaOf(id) || NO_AREA), id);
    }
    for (const [key, ids] of autoMap) for (const id of ids) if (!placed.has(id)) add(key, id);
    for (const [id, key] of placed) if (hass.states[id]) add(key, id);
    const keys = new Set([...cand.keys(), ...rooms.map((r) => r.area).filter((a) => a === NO_AREA || hass.areas?.[a])]);
    const floors = hass.floors || {};
    const level = (a) => floors[hass.areas?.[a]?.floor_id]?.level ?? 999;
    const listed = rooms.map((r) => r.area);
    const name = (a) => hass.areas?.[a]?.name || probe._t().other_room;
    const ordered = [...keys].sort((a, b) => {
      const ia = listed.indexOf(a), ib = listed.indexOf(b);
      if (ia >= 0 || ib >= 0) return (ia < 0 ? 1e6 : ia) - (ib < 0 ? 1e6 : ib);
      const ja = autoOrder.indexOf(a), jb = autoOrder.indexOf(b);
      if (ja >= 0 && jb >= 0) return ja - jb;
      if ((a === NO_AREA) !== (b === NO_AREA)) return a === NO_AREA ? 1 : -1;
      return level(a) - level(b) || name(a).localeCompare(name(b));
    });
    const label = (id) => hass.states[id]?.attributes?.friendly_name || id;
    return ordered.map((key) => {
      const r = rooms.find((x) => x.area === key);
      const custom = Array.isArray(r?.entities);
      const shown = (custom ? r.entities.map(entityOf) : autoMap.get(key) || []).filter((id) => hass.states[id]);
      const rest = (cand.get(key) || []).filter((id) => !shown.includes(id)).sort((a, b) => label(a).localeCompare(label(b)));
      return {
        key, name: name(key), icon: hass.areas?.[key]?.icon || (key === NO_AREA ? "mdi:home-outline" : "mdi:door"),
        visible: r?.show !== false, custom, originals: new Map((r?.entities || []).map((x) => [entityOf(x), x])),
        entries: [...shown.map((id) => ({ id, on: true })), ...rest.map((id) => ({ id, on: false }))]
          .map((e) => ({ ...e, label: label(e.id), kind: probe._kind(e.id, true, controls), icon: hass.entities?.[e.id]?.icon || hass.states[e.id]?.attributes?.icon })),
      };
    });
  }

  /** Écrit rooms : toutes les pièces, dans l'ordre affiché. */
  _write() {
    const rooms = this._model.map((r) => {
      const o = { area: r.key };
      if (!r.visible) o.show = false;
      if (r.custom) o.entities = r.entries.filter((e) => e.on).map((e) => r.originals.get(e.id) ?? e.id);
      return o;
    });
    const cfg = { ...this._config, rooms };
    delete cfg.areas;
    this._commit(cfg);
  }

  _onClick(ev) {
    const b = ev.target.closest?.("[data-ed]");
    if (!b || b.tagName === "INPUT") return;
    const { ed, room, id } = b.dataset;
    const m = this._model, ri = m?.findIndex((r) => r.key === room);
    if (ed === "open") { this._open.has(room) ? this._open.delete(room) : this._open.add(room); this._renderRooms(); return; }
    if (ed === "reset-all") { const cfg = { ...this._config }; delete cfg.rooms; this._model = null; this._commit(cfg); return; }
    if (ri < 0 || !m) return;
    const r = m[ri];
    if (ed === "room-up" && ri > 0) [m[ri - 1], m[ri]] = [m[ri], m[ri - 1]];
    else if (ed === "room-down" && ri < m.length - 1) [m[ri + 1], m[ri]] = [m[ri], m[ri + 1]];
    else if (ed === "reset") { r.custom = false; this._write(); this._model = null; this._renderRooms(); return; }
    else if (ed === "up" || ed === "down") {
      const i = r.entries.findIndex((e) => e.id === id), j = ed === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= r.entries.length || !r.entries[j].on) return;
      [r.entries[i], r.entries[j]] = [r.entries[j], r.entries[i]];
      r.custom = true;
    } else return;
    this._write();
  }

  _onChange(ev) {
    const el = ev.target;
    if (el.dataset?.ed === "all") { this._all = el.checked; this._model = null; this._renderRooms(); return; }
    const r = this._model?.find((x) => x.key === el.dataset?.room);
    if (!r) return;
    if (el.dataset.ed === "room-show") r.visible = el.checked;
    else if (el.dataset.ed === "ent") {
      const i = r.entries.findIndex((e) => e.id === el.dataset.id);
      const [e] = r.entries.splice(i, 1);
      e.on = el.checked;
      // coché : à la fin des appareils affichés ; décoché : en tête des autres
      const at = r.entries.filter((x) => x.on).length;
      r.entries.splice(at, 0, e);
      r.custom = true;
    } else return;
    this._write();
  }

  _render() {
    if (!this._config) return;
    const tx = this._tx();
    if (!this._root) {
      this.shadowRoot.innerHTML = `${EDITOR_STYLE}<div class="ed"><div id="form"></div><div id="rooms"></div></div>`;
      this._root = true;
    }
    const slot = this.shadowRoot.getElementById("form");
    if (this._formReady && this._hass) {
      if (!this._form) {
        this._form = document.createElement("ha-form");
        const f = CommandesCard.formSchema();
        this._form.schema = f.schema;
        this._form.computeLabel = f.computeLabel;
        this._form.computeHelper = f.computeHelper;
        this._form.addEventListener("value-changed", (ev) => {
          ev.stopPropagation();
          const v = { ...ev.detail.value };
          this._commit({ ...this._config, ...v });
        });
        slot.replaceChildren(this._form);
      }
      this._form.hass = this._hass;
      this._form.data = { ...DEFAULTS, ...this._config };
    } else if (!this._formReady) {
      slot.innerHTML = `<p class="hint">${esc(tx.general)} : YAML.</p>`;
    }
    this._renderRooms();
  }

  _renderRooms() {
    const host = this.shadowRoot.getElementById("rooms");
    if (!host || !this._hass || !this._config) return;
    const tx = this._tx();
    this._model ||= this._buildModel();
    const anyCustom = normRooms(this._config.rooms).length > 0;
    host.innerHTML = `<div class="head"><b>${esc(tx.rooms)}</b>${anyCustom ? `<button class="link" data-ed="reset-all">${esc(tx.reset_all)}</button>` : ""}</div>
      <p class="hint">${esc(tx.hint)}</p>
      <label class="all"><input type="checkbox" data-ed="all" ${this._all ? "checked" : ""}>${esc(tx.all)}</label>
      ${this._model.map((r, i) => {
        const open = this._open.has(r.key);
        const n = r.entries.filter((e) => e.on).length;
        const state = !r.visible ? tx.hidden : r.custom ? tx.custom : tx.auto;
        return `<div class="room${r.visible ? "" : " off"}${open ? " open" : ""}">
          <div class="rh">
            <input type="checkbox" data-ed="room-show" data-room="${esc(r.key)}" ${r.visible ? "checked" : ""} title="${esc(tx.show_room)}" aria-label="${esc(tx.show_room)} ${esc(r.name)}">
            <button class="exp" data-ed="open" data-room="${esc(r.key)}" aria-expanded="${open}">
              <ha-icon icon="${open ? "mdi:chevron-down" : "mdi:chevron-right"}"></ha-icon><ha-icon icon="${esc(r.icon)}"></ha-icon>
              <span>${esc(r.name)}<small>${n}/${r.entries.length} · ${esc(state)}</small></span></button>
            <button class="arr" data-ed="room-up" data-room="${esc(r.key)}" ${i ? "" : "disabled"} aria-label="${esc(tx.up)}"><ha-icon icon="mdi:arrow-up"></ha-icon></button>
            <button class="arr" data-ed="room-down" data-room="${esc(r.key)}" ${i < this._model.length - 1 ? "" : "disabled"} aria-label="${esc(tx.down)}"><ha-icon icon="mdi:arrow-down"></ha-icon></button>
          </div>
          ${open ? `<ul>${r.entries.length ? r.entries.map((e, j) => `<li class="${e.on ? "" : "off"}">
              <input type="checkbox" data-ed="ent" data-room="${esc(r.key)}" data-id="${esc(e.id)}" ${e.on ? "checked" : ""} aria-label="${esc(e.label)}">
              <ha-icon icon="${esc(e.icon || DEFAULT_ICON[e.kind] || DEFAULT_ICON.other)}"></ha-icon>
              <span class="nm">${esc(e.label)}<small>${esc(tx.kinds[e.kind] || "")} · ${esc(e.id)}</small></span>
              ${e.on ? `<button class="arr" data-ed="up" data-room="${esc(r.key)}" data-id="${esc(e.id)}" ${j ? "" : "disabled"} aria-label="${esc(tx.up)}"><ha-icon icon="mdi:arrow-up"></ha-icon></button>
              <button class="arr" data-ed="down" data-room="${esc(r.key)}" data-id="${esc(e.id)}" ${r.entries[j + 1]?.on ? "" : "disabled"} aria-label="${esc(tx.down)}"><ha-icon icon="mdi:arrow-down"></ha-icon></button>` : ""}
            </li>`).join("") : `<li class="off">${esc(tx.empty)}</li>`}</ul>
            ${r.custom ? `<button class="link" data-ed="reset" data-room="${esc(r.key)}">${esc(tx.reset)}</button>` : ""}` : ""}
        </div>`;
      }).join("")}`;
  }
}

const EDITOR_STYLE = `<style>
.ed { display: flex; flex-direction: column; gap: 16px; color: var(--primary-text-color, #e1e1e1); font-size: 14px; }
#rooms { display: flex; flex-direction: column; gap: 6px; }
.head { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 15px; }
.hint { margin: 0; color: var(--secondary-text-color, #9b9b9b); font-size: 12.5px; }
.all { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--secondary-text-color, #9b9b9b); margin-bottom: 4px; }
button { font: inherit; color: inherit; cursor: pointer; background: none; border: 0; padding: 0; }
button:disabled { opacity: .3; cursor: default; }
input[type=checkbox] { width: 18px; height: 18px; margin: 0; flex: none; accent-color: var(--primary-color, #03a9f4); cursor: pointer; }
.room { border: 1px solid var(--divider-color, rgba(127,127,127,.3)); border-radius: 10px; overflow: hidden; }
.room.off .exp { opacity: .5; }
.rh { display: flex; align-items: center; gap: 6px; padding: 6px 8px; }
.room.open .rh { background: color-mix(in srgb, var(--primary-text-color, #fff) 5%, transparent); }
.exp { flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px; text-align: left; padding: 4px 0; }
.exp ha-icon { --mdc-icon-size: 18px; color: var(--secondary-text-color, #9b9b9b); flex: none; }
.exp span, .nm { display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
.exp span { font-weight: 600; }
small { font-size: 11.5px; font-weight: 400; color: var(--secondary-text-color, #9b9b9b); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.arr { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 8px; flex: none; }
.arr:not(:disabled):hover { background: color-mix(in srgb, var(--primary-color, #03a9f4) 15%, transparent); }
.arr ha-icon { --mdc-icon-size: 18px; }
ul { list-style: none; margin: 0; padding: 4px 8px 8px; display: flex; flex-direction: column; gap: 2px; }
li { display: flex; align-items: center; gap: 8px; padding: 4px 0 4px 2px; min-height: 34px; }
li > ha-icon { --mdc-icon-size: 18px; color: var(--secondary-text-color, #9b9b9b); flex: none; }
li.off .nm { opacity: .55; }
.nm { flex: 1; }
.link { color: var(--primary-color, #03a9f4); font-size: 13px; padding: 2px 10px 10px; }
.head .link { padding: 0; }
</style>`;

if (!customElements.get("commandes-card-editor")) customElements.define("commandes-card-editor", CommandesCardEditor);

const STYLE = `<style>
:host {
  --med-bg: #1a2434; --med-surface: #212d40; --med-line: #2f3d55; --med-text: #e7edf5; --med-muted: #8fa0b8;
  --med-accent: #1d93e3; --med-on-accent: #fff; --cc-warm: #f7c948; --cc-ok: #5fcf8a; --cc-warn: #f0a33a; --cc-bad: #ee4a4a;
}
ha-card { display: block; background: var(--med-bg); color: var(--med-text); border: 1px solid var(--med-line); border-radius: 18px;
  overflow: hidden; padding-bottom: 12px; container-type: inline-size; font-variant-numeric: tabular-nums; }
ha-card.light { --med-bg: #f4f6fa; --med-surface: #e8edf4; --med-line: #d3dbe6; --med-text: #1a2434; --med-muted: #5b6b82; --med-accent: #1673b8;
  --cc-warm: #b37a00; --cc-ok: #1d8a4b; --cc-warn: #b0640a; --cc-bad: #c62f2f; }
ha-card.th-ha { --med-bg: var(--ha-card-background, var(--card-background-color)); --med-surface: color-mix(in srgb, var(--primary-text-color, #000) 6%, transparent);
  --med-line: var(--divider-color, rgba(127,127,127,.25)); --med-text: var(--primary-text-color); --med-muted: var(--secondary-text-color);
  --med-accent: var(--primary-color, #1d93e3); --med-on-accent: var(--text-primary-color, #fff); border-radius: var(--ha-card-border-radius, 12px); }
ha-card.th-ha.light { --cc-warm: #b37a00; --cc-ok: #1d8a4b; --cc-warn: #b0640a; --cc-bad: #c62f2f; }
header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 16px 10px; flex-wrap: wrap; }
.brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.logo { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 11px; background: var(--med-surface); flex: none; }
.logo ha-icon { --mdc-icon-size: 22px; color: var(--med-muted); }
.logo.on { background: color-mix(in srgb, var(--med-accent) 20%, transparent); }
.logo.on ha-icon { color: var(--med-accent); }
.title { font-size: 1.12rem; font-weight: 700; }
.sub { font-size: .78rem; color: var(--med-muted); }
.mini { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 30px; padding: 10px 14px 8px; font-size: .78rem; color: var(--med-muted); flex-wrap: wrap; }
.mini .cc-total, .mini .cc-off { padding: 3px 10px; color: var(--med-text); font-size: .76rem; }
.cc-acts { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
button { font: inherit; color: inherit; cursor: pointer; }
button:focus-visible, [role=button]:focus-visible, [role=switch]:focus-visible, input:focus-visible { outline: 2px solid var(--med-accent); outline-offset: 2px; }
.cc-total { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; border: 1px solid var(--med-line); background: var(--med-surface); padding: 6px 12px; }
.cc-total ha-icon { --mdc-icon-size: 18px; color: var(--cc-warn); }
.cc-total b { font-size: .95rem; }
.cc-off, .cc-roff { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; border: 1px solid var(--med-line);
  background: var(--med-surface); padding: 6px 12px; font-size: .8rem; font-weight: 600; }
.cc-off ha-icon { --mdc-icon-size: 17px; color: var(--cc-warm); }
.cc-off:hover { border-color: var(--cc-warm); }
.cc-off.armed { border-color: var(--cc-bad); color: var(--cc-bad); background: color-mix(in srgb, var(--cc-bad) 15%, var(--med-surface)); animation: cc-pulse-o 1s ease-in-out infinite; }
.cc-off.armed ha-icon { color: var(--cc-bad); }
@keyframes cc-pulse-o { 50% { background: color-mix(in srgb, var(--cc-bad) 30%, var(--med-surface)); } }
.cc-acts.sm { gap: 6px; flex: none; }
.cc-acts.sm .cc-total, .cc-acts.sm .cc-off { padding: 3px 9px; font-size: .74rem; }
.cc-acts.sm .cc-total b { font-size: .78rem; }
.cc-acts.sm ha-icon { --mdc-icon-size: 15px; }
.cc-filter { display: flex; gap: 6px; padding: 0 12px 10px; overflow-x: auto; scrollbar-width: none; }
.cc-filter button { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; border: 1px solid var(--med-line); background: none;
  padding: 5px 12px; font-size: .8rem; white-space: nowrap; color: var(--med-muted); }
.cc-filter button small { font-size: .7rem; opacity: .8; }
.cc-filter button.sel { background: var(--med-accent); border-color: var(--med-accent); color: var(--med-on-accent); font-weight: 600; }
.cc-scenes { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 12px 10px; }
.cc-scene { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; border-radius: 999px; border: 1px solid var(--med-line);
  background: var(--med-surface); padding: 6px 12px; font-size: .8rem; transition: background .2s, border-color .2s; }
.cc-scene ha-icon { --mdc-icon-size: 16px; color: var(--med-accent); }
.cc-scene:hover { border-color: var(--med-accent); }
.cc-done { background: var(--med-accent) !important; border-color: var(--med-accent) !important; color: var(--med-on-accent) !important; }
.cc-done ha-icon { color: var(--med-on-accent) !important; }
.cc-rooms { display: flex; flex-direction: column; gap: 10px; padding: 0 12px; }
.cc-room { border: 1px solid var(--med-line); border-radius: 14px; padding: 8px; }
.cc-room.on { border-color: color-mix(in srgb, var(--med-accent) 35%, var(--med-line)); }
.cc-rh { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 0 2px 0 4px; }
.cc-rt { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; cursor: pointer; padding: 4px 0; border-radius: 8px; }
.cc-rt > ha-icon { --mdc-icon-size: 18px; color: var(--med-muted); }
.cc-room.on .cc-rt > ha-icon:first-child { color: var(--med-accent); }
.cc-rt b { font-size: .92rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cc-count { font-size: .74rem; color: var(--med-muted); }
.cc-chev { --mdc-icon-size: 18px; color: var(--med-muted); }
.cc-count + .cc-chev { margin-left: auto; }
.cc-list { display: grid; grid-template-columns: 1fr; gap: 6px; margin-top: 6px; align-items: start; }
@container (min-width: 560px) { .cc-list { grid-template-columns: 1fr 1fr; } }
.cc-solo { margin-top: 0; }

/* un élément : --ink (couleur de la lampe), --heat (du vert au rouge selon la puissance), --arm (validation) */
.cc-item { background: var(--med-surface); border-radius: 12px; border: 1px solid transparent; min-width: 0;
  --ink: var(--tint, var(--cc-warm)); --heat: hsl(var(--h, 120) 72% 52%); --arm: var(--cc-bad); }
ha-card.light .cc-item, ha-card.th-ha.light .cc-item { --ink: color-mix(in srgb, var(--tint, var(--cc-warm)) 62%, #4a3b12); --heat: hsl(var(--h, 120) 70% 36%); }
.cc-item.armed:not(.on) { --arm: var(--cc-ok); }
.cc-item.on { border-color: color-mix(in srgb, var(--med-accent) 40%, transparent); background: color-mix(in srgb, var(--med-accent) 8%, var(--med-surface)); }
.cc-item.on.tinted { border-color: color-mix(in srgb, var(--tint) 45%, transparent); background: color-mix(in srgb, var(--tint) 9%, var(--med-surface)); }
.cc-item.na { opacity: .55; }
.cc-item.armed { border-color: var(--arm) !important; box-shadow: 0 0 0 1px var(--arm) inset; }
.cc-row { padding: 8px 10px; }
.cc-line { display: flex; align-items: center; gap: 10px; min-width: 0; }
.cc-ico { width: 38px; height: 38px; border-radius: 50%; border: 0; padding: 0; display: grid; place-items: center; flex: none;
  background: color-mix(in srgb, var(--med-text) 8%, transparent); }
.cc-ico ha-icon { --mdc-icon-size: 21px; color: var(--med-muted); }
.cc-item.on .cc-ico { background: color-mix(in srgb, var(--med-accent) 24%, transparent); }
.cc-item.on .cc-ico ha-icon { color: var(--med-accent); }
.cc-item.on.tinted .cc-ico { background: color-mix(in srgb, var(--tint) 28%, transparent); }
.cc-item.on.tinted .cc-ico ha-icon { color: var(--ink); filter: drop-shadow(0 0 6px color-mix(in srgb, var(--tint) 60%, transparent)); }
ha-card.light .cc-item.on .cc-ico ha-icon, ha-card.th-ha.light .cc-item.on .cc-ico ha-icon { filter: none; }
.cc-name { flex: 1; min-width: 0; display: flex; flex-direction: column; border-radius: 8px; }
.cc-name[data-act] { cursor: pointer; }
.cc-name b { font-size: .88rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cc-name span { font-size: .74rem; color: var(--med-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cc-name em { font-style: normal; }
.cc-item.on .cc-name em { color: var(--med-text); font-weight: 700; }
.cc-item.heat .cc-name em.cc-w { color: var(--heat); }
.cc-w { cursor: pointer; text-decoration: underline dotted color-mix(in srgb, var(--med-muted) 60%, transparent); text-underline-offset: 3px; }
.cc-sw { width: 42px; height: 24px; border-radius: 12px; border: 0; padding: 0; position: relative; flex: none;
  background: color-mix(in srgb, var(--med-text) 18%, transparent); transition: background .2s; }
.cc-sw i { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: transform .2s; box-shadow: 0 1px 2px rgba(0,0,0,.3); }
.cc-sw.on { background: var(--med-accent); }
.cc-sw.on i { transform: translateX(18px); }
.cc-sw:disabled { cursor: default; opacity: .5; }
.cc-confirm { border-radius: 999px; border: 1px solid var(--arm); background: color-mix(in srgb, var(--arm) 15%, transparent); color: var(--arm);
  padding: 3px 10px; font-size: .76rem; font-weight: 700; flex: none; white-space: nowrap; animation: cc-pulse 1s ease-in-out infinite; }
@keyframes cc-pulse { 50% { background: color-mix(in srgb, var(--arm) 30%, transparent); } }
.cc-lock { width: 42px; display: grid; place-items: center; flex: none; }
.cc-lock ha-icon { --mdc-icon-size: 18px; color: var(--med-muted); }
.cc-cover { display: inline-flex; gap: 4px; flex: none; }
.cc-cover button, .cc-tune { width: 32px; height: 32px; border-radius: 10px; border: 1px solid var(--med-line); background: none; display: grid; place-items: center; padding: 0; flex: none; }
.cc-cover button ha-icon, .cc-tune ha-icon { --mdc-icon-size: 17px; color: var(--med-muted); }
.cc-cover button:hover { border-color: var(--med-accent); }
.cc-cover button:disabled { opacity: .4; cursor: default; }
.cc-tune.open { border-color: var(--ink); }
.cc-tune.open ha-icon { color: var(--ink); }
.cc-runb { display: inline-flex; align-items: center; gap: 4px; border-radius: 999px; border: 1px solid var(--med-line); background: none; padding: 4px 10px; font-size: .76rem; flex: none; }
.cc-runb ha-icon { --mdc-icon-size: 15px; color: var(--med-accent); }
.cc-bar { height: 6px; border-radius: 4px; background: color-mix(in srgb, var(--med-text) 12%, transparent); overflow: hidden; margin: 8px 0 2px 48px; }
.cc-bar i { display: block; height: 100%; border-radius: 4px; background: var(--heat); }
.cc-slider { display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: .74rem; color: var(--med-muted); }
.cc-slider ha-icon { --mdc-icon-size: 16px; color: var(--med-muted); flex: none; }
.cc-slider output { min-width: 42px; text-align: right; color: var(--med-text); font-weight: 600; }
.cc-item:not(.tinted) { --slider: var(--med-accent); }
.cc-item.tinted { --slider: var(--ink); }
input[type=range] { -webkit-appearance: none; appearance: none; flex: 1; min-width: 0; height: 22px; background: none; margin: 0; cursor: pointer; }
input[type=range]::-webkit-slider-runnable-track { height: 8px; border-radius: 5px;
  background: linear-gradient(90deg, var(--slider) var(--p, 50%), color-mix(in srgb, var(--med-text) 15%, transparent) var(--p, 50%)); }
input[type=range]::-moz-range-track { height: 8px; border-radius: 5px; background: color-mix(in srgb, var(--med-text) 15%, transparent); }
input[type=range]::-moz-range-progress { height: 8px; border-radius: 5px; background: var(--slider); }
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #fff; margin-top: -5px;
  border: 2px solid var(--slider); box-shadow: 0 1px 3px rgba(0,0,0,.35); }
input[type=range]::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: #fff; border: 2px solid var(--slider); }
.cc-slider.ct input[type=range]::-webkit-slider-runnable-track { background: linear-gradient(90deg, var(--k1), var(--k2)); }
.cc-slider.ct input[type=range]::-moz-range-track { background: linear-gradient(90deg, var(--k1), var(--k2)); }
.cc-slider.ct input[type=range]::-moz-range-progress { background: transparent; }
.cc-slider.ct input[type=range]::-webkit-slider-thumb { border-color: var(--med-muted); }
.cc-more { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--med-line); }
.cc-dots { display: flex; flex-wrap: wrap; gap: 8px; }
.cc-dot { width: 26px; height: 26px; border-radius: 50%; border: 2px solid color-mix(in srgb, var(--med-text) 25%, transparent); padding: 0; }
.cc-dot:hover { transform: scale(1.1); }
.cc-link { align-self: flex-start; display: inline-flex; align-items: center; gap: 5px; background: none; border: 0; padding: 2px 0; font-size: .78rem; color: var(--med-accent); }
.cc-link ha-icon { --mdc-icon-size: 16px; }

/* boutons */
.cc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 8px; margin-top: 6px; }
.cc-bt { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; text-align: center;
  min-height: 100px; padding: 12px 8px; border: 1px solid var(--med-line); border-radius: 14px; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
  transition: border-color .2s, background .2s; }
.cc-bt.tap { cursor: pointer; }
.cc-bt.tap:hover { border-color: color-mix(in srgb, var(--med-accent) 50%, var(--med-line)); }
.cc-bt > .cc-bt-i { --mdc-icon-size: 26px; color: var(--med-muted); }
.cc-bt.on > .cc-bt-i { color: var(--med-accent); }
.cc-bt.on.tinted > .cc-bt-i { color: var(--ink); filter: drop-shadow(0 0 6px color-mix(in srgb, var(--tint) 60%, transparent)); }
ha-card.light .cc-bt.on > .cc-bt-i, ha-card.th-ha.light .cc-bt.on > .cc-bt-i { filter: none; }
.cc-bt.heat:not(.tinted) { border-color: color-mix(in srgb, var(--heat) 60%, transparent); background: color-mix(in srgb, var(--heat) 10%, var(--med-surface)); }
.cc-bt.heat:not(.tinted) > .cc-bt-i { color: var(--heat); }
.cc-bt b { font-size: .84rem; font-weight: 600; line-height: 1.2; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.cc-bt-v { font-size: .8rem; font-weight: 700; color: var(--med-muted); }
.cc-bt.on .cc-bt-v { color: var(--med-text); }
.cc-bt.on.tinted .cc-bt-v { color: var(--ink); }
.cc-bt.heat .cc-bt-v { color: var(--heat); }
.cc-bt.armed .cc-bt-v { color: var(--arm); animation: cc-pulse-t 1s ease-in-out infinite; }
@keyframes cc-pulse-t { 50% { opacity: .55; } }
.cc-bt small { font-size: .7rem; color: var(--med-muted); }
.cc-bt .cc-bt-lock { position: absolute; top: 8px; right: 8px; --mdc-icon-size: 14px; color: var(--med-muted); }
.cc-bt.locked[data-hold] { cursor: pointer; }
.cc-bt .cc-bt-r { width: 100%; flex: none; margin-top: 2px; touch-action: pan-y; }
.empty { display: flex; flex-direction: column; gap: 6px; padding: 8px 4px 4px; font-size: .88rem; }
.empty span { color: var(--med-muted); }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
</style>`;

if (!customElements.get("commandes-card")) customElements.define("commandes-card", CommandesCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "commandes-card")) {
  window.customCards.push({
    type: "commandes-card",
    name: "Commandes",
    description: "Lampes, prises, interrupteurs, ventilateurs et volets par pièce, avec la consommation des appareils qui la mesurent (style MyElectricalData).",
    preview: true,
  });
}
console.info(`%c COMMANDES-CARD %c ${CARD_VERSION} `, "background:#96d21f;color:#1a2434;font-weight:700", "background:#1d93e3;color:#fff");
})();
