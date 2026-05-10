
## Executive Summary

**Project Name:** Sekhemas Relic Planner
**Target Users:** PoE2 players running Trial of the Sekhemas for ascendancy points, farming uniques, or optimizing Honor-based progression
**Core Problem:** Players have 18 relic slots (5×4 grid with 2 blocked corners) and dozens of relics with different shapes (1×2, 2×1, 3×1, 1×3, 2×2, 4×1, 1×4) and competing modifiers, making optimal Tetris-style packing + stat maximization difficult[^1][^2]

**Solution:** Web app that allows drag-and-drop relic placement, auto-suggests optimal loadouts based on user goals (first clear, boss farming, loot maximization), and displays aggregated stats in real time[^3][^4]

***

## 1. Game Mechanics Foundation

### 1.1 Relic Altar Rules (PoE2-specific)

- **Grid:** 5 columns × 4 rows = 20 slots, minus 2 blocked corners = **18 available slots**[^1]
- **Slot unlock progression:** Additional slots unlock by defeating deeper Trial bosses (Rattlecage → Ashar → Zarokh)[^3]
- **Relic persistence:** Relics stay equipped between runs unless manually changed; cannot change during active Trial[^1]
- **Relic types:**
    - **Magic relics:** Can have up to 2 modifiers (cannot be rare)[^1]
    - **Unique relics:** Single-use, destroyed on Trial completion/failure; only 1 unique per run[^2][^1]


### 1.2 Relic Sizes and Modifier Tiers

| Size Class | Dimensions | Modifier Tier | Examples |
| :-- | :-- | :-- | :-- |
| Small | 2×1, 1×2 | Tier 1 | Seal, Urn [^1] |
| Medium | 3×1, 1×3 | Tier 2 | Tapestry, Amphora [^1] |
| Large | 2×2, 4×1, 1×4 | Tier 3 | Coffer, Incense, Vase [^1] |

### 1.3 Key Stat Categories (from modifier lists)

Based on community data sources, relic mods fall into:

- **Honor stats:** Max Honor, Honor resistance, Honor regen
- **Boon/Affliction:** Boon effect %, affliction effect reduction
- **Rewards:** Currency quantity, unique item drop chance, room reward bonuses
- **Boss modifiers:** Specific boss damage/defense changes
- **Trial modifiers:** Room vision, trial difficulty scaling

***

## 2. Core Features Specification

### 2.1 Relic Inventory Management

**User Story:** As a player, I want to track which relics I own so I can plan loadouts without switching to the game.

**Features:**

- Add relics to personal inventory (name, size, mods)
- Mark relics as "equipped" vs "in locker"
- Filter by size, mod type, or custom tags
- Import/export inventory as JSON for backup

**Data needed per relic:**

```json
{
  "id": "uuid",
  "name": "Seal Relic #1",
  "base_type": "Seal Relic",
  "size": {"width": 2, "height": 1},
  "rarity": "magic",
  "mods": [
    {"stat": "honor_resistance", "value": 15, "type": "percentage"},
    {"stat": "boon_effect", "value": 10, "type": "percentage"}
  ],
  "status": "available" // or "equipped"
}
```


### 2.2 Altar Grid Packer (Interactive Tetris)

**User Story:** As a player, I want to drag relics onto the 5×4 grid to see if they fit and what stats I get.

**Features:**

- Visual 5×4 grid with 2 blocked corners (configurable for unlock progress)
- Drag-and-drop relics from inventory sidebar
- Rotation toggle (90° rotations for rectangular relics)
- Collision detection + snap-to-grid
- "Clear altar" and "Save loadout" buttons
- Real-time stat aggregation panel

**UI Components:**

- Grid canvas (SVG or HTML grid)
- Relic cards (show name, size, mods as tooltip)
- Stats summary panel (right sidebar)


### 2.3 Goal-Based Auto-Optimizer

**User Story:** As a player preparing for my first Zarokh kill, I want the app to suggest which relics to equip for maximum survival.

**Goal Presets:**


| Goal | Priority Weights | Notes |
| :-- | :-- | :-- |
| First Clear | Honor resistance (3×), max Honor (2×), boon effect (1×) | Defensive focus [^5][^6] |
| Zarokh Farm (Temporalis) | Must include "The Last Flame" unique; otherwise loot bonuses [^3][^7] |  |
| Speed Run | Room reward %, movement speed if available | Minimize time per run |
| Currency Farm | Currency quantity, reward chest mods | For Barya/orb farming |

