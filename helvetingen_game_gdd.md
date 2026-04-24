# Helvetingen Testlauf
## Game Design Document (GDD) for the Sozialkredit-Initiative Mini-Game

---

## 1. Overview

### 1.1 Concept
A short point-and-click mini-game embedded in the Sozialkredit-Initiative campaign website, on the *Testlauf* subpage. The player spends one day as a citizen of **Helvetingen** (the fictional pilot town for the Swiss social credit system) and tries to maximize (or minimize) their Sozialkredit-Score. The game is presented earnestly, in the same propaganda-friendly voice as the rest of the website. Players are invited to "experience the system" and "try to become a *Vorbild* citizen."

### 1.2 Educational / Rhetorical Purpose
The site's stated goal is to promote a system the team does not actually endorse. The game serves this by:
- Letting players feel how seductive a "rewards for good behavior" framing can be.
- Showing how mundane daily choices (grass littering, coffee cup, parking ticket, social media post) get quantified into a score.
- Making surveillance feel friendly (the Bundesamt für Gerechtigkeit "notices" and rewards you).
- Offering a secondary path: trying to get the worst possible score reveals the system's punitive side, which is where the critique lands.

### 1.3 Target Audience
Visitors to the campaign website. Desktop and mobile. Age 14+. Short attention span, so the full loop (start → end screen) must run in 3-5 minutes.

### 1.4 Platform & Hosting
- Single-page web app, vanilla HTML / CSS / JavaScript (no build step required).
- Hosted as a static page under the *Testlauf* subpage on GitHub Pages.
- All state in-memory during play, `localStorage` for high scores.
- Fully responsive. Must work on mobile.

---

## 2. Core Loop

1. Player lands on the Testlauf page, sees an intro card ("Willkommen in Helvetingen").
2. Player enters the overview map (hand-drawn town).
3. For each of the three phases (**Morgen, Nachmittag, Abend**):
   - Choose a location (3 options on the overview map).
   - Enter the close-up scene for that location.
   - Click one of the available hotspots.
   - Choose one of two action variants (one typically pro-social, one anti-social).
   - See immediate feedback: score change in-world + subtle camera/tone cue.
   - Take a second action (either in the same location or travel to another location).
4. After the sixth action, the day ends. Final screen:
   - Score shown on the official -1000 / +1000 scale.
   - Tier assignment (Integration, Reflexion, Basis, Vorbild, Exzellenz).
   - Propaganda-style message matched to the tier.
   - Log of all six actions taken.
   - High-score entry and leaderboard (localStorage).
   - Buttons: *Nochmal spielen*, *Mehr erfahren* (back to website).

---

## 3. Setting & Locations

### 3.1 The Town of Helvetingen
A small, idyllic Swiss town. Hand-drawn illustration style. Three distinct districts are visible on the overview map, each mapping to one of the three official Punktequellen pillars from the initiative:

| Location                       | Pillar (from initiative)    | Vibe                        |
|--------------------------------|-----------------------------|-----------------------------|
| **Stadtpark** (city park)      | Umwelt & Ressourcen         | Nature, green, open air     |
| **Gemeindeplatz** (town square)| Zivile Verantwortung        | People, community, helping  |
| **Bankenviertel** (bank district) | Rechts & Gesellschaft    | Formal, transactions, rules |

### 3.2 Phase Visuals
Each location has three background variants, one per phase:
- **Morgen:** soft morning light, fewer people, dew.
- **Nachmittag:** bright, busy, lots of activity.
- **Abend:** warm sunset tones, golden hour, winding down.

The overview map also has three time-of-day variants.

**Note on asset production:** The player (Pascal) will hand-draw the scenes. The game engine should load images by convention, e.g. `assets/park_morgen.png`, `assets/park_nachmittag.png`, etc. This allows scenes to be swapped in without code changes.

### 3.3 Navigation
- From any close-up scene, the player can:
  - Click a **back arrow (top-left)** to return to the overview map.
  - Click **left/right arrows (screen edges)** to travel directly to the neighboring location without returning to the map.
- The overview map always shows the player's remaining actions for the current phase (e.g. "Morgen: 1 Aktion übrig").

---

## 4. Phases, Actions, and Time Flow

### 4.1 Phase Structure
- **Morgen:** 2 actions total.
- **Nachmittag:** 2 actions total.
- **Abend:** 2 actions total.
- Total: **6 actions per playthrough.**

