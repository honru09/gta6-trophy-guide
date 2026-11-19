/**
 * Leonida Trophy Guide — GTA VI (PlayStation 5)
 * Vanilla ES Module: Offline Guide & Progress Tracker
 * No external dependencies, system fonts only, no emojis in UI.
 */

// Application State
const STATE = {
  trophies: [],
  earnedIds: new Set(),
  expandedIds: new Set(),
  activeTab: 'checklist',
  filters: {
    search: '',
    kind: 'all',
    grade: 'all',
    earnedOnly: false,
    hideEarned: false,
    hideSpoilers: true
  }
};

const STORAGE_KEY = 'gta6-trophy-guide-progress-v1';

// Roadmap 5-Phase Curriculum
const ROADMAP_PHASES = [
  {
    number: 1,
    title: 'Story Playthrough & Campaign Milestones',
    trophyIds: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    bullets: [
      'Complete the full multi-chapter narrative journey following Lucia and Jason across the crime corridors of Leonida.',
      'Every campaign mission can be replayed from the game pause menu at any time, meaning story milestones are never permanently missed.',
      'Enjoy your initial playthrough without worrying about gold medal timing or combat constraints; replay options allow clean retries later.',
      'Observe open-world landmarks, gang territories, and side encounters as you travel between story chapters to streamline later phases.'
    ]
  },
  {
    number: 2,
    title: 'Strangers, Freaks & Side Mission Strands',
    trophyIds: [22, 23, 24, 25, 26, 27],
    bullets: [
      'Track down and finish all side mission strands for recurring Leonida eccentrics including Andy, Kenton, Billy, Randy, and Tyrone.',
      'Complete at least 8 complete stranger storylines throughout the state to unlock the silver Strangers & Freaks trophy.',
      'Finishing stranger requests grants essential money laundering contacts, specialized weapons, and safehouse access across the map.'
    ]
  },
  {
    number: 3,
    title: 'Collectibles, Exploration & Real Estate',
    trophyIds: [28, 30, 31, 35, 42, 54],
    bullets: [
      'Uncover the map fog covering Vice City, Port Gellhorn, the Florida Keys equivalents, and the swamplands to discover all of Leonida.',
      'Assemble 3 complete Collectible Card decks and check in at all 100 WAiNK social spots scattered across the state.',
      'Visit every quiet meditation retreat and purchase all available garage properties to store your 100 cataloged vehicles.'
    ]
  },
  {
    number: 4,
    title: 'Activities, Mini-Games & Skill Challenges',
    trophyIds: [15, 16, 17, 18, 19, 20, 21, 29, 32, 46, 55],
    bullets: [
      'Try out each distinct recreational activity once across Leonida to claim Master of None, from bowling to arcade cabinets.',
      'Earn gold medals in all Shooting Range challenges and dominate Top Fun drone competitions at every track.',
      'Win 20 street and off-road race events, catalog 10 vehicles on the Scooter Bros app, and complete 250 stunt jumps.',
      'Pay close attention to Cal\'s fishing contest and Bret\'s unique animal hunt early in free-roam before narrative locks trigger.'
    ]
  },
  {
    number: 5,
    title: 'Heists, Combat Feats & 100% Platinum Cleanup',
    trophyIds: [1, 14, 33, 34, 36, 37, 38, 39, 40, 41, 43, 44, 45, 47, 48, 49, 50, 51, 52, 53],
    bullets: [
      'Execute high-stakes criminal jobs: raid 5 bank vaults, hijack armored trucks, stealth-rob a jewelry store, and raid all 9 gang operations.',
      'Launder $250,000 in marked bills through your underground connections and spend $100,000 at retail shops.',
      'Satisfy every comprehensive checklist requirement to achieve true 100% Completion for A Long Road.',
      'Unlock Vice Got a Price! and claim your platinum title as a true Leonida Legend.'
    ]
  }
];