**Algorithm (simplified knapsack):**

1. User selects goal preset
2. App filters available relics by compatibility (e.g., exclude uniques if already using one)
3. Greedy placement: sort relics by weighted score, place largest high-value relics first
4. Backtrack if placement fails, try next best
5. Output suggested grid + total stats

**Advanced (optional v2):** Genetic algorithm or constraint satisfaction for true optimization.

### 2.4 Stat Aggregation \& Breakdown

**User Story:** As a player, I want to see my total Honor resistance and other key stats at a glance.

**Display Categories:**

- **Survival:** Max Honor, Honor resistance %, Honor regen
- **Offense:** Damage mods (rare on relics, but some exist)
- **Rewards:** Currency quantity %, boss-specific drop bonuses
- **Trial Modifiers:** Map vision, boon/affliction effects

**Format:**

```
=== Equipped Relics Stats ===
Max Honor: +50 (from 3 relics)
Honor Resistance: +40% (from 4 relics)
Boon Effect: +25%
Currency Quantity: +30%
---
Unique Relic: The Last Flame
 - Zarokh drops Temporalis
 - Max Honor is 1 (overrides above)
 - Damage taken cannot be Absorbed
```


### 2.5 Loadout Sharing \& Import

**User Story:** As a streamer, I want to share my Zarokh farm loadout with viewers.

**Features:**

- Export loadout as URL query string or short code
- Import via paste or link
- Community loadout gallery (optional backend feature)

***

## 3. Data Architecture

### 3.1 Relic Master Database Schema

**Source:** Scrape from poe2wiki.net and poe2db.tw[^2][^1]

**JSON Structure:**

```json
{
  "relics": {
    "base_types": [
      {
        "name": "Seal Relic",
        "size": {"width": 2, "height": 1},
        "tier": "small",
        "drop_level": 1
      },
      // ... all 7 base types
    ],
    "unique_relics": [
      {
        "name": "The Last Flame",
        "base": "Incense Relic",
        "size": {"width": 4, "height": 1},
        "required_level": 64,
        "effects": [
          {"text": "Zarokh, the Temporal drops Temporalis"},
          {"stat": "max_honor", "value": 1, "override": true},
          {"text": "Damage taken cannot be Absorbed"},
          {"text": "Cannot be used with Trials below level 80"}
        ],
        "destroyed_on_use": true,
        "source": "Zarokh, the Temporal"
      }
      // ... 5 other uniques from attached files
    ],
    "modifier_pool": {
      "small": [
        {"id": "honor_res_small", "text": "+(10-15)% to Honour Resistance", "stat": "honor_resistance", "min": 10, "max": 15},
        // ... other small mods
      ],
      "medium": [ /* ... */ ],
      "large": [ /* ... */ ]
    }
  }
}
```

**Maintenance Plan:**

- Scrape wiki/poe2db on patch days
- Version data files by patch (e.g., `relics_0.4.0.json`)
- Allow user-submitted corrections via GitHub issues or form


### 3.2 User Data Schema (Client-Side Storage)

**localStorage structure:**

```json
{
  "user_inventory": [
    /* array of user's relics */
  ],
  "saved_loadouts": [
    {
      "name": "Zarokh Temporalis Farm",
      "grid": [
        {"relic_id": "uuid", "x": 0, "y": 0, "rotation": 0},
        // ... positioned relics
      ],
      "notes": "Use with 75% chaos res build"
    }
  ],
  "settings": {
    "unlocked_slots": 18,
    "default_goal": "first_clear"
  }
}
```


***

## 4. Technical Stack Recommendations

### 4.1 Frontend

| Component | Technology | Rationale |
| :-- | :-- | :-- |
| Framework | **React** or Svelte | Component reusability, drag-and-drop libraries |
| Drag-Drop | `react-dnd` or `@dnd-kit/core` | Mature, handles grid snapping |
| Grid Rendering | CSS Grid or SVG | CSS Grid simpler; SVG better for visual polish |
| State Management | Zustand or React Context | Lightweight, sufficient for client-only app |
| Styling | TailwindCSS + custom game theme | Rapid prototyping, PoE-style dark theme |

### 4.2 Backend (Optional Phase 2)

| Feature | Technology |
| :-- | :-- |
| API | Node.js (Express) or Python (FastAPI) |
| Database | PostgreSQL (relational) or MongoDB (flexible schema) |
| Auth | NextAuth.js or Supabase for user accounts |
| Hosting | Vercel (frontend) + Railway/Render (backend) |

