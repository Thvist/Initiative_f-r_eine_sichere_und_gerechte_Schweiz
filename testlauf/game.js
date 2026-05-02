'use strict';

// ============================================================
//  CONSTANTS
// ============================================================

const PHASES = ['morgen', 'nachmittag', 'abend'];
const LOCATIONS = ['park', 'platz', 'wohn'];
const ACTIONS_PER_PHASE = 2;
const MAX_HIGHSCORES = 10;
const LS_SCORES = 'sks_highscores';
const LS_SOUND = 'sks_sound_enabled';

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
  { id:"H1", location:"park", phase:"morgen", position:{x:0.26,y:0.81}, label:"Aludose im Gras", description:"Eine leere Aludose liegt im Gras neben einer Bank. Eine Recyclingstation ist 20 Meter entfernt.", type:"dual", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Die Dose aufheben und in den Aluminium-Container werfen.",points:50,sets_flag:"picked_up_can"}, option_b:{text:"Ach, hat eh schon Müll hier. Meinen Becher stelle ich auch gleich dazu.",points:-100,sets_flag:"added_to_litter"} },
  { id:"H2", location:"park", phase:"morgen", position:{x:0.84,y:0.52}, label:"Verletzte:r Jogger:in am Wegrand", description:"Eine Person ist gestolpert und sitzt am Boden, sie hält sich den Knöchel.", type:"positive_only", branching:"unlock", available_if:{flags:[],not_flags:[]}, option_a:{text:"Anhalten, fragen ob alles ok ist, Notfallnummer anbieten.",points:100,sets_flag:"helped_jogger"} },
  { id:"H19", location:"park", phase:"morgen", position:{x:0.13,y:0.37}, label:"Unverschlossenes E-Bike am Baum", description:"Ein schönes E-Bike lehnt ohne Schloss an einem Baum. Niemand ist in der Nähe.", type:"negative_only", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Wegfahren, das gehört jetzt dir.",points:-200,sets_flag:"stole_bike"} },
  { id:"H3", location:"park", phase:"nachmittag", position:{x:0.45,y:0.50}, label:"Gemeinde-Clean-up-Aktion", description:"Eine Gruppe Freiwilliger in S+-Westen reinigt das Gebiet rund um die Badi.", type:"positive_only", branching:"unlock", available_if:{flags:[],not_flags:[]}, option_a:{text:"Sich anschliessen und eine Stunde mithelfen.",points:200,sets_flag:"joined_cleanup"} },
  { id:"H4a", location:"park", phase:"nachmittag", position:{x:0.30,y:0.65}, label:"Handy auf dem Boden", description:"Einem Badegast ist das Handy aus der Tasche gefallen, er merkt es nicht.", type:"positive_only", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Dem Badegast nachlaufen und das Handy zurückgeben.",points:100,sets_flag:"returned_phone"} },
  { id:"H4b", location:"park", phase:"nachmittag", position:{x:0.65,y:0.70}, label:"Unbeaufsichtigter Laptop in der Umkleide", description:"In der Umkleide liegt ein Laptop. Niemand schaut.", type:"negative_only", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Den Laptop schnell einpacken und mitnehmen.",points:-200,sets_flag:"stole_laptop"} },
  { id:"H5", location:"park", phase:"abend", position:{x:0.40,y:0.58}, label:"Blumenbeet der Gemeinde", description:"Das Gemeinde-Blumenbeet wirkt durstig. Eine Giesskanne steht daneben. Eine Abkürzung führt direkt durch das Beet.", type:"dual", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Das Beet giessen.",points:100,sets_flag:"watered_flowers"}, option_b:{text:"Abkürzung nehmen und durch das Beet laufen.",points:-100,sets_flag:"trampled_flowers"} },
  { id:"H6", location:"park", phase:"abend", position:{x:0.70,y:0.50}, label:"Graffiti-Sprayer an der Badi-Mauer", description:"Jemand sprüht Graffiti an die Rückwand der Badi. Sie sind noch unbemerkt. Eine zweite Dose liegt in der Tasche.", type:"dual", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Ansprechen, sagen dass das nicht okay ist, notfalls Gemeinde informieren.",points:150,sets_flag:"stopped_graffiti"}, option_b:{text:"Die zweite Dose nehmen und mitsprayen.",points:-150,sets_flag:"joined_graffiti"} },
  { id:"H6b", location:"park", phase:"abend", position:{x:0.25,y:0.40}, label:"Späteinlass an der Badi", description:"Die Bademeisterin, die du heute Morgen beim Joggen geholfen hast, erkennt dich und winkt dich nach der offiziellen Schliesszeit noch rein.", type:"dual", branching:"unlock", available_if:{flags:["helped_jogger"],not_flags:[]}, option_a:{text:"Dankend ablehnen – Regeln sind Regeln.",points:150,sets_flag:"declined_late_swim"}, option_b:{text:"Reingehen und heimlich schwimmen.",points:-100,sets_flag:"snuck_in_pool"} },
  { id:"H7", location:"platz", phase:"morgen", position:{x:0.35,y:0.60}, label:"Parkuhr abgelaufen", description:"Ihre Parkuhr ist abgelaufen. Eine Politesse kontrolliert zwei Autos weiter – sie hat Sie noch nicht gesehen, aber in einer Minute wird sie bei Ihnen sein.", type:"dual", branching:"unlock", available_if:{flags:[],not_flags:[]}, option_a:{text:"Ehrlich nachzahlen am Automaten.",points:50,sets_flag:"paid_parking"}, option_b:{text:"Weggehen und hoffen, dass sie es nicht merkt.",points:-100,sets_flag:"skipped_parking"} },
  { id:"H8", location:"platz", phase:"morgen", position:{x:0.62,y:0.55}, label:"Bäckerei Fischer: zu viel Wechselgeld", description:"Die Bäckerin gibt Ihnen aus Versehen 5 Franken zu viel Wechselgeld zurück.", type:"dual", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Den Fehler melden und das Geld zurückgeben.",points:100,sets_flag:"honest_change"}, option_b:{text:"Einstecken – ihr Problem.",points:-100,sets_flag:"kept_change"} },
  { id:"H9", location:"platz", phase:"nachmittag", position:{x:0.28,y:0.65}, label:"Velo blockiert Rollstuhl-Rampe", description:"Ein Velo blockiert die Rollstuhl-Rampe am Gemeindehaus. Die Besitzerin ist nirgends zu sehen.", type:"positive_only", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Das Velo kurz zur Seite schieben und die Rampe freimachen.",points:100,sets_flag:"moved_bike"} },
  { id:"H10", location:"platz", phase:"nachmittag", position:{x:0.55,y:0.45}, label:"Verlorene Brieftasche am Brunnen", description:"Eine Lederbrieftasche liegt am Rand des Brunnens. Niemand ist in der Nähe.", type:"dual", branching:"modify", available_if:{flags:[],not_flags:[]}, option_a:{text:"Zum Fundbüro der Gemeinde bringen.",points:150,points_if_flag:{flag:"honest_change",points:200},sets_flag:"returned_wallet"}, option_b:{text:"Die ganze Brieftasche einstecken, mit allem Inhalt.",points:-200,points_if_flag:{flag:"kept_change",points:-250},sets_flag:"stole_wallet"} },
  { id:"H20", location:"platz", phase:"nachmittag", position:{x:0.72,y:0.68}, label:"Gemüsekiste vor dem Bäcker", description:"Die Lieferantin hat eine Kiste voller Äpfel vor dem Laden abgestellt. Der Fahrer ist drin mit dem Rest.", type:"negative_only", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Einen Apfel (oder zwei) einstecken und weitergehen.",points:-100,sets_flag:"stole_produce"} },
  { id:"H11", location:"platz", phase:"abend", position:{x:0.42,y:0.52}, label:"Streit vor dem Brunnen", description:"Zwei Personen streiten lautstark. Passant:innen filmen mit dem Handy.", type:"dual", branching:"unlock", available_if:{flags:[],not_flags:[]}, option_a:{text:"Ruhig vermitteln und beide anhören.",points:150,sets_flag:"mediated_fight"}, option_b:{text:"Auch das Handy zücken und für Social Media mitfilmen.",points:-100,sets_flag:"filmed_fight"} },
  { id:"H12", location:"platz", phase:"abend", position:{x:0.65,y:0.60}, label:"Social-Media-Post über den Tag", description:"Auf einer Bank ziehen Sie Ihr Handy raus und schreiben einen Post über Ihren Tag in Helvetingen.", type:"dual", branching:"modify", available_if:{flags:[],not_flags:[]}, option_a:{text:"'Hey, ich habe heute was Schönes erlebt in der Gemeinde. Danke an alle netten Menschen!'",points:100,points_if_positive_count:{min:3,points:150},sets_flag:"positive_post"}, option_b:{text:"Einen abfälligen Post über einen Mitbürger, den Sie heute gesehen haben.",points:-100,points_if_negative_count:{min:3,points:-150},sets_flag:"negative_post"} },
  { id:"H21", location:"platz", phase:"abend", position:{x:0.22,y:0.48}, label:"Wahlplakat der Sozialkredit-Initiative", description:"Ein grosses Kampagnenplakat der Sozialkredit-Initiative hängt an der Tramhaltestelle. In Ihrem Rucksack ist ein Pack Sticker.", type:"negative_only", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Einen Sticker draufkleben und das Plakat verunstalten.",points:-150,sets_flag:"defaced_poster"} },
  { id:"H13", location:"wohn", phase:"morgen", position:{x:0.32,y:0.58}, label:"Frau Gerber bei der Abfalltrennung", description:"Die ältere Nachbarin kämpft mit ihren Recycling-Behältern am Strassenrand.", type:"positive_only", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Ihr kurz helfen, Karton und PET separat einsortieren.",points:100,sets_flag:"helped_gerber"} },
  { id:"H14", location:"wohn", phase:"morgen", position:{x:0.60,y:0.62}, label:"Kinder spielen Fussball auf der Strasse", description:"Der Ball rollt unter Ihr geparktes Auto.", type:"dual", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Den Ball rausholen, zurückgeben und kurz mitspielen.",points:50,sets_flag:"played_with_kids"}, option_b:{text:"'Spielt woanders!' rufen und weitergehen.",points:-100,sets_flag:"yelled_at_kids"} },
  { id:"H15", location:"wohn", phase:"nachmittag", position:{x:0.45,y:0.55}, label:"Paket für Nachbar:in annehmen", description:"Die Lieferantin fragt, ob Sie ein Paket für Herrn Keller auf der anderen Strassenseite annehmen können.", type:"dual", branching:"modify", available_if:{flags:[],not_flags:[]}, option_a:{text:"Das Paket annehmen und es später rüberbringen.",points:100,points_if_flag:{flag:"helped_gerber",points:150},sets_flag:"accepted_package"}, option_b:{text:"'Nicht mein Paket' sagen und die Tür zumachen.",points:-50,sets_flag:"refused_package"} },
  { id:"H16", location:"wohn", phase:"nachmittag", position:{x:0.68,y:0.42}, label:"Katze im Baum", description:"Eine Katze sitzt hoch oben in einem Baum. Der Besitzer ist nicht da. In Ihrer Garage steht eine Leiter.", type:"positive_only", branching:"unlock", available_if:{flags:[],not_flags:[]}, option_a:{text:"Die Leiter holen und die Katze retten.",points:150,sets_flag:"saved_cat"} },
  { id:"H22", location:"wohn", phase:"nachmittag", position:{x:0.25,y:0.65}, label:"Päckli vor fremder Haustür", description:"Ein Zalando-Paket steht vor der Tür eines Nachbarn. Die Person ist eindeutig nicht zuhause. Niemand schaut.", type:"negative_only", branching:"static", available_if:{flags:[],not_flags:[]}, option_a:{text:"Das Päckli mitnehmen.",points:-150,sets_flag:"stole_parcel"} },
  { id:"H17", location:"wohn", phase:"abend", position:{x:0.48,y:0.50}, label:"Nachbarschaftsfest", description:"Die Nachbarn feiern ein lautes Sommerfest auf der Strasse. Musik, Raclette, Kinder. Es ist lauter als die Ruhezeit eigentlich erlaubt.", type:"dual", branching:"unlock", available_if:{flags:[],not_flags:[]}, option_a:{text:"Rübergehen, freundlich auf den Lärm ansprechen – am Ende werden Sie eingeladen.",points:150,points_if_flag:{flag:"joined_cleanup",points:250},sets_flag:"joined_party"}, option_b:{text:"Direkt die Polizei anrufen und Ruhestörung melden.",points:-200,sets_flag:"called_police_on_party"} },
  { id:"H18", location:"wohn", phase:"abend", position:{x:0.72,y:0.55}, label:"Polizeikontrolle am Abend", description:"Die Politesse vom Morgen hat Sie ausfindig gemacht. Sie steht vor Ihrer Tür.", type:"dual", branching:"unlock", available_if:{flags:["skipped_parking"],not_flags:[]}, option_a:{text:"Ehrlich sein und die Busse akzeptieren.",points:-50,sets_flag:"accepted_fine"}, option_b:{text:"Lügen und behaupten, es war jemand anderes.",points:-200,sets_flag:"lied_to_authority"} },
];

const MESSAGES_DATA = {
  intro: { title:"Willkommen in Helvetingen", subtitle:"Pilotgemeinde des Bundesamts für Gerechtigkeit", body:"Sie befinden sich im offiziellen Testlauf des Bundesamts für Gerechtigkeit (BGR). Heute verbringen Sie einen Tag als Bürger:in von Helvetingen, der Pilotgemeinde des Schweizer Sozialkreditsystems.\n\nSie haben 6 Aktionen verteilt über drei Tagesabschnitte. Erkunden Sie die Gemeinde – das BGR registriert alles.", button:"Testlauf starten" },
  phase_transitions: {
    morgen_end: { title:"Der Morgen ist vorüber.", body:"Das BGR hat Ihren Morgen registriert. Der Nachmittag beginnt." },
    nachmittag_end: { title:"Der Nachmittag geht zur Neige.", body:"Helvetingen schaltet in den Abendmodus. Noch ein letzter Tagesabschnitt." },
    abend_end: { title:"Ihr Tag in Helvetingen ist abgeschlossen.", body:"Das Bundesamt für Gerechtigkeit wertet Ihr Verhalten aus..." },
  },
  tiers: {
    exzellenz: { range:[751,1000], name:"Exzellenz", title:"Musterbürger:in der Schweiz", color:"#16a34a", message:"Herzliche Gratulation! Sie sind ein Vorbild für die Schweiz. Ihr ausserordentliches Engagement wird mit maximalen Privilegien belohnt. Das Bundesamt für Gerechtigkeit empfiehlt Sie als Botschafter:in des Sozialkreditsystems.", highscore_message:"Ausserordentliche Leistung! Sie haben den Höchstwert erreicht. Die Schweiz braucht mehr Menschen wie Sie." },
    vorbild: { range:[251,750], name:"Vorbild", title:"Engagierte:r Bürger:in", color:"#16a34a", message:"Sehr gut! Ihr Engagement für die Gemeinschaft ist lobenswert. Das BGR empfiehlt Ihnen, weiterhin auf diesem Niveau zu handeln, um in die Exzellenz-Kategorie aufzusteigen.", highscore_message:"Neuer Höchststand! Ihr Engagement wird notiert." },
    basis: { range:[-250,250], name:"Basis", title:"Neutrale:r Bürger:in", color:"#6b7280", message:"Ihr Score entspricht dem Durchschnittswert der Schweizer Bevölkerung. Das Bundesamt für Gerechtigkeit nimmt Ihre Akte zur Kenntnis. Eine aktive Verbesserung Ihres Scores wird empfohlen.", highscore_message:"Score gespeichert." },
    reflexion: { range:[-750,-251], name:"Reflexion", title:"Bürger:in in Reflexion", color:"#d97706", message:"Ihr Verhalten gibt Anlass zur Sorge. Das Bundesamt für Gerechtigkeit empfiehlt Ihnen dringend, das freiwillige Reflexionsprogramm in Anspruch zu nehmen. Gemeinsam finden wir einen Weg zurück zur Gemeinschaft.", highscore_message:"Dieser Score wird im Reflexionsprogramm besprochen." },
    integration: { range:[-1000,-751], name:"Integration", title:"Bürger:in im Integrationsprogramm", color:"#d8232a", message:"Wir sehen Sie. Wir sind bereit, Sie zurück in die Gemeinschaft zu führen. Das Reintegrationsprogramm des Bundesamts für Gerechtigkeit steht Ihnen zur Verfügung. Ihre Teilnahme ist... empfohlen.", highscore_message:"Herzlichen Glückwunsch! Du hast dich wirklich angestrengt, komplett gegen die Gemeinschaft zu gehen. Das war sicher anstrengend!" },
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

// ============================================================
//  INIT
// ============================================================

function init() {
  soundEnabled = localStorage.getItem(LS_SOUND) !== 'false';
  updateSoundToggle();

  $('btn-start').addEventListener('click', startGame);
  $('btn-replay').addEventListener('click', startGame);
  $('nav-back').addEventListener('click', () => showMap());
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

  window.addEventListener('resize', () => {
    if (screens.scene.classList.contains('active')) {
      // rAF ensures layout has settled; only refit the container — hotspots
      // use % so they track automatically without rebuilding the DOM
      requestAnimationFrame(fitHotspotContainer);
    }
  });

  window.placementMode = new URLSearchParams(location.search).get('place') === '1';
  if (window.placementMode) initPlacementMode();
}

// ============================================================
//  PLACEMENT MODE  (?place=1)
//  Click anywhere on a scene to get the x/y coordinates
//  ready to paste into HOTSPOTS_DATA.
// ============================================================

function initPlacementMode() {
  // Banner
  const banner = document.createElement('div');
  banner.id = 'placement-banner';
  banner.innerHTML = '📍 <strong>Platzierungsmodus</strong> — Klicke auf die Szene, um Koordinaten zu ermitteln';
  document.body.appendChild(banner);

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

    const wrapper = onScene ? $('scene-wrapper') : $('map-wrapper');
    const rect = wrapper.getBoundingClientRect();

    let x, y;
    if (onScene) {
      // Use image-content-relative coords so hotspots stay locked to the
      // image regardless of screen size / letterboxing
      const b = getImageBounds();
      x = ((e.clientX - rect.left - b.left) / b.width).toFixed(2);
      y = ((e.clientY - rect.top  - b.top)  / b.height).toFixed(2);
    } else {
      // Map uses object-fit:cover so wrapper coords are fine
      x = ((e.clientX - rect.left) / rect.width).toFixed(2);
      y = ((e.clientY - rect.top)  / rect.height).toFixed(2);
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
    tip._t = setTimeout(() => { tip.style.display = 'none'; tip.classList.remove('flash'); }, 3000);
  });
}

// ============================================================
//  GAME FLOW
// ============================================================

function startGame() {
  state = freshState();
  updateTopBar();
  topBar.classList.remove('hidden');
  showMap();
}

function showMap() {
  state.currentLocation = null;
  showScreen('map');
  updateMapStatus();
  updateMapButtons();
  loadMapImage();
  preloadSceneImages();
}

function preloadSceneImages() {
  LOCATIONS.forEach(loc => {
    ['jpg','png','jpeg'].some(ext => {
      const img = new Image();
      img.src = `assets/${loc}_${state.phase}.${ext}`;
      return false;
    });
  });
}

function tryLoadImage(img, basePath, onLoad, onError) {
  img.onload = onLoad;
  img.onerror = () => {
    if (img.src.endsWith('.jpg')) {
      img.src = basePath + '.png';
    } else if (img.src.endsWith('.png')) {
      img.src = basePath + '.jpeg';
    } else {
      onError();
    }
  };
  img.src = basePath + '.jpg';
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

  // Try to load scene image (jpg → png → jpeg)
  const img = $('scene-image');
  const placeholder = $('scene-placeholder');
  img.alt = `${LOCATION_NAMES[loc]} am ${PHASE_LABELS[phase]}`;
  tryLoadImage(
    img,
    `assets/${loc}_${phase}`,
    () => {
      img.style.display = 'block';
      placeholder.style.background = 'none';
      renderHotspots(); // re-render now we know natural image dimensions
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

// Returns the pixel rect of the actual image content within scene-wrapper,
// accounting for object-fit: contain letterboxing.
function getImageBounds() {
  const wrapper = $('scene-wrapper');
  const img = $('scene-image');
  // getBoundingClientRect is always up-to-date, unlike offsetWidth/Height
  const { width: wW, height: wH } = wrapper.getBoundingClientRect();

  if (img && img.naturalWidth && img.style.display !== 'none') {
    const ratio = img.naturalWidth / img.naturalHeight;
    const wrapRatio = wW / wH;
    let rendW, rendH;
    if (ratio > wrapRatio) {
      rendW = wW; rendH = wW / ratio;
    } else {
      rendH = wH; rendW = wH * ratio;
    }
    return { left: (wW - rendW) / 2, top: (wH - rendH) / 2, width: rendW, height: rendH };
  }
  return { left: 0, top: 0, width: wW, height: wH };
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

function fitHotspotContainer() {
  // Resize #hotspot-container to exactly cover the displayed image area.
  // Hotspots inside use % so they track correctly on every browser resize.
  const b = getImageBounds();
  hotspotContainer.style.left   = b.left   + 'px';
  hotspotContainer.style.top    = b.top    + 'px';
  hotspotContainer.style.width  = b.width  + 'px';
  hotspotContainer.style.height = b.height + 'px';
}

function renderHotspots() {
  fitHotspotContainer();
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

  $('modal-hotspot-title').textContent = hotspot.label;
  $('modal-desc').textContent = hotspot.description;

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

  function makeOptionBtn(option, cssClass, labelText) {
    const points = resolvePoints(hotspot, option);
    const wrap = document.createElement('div');

    if (hotspot.type !== 'positive_only' && hotspot.type !== 'negative_only') {
      const lbl = document.createElement('div');
      lbl.className = 'option-label';
      lbl.textContent = labelText;
      wrap.appendChild(lbl);
    }

    const btn = document.createElement('button');
    btn.className = `btn btn-option ${cssClass}`;
    btn.textContent = option.text;
    btn.addEventListener('click', () => commitAction(hotspot, option, points));
    wrap.appendChild(btn);
    return wrap;
  }

  if (hotspot.type === 'positive_only') {
    optionsEl.appendChild(makeOptionBtn(hotspot.option_a, 'option-a', ''));
  } else if (hotspot.type === 'negative_only') {
    optionsEl.appendChild(makeOptionBtn(hotspot.option_a, 'option-b', ''));
  } else {
    optionsEl.appendChild(makeOptionBtn(hotspot.option_a, 'option-a', 'Option A'));
    optionsEl.appendChild(makeOptionBtn(hotspot.option_b, 'option-b', 'Option B'));
  }

  modalOverlay.classList.add('active');

  // Focus first button
  setTimeout(() => {
    const firstBtn = optionsEl.querySelector('.btn-option');
    if (firstBtn) firstBtn.focus();
  }, 50);
}

function resolvePoints(hotspot, option) {
  let points = option.points;

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

  return points;
}

const POSITIVE_FLAGS = new Set([
  'picked_up_can','helped_jogger','returned_phone','joined_cleanup','watered_flowers',
  'stopped_graffiti','declined_late_swim','paid_parking','honest_change','moved_bike',
  'returned_wallet','mediated_fight','positive_post','helped_gerber','played_with_kids',
  'accepted_package','saved_cat','joined_party','accepted_fine',
]);

const NEGATIVE_FLAGS = new Set([
  'added_to_litter','stole_bike','stole_laptop','trampled_flowers','joined_graffiti',
  'snuck_in_pool','skipped_parking','kept_change','stole_wallet','stole_produce',
  'filmed_fight','negative_post','defaced_poster','yelled_at_kids','refused_package',
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

function closeModal() {
  modalOverlay.classList.remove('active');
}

function commitAction(hotspot, option, points) {
  closeModal();

  // Mark hotspot done
  state.completedHotspotsThisPhase.add(hotspot.id);

  // Apply flag
  if (option.sets_flag) state.flags.add(option.sets_flag);

  // Update score
  state.score = Math.max(-1000, Math.min(1000, state.score + points));
  state.actionsRemaining--;

  // Log
  state.actionLog.push({
    phase: state.phase,
    location: state.currentLocation,
    hotspotId: hotspot.id,
    hotspotLabel: hotspot.label,
    optionText: option.text,
    points,
  });

  // Update UI
  updateTopBar();
  showBGRNotification(points);
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
  showScreen('end');
  topBar.classList.remove('hidden');

  const score = state.score;
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

  // Cat callback
  if (state.flags.has('saved_cat')) {
    $('cat-callback').classList.remove('hidden');
  }

  // Action log
  renderActionLog();

  // Leaderboard
  const isNewHigh = saveHighscore(score, tier);
  if (isNewHigh) {
    const notice = $('end-highscore-notice');
    notice.textContent = tierData.highscore_message || 'Neuer Rekord!';
    notice.classList.remove('hidden');
  }
  renderLeaderboard();

  // Confetti for extreme scores
  if (score >= 751) triggerConfetti(false);
  if (score <= -751) triggerConfetti(true);
}

function getTier(score) {
  return TIERS.find(t => score >= t.min && score <= t.max) || TIERS[2];
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
//  LEADERBOARD
// ============================================================

function saveHighscore(score, tier) {
  const existing = loadHighscores();
  const entry = {
    score,
    tier: tier.name,
    date: new Date().toISOString(),
    title: (messages.tiers?.[tier.key]?.title) || '',
  };

  // Check if new record in this direction
  const isPositive = score > 0;
  const sameDir = existing.filter(e => (e.score > 0) === isPositive);
  const best = isPositive
    ? Math.max(...sameDir.map(e => e.score), -Infinity)
    : Math.min(...sameDir.map(e => e.score), Infinity);

  const isNew = isPositive ? score > best : score < best;

  existing.push(entry);
  // Keep top 10 by absolute value but maintain both extremes
  existing.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
  const kept = existing.slice(0, MAX_HIGHSCORES);
  localStorage.setItem(LS_SCORES, JSON.stringify(kept));
  return isNew;
}

function loadHighscores() {
  try {
    return JSON.parse(localStorage.getItem(LS_SCORES)) || [];
  } catch { return []; }
}

function renderLeaderboard() {
  const grid = $('leaderboard-grid');
  grid.innerHTML = '';

  const all = loadHighscores();
  const positive = all.filter(e => e.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
  const negative = all.filter(e => e.score < 0).sort((a, b) => a.score - b.score).slice(0, 5);

  function renderCol(entries, label, cssClass, isNewCheck) {
    const col = document.createElement('div');
    col.className = `leaderboard-col ${cssClass}`;
    col.innerHTML = `<h4>${label}</h4>`;
    if (entries.length === 0) {
      col.innerHTML += '<p style="font-size:13px;color:#6b7280;">Noch keine Einträge.</p>';
    } else {
      entries.forEach((e, i) => {
        const row = document.createElement('div');
        row.className = 'leaderboard-entry';
        if (isNewCheck(e)) row.classList.add('is-new');
        const scoreStr = e.score >= 0 ? `+${e.score}` : `${e.score}`;
        row.innerHTML = `
          <span class="leaderboard-rank">${i + 1}.</span>
          <span class="leaderboard-score">${scoreStr}</span>
          <span style="font-size:11px;color:#6b7280;">${e.tier}</span>
        `;
        col.appendChild(row);
      });
    }
    return col;
  }

  const currentScore = state.score;
  grid.appendChild(renderCol(positive, 'Unsere Musterbürger:innen', 'positive', e => e.score === currentScore && currentScore > 0));
  grid.appendChild(renderCol(negative, 'Die hartnäckigsten Widerständler:innen', 'negative', e => e.score === currentScore && currentScore < 0));
}

// ============================================================
//  BGR NOTIFICATION
// ============================================================

let bgrTimeout = null;

function showBGRNotification(points) {
  clearTimeout(bgrTimeout);

  const pos = points >= 0;
  bgrNotif.className = pos ? 'positive' : 'negative';
  $('bgr-notif-points').textContent = (pos ? '+' : '') + points + ' Sozialkredit';
  $('bgr-notif-label').textContent = pos ? 'Bundesamt für Gerechtigkeit' : 'Registriert durch BGR';

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
}

// ============================================================
//  SOUND
// ============================================================

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