// Specific guidance for the 14 missable trophies
const MISSABLE_ADVICE = {
  20: 'Attempt during early free-roam near Cal\'s fishing pier. Save before accepting the contest so you can reload if you lose.',
  29: 'Attempt as soon as Bret\'s hunting stranger quest unlocks. Create a manual save prior to approaching the zone to prevent spooking the animal.',
  33: 'Attempt during Chapter 2 or 3 while dual free-roam with your partner is unrestricted before narrative events split you up.',
  34: 'Attempt alongside Hot Together in early free-roam. Map out 3 closely clustered convenience stores in Vice City for a quick escape.',
  36: 'Attempt during early cartel shootouts or police road barricades where enemies bunch together, before hostile strongholds are cleared.',
  37: 'Attempt during mid-game free-roam by commandeering an aircraft and making an immediate unscheduled takeoff through VCIA airspace.',
  39: 'Attempt at night at a designated jewelry outlet. Manual save beforehand so any tripped alarm can be quickly undone by reloading.',
  41: 'Attempt immediately upon spotting an Armored Truck convoy blip on the mini-map, utilizing explosives for rapid breach and escape.',
  43: 'Attempt prior to completing late Chapter 3 story missions, ensuring operations belonging to all 9 rival gangs remain active.',
  45: 'Attempt early upon discovering the downtown luxury vehicle dealership. Drive through the showroom glass on your very first visit.',
  46: 'Attempt during Chapters 2 through 3 when companion social outings at Kolt & Associates bowling alley are readily available.',
  49: 'Attempt at any wager or mini-game in early free-roam. Intentionally fail your first try, then immediately triumph on your second.',
  50: 'Attempt during late-night storm weather in the Leonida swamplands when strange atmospheric lights and events manifest.',
  51: 'Attempt on crowded pedestrian sidewalks using a motorcycle and melee weapon before intense police heat converges.'
};

/**
 * Escape HTML special characters
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Load progress from localStorage
 */
function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        STATE.earnedIds = new Set(parsed.map(Number));
      } else if (parsed && Array.isArray(parsed.earned)) {
        STATE.earnedIds = new Set(parsed.earned.map(Number));
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored trophy progress:', err);
  }
}

/**
 * Persist progress to localStorage
 */