**Phase 1:** Static site, no backend (all data client-side)
**Phase 2:** Add user accounts, loadout sharing, analytics

### 4.3 Data Sourcing Pipeline

1. **Manual scrape** (one-time):
    - Parse poe2wiki.net tables into JSON[^1]
    - Cross-reference poe2db.tw for missing mods[^2]
2. **Automated updates** (post-launch):
    - Python script with BeautifulSoup to scrape on patch days
    - Diff checker to flag changes
    - Manual review before merging

***

## 5. UI/UX Design Specifications

### 5.1 Layout (Desktop-First)

```
+--------------------------------------------------+
| Header: Sekhemas Relic Planner | Patch 0.4.0    |
+--------------------------------------------------+
| [Inventory]       | [Altar Grid]   | [Stats]    |
|                   |                |            |
| Filter: [____]    |  5x4 grid      | Total:     |
| □ Small           |  (visual)      | Honor Res: |
| □ Medium          |                | +40%       |
| □ Large           |  [Clear]       |            |
|                   |  [Optimize]    | Unique:    |
| Relic Cards:      |                | The Last   |
| [Seal #1]         |                | Flame      |
| [Urn #2]          |                |            |
| ...               |                | [Export]   |
+--------------------------------------------------+
| Footer: Data from poe2wiki.net | GitHub         |
+--------------------------------------------------+
```


### 5.2 Key Interactions

- **Drag relic from inventory → grid:** Visual feedback (green = fits, red = collision)
- **Right-click relic on grid:** Rotate 90° or remove
- **Click "Optimize":** Modal dialog for goal selection → auto-fill grid
- **Hover stat in summary:** Tooltip shows contributing relics


### 5.3 Visual Theme

- **Colors:** Dark brown/gold (Maraketh aesthetic), red for Honor, gold for rewards
- **Fonts:** PoE-inspired serif for headers, sans-serif for stats
- **Icons:** Use relic base type icons if available from datamined assets

***

## 6. Development Roadmap

### Phase 1: MVP (4-6 weeks)

**Goal:** Functional altar planner with static relic database


| Week | Tasks |
| :-- | :-- |
| 1-2 | Data scraping: build `relics.json` from wiki sources; validate all 7 base types + 5 uniques |
| 3 | Core UI: grid component, drag-drop, collision detection |
| 4 | Inventory management: add/remove relics, filter |
| 5 | Stat aggregation: parse mods, calculate totals |
| 6 | Polish: responsive design, export/import loadouts |

**Deliverable:** Static site hosted on Vercel, shareable via URL

### Phase 2: Optimizer \& Community (6-8 weeks)

**Goal:** Goal-based auto-optimizer and loadout sharing


| Week | Tasks |
| :-- | :-- |
| 7-8 | Implement greedy knapsack optimizer for presets |
| 9 | Backend setup: user accounts, loadout gallery |
| 10-12 | Community features: upvote loadouts, comments |
| 13-14 | Analytics: track popular relics, win rates if API available |

**Deliverable:** Full-featured app with social features

### Phase 3: Advanced Tools (Future)

- **Build integration:** Link PoE2 character via API (if GGG provides), auto-suggest relics based on class/defenses
- **Trial simulator:** Estimate clear chance based on loadout + player stats
- **Relic market tracker:** Track trade prices for valuable relics

***

## 7. Data Sourcing Details

### 7.1 Confirmed Data from Attachments

**Unique Relics (5 active):**[^2][^1]

1. **The Last Flame** (Incense, 4×1): Zarokh drops Temporalis; Max Honor = 1; no absorption
2. **The Peacemaker's Draught** (Amphora, 1×3): Zarokh drops +1 Barya; defenses = 0
3. **The Desperate Alliance** (Vase, 1×4): Zarokh drops Against the Darkness; boss +100% dmg, +75% less dmg taken
4. **The Changing Seasons** (Seal, 2×1): Zarokh drops Sandstorm Visage; cannot restore Honor
5. **The Burden of Leadership** (Tapestry, 3×1): Zarokh drops Sekhema's Resolve; rooms unknown on map

**Drop-disabled:** The Remembered Tales (Coffer, 2×2) — exclude from optimizer

### 7.2 Missing Data to Acquire

- **Full magic modifier lists** for small/medium/large tiers (linked in wiki but need parsing)
- **Mod weights** for crafting simulation (optional feature)
- **Relic icons/sprites** (extract from game files or use placeholder SVGs)


