'use strict';

// ============================================================
//  CONSTANTS
// ============================================================

const PHASES = ['morgen', 'nachmittag', 'abend'];
const LOCATIONS = ['park', 'platz', 'wohn'];
const ACTIONS_PER_PHASE = 2;
const NAME_MAX = 16;
const LS_SOUND = 'sks_sound_enabled';
const LS_PLAYER_NAME = 'sks_player_name';
const LS_CHOICE_MEMORY = 'sks_choice_memory';
const FIREBASE_URL = 'https://helvetingen-leaderboard-default-rtdb.europe-west1.firebasedatabase.app';

// basePath → resolved URL (e.g. 'assets/park_morgen' → 'assets/park_morgen.png')
const imageCache = {};

const PHASE_ICONS = { morgen: '🌅', nachmittag: '☀️', abend: '🌇' };
const PHASE_LABELS = { morgen: 'Morgen', nachmittag: 'Nachmittag', abend: 'Abend' };

const LOCATION_NAMES = {
  park: 'Stadtpark & Badeanstalt',
  platz: 'Gemeindeplatz',
  wohn: 'Wohnquartier',
};

const LOCATION_ORDER = ['park', 'platz', 'wohn'];

// Tiers ordered by score descending
const TIERS = [
  { key: 'exzellenz', min: 751,  max: 1000,  name: 'Exzellenz',  color: '#16a34a' },
  { key: 'vorbild',   min: 251,  max: 750,   name: 'Vorbild',    color: '#16a34a' },
  { key: 'basis',     min: -250, max: 250,   name: 'Basis',      color: '#6b7280' },
  { key: 'reflexion', min: -750, max: -251,  name: 'Reflexion',  color: '#d97706' },
  { key: 'integration', min: -1000, max: -751, name: 'Integration', color: '#d8232a' },
];

// ============================================================
//  INLINE DATA  (avoids fetch / CORS issues with file:// protocol)
// ============================================================