### 4.2 Action Rules
- Each action is tied to a hotspot on a close-up scene.
- The player may take both their actions in one location, or split them between locations.
- After an action is completed, the corresponding hotspot **vanishes** from that scene for the remainder of that phase.
- Once both actions of a phase are used, the phase ends automatically (short transition screen: "Der Morgen ist vorüber...").
- Not all hotspots in a scene need to be used. The player skips over unused content.

### 4.3 Hotspot Availability Rules
Each hotspot is defined with a set of availability conditions:

- **Phase:** Some hotspots are phase-specific (e.g. "Morgen only"). Some are available all day.
- **Prerequisites:** Some hotspots only appear if a prior flag has been set (e.g. "only appears if the player picked up litter earlier").
- **Exclusions:** Some hotspots disappear if a prior flag has been set (e.g. "the police officer disappears if you already got fined").

### 4.4 Action Outcome Types
When clicked, a hotspot opens a short narrative card with two options:

- **Option A (meistens pro-sozial):** positive score change, often sets a positive flag.
- **Option B (meistens antisozial):** negative score change, often sets a negative flag.

Both options close the hotspot after selection. The player cannot undo.

---

## 5. Scoring

### 5.1 Score Scale
Matches the official Sozialkredit-System scale from the initiative:
- Range: **-1000 to +1000**
- Starting value: **0**

### 5.2 Point Values
Actions award points in meaningful increments within a single-day context. Suggested ranges:

| Magnitude         | Point value | Example                                    |
|-------------------|-------------|--------------------------------------------|
| Small pro-social  | +50         | Picking up litter                          |
| Medium pro-social | +100        | Donating blood, helping an elderly person  |
| Large pro-social  | +200        | Volunteering at the community clean-up     |
| Small antisocial  | -50         | Jaywalking                                 |
| Medium antisocial | -100        | Littering, parking violation               |
| Large antisocial  | -200        | Shoplifting, vandalism                     |

**Theoretical range per playthrough:** With 6 actions averaging +/-100 to +/-200, reaching the extremes of +1000 / -1000 is possible but requires consistently picking the strongest-scoring option in each phase. This keeps the extremes achievable but not trivial.

### 5.3 Feedback on Action
Immediately after each action:
- A notification slides in from the top-right, styled like an official BGR notice:
  - **Positive:** green accent, icon of the S+ logo, text: `+100 Sozialkredit | Bundesamt für Gerechtigkeit`
  - **Negative:** red accent, surveillance camera icon, text: `-100 Sozialkredit | Registriert durch BGR`
- Running total score is shown persistently in the top bar during play.
- No breakdown by category during play. The breakdown appears on the end screen.

### 5.4 Score Tiers (end screen)
Mapped to the five official tiers from the initiative:

| Score range        | Tier         | End-screen treatment                                              |
|--------------------|--------------|-------------------------------------------------------------------|
| +751 to +1000      | Exzellenz    | Full-screen celebration: confetti, fanfare, propaganda message   |
| +251 to +750       | Vorbild      | Positive, warm message. Green accents.                           |
| -250 to +250       | Basis        | Neutral, bureaucratic message. Grey tones.                       |
| -251 to -750       | Reflexion    | Paternalistic, gently concerned message. Amber tones.            |
| -751 to -1000      | Integration  | Full-screen dystopian propaganda: "Wir helfen Ihnen zurück."     |

### 5.5 Citizen Titles (by tier)
- Exzellenz: **Musterbürger:in der Schweiz**
- Vorbild: **Engagierte:r Bürger:in**
- Basis: **Neutrale:r Bürger:in**
- Reflexion: **Bürger:in in Reflexion**
- Integration: **Bürger:in im Integrationsprogramm**

### 5.6 Extreme Score Celebrations
- **Max positive (Exzellenz):** brief animation (S+ logo pulses, confetti in red/white), sound optional. Message: *"Herzliche Gratulation! Sie sind ein Vorbild für die Schweiz. Ihr ausserordentliches Engagement wird mit maximalen Privilegien belohnt."*
- **Max negative (Integration):** ominous lighting shift on the screen, slow fade. Message: *"Wir sehen Sie. Wir sind bereit, Sie zurück in die Gemeinschaft zu führen. Das Reintegrationsprogramm des Bundesamts für Gerechtigkeit steht Ihnen zur Verfügung."*

---

## 6. Action Catalogue

This is the content backbone. **18 actions across 3 locations x 3 phases x 2 hotspots per location.** Each hotspot offers 2 variants (Option A and B), for 36 total narrative beats.