### 7.3 Scraping Script Pseudocode

```python
import requests
from bs4 import BeautifulSoup

def scrape_unique_relics():
    url = "https://www.poe2wiki.net/wiki/Relic"
    html = requests.get(url).text
    soup = BeautifulSoup(html, 'html.parser')

    table = soup.find('table', class_='wikitable')  # Adjust selector
    relics = []
    for row in table.find_all('tr')[1:]:  # Skip header
        cols = row.find_all('td')
        relic = {
            'name': cols[^0].text.strip(),
            'base': cols[^1].text.strip(),
            'stats': parse_stats(cols[^2].text)
        }
        relics.append(relic)
    return relics

def parse_stats(stat_text):
    # Regex to extract stat values
    # Return structured list
    pass
```


***

## 8. Success Metrics

### 8.1 Launch Goals (3 months post-launch)

- **Users:** 5,000 unique visitors
- **Loadouts created:** 10,000+
- **Community engagement:** 50+ shared loadouts with >10 upvotes each


### 8.2 Quality Metrics

- **Data accuracy:** <5% error rate on relic stats vs. in-game (tracked via user reports)
- **UX:** <3 clicks to create and export a basic loadout
- **Performance:** Grid rendering <100ms on mid-range devices

***

## 9. Risk Mitigation

| Risk | Impact | Mitigation |
| :-- | :-- | :-- |
| GGG changes relic mechanics in patch | High | Version data files; show patch selector; community alerts |
| Wiki data inconsistent/outdated | Medium | Cross-reference multiple sources; user correction system |
| Low adoption (niche audience) | Medium | Market via PoE2 subreddit, streamers; integrate with other PoE2 tools |
| Legal (using PoE2 IP) | Low | Non-commercial, credit GGG, use fan-site disclaimer |


***

## 10. Legal \& Attribution

**Disclaimer:**
> This is an unofficial fan-made tool for Path of Exile 2. Path of Exile and all related content are trademarks of Grinding Gear Games. Data sourced from poe2wiki.net and poe2db.tw under community fair-use principles.

**Open Source:**

- License: MIT (allows forks and contributions)
- Repo: GitHub with issue tracker for bug reports and mod additions

***

## Appendix A: Example Loadout (The Last Flame Farm)

**Goal:** Farm Temporalis from Zarokh[^7][^3]

**Grid:**

```
[The Last Flame - 4×1 horizontal, top row]
[Seal #1: +15% Honor Res] [Urn #2: +10 Max Honor]
[Tapestry #3: +20% Currency Quantity - 3×1 horizontal]
[Vase #4: +25% Boon Effect - 1×4 vertical, right edge]
```

**Stats:**

- Max Honor: 1 (overridden by unique)
- Honor Resistance: +15% (still useful for 1-honor gameplay)
- Boon Effect: +25%
- Currency Quantity: +20%
- Special: Zarokh drops Temporalis (unique helmet, chase item)

**Notes:** This loadout is extremely fragile (1 Honor = instant death); requires mastery of Zarokh mechanics and high chaos resistance[^8][^3]

***

**End of Document**

This project is viable, fills a real need for PoE2 Trial runners, and aligns with the PoE2-only specialist scope since it directly serves game optimization. Recommend starting with Phase 1 MVP and gathering user feedback before backend investment.
<span style="display:none">[^9]</span>

<div align="center">⁂</div>

[^1]: https://www.poe2wiki.net/wiki/Relic
https://www.poe2wiki.net/wiki/List_of_modifiers_for_small_relics
https://www.poe2wiki.net/wiki/List_of_modifiers_for_medium_relics
https://www.poe2wiki.net/wiki/List_of_modifiers_for_large_relics

[^2]: https://poe2db.tw/us/Relics
https://poe2db.tw/us/Relics#ModifiersCalc

[^3]: https://skycoach.gg/blog/path-of-exile-2/articles/trials-of-sekhema-guide

[^4]: https://www.youtube.com/watch?v=XgsWeZ3cYMM

[^5]: https://www.reddit.com/r/PathOfExile2/comments/1hke4vg/tips_for_trial_of_sekhemas/

[^6]: https://www.reddit.com/r/pathofexile2builds/comments/1poql3u/how_to_clear_trial_of_sekhema_easily_for/

[^7]: https://steamcommunity.com/app/2694490/discussions/0/598517805390796413/

[^8]: https://mobalytics.gg/poe-2/guides/zarokh

[^9]: Pasted-image-20260120111918.jpg