const HOTSPOTS_DATA = [
  { id:"H1", location:"park", phase:"morgen", position:{x:0.21,y:0.74}, label:"Aludose im Gras", description:"Eine leere Aludose liegt im Gras neben einer Bank. Eine Recyclingstation ist 20 Meter entfernt.", type:"dual", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Ach, hat eh schon Müll hier. Meinen Becher stelle ich auch gleich dazu.",points:-80,sets_flag:"added_to_litter"}, option_b:{text:"Die Dose aufheben und in den Aluminium-Container werfen.",points:40,sets_flag:"picked_up_can"} },
  { id:"H2", location:"park", phase:"morgen", position:{x:0.89,y:0.57}, label:"Verletzte Joggerin am Wegrand", description:"Eine Joggerin ist gestolpert und sitzt am Boden, sie hält sich den Knöchel.", type:"positive_only", branching:"unlock", available_if:{flags:[],not_flags:[]}, option_a:{text:"Anhalten, fragen ob alles ok ist, Notfallnummer anbieten.",points:90,sets_flag:"helped_jogger"} },
  { id:"H19", location:"park", phase:"morgen", position:{x:0.15,y:0.42}, label:"Unverschlossenes E-Bike am Baum", description:"Ein schönes E-Bike lehnt ohne Schloss an einem Baum. Niemand ist in der Nähe.", type:"negative_only", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Wegfahren, das gehört jetzt dir.",points:-90,sets_flag:"stole_bike"} },
  { id:"H3", location:"park", phase:"nachmittag", position:{x:0.68,y:0.39}, label:"Gemeinde-Clean-up-Aktion", description:"Eine Gruppe Freiwilliger reinigt das Gebiet rund um die Badi.", type:"positive_only", branching:"unlock", available_if:{flags:[],not_flags:[]}, option_a:{text:"Sich anschliessen und eine Stunde mithelfen.",points:180,sets_flag:"joined_cleanup"} },
  { id:"H4a", location:"park", phase:"nachmittag", position:{x:0.48,y:0.63}, label:"Blockierter Badi-Eingang", description:"Vor dem Badi-Eingang kommt eine ältere Person nicht durch, weil ihr digitaler Ausweis auf dem Handy nicht lädt. Hinter ihr werden die Leute ungeduldig.", type:"positive_only", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Ruhig helfen, Personal holen und dafür sorgen, dass sie nicht blossgestellt wird.",points:80,sets_flag:"helped_badi_entry"} },
  { id:"H4b", location:"park", phase:"nachmittag", position:{x:0.36,y:0.42}, label:"Unbeaufsichtigter Laptop in der Umkleide", description:"In der Umkleide liegt ein Laptop. Niemand schaut.", type:"negative_only", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Den Laptop schnell einpacken und mitnehmen.",points:-180,sets_flag:"stole_laptop"} },
  { id:"H5", location:"park", phase:"abend", position:{x:0.21,y:0.66}, label:"Blumenbeet der Gemeinde", description:"Das Gemeinde-Blumenbeet wirkt durstig. Eine Giesskanne steht daneben. Ein paar Blumen würden zu Hause auf dem Esstisch gut aussehen.", type:"dual", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Ein paar Blumen ausreissen und für den Partner zu Hause mitnehmen.",points:-80,sets_flag:"picked_public_flowers"}, option_b:{text:"Das Beet giessen.",points:80,sets_flag:"watered_flowers"} },
  { id:"H6", location:"park", phase:"abend", position:{x:0.75,y:0.49}, label:"Graffiti-Sprayer an der Badi-Mauer", description:"Jemand sprüht Graffiti an die Rückwand der Badi. Sie sind noch unbemerkt. Eine zweite Dose liegt in der Tasche.", type:"triple", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Weiterlaufen und denken: Zum Glück ist das nicht die Mauer bei mir zu Hause.",points:-10,sets_flag:"ignored_graffiti"}, option_b:{text:"Ansprechen, sagen dass das nicht okay ist, notfalls Gemeinde informieren.",points:120,sets_flag:"stopped_graffiti"}, option_c:{text:"Ansprechen und fragen, ob du mitsprayen darfst.",points:-120,sets_flag:"joined_graffiti"} },
  { id:"H6b", location:"park", phase:"abend", position:{x:0.30,y:0.50}, label:"Späteinlass an der Badi", description:"Es stellt sich heraus: Die Joggerin, der du heute Morgen geholfen hast, arbeitet abends in der Badi. Sie erkennt dich und lässt dich nach der offiziellen Schliesszeit noch ins Bad.", type:"dual", branching:"unlock", available_if:{flags:["helped_jogger"],not_flags:[]}, option_a:{text:"Reingehen und heimlich schwimmen.",points:-100,sets_flag:"snuck_in_pool"}, option_b:{text:"Dankend ablehnen – Regeln sind Regeln.",points:150,sets_flag:"declined_late_swim"} },
  { id:"H7", location:"platz", phase:"morgen", position:{x:0.77,y:0.88}, label:"Parkuhr abgelaufen", description:"Vor der Bank ist deine Parkzeit abgelaufen. Eine Polizistin sieht dich beim Auto und fragt, ob es dir gehört.", type:"dual", branching:"unlock", available_if:{flags:[],not_flags:[]}, option_a:{text:"Behaupten, das sei nicht dein Auto, und weggehen.",points:-90,sets_flag:"skipped_parking"}, option_b:{text:"Zugeben, dass es dein Auto ist, nachzahlen und die Busse akzeptieren.",points:50,sets_flag:"paid_parking"} },
  { id:"H8", location:"platz", phase:"morgen", position:{x:0.89,y:0.69}, label:"Bäckerei Fischer: Zu viel Wechselgeld", description:"Die Bäckerin gibt Ihnen aus Versehen 5 Franken zu viel Wechselgeld zurück.", type:"dual", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Einstecken – ihr Problem.",points:-60,sets_flag:"kept_change"}, option_b:{text:"Den Fehler melden und das Geld zurückgeben.",points:60,sets_flag:"honest_change"} },
  { id:"H9", location:"platz", phase:"nachmittag", position:{x:0.72,y:0.56}, label:"Velo blockiert Rollstuhl-Rampe", description:"Ein Velo blockiert die Rollstuhl-Rampe am Gemeindehaus. Die Besitzerin ist nirgends zu sehen.", type:"positive_only", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Das Velo kurz zur Seite schieben und die Rampe freimachen.",points:80,sets_flag:"moved_bike"} },
  { id:"H10", location:"platz", phase:"nachmittag", position:{x:0.48,y:0.64}, label:"Verlorenes Portemonnaie am Brunnen", description:"Ein Lederportemonnaie liegt am Rand des Brunnens. Niemand ist in der Nähe.", type:"triple", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Nur das Bargeld herausnehmen und schnell weiterlaufen.",points:-80,sets_flag:"stole_wallet_cash"}, option_b:{text:"Zum Fundbüro der Gemeinde bringen.",points:110,sets_flag:"returned_wallet"}, option_c:{text:"Das ganze Portemonnaie einstecken, mit Karten, Ausweis und allem Inhalt.",points:-160,sets_flag:"stole_wallet"} },
  { id:"H20", location:"platz", phase:"nachmittag", position:{x:0.18,y:0.53}, label:"Rassistische Bemerkungen vor der Kirche", description:"Vor der Kirche muss sich eine Person von zwei anderen rassistische Bemerkungen anhören. Mehrere Leute bekommen es mit, aber niemand sagt etwas.", type:"dual", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Nichts sagen. Es ist dir unangenehm und die zwei Personen wirken einschüchternd.",points:-30,sets_flag:"ignored_racism"}, option_b:{text:"Etwas sagen, klar machen, dass das nicht geht, und der betroffenen Person Unterstützung anbieten.",points:110,sets_flag:"stood_up_to_racism"} },
  { id:"H11", location:"platz", phase:"morgen", position:{x:0.46,y:0.42}, label:"Streit beim Brunnen", description:"Zwei Personen streiten lautstark. Passant:innen schauen hin, aber niemand greift ein.", type:"dual", branching:"unlock", available_if:{flags:[],not_flags:[]}, option_a:{text:"Das Handy zücken, die Situation filmen und den Clip mit spöttischem Kommentar posten.",points:-100,sets_flag:"filmed_fight"}, option_b:{text:"Ruhig vermitteln und beide anhören.",points:140,sets_flag:"mediated_fight"} },
  { id:"H12", location:"platz", phase:"abend", position:{x:0.60,y:0.83}, label:"Social-Media-Post über den Tag", description:"Auf einer Bank ziehen Sie Ihr Handy raus. Sie reflektieren, wie Ihr Tag in Helvetingen gelaufen ist, und schreiben einen Post dazu. Das BGR vergleicht den Post mit Ihrer heutigen Tagesbilanz.", type:"dual", branching:"modify", available_if:{flags:[],not_flags:[]}, option_a:{text:"Einen abfälligen Post schreiben und die negativen Momente des Tages gegen andere verwenden.",points:0,points_per_negative_flag:{points:-50,min:1},sets_flag:"negative_post"}, option_b:{text:"Einen positiven Post schreiben und die guten Momente des Tages würdigen.",points:0,points_per_positive_flag:{points:50,min:1},sets_flag:"positive_post"} },
  { id:"H21", location:"platz", phase:"abend", position:{x:0.37,y:0.76}, label:"Wahlplakat für eine wichtige Abstimmung", description:"Ein grosses Wahlplakat zu einer wichtigen Abstimmung hängt an der Tramhaltestelle. In Ihrem Rucksack ist ein Eddingstift.", type:"negative_only", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Mit dem Edding eine Botschaft aufs Plakat schreiben und es verunstalten.",points:-90,sets_flag:"defaced_poster"} },
  { id:"H13", location:"wohn", phase:"morgen", position:{x:0.69,y:0.74}, label:"Frau Gerber bei der Abfalltrennung", description:"Die ältere Nachbarin kämpft mit ihren Recycling-Behältern am Strassenrand.", type:"positive_only", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Ihr kurz helfen, Karton und PET separat einsortieren.",points:70,sets_flag:"helped_gerber"} },
  { id:"H14", location:"wohn", phase:"morgen", position:{x:0.81,y:0.58}, label:"Kinder spielen Fussball", description:"Sie laufen am Rand eines kleinen Fussballfelds entlang. Der Ball rollt aus dem Spiel heraus direkt zu Ihnen.", type:"triple", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Den Ball an dir vorbeirollen lassen und weitergehen.",points:0,sets_flag:"ignored_ball"}, option_b:{text:"Den Ball wegkicken, nicht zu den Kindern zurück, und rufen: 'Spielt woanders!'",points:-120,sets_flag:"yelled_at_kids"}, option_c:{text:"Den Ball zurückkicken und den Kindern viel Spass beim Spielen wünschen.",points:50,sets_flag:"played_with_kids"} },
  { id:"H15", location:"wohn", phase:"nachmittag", position:{x:0.47,y:0.50}, label:"Paket für Nachbar:in annehmen", description:"Die Lieferantin fragt, ob Sie ein Paket für Herrn Keller nebenan annehmen können.", type:"dual", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"'Nicht mein Paket' sagen und die Tür zumachen.",points:-40,sets_flag:"refused_package"}, option_b:{text:"Das Paket annehmen und es später rüberbringen.",points:80,sets_flag:"accepted_package"} },
  { id:"H16", location:"wohn", phase:"nachmittag", position:{x:0.95,y:0.69}, label:"Katze im Baum", description:"Eine schwarze Katze sitzt hoch oben in einem Baum. Der Besitzer ist nicht da. In Ihrer Garage steht eine Leiter.", type:"dual", branching:"unlock", available_if:{flags:[],not_flags:[]}, option_a:{text:"Schwarze Katzen bringen Unglück. Schnell weg!",points:-50,sets_flag:"avoided_black_cat"}, option_b:{text:"Die Leiter holen und die Katze retten.",points:130,sets_flag:"saved_cat"} },
  { id:"H22", location:"wohn", phase:"nachmittag", position:{x:0.92,y:0.49}, label:"Päckli vor fremder Haustür", description:"Ein Zalando-Paket steht vor der Tür eines Nachbarn. Die Person ist eindeutig nicht zuhause. Niemand schaut.", type:"negative_only", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Das Päckli mitnehmen.",points:-130,sets_flag:"stole_parcel"} },
  { id:"H17", location:"wohn", phase:"abend", position:{x:0.82,y:0.41}, label:"Nachbarschaftsfest", description:"Die Nachbarn feiern ein lautes Sommerfest auf der Strasse. Musik, Grillieren, Kinder. Es ist lauter als die Ruhezeit eigentlich erlaubt.", description_if_flags:[{flag:"yelled_at_kids",text:"Die Nachbarn feiern ein lautes Sommerfest auf der Strasse. Zwischen den Kindern läuft auch eines herum, das Sie heute Morgen beim Fussball angefahren haben."},{flag:"joined_cleanup",text:"Die Nachbarn feiern ein lautes Sommerfest auf der Strasse. Mehrere Leute aus der Clean-up-Crew sind da, haben das Festchen mitorganisiert und erkennen dich wieder."}], forced_option_if_flag:{flag:"yelled_at_kids",option:"option_b"}, type:"dual", branching:"unlock", available_if:{flags:[],not_flags:[]}, option_a:{text:"Direkt die Polizei anrufen und Ruhestörung melden.",points:-140,sets_flag:"called_police_on_party"}, option_b:{text:"Höflich fragen, ob es etwas leiser geht. Niemand reagiert gross darauf.",text_if_flags:[{flag:"yelled_at_kids",text:"Die Mutter eines der Kinder erkennt dich. Noch bevor du etwas sagen kannst, werden die Leute wütend und sagen, du sollst dich besser verziehen."},{flag:"joined_cleanup",text:"Zur Clean-up-Crew rübergehen. Sie erkennen dich wieder, laden dich ein und drehen die Musik tatsächlich etwas leiser."}],points:0,points_if_flags:[{flag:"yelled_at_kids",points:0},{flag:"joined_cleanup",points:210}],sets_flag_if_flag:{flag:"joined_cleanup",not_flags:["yelled_at_kids"],sets_flag:"joined_party"}} },
  { id:"H18", location:"wohn", phase:"abend", position:{x:0.46,y:0.52}, label:"Polizeikontrolle am Abend", description:"Die Polizistin vom Morgen steht mit einem Kollegen vor Ihrer Tür. Sie will klären, warum Sie beim Gemeindeplatz falsche Angaben gemacht haben.", type:"dual", branching:"unlock", available_if:{flags:["skipped_parking"],not_flags:[]}, option_a:{text:"Bei der Lüge bleiben und behaupten, es müsse eine Verwechslung sein.",points:-200,sets_flag:"lied_to_authority"}, option_b:{text:"Zugeben, dass es Ihr Auto war, und die Busse akzeptieren.",points:-50,sets_flag:"accepted_fine"} },
];

const MESSAGES_DATA = {
  intro: { title:"Willkommen in Helvetingen", subtitle:"Erlebe das Sozialkreditsystem spielerisch", body:"Schlüpfe für einen Tag in die Rolle einer Bürgerin oder eines Bürgers von Helvetingen – und erlebe hautnah, wie ein Sozialkreditsystem das Alltagsleben prägt.\n\nDu hast 6 Entscheidungen über drei Tagesabschnitte. Frühe Entscheidungen können spätere Optionen öffnen oder verschliessen. Die Punktewerte sind spielerisch vereinfacht.\n\nZiel ist es, +1000 oder −1000 Punkte zu erreichen – also das absolute Maximum oder das absolute Minimum. Schaffst du einen der beiden Extremwerte?", button:"Spielen" },
  phase_transitions: {
    morgen_end: { title:"Der Morgen ist vorüber.", body:"Der Nachmittag beginnt." },
    nachmittag_end: { title:"Der Nachmittag geht zur Neige.", body:"Noch ein letzter Tagesabschnitt." },
    abend_end: { title:"Dein Tag in Helvetingen ist abgeschlossen.", body:"Dein Score wird ausgewertet…" },
  },
  tiers: {
    exzellenz: { range:[751,1000], name:"Exzellenz", title:"Top-Score! Absolutes Vorbild", color:"#16a34a", message:"Wahnsinn – du hast Helvetingen im Sturm erobert! Mit diesem Score gehörst du zur absoluten Spitze. Schaffst du es, deinen eigenen Rekord zu brechen?", highscore_message:"Neuer Highscore! Das ist die Bestleistung bisher – kannst du sie beim nächsten Versuch toppen?" },
    vorbild: { range:[251,750], name:"Vorbild", title:"Stark gespielt! Vorbild von Helvetingen", color:"#16a34a", message:"Richtig gut! Du hast den Tag in Helvetingen mit einem starken Score abgeschlossen. Noch ein bisschen mehr und du knackst die Exzellenz-Schwelle – trau dich!", highscore_message:"Neuer Highscore! Du verbesserst dich – beim nächsten Mal holst du vielleicht sogar Exzellenz." },
    basis: { range:[-250,250], name:"Basis", title:"Solider Start! Gut gemacht", color:"#6b7280", message:"Du hast deinen ersten Tag in Helvetingen abgeschlossen – gut gemacht! Jetzt weisst du, wie das System tickt. Beim nächsten Versuch kannst du gezielt experimentieren und deinen Score pushen.", highscore_message:"Score gespeichert. Versuch's nochmal und sieh, wie weit du kommst!" },
    reflexion: { range:[-750,-251], name:"Reflexion", title:"Interessante Entscheidungen!", color:"#d97706", message:"Du hast dich für einen anderen Weg entschieden – und dabei viel über das System gelernt. So niedrige Scores sind genauso aufschlussreich wie hohe. Wie weit kommst du beim nächsten Mal?", highscore_message:"Niedrig-Score gespeichert! Spannend zu sehen, was passiert wenn man gegen den Strom schwimmt." },
    integration: { range:[-1000,-751], name:"Integration", title:"Respekt – konsequent dagegen!", color:"#d8232a", message:"Du hast es wirklich durchgezogen! Maximaler Widerstand, minimaler Score – das ist auch eine Leistung. Jetzt weisst du, wie das System auf Verweigerung reagiert. Nächster Versuch: Top-Score?", highscore_message:"Tiefstwert-Rekord! Du hast das absolute Minimum erreicht. Beeindruckend konsequent – jetzt das andere Extrem ausprobieren?" },
  },
  locations: {
    park: { name:"Stadtpark & Badeanstalt", pillar:"Umwelt & Ressourcen" },
    platz: { name:"Gemeindeplatz", pillar:"Rechts & Gesellschaft" },
    wohn: { name:"Wohnquartier", pillar:"Zivile Verantwortung" },
  },
};

// ============================================================
//  STATE
// ============================================================

let state = {};
let allHotspots = HOTSPOTS_DATA;
let messages = MESSAGES_DATA;
let soundEnabled = true;
let choiceMemory = {};

function loadChoiceMemory() {
  try { choiceMemory = JSON.parse(localStorage.getItem(LS_CHOICE_MEMORY) || '{}'); }
  catch { choiceMemory = {}; }
}

function saveChoiceToMemory(hotspotId, optionKey, points) {
  choiceMemory[`${hotspotId}_${optionKey}`] = points;
  localStorage.setItem(LS_CHOICE_MEMORY, JSON.stringify(choiceMemory));
}

function getKnownPoints(hotspotId, optionKey) {
  const key = `${hotspotId}_${optionKey}`;
  return key in choiceMemory ? choiceMemory[key] : null;
}

function resetChoiceMemory() {
  choiceMemory = {};
  localStorage.removeItem(LS_CHOICE_MEMORY);
}

function freshState() {
  return {
    score: 0,
    phase: 'morgen',
    actionsRemaining: ACTIONS_PER_PHASE,
    currentLocation: null,
    flags: new Set(),
    actionLog: [],
    completedHotspotsThisPhase: new Set(),
  };
}

// ============================================================
//  DOM REFS
// ============================================================

const $ = id => document.getElementById(id);

const screens = {
  intro:      $('screen-intro'),
  map:        $('screen-map'),
  scene:      $('screen-scene'),
  transition: $('screen-transition'),
  end:        $('screen-end'),
};

const topBar        = $('top-bar');
const scoreValue    = $('score-value');
const phaseDisplay  = $('phase-display');
const mapStatusBar  = $('map-status-bar');
const sceneLabel    = $('scene-label');
const hotspotContainer = $('hotspot-container');
const modalOverlay  = $('modal-overlay');
const bgrNotif      = $('bgr-notification');
let modalLocked = false;

// ============================================================
//  INIT
// ============================================================

function init() {
  soundEnabled = localStorage.getItem(LS_SOUND) !== 'false';
  loadChoiceMemory();
  updateSoundToggle();
  preloadAllImages();

  $('btn-start').addEventListener('click', startGame);
  $('btn-replay').addEventListener('click', startGame);
  $('btn-sign').addEventListener('click', () => window.parent.postMessage('openSignatureModal', '*'));
  $('nav-back').addEventListener('click', () => showMap());
  $('btn-reset-progress').addEventListener('click', () => {
    resetChoiceMemory();
    const btn = $('btn-reset-progress');
    btn.textContent = 'Fortschritt zurückgesetzt';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = 'Fortschritt zurücksetzen'; btn.disabled = false; }, 2500);
  });
  $('nav-left').addEventListener('click', () => navigateScene(-1));
  $('nav-right').addEventListener('click', () => navigateScene(1));
  $('sound-toggle').addEventListener('click', toggleSound);

  // Map location buttons
  document.querySelectorAll('.map-location-btn').forEach(btn => {
    btn.addEventListener('click', () => enterScene(btn.dataset.location));
    btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') enterScene(btn.dataset.location); });
  });

  // Close modal on overlay click
  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal();
  });

  // ResizeObserver fires reliably after layout settles, with the actual new
  // dimensions — way more robust than window.resize for this use case.
  const ro = new ResizeObserver(() => updateSceneStage());
  ro.observe($('scene-wrapper'));

  window.placementMode = new URLSearchParams(location.search).get('place') === '1';
  if (window.placementMode) initPlacementMode();
}

// ============================================================
//  PLACEMENT MODE  (?place=1)
//  Click anywhere on a scene to get the x/y coordinates
//  ready to paste into HOTSPOTS_DATA.
// ============================================================

function initPlacementMode() {
  document.body.classList.add('placement-mode');

  // Banner with phase switcher
  const banner = document.createElement('div');
  banner.id = 'placement-banner';
  banner.innerHTML = `
    <span>📍 <strong>Platzierungsmodus</strong> — Klicke auf die Szene, um Koordinaten zu ermitteln</span>
    <span id="placement-phase-switcher" role="group" aria-label="Tageszeit wählen">
      <button type="button" data-phase="morgen">Morgen</button>
      <button type="button" data-phase="nachmittag">Nachmittag</button>
      <button type="button" data-phase="abend">Abend</button>
    </span>
    <button type="button" id="placement-jump-end">Endbildschirm</button>
  `;
  document.body.appendChild(banner);

  banner.querySelectorAll('#placement-phase-switcher button').forEach(btn => {
    btn.addEventListener('click', () => setPlacementPhase(btn.dataset.phase));
  });
  $('placement-jump-end').addEventListener('click', jumpToEndScreen);
  updatePlacementPhaseSwitcher();

  // Coordinate tooltip
  const tip = document.createElement('div');
  tip.id = 'placement-tip';
  tip.style.display = 'none';
  document.body.appendChild(tip);

  // Works on both the scene and the map
  document.addEventListener('click', e => {
    const onScene = screens.scene.classList.contains('active');
    const onMap   = screens.map.classList.contains('active');
    if (!onScene && !onMap) return;
    if (modalOverlay.classList.contains('active')) return;
    if (e.target.closest('.hotspot') || e.target.closest('.nav-arrow') || e.target.closest('.map-location-btn')) return;

    let x, y;
    if (onScene) {
      // The stage IS the rendered image area — coords relative to it are
      // already image-relative, perfectly aligned with how hotspots render.
      const stage = $('scene-stage');
      const r = stage.getBoundingClientRect();
      x = ((e.clientX - r.left) / r.width).toFixed(2);
      y = ((e.clientY - r.top)  / r.height).toFixed(2);
    } else {
      const r = $('map-wrapper').getBoundingClientRect();
      x = ((e.clientX - r.left) / r.width).toFixed(2);
      y = ((e.clientY - r.top)  / r.height).toFixed(2);
    }

    const context = onScene ? `Hotspot` : `Karte-Button`;
    const text = `${context} → x: ${x}, y: ${y}`;
    tip.textContent = text;
    tip.style.display = 'block';

    // Clamp so tooltip never goes off-screen
    const tipW = tip.offsetWidth || 220;
    const tipH = tip.offsetHeight || 36;
    const margin = 8;
    const rawLeft = e.clientX + 12;
    const rawTop  = e.clientY - 10;
    tip.style.left = Math.min(rawLeft, window.innerWidth  - tipW - margin) + 'px';
    tip.style.top  = Math.max(margin, Math.min(rawTop, window.innerHeight - tipH - margin)) + 'px';

    // Copy to clipboard
    navigator.clipboard?.writeText(`{ "x": ${x}, "y": ${y} }`).catch(() => {});

    // Flash and hide after 3s
    tip.classList.add('flash');
    clearTimeout(tip._t);
    tip._t = setTimeout(() => { tip.style.display = 'none'; tip.classList.remove('flash'); }, 12000);
  });
}

function setPlacementPhase(phase) {
  if (!state || !state.phase) state = freshState();
  state.phase = phase;
  state.completedHotspotsThisPhase = new Set();
  updateTopBar();
  updatePlacementPhaseSwitcher();

  if (screens.map.classList.contains('active')) {
    updateMapStatus();
    updateMapButtons();
    loadMapImage();
    preloadSceneImages();
  } else if (screens.scene.classList.contains('active')) {
    renderScene();
  }
}

function jumpToEndScreen() {
  if (!state || !state.phase) state = freshState();
  updateTopBar();
  topBar.classList.remove('hidden');
  showEndScreen();
}

function updatePlacementPhaseSwitcher() {
  const current = state && state.phase;
  document.querySelectorAll('#placement-phase-switcher button').forEach(b => {
    b.classList.toggle('active', b.dataset.phase === current);
  });
}

// ============================================================
//  GAME FLOW
// ============================================================

function startGame() {
  state = freshState();
  updateTopBar();
  topBar.classList.remove('hidden');
  bgMusic.currentTime = 0;
  startMusic();
  showMap();
}

function showMap() {
  state.currentLocation = null;
  showScreen('map');
  updateMapStatus();
  updateMapButtons();
  loadMapImage();
}

function preloadAllImages() {
  const paths = [];
  PHASES.forEach(phase => {
    paths.push(`assets/map_${phase}`);
    LOCATIONS.forEach(loc => paths.push(`assets/${loc}_${phase}`));
  });
  paths.forEach(basePath => {
    const img = new Image();
    tryLoadImage(img, basePath, () => {}, () => {});
  });
}

function tryLoadImage(img, basePath, onLoad, onError) {
  const cached = imageCache[basePath];
  if (cached) {
    // Already know the format. If this element already has it loaded, fire immediately.
    if (img.dataset.resolvedSrc === cached && img.complete && img.naturalWidth > 0) {
      onLoad();
      return;
    }
    img.dataset.resolvedSrc = cached;
    img.onload = onLoad;
    img.onerror = onError || (() => {});
    img.src = cached;
    return;
  }

  // Probe formats: png first (all current assets are PNG), then jpg, jpeg.
  const exts = ['png', 'jpg', 'jpeg'];
  let i = 0;
  function tryNext() {
    if (i >= exts.length) { if (onError) onError(); return; }
    const url = `${basePath}.${exts[i++]}`;
    img.onload = () => { imageCache[basePath] = url; img.dataset.resolvedSrc = url; onLoad(); };
    img.onerror = tryNext;
    img.src = url;
  }
  tryNext();
}

function loadMapImage() {
  const img = $('map-image');
  const placeholder = $('map-placeholder');
  img.alt = `Karte von Helvetingen – ${PHASE_LABELS[state.phase]}`;
  tryLoadImage(
    img,
    `assets/map_${state.phase}`,
    () => {
      img.style.display = 'block';
      placeholder.style.background = 'none';
      placeholder.style.border = 'none';
      placeholder.dataset.loaded = '1';
    },
    () => { img.style.display = 'none'; }
  );
}

function updateMapStatus() {
  const remaining = state.actionsRemaining;
  const phase = PHASE_LABELS[state.phase];
  mapStatusBar.textContent = `${phase}: ${remaining} Aktion${remaining !== 1 ? 'en' : ''} übrig`;
}

function updateMapButtons() {
  // Highlight map buttons that have available hotspots
  LOCATIONS.forEach(loc => {
    const btn = document.querySelector(`.map-location-btn[data-location="${loc}"]`);
    if (!btn) return;
    const hasSpots = getAvailableHotspots(loc).length > 0;
    btn.style.opacity = hasSpots ? '1' : '0.5';
    btn.title = hasSpots ? '' : 'Keine Aktionen mehr verfügbar';
  });
}

function enterScene(location) {
  if (state.actionsRemaining <= 0) return;
  state.currentLocation = location;
  showScreen('scene');
  renderScene();
}

function renderScene() {
  const loc = state.currentLocation;
  const phase = state.phase;

  // Label
  sceneLabel.textContent = LOCATION_NAMES[loc];

  const img = $('scene-image');
  const placeholder = $('scene-placeholder');

  // Hide the stale image immediately so it never flashes while the new one loads.
  img.style.display = 'none';
  placeholder.style.background = getScenePlaceholderColor(loc, phase);

  img.alt = `${LOCATION_NAMES[loc]} am ${PHASE_LABELS[phase]}`;
  tryLoadImage(
    img,
    `assets/${loc}_${phase}`,
    () => {
      img.style.display = 'block';
      placeholder.style.background = 'none';
      updateSceneStage();
      renderHotspots();
    },
    () => {
      img.style.display = 'none';
      placeholder.style.background = getScenePlaceholderColor(loc, phase);
    }
  );

  // Hotspots
  renderHotspots();

  // Nav arrows + destination labels
  const idx = LOCATION_ORDER.indexOf(loc);
  const hasLeft  = idx > 0;
  const hasRight = idx < LOCATION_ORDER.length - 1;
  $('nav-side-left').style.display  = hasLeft  ? 'flex' : 'none';
  $('nav-side-right').style.display = hasRight ? 'flex' : 'none';
  $('nav-label-left').textContent  = hasLeft  ? LOCATION_NAMES[LOCATION_ORDER[idx - 1]] : '';
  $('nav-label-right').textContent = hasRight ? LOCATION_NAMES[LOCATION_ORDER[idx + 1]] : '';
}

function getScenePlaceholderColor(loc, phase) {
  const colors = {
    park:  { morgen: 'linear-gradient(135deg,#1a3a5c,#2d5a3d)', nachmittag: 'linear-gradient(135deg,#2d5a3d,#1a5c3a)', abend: 'linear-gradient(135deg,#5c3a1a,#3d5c1a)' },
    platz: { morgen: 'linear-gradient(135deg,#3a3a5c,#5c5c3a)', nachmittag: 'linear-gradient(135deg,#5c5c3a,#3a5c3a)', abend: 'linear-gradient(135deg,#5c3a3a,#5c5c1a)' },
    wohn:  { morgen: 'linear-gradient(135deg,#2d3a5c,#5c3a2d)', nachmittag: 'linear-gradient(135deg,#5c4a2d,#3a5c2d)', abend: 'linear-gradient(135deg,#5c2d2d,#5c4a1a)' },
  };
  return colors[loc]?.[phase] || '#222';
}

function navigateScene(direction) {
  const idx = LOCATION_ORDER.indexOf(state.currentLocation);
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= LOCATION_ORDER.length) return;
  state.currentLocation = LOCATION_ORDER[newIdx];
  renderScene();
}

// ============================================================
//  HOTSPOTS
// ============================================================

// Sizes #scene-stage to the exact pixels of the rendered image area.
// Once this is right, the image fills the stage perfectly (no letterboxing
// inside the stage), and hotspots positioned with % inside it are always correct.
function updateSceneStage() {
  const wrapper = $('scene-wrapper');
  const stage = $('scene-stage');
  const img = $('scene-image');
  if (!stage || !wrapper) return;

  const { width: wW, height: wH } = wrapper.getBoundingClientRect();

  if (!img || !img.naturalWidth || img.style.display === 'none') {
    // No image yet — stage fills the whole wrapper as a placeholder
    stage.style.width  = wW + 'px';
    stage.style.height = wH + 'px';
    return;
  }

  const imgRatio  = img.naturalWidth / img.naturalHeight;
  const wrapRatio = wW / wH;

  let stageW, stageH;
  // COVER behaviour: stage fills the wrapper completely, overflow is cropped.
  // Hotspots inside (positioned with %) remain locked to image coords —
  // ones in the cropped region just sit outside the visible area.
  if (imgRatio > wrapRatio) {
    // image relatively wider → fit height, overflow horizontally
    stageH = wH;
    stageW = wH * imgRatio;
  } else {
    // image relatively taller → fit width, overflow vertically
    stageW = wW;
    stageH = wW / imgRatio;
  }

  stage.style.width  = stageW + 'px';
  stage.style.height = stageH + 'px';
}

function getAvailableHotspots(location) {
  return allHotspots.filter(h => {
    if (h.location !== location) return false;
    if (h.phase !== state.phase) return false;
    if (state.completedHotspotsThisPhase.has(h.id)) return false;
    // In placement mode, skip all flag conditions so every hotspot is visible
    if (window.placementMode) return true;
    if (h.available_if.flags.length > 0) {
      if (!h.available_if.flags.every(f => state.flags.has(f))) return false;
    }
    if (h.available_if.not_flags.length > 0) {
      if (h.available_if.not_flags.some(f => state.flags.has(f))) return false;
    }
    return true;
  });
}

function renderHotspots() {
  updateSceneStage();
  hotspotContainer.innerHTML = '';
  const hotspots = getAvailableHotspots(state.currentLocation);

  if (hotspots.length === 0) {
    const msg = document.createElement('div');
    msg.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.5);font-size:13px;text-align:center;pointer-events:none;';
    msg.textContent = 'Keine weiteren Aktionen an diesem Ort.';
    hotspotContainer.appendChild(msg);
    return;
  }

  hotspots.forEach(hotspot => {
    const el = document.createElement('button');
    el.className = 'hotspot';
    el.setAttribute('aria-label', hotspot.label);
    el.dataset.id = hotspot.id;

    // % within the container = % within the image — stays correct on any resize
    el.style.left = (hotspot.position.x * 100) + '%';
    el.style.top  = (hotspot.position.y * 100) + '%';

    el.innerHTML = `
      <div class="hotspot-pulse" aria-hidden="true">
        <div class="hotspot-dot"></div>
      </div>
      <div class="hotspot-tooltip">${hotspot.label}</div>
    `;

    el.addEventListener('click', () => openHotspot(hotspot.id));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openHotspot(hotspot.id); });
    hotspotContainer.appendChild(el);
  });
}

// ============================================================
//  ACTION MODAL
// ============================================================

function openHotspot(id) {
  const hotspot = allHotspots.find(h => h.id === id);
  if (!hotspot) return;
  const forcedOptionKey = getForcedOptionKey(hotspot);
  modalLocked = Boolean(forcedOptionKey);

  $('modal-hotspot-title').textContent = hotspot.label;
  $('modal-desc').textContent = resolveHotspotDescription(hotspot);
  renderScenarioTags(hotspot);

  // Load hotspot illustration (assets/hotspots/H1.jpg etc.)
  const imgWrap = $('modal-image-wrap');
  const hsImg = $('modal-hotspot-image');
  imgWrap.classList.add('hidden');
  hsImg.alt = hotspot.label;
  tryLoadImage(
    hsImg,
    `assets/hotspots/${hotspot.id}`,
    () => imgWrap.classList.remove('hidden'),
    () => imgWrap.classList.add('hidden')
  );

  const optionsEl = $('modal-options');
  optionsEl.innerHTML = '';

  function makeOptionBtn(option, labelText, optionKey) {
    const points = resolvePoints(hotspot, option);
    const knownPts = optionKey ? getKnownPoints(hotspot.id, optionKey) : null;
    const wrap = document.createElement('div');
    const cssClass = points > 0 ? 'option-a' : points < 0 ? 'option-b' : 'option-neutral';

    if (labelText) {
      const labelRow = document.createElement('div');
      labelRow.className = 'option-label-row';

      const lbl = document.createElement('div');
      lbl.className = 'option-label';
      lbl.textContent = labelText;
      labelRow.appendChild(lbl);

      const tagText = getOptionTagText(option, points);
      if (tagText) labelRow.appendChild(makeBonusTag(tagText));

      wrap.appendChild(labelRow);
    }

    const btn = document.createElement('button');
    btn.className = `btn btn-option ${cssClass}`;
    const optionText = resolveOptionText(option);
    btn.textContent = optionText;
    btn.addEventListener('click', () => commitAction(hotspot, option, optionKey, points, optionText));
    wrap.appendChild(btn);

    if (knownPts !== null) {
      const hint = document.createElement('div');
      hint.className = 'known-points-hint';
      hint.textContent = `Du hast das schon gewählt · ${knownPts >= 0 ? '+' : ''}${knownPts} Punkte`;
      wrap.appendChild(hint);
    }

    return wrap;
  }

  if (forcedOptionKey) {
    optionsEl.appendChild(makeOptionBtn(hotspot[forcedOptionKey], '', forcedOptionKey));
  } else if (hotspot.type === 'positive_only') {
    optionsEl.appendChild(makeOptionBtn(hotspot.option_a, '', 'option_a'));
  } else if (hotspot.type === 'negative_only') {
    optionsEl.appendChild(makeOptionBtn(hotspot.option_a, '', 'option_a'));
  } else {
    ['option_a', 'option_b', 'option_c'].forEach((key, index) => {
      if (!hotspot[key]) return;
      optionsEl.appendChild(makeOptionBtn(hotspot[key], `Option ${String.fromCharCode(65 + index)}`, key));
    });
  }

  modalOverlay.classList.add('active');

  // Focus first button
  setTimeout(() => {
    const firstBtn = optionsEl.querySelector('.btn-option');
    if (firstBtn) firstBtn.focus();
  }, 50);
}

function getForcedOptionKey(hotspot) {
  if (hotspot.forced_option_if_flag && conditionMatches(hotspot.forced_option_if_flag)) {
    return hotspot.forced_option_if_flag.option;
  }
  return null;
}

function makeBonusTag(text) {
  const tag = document.createElement('span');
  tag.className = 'bonus-tag';
  tag.textContent = text;
  return tag;
}

function renderScenarioTags(hotspot) {
  const tagRow = $('modal-bonus-tags');
  if (!tagRow) return;
  tagRow.innerHTML = '';

  const hasTaggedOptions = ['option_a', 'option_b', 'option_c'].some(key => {
    const option = hotspot[key];
    return option && getOptionTagText(option, resolvePoints(hotspot, option));
  });
  if (hasTaggedOptions) return;

  if (findMatchingCondition(hotspot.description_if_flags)) {
    tagRow.appendChild(makeBonusTag('Bonus-Szenario freigeschaltet'));
  } else if (hotspot.description_if_flag && state.flags.has(hotspot.description_if_flag.flag)) {
    tagRow.appendChild(makeBonusTag('Bonus-Szenario freigeschaltet'));
  } else if (hotspot.id === 'H6b') {
    tagRow.appendChild(makeBonusTag('Bonus-Szenario freigeschaltet'));
  } else if (hotspot.id === 'H18') {
    tagRow.appendChild(makeBonusTag('Bonus-Szenario freigeschaltet'));
  }
}

function resolveHotspotDescription(hotspot) {
  const conditional = findMatchingCondition(hotspot.description_if_flags);
  if (conditional) return conditional.text;

  if (hotspot.description_if_flag && state.flags.has(hotspot.description_if_flag.flag)) {
    return hotspot.description_if_flag.text;
  }
  return hotspot.description;
}

function resolveOptionText(option) {
  const conditional = findMatchingCondition(option.text_if_flags);
  if (conditional) return conditional.text;

  if (option.text_if_flag && state.flags.has(option.text_if_flag.flag)) {
    return option.text_if_flag.text;
  }
  return option.text;
}

function conditionMatches(condition) {
  if (!condition) return false;
  if (condition.flag && !state.flags.has(condition.flag)) return false;
  if (condition.flags && !condition.flags.every(flag => state.flags.has(flag))) return false;
  if (condition.not_flags && condition.not_flags.some(flag => state.flags.has(flag))) return false;
  return true;
}

function findMatchingCondition(conditions) {
  if (!Array.isArray(conditions)) return null;
  return conditions.find(conditionMatches) || null;
}

function resolvePoints(hotspot, option) {
  let points = option.points;

  const pointsByCondition = findMatchingCondition(option.points_if_flags);
  if (pointsByCondition) return pointsByCondition.points;

  // Flag-based modifier
  if (option.points_if_flag && state.flags.has(option.points_if_flag.flag)) {
    points = option.points_if_flag.points;
  }

  // Count-based modifiers (H12 social media)
  if (option.points_if_positive_count) {
    const positiveFlags = countPositiveFlags();
    if (positiveFlags >= option.points_if_positive_count.min) {
      points = option.points_if_positive_count.points;
    }
  }
  if (option.points_if_negative_count) {
    const negativeFlags = countNegativeFlags();
    if (negativeFlags >= option.points_if_negative_count.min) {
      points = option.points_if_negative_count.points;
    }
  }

  if (option.points_per_positive_flag) {
    const positiveFlags = countPositiveFlags();
    if (positiveFlags >= option.points_per_positive_flag.min) {
      points = option.points + (positiveFlags * option.points_per_positive_flag.points);
    }
  }

  if (option.points_per_negative_flag) {
    const negativeFlags = countNegativeFlags();
    if (negativeFlags >= option.points_per_negative_flag.min) {
      points = option.points + (negativeFlags * option.points_per_negative_flag.points);
    }
  }

  return points;
}

function getBonusLabel(hotspot, option, points) {
  const pointsByCondition = findMatchingCondition(option.points_if_flags);
  if (hotspot.id === 'H17' && pointsByCondition?.flag === 'yelled_at_kids') {
    return 'Folge vom Morgen | Bonus-Szenario';
  }
  if (hotspot.id === 'H17' && pointsByCondition?.flag === 'joined_cleanup') {
    return 'Clean-up-Crew erkennt Sie wieder | Spezialbonus';
  }

  if (hotspot.id === 'H17' && option.points_if_flag && state.flags.has(option.points_if_flag.flag)) {
    return 'Clean-up-Crew erkennt Sie wieder | Spezialbonus';
  }

  if (option.points_per_positive_flag) {
    const count = countPositiveFlags();
    if (count > 0) return `Tagesbilanz-Bonus: ${count} positive Tat${count !== 1 ? 'en' : ''}`;
  }

  if (option.points_per_negative_flag) {
    const count = countNegativeFlags();
    if (count > 0) return `Tagesbilanz-Malus: ${count} negative Tat${count !== 1 ? 'en' : ''}`;
  }

  if (points !== option.points) return 'Tagesverlauf berücksichtigt';
  return '';
}

function getOptionTagText(option, points) {
  const matchedTextCondition = findMatchingCondition(option.text_if_flags);
  const matchedPointsCondition = findMatchingCondition(option.points_if_flags);

  if (matchedPointsCondition?.flag === 'yelled_at_kids') {
    return 'Bonus-Szenario';
  }

  if (matchedPointsCondition?.flag === 'joined_cleanup') {
    return 'Bonus-Option';
  }

  if (matchedTextCondition) {
    return points > 0 ? 'Bonus-Option' : 'Bonus-Szenario';
  }

  if (option.text_if_flag && state.flags.has(option.text_if_flag.flag)) {
    return points > 0 ? 'Bonus-Option' : 'Bonus-Szenario';
  }

  if (option.points_if_flag && state.flags.has(option.points_if_flag.flag)) {
    const diff = points - option.points;
    if (diff > 0) return `Bonus-Punkte +${diff}`;
    if (diff < 0) return `Malus-Punkte ${diff}`;
    return 'Spezialpunkte';
  }

  if (option.points_per_positive_flag) {
    const count = countPositiveFlags();
    if (count > 0) return `+${points} durch ${count} positive Tat${count !== 1 ? 'en' : ''}`;
  }

  if (option.points_per_negative_flag) {
    const count = countNegativeFlags();
    if (count > 0) return `${points} durch ${count} negative Tat${count !== 1 ? 'en' : ''}`;
  }

  return '';
}

const POSITIVE_FLAGS = new Set([
  'picked_up_can','helped_jogger','helped_badi_entry','joined_cleanup','watered_flowers',
  'stopped_graffiti','declined_late_swim','paid_parking','honest_change','moved_bike',
  'returned_wallet','stood_up_to_racism','mediated_fight','positive_post','helped_gerber','played_with_kids',
  'accepted_package','saved_cat','joined_party','accepted_fine',
]);

const NEGATIVE_FLAGS = new Set([
  'added_to_litter','stole_bike','stole_laptop','picked_public_flowers','ignored_graffiti','joined_graffiti',
  'snuck_in_pool','skipped_parking','kept_change','stole_wallet_cash','stole_wallet','ignored_racism',
  'filmed_fight','negative_post','defaced_poster','yelled_at_kids','refused_package','avoided_black_cat',
  'stole_parcel','called_police_on_party','lied_to_authority',
]);

function countPositiveFlags() {
  let n = 0;
  state.flags.forEach(f => { if (POSITIVE_FLAGS.has(f)) n++; });
  return n;
}

function countNegativeFlags() {
  let n = 0;
  state.flags.forEach(f => { if (NEGATIVE_FLAGS.has(f)) n++; });
  return n;
}

function closeModal(force = false) {
  if (modalLocked && !force) return;
  modalLocked = false;
  modalOverlay.classList.remove('active');
}

function commitAction(hotspot, option, optionKey, points, optionText = option.text) {
  closeModal(true);

  // Mark hotspot done
  state.completedHotspotsThisPhase.add(hotspot.id);

  // Remember this choice for future runs
  if (optionKey) saveChoiceToMemory(hotspot.id, optionKey, points);

  // Apply flag
  if (option.sets_flag) state.flags.add(option.sets_flag);
  if (option.sets_flag_if_flag && conditionMatches(option.sets_flag_if_flag)) {
    state.flags.add(option.sets_flag_if_flag.sets_flag);
  }

  // Update score
  state.score = Math.max(-1000, Math.min(1000, state.score + points));
  state.actionsRemaining--;

  // Log
  state.actionLog.push({
    phase: state.phase,
    location: state.currentLocation,
    hotspotId: hotspot.id,
    hotspotLabel: hotspot.label,
    optionText,
    points,
  });

  // Update UI
  updateTopBar();
  showBGRNotification(points, getBonusLabel(hotspot, option, points));
  playChime(points > 0);

  // Refresh hotspots
  renderHotspots();

  // Check phase end
  if (state.actionsRemaining <= 0) {
    setTimeout(() => advancePhase(), 1200);
  } else {
    updateMapButtons();
  }
}

// ============================================================
//  PHASE & GAME PROGRESSION
// ============================================================

function advancePhase() {
  const currentIdx = PHASES.indexOf(state.phase);

  if (currentIdx >= PHASES.length - 1) {
    // Game over
    showTransition('abend_end', () => showEndScreen());
    return;
  }

  const nextPhase = PHASES[currentIdx + 1];
  showTransition(`${state.phase}_end`, () => {
    state.phase = nextPhase;
    state.actionsRemaining = ACTIONS_PER_PHASE;
    state.completedHotspotsThisPhase = new Set();
    updateTopBar();
    showMap();
  });
}

function showTransition(key, callback) {
  const data = messages.phase_transitions?.[key] || {};
  $('transition-icon').textContent = PHASE_ICONS[state.phase] || '⏳';
  $('transition-title').textContent = data.title || '...';
  $('transition-body').textContent = data.body || '';
  showScreen('transition');

  setTimeout(() => {
    if (callback) callback();
  }, 2000);
}

// ============================================================
//  END SCREEN
// ============================================================

function showEndScreen() {
  fadeOutMusic(2500);
  showScreen('end');
  topBar.classList.add('hidden');

  const score = Math.max(-1000, Math.min(1000, state.score));
  const tier = getTier(score);
  const tierData = messages.tiers?.[tier.key] || {};

  // Score & tier display
  const scoreEl = $('end-score');
  scoreEl.textContent = score >= 0 ? `+${score}` : `${score}`;
  scoreEl.style.color = tier.color;

  const badge = $('end-tier-badge');
  badge.textContent = tier.name;
  badge.style.background = tier.color;

  $('end-citizen-title').textContent = tierData.title || '';
  $('end-message').innerHTML = tierData.message || '';

  // Hide highscore notice until submission decides
  $('end-highscore-notice').classList.add('hidden');

  renderBonusThanks();

  // Action log
  renderActionLog();

  // Name form + leaderboard
  setupNameForm(score, tier, tierData);
  renderLeaderboard(score);

  // Confetti for extreme scores
  if (score >= 751) triggerConfetti(false);
  if (score <= -751) triggerConfetti(true);
}

function getTier(score) {
  return TIERS.find(t => score >= t.min && score <= t.max) || TIERS[2];
}

function renderBonusThanks() {
  const box = $('bonus-thanks');
  const textEl = $('bonus-thanks-text');
  const img = $('bonus-thanks-image');
  if (!box || !textEl || !img) return;

  const thanks = [];
  if (state.flags.has('saved_cat')) {
    thanks.push({
      key: 'cat',
      text: 'Die Besitzerin der schwarzen Katze, die Sie gerettet haben, hat beim BGR eine persönliche Danksagung hinterlegt.',
      imageBase: 'assets/thanks/cat',
      imageAlt: 'Danksagung der Katzenbesitzerin',
    });
  }
  if (state.flags.has('returned_wallet')) {
    thanks.push({
      key: 'wallet',
      text: 'Die Person, deren Portemonnaie Sie zum Fundbüro gebracht haben, hat beim BGR ein persönliches Dankeschön hinterlegt.',
      imageBase: 'assets/thanks/wallet',
      imageAlt: 'Danksagung zum zurückgegebenen Portemonnaie',
    });
  }

  if (thanks.length === 0) {
    box.classList.add('hidden');
    img.classList.add('hidden');
    img.src = '';
    textEl.textContent = '';
    return;
  }

  const selected = thanks.length === 1
    ? thanks[0]
    : thanks[Math.floor(Math.random() * thanks.length)];

  box.classList.remove('hidden');
  textEl.textContent = selected.text;
  img.alt = selected.imageAlt;
  img.classList.add('hidden');
  tryLoadImage(
    img,
    selected.imageBase,
    () => img.classList.remove('hidden'),
    () => {
      img.classList.add('hidden');
      img.src = '';
    }
  );
}

function renderActionLog() {
  const container = $('action-log-container');
  container.innerHTML = '';
  if (state.actionLog.length === 0) {
    container.innerHTML = '<p style="color:#6b7280;font-size:14px;">Keine Aktionen protokolliert.</p>';
    return;
  }
  state.actionLog.forEach(entry => {
    const el = document.createElement('div');
    el.className = 'action-log-entry';
    const pos = entry.points >= 0;
    el.innerHTML = `
      <div class="log-points ${pos ? 'pos' : 'neg'}">${pos ? '+' : ''}${entry.points}</div>
      <div>
        <div>${entry.hotspotLabel}</div>
        <div class="log-meta">${LOCATION_NAMES[entry.location]} · ${PHASE_LABELS[entry.phase]}</div>
        <div style="font-size:13px;color:#374151;margin-top:3px;">${entry.optionText}</div>
      </div>
    `;
    container.appendChild(el);
  });
}

// ============================================================
//  LEADERBOARD  (Firebase Realtime Database)
// ============================================================

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function setupNameForm(score, tier, tierData) {
  const form = $('name-form');
  const input = $('name-input');
  const submitBtn = $('name-submit-btn');
  const submitSection = $('end-name-submit');
  const confirmation = $('end-name-confirmation');

  submitSection.classList.remove('hidden');
  confirmation.classList.add('hidden');
  input.disabled = false;
  submitBtn.disabled = false;
  submitBtn.textContent = 'Eintragen';
  input.value = localStorage.getItem(LS_PLAYER_NAME) || '';

  form.onsubmit = async (e) => {
    e.preventDefault();
    const name = input.value.trim().slice(0, NAME_MAX);
    if (!name) return;

    localStorage.setItem(LS_PLAYER_NAME, name);
    input.disabled = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird eingetragen...';

    const ok = await submitScore(name, score, tier);
    if (!ok) {
      input.disabled = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Erneut versuchen';
      return;
    }

    submitSection.classList.add('hidden');
    $('confirmed-name').textContent = name;
    confirmation.classList.remove('hidden');

    const all = await fetchScores();
    if (isNewHigh(score, all)) {
      const notice = $('end-highscore-notice');
      notice.textContent = tierData.highscore_message || 'Neuer Rekord!';
      notice.classList.remove('hidden');
    }
    renderLeaderboardFromData(all, score, name);
  };
}

async function submitScore(name, score, tier) {
  const body = {
    name: String(name).slice(0, NAME_MAX),
    score: Math.max(-1000, Math.min(1000, score | 0)),
    tier: tier.name,
    date: new Date().toISOString(),
  };
  try {
    const res = await fetch(`${FIREBASE_URL}/scores.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch { return false; }
}

async function fetchScores() {
  try {
    const res = await fetch(`${FIREBASE_URL}/scores.json`);
    if (!res.ok) return [];
    const data = await res.json();
    return data ? Object.values(data) : [];
  } catch { return []; }
}

function isNewHigh(score, scores) {
  if (score === 0) return false;
  const sameDir = scores.filter(s => (s.score > 0) === (score > 0));
  if (sameDir.length === 0) return true;
  return score > 0
    ? score >= Math.max(...sameDir.map(s => s.score))
    : score <= Math.min(...sameDir.map(s => s.score));
}

async function renderLeaderboard(currentScore, justSubmittedName) {
  const grid = $('leaderboard-grid');
  grid.innerHTML = '<p style="grid-column:1/-1;color:#6b7280;font-size:13px;text-align:center;">Wird geladen...</p>';
  const all = await fetchScores();
  renderLeaderboardFromData(all, currentScore, justSubmittedName);
}

function renderLeaderboardFromData(all, currentScore, justSubmittedName) {
  const grid = $('leaderboard-grid');
  grid.innerHTML = '';

  const positive = all.filter(e => e.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
  const negative = all.filter(e => e.score < 0).sort((a, b) => a.score - b.score).slice(0, 5);

  function renderCol(entries, label, cssClass) {
    const col = document.createElement('div');
    col.className = `leaderboard-col ${cssClass}`;
    col.innerHTML = `<h4>${escapeHtml(label)}</h4>`;
    if (entries.length === 0) {
      col.innerHTML += '<p style="font-size:13px;color:#6b7280;">Noch keine Einträge.</p>';
      return col;
    }
    entries.forEach((e, i) => {
      const row = document.createElement('div');
      row.className = 'leaderboard-entry';
      if (justSubmittedName && e.name === justSubmittedName && e.score === currentScore) {
        row.classList.add('is-new');
      }
      const scoreStr = e.score >= 0 ? `+${e.score}` : `${e.score}`;
      row.innerHTML = `
        <span class="leaderboard-rank">${i + 1}.</span>
        <span class="leaderboard-name">${escapeHtml(e.name || 'Anonym')}</span>
        <span class="leaderboard-score">${scoreStr}</span>
      `;
      col.appendChild(row);
    });
    return col;
  }

  grid.appendChild(renderCol(positive, 'Unsere Musterbürger:innen', 'positive'));
  grid.appendChild(renderCol(negative, 'Die hartnäckigsten Widerständler:innen', 'negative'));
}

// ============================================================
//  BGR NOTIFICATION
// ============================================================

let bgrTimeout = null;

function showBGRNotification(points, detail = '') {
  clearTimeout(bgrTimeout);

  const pos = points >= 0;
  bgrNotif.className = pos ? 'positive' : 'negative';
  $('bgr-notif-points').textContent = (pos ? '+' : '') + points + ' Sozialkredit';
  $('bgr-notif-label').textContent = detail || (pos ? 'Bundesamt für Gerechtigkeit' : 'Registriert durch BGR');

  const icon = $('bgr-notif-icon');
  icon.src = pos ? 'assets/icon_s_plus.svg' : 'assets/icon_camera.svg';
  icon.alt = pos ? 'S+ Logo' : 'Überwachungskamera';

  // Force reflow then show
  bgrNotif.classList.remove('show');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      bgrNotif.classList.add('show');
    });
  });

  bgrTimeout = setTimeout(() => bgrNotif.classList.remove('show'), 3000);
}

// ============================================================
//  SCORE / TOP BAR
// ============================================================

function updateTopBar() {
  const s = state.score;
  scoreValue.textContent = s >= 0 ? `+${s}` : `${s}`;
  scoreValue.className = s > 0 ? 'positive' : s < 0 ? 'negative' : '';
  phaseDisplay.textContent = PHASE_LABELS[state.phase] || '';
  if (window.placementMode) updatePlacementPhaseSwitcher();
}

// ============================================================
//  SOUND
// ============================================================

const bgMusic = new Audio('../website_material/baranova_n-city-birds-444667.wav');
bgMusic.loop = true;
bgMusic.volume = 0.35;

function startMusic() {
  if (!soundEnabled) return;
  bgMusic.play().catch(() => {}); // autoplay policy: silently ignore if blocked
}

function fadeOutMusic(duration = 2000) {
  if (bgMusic.paused) return;
  const startVol = bgMusic.volume;
  const steps = 40;
  const interval = duration / steps;
  let step = 0;
  const fade = setInterval(() => {
    step++;
    bgMusic.volume = Math.max(0, startVol * (1 - step / steps));
    if (step >= steps) {
      clearInterval(fade);
      bgMusic.pause();
      bgMusic.volume = startVol;
    }
  }, interval);
}

function playChime(positive) {
  if (!soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (positive) {
      osc.frequency.setValueAtTime(523, ctx.currentTime);       // C5
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    } else {
      osc.frequency.setValueAtTime(330, ctx.currentTime);       // E4
      osc.frequency.setValueAtTime(277, ctx.currentTime + 0.15);// C#4
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    }

    osc.type = 'sine';
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.7);
  } catch (e) { /* AudioContext not supported */ }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem(LS_SOUND, soundEnabled);
  if (soundEnabled) {
    bgMusic.play().catch(() => {});
  } else {
    bgMusic.pause();
  }
  updateSoundToggle();
}

function updateSoundToggle() {
  $('sound-toggle').textContent = soundEnabled ? '🔊' : '🔇';
  $('sound-toggle').setAttribute('aria-label', soundEnabled ? 'Ton ausschalten' : 'Ton einschalten');
}

// ============================================================
//  CONFETTI
// ============================================================

function triggerConfetti(dark) {
  const container = $('confetti-container');
  container.innerHTML = '';
  const colors = dark
    ? ['#d8232a', '#222', '#555', '#888']
    : ['#d8232a', '#ffffff', '#f5c6c8', '#fff'];

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = (Math.random() * 8 + 6) + 'px';
    piece.style.height = (Math.random() * 8 + 6) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
    piece.style.animationDelay = (Math.random() * 1.5) + 's';
    container.appendChild(piece);
  }

  setTimeout(() => { container.innerHTML = ''; }, 5000);
}

// ============================================================
//  SCREEN MANAGEMENT
// ============================================================

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    el.classList.toggle('active', key === name);
  });
}

// ============================================================
//  BOOT
// ============================================================

document.addEventListener('DOMContentLoaded', init);
