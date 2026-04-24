# Hotspot Catalogue Draft v2
## Helvetingen Testlauf

Rewrite based on feedback. Key changes:
- Hotspots can now be single-option (just a positive OR just a negative action). Skipping an action still costs an action slot, which is consequence enough.
- Some hotspots still have two options, but they can be two-of-the-same-direction (e.g. both positive at different magnitudes) or one-positive-one-negative where both make narrative sense.
- Removed: shower duration tracking (too creepy), running tap (not realistic in CH), "Abstimmungs-Kiosk" (doesn't exist in CH), daytime police (too much).
- Kept: evening police consequence, late-night pool entry, lost wallet, neighborhood party, social-media post (reworded).

---

## Legend

**Hotspot types:**
- **[Dual]** — two options, both meaningful (positive + negative, or two positives of different strength). Clicking commits you to one of the two.
- **[Positive-only]** — a single positive action. If you click, you do it and get points. If you don't want it, you simply don't click and pick a different hotspot. There is no "waste" — you always commit an action by clicking something, not by hovering.
- **[Negative-only]** — a single negative action, a temptation. Same logic as above: click to take it, or don't click and pick something else.

**Clicking rules:**
- An action is only "used" when the player commits to an option inside a hotspot's dialog. Browsing between hotspots is free.
- Once a hotspot is clicked and an option is chosen, that hotspot vanishes.
- Positive-only / Negative-only hotspots show a single button, not two.

**Branching type:**
- **U** = Unlock | **M** = Modify | **S** = Static

**Point scale:** ±50 / ±100 / ±200

---

# Location 1: Stadtpark + Badeanstalt
## Pillar: Umwelt & Ressourcen

---

### MORGEN

**H1 — Aludose im Gras [Dual] (S)**
An empty aluminum can lies in the grass near a bench. A recycling station is 20 metres away.
- **A:** "Die Dose aufheben und in den Aluminium-Container werfen." → **+50**, flag: `picked_up_can`
- **B:** "Ach, hat eh schon Müll hier. Meinen Becher stelle ich auch gleich dazu." → **-100**, flag: `added_to_litter`

*Rationale:* Pure ignore isn't an option here. Option B is an active choice to contribute to the mess.

---

**H2 — Verletzte:r Jogger:in am Wegrand [Positive-only] (U)**
A runner has stumbled and is sitting on the grass, holding their ankle.
- **A:** "Anhalten, fragen ob alles ok ist, Notfallnummer anbieten." → **+100**, flag: `helped_jogger`

*Unlock effect:* If `helped_jogger`, the runner reappears at the Badi in the evening as a lifeguard. Unlocks H6b (Späteinlass).

---

**H19 — Unverschlossenes E-Bike am Baum [Negative-only] (S)**
A nice e-bike is leaning against a tree with no lock. No one is around.
- **A:** "Wegfahren, das gehört jetzt dir." → **-200**, flag: `stole_bike`

---

### NACHMITTAG

**H3 — Gemeinde-Clean-up-Aktion [Positive-only] (U)**
A group of volunteers in S+ vests is cleaning up the area around the Badi.
- **A:** "Sich anschliessen und eine Stunde mithelfen." → **+200**, flag: `joined_cleanup`

*Unlock effect:* If `joined_cleanup`, the Nachbarschaftsfest (H17) gives a bonus in the evening.

---

**H4 — Badi-Eingang: zwei Szenen [Dual] (S)**
At the Badi entrance, you notice two things happening at once.
- **A:** "Einem Badegast ist das Handy aus der Tasche gefallen, du läufst hinterher." → **+100**, flag: `returned_phone`
- **B:** "In der Umkleide liegt ein unbeaufsichtigter Laptop. Niemand schaut." → **-200**, flag: `stole_laptop`

*Rationale:* Replaces the "duschen" hotspot. Now the Badi scene has a temptation moment (theft) and a good-deed moment (phone return) on the same image, as two separate clickable points.

---

### ABEND

**H5 — Blumenbeet der Gemeinde [Dual] (S)**
The community flower bed looks thirsty. A watering can sits nearby. A shortcut across the bed would save you 30 seconds.
- **A:** "Das Beet giessen." → **+100**, flag: `watered_flowers`
- **B:** "Abkürzung nehmen, durch das Beet laufen." → **-100**, flag: `trampled_flowers`

---

**H6 — Graffiti-Sprayer an der Badi-Mauer [Dual] (S)**
Someone is spraying graffiti on the back wall of the Badi. They haven't seen you yet. They've got a spare can in their bag.
- **A:** "Ansprechen, sagen dass das nicht okay ist, notfalls Gemeinde informieren." → **+150**, flag: `stopped_graffiti`
- **B:** "Die zweite Dose nehmen und mitsprayen." → **-150**, flag: `joined_graffiti`

---

**H6b — Späteinlass an der Badi [Dual] (U, only available if `helped_jogger`)**
The lifeguard you helped in the morning recognizes you and waves you in for a free swim after official closing time.
- **A:** "Dankend ablehnen, Regeln sind Regeln." → **+150**
- **B:** "Reingehen und heimlich schwimmen." → **-100**

*Note:* Both H6 and H6b can be available in the evening (two different scenes within the park). Player still only has two actions total in the evening across all locations.

---

# Location 2: Gemeindeplatz
## (mit Brunnen, Bank-Filiale, Bäckerei Fischer, kleinen Geschäften)
## Pillar: Rechts & Gesellschaft

---

### MORGEN

**H7 — Parkuhr abgelaufen [Dual] (U)**
Your parking ticket just expired. A Politesse is two cars away checking meters, she hasn't seen you yet but will in about a minute.
- **A:** "Ehrlich nachzahlen am Automaten." → **+50**, flag: `paid_parking`
- **B:** "Weggehen, hoffen dass sie's nicht merkt." → **-100**, flag: `skipped_parking`

*Unlock effect:* If `skipped_parking`, the Politesse got your face. H18 (Polizeikontrolle am Abend) appears in the Wohnquartier evening scene.

---

**H8 — Bäckerei Fischer: zu viel Wechselgeld [Dual] (S)**
The baker hands you 5 Franken too much in change.
- **A:** "Den Fehler melden und zurückgeben." → **+100**, flag: `honest_change`
- **B:** "Einstecken, sein Problem." → **-100**, flag: `kept_change`

---

### NACHMITTAG

**H9 — Velo falsch abgestellt [Positive-only] (S)**
A Velo is blocking the Rollstuhl-Rampe at the Gemeindehaus. The owner is nowhere in sight.
- **A:** "Das Velo kurz zur Seite schieben, Rampe freimachen." → **+100**, flag: `moved_bike`

---

**H10 — Verlorene Brieftasche am Brunnen [Dual] (M)**
A leather wallet lies on the edge of the fountain. Nobody around.
- **A:** "Zum Fundbüro der Gemeinde bringen." → **+150** (base) / **+200** (if `honest_change`)
- **B:** "Die ganze Brieftasche einstecken, mit allem Inhalt." → **-200** (base) / **-250** (if `kept_change`)

*Modify rationale:* BGR rewards (or punishes) consistency of honest / dishonest behavior.

---

**H20 — Gemüsekiste vor dem Bäcker [Negative-only] (S)**
The baker's supplier has left a crate of apples in front of the shop. The driver is inside delivering the rest.
- **A:** "Einen Apfel (oder zwei) einstecken und weitergehen." → **-100**, flag: `stole_produce`

---

### ABEND

**H11 — Streit vor dem Brunnen [Dual] (U)**
Two people are arguing loudly. Passers-by are filming with their phones.
- **A:** "Ruhig vermitteln, beide anhören." → **+150**, flag: `mediated_fight`
- **B:** "Auch dein Handy zücken und mitfilmen für Social Media." → **-100**, flag: `filmed_fight`

*Unlock effect:* If `mediated_fight`, the man you helped shows up at the Nachbarschaftsfest (H17) and thanks you warmly. Narrative bonus integrated into H17.

---

**H12 — Social-Media-Post über den Tag [Dual] (M)**
On a bench, you pull out your phone to post about your day in Helvetingen.
- **A:** "'Hey, ich habe heute was Schönes erlebt in der Gemeinde. Danke an alle netten Menschen!'" → **+100** (base) / **+150** (if 3+ positive flags)
- **B:** "Abfälliger Post über einen Mitbürger, den du heute gesehen hast." → **-100** (base) / **-150** (if 3+ negative flags)

*Reworded:* Option A now sounds like a normal person, not a campaign ad.

---

**H21 — Wahlplakat der Sozialkredit-Initiative [Negative-only] (S)**
A large campaign poster for the Sozialkredit-Initiative hangs at the tram stop. Your backpack has a pack of stickers in it.
- **A:** "Einen Sticker draufkleben, Plakat verunstalten." → **-150**, flag: `defaced_poster`

---

# Location 3: Ruhiges Wohnquartier
## Pillar: Zivile Verantwortung

---

### MORGEN

**H13 — Frau Gerber bei der Abfalltrennung [Positive-only] (S)**
The elderly neighbor is struggling with her recycling bins at the curb.
- **A:** "Ihr kurz helfen, Karton und PET separat einsortieren." → **+100**, flag: `helped_gerber`

---

**H14 — Kinder spielen Fussball auf der Strasse [Dual] (S)**
The ball rolls under your parked car.
- **A:** "Ball rausholen, zurückgeben, kurz mitspielen." → **+50**, flag: `played_with_kids`
- **B:** "'Spielt woanders!' rufen und weitergehen." → **-100**, flag: `yelled_at_kids`

---

### NACHMITTAG

**H15 — Paket für Nachbar:in annehmen [Dual] (M)**
The delivery driver asks if you can accept a package for Herr Keller across the street.
- **A:** "Annehmen und später rüberbringen." → **+100** (base) / **+150** (if `helped_gerber`)
- **B:** "'Nicht mein Paket' sagen und die Tür zumachen." → **-50**

---

**H16 — Katze im Baum [Positive-only] (U)**
A cat is stuck high up in a tree. The owner's car isn't in the driveway. A ladder is in your garage.
- **A:** "Leiter holen und die Katze retten." → **+150**, flag: `saved_cat`

*Unlock effect:* The cat's owner files a personal thank-you with the BGR. Mentioned on end screen, no extra points.

---

**H22 — Päckli vor fremder Haustür [Negative-only] (S)**
A parcel from Zalando sits in front of a neighbor's door. They're clearly not home. No one on the street.
- **A:** "Das Päckli mitnehmen." → **-150**, flag: `stole_parcel`

---

### ABEND

**H17 — Nachbarschaftsfest [Dual] (U, with modifiers)**
The neighbors are having a loud summer-evening street party. Music, Raclette, kids running around. It's louder than the Ruhezeit technically allows.
- **A:** "Kurz rübergehen, freundlich sagen dass es etwas laut ist. Ins Gespräch kommen, am Ende eingeladen werden." → **+150** (base) / **+250** (if `joined_cleanup`) / +bonus narrative (if `mediated_fight`: the man you helped thanks you here)
- **B:** "Direkt die Polizei rufen, Ruhestörung melden." → **-200**, flag: `called_police_on_party`

*Reworded:* Option A is now more realistic and nuanced: you initially approach with a mild complaint, but by being friendly you end up welcomed.

---

**H18 — Polizeikontrolle am Abend [Dual] (U, only available if `skipped_parking`)**
The Politesse from the morning has tracked you down. She's at your door.
- **A:** "Ehrlich sein, Busse akzeptieren." → **-50** (lesser punishment)
- **B:** "Lügen, behaupten es war jemand anders." → **-200**, flag: `lied_to_authority`

---

# Summary Table

| # | Location | Phase | Name | Options | Type |
|---|----------|-------|------|---------|------|
| H1 | Park | Morgen | Aludose im Gras | Dual | S |
| H2 | Park | Morgen | Verletzte:r Jogger:in | Positive-only | U |
| H19 | Park | Morgen | E-Bike unverschlossen | Negative-only | S |
| H3 | Park | Nachmittag | Clean-up-Aktion | Positive-only | U |
| H4 | Park | Nachmittag | Badi: Handy / Laptop | Dual (two separate hotspots on same image) | S |
| H5 | Park | Abend | Blumenbeet | Dual | S |
| H6 | Park | Abend | Graffiti-Sprayer an Badi-Mauer | Dual | S |
| H6b | Park | Abend | Späteinlass Badi (conditional) | Dual | U |
| H7 | Platz | Morgen | Parkuhr | Dual | U |
| H8 | Platz | Morgen | Bäckerei Wechselgeld | Dual | S |
| H9 | Platz | Nachmittag | Velo vor Rampe | Positive-only | S |
| H10 | Platz | Nachmittag | Brieftasche | Dual | M |
| H20 | Platz | Nachmittag | Gemüsekiste (Apfeldiebstahl) | Negative-only | S |
| H11 | Platz | Abend | Streit | Dual | U |
| H12 | Platz | Abend | Social-Media-Post | Dual | M |
| H21 | Platz | Abend | Wahlplakat verunstalten | Negative-only | S |
| H13 | Wohn | Morgen | Frau Gerber | Positive-only | S |
| H14 | Wohn | Morgen | Kinder-Fussball | Dual | S |
| H15 | Wohn | Nachmittag | Paket für Nachbar:in | Dual | M |
| H16 | Wohn | Nachmittag | Katze im Baum | Positive-only | U |
| H22 | Wohn | Nachmittag | Päckli vor fremder Haustür | Negative-only | S |
| H17 | Wohn | Abend | Nachbarschaftsfest | Dual | U (modifier) |
| H18 | Wohn | Abend | Polizeikontrolle (conditional) | Dual | U |

**Distribution:** 12 Dual, 6 Positive-only, 4 Negative-only. 11 Static, 8 Unlock, 3 Modify. **23 Hotspots total** across 9 scenes.

---

# Branching Map

**Unlock chains:**
- `helped_jogger` (H2) → unlocks H6b (Späteinlass) in Park Abend
- `joined_cleanup` (H3) → +100 bonus on H17 (Nachbarschaftsfest)
- `skipped_parking` (H7) → unlocks H18 (Polizeikontrolle) in Wohn Abend
- `mediated_fight` (H11) → narrative callback in H17
- `saved_cat` (H16) → end-screen narrative callback

**Modify patterns:**
- H10 (Brieftasche): modified by `honest_change` vs `kept_change`
- H12 (Social Media): modified by count of positive vs negative flags
- H15 (Paket): modified by `helped_gerber`

---

# Changes from v1

- **H1** Aludose (was Kaffeebecher). Option B reworded to be an active littering choice, not just ignoring.
- **H2** now Positive-only. No punishment for not helping.
- **H3** now Positive-only. Removed the "applaud and walk by" option.
- **H4** completely replaced. Was shower-tracking (too creepy), now a Badi scene with a phone-return (+) and a laptop-theft (-) as two separate hotspots on the same image.
- **H6** completely replaced. Was open tap (not Swiss), then Grill-Abfall (too similar to H1 morning), now Graffiti-Sprayer at the Badi wall as a Dual choice.
- **H6b** (Späteinlass) kept as-is, both H6 and H6b can be present in the same Abend scene.
- **H9** replaced. Was Abstimmungs-Kiosk (doesn't exist in CH), now "Velo blocking the ramp" as Positive-only.
- **H10** (Brieftasche): Option A now goes to the Fundbüro (not the Bank). Option B now takes the whole wallet (not just cash).
- **H12** (Social Media): Option A reworded to sound like a real person, not propaganda.
- **H17** (Nachbarschaftsfest): Option A reframed. Instead of "bring a cake," it's now "approach them about the noise and end up included."
- **H19, H20, H21, H22** added: four Negative-only "temptation" hotspots spread across locations and times (E-Bike klauen, Apfel stehlen, Wahlplakat verunstalten, Päckli klauen).
- **H7** (Parkuhr): Politesse is present in the scene (visible, about to notice you). This makes the H18 follow-up feel earned.
- Evening H18 (Polizeikontrolle) stays, with H7 as its clear setup.

---

# Open Questions for Pascal

1. **H4 (Badi: phone + laptop):** This is two hotspots on one illustration. Want to keep it that way, or split them into two totally separate scenes? My take: keep combined, it makes the scene visually richer.
2. **The social media post (H12):** Is Option B as "abfälliger Post über einen Mitbürger" specific enough, or should it be more concrete (e.g. a post mocking Frau Gerber by name)? My take: keep it general, player imagines it themselves.
3. **H17 (Nachbarschaftsfest) Option A:** I wrote "you go over with a mild complaint and end up included." Is that the vibe you want, or should Option A be more straightforwardly "just go join the party"? My take: the current framing is more interesting because it starts from a realistic impulse (it's too loud), and turns into connection.
4. **H21 (Wahlplakat verunstalten):** I made this poster specifically the Sozialkredit-Initiative poster, so defacing it becomes a small act of real resistance within the fiction. That's a nice meta-touch, but you could also make it a generic poster. My take: keep it as the Initiative poster, the irony is good.
5. **Negative-only point values:** H19 is -200 (e-bike), H20 is -100 (apple), H21 is -150 (sticker), H22 is -150 (parcel). Rough scaling by severity. Okay?