Pascal will finalize copy. The structure below is the skeleton.

### 6.1 Data Structure for Each Hotspot

```
{
  id: "park_morgen_litter",
  location: "park",
  phase: "morgen",
  position: { x: 0.35, y: 0.60 },   // relative to scene image (0-1)
  label: "Ein Kaffeebecher auf dem Rasen",
  available_if: { flags: [], not_flags: [] },
  option_a: {
    text: "Den Becher aufheben und entsorgen.",
    points: +50,
    sets_flag: "picked_up_litter"
  },
  option_b: {
    text: "Liegen lassen, ist ja nicht meiner.",
    points: -50,
    sets_flag: "left_litter"
  }
}
```

### 6.2 Draft Hotspot List (to be refined by Pascal)

**Stadtpark (Umwelt & Ressourcen)**

- *Morgen:* Kaffeebecher im Gras (pick up / leave) | Joggerin bittet um Hilfe beim Festbinden des Hundes (help / ignore)
- *Nachmittag:* Gemeinde-Clean-up in Gange (join / walk past) | Zigarettenstummel am Boden (pick up / drop own)
- *Abend:* Blumenbeet der Gemeinde giessen (water / trample) | Offener Wasserhahn am Brunnen (close / ignore)

**Gemeindeplatz (Zivile Verantwortung)**

- *Morgen:* Ältere Person mit schweren Einkaufstüten (help / ignore) | Blutspende-Bus vor Ort (donate / skip)
- *Nachmittag:* Vereinsstand sucht Freiwillige (sign up / mock them) | Kind hat sich verlaufen (help find parents / walk by)
- *Abend:* Nachbar braucht Hilfe beim Umzug (help / refuse rudely) | Streit zwischen zwei Personen schlichten (mediate / film with phone)

**Bankenviertel (Rechts & Gesellschaft)**

- *Morgen:* Parkuhr abgelaufen (pay up / park anyway) | Velo falsch abgestellt (move it / leave it blocking)
- *Nachmittag:* Wahlplakat / Abstimmungs-Kiosk (participate / deface) | Verlorene Geldbörse am Boden (return / pocket)
- *Abend:* Rot an der Fussgängerampel (wait / cross) | Social-Media-Post über die Gemeinde verfassen (constructive / hate speech)

**Total: 18 hotspots, 36 action variants.**

### 6.3 Branching Examples

Three categories of branching (as Pascal requested):

**A) Unlock:** doing something earlier reveals a new hotspot later.
- *Example:* If the player helps at the clean-up (park, nachmittag), the Abend scene in the park shows a *"Dankeskarte der Gemeinde abholen"* hotspot for +100 bonus.

**B) Modify:** same hotspot, different point value based on history.
- *Example:* "Social-Media-Post" in Bankenviertel Abend. If the player has already done 2+ pro-social acts, the constructive post gives +150 instead of +100 (the BGR "rewards consistency"). If the player has done 2+ antisocial acts, the hate-speech variant gives -150 instead of -100.

**C) Unaffected:** stays the same no matter what.
- *Example:* Blutspende-Bus always gives +100 regardless of context.

A mix of A, B, and C should exist in every phase.

---

## 7. UI & Screen Flow

### 7.1 Screens
1. **Intro:** short welcome card, rules, "Start" button.
2. **Overview map:** hand-drawn town, 3 clickable districts, current phase indicator, score bar at top.
3. **Location close-up:** hand-drawn scene, hotspots as subtle highlights (pulsing circles or hover-reveal), back arrow, left/right travel arrows.
4. **Action card:** modal overlay with scene narration, Option A and Option B buttons. Closes after selection.
5. **Phase transition:** brief text overlay (*"Der Morgen ist vorüber..."*), fades into next phase.
6. **End screen:** final score, tier, citizen title, action log, high-score table, replay button.