function saveProgress() {
  try {
    const arr = Array.from(STATE.earnedIds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch (err) {
    console.warn('Failed to save progress to localStorage:', err);
  }
  updateHeaderProgress();
}

/**
 * Update the header progress bar, percentage, and per-grade tallies
 */
function updateHeaderProgress() {
  const total = STATE.trophies.length || 55;
  const earned = STATE.earnedIds.size;
  const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;

  // Header counts
  const countEl = document.getElementById('header-progress-count');
  const percentEl = document.getElementById('header-progress-percent');
  const barEl = document.getElementById('header-progress-bar');

  if (countEl) countEl.textContent = `${earned} of ${total} Earned`;
  if (percentEl) percentEl.textContent = `${percentage}%`;
  if (barEl) barEl.style.width = `${percentage}%`;

  // Grade breakdown counts
  let platEarned = 0, platTotal = 1;
  let goldEarned = 0, goldTotal = 2;
  let silverEarned = 0, silverTotal = 6;
  let bronzeEarned = 0, bronzeTotal = 46;

  STATE.trophies.forEach(t => {
    const isEarned = STATE.earnedIds.has(t.id);
    if (t.grade === 'platinum') {
      if (isEarned) platEarned++;
    } else if (t.grade === 'gold') {
      if (isEarned) goldEarned++;
    } else if (t.grade === 'silver') {
      if (isEarned) silverEarned++;
    } else if (t.grade === 'bronze') {
      if (isEarned) bronzeEarned++;
    }
  });

  const platEl = document.getElementById('header-platinum-count');
  const goldEl = document.getElementById('header-gold-count');
  const silverEl = document.getElementById('header-silver-count');
  const bronzeEl = document.getElementById('header-bronze-count');

  if (platEl) platEl.textContent = `${platEarned} / ${platTotal}`;
  if (goldEl) goldEl.textContent = `${goldEarned} / ${goldTotal}`;
  if (silverEl) silverEl.textContent = `${silverEarned} / ${silverTotal}`;
  if (bronzeEl) bronzeEl.textContent = `${bronzeEarned} / ${bronzeTotal}`;
}

/**
 * Load trophies.json from within app
 */
async function loadTrophiesData() {
  const url = new URL('./data/trophies.json', import.meta.url).href;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch trophies.json: ${response.status}`);
  }
  const data = await response.json();
  STATE.trophies = Array.isArray(data.trophies) ? data.trophies : (Array.isArray(data) ? data : []);
}

/**
 * Read URL Search Params and Hash for deep linking and view switching
 */
function readUrlParams() {
  const params = new URLSearchParams(window.location.search);

  // Check if hash contains query string as well (e.g. #/checklist?open=1)
  let hash = window.location.hash || '#/checklist';
  if (hash.includes('?')) {
    const [h, query] = hash.split('?');
    hash = h;
    const hashParams = new URLSearchParams(query);
    for (const [k, v] of hashParams.entries()) {
      if (!params.has(k)) params.set(k, v);
    }
  }

  // Spoiler parameter: ?spoiler=off turns off spoiler hiding
  if (params.get('spoiler') === 'off') {
    STATE.filters.hideSpoilers = false;
    const spoilerChk = document.getElementById('filter-hide-spoilers');
    if (spoilerChk) spoilerChk.checked = false;
  }

  // Open parameter: ?open=<id> expands that trophy card on load
  const openParam = params.get('open');
  if (openParam) {
    const idNum = Number(openParam);
    if (!isNaN(idNum)) {
      STATE.expandedIds.add(idNum);
    }
  }

  // View parameter: ?view=roadmap or ?view=missables or #/roadmap or #/missables
  const viewParam = params.get('view');
  if (viewParam === 'roadmap' || hash === '#/roadmap') {
    STATE.activeTab = 'roadmap';
  } else if (viewParam === 'missables' || hash === '#/missables') {
    STATE.activeTab = 'missables';
  } else {
    STATE.activeTab = 'checklist';
  }
}

/**
 * Filter trophies for Checklist tab
 */
function getFilteredTrophies() {
  const q = STATE.filters.search.toLowerCase().trim();
  const kindFilter = STATE.filters.kind;
  const gradeFilter = STATE.filters.grade;
  const earnedOnly = STATE.filters.earnedOnly;
  const hideEarned = STATE.filters.hideEarned;

  // Online kind filter: GTA VI has 0 online trophies as published
  if (kindFilter === 'online') {
    return [];
  }

  return STATE.trophies.filter(t => {
    // Search query matches name or description
    if (q) {
      const matchName = t.name && t.name.toLowerCase().includes(q);
      const matchDesc = t.description && t.description.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }

    // Kind dropdown
    if (kindFilter === 'missable') {
      if (!t.missable) return false;
    } else if (kindFilter !== 'all') {
      if (t.kind !== kindFilter) return false;
    }

    // Grade dropdown
    if (gradeFilter !== 'all') {
      if (t.grade !== gradeFilter) return false;
    }

    // Earned status
    const isEarned = STATE.earnedIds.has(t.id);
    if (earnedOnly && !isEarned) return false;
    if (hideEarned && isEarned) return false;

    return true;
  });
}

/**
 * Render the Checklist tab
 */
function renderChecklist() {
  const container = document.getElementById('trophy-list');
  const emptyBox = document.getElementById('checklist-empty');
  const emptyHeading = document.getElementById('empty-state-heading');
  const emptyDesc = document.getElementById('empty-state-desc');

  if (!container) return;

  // Handle Online filter empty state requirement
  if (STATE.filters.kind === 'online') {
    container.innerHTML = '';
    if (emptyBox) {
      emptyBox.hidden = false;
      emptyHeading.textContent = 'No Online Trophies';
      emptyDesc.textContent = 'No trophy in the official list is online-only as published. Grand Theft Auto VI\'s PlayStation 5 trophy set is 100% playable in single-player offline mode across the state of Leonida.';
    }
    return;
  }

  const trophies = getFilteredTrophies();

  if (trophies.length === 0) {
    container.innerHTML = '';
    if (emptyBox) {
      emptyBox.hidden = false;
      emptyHeading.textContent = 'No Trophies Found';
      emptyDesc.textContent = 'No trophies match your current filters. Try adjusting your search query, selecting different grade/kind options, or clearing the earned filter.';
    }
    return;
  }

  if (emptyBox) {
    emptyBox.hidden = true;
  }

  // Render cards
  const cardsHtml = trophies.map(t => {
    const isEarned = STATE.earnedIds.has(t.id);
    const isExpanded = STATE.expandedIds.has(t.id);

    // Spoiler logic
    const isStorySpoiler = STATE.filters.hideSpoilers && t.kind === 'story' && !isEarned;
    const displayName = isStorySpoiler ? 'Hidden story trophy' : t.name;
    const displayDesc = isStorySpoiler
      ? 'Hidden until earned — turn off spoiler hiding to reveal.'
      : t.description;

    // Guide text logic
    let displayGuide = '';
    let isGuidePlaceholder = false;
    if (isStorySpoiler) {
      displayGuide = 'Hidden until earned — turn off spoiler hiding to reveal.';
    } else if (t.guide && t.guide.trim()) {
      displayGuide = t.guide;
    } else {
      displayGuide = 'Guide in progress — check back.';
      isGuidePlaceholder = true;
    }

    // Sources logic: when empty show nothing
    let sourcesHtml = '';
    if (!isStorySpoiler && Array.isArray(t.sources) && t.sources.length > 0) {
      sourcesHtml = `
        <div class="card-sources">
          <span class="sources-label">Sources:</span>
          <ul class="sources-list">
            ${t.sources.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // Missable note inside card
    let missableWarningHtml = '';
    if (t.missable && t.missable_note && !isStorySpoiler) {
      missableWarningHtml = `
        <div class="card-missable-warning">
          <span class="missable-warning-title">Missable Warning</span>
          <p class="missable-warning-text">${escapeHtml(t.missable_note)}</p>
        </div>
      `;
    }

    return `
      <article
        class="trophy-card ${isEarned ? 'is-earned' : ''} ${isExpanded ? 'is-expanded' : ''}"
        id="trophy-card-${t.id}"
        data-id="${t.id}"
        role="region"
        aria-label="${escapeHtml(displayName)}"
      >
        <div class="card-header">
          <div class="card-badges">
            <span class="badge badge-${escapeHtml(t.grade)}">${escapeHtml(t.grade)}</span>
            <span class="badge badge-kind">${escapeHtml(t.kind)}</span>
            ${t.missable ? '<span class="badge badge-missable">MISSABLE</span>' : ''}
          </div>

          <label class="card-toggle-earned" title="Toggle earned status" onclick="event.stopPropagation()">
            <input
              type="checkbox"
              class="trophy-earned-checkbox"
              data-id="${t.id}"
              ${isEarned ? 'checked' : ''}
              aria-label="Mark ${escapeHtml(displayName)} as earned"
            >
            <span>Earned</span>
          </label>
        </div>

        <div class="card-body">
          <div class="card-title-row">
            <h3 class="card-name">${escapeHtml(displayName)}</h3>
            <span class="card-id-label">#${t.id}</span>
          </div>
          <p class="card-description">${escapeHtml(displayDesc)}</p>
        </div>

        <div class="card-expand-hint" aria-hidden="true">
          <span>${isExpanded ? 'Hide Guide' : 'View Guide & Details'}</span>
          <span class="chevron-icon"></span>
        </div>

        ${isExpanded ? `
          <div class="card-guide-drawer" id="guide-drawer-${t.id}">
            <h4 class="guide-heading">Guide &amp; Strategy</h4>
            <p class="guide-text ${isGuidePlaceholder ? 'is-placeholder' : ''}">
              ${escapeHtml(displayGuide)}
            </p>
            ${missableWarningHtml}
            ${sourcesHtml}
          </div>
        ` : ''}
      </article>
    `;
  }).join('');

  container.innerHTML = cardsHtml;
}

/**
 * Render the Roadmap tab
 */
function renderRoadmap() {
  const container = document.getElementById('roadmap-phases');
  if (!container) return;

  const phasesHtml = ROADMAP_PHASES.map(phase => {
    const bulletsHtml = phase.bullets.map(b => `<li class="phase-bullet-item">${escapeHtml(b)}</li>`).join('');

    const chipsHtml = phase.trophyIds.map(id => {
      const trophy = STATE.trophies.find(x => x.id === id);
      const isEarned = STATE.earnedIds.has(id);
      const name = trophy ? trophy.name : `Trophy ${id}`;
      const grade = trophy ? trophy.grade : 'bronze';

      return `
        <a
          href="#/checklist"
          class="trophy-chip ${isEarned ? 'chip-earned' : ''}"
          data-jump-id="${id}"
          title="Jump to #${id} ${escapeHtml(name)} in Checklist"
        >
          <span class="badge badge-${escapeHtml(grade)}" style="padding: 1px 5px; font-size: 0.68rem;">${escapeHtml(grade)}</span>
          <span>#${id} ${escapeHtml(name)}</span>
        </a>
      `;
    }).join('');

    return `
      <section class="roadmap-phase-card" aria-label="Phase ${phase.number}: ${escapeHtml(phase.title)}">
        <div class="phase-header">
          <span class="phase-pill">Phase ${phase.number}</span>
          <h3 class="phase-title">${escapeHtml(phase.title)}</h3>
        </div>

        <ul class="phase-bullets">
          ${bulletsHtml}
        </ul>

        <div class="phase-trophies-block">
          <span class="phase-trophies-title">Phase Trophies (${phase.trophyIds.length})</span>
          <div class="phase-trophies-chips">
            ${chipsHtml}
          </div>
        </div>
      </section>
    `;
  }).join('');

  container.innerHTML = phasesHtml;
}

/**
 * Render the Missables tab
 */
function renderMissables() {
  const container = document.getElementById('missables-list');
  if (!container) return;

  const missableTrophies = STATE.trophies.filter(t => t.missable);

  const itemsHtml = missableTrophies.map(t => {
    const isEarned = STATE.earnedIds.has(t.id);
    const advice = MISSABLE_ADVICE[t.id] || 'Attempt early during free-roam and maintain a manual save before initiating this objective.';

    return `
      <article class="missable-card" id="missable-card-${t.id}">
        <div class="missable-card-header">
          <div class="missable-name-group">
            <span class="badge badge-${escapeHtml(t.grade)}">${escapeHtml(t.grade)}</span>
            <span class="badge badge-missable">MISSABLE</span>
            <h3 class="missable-name">#${t.id} ${escapeHtml(t.name)}</h3>
          </div>

          <label class="card-toggle-earned" title="Toggle earned status">
            <input
              type="checkbox"
              class="missable-earned-checkbox"
              data-id="${t.id}"
              ${isEarned ? 'checked' : ''}
              aria-label="Mark #${t.id} ${escapeHtml(t.name)} as earned"
            >
            <span>Earned</span>
          </label>
        </div>

        <p class="missable-desc">${escapeHtml(t.description)}</p>

        <div class="missable-alert-box">
          <span class="alert-tag">Why It's Missable</span>
          <p class="alert-message">${escapeHtml(t.missable_note || 'Can be permanently bypassed by story progression.')}</p>
        </div>

        <div class="missable-timing-box">
          <span class="timing-tag">When to Attempt</span>
          <p class="timing-message">${escapeHtml(advice)}</p>
        </div>

        <div class="missable-actions">
          <a href="#/checklist" class="trophy-chip" data-jump-id="${t.id}">
            <span>View #${t.id} in Checklist Guide</span>
          </a>
        </div>
      </article>
    `;
  }).join('');

  container.innerHTML = itemsHtml;
}

/**
 * Switch tabs based on active state or URL hash
 */
function switchTab(targetTab) {
  STATE.activeTab = targetTab;

  const tabs = ['checklist', 'roadmap', 'missables'];
  tabs.forEach(tab => {
    const navLink = document.getElementById(`nav-tab-${tab}`);
    const section = document.getElementById(`tab-${tab}`);
    const isActive = (tab === targetTab);

    if (navLink) {
      if (isActive) {
        navLink.classList.add('active');
      } else {
        navLink.classList.remove('active');
      }
    }

    if (section) {
      if (isActive) {
        section.hidden = false;
        section.classList.add('active');
      } else {
        section.hidden = true;
        section.classList.remove('active');
      }
    }
  });

  // Re-render the active tab
  if (targetTab === 'checklist') {
    renderChecklist();
  } else if (targetTab === 'roadmap') {
    renderRoadmap();
  } else if (targetTab === 'missables') {
    renderMissables();
  }
}

/**
 * Toggle earned status for a trophy ID
 */
function toggleEarned(id) {
  const numId = Number(id);
  if (STATE.earnedIds.has(numId)) {
    STATE.earnedIds.delete(numId);
  } else {
    STATE.earnedIds.add(numId);
  }
  saveProgress();

  // Re-render checklist and missables to reflect earned status
  if (STATE.activeTab === 'checklist') {
    renderChecklist();
  } else if (STATE.activeTab === 'missables') {
    renderMissables();
  } else if (STATE.activeTab === 'roadmap') {
    renderRoadmap();
  }
}

/**
 * Toggle card expansion
 */
function toggleCardExpansion(id) {
  const numId = Number(id);
  if (STATE.expandedIds.has(numId)) {
    STATE.expandedIds.delete(numId);
  } else {
    STATE.expandedIds.add(numId);
  }
  renderChecklist();
}

/**
 * Export earned list as JSON
 */
function exportProgress() {
  const data = {
    app: 'gta6-trophy-guide',
    version: 1,
    game: 'Grand Theft Auto VI',
    platform: 'PlayStation 5',
    exported_at: new Date().toISOString(),
    earned_count: STATE.earnedIds.size,
    earned: Array.from(STATE.earnedIds).sort((a, b) => a - b)
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-guide-progress.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import earned list from JSON file
 */
function importProgressFile(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      let ids = [];
      if (Array.isArray(parsed)) {
        ids = parsed.map(Number);
      } else if (parsed && Array.isArray(parsed.earned)) {
        ids = parsed.earned.map(Number);
      } else {
        alert('Unrecognized format: Expected a JSON array of trophy IDs or an object with an "earned" array.');
        return;
      }

      // Filter valid IDs 1..55
      const valid = ids.filter(id => !isNaN(id) && id >= 1 && id <= 55);
      STATE.earnedIds = new Set(valid);
      saveProgress();
      renderChecklist();
      renderRoadmap();
      renderMissables();
      alert(`Successfully imported ${valid.length} earned trophies.`);
    } catch (err) {
      alert(`Failed to import file: ${err.message}`);
    }
  };
  reader.readAsText(file);
}

/**
 * Reset earned progress guarded by confirm()
 */
function resetProgress() {
  const confirmed = window.confirm('Are you sure you want to reset all earned trophy progress? This action cannot be undone.');
  if (!confirmed) return;

  STATE.earnedIds.clear();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear localStorage key:', err);
  }
  updateHeaderProgress();
  renderChecklist();
  renderRoadmap();
  renderMissables();
}