### 7.2 Visual Language
- Matches the Initiative website: red (#d8232a is the dominant red in your pitch), white, clean sans-serif.
- S+ logo appears in score notifications and the final screen.
- Hand-drawn scenes provide contrast and warmth.
- Surveillance camera icons appear as small motifs after every action (pulse once, fade). This is the only satirical visual cue.

### 7.3 Accessibility
- All hotspots keyboard-navigable (Tab + Enter).
- All text meets WCAG AA contrast on the chosen color palette.
- Alt text for all illustrations.
- Language: German (Hochdeutsch). Rationale: website is in Hochdeutsch. Swiss-German voice is reserved for small flavor touches if desired.

---

## 8. Technical Specification

### 8.1 File Structure
```
/testlauf/
  index.html
  style.css
  game.js
  data/
    hotspots.json        // all 18 hotspots with options, flags, positions
    messages.json        // intro, transitions, tier endings
  assets/
    map_morgen.png
    map_nachmittag.png
    map_abend.png
    park_morgen.png
    park_nachmittag.png
    park_abend.png
    gemeindeplatz_morgen.png
    ... (9 scene images + 3 map images = 12 total)
    icon_camera.svg
    icon_s_plus.svg
    icon_speaker.svg
    chime_positive.mp3
    chime_negative.mp3
    confetti.json        // lottie or simple css
```

### 8.2 Game State
```javascript
{
  score: 0,
  phase: "morgen",       // "morgen" | "nachmittag" | "abend"
  actionsRemaining: 2,
  currentLocation: "park" | "gemeindeplatz" | "bank" | null,
  flags: Set<string>,    // all flags set during play
  actionLog: [
    { phase, location, hotspotId, optionChosen, points, narrativeText }
  ],
  completedHotspotsThisPhase: Set<string>  // cleared on phase change
}
```

### 8.3 localStorage Schema
```javascript
// key: "sks_highscores"
[
  { score: 850, tier: "Exzellenz", date: "2026-04-22T14:32:00Z", title: "Musterbürger:in der Schweiz" },
  { score: -120, tier: "Basis", date: "..." },
  ...
]
// Keep top 10 sorted by absolute value (to encourage both extremes).
// Display as two columns on the end screen:
//   Left: "Unsere Musterbürger:innen" (positive scores, sorted descending)
//   Right: "Die hartnäckigsten Widerständler:innen" (negative scores, sorted ascending)
// key: "sks_sound_enabled"  (boolean, default true)
```

### 8.4 Behavioral Notes for Implementation
- No backend. No analytics. No cookies beyond localStorage for scores.
- Must work offline after first load.
- Total asset weight target: under 3 MB (important for mobile).
- All images should be optimized (WebP preferred, PNG fallback).

### 8.5 Integration with the Initiative Website
- Game lives at `/testlauf/` (or as an iframe embedded in the Testlauf page).
- End screen includes "Mehr erfahren" button linking back to the main Initiative page.
- Visual style uses the same red and typography as the rest of the site.

---

## 9. Content to Write / Produce

This is what needs to be created before the game is ready to ship. Pascal's responsibilities on the content side:

1. **Illustrations:** 3 overview maps + 9 location scenes = 12 hand-drawn images.
2. **Hotspot positions:** once scenes are drawn, annotate the (x, y) position of each hotspot.
3. **Narrative copy:** 18 hotspot labels + 36 option descriptions in German.
4. **Tier messages:** 5 end-screen messages (one per tier), propaganda-style.
5. **Phase transition copy:** short text for each phase boundary.
6. **Intro copy:** welcome card explaining the game rules in-world.

Claude Code's responsibilities on the engineering side:

1. Build the HTML/CSS/JS engine.
2. Implement hotspot rendering, action resolution, flag tracking, branching logic.
3. Build score display, BGR notification component, end screen, localStorage leaderboard.
4. Responsive layout (mobile + desktop).
5. Integrate with website styling.

---

## 10. Resolved Decisions

1. **Leaderboard:** Both extremes are rewarded, shown as two columns on the end screen. Tone is calibrated per side.
   - *Top pro-sozial column header:* "Unsere Musterbürger:innen"
   - *Top anti-sozial column header:* "Die hartnäckigsten Widerständler:innen"
   - When a new high is achieved on the anti-sozial side, the celebration message is cheeky rather than dystopian, e.g. *"Herzlichen Glückwunsch! Du hast dich wirklich angestrengt, komplett gegen die Gemeinschaft zu gehen, das war sicher anstrengend!"*
   - When a new high is achieved on the pro-sozial side, the message stays fully in-world propaganda voice.
2. **Sound:** Chimes on by default. A toggle (speaker icon, top-right corner) mutes all sound. Preference is stored in localStorage. Two chimes in total: a bright ascending chime for positive actions, a softer muted chime for negative actions. No voice lines.
3. **Language:** German only. No language toggle.
4. **Randomness:** None. Every hotspot is deterministic. This keeps the high-score chase fair and lets players strategize across runs.

---

*Ready to hand off to Claude Code once Section 6 copy is finalized and illustrations are available.*