/**
 * Jump to a specific trophy in Checklist and expand its guide
 */
function jumpToTrophy(id) {
  const numId = Number(id);
  STATE.expandedIds.add(numId);
  window.location.hash = '#/checklist';
  switchTab('checklist');

  // Defer scrolling slightly to allow DOM to render
  setTimeout(() => {
    const cardEl = document.getElementById(`trophy-card-${numId}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 60);
}

/**
 * Wire up all DOM Event Listeners
 */
function setupEventListeners() {
  // Hash change navigation
  window.addEventListener('hashchange', () => {
    let hash = window.location.hash || '#/checklist';
    if (hash.includes('?')) {
      hash = hash.split('?')[0];
    }
    if (hash === '#/roadmap') {
      switchTab('roadmap');
    } else if (hash === '#/missables') {
      switchTab('missables');
    } else {
      switchTab('checklist');
    }
  });

  // Filter Search Input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      STATE.filters.search = e.target.value;
      renderChecklist();
    });
  }

  // Kind Dropdown
  const kindSelect = document.getElementById('kind-select');
  if (kindSelect) {
    kindSelect.addEventListener('change', (e) => {
      STATE.filters.kind = e.target.value;
      renderChecklist();
    });
  }

  // Grade Dropdown
  const gradeSelect = document.getElementById('grade-select');
  if (gradeSelect) {
    gradeSelect.addEventListener('change', (e) => {
      STATE.filters.grade = e.target.value;
      renderChecklist();
    });
  }

  // Earned Only Checkbox
  const earnedOnlyChk = document.getElementById('filter-earned-only');
  const hideEarnedChk = document.getElementById('filter-hide-earned');

  if (earnedOnlyChk) {
    earnedOnlyChk.addEventListener('change', (e) => {
      STATE.filters.earnedOnly = e.target.checked;
      if (e.target.checked && hideEarnedChk) {
        hideEarnedChk.checked = false;
        STATE.filters.hideEarned = false;
      }
      renderChecklist();
    });
  }

  if (hideEarnedChk) {
    hideEarnedChk.addEventListener('change', (e) => {
      STATE.filters.hideEarned = e.target.checked;
      if (e.target.checked && earnedOnlyChk) {
        earnedOnlyChk.checked = false;
        STATE.filters.earnedOnly = false;
      }
      renderChecklist();
    });
  }

  // Spoiler Checkbox
  const spoilerChk = document.getElementById('filter-hide-spoilers');
  if (spoilerChk) {
    spoilerChk.addEventListener('change', (e) => {
      STATE.filters.hideSpoilers = e.target.checked;
      renderChecklist();
    });
  }

  // Export Button
  const btnExport = document.getElementById('btn-export');
  if (btnExport) {
    btnExport.addEventListener('click', exportProgress);
  }

  // Import File Input
  const inputImport = document.getElementById('input-import');
  if (inputImport) {
    inputImport.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        importProgressFile(file);
        e.target.value = ''; // Reset input for repeated imports
      }
    });
  }

  // Reset Button
  const btnReset = document.getElementById('btn-reset');
  if (btnReset) {
    btnReset.addEventListener('click', resetProgress);
  }

  // Checklist Card Click & Earned Checkbox Delegation
  const checklistContainer = document.getElementById('trophy-list');
  if (checklistContainer) {
    checklistContainer.addEventListener('click', (e) => {
      // Check if user clicked an earned checkbox
      const chk = e.target.closest('.trophy-earned-checkbox');
      if (chk) {
        const id = chk.getAttribute('data-id');
        toggleEarned(id);
        return;
      }

      // Check if user clicked inside card to toggle guide
      const card = e.target.closest('.trophy-card');
      if (card) {
        const id = card.getAttribute('data-id');
        toggleCardExpansion(id);
      }
    });
  }

  // Missables Earned Checkbox Delegation
  const missablesContainer = document.getElementById('missables-list');
  if (missablesContainer) {
    missablesContainer.addEventListener('click', (e) => {
      const chk = e.target.closest('.missable-earned-checkbox');
      if (chk) {
        const id = chk.getAttribute('data-id');
        toggleEarned(id);
        return;
      }

      const jumpLink = e.target.closest('[data-jump-id]');
      if (jumpLink) {
        e.preventDefault();
        const id = jumpLink.getAttribute('data-jump-id');
        jumpToTrophy(id);
      }
    });
  }

  // Roadmap Trophy Jump Delegation
  const roadmapContainer = document.getElementById('roadmap-phases');
  if (roadmapContainer) {
    roadmapContainer.addEventListener('click', (e) => {
      const jumpLink = e.target.closest('[data-jump-id]');
      if (jumpLink) {
        e.preventDefault();
        const id = jumpLink.getAttribute('data-jump-id');
        jumpToTrophy(id);
      }
    });
  }
}

/**
 * Main Initialization Routine
 */
async function init() {
  loadProgress();
  setupEventListeners();

  try {
    await loadTrophiesData();
  } catch (err) {
    console.error('Failed to initialize trophy guide data:', err);
    const container = document.getElementById('trophy-list');
    if (container) {
      container.innerHTML = `<div class="empty-state-box"><h2 class="empty-state-heading">Data Load Error</h2><p class="empty-state-desc">${escapeHtml(err.message)}</p></div>`;
    }
    return;
  }

  readUrlParams();
  updateHeaderProgress();
  renderRoadmap();
  renderMissables();
  switchTab(STATE.activeTab);

  // If ?open=<id> was provided, scroll to that card
  if (STATE.expandedIds.size > 0 && STATE.activeTab === 'checklist') {
    const firstOpenId = Array.from(STATE.expandedIds)[0];
    setTimeout(() => {
      const cardEl = document.getElementById(`trophy-card-${firstOpenId}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
