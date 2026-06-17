const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

window.addEventListener("load", () => window.scrollTo({ top: 0, left: 0 }));

const { config: coreConfig = {}, state: coreState = {}, economy: economyCore = {}, farm: farmCore = {} } = window.CyberGreenCore || {};
const {
  GROW_DURATION_MS,
  BOOST_MS,
  ZEN_DEFAULT_DURATION_MS,
  ZEN_DURATION_OPTIONS,
  ZEN_GENE_OPTIONS,
  ZEN_DNA_WINDOW_MS,
  ZEN_DNA_SHOW_START_MS,
  ZEN_DNA_SHOW_END_MS,
  ZEN_SOUND_PRESETS,
  BREATH_LOOP_MS,
  MISSION_WAIT_MS,
  MISSIONS,
  PLANT_VARIANTS,
  FARM_SLOT_COUNT,
  FARM_STRAINS,
  LAB_RECIPES,
  DRONE_SKINS,
  FARM_PASS_CONFIG = {},
  FIRST_CAPSULE_SLOT_UNLOCKS: CORE_FIRST_CAPSULE_SLOT_UNLOCKS = {}
} = coreConfig;
const { createInitialState, normalizeState, normalizeInventory, normalizeMissionState, normalizeFarmSlots, farmStrainById, defaultFarmStrainForSlot } = coreState;
const normalizeZenSound = (value = state.zenSound) => coreState.normalizeZenSound(value);
const normalizeZenGene = (value = state.zenGene) => coreState.normalizeZenGene(value);
const safeDroneLevel = (value = state.droneLevel) => coreState.safeDroneLevel(value);
const droneSkinById = (value = state.droneSkin) => coreState.droneSkinById(value);
const normalizeDroneSkin = (value = state.droneSkin) => coreState.normalizeDroneSkin(value);
const normalizeOwnedDroneSkins = (value = state.ownedDroneSkins) => coreState.normalizeOwnedDroneSkins(value);
const safeDataModuleLevel = (value = state.dataModuleLevel) => coreState.safeDataModuleLevel(value);
const normalizeUnlockedSlots = (value = state.unlockedSlots) => coreState.normalizeUnlockedSlots(value);
const EXACT_DONOR_MODE = true;
const SINGLE_CAPSULE_MODE = false;
const DONOR_RING_CIRCUMFERENCE = 251;
const DONOR_CAPSULE_COUNT = 3;
const FARM_PASS_PRODUCT_ID = FARM_PASS_CONFIG.productId || "farm_pass_30";
const FARM_PASS_DAYS = Math.max(1, Math.floor(Number(FARM_PASS_CONFIG.days) || 30));
const FARM_PASS_PRICE_STARS = Math.max(1, Math.floor(Number(FARM_PASS_CONFIG.stars) || 300));
const FARM_PASS_DAILY_CRC = Math.max(0, Math.floor(Number(FARM_PASS_CONFIG.dailyCrc) || 300));
const FARM_PASS_DAILY_SE = Math.max(0, Math.floor(Number(FARM_PASS_CONFIG.dailySe) || 3));
const FARM_PASS_UNIQUE_FLOWER_ID = FARM_PASS_CONFIG.uniqueFlower || "pass_quantum_flower";
const LEAGUE_TIERS = [
  { id: "seed", name: "Seed League", min: 1_000, max: 40_000, tone: "green" },
  { id: "sprout", name: "Sprout League", min: 40_000, max: 105_000, tone: "cyan" },
  { id: "bloom", name: "Bloom League", min: 105_000, max: 250_000, tone: "pink" },
  { id: "crystal", name: "Crystal League", min: 250_000, max: 600_000, tone: "blue" },
  { id: "quantum", name: "Quantum League", min: 600_000, max: 1_500_000, tone: "violet" },
  { id: "zenith", name: "Zenith League", min: 1_500_000, max: Infinity, tone: "gold" }
];
const LEAGUE_VISUALS = [
  ...LEAGUE_TIERS,
  { id: "apex", name: "Apex", min: Infinity, max: Infinity, tone: "apex" }
];
const FIRST_CAPSULE_SLOT_UNLOCKS = {
  3: {
    state: "paid",
    icon: "★",
    title: "UNLOCK",
    cost: "10 STARS",
    bonus: "OPEN SLOT",
    productId: "farm_slot_4",
    stars: 10,
    className: "premium-star"
  },
  4: {
    state: "se-paid",
    icon: "SE",
    title: "x3 SLOT",
    cost: "10 SE",
    bonus: "HARVEST x3",
    seedCost: 10,
    className: "premium-se"
  },
  5: {
    state: "paid",
    icon: "★",
    title: "x5 SLOT",
    cost: "100 STARS",
    bonus: "100% +5 SE",
    productId: "farm_slot_6",
    stars: 100,
    className: "premium-star premium-elite"
  }
};
const CAPSULE_SLOT_UNLOCKS = Object.keys(CORE_FIRST_CAPSULE_SLOT_UNLOCKS || {}).length
  ? CORE_FIRST_CAPSULE_SLOT_UNLOCKS
  : FIRST_CAPSULE_SLOT_UNLOCKS;
const FARM_EVENT_REWARDS = [
  { id: "crc_1", icon: "ϟ", label: "CRC", value: "+60", accent: "crc", apply: () => { state.energy += 60; } },
  { id: "main_2", icon: "◈", label: "Core", value: "+100", accent: "main", apply: () => { state.score += 100; } },
  { id: "zen_3", icon: "◎", label: "Zen", value: "+1", accent: "zen", apply: () => { state.resonance += 1; } },
  { id: "main_4", icon: "◈", label: "Core", value: "+200", accent: "main", apply: () => { state.score += 200; } },
  { id: "seed_5", icon: "✦", label: "Seed", value: "+1", accent: "seed", apply: () => { state.seed += 1; } },
  { id: "gene_6", icon: "DNA", label: "Genes", value: "+3", accent: "gene", apply: () => { state.inventory = normalizeInventory(state.inventory); state.inventory.geneStrands += 3; } },
  { id: "mystery_7", icon: "?", label: "Mystery", value: "Drop", accent: "mystery", apply: applyFarmEventMystery }
];

const FLOWER_STRAINS = [
  {
    id: "lumen_daisy",
    name: "LUMEN DAISY",
    shortName: "DAISY",
    type: "common flower",
    durationMs: 12 * 60_000,
    score: 64,
    biomass: 5,
    geneStrands: 1,
    plantCostScore: 24,
    plantCostResonance: 0,
    plantCostMain: 0,
    variantShift: 2,
    color: "#FFE680",
    iconKey: "flowerDaisy",
    labMaterial: { id: "lumen_petal", short: "PETAL", amount: 1 }
  },
  {
    id: "neon_orchid",
    name: "NEON ORCHID",
    shortName: "ORCHID",
    type: "rare flower",
    durationMs: 22 * 60_000,
    score: 122,
    biomass: 7,
    geneStrands: 2,
    plantCostScore: 52,
    plantCostResonance: 0,
    plantCostMain: 0,
    variantShift: 5,
    color: "#FF72D2",
    iconKey: "flowerOrchid",
    labMaterial: { id: "neon_pollen", short: "POLLEN", amount: 1 }
  },
  {
    id: "prism_tulip",
    name: "PRISM TULIP",
    shortName: "TULIP",
    type: "rare flower",
    durationMs: 34 * 60_000,
    score: 178,
    biomass: 9,
    geneStrands: 2,
    plantCostScore: 84,
    plantCostResonance: 0,
    plantCostMain: 0,
    variantShift: 8,
    color: "#76B8FF",
    iconKey: "flowerTulip",
    labMaterial: { id: "prism_bloom", short: "BLOOM", amount: 2 }
  },
  {
    id: "quantum_rose",
    name: "QUANTUM ROSE",
    shortName: "ROSE",
    type: "epic flower",
    durationMs: 52 * 60_000,
    score: 286,
    biomass: 13,
    geneStrands: 3,
    plantCostScore: 120,
    plantCostResonance: 1,
    plantCostMain: 0,
    variantShift: 13,
    color: "#B48EFF",
    iconKey: "flowerRose",
    labMaterial: { id: "quantum_petal", short: "Q-PETAL", amount: 2 }
  },
  {
    id: FARM_PASS_UNIQUE_FLOWER_ID,
    name: "PASS AURORA BLOOM",
    shortName: "AURORA",
    type: "unique flower",
    durationMs: 40 * 60_000,
    score: 420,
    biomass: 16,
    geneStrands: 5,
    plantCostScore: 0,
    plantCostResonance: 0,
    plantCostMain: 0,
    variantShift: 21,
    color: "#FFD66B",
    iconKey: "flowerRose",
    requiresInventory: true,
    inventoryKey: FARM_PASS_UNIQUE_FLOWER_ID,
    labMaterial: { id: "aurora_petal", short: "AURORA", amount: 3 }
  }
];

let state = loadState();
let farmPlantingSlot = null;
let farmPlantingStrain = null;
let activeDonorCapsule = 0;
let donorCapsuleSwipe = null;
let donorCapsuleSwipeHandled = false;
let plantDoubleTap = { source: "", strain: "", at: 0 };

const DONOR_ICONS = {
  basil: (c, s = 44) => `<svg viewBox="0 0 40 ${s}" width="40" height="${s}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="20" y1="${s - 2}" x2="20" y2="10" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="20" cy="24" r="2.5" fill="${c}"/>
    <circle cx="20" cy="16" r="1.5" fill="${c}" opacity=".5"/>
    <line x1="7" y1="${s - 4}" x2="4" y2="${s + 2}" stroke="${c}" stroke-width="1" opacity=".3"/>
    <line x1="33" y1="${s - 4}" x2="36" y2="${s + 2}" stroke="${c}" stroke-width="1" opacity=".3"/>
    <path d="M20,22 L6,12 L10,7 L20,22" fill="${c}" opacity=".72"/>
    <path d="M20,22 L34,12 L30,7 L20,22" fill="${c}" opacity=".72"/>
    <path d="M20,10 L14,4 L20,1 L26,4Z" fill="${c}" opacity=".9"/>
    <circle cx="8" cy="10" r="1.5" fill="${c}" opacity=".45"/>
    <circle cx="32" cy="10" r="1.5" fill="${c}" opacity=".45"/>
    <line x1="8" y1="9" x2="4" y2="6" stroke="${c}" stroke-width=".8" opacity=".3"/>
    <line x1="32" y1="9" x2="36" y2="6" stroke="${c}" stroke-width=".8" opacity=".3"/>
  </svg>`,
  rukola: (c, s = 44) => `<svg viewBox="0 0 40 ${s}" width="40" height="${s}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="20" y1="${s - 2}" x2="20" y2="20" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="20" y1="20" x2="10" y2="8" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
    <line x1="20" y1="20" x2="30" y2="8" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
    <line x1="20" y1="20" x2="20" y2="6" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="10" cy="6" rx="5" ry="3.5" fill="${c}" transform="rotate(-20,10,6)" opacity=".8"/>
    <ellipse cx="30" cy="6" rx="5" ry="3.5" fill="${c}" transform="rotate(20,30,6)" opacity=".8"/>
    <ellipse cx="20" cy="4" rx="4.5" ry="3" fill="${c}" opacity=".9"/>
    <circle cx="20" cy="20" r="2" fill="${c}"/>
    <circle cx="10" cy="8" r="1.5" fill="${c}" opacity=".5"/>
    <circle cx="30" cy="8" r="1.5" fill="${c}" opacity=".5"/>
    <line x1="5" y1="3" x2="8" y2="5" stroke="${c}" stroke-width=".8" opacity=".4"/>
    <line x1="35" y1="3" x2="32" y2="5" stroke="${c}" stroke-width=".8" opacity=".4"/>
  </svg>`,
  sunflower: (c, s = 52) => `<svg viewBox="0 0 40 ${s}" width="40" height="${s}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="20" y1="${s - 2}" x2="20" y2="22" stroke="${c}" stroke-width="2.8" stroke-linecap="round"/>
    <circle cx="20" cy="14" r="9" stroke="${c}" stroke-width="1.5"/>
    <circle cx="20" cy="14" r="4.5" fill="${c}" opacity=".75"/>
    <circle cx="20" cy="14" r="2" fill="${c}"/>
    <line x1="20" y1="3" x2="20" y2="5" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
    <line x1="20" y1="23" x2="20" y2="25" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
    <line x1="9" y1="14" x2="11" y2="14" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
    <line x1="29" y1="14" x2="31" y2="14" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
    <line x1="12.5" y1="6.5" x2="14" y2="8" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
    <line x1="27.5" y1="6.5" x2="26" y2="8" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
    <line x1="12.5" y1="21.5" x2="14" y2="20" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
    <line x1="27.5" y1="21.5" x2="26" y2="20" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
    <circle cx="15" cy="${s - 5}" r="1.5" fill="${c}" opacity=".4"/>
    <circle cx="25" cy="${s - 5}" r="1.5" fill="${c}" opacity=".4"/>
  </svg>`,
  wheat: (c, s = 52) => `<svg viewBox="0 0 40 ${s}" width="40" height="${s}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="20" y1="${s - 2}" x2="20" y2="4" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="20" cy="6" rx="3.5" ry="5.5" fill="${c}" opacity=".85"/>
    <ellipse cx="13" cy="14" rx="3" ry="5" fill="${c}" transform="rotate(-25,13,14)" opacity=".75"/>
    <ellipse cx="27" cy="14" rx="3" ry="5" fill="${c}" transform="rotate(25,27,14)" opacity=".75"/>
    <ellipse cx="11" cy="22" rx="2.5" ry="4.5" fill="${c}" transform="rotate(-30,11,22)" opacity=".6"/>
    <ellipse cx="29" cy="22" rx="2.5" ry="4.5" fill="${c}" transform="rotate(30,29,22)" opacity=".6"/>
    <circle cx="20" cy="14" r="1.5" fill="${c}" opacity=".5"/>
    <circle cx="20" cy="22" r="1.5" fill="${c}" opacity=".4"/>
    <line x1="8" y1="14" x2="13" y2="14" stroke="${c}" stroke-width=".8" opacity=".3"/>
    <line x1="32" y1="14" x2="27" y2="14" stroke="${c}" stroke-width=".8" opacity=".3"/>
  </svg>`,
  spirulina: (c, s = 52) => {
    const uid = `spiru-${Math.random().toString(16).slice(2)}`;
    return `<svg class="spirulina-icon" viewBox="0 0 40 ${s}" width="40" height="${s}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="${uid}-core" cx="50%" cy="46%" r="58%">
        <stop offset="0%" stop-color="#F3E8FF"/>
        <stop offset="42%" stop-color="${c}"/>
        <stop offset="100%" stop-color="#4D247D"/>
      </radialGradient>
      <linearGradient id="${uid}-thread" x1="7" y1="6" x2="34" y2="36">
        <stop offset="0%" stop-color="#F3E8FF"/>
        <stop offset="48%" stop-color="${c}"/>
        <stop offset="100%" stop-color="#74FFDA"/>
      </linearGradient>
    </defs>
    <path d="M20 ${s - 2}V39" stroke="url(#${uid}-thread)" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M20 38c-6.5-1.4-10-5.5-10-10 6.6-.8 10.5 2.8 10 10Z" fill="${c}" opacity=".34"/>
    <path d="M20 38c6.8-1.5 10.5-5.5 10-10-6.8-.9-10.7 2.7-10 10Z" fill="#74FFDA" opacity=".24"/>
    <path d="M20 31c-6.2 0-10.5-3.2-10.5-8.4 0-6.8 7.7-10.6 14.3-8.3 6.6 2.4 8.4 9.4 3.2 13.7-4.9 4.1-13.1 2.5-13.1-3.3 0-4.2 4.5-6.9 8.8-5.5 3.7 1.2 4.8 5.2 1.8 7.4-2.5 1.9-6.1.8-6.1-1.8 0-2 2.2-3.2 4.2-2.6" stroke="url(#${uid}-thread)" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="20" cy="24" r="4.4" fill="url(#${uid}-core)" opacity=".42"/>
    <circle cx="10" cy="29" r="2" fill="#F3E8FF" opacity=".46"/>
    <circle cx="30" cy="29" r="2.2" fill="#74FFDA" opacity=".46"/>
    <circle cx="20" cy="36" r="2.7" fill="${c}" opacity=".72"/>
    <circle cx="9" cy="18" r="1.35" fill="#F3E8FF" opacity=".5"/>
    <circle cx="31" cy="16" r="1.55" fill="#74FFDA" opacity=".54"/>
    <circle cx="24" cy="9" r="1.2" fill="white" opacity=".74"/>
    <circle cx="15" cy="13" r="1" fill="${c}" opacity=".62"/>
  </svg>`;
  },
  chroma: (c, s = 48) => `<svg viewBox="0 0 40 ${s}" width="40" height="${s}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20,${s - 2} Q22,${s - 14} 20,${s - 22} Q18,${s - 30} 20,${s - 36}" stroke="${c}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <path d="M20,${s - 22} Q10,${s - 28} 8,${s - 38} Q14,${s - 38} 18,${s - 28}" fill="${c}" opacity=".75"/>
    <path d="M20,${s - 22} Q30,${s - 28} 32,${s - 38} Q26,${s - 38} 22,${s - 28}" fill="${c}" opacity=".75"/>
    <path d="M20,${s - 30} Q12,${s - 36} 10,${s - 44}" stroke="${c}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".6"/>
    <path d="M20,${s - 30} Q28,${s - 36} 30,${s - 44}" stroke="${c}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".6"/>
    <circle cx="20" cy="${s - 22}" r="2.5" fill="${c}"/>
    <circle cx="8" cy="${s - 38}" r="2" fill="${c}" opacity=".6"/>
    <circle cx="32" cy="${s - 38}" r="2" fill="${c}" opacity=".6"/>
    <circle cx="20" cy="${s - 36}" r="3" fill="${c}" opacity=".85"/>
    <circle cx="20" cy="${s - 36}" r="1.5" fill="white" opacity=".5"/>
  </svg>`,
  flowerDaisy: (c, s = 48) => `<svg viewBox="0 0 40 ${s}" width="40" height="${s}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="20" y1="${s - 2}" x2="20" y2="25" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M20 34c-5-1-8-4-8-7.5 5-.8 8.3 1.8 8 7.5Z" fill="${c}" opacity=".28"/>
    <path d="M20 34c5.3-1 8.2-4 8-7.5-5.2-.8-8.4 1.8-8 7.5Z" fill="${c}" opacity=".2"/>
    <g transform="translate(20 17)">
      <ellipse rx="4.2" ry="8" fill="${c}" opacity=".9"/>
      <ellipse rx="4.2" ry="8" fill="${c}" opacity=".78" transform="rotate(60)"/>
      <ellipse rx="4.2" ry="8" fill="${c}" opacity=".78" transform="rotate(120)"/>
      <circle r="4.1" fill="#12251C" stroke="white" stroke-opacity=".55"/>
      <circle r="2.4" fill="#EFFF9B"/>
    </g>
    <circle cx="9" cy="14" r="1.5" fill="${c}" opacity=".45"/>
    <circle cx="31" cy="13" r="1.3" fill="${c}" opacity=".45"/>
  </svg>`,
  flowerOrchid: (c, s = 50) => `<svg viewBox="0 0 40 ${s}" width="40" height="${s}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="20" y1="${s - 2}" x2="20" y2="27" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M20 30c-6-2.5-9.5-7-8.4-12 5.6.6 8.3 4.2 8.4 12Z" fill="${c}" opacity=".56"/>
    <path d="M20 30c6-2.5 9.5-7 8.4-12-5.6.6-8.3 4.2-8.4 12Z" fill="${c}" opacity=".74"/>
    <path d="M20 25c-4.5-4.2-4.5-10.5 0-15 4.5 4.5 4.5 10.8 0 15Z" fill="${c}" opacity=".92"/>
    <path d="M15.5 19c-4.3-1.6-6.5-5-6.2-9.2 4.8.4 7.6 3.2 6.2 9.2Z" fill="${c}" opacity=".42"/>
    <path d="M24.5 19c4.3-1.6 6.5-5 6.2-9.2-4.8.4-7.6 3.2-6.2 9.2Z" fill="${c}" opacity=".42"/>
    <circle cx="20" cy="22" r="3.3" fill="#F7E8FF"/>
    <circle cx="20" cy="22" r="1.7" fill="#402252"/>
  </svg>`,
  flowerTulip: (c, s = 50) => `<svg viewBox="0 0 40 ${s}" width="40" height="${s}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="20" y1="${s - 2}" x2="20" y2="25" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M20 25c-7-4-10-11.5-8-20 4 2.5 6.4 5.2 8 9.5 1.6-4.3 4-7 8-9.5 2 8.5-1 16-8 20Z" fill="${c}" opacity=".85"/>
    <path d="M20 25c-3.8-5.2-4-12.4 0-18 4 5.6 3.8 12.8 0 18Z" fill="#EAF5FF" opacity=".28"/>
    <path d="M20 35c-5.4-1.2-8.8-4.2-9.2-8.3 5.7-.7 9.1 2.3 9.2 8.3Z" fill="${c}" opacity=".22"/>
    <path d="M20 35c5.4-1.2 8.8-4.2 9.2-8.3-5.7-.7-9.1 2.3-9.2 8.3Z" fill="${c}" opacity=".22"/>
    <circle cx="13" cy="9" r="1.3" fill="white" opacity=".55"/>
    <circle cx="27" cy="9" r="1.3" fill="white" opacity=".55"/>
  </svg>`,
  flowerRose: (c, s = 52) => `<svg viewBox="0 0 40 ${s}" width="40" height="${s}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="20" y1="${s - 2}" x2="20" y2="29" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M20 39c-5.4-1.1-8.8-4.5-8.7-9.2 5.7-.8 9.1 2.5 8.7 9.2Z" fill="${c}" opacity=".28"/>
    <path d="M20 39c5.4-1.1 8.8-4.5 8.7-9.2-5.7-.8-9.1 2.5-8.7 9.2Z" fill="#74FFDA" opacity=".22"/>
    <g transform="translate(20 19)">
      <path d="M0-12c7 2 10 9 5 15-4.8 5.8-14.2 3.6-14.2-3.6 0-5.3 5.2-8.3 9.2-11.4Z" fill="${c}" opacity=".8"/>
      <path d="M0-12c-7 2-10 9-5 15 4.8 5.8 14.2 3.6 14.2-3.6 0-5.3-5.2-8.3-9.2-11.4Z" fill="${c}" opacity=".58"/>
      <path d="M-1 6c-4-3.5-2.4-9.6 3-10.8 4.8 2.7 5 8.8-3 10.8Z" fill="#F3E8FF" opacity=".34"/>
      <circle r="3.2" fill="#4D247D"/>
      <circle r="1.55" fill="#F3E8FF"/>
    </g>
    <circle cx="30" cy="11" r="1.4" fill="#F3E8FF" opacity=".65"/>
  </svg>`
};

const DONOR_CAPSULE_TYPES = [
  {
    name: "Nanogreen",
    icon: `<svg viewBox="0 0 42 42" aria-hidden="true" focusable="false">
      <path d="M21 34V15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M20 24C14 19 8 20 6 27c6 2 11 0 14-5Z" fill="currentColor" opacity=".78"/>
      <path d="M22 22c6-6 12-5 15 1-5 4-11 4-15-1Z" fill="currentColor" opacity=".88"/>
      <path d="M21 15c-4-4-3-9 1-12 4 3 4 8-1 12Z" fill="currentColor"/>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" opacity=".44"/>
      <circle cx="31" cy="11" r="1.4" fill="currentColor" opacity=".5"/>
      <circle cx="33" cy="30" r="1.2" fill="currentColor" opacity=".42"/>
    </svg>`
  },
  {
    name: "Nanoflowers",
    icon: `<svg viewBox="0 0 42 42" aria-hidden="true" focusable="false">
      <path d="M21 35V25" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M21 25c-5 1-8 4-9 9 5 1 8-2 9-7 1 5 5 8 10 6-1-5-5-8-10-8Z" fill="currentColor" opacity=".58"/>
      <circle cx="21" cy="17" r="4.5" fill="currentColor"/>
      <ellipse cx="21" cy="8.5" rx="4" ry="6" fill="currentColor" opacity=".78"/>
      <ellipse cx="21" cy="25.5" rx="4" ry="6" fill="currentColor" opacity=".7"/>
      <ellipse cx="12.5" cy="17" rx="6" ry="4" fill="currentColor" opacity=".72"/>
      <ellipse cx="29.5" cy="17" rx="6" ry="4" fill="currentColor" opacity=".82"/>
      <circle cx="21" cy="17" r="2" fill="#06110f" opacity=".78"/>
    </svg>`
  },
  {
    name: "Nanomushrooms",
    icon: `<svg viewBox="0 0 42 42" aria-hidden="true" focusable="false">
      <path d="M17 22h10l2 13H15Z" fill="currentColor" opacity=".72"/>
      <path d="M8 22c1-9 7-15 13-15s12 6 13 15c-5 3-21 3-26 0Z" fill="currentColor"/>
      <path d="M13 21c2-4 5-6 8-6s6 2 8 6" fill="none" stroke="#06110f" stroke-width="1.5" opacity=".45"/>
      <circle cx="15" cy="15" r="2" fill="#06110f" opacity=".5"/>
      <circle cx="24" cy="12" r="1.7" fill="#06110f" opacity=".45"/>
      <circle cx="29" cy="18" r="1.4" fill="#06110f" opacity=".4"/>
      <circle cx="20" cy="28" r="1.2" fill="#06110f" opacity=".35"/>
    </svg>`
  }
];

const LAB_MATERIALS = FARM_STRAINS.reduce((materials, strain) => {
  const material = strain?.labMaterial;
  if (material?.id && !materials.some((item) => item.id === material.id)) {
    materials.push({ ...material, strainId: strain.id, color: strain.color || "#7effde" });
  }
  return materials;
}, []);

const $ = (selector) => document.querySelector(selector);
const setText = (selector, value) => {
  const node = $(selector);
  if (node) node.textContent = value;
};
const setHTML = (selector, value) => {
  const node = $(selector);
  if (node) node.innerHTML = value;
};
const setTitle = (selector, value) => {
  const node = $(selector);
  if (node) node.title = value;
};
const setStyle = (selector, prop, value) => {
  const node = $(selector);
  if (node) node.style.setProperty(prop, value);
};
const setInputValue = (selector, value) => {
  const node = $(selector);
  if (node) {
    node.value = value;
    node.style.setProperty("--range-fill", `${value}%`);
  }
};
const setClass = (selector, className, enabled) => {
  const node = $(selector);
  if (node) node.classList.toggle(className, enabled);
};

const rooms = {
  farm: $("#farmRoom"),
  lab: $("#labRoom"),
  zen: $("#zenRoom"),
  daily: $("#dailyRoom"),
  missions: $("#missionsRoom"),
  shop: $("#shopRoom")
};
let roomBeforeDaily = "farm";
let labSceneEngine = null;
let lastLabSynthesis = null;

const LAB_SCENE_PRESETS = {
  artifact: {
    accent: "#7effde",
    secondary: "#58dcff",
    tertiary: "#ffd670",
    blocked: "#ff6b7d"
  },
  serum: {
    accent: "#58dcff",
    secondary: "#7effde",
    tertiary: "#8fdcff",
    blocked: "#5f7a86"
  },
  catalyst: {
    accent: "#ffd670",
    secondary: "#ff72d2",
    tertiary: "#7effde",
    blocked: "#ff866f"
  }
};

class LabSlot {
  constructor(config = {}) {
    this.id = config.id || "lab-slot";
    this.update(config);
  }

  update(config = {}) {
    this.role = config.role || this.role || "source";
    this.occupied = Boolean(config.occupied);
    this.ready = Boolean(config.ready);
    this.locked = Boolean(config.locked);
    this.energy = clamp(Number(config.energy) || 0, 0, 1);
    this.color = config.color || this.color || "#7effde";
    this.secondaryColor = config.secondaryColor || this.secondaryColor || "#58dcff";
    this.label = config.label || this.label || "";
    this.glyph = config.glyph || this.glyph || "";
  }

  getVisualState(time = 0) {
    const pulse = 0.5 + Math.sin(time * 2.6 + (this.role === "core" ? 0.8 : this.role === "source-b" ? 1.6 : 0.1)) * 0.5;
    const energy = this.locked ? 0.12 : clamp(this.energy * 0.88 + pulse * 0.12, 0.08, 1);
    return {
      alpha: this.locked ? 0.24 : this.ready ? 0.96 : 0.58 + energy * 0.22,
      energy,
      pulse,
      radius: this.role === "core" ? 26 + energy * 11 : 10 + energy * 7,
      color: this.color,
      secondaryColor: this.secondaryColor
    };
  }
}

class ResourceManager {
  constructor(maxParticles = 84) {
    this.particles = Array.from({ length: maxParticles }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 0,
      growth: 0,
      age: 0,
      life: 0,
      alpha: 0,
      drag: 0.96,
      glow: 0.6,
      color: "#7effde"
    }));
  }

  spawn(config = {}) {
    const particle = this.particles.find((entry) => !entry.active);
    if (!particle) return null;
    particle.active = true;
    particle.x = Number(config.x) || 0;
    particle.y = Number(config.y) || 0;
    particle.vx = Number(config.vx) || 0;
    particle.vy = Number(config.vy) || 0;
    particle.size = Number(config.size) || 2;
    particle.growth = Number(config.growth) || 0;
    particle.age = 0;
    particle.life = Math.max(0.1, Number(config.life) || 0.6);
    particle.alpha = config.alpha === undefined ? 1 : Number(config.alpha) || 0;
    particle.drag = Number(config.drag) || 0.96;
    particle.glow = Number(config.glow) || 0.6;
    particle.color = config.color || "#7effde";
    return particle;
  }

  update(dt) {
    this.particles.forEach((particle) => {
      if (!particle.active) return;
      particle.age += dt;
      if (particle.age >= particle.life) {
        particle.active = false;
        return;
      }
      const drag = Math.pow(particle.drag, dt * 60);
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= drag;
      particle.vy *= drag;
      particle.size += particle.growth * dt;
      particle.alpha = 1 - particle.age / particle.life;
    });
  }

  eachActive(callback) {
    this.particles.forEach((particle) => {
      if (particle.active) callback(particle);
    });
  }
}

class MutationAnimator {
  constructor(resourceManager) {
    this.resourceManager = resourceManager;
    this.slotMap = new Map();
    this.slots = [];
    this.scene = null;
    this.streamAccumulator = 0;
    this.sparkAccumulator = 0;
    this.shakePower = 0;
    this.flash = 0;
    this.pendingCue = null;
  }

  setScene(scene = {}) {
    this.scene = scene;
    this.syncSlots(scene.slots || []);
    this.flash = Math.max(this.flash * 0.82, scene.status === "ready" ? 0.34 : scene.status === "processing" ? 0.2 : 0.1);
  }

  syncSlots(slotConfigs = []) {
    this.slots = slotConfigs.map((slotConfig) => {
      let slot = this.slotMap.get(slotConfig.id);
      if (!slot) {
        slot = new LabSlot(slotConfig);
        this.slotMap.set(slotConfig.id, slot);
      } else {
        slot.update(slotConfig);
      }
      return slot;
    });
  }

  triggerCue(type, options = {}) {
    const accent = options.accent || this.scene?.accent || "#7effde";
    this.shakePower = Math.max(this.shakePower, type === "rare" ? 0.22 : type === "synth" ? 0.14 : type === "reject" ? 0.08 : 0.06);
    this.flash = Math.max(this.flash, type === "rare" ? 0.92 : type === "synth" ? 0.56 : type === "reject" ? 0.26 : 0.32);
    if (options.metrics?.core) {
      this.emitBurst(options.metrics.core, accent, type === "rare" ? 28 : type === "synth" ? 18 : 8, type === "reject");
    } else {
      this.pendingCue = { type, accent };
    }
  }

  emitBurst(core, color, amount = 12, reject = false) {
    for (let index = 0; index < amount; index += 1) {
      const angle = (Math.PI * 2 * index) / amount + Math.random() * 0.28;
      const speed = reject ? 38 + Math.random() * 22 : 74 + Math.random() * 48;
      this.resourceManager.spawn({
        x: core.x,
        y: core.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: reject ? 2.2 : 2.8,
        growth: reject ? -1.6 : 7 + Math.random() * 10,
        life: reject ? 0.34 : 0.62 + Math.random() * 0.36,
        drag: reject ? 0.88 : 0.94,
        glow: reject ? 0.42 : 0.82,
        color
      });
    }
  }

  emitBeam(source, target, color, spread = 1) {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const sync = this.scene?.sync || 0;
    this.resourceManager.spawn({
      x: source.x,
      y: source.y,
      vx: dx * (0.96 + sync * 0.48) + (Math.random() - 0.5) * 18 * spread,
      vy: dy * (0.96 + sync * 0.48) + (Math.random() - 0.5) * 14 * spread,
      size: 1.8 + Math.random() * 1.5,
      growth: 6 + Math.random() * 9,
      life: 0.44 + Math.random() * 0.24,
      drag: 0.95,
      glow: 0.78,
      color
    });
  }

  emitOrbit(metrics, color) {
    const angle = Math.random() * Math.PI * 2;
    const radius = metrics.coreRadius * (1.4 + Math.random() * 0.5);
    this.resourceManager.spawn({
      x: metrics.core.x + Math.cos(angle) * radius,
      y: metrics.core.y + Math.sin(angle) * radius * 0.62,
      vx: -Math.sin(angle) * (16 + Math.random() * 10),
      vy: Math.cos(angle) * (12 + Math.random() * 8),
      size: 1.8 + Math.random() * 1.2,
      growth: 3,
      life: 0.56 + Math.random() * 0.32,
      drag: 0.97,
      glow: 0.6,
      color
    });
  }

  update(dt, metrics, now) {
    if (!this.scene) {
      this.resourceManager.update(dt);
      return;
    }

    if (this.pendingCue) {
      const { type, accent } = this.pendingCue;
      this.pendingCue = null;
      this.triggerCue(type, { accent, metrics });
    }

    const stateFactor = this.scene.status === "locked" ? 0.42 : this.scene.status === "ready" ? 1.3 : 0.92;
    this.streamAccumulator += dt * (10 + this.scene.intensity * 14) * stateFactor;
    while (this.streamAccumulator >= 1) {
      this.streamAccumulator -= 1;
      this.emitBeam(metrics.sources[0], metrics.core, this.slots[0]?.color || this.scene.accent, 1);
      this.emitBeam(metrics.sources[1], metrics.core, this.slots[1]?.color || this.scene.secondary, 1);
    }

    this.sparkAccumulator += dt * (1 + this.scene.sync * 2.4);
    if (this.sparkAccumulator >= 1 && this.scene.status !== "locked") {
      this.sparkAccumulator = 0;
      this.emitOrbit(metrics, this.scene.tertiary || this.scene.accent);
    }

    this.flash = Math.max(0, this.flash - dt * 0.72);
    this.shakePower = Math.max(0, this.shakePower - dt * 1.8);
    this.resourceManager.update(dt);
  }

  getShakeOffset(now = 0) {
    if (!this.shakePower) return { x: 0, y: 0 };
    const shakeX = Math.sin(now * 62) * 5 * this.shakePower;
    const shakeY = Math.cos(now * 48) * 3 * this.shakePower;
    return { x: shakeX, y: shakeY };
  }

  draw(ctx, metrics, now) {
    if (!this.scene) return;

    const coreSlot = this.slots.find((slot) => slot.role === "core");
    const coreState = coreSlot?.getVisualState(now) || { radius: metrics.coreRadius, alpha: 0.8, color: this.scene.accent, secondaryColor: this.scene.secondary };

    ctx.save();
    ctx.globalCompositeOperation = "screen";

    const haloGradient = ctx.createRadialGradient(metrics.core.x, metrics.core.y, 0, metrics.core.x, metrics.core.y, metrics.coreRadius * 2.1);
    haloGradient.addColorStop(0, colorWithAlpha(coreState.color, 0.34 + this.flash * 0.22));
    haloGradient.addColorStop(0.4, colorWithAlpha(coreState.secondaryColor, 0.14 + this.flash * 0.12));
    haloGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = haloGradient;
    ctx.beginPath();
    ctx.arc(metrics.core.x, metrics.core.y, metrics.coreRadius * 2.1, 0, Math.PI * 2);
    ctx.fill();

    metrics.sources.forEach((source, index) => {
      const slot = this.slots[index];
      const slotState = slot?.getVisualState(now) || { alpha: 0.4, color: this.scene.secondary, secondaryColor: this.scene.accent, radius: 12 };
      const beamGradient = ctx.createLinearGradient(source.x, source.y, metrics.core.x, metrics.core.y);
      beamGradient.addColorStop(0, colorWithAlpha(slotState.color, slotState.alpha * 0.5));
      beamGradient.addColorStop(0.5, colorWithAlpha(slotState.secondaryColor, slotState.alpha * 0.22));
      beamGradient.addColorStop(1, colorWithAlpha(coreState.color, 0));
      ctx.strokeStyle = beamGradient;
      ctx.lineWidth = 1.8 + slotState.energy * 1.6;
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.quadraticCurveTo((source.x + metrics.core.x) / 2, source.y - 18 + index * 10, metrics.core.x, metrics.core.y);
      ctx.stroke();

      const nodeGradient = ctx.createRadialGradient(source.x, source.y, 0, source.x, source.y, slotState.radius * 2);
      nodeGradient.addColorStop(0, colorWithAlpha(slotState.color, slotState.alpha));
      nodeGradient.addColorStop(0.45, colorWithAlpha(slotState.secondaryColor, slotState.alpha * 0.5));
      nodeGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = nodeGradient;
      ctx.beginPath();
      ctx.arc(source.x, source.y, slotState.radius * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = colorWithAlpha("#f4fff9", 0.82);
      ctx.beginPath();
      ctx.arc(source.x, source.y, slotState.radius * 0.42, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = colorWithAlpha(coreState.color, 0.42 + this.flash * 0.18);
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(metrics.core.x, metrics.core.y, metrics.coreRadius * 1.12, metrics.coreRadius * 0.8, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = colorWithAlpha("#f4fff9", 0.88);
    ctx.beginPath();
    ctx.arc(metrics.core.x, metrics.core.y, coreState.radius * 0.32, 0, Math.PI * 2);
    ctx.fill();

    this.resourceManager.eachActive((particle) => {
      const glowGradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 3.6);
      glowGradient.addColorStop(0, colorWithAlpha(particle.color, particle.alpha));
      glowGradient.addColorStop(0.35, colorWithAlpha(particle.color, particle.alpha * particle.glow));
      glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 3.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = colorWithAlpha("#f4fff9", particle.alpha * 0.9);
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, Math.max(0.8, particle.size * 0.48), 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }
}

class LabEngine {
  constructor({ canvas, capsule, animator }) {
    this.canvas = canvas;
    this.capsule = capsule;
    this.animator = animator;
    this.ctx = canvas?.getContext("2d", { alpha: true, desynchronized: true });
    this.scene = null;
    this.active = false;
    this.frameId = 0;
    this.lastTs = 0;
    this.dpr = 1;
    this.bounds = { width: 0, height: 0 };
    this.metrics = null;
    this.frame = this.frame.bind(this);
    this.resize = this.resize.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    window.addEventListener("resize", this.resize, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.stop();
        return;
      }
      if (this.active) {
        this.resize();
        this.start();
      }
    });
    this.canvas?.addEventListener("pointerdown", this.onPointerDown, { passive: true });
  }

  setScene(scene = {}) {
    this.scene = scene;
    this.animator.setScene(scene);
    this.canvas?.style.setProperty("--lab-canvas-accent", scene.accent || "#7effde");
  }

  triggerCue(type, options = {}) {
    const metrics = this.metrics || this.computeMetrics(performance.now() * 0.001);
    this.animator.triggerCue(type, {
      ...options,
      metrics
    });
    if (this.active) this.start();
  }

  setActive(active) {
    this.active = Boolean(active);
    if (!this.active) {
      this.stop();
      return;
    }
    this.resize();
    this.start();
  }

  start() {
    if (!this.ctx || !this.active || this.frameId) return;
    this.lastTs = performance.now();
    this.frameId = window.requestAnimationFrame(this.frame);
  }

  stop() {
    if (!this.frameId) return;
    window.cancelAnimationFrame(this.frameId);
    this.frameId = 0;
  }

  resize() {
    if (!this.canvas || !this.ctx) return;
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const nextWidth = Math.round(rect.width * dpr);
    const nextHeight = Math.round(rect.height * dpr);
    if (this.canvas.width !== nextWidth || this.canvas.height !== nextHeight) {
      this.canvas.width = nextWidth;
      this.canvas.height = nextHeight;
    }
    this.bounds = {
      width: rect.width,
      height: rect.height
    };
    this.dpr = dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  computeMetrics(now = 0) {
    const width = this.bounds.width || this.canvas?.clientWidth || 0;
    const height = this.bounds.height || this.canvas?.clientHeight || 0;
    const sway = Math.sin(now * 1.8) * 5;
    return {
      width,
      height,
      core: {
        x: width * 0.5,
        y: height * 0.48 + Math.sin(now * 1.35) * 3
      },
      coreRadius: Math.min(width, height) * 0.16,
      ringRadius: Math.min(width, height) * 0.28,
      sources: [
        { x: width * 0.21, y: height * 0.72 + sway },
        { x: width * 0.79, y: height * 0.3 - sway }
      ]
    };
  }

  frame(timestamp) {
    this.frameId = 0;
    if (!this.active || !this.ctx) return;
    if (!this.bounds.width || !this.bounds.height) this.resize();
    const now = timestamp * 0.001;
    const dt = Math.min((timestamp - (this.lastTs || timestamp)) / 1000, 0.05);
    this.lastTs = timestamp;
    this.metrics = this.computeMetrics(now);
    this.animator.update(dt, this.metrics, now);
    this.draw(now);
    this.frameId = window.requestAnimationFrame(this.frame);
  }

  draw(now = 0) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const { width, height } = this.bounds;
    ctx.clearRect(0, 0, width, height);

    const shake = this.animator.getShakeOffset(now);
    ctx.save();
    ctx.translate(shake.x, shake.y);
    this.drawFrame(ctx, this.metrics, now);
    this.animator.draw(ctx, this.metrics, now);
    ctx.restore();
  }

  drawFrame(ctx, metrics, now) {
    if (!metrics || !this.scene) return;
    const accent = this.scene.accent || "#7effde";
    const statusColor = this.scene.status === "locked"
      ? this.scene.blocked || "#ff6b7d"
      : this.scene.status === "processing"
        ? this.scene.secondary || "#58dcff"
        : accent;

    ctx.save();
    ctx.strokeStyle = colorWithAlpha(statusColor, 0.22);
    ctx.lineWidth = 1.2;
    for (let ring = 0; ring < 3; ring += 1) {
      const radius = metrics.ringRadius + ring * 18 + Math.sin(now * (1.3 + ring * 0.2)) * 2;
      ctx.beginPath();
      ctx.ellipse(metrics.core.x, metrics.core.y, radius, radius * 0.62, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    const frameGradient = ctx.createLinearGradient(metrics.core.x, 0, metrics.core.x, metrics.height);
    frameGradient.addColorStop(0, colorWithAlpha(accent, 0.04));
    frameGradient.addColorStop(0.5, colorWithAlpha(this.scene.secondary || accent, 0.08));
    frameGradient.addColorStop(1, colorWithAlpha(accent, 0));
    ctx.fillStyle = frameGradient;
    ctx.fillRect(metrics.width * 0.17, metrics.height * 0.1, metrics.width * 0.66, metrics.height * 0.76);
    ctx.restore();
  }

  onPointerDown(event) {
    if (!this.scene) return;
    const rect = this.canvas?.getBoundingClientRect();
    if (!rect) return;
    const point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    const metrics = this.metrics || this.computeMetrics(performance.now() * 0.001);
    const distance = Math.hypot(point.x - metrics.core.x, point.y - metrics.core.y);
    const cueType = distance <= metrics.coreRadius * 1.65 ? "pulse" : "reject";
    const cueColor = cueType === "pulse" ? this.scene.accent : this.scene.blocked;
    this.triggerCue(cueType, { accent: cueColor });
  }
}

function colorWithAlpha(color, alpha = 1) {
  const normalized = String(color || "#7effde").trim();
  if (normalized.startsWith("#")) {
    const hex = normalized.slice(1);
    const chunk = hex.length === 3 ? hex.split("").map((char) => char + char).join("") : hex.padEnd(6, "0").slice(0, 6);
    const int = Number.parseInt(chunk, 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (normalized.startsWith("rgb(")) {
    return normalized.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
  }
  return normalized;
}

function ensureLabSceneEngine() {
  if (labSceneEngine) return labSceneEngine;
  const canvas = $("#labReactorCanvas");
  const capsule = $("#mutationCapsule");
  if (!canvas || !capsule) return null;
  const animator = new MutationAnimator(new ResourceManager());
  labSceneEngine = new LabEngine({ canvas, capsule, animator });
  labSceneEngine.setActive(activeRoomName() === "lab");
  return labSceneEngine;
}

function updateLabScene(scene) {
  const engine = ensureLabSceneEngine();
  if (!engine) return;
  engine.setScene(scene);
}

function triggerLabSceneCue(type, options = {}) {
  const engine = ensureLabSceneEngine();
  if (!engine) return;
  engine.triggerCue(type, options);
}

function buildLabSceneState({
  recipe,
  inventory,
  fusionProgress,
  serumProgress,
  catalystProgress,
  formulaSync,
  rareChance,
  rareActive,
  canSynth
}) {
  const effectType = recipe.effect?.type || "artifact";
  const preset = LAB_SCENE_PRESETS[effectType] || LAB_SCENE_PRESETS.artifact;
  const materialA = labMaterialById(recipe.materials?.[0]?.id);
  const materialB = labMaterialById(recipe.materials?.[1]?.id);
  const primaryEnergy = recipe.materials?.[0]
    ? clamp(labMaterialCount(recipe.materials[0].id, inventory) / Math.max(1, recipe.materials[0].amount), 0, 1)
    : clamp(inventory.geneStrands / Math.max(1, labGeneCost()), 0, 1);
  const secondaryEnergy = recipe.materials?.[1]
    ? clamp(labMaterialCount(recipe.materials[1].id, inventory) / Math.max(1, recipe.materials[1].amount), 0, 1)
    : clamp(state.seed / Math.max(1, labSeCost()), 0, 1);
  const status = rareActive ? "ready" : canSynth ? "ready" : formulaSync >= 56 || fusionProgress >= 52 ? "processing" : "locked";

  return {
    status,
    effectType,
    accent: recipe.accent || preset.accent,
    secondary: materialB?.color || preset.secondary,
    tertiary: preset.tertiary,
    blocked: preset.blocked,
    intensity: clamp((fusionProgress + serumProgress + catalystProgress) / 240, 0.18, 1),
    sync: clamp(formulaSync / 100, 0, 1),
    rareChance: clamp(rareChance / 100, 0, 1),
    slots: [
      {
        id: "lab-source-a",
        role: "source-a",
        occupied: true,
        ready: primaryEnergy >= 1,
        locked: status === "locked" && primaryEnergy < 0.34,
        energy: primaryEnergy,
        color: materialA?.color || preset.accent,
        secondaryColor: preset.secondary
      },
      {
        id: "lab-source-b",
        role: "source-b",
        occupied: true,
        ready: secondaryEnergy >= 1,
        locked: status === "locked" && secondaryEnergy < 0.34,
        energy: secondaryEnergy,
        color: materialB?.color || preset.secondary,
        secondaryColor: preset.tertiary
      },
      {
        id: "lab-core",
        role: "core",
        occupied: true,
        ready: status === "ready",
        locked: false,
        energy: clamp((formulaSync + rareChance) / 140, 0.2, 1),
        color: recipe.accent || preset.accent,
        secondaryColor: preset.secondary
      }
    ]
  };
}

function activeRoomName() {
  return Object.entries(rooms).find(([, room]) => room?.classList.contains("active"))?.[0] || "farm";
}

function formatFullNumber(value) {
  const number = Math.max(0, Math.floor(Number(value) || 0));
  return number.toLocaleString("en-US").replace(/,/g, " ");
}

function formatCompactNumber(value) {
  const number = Math.max(0, Math.floor(Number(value) || 0));
  if (number < 100_000) return formatFullNumber(number);

  const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
  const tier = Math.min(suffixes.length - 1, Math.floor(Math.log10(number) / 3));
  const scaled = number / (1000 ** tier);
  const digits = scaled < 10 ? 1 : 0;
  return `${scaled.toFixed(digits).replace(/\.0$/, "")}${suffixes[tier]}`;
}

function setResourceNumber(selector, value) {
  setText(selector, formatCompactNumber(value));
  setTitle(selector, formatFullNumber(value));
}

function resourceIconHtml(type = "crc") {
  const normalized = String(type || "crc").toLowerCase();
  return `<span class="inline-resource-icon icon-${escapeHtml(normalized)}" aria-hidden="true"><i></i><i></i><i></i></span>`;
}

function resourceAmountHtml(type, value, label = "") {
  const amount = typeof value === "number" ? formatCompactNumber(value) : escapeHtml(String(value ?? ""));
  const text = label ? `<em>${escapeHtml(label)}</em>` : "";
  return `<span class="resource-amount resource-${escapeHtml(String(type || "crc").toLowerCase())}">${resourceIconHtml(type)}<strong>${amount}</strong>${text}</span>`;
}

function resourceCostListHtml(items = []) {
  return items
    .filter((item) => item && item.value !== undefined && item.value !== null && item.value !== "")
    .map((item) => resourceAmountHtml(item.type, item.value, item.label || ""))
    .join("");
}

let audioContext;
let autoCollectTimer;
let zenAmbient;
const API_BASE = (window.GREEN_FARM_API_URL || "").replace(/\/$/, "");
const CLIENT_ID = getClientId();
let backendState = {
  available: false,
  status: "Local",
  syncing: false,
  hydrated: false,
  lastSyncAt: 0,
  lastSnapshot: "",
  playerId: null,
  rank: null,
  leaderboard: []
};
const loadingState = {
  progress: 0,
  hidden: false,
  startedAt: Date.now()
};

function settingPercent(value, fallback = 70) {
  const number = Number(value);
  return clamp(Number.isFinite(number) ? number : fallback, 0, 100);
}

function triggerHaptic(type = "tap") {
  if (!state.vibrationOn) return;
  const level = settingPercent(state.vibrationLevel, 60);
  if (level <= 0) return;
  const style = level >= 75 || type === "stars" || type === "collect" ? "heavy" : level >= 40 ? "medium" : "light";
  try {
    tg?.HapticFeedback?.impactOccurred(style);
  } catch {}
  try {
    navigator.vibrate?.(style === "heavy" ? 34 : style === "medium" ? 22 : 12);
  } catch {}
}

function playTone(type = "tap") {
  triggerHaptic(type);
  const volume = settingPercent(state.soundVolume, 70) / 100;
  if (!state.soundOn || volume <= 0) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") audioContext.resume();

    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const presets = {
      grow: [220, 360, 0.16, "sine"],
      boost: [420, 720, 0.12, "triangle"],
      collect: [520, 880, 0.18, "sine"],
      stars: [620, 980, 0.14, "triangle"],
      lab: [180, 540, 0.22, "sawtooth"],
      zen: [174, 261, 0.7, "sine"],
      nav: [260, 330, 0.08, "sine"],
      tap: [260, 340, 0.08, "sine"]
    };
    const [startFreq, endFreq, duration, wave] = presets[type] || presets.tap;

    osc.type = wave;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(type === "zen" ? 620 : 1200, now);
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime((type === "zen" ? 0.055 : 0.075) * volume, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  } catch {
    state.soundOn = false;
  }
}

function createNoiseSource(context) {
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * 0.28;
  }
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

function playZenBreathCue() {
  if (!state.soundOn || !audioContext || !zenAmbient) return;
  const now = audioContext.currentTime;
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  const notes = [261.63, 392, 523.25];

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(920, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.026 * (settingPercent(state.soundVolume, 70) / 100), now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
  filter.connect(gain);
  gain.connect(zenAmbient.master);

  notes.forEach((note, index) => {
    const osc = audioContext.createOscillator();
    osc.type = index === 1 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(note / (index === 0 ? 2 : 1), now + index * 0.08);
    osc.connect(filter);
    osc.start(now + index * 0.08);
    osc.stop(now + 2.9);
  });
}

function startZenAmbient() {
  if (!state.soundOn || zenAmbient) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") audioContext.resume();

    const now = audioContext.currentTime;
    const preset = ZEN_SOUND_PRESETS[normalizeZenSound(state.zenSound)] || ZEN_SOUND_PRESETS.deep;
    const volume = settingPercent(state.soundVolume, 70) / 100;
    const master = audioContext.createGain();
    const droneFilter = audioContext.createBiquadFilter();
    const airFilter = audioContext.createBiquadFilter();
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    const droneA = audioContext.createOscillator();
    const droneB = audioContext.createOscillator();
    const shimmer = audioContext.createOscillator();
    const droneGain = audioContext.createGain();
    const airGain = audioContext.createGain();
    const noise = createNoiseSource(audioContext);

    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(Math.max(0.0001, preset.master * volume), now + 1.8);
    master.connect(audioContext.destination);

    droneFilter.type = "lowpass";
    droneFilter.frequency.setValueAtTime(preset.filter, now);
    droneFilter.Q.setValueAtTime(0.8, now);

    lfo.type = "sine";
    lfo.frequency.setValueAtTime(preset.lfo, now);
    lfoGain.gain.setValueAtTime(preset.lfoGain, now);
    lfo.connect(lfoGain);
    lfoGain.connect(droneFilter.frequency);

    droneA.type = "sine";
    droneB.type = "sine";
    shimmer.type = "triangle";
    droneA.frequency.setValueAtTime(preset.a, now);
    droneB.frequency.setValueAtTime(preset.b, now);
    shimmer.frequency.setValueAtTime(preset.shimmer, now);

    droneGain.gain.setValueAtTime(0.18, now);
    droneA.connect(droneGain);
    droneB.connect(droneGain);
    shimmer.connect(droneGain);
    droneGain.connect(droneFilter);
    droneFilter.connect(master);

    airFilter.type = "bandpass";
    airFilter.frequency.setValueAtTime(preset.air, now);
    airFilter.Q.setValueAtTime(0.32, now);
    airGain.gain.setValueAtTime(preset.airGain * volume, now);
    noise.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(master);

    [droneA, droneB, shimmer, lfo, noise].forEach((node) => node.start(now));

    zenAmbient = {
      master,
      nodes: [droneA, droneB, shimmer, lfo, noise],
      cueTimer: window.setInterval(playZenBreathCue, 12_000)
    };
    playZenBreathCue();
  } catch {
    state.soundOn = false;
    zenAmbient = null;
  }
}

function stopZenAmbient(fadeSeconds = 1.2) {
  if (!zenAmbient || !audioContext) return;
  const ambient = zenAmbient;
  zenAmbient = null;
  window.clearInterval(ambient.cueTimer);
  const now = audioContext.currentTime;
  ambient.master.gain.cancelScheduledValues(now);
  ambient.master.gain.setValueAtTime(Math.max(ambient.master.gain.value, 0.0001), now);
  ambient.master.gain.exponentialRampToValueAtTime(0.0001, now + fadeSeconds);
  window.setTimeout(() => {
    ambient.nodes.forEach((node) => {
      try {
        node.stop();
      } catch {}
    });
    try {
      ambient.master.disconnect();
    } catch {}
  }, fadeSeconds * 1000 + 80);
}

function loadState() {
  const saved = localStorage.getItem("green-farm-mvp");
  const user = tg?.initDataUnsafe?.user;
  const playerName = user?.first_name;
  if (!saved) return createInitialState({ playerName });

  try {
    return normalizeState(JSON.parse(saved), { playerName });
  } catch {
    return createInitialState({ playerName });
  }
}

function saveState() {
  localStorage.setItem("green-farm-mvp", JSON.stringify(state));
}

function ensureFarmModel() {
  state.inventory = normalizeInventory(state.inventory);
  state.unlockedSlots = normalizeUnlockedSlots(state.unlockedSlots);
  state.farmSlots = normalizeFarmSlots(state.farmSlots, state);
  state.capsuleSlots = normalizeCapsuleSlots(state.capsuleSlots);
  state.farmSlots.forEach((slot) => {
    if (slot?.strain && !slot.plantedAt) {
      slot.strain = null;
      slot.plantedAt = 0;
      slot.boostUntil = 0;
      slot.readyNotified = false;
    }
  });
  state.activeSlot = clamp(Math.floor(Number(state.activeSlot) || 0), 0, FARM_SLOT_COUNT - 1);
  if (!isSlotUnlocked(state.activeSlot)) state.activeSlot = 0;
}

function createCapsuleSlot(id) {
  return {
    id,
    strain: null,
    plantedAt: 0,
    growthDuration: GROW_DURATION_MS,
    plantVariant: 0,
    boostUntil: 0,
    readyNotified: false
  };
}

function normalizeCapsuleSlots(value = state.capsuleSlots) {
  const source = value && typeof value === "object" ? value : {};
  const next = {};
  for (let capsuleIndex = 1; capsuleIndex < DONOR_CAPSULE_COUNT; capsuleIndex += 1) {
    const rawSlots = Array.isArray(source[String(capsuleIndex)]) ? source[String(capsuleIndex)] : [];
    next[String(capsuleIndex)] = Array.from({ length: FARM_SLOT_COUNT }, (_, index) => {
      const raw = rawSlots[index] && typeof rawSlots[index] === "object" ? rawSlots[index] : {};
      const slot = {
        ...createCapsuleSlot(index),
        ...raw,
        id: index,
        plantedAt: Math.max(0, Number(raw.plantedAt) || 0),
        growthDuration: Math.max(9_000, Number(raw.growthDuration) || GROW_DURATION_MS),
        plantVariant: Math.max(0, Math.floor(Number(raw.plantVariant) || 0)),
        boostUntil: Math.max(0, Number(raw.boostUntil) || 0),
        readyNotified: Boolean(raw.readyNotified)
      };
      if (slot.strain && !slot.plantedAt) slot.strain = null;
      return slot;
    });
  }
  return next;
}

function farmSlotAt(index) {
  ensureFarmModel();
  return state.farmSlots[index] || state.farmSlots[0];
}

function activeFarmSlot() {
  return farmSlotAt(state.activeSlot);
}

function farmSlotProgress(slot) {
  return farmCore.slotProgress(slot);
}

function farmSlotReady(slot) {
  return farmCore.slotReady(slot);
}

function readyFarmSlots() {
  ensureFarmModel();
  return state.farmSlots
    .filter((slot, index) => isSlotUnlocked(index) && farmSlotReady(slot));
}

function syncLegacyFarmFromActiveSlot() {
  ensureFarmModel();
  const slot = activeFarmSlot();
  if (slot?.strain) {
    state.plantedAt = slot.plantedAt;
    state.growthDuration = slot.growthDuration;
    state.plantVariant = slot.plantVariant;
    state.boostUntil = slot.boostUntil;
    return;
  }

  state.plantedAt = 0;
  state.growth = 0;
  state.growthDuration = GROW_DURATION_MS;
  state.boostUntil = 0;
}

function isSlotUnlocked(index) {
  return Boolean(normalizeUnlockedSlots()[String(index)]);
}

function isCapsuleSlotUnlocked(capsuleIndex, slotIndex) {
  if (capsuleIndex === 0) return isSlotUnlocked(slotIndex) && slotIndex < FARM_SLOT_COUNT;
  if (capsuleIndex === 1) return slotIndex === 0;
  return false;
}

function firstCapsuleUnlockMeta(index) {
  return CAPSULE_SLOT_UNLOCKS[index] || null;
}

function unlockSlot(index) {
  state.unlockedSlots = normalizeUnlockedSlots();
  state.unlockedSlots[String(index)] = true;
}

function farmStrainChoices() {
  return capsuleStrainChoices(activeDonorCapsule);
}

function capsuleStrainChoices(capsuleIndex = activeDonorCapsule) {
  if (capsuleIndex !== 1) return FARM_STRAINS;
  const inventory = normalizeInventory(state.inventory);
  return FLOWER_STRAINS.filter((strain) => {
    if (!strain.requiresInventory) return true;
    const key = strain.inventoryKey || strain.id;
    return Math.max(0, Math.floor(Number(inventory.strains[key]) || 0)) > 0;
  });
}

function capsuleStrainById(strainId, capsuleIndex = activeDonorCapsule) {
  return capsuleStrainChoices(capsuleIndex).find((strain) => strain.id === strainId) || farmStrainById(strainId);
}

function defaultCapsuleStrainForSlot(slotIndex, capsuleIndex = activeDonorCapsule) {
  if (capsuleIndex === 1) return FLOWER_STRAINS[clamp(slotIndex, 0, FLOWER_STRAINS.length - 1)]?.id || FLOWER_STRAINS[0]?.id || null;
  return defaultFarmStrainForSlot(slotIndex);
}

function capsuleSlotAt(slotIndex, capsuleIndex = activeDonorCapsule) {
  ensureFarmModel();
  if (capsuleIndex === 0) return farmSlotAt(slotIndex);
  const slots = state.capsuleSlots?.[String(capsuleIndex)] || [];
  return slots[slotIndex] || slots[0] || createCapsuleSlot(slotIndex);
}

function selectedPlantingStrain() {
  return capsuleStrainById(farmPlantingStrain) || farmStrainChoices()[0] || null;
}

function donorPlantCostLabel(strain) {
  if (!strain) return "--";
  if (strain.requiresInventory) return "1 unique flower";
  if (strain.plantCostMain) return `${Math.max(0, Math.floor(Number(strain.plantCostMain) || 0))}`;
  if (strain.plantCostResonance) return `${strain.plantCostResonance} ZEN`;
  return `${Math.max(0, Math.floor(Number(strain.plantCostScore) || 0))} CRC`;
}

function donorPlantCostHtml(strain) {
  if (!strain) return "--";
  if (strain.requiresInventory) return `<span class="resource-amount"><span class="inline-resource-icon icon-seed">✿</span><b>1</b></span>`;
  if (strain.plantCostMain) return resourceAmountHtml("main", Number(strain.plantCostMain) || 0);
  if (strain.plantCostResonance) return resourceAmountHtml("zen", Number(strain.plantCostResonance) || 0);
  return resourceAmountHtml("crc", Number(strain.plantCostScore) || 0);
}

function strainLabMaterialLabel(strain) {
  const material = strain?.labMaterial;
  if (!material?.short) return "No lab input";
  return `${material.short} +${Math.max(1, Math.floor(Number(material.amount) || 1))}`;
}

function canAffordPlant(strain) {
  return plantAffordanceFor(strain).ok;
}

function plantAffordanceFor(strain) {
  return farmCore.plantAffordance(strain, {
    score: state.score,
    energy: state.energy,
    resonance: state.resonance,
    inventory: normalizeInventory(state.inventory)
  });
}

function spendPlantCostFor(strain) {
  const spent = farmCore.spendPlantCost(strain, {
    score: state.score,
    energy: state.energy,
    resonance: state.resonance,
    inventory: normalizeInventory(state.inventory)
  });
  state.score = spent.score;
  state.energy = spent.energy;
  state.resonance = spent.resonance;
  state.inventory = normalizeInventory(spent.inventory);
  return spent.cost;
}

function plantBlockedCostLabel(reason, strain) {
  if (reason === "main") return `${strain.plantCostMain}`;
  if (reason === "crc") return `${strain.plantCostScore} CRC`;
  if (reason === "resonance") return `${strain.plantCostResonance} ZEN`;
  return donorPlantCostLabel(strain);
}

function donorPlantStatus(slot, strain) {
  if (!strain) return "Choose plant";
  if (farmSlotReady(slot)) return "Harvest ready";
  return "Growing";
}

function donorIconKey(strainId = "") {
  return ({
    neon_basil: "basil",
    cyber_rukola: "rukola",
    glitch_sunflower: "sunflower",
    pixel_wheat: "wheat",
    prime_spirulina: "spirulina",
    chroma_mint: "chroma",
    lumen_daisy: "flowerDaisy",
    neon_orchid: "flowerOrchid",
    prism_tulip: "flowerTulip",
    quantum_rose: "flowerRose"
  })[strainId] || "basil";
}

function donorPlantIcon(strain, size = 44) {
  if (!strain) return "";
  const icon = DONOR_ICONS[strain.iconKey] || DONOR_ICONS[donorIconKey(strain.id)] || DONOR_ICONS.basil;
  return icon(strain.color || "var(--green)", size);
}

function donorProgressLabel(slot) {
  if (!slot?.strain) return "empty";
  if (farmSlotReady(slot)) return "ready";
  return formatTime(Math.max(0, slot.growthDuration - (Date.now() - slot.plantedAt)));
}

function normalizeFarmEventState(value = state.farmEvent) {
  const farmEvent = value && typeof value === "object" ? value : {};
  return {
    startedAt: Math.max(0, Number(farmEvent.startedAt) || Date.now()),
    durationMs: 7 * 60 * 60 * 1000,
    stepMs: 60 * 60 * 1000,
    claimedSteps: Array.isArray(farmEvent.claimedSteps)
      ? farmEvent.claimedSteps
        .map((step) => clamp(Math.floor(Number(step) || 0), 0, FARM_EVENT_REWARDS.length - 1))
        .filter((step, index, list) => list.indexOf(step) === index)
      : []
  };
}

function farmEventSnapshot() {
  state.farmEvent = normalizeFarmEventState(state.farmEvent);
  const now = Date.now();
  const elapsed = Math.max(0, now - state.farmEvent.startedAt);
  const unlockedCount = Math.min(FARM_EVENT_REWARDS.length, 1 + Math.floor(elapsed / state.farmEvent.stepMs));
  const remainingMs = Math.max(0, state.farmEvent.startedAt + state.farmEvent.durationMs - now);
  const claimed = new Set(state.farmEvent.claimedSteps);
  const nextClaimIndex = FARM_EVENT_REWARDS.findIndex((_, index) => index < unlockedCount && !claimed.has(index));
  const nextUnlockMs = remainingMs <= 0
    ? 0
    : Math.max(0, state.farmEvent.stepMs - (elapsed % state.farmEvent.stepMs || state.farmEvent.stepMs));

  return {
    unlockedCount,
    remainingMs,
    nextUnlockMs,
    claimed,
    nextClaimIndex,
    complete: claimed.size >= FARM_EVENT_REWARDS.length,
    expired: remainingMs <= 0
  };
}

function farmEventPrimaryLabel(snapshot = farmEventSnapshot()) {
  if (snapshot.complete) return "All claimed";
  if (snapshot.nextClaimIndex >= 0) return `Claim H${snapshot.nextClaimIndex + 1}`;
  if (snapshot.expired) return "Event closed";
  return `Next in ${formatTime(snapshot.nextUnlockMs)}`;
}

function renderFarmEventDock() {
  const dock = $("#farmEventDock");
  if (!dock) return;

  const snapshot = farmEventSnapshot();
  dock.innerHTML = `
    <div class="farm-event-head">
      <span class="farm-event-tag">7H event</span>
      <b class="farm-event-time">${snapshot.expired ? "Closed" : formatTime(snapshot.remainingMs)}</b>
    </div>
    <div class="farm-event-strip" aria-label="Farm event rewards">
      ${FARM_EVENT_REWARDS.map((reward, index) => {
        const claimed = snapshot.claimed.has(index);
        const unlocked = index < snapshot.unlockedCount;
        const active = snapshot.nextClaimIndex === index;
        return `
          <button
            class="farm-event-card ${claimed ? "claimed" : ""} ${unlocked ? "unlocked" : "locked"} ${active ? "active" : ""} accent-${reward.accent}"
            type="button"
            data-farm-event-step="${index}"
            ${unlocked && !claimed ? "" : "disabled"}
            aria-label="Hour ${index + 1} ${reward.label} ${reward.value}"
          >
            <span class="farm-event-icon">${claimed ? "✓" : reward.icon}</span>
            <span class="farm-event-day">H${index + 1}</span>
          </button>
        `;
      }).join("")}
    </div>
    <div class="farm-event-foot">
      <span class="farm-event-note">${snapshot.claimed.size}/${FARM_EVENT_REWARDS.length} claimed</span>
      <button class="farm-event-claim" id="farmEventClaimBtn" type="button" ${snapshot.nextClaimIndex < 0 || snapshot.complete ? "disabled" : ""}>
        ${farmEventPrimaryLabel(snapshot)}
      </button>
    </div>
  `;
}

function farmEventDisplay(reward, index) {
  const displayValue = [
    "+60",
    "100",
    "x2",
    "200",
    "x1",
    "x3",
    "?"
  ][index] || reward.value;

  const displayLabel = [
    "CRC",
    "Core",
    "Zen",
    "Core",
    "SE",
    "Genes",
    "Cache"
  ][index] || reward.label;

  return {
    value: displayValue,
    label: displayLabel,
    dayLabel: `DAY ${index + 1}`
  };
}

function farmEventGlyphMarkup(reward) {
  return `
    <span class="farm-event-glyph glyph-${reward.accent}" aria-hidden="true">
      <i>${reward.accent === "crc" ? "C" : reward.accent === "gene" ? "DNA" : ""}</i>
    </span>
  `;
}

function renderFarmEventDockV2() {
  const dock = $("#farmEventDock");
  if (!dock) return;

  const snapshot = farmEventSnapshot();
  dock.innerHTML = `
    <div class="farm-event-strip farm-event-strip-v2" aria-label="Farm event rewards">
      ${FARM_EVENT_REWARDS.map((reward, index) => {
        const claimed = snapshot.claimed.has(index);
        const unlocked = index < snapshot.unlockedCount;
        const active = snapshot.nextClaimIndex === index;
        const display = farmEventDisplay(reward, index);
        const stateLabel = claimed
          ? "Done"
          : unlocked
            ? (active ? "Claim" : "Ready")
            : snapshot.expired
              ? "Closed"
              : `${index + 1}h`;

        return `
          <button
            class="farm-event-card ${claimed ? "claimed" : ""} ${unlocked ? "unlocked" : "locked"} ${active ? "active" : ""} accent-${reward.accent}"
            type="button"
            data-farm-event-step="${index}"
            ${unlocked && !claimed ? "" : "disabled"}
            aria-label="${display.dayLabel} ${display.label} ${display.value}"
            title="${display.dayLabel} ${display.label} ${display.value}"
          >
            <span class="farm-event-status">${stateLabel}</span>
            <span class="farm-event-visual">
              ${farmEventGlyphMarkup(reward)}
              <strong class="farm-event-value">${claimed ? "OK" : display.value}</strong>
            </span>
            <span class="farm-event-day">${display.dayLabel}</span>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function applyFarmEventMystery() {
  const roll = Math.random();
  if (roll < 0.34) {
    state.score += 320;
    toast("Mystery cache +320");
    return;
  }
  if (roll < 0.67) {
    state.energy += 90;
    toast("Mystery CRC +90");
    return;
  }
  state.seed += 1;
  state.inventory = normalizeInventory(state.inventory);
  state.inventory.geneStrands += 2;
  toast("Mystery SE + genes");
}

function claimFarmEventReward(index = farmEventSnapshot().nextClaimIndex) {
  const snapshot = farmEventSnapshot();
  const rewardIndex = clamp(Math.floor(Number(index) || 0), 0, FARM_EVENT_REWARDS.length - 1);
  if (rewardIndex >= snapshot.unlockedCount || snapshot.claimed.has(rewardIndex)) {
    toast(snapshot.complete ? "Event already claimed" : "Reward not ready");
    return;
  }
  const reward = FARM_EVENT_REWARDS[rewardIndex];
  reward.apply();
  state.farmEvent.claimedSteps = [...snapshot.claimed, rewardIndex];
  playTone("collect");
  if (reward.id !== "mystery_7") {
    toast(`${reward.label} ${reward.value}`);
  }
  render();
}

function farmPassDayKey(time = Date.now()) {
  return economyCore.farmPassDayKey(time);
}

function normalizeFarmPass(value = state.farmPass) {
  return economyCore.normalizeFarmPass(value, FARM_PASS_DAYS);
}

function farmPassSnapshot() {
  const snapshot = economyCore.farmPassSnapshot(state.farmPass);
  state.farmPass = snapshot.pass;
  return snapshot;
}

function grantFarmPassUniqueFlower() {
  state.inventory = normalizeInventory(state.inventory);
  state.inventory.strains[FARM_PASS_UNIQUE_FLOWER_ID] = Math.max(
    0,
    Math.floor(Number(state.inventory.strains[FARM_PASS_UNIQUE_FLOWER_ID]) || 0)
  ) + 1;
  state.farmPass = normalizeFarmPass(state.farmPass);
  state.farmPass.uniqueFlowerClaimed = true;
}

function activateFarmPass(product = {}) {
  const reward = product.reward || {};
  const days = Math.max(1, Math.floor(Number(reward.farmPassDays) || FARM_PASS_DAYS));
  const now = Date.now();
  state.farmPass = normalizeFarmPass(state.farmPass);
  const baseUntil = Math.max(now, state.farmPass.activeUntil);
  state.farmPass.activeUntil = baseUntil + days * 86_400_000;
  state.farmPass.purchasedAt = state.farmPass.purchasedAt || now;
  grantFarmPassUniqueFlower();
  playTone("stars");
  toast(`30-day pass active / unique flower +1`);
  trackAction("farm_pass_activated", {
    days,
    dailyCrc: FARM_PASS_DAILY_CRC,
    dailySe: FARM_PASS_DAILY_SE,
    uniqueFlower: FARM_PASS_UNIQUE_FLOWER_ID
  });
  render();
  scheduleBackendSync(true);
}

function claimFarmPassDaily() {
  const snapshot = farmPassSnapshot();
  if (!snapshot.active) {
    toast("Pass inactive");
    return false;
  }
  if (snapshot.claimedToday) {
    toast("Pass already claimed today");
    return false;
  }
  state.energy += FARM_PASS_DAILY_CRC;
  state.seed += FARM_PASS_DAILY_SE;
  state.farmPass.claimedDays = [...state.farmPass.claimedDays, snapshot.today].slice(-FARM_PASS_DAYS);
  playTone("collect");
  toast(`Pass +${FARM_PASS_DAILY_CRC} CRC / +${FARM_PASS_DAILY_SE} SE`);
  trackAction("farm_pass_daily_claimed", {
    day: snapshot.today,
    crc: FARM_PASS_DAILY_CRC,
    se: FARM_PASS_DAILY_SE,
    remainingDays: snapshot.remainingDays
  });
  render();
  scheduleBackendSync(true);
  return true;
}

function renderShopPass() {
  const snapshot = farmPassSnapshot();
  const status = snapshot.active
    ? `Active / ${snapshot.remainingDays}d left`
    : "Inactive";
  setText("#shopPassStatus", status);
  setText("#shopPassClaimState", snapshot.active ? `${snapshot.claimedCount}/${FARM_PASS_DAYS} claimed` : "Buy to unlock daily claim");
  setText("#shopPassBuyPrice", `★ ${FARM_PASS_PRICE_STARS}`);
  setText("#shopPassFlowerCount", `x${Math.max(0, Math.floor(Number(normalizeInventory(state.inventory).strains[FARM_PASS_UNIQUE_FLOWER_ID]) || 0))}`);
  const claim = $("#shopPassClaimBtn");
  if (claim) {
    claim.disabled = !snapshot.active || snapshot.claimedToday;
    claim.textContent = !snapshot.active
      ? "Inactive"
      : snapshot.claimedToday
        ? "Claimed"
        : `Claim +${FARM_PASS_DAILY_CRC} CRC +${FARM_PASS_DAILY_SE} SE`;
  }
  const card = $("#shopPassCard");
  if (card) {
    card.classList.toggle("active", snapshot.active);
    card.classList.toggle("claim-ready", snapshot.active && !snapshot.claimedToday);
  }
}

function dailyMissionItems() {
  const totalHarvests = Object.values(normalizeInventory(state.inventory).harvests || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
  return [
    {
      txt: "Collect 3 harvests",
      prog: Math.min(3, totalHarvests),
      max: 3,
      rew: "100 CRC"
    },
    {
      txt: "Create 1 mutation",
      prog: Math.min(1, Math.floor(Number(state.artifact) || 0)),
      max: 1,
      rew: "200 CRC"
    },
    {
      txt: "Meditate once",
      prog: Math.min(1, Math.floor(Number(state.sessions) || 0)),
      max: 1,
      rew: "1 ZEN"
    }
  ];
}

function dailyMissionProgressSnapshot() {
  const missions = dailyMissionItems();
  return {
    missions,
    done: missions.filter((mission) => mission.prog >= mission.max).length,
    total: missions.length
  };
}

function renderDonorMissionList() {
  const list = $("#donorMissionsList");
  if (!list) return;

  const { missions, done, total } = dailyMissionProgressSnapshot();
  setText("#dailyMissionHudCount", `${done}/${total}`);
  setText("#dailyCubeCount", `${done}/${total}`);

  list.innerHTML = missions.map((mission) => {
    const done = mission.prog >= mission.max;
    const pct = Math.min(100, (mission.prog / Math.max(1, mission.max)) * 100);
    return `
      <div class="miss">
        <div class="miss-r">
          <span class="miss-t">${done ? "OK " : ""}${escapeHtml(mission.txt)}</span>
          <span class="miss-v" style="${done ? "color:var(--green)" : ""}">${done ? "DONE" : escapeHtml(mission.rew)}</span>
        </div>
        <div class="miss-b"><div class="miss-f" style="width:${pct}%"></div></div>
        <div class="miss-s">${mission.prog} / ${mission.max}</div>
      </div>
    `;
  }).join("");
}

function renderDonorFarm() {
  const grid = $("#farm-grid");
  if (!grid) return;

  ensureFarmModel();
  activeDonorCapsule = clamp(Math.floor(Number(activeDonorCapsule) || 0), 0, DONOR_CAPSULE_COUNT - 1);
  const capsuleType = DONOR_CAPSULE_TYPES[activeDonorCapsule] || DONOR_CAPSULE_TYPES[0];
  setText("#donorCapsuleMark", `Capsule ${(activeDonorCapsule + 1).toString().padStart(2, "0")} · ${capsuleType.name}`);
  const capsuleEmblem = $("#donorCapsuleEmblem");
  if (capsuleEmblem) {
    capsuleEmblem.className = `donor-capsule-emblem capsule-type-${activeDonorCapsule + 1}`;
    capsuleEmblem.innerHTML = capsuleType.icon;
  }
  const dots = $("#donorCapsuleDots");
  if (dots) {
    dots.innerHTML = Array.from({ length: DONOR_CAPSULE_COUNT }, (_, index) => (
      `<span class="${index === activeDonorCapsule ? "active" : ""}"></span>`
    )).join("");
  }

  if (activeDonorCapsule > 1) {
    grid.innerHTML = Array.from({ length: FARM_SLOT_COUNT }, (_, index) => `
      <button class="slot locked donor-future-slot" type="button" data-donor-slot="${index}" data-slot-state="future">
        <div class="empty-body">
          <span class="empty-ic">+</span>
          <span class="empty-lb">CAPSULE ${activeDonorCapsule + 1}<br>SOON</span>
        </div>
      </button>
    `).join("");
    renderDonorMissionList();
    return;
  }

  const capsuleIndex = activeDonorCapsule;
  const slots = Array.from({ length: FARM_SLOT_COUNT }, (_, index) => ({ slot: capsuleSlotAt(index, capsuleIndex), index }));
  grid.innerHTML = slots.map(({ slot, index }) => {
    const unlocked = isCapsuleSlotUnlocked(capsuleIndex, index);
    const isPaidSlot = capsuleIndex === 0 && index === 3 && !unlocked;
    if (!unlocked) {
      return renderLockedDonorSlot(index, capsuleIndex);
      const labelTop = isPaidSlot ? "UNLOCK" : "LOCKED";
      const labelBottom = isPaidSlot ? "10 STARS" : "SOON";
      return `
        <button class="slot locked" type="button" data-donor-slot="${index}" data-slot-state="${isPaidSlot ? "paid" : "locked"}">
          <div class="empty-body">
            <span class="empty-ic">${isPaidSlot ? "★" : "◌"}</span>
            <span class="empty-lb">${labelTop}<br>${labelBottom}</span>
          </div>
        </button>
      `;
    }

    if (!slot?.strain) {
      return `
        <button class="slot empty" type="button" data-donor-slot="${index}" data-slot-state="empty">
          <div class="empty-body">
            <span class="empty-ic">+</span>
            <span class="empty-lb">TAP TO<br>PLANT</span>
          </div>
        </button>
      `;
    }

    const strain = capsuleStrainById(slot.strain, capsuleIndex) || capsuleStrainChoices(capsuleIndex)[0];
    const ready = farmSlotReady(slot);
    const pct = farmSlotProgress(slot);
    const dashOffset = Math.round(DONOR_RING_CIRCUMFERENCE * (1 - pct / 100));
    const iconKey = strain.iconKey || donorIconKey(strain.id);
    const iconSize = iconKey === "sunflower" || iconKey === "wheat" || iconKey === "spirulina" || iconKey === "flowerRose" ? 52 : iconKey === "chroma" || iconKey === "flowerOrchid" || iconKey === "flowerTulip" ? 48 : 44;
    const ringId = `donor-ring-${capsuleIndex}-${index}`;
    return `
      <button class="slot ${ready ? "ready" : "growing"}" type="button" data-donor-slot="${index}" data-slot-state="${ready ? "ready" : "growing"}" style="--sc:${escapeHtml(strain.color || "#00D870")}">
        <div class="slot-line"></div>
        <div class="slot-vis">
          <div class="ring-wrap">
            <svg class="ring-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="${ringId}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="var(--cyan)"/>
                  <stop offset="100%" stop-color="${escapeHtml(strain.color || "#00D870")}"/>
                </linearGradient>
              </defs>
              <circle class="ring-track" cx="48" cy="48" r="40"></circle>
              <circle class="ring-glow-line" cx="48" cy="48" r="40" stroke="${ready ? escapeHtml(strain.color || "#00D870") : `url(#${ringId})`}" style="stroke-dashoffset:${ready ? 0 : dashOffset}"></circle>
              <circle class="ring-fill" cx="48" cy="48" r="40" stroke="${ready ? escapeHtml(strain.color || "#00D870") : `url(#${ringId})`}" style="stroke-dashoffset:${ready ? 0 : dashOffset}"></circle>
            </svg>
            <div class="plant-icon-wrap">${donorPlantIcon(strain, iconSize)}</div>
          </div>
        </div>
        <div class="slot-prog"><div class="slot-prog-f" style="width:${pct}%"></div></div>
        <div class="slot-meta">
          ${ready
            ? `<span class="s-rdy" aria-label="Ready">◆</span><span class="s-earn" style="color:${escapeHtml(strain.color || "#00D870")};text-shadow:0 0 8px ${escapeHtml(`${strain.color || "#00D870"}60`)}">+${strain.score}</span>`
            : `<span class="s-timer">${escapeHtml(donorProgressLabel(slot))}</span>`}
        </div>
      </button>
    `;
  }).join("");

  renderDonorMissionList();
}

function renderLockedDonorSlot(index, capsuleIndex) {
  const unlockMeta = capsuleIndex === 0 ? firstCapsuleUnlockMeta(index) : null;
  const isBuyableSlot = Boolean(unlockMeta);
  const labelTop = unlockMeta?.title || "LOCKED";
  const labelBottom = unlockMeta?.cost || "SOON";
  const bonus = unlockMeta?.bonus || "";
  return `
    <button class="slot locked ${isBuyableSlot ? `premium-locked ${unlockMeta.className}` : ""}" type="button" data-donor-slot="${index}" data-slot-state="${unlockMeta?.state || "locked"}" ${unlockMeta?.productId ? `data-product-id="${unlockMeta.productId}"` : ""}>
      <div class="empty-body">
        <span class="empty-ic">${unlockMeta?.icon || "LOCK"}</span>
        <span class="empty-lb">${labelTop}<br>${labelBottom}</span>
        ${bonus ? `<span class="slot-unlock-bonus">${bonus}</span>` : ""}
      </div>
    </button>
  `;
}

function setDonorCapsule(index) {
  const rawIndex = Math.floor(Number(index) || 0);
  const nextIndex = ((rawIndex % DONOR_CAPSULE_COUNT) + DONOR_CAPSULE_COUNT) % DONOR_CAPSULE_COUNT;
  if (nextIndex === activeDonorCapsule) return;
  activeDonorCapsule = nextIndex;
  playTone("tap");
  renderDonorFarm();
}

function closeDonorPlantModal() {
  const modal = $("#donorFarmModal");
  if (!modal) return;
  modal.hidden = true;
}

function isPlantDoubleTap(source, strainId) {
  const now = Date.now();
  const isDouble = plantDoubleTap.source === source
    && plantDoubleTap.strain === strainId
    && now - plantDoubleTap.at <= 420;
  plantDoubleTap = { source, strain: strainId, at: now };
  return isDouble;
}

function renderDonorPlantModal() {
  const grid = $("#seed-grid");
  const selected = selectedPlantingStrain();
  const slotNumber = Math.max(1, (farmPlantingSlot ?? state.activeSlot) + 1);
  if (!grid || !selected) return;

  setText("#modal-sn", slotNumber);
  setText("#farmPlantSelectionMeta", `${selected.type} / ${Math.round(selected.durationMs / 60_000)}m grow`);
  setHTML("#farmPlantSelectionBonus", `Gives ${resourceAmountHtml("main", selected.score)} ${resourceAmountHtml("gs", selected.geneStrands)} <span class="resource-note">${escapeHtml(strainLabMaterialLabel(selected))}</span>`);

  grid.innerHTML = farmStrainChoices().map((strain) => {
    const active = strain.id === selected.id;
    const color = strain.color || "#00D870";
    const iconSize = donorIconKey(strain.id) === "sunflower" || donorIconKey(strain.id) === "wheat" || donorIconKey(strain.id) === "spirulina" ? 46 : donorIconKey(strain.id) === "chroma" ? 44 : 40;
    return `
      <button class="sb ${active ? "sel" : ""}" type="button" data-donor-strain="${strain.id}" aria-pressed="${active ? "true" : "false"}" style="--strain-color:${escapeHtml(color)}">
        <span class="sb-type">${escapeHtml(strain.type)}</span>
        <div class="sb-em-wrap">${donorPlantIcon(strain, iconSize)}</div>
        <div class="sb-nm">${escapeHtml(strain.name)}</div>
        <div class="sb-meta">
          <span>${Math.round(strain.durationMs / 60_000)}m</span>
          <span>${escapeHtml(strainLabMaterialLabel(strain))}</span>
        </div>
        <div class="sb-bc">${donorPlantCostHtml(strain)}</div>
      </button>
    `;
  }).join("");

  const confirm = $("#donorFarmConfirmBtn");
  if (confirm) {
    const afford = canAffordPlant(selected);
    confirm.disabled = !afford;
    confirm.textContent = afford ? "Plant" : `Need ${donorPlantCostLabel(selected)}`;
  }
}

function donorBoostGrid() {
  ensureFarmModel();
  const growing = state.farmSlots.filter((slot, index) => isSlotUnlocked(index) && slot?.strain && !farmSlotReady(slot));
  if (!growing.length) {
    toast("No active grow");
    return;
  }
  if (state.resonance < 1) {
    toast("Need 1 ZEN");
    return;
  }

  state.resonance -= 1;
  growing.forEach((slot) => {
    slot.plantedAt -= 5 * 60_000;
    slot.boostUntil = Date.now() + 2_800;
  });
  syncLegacyFarmFromActiveSlot();
  playTone("boost");
  toast("Boost -5m");
  trackAction("farm_donor_boost_all", {
    slots: growing.length,
    spentResonance: 1,
    boostMs: 5 * 60_000
  });
  render();
}

async function donorAutoHarvest() {
  const ready = readyFarmSlots();
  if (!ready.length) {
    toast("No harvest ready");
    return;
  }
  let harvested = 0;
  for (const slot of ready) {
    try {
      const data = await collectHarvestServer(true, slot.id, { shouldRender: false, tone: false, toast: false });
      if (data?.player) harvested += 1;
    } catch (error) {
      toast(error.message || "Harvest failed");
      break;
    }
  }
  if (harvested) {
    playTone("collect");
    render();
  }
}

function donorBoostCapsule() {
  if (EXACT_DONOR_MODE) {
    donorBoostGrid();
    return;
  }
  ensureFarmModel();
  const slot = activeFarmSlot();
  if (!slot?.strain || farmSlotReady(slot)) {
    toast("No active grow");
    return;
  }
  if (state.resonance < 1) {
    toast("Need 1 ZEN");
    trackAction("farm_boost_blocked_no_resonance", {
      slot: state.activeSlot + 1
    });
    return;
  }

  state.resonance -= 1;
  slot.plantedAt -= 5 * 60_000;
  slot.boostUntil = Date.now() + 2_800;
  syncLegacyFarmFromActiveSlot();
  playTone("boost");
  toast("Boost -5m");
  trackAction("farm_slot_boosted_donor", {
    slot: state.activeSlot + 1,
    strain: slot.strain,
    spentResonance: 1,
    boostMs: 5 * 60_000
  });
  render();
}

function renderFarmPlantSheet() {
  if (EXACT_DONOR_MODE) {
    renderDonorPlantModal();
    return;
  }
  const grid = $("#farmStrainGrid");
  const slotNumber = Math.max(1, (farmPlantingSlot ?? state.activeSlot) + 1);
  const selected = selectedPlantingStrain();
  if (!grid || !selected) return;

  setText("#farmPlantSheetTitle", `Slot ${slotNumber}`);
  setText("#farmPlantSheetHint", canAffordPlant(selected) ? "Choose strain" : `Need ${donorPlantCostLabel(selected)}`);
  setText("#farmPlantSelectionName", selected.name);
  setText("#farmPlantSelectionMeta", `${selected.type} · ${Math.round(selected.durationMs / 60_000)}m grow · ${donorPlantCostLabel(selected)}`);
  setText("#farmPlantSelectionBonus", `Gives +${selected.score} · ${strainLabMaterialLabel(selected)} · +${selected.geneStrands} GS`);

  setText("#farmPlantSelectionMeta", `${selected.type} / ${Math.round(selected.durationMs / 60_000)}m grow`);
  setHTML("#farmPlantSelectionBonus", `Gives ${resourceAmountHtml("main", selected.score)} ${resourceAmountHtml("gs", selected.geneStrands)} <span class="resource-note">${escapeHtml(strainLabMaterialLabel(selected))}</span>`);

  grid.innerHTML = farmStrainChoices().map((strain) => {
    const active = strain.id === selected.id;
    return `
      <button class="farm-strain-card ${active ? "active" : ""}" type="button" data-farm-strain="${strain.id}" data-strain-type="${strain.type}" aria-pressed="${active ? "true" : "false"}">
        <div class="strain-top">
          <strong>${escapeHtml(strain.shortName)}</strong>
          <span class="strain-type">${escapeHtml(strain.type)}</span>
        </div>
        <span>${escapeHtml(strain.name)}</span>
        <small>${Math.round(strain.durationMs / 60_000)} min growth</small>
        <em>Harvest +${strain.score} · ${escapeHtml(strainLabMaterialLabel(strain))} · +${strain.geneStrands} GS</em>
        <b class="strain-cost">${donorPlantCostHtml(strain)}</b>
      </button>
    `;
  }).join("");

  const confirm = $("#farmPlantConfirmBtn");
  if (confirm) {
    const canAfford = canAffordPlant(selected);
    confirm.disabled = !canAfford;
    confirm.textContent = canAfford ? `Plant ${selected.shortName}` : `Need ${donorPlantCostLabel(selected)}`;
  }
}

function openFarmPlantSheet(index = state.activeSlot) {
  ensureFarmModel();
  const capsuleIndex = activeDonorCapsule;
  if (!isCapsuleSlotUnlocked(capsuleIndex, index)) {
    toast("Slot locked");
    return;
  }

  const slot = capsuleSlotAt(index, capsuleIndex);
  if (slot?.strain) return;
  if (capsuleIndex === 0) state.activeSlot = index;
  farmPlantingSlot = index;
  farmPlantingStrain = defaultCapsuleStrainForSlot(index, capsuleIndex);
  plantDoubleTap = { source: "", strain: "", at: 0 };
  if (!farmPlantingStrain) farmPlantingStrain = farmStrainChoices()[0]?.id || null;
  if (EXACT_DONOR_MODE) {
    const modal = $("#donorFarmModal");
    renderDonorPlantModal();
    if (modal) modal.hidden = false;
  }
  renderFarmPlantSheet();
  if (!EXACT_DONOR_MODE) openSheet("#farmPlantSheet");
  trackAction("farm_strain_picker_opened", {
    capsule: capsuleIndex + 1,
    slot: index + 1
  });
  render();
}

async function confirmFarmPlantSelection() {
  if (farmPlantingSlot === null) return;
  const capsuleIndex = activeDonorCapsule;
  try {
    let planted = true;
    if (capsuleIndex === 0) {
      await plantFarmSlotServer(farmPlantingSlot, farmPlantingStrain, { shouldRender: false });
    } else {
      planted = plantCapsuleSlot(farmPlantingSlot, farmPlantingStrain, capsuleIndex);
    }
    if (!planted) {
      renderFarmPlantSheet();
      return;
    }
  } catch (error) {
    toast(error.message || "Plant failed");
    renderFarmPlantSheet();
    return;
  }

  playTone("grow");
  closeDonorPlantModal();
  closeSheets();
  farmPlantingSlot = null;
  farmPlantingStrain = null;
  render();
}

function droneUpgradeCost(level = safeDroneLevel()) {
  return {
    score: 32 + level * 24,
    energy: 3 + level * 2
  };
}

function droneSpeedBonus(level = safeDroneLevel()) {
  return level * 1_150;
}

function droneHarvestBonus(level = safeDroneLevel()) {
  return level * 2;
}

function dataModuleUpgradeCost(level = safeDataModuleLevel()) {
  return {
    score: 44 + level * 26,
    resonance: 1 + level
  };
}

function dataModuleSignalBonus(level = safeDataModuleLevel()) {
  return level * 6;
}

function safeBiomass(value = state.biomass) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

function defaultLabRecipeId() {
  return Array.isArray(LAB_RECIPES) && LAB_RECIPES.length
    ? String(LAB_RECIPES[0]?.id || "starter_bio_fusion")
    : "starter_bio_fusion";
}

function labMaterialById(id) {
  return LAB_MATERIALS.find((material) => material.id === id) || null;
}

function labMaterialCount(id, inventory = normalizeInventory(state.inventory)) {
  return Math.max(0, Math.floor(Number(inventory.materials?.[id]) || 0));
}

function labActiveJob() {
  const job = state.labSynthesis && typeof state.labSynthesis === "object" ? state.labSynthesis : null;
  if (!job || job.claimed || !labRecipeById(job.recipeId)) {
    state.labSynthesis = null;
    return null;
  }
  return job;
}

function labRecipeDurationMs(recipe = labRecipe()) {
  const materialWeight = (recipe.materials || []).reduce((sum, entry) => sum + Math.max(1, Number(entry.amount) || 1), 0);
  const costWeight = labGeneCost(recipe) * 0.55 + labSeCost(recipe) * 1.4;
  const effectWeight = recipe.effect?.type === "catalyst" ? 1.45 : recipe.effect?.type === "serum" ? 1.18 : 1;
  const labDiscount = Math.min(0.35, Math.max(0, Math.floor(Number(state.artifact) || 0)) * 0.025);
  return Math.max(45_000, Math.round((42_000 + (materialWeight + costWeight) * 12_000) * effectWeight * (1 - labDiscount)));
}

function labJobProgress(job = labActiveJob(), now = Date.now()) {
  if (!job) return { active: false, ready: false, progress: 0, remainingMs: 0, elapsedMs: 0 };
  const durationMs = Math.max(1, Number(job.durationMs) || 1);
  const elapsedMs = Math.max(0, now - (Number(job.startedAt) || now));
  const progress = clamp(elapsedMs / durationMs, 0, 1);
  return {
    active: true,
    ready: progress >= 1,
    progress,
    remainingMs: Math.max(0, durationMs - elapsedMs),
    elapsedMs
  };
}

function labFormatClock(ms = 0) {
  const totalSeconds = Math.max(0, Math.ceil(Number(ms) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function labApplyFinishedRecipe(recipe = labRecipe(), job = {}) {
  if (recipe.effect?.type === "artifact") {
    state.artifact += Math.max(1, Number(recipe.artifact || 1));
  } else if (recipe.effect?.type === "serum") {
    applyLabSerum(Math.max(60_000, Number(recipe.effect?.boostMs) || BOOST_MS));
  } else if (recipe.effect?.type === "catalyst") {
    const rareMs = Math.max(60_000, Number(recipe.effect?.rareMs) || 0);
    state.labRareUntil = Math.max(Date.now(), Number(state.labRareUntil) || 0) + rareMs;
    state.zenEnergy = zenEnergyBalance() + Math.max(0, Math.floor(Number(recipe.effect?.zenEnergy) || 0));
  }

  state.score += job.zenBoosted ? Math.max(14, Number(recipe.score || 8) + 6) : Math.max(8, Number(recipe.score || 8));
  state.resonance += job.zenBoosted ? Math.max(2, Number(recipe.resonance || 1) + 1) : Math.max(1, Number(recipe.resonance || 1));
  state.plantVariant = (state.plantVariant + 7 + activeDonorCapsule) % PLANT_VARIANTS.length;
  state.zenGene = state.artifact % 3 === 0 ? "aura" : state.artifact % 2 === 0 ? "crystal" : "sprout";
}

const LAB_INVENTORY_CATEGORY_DEFS = [
  { id: "greens", label: "Greens", accent: "#6cff9f", detail: "Leaf samples" },
  { id: "flowers", label: "Flowers", accent: "#d58cff", detail: "Bloom samples" },
  { id: "mushrooms", label: "Mushrooms", accent: "#ffd670", detail: "Spore samples" },
  { id: "artifacts", label: "Artifacts", accent: "#8ef5ff", detail: "Synth outputs" }
];

function normalizeLabInventoryCategory(value = state.labInventoryCategory) {
  const category = String(value || "").trim().toLowerCase();
  return LAB_INVENTORY_CATEGORY_DEFS.some((item) => item.id === category) ? category : "greens";
}

function labInventoryCategoryForMaterial(material = {}) {
  const source = `${material.id || ""} ${material.name || ""} ${material.short || ""} ${material.strainId || ""}`.toLowerCase();
  if (/(petal|pollen|bloom|orchid|rose|tulip|daisy|aurora|flora|flower)/.test(source)) return "flowers";
  if (/(spore|fung|myco|mush|cap)/.test(source)) return "mushrooms";
  return "greens";
}

function labInventoryGlyph(kind = "greens") {
  if (kind === "flowers") {
    return `
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M24 10c2.8 2.8 3 7.4.2 10.2C21.4 17.4 21.2 12.8 24 10Z"/>
          <path d="M36 24c-2.8 2.8-7.4 3-10.2.2 2.8-2.8 7.4-3 10.2-.2Z"/>
          <path d="M24 38c-2.8-2.8-3-7.4-.2-10.2 2.8 2.8 3 7.4.2 10.2Z"/>
          <path d="M12 24c2.8-2.8 7.4-3 10.2-.2-2.8 2.8-7.4 3-10.2.2Z"/>
          <circle cx="24" cy="24" r="4.5"/>
        </g>
      </svg>
    `;
  }
  if (kind === "mushrooms") {
    return `
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 24c2.2-7.6 8.4-11.4 12-11.4S33.8 16.4 36 24c-4.6 2-8.6 2.8-12 2.8S16.6 26 12 24Z"/>
          <path d="M24 26.8v9.4"/>
          <path d="M19.4 36.2h9.2"/>
          <path d="M19 18.6h.01M24 16.4h.01M29 18.6h.01"/>
        </g>
      </svg>
    `;
  }
  if (kind === "artifacts") {
    return `
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M24 8 35 16v16L24 40 13 32V16 24Z"/>
          <path d="M24 8v16m0 0 11-8m-11 8-11-8"/>
          <path d="M19.4 28.6 24 32l4.6-3.4"/>
        </g>
      </svg>
    `;
  }
  return `
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 10c6 2.8 8 7.6 8 14.2S23 35.4 17 38"/>
        <path d="M31 10c-6 2.8-8 7.6-8 14.2S25 35.4 31 38"/>
        <path d="M18.8 15.4h10.4M17.6 22.8h12.8M18.8 30.2h10.4"/>
      </g>
    </svg>
  `;
}

function labInventoryCollections(inventory = normalizeInventory(state.inventory), uniqueCount = Math.max(0, Math.floor(Number(state.labUniqueMutations) || 0))) {
  const groups = {
    greens: [],
    flowers: [],
    mushrooms: [],
    artifacts: []
  };

  LAB_MATERIALS.forEach((material) => {
    const category = labInventoryCategoryForMaterial(material);
    const amount = labMaterialCount(material.id, inventory);
    groups[category].push({
      id: material.id,
      label: material.name || material.id,
      meta: material.short || "Sample",
      amount,
      amountText: `x${amount}`,
      accent: material.color || "#7effde",
      kind: category,
      empty: amount <= 0
    });
  });

  groups.artifacts.push(
    {
      id: "artifact_depth",
      label: "Artifact Core",
      meta: "Core depth",
      amount: Math.max(0, Math.floor(Number(state.artifact) || 0)),
      amountText: `x${Math.max(0, Math.floor(Number(state.artifact) || 0))}`,
      accent: "#8ef5ff",
      kind: "artifacts",
      empty: Math.max(0, Math.floor(Number(state.artifact) || 0)) <= 0
    },
    {
      id: "rare_core",
      label: "Rare Core",
      meta: "Unique reserve",
      amount: uniqueCount,
      amountText: `x${uniqueCount}`,
      accent: "#ffd670",
      kind: "artifacts",
      empty: uniqueCount <= 0
    }
  );

  return LAB_INVENTORY_CATEGORY_DEFS.map((definition) => {
    const items = groups[definition.id] || [];
    return {
      ...definition,
      items,
      total: items.reduce((sum, item) => sum + item.amount, 0),
      unlocked: items.filter((item) => !item.empty).length
    };
  });
}

function renderLabInventoryBar(inventory = normalizeInventory(state.inventory), uniqueCount = Math.max(0, Math.floor(Number(state.labUniqueMutations) || 0))) {
  const segments = $("#labInventorySegments");
  const drawer = $("#labInventoryCategoryGrid");
  if (!segments || !drawer) return;

  const categories = labInventoryCollections(inventory, uniqueCount);
  const activeId = normalizeLabInventoryCategory(state.labInventoryCategory);
  const active = categories.find((category) => category.id === activeId) || categories[0];
  const totalSamples = categories.reduce((sum, category) => sum + category.total, 0);

  setText("#labInventorySummary", totalSamples > 0 ? `${totalSamples} stored` : "No stock");
  setText("#labInventoryCategoryLabel", active.label);
  setText("#labInventoryCategoryMeta", active.total > 0 ? `${active.total} stored · ${active.unlocked} live` : active.detail);

  segments.innerHTML = categories.map((category) => `
    <button
      class="lab-segment-chip ${category.id === active.id ? "active" : ""}"
      type="button"
      data-lab-category="${category.id}"
      style="--segment-accent:${escapeHtml(category.accent)}"
      aria-pressed="${category.id === active.id ? "true" : "false"}"
    >
      <span class="lab-segment-glyph">${labInventoryGlyph(category.id)}</span>
      <span class="lab-segment-copy">
        <b>${escapeHtml(category.label)}</b>
        <em>${escapeHtml(String(category.total))}</em>
      </span>
    </button>
  `).join("");

  if (!active.items.length) {
    drawer.innerHTML = `
      <article class="lab-inventory-empty" style="--empty-accent:${escapeHtml(active.accent)}">
        <span class="lab-segment-glyph">${labInventoryGlyph(active.id)}</span>
        <strong>${escapeHtml(active.label)}</strong>
        <em>${escapeHtml(active.detail)}</em>
      </article>
    `;
    return;
  }

  drawer.innerHTML = active.items.map((item) => `
    <article class="lab-sample-card ${item.empty ? "empty" : "ready"}" style="--sample-accent:${escapeHtml(item.accent)}">
      <span class="lab-sample-glyph">${labInventoryGlyph(item.kind)}</span>
      <strong>${escapeHtml(item.label)}</strong>
      <b>${escapeHtml(item.amountText)}</b>
      <em>${escapeHtml(item.meta)}</em>
    </article>
  `).join("");
}

function renderLabSynthesisPanel(recipe = labRecipe(), inventory = normalizeInventory(state.inventory), job = labActiveJob()) {
  const inputs = $("#labSynthesisInputs");
  if (!inputs) return;

  const materialItems = (recipe.materials || []).map((entry) => {
    const material = labMaterialById(entry.id);
    const have = labMaterialCount(entry.id, inventory);
    const kind = labInventoryCategoryForMaterial(material || entry);
    return {
      label: material?.short || entry.id,
      have,
      need: Math.max(1, Math.floor(Number(entry.amount) || 1)),
      accent: material?.color || recipe.accent || "#7effde",
      glyph: labInventoryGlyph(kind)
    };
  });

  const items = [
    ...materialItems,
    {
      label: "DNA",
      have: Math.max(0, Math.floor(Number(inventory.geneStrands) || 0)),
      need: labGeneCost(),
      accent: "#7effde",
      glyph: labInventoryGlyph("greens")
    },
    {
      label: "SE",
      have: Math.max(0, Math.floor(Number(state.seed) || 0)),
      need: labSeCost(),
      accent: "#ffd670",
      glyph: `
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <path d="M24 8c8 9 12 15 12 22a12 12 0 0 1-24 0c0-7 4-13 12-22Z" fill="none" stroke="currentColor" stroke-width="1.8"/>
          <path d="M19 31c2.6 2.8 7.4 2.8 10 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      `
    }
  ].slice(0, 6);

  const jobState = labJobProgress(job);
  const outputRecipe = job ? labRecipeById(job.recipeId) || recipe : recipe;
  const visualItems = job ? items.map((item) => ({ ...item, have: item.need })) : items;
  const readyCount = visualItems.filter((item) => item.have >= item.need).length;
  const isReady = readyCount === visualItems.length && visualItems.length > 0;

  inputs.innerHTML = visualItems.map((item) => `
    <article class="lab-need-cell ${item.have >= item.need ? "ready" : "missing"} ${job ? "loaded" : ""}" style="--need-accent:${escapeHtml(item.accent)}">
      <span>${item.glyph}</span>
      <b>${escapeHtml(item.label)}</b>
      <em>${Math.min(item.have, item.need)}/${item.need}</em>
    </article>
  `).join("");

  setHTML("#labSynthesisOutputGlyph", labInventoryGlyph("artifacts"));
  setText("#labSynthesisOutputName", outputRecipe.result || "Artifact");
  setText("#labSynthesisState", jobState.ready ? "Claim" : job ? "Cooking" : isReady ? "Ready" : "Missing");
  setText("#labSynthesisMeta", job ? labFormatClock(jobState.remainingMs) : `${readyCount}/${items.length}`);
  setClass("#labSynthesisPanel", "ready", isReady || jobState.ready);
  setClass("#labSynthesisPanel", "running", Boolean(job && !jobState.ready));
  setStyle("#labSynthesisPanel", "--synth-progress", `${Math.round(jobState.progress * 100)}%`);
}

function labRecipeSummary(recipe = labRecipe()) {
  return recipe.materials.map((entry) => {
    const material = labMaterialById(entry.id);
    return `${material?.short || entry.id} ${entry.amount}`;
  }).join(" · ");
}

function labStoredSummary(recipe = labRecipe(), inventory = normalizeInventory(state.inventory)) {
  return recipe.materials.map((entry) => {
    const material = labMaterialById(entry.id);
    return `${material?.short || entry.id} ${labMaterialCount(entry.id, inventory)}/${entry.amount}`;
  }).join(" · ");
}

function labRecipeReady(recipe = labRecipe(), inventory = normalizeInventory(state.inventory)) {
  return recipe.materials.every((entry) => labMaterialCount(entry.id, inventory) >= entry.amount);
}

function zenEnergyBalance() {
  return Math.max(0, Math.floor(Number(state.zenEnergy) || 0));
}

function farmBiomassGain(harvest) {
  return farmCore.biomassGain(harvest, state.artifact);
}

function labBiomassCost() {
  return Math.max(4, 7 - Math.min(3, Math.floor(zenEnergyBalance() / 2)));
}

function labEnergyCost() {
  const recipe = labRecipe();
  const base = Math.max(0, Math.floor(Number(recipe.energy) || 0));
  if (base <= 0) return 0;
  return zenEnergyBalance() > 0 ? Math.max(0, base - 1) : base;
}

function labGeneCost() {
  const recipe = labRecipe();
  return zenEnergyBalance() >= 3 ? Math.max(1, recipe.geneStrands - 1) : recipe.geneStrands;
}

function labSeCost() {
  const recipe = labRecipe();
  return Math.max(1, Math.floor(Number(recipe.se ?? recipe.seed ?? 1) || 1));
}

function normalizeLabRecipeId(value = state.labRecipeId) {
  const recipe = Array.isArray(LAB_RECIPES)
    ? LAB_RECIPES.find((item) => item.id === value)
    : null;
  return recipe?.id || defaultLabRecipeId();
}

function labRecipeById(id = state.labRecipeId) {
  return Array.isArray(LAB_RECIPES)
    ? LAB_RECIPES.find((recipe) => recipe.id === id) || LAB_RECIPES[0] || null
    : null;
}

function labRecipe() {
  return labRecipeById(normalizeLabRecipeId(state.labRecipeId)) || {
    id: "starter_bio_fusion",
    name: "Proto Fusion",
    modeLabel: "Fusion",
    result: "Proto Core",
    note: "Stable biotech merge for early artifact growth.",
    output: "Artifact core",
    accent: "#7effde",
    materials: [],
    geneStrands: 2,
    energy: 0,
    se: 1,
    score: 8,
    resonance: 1,
    artifact: 1,
    effect: { type: "artifact" }
  };
}

function labGrowingTargets() {
  ensureFarmModel();
  if (activeDonorCapsule === 0) {
    return state.farmSlots.filter((slot, index) => isSlotUnlocked(index) && slot?.strain && farmSlotProgress(slot) < 100);
  }
  const capsuleSlots = state.capsuleSlots?.[String(activeDonorCapsule)] || [];
  return capsuleSlots.filter((slot, index) => isCapsuleSlotUnlocked(activeDonorCapsule, index) && slot?.strain && farmSlotProgress(slot) < 100);
}

function applyLabSerum(boostMs) {
  const targets = labGrowingTargets();
  const now = Date.now();
  targets.forEach((slot) => {
    slot.plantedAt = Math.max(0, Number(slot.plantedAt) - boostMs);
    slot.boostUntil = now + 2_800;
  });
  if (activeDonorCapsule === 0) syncLegacyFarmFromActiveSlot();
  return targets.length;
}

function consumeZenBoost() {
  if (zenEnergyBalance() <= 0) return false;
  state.zenEnergy = zenEnergyBalance() - 1;
  return true;
}

function zenGeneLabel(value = state.zenGene) {
  const gene = normalizeZenGene(value);
  if (gene === "aura") return "Aura DNA";
  if (gene === "crystal") return "Crystal DNA";
  return "Sprout DNA";
}

function nextZenGeneForRecipe(recipe = labRecipe()) {
  const effectType = recipe.effect?.type || "artifact";
  let artifactCount = Math.max(0, Math.floor(Number(state.artifact) || 0));
  if (effectType === "artifact") {
    artifactCount += Math.max(1, Number(recipe.artifact || 1));
  }
  if (artifactCount > 0 && artifactCount % 3 === 0) return "aura";
  if (artifactCount > 0 && artifactCount % 2 === 0) return "crystal";
  return "sprout";
}

function labEffectSummary(recipe = labRecipe()) {
  const effectType = recipe.effect?.type || "artifact";
  if (effectType === "serum") {
    const minutes = Math.max(1, Math.round(Math.max(60_000, Number(recipe.effect?.boostMs) || BOOST_MS) / 60000));
    return `Boosts growing capsules for ${minutes}m and speeds the farm loop.`;
  }
  if (effectType === "catalyst") {
    const minutes = Math.max(1, Math.round(Math.max(60_000, Number(recipe.effect?.rareMs) || 60_000) / 60000));
    const charge = Math.max(0, Math.floor(Number(recipe.effect?.zenEnergy) || 0));
    return charge > 0
      ? `Opens a ${minutes}m rare window and stores +${charge} Zen charge.`
      : `Opens a ${minutes}m rare mutation window.`;
  }
  return `Adds +${Math.max(1, Number(recipe.artifact || 1))} artifact depth and raises resonance.`;
}

function labZenLinkSummary(recipe = labRecipe()) {
  const effectType = recipe.effect?.type || "artifact";
  if (effectType === "serum") {
    return {
      tag: "Farm -> Lab",
      text: "Faster capsules return more materials, which means more Lab fuel for Zen."
    };
  }
  if (effectType === "catalyst") {
    const charge = Math.max(0, Math.floor(Number(recipe.effect?.zenEnergy) || 0));
    return {
      tag: charge > 0 ? "Zen charge" : "Rare bridge",
      text: charge > 0 ? `After synthesis you bank +${charge} Zen charge for future actions.` : "This recipe prepares a stronger Zen-powered rare run."
    };
  }
  return {
    tag: "Zen DNA",
    text: `${zenGeneLabel(nextZenGeneForRecipe(recipe))} becomes the active Zen direction after synthesis.`
  };
}

function labSynthState(recipe = labRecipe(), inventory = normalizeInventory(state.inventory)) {
  const missingMaterial = recipe.materials.find((entry) => labMaterialCount(entry.id, inventory) < entry.amount);
  if (missingMaterial) {
    const material = labMaterialById(missingMaterial.id);
    return {
      ok: false,
      label: "Need ingredients",
      detail: `Collect ${missingMaterial.amount} ${material?.short || missingMaterial.id} to run this formula.`
    };
  }
  if (inventory.geneStrands < labGeneCost()) {
    return {
      ok: false,
      label: "Need gene strands",
      detail: `Collect ${labGeneCost()} GS to stabilize the synthesis.`
    };
  }
  if (labEnergyCost() > 0 && state.energy < labEnergyCost()) {
    return {
      ok: false,
      label: "Need charge",
      detail: `Store ${labEnergyCost()} charge before you start the capsule.`
    };
  }
  if (state.seed < labSeCost()) {
    return {
      ok: false,
      label: "Need SE",
      detail: `Store ${labSeCost()} SE before you synthesize this result.`
    };
  }
  if ((recipe.effect?.type || "artifact") === "serum" && !labGrowingTargets().length) {
    return {
      ok: false,
      label: "Need growing target",
      detail: "Plant something first so the serum has a live capsule to affect."
    };
  }
  return {
    ok: true,
    label: "Ready to synthesize",
    detail: zenEnergyBalance() > 0 ? "Zen charge will be consumed to strengthen this run." : "Tap the button to create the result and push the Lab loop forward."
  };
}

function labRequirementItems(recipe = labRecipe(), inventory = normalizeInventory(state.inventory)) {
  const items = recipe.materials.map((entry) => {
    const material = labMaterialById(entry.id);
    const have = labMaterialCount(entry.id, inventory);
    return {
      label: material?.short || entry.id,
      name: material?.name || entry.id,
      value: `${have}/${entry.amount}`,
      ready: have >= entry.amount,
      color: material?.color || recipe.accent || "#7effde"
    };
  });
  items.push({
    label: "GS",
    name: "Gene strands",
    value: `${Math.max(0, Math.floor(Number(inventory.geneStrands) || 0))}/${labGeneCost()}`,
    ready: inventory.geneStrands >= labGeneCost(),
    color: "#b48eff"
  });
  if (labEnergyCost() > 0) {
    items.push({
      label: "CRC",
      name: "Capsule energy",
      value: `${Math.max(0, Math.floor(Number(state.energy) || 0))}/${labEnergyCost()}`,
      ready: state.energy >= labEnergyCost(),
      color: "#7effde"
    });
  }
  items.push({
    label: "SE",
    name: "Seed enzyme",
    value: `${Math.max(0, Math.floor(Number(state.seed) || 0))}/${labSeCost()}`,
    ready: state.seed >= labSeCost(),
    color: "#ffd670"
  });
  if ((recipe.effect?.type || "artifact") === "serum") {
    const targets = labGrowingTargets().length;
    items.push({
      label: "TARGET",
      name: "Growing capsule",
      value: targets > 0 ? `${targets} live` : "0 live",
      ready: targets > 0,
      color: "#58dcff"
    });
  }
  return items;
}

function renderLabInventory(recipe = labRecipe(), inventory = normalizeInventory(state.inventory), uniqueCount = 0) {
  const inventoryGrid = $("#labInventoryGrid");
  if (!inventoryGrid) return;
  const recipeMaterials = (recipe.materials || []).slice(0, 3).map((entry) => {
    const material = labMaterialById(entry.id);
    const count = labMaterialCount(entry.id, inventory);
    return {
      type: "mat",
      icon: material?.short?.slice(0, 2).toUpperCase() || "MT",
      name: material?.name || entry.id,
      amount: `${count}/${entry.amount}`,
      ready: count >= entry.amount,
      color: material?.color || recipe.accent || "#7effde"
    };
  });
  const items = [
    {
      type: "dna",
      icon: "DNA",
      name: "Gene strands",
      amount: `${Math.max(0, Math.floor(Number(inventory.geneStrands) || 0))}/${labGeneCost()}`,
      ready: inventory.geneStrands >= labGeneCost(),
      color: "#b48eff"
    },
    ...recipeMaterials,
    {
      type: "core",
      icon: "CORE",
      name: "Rare core",
      amount: `x${uniqueCount}`,
      ready: uniqueCount > 0,
      color: "#ffd670"
    }
  ].slice(0, 5);
  const totalStored = items.reduce((sum, item) => sum + (item.ready ? 1 : 0), 0);
  setText("#labInventoryCount", `${totalStored}/${items.length} ready`);
  inventoryGrid.innerHTML = items.map((item) => `
    <article class="lab-inventory-item ${item.ready ? "ready" : "empty"} ${escapeHtml(item.type)}" style="--inv-color:${escapeHtml(item.color)}">
      <span class="lab-inventory-glyph" aria-hidden="true"><i></i><b>${escapeHtml(item.icon)}</b></span>
      <strong>${escapeHtml(item.name)}</strong>
      <em>${escapeHtml(item.amount)}</em>
    </article>
  `).join("");
}

function mergeMissionState(localValue = {}, remoteValue = {}) {
  const local = normalizeMissionState(localValue);
  const remote = normalizeMissionState(remoteValue);
  return {
    opened: { ...remote.opened, ...local.opened },
    claimed: { ...remote.claimed, ...local.claimed }
  };
}

function claimedMissionCount() {
  return MISSIONS.filter((mission) => state.missions.claimed[mission.id]).length;
}

function missionRewardText(mission) {
  const parts = [];
  if (mission.reward.energy) parts.push(`+${mission.reward.energy} energy`);
  if (mission.reward.resonance) parts.push(`+${mission.reward.resonance} ZEN`);
  if (mission.reward.score) parts.push(`+${mission.reward.score} CRC`);
  return parts.join(" · ");
}

function missionRewardHtml(mission) {
  return resourceCostListHtml([
    mission.reward.energy ? { type: "crc", value: `+${mission.reward.energy}` } : null,
    mission.reward.resonance ? { type: "zen", value: `+${mission.reward.resonance}` } : null,
    mission.reward.score ? { type: "main", value: `+${mission.reward.score}` } : null
  ]);
}

function getClientId() {
  const key = "green-farm-client-id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(key, id);
  return id;
}

function telegramUserLabel(user) {
  if (!user) return "Guest session";
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "Telegram user";
  const handle = user.username ? `@${user.username}` : `id ${user.id}`;
  return `${name} · ${handle}`;
}

function renderTelegramStatus() {
  const user = tg?.initDataUnsafe?.user;
  const isTelegram = Boolean(tg?.initData || user);
  const statusText = isTelegram ? "Telegram User" : "Guest User";
  const userText = telegramUserLabel(user);
  setText("#telegramStatusText", statusText);
  setText("#telegramUserText", userText);
  setClass("#telegramStatus", "connected", isTelegram);
  setClass("#telegramStatus", "preview", !isTelegram);
}

function apiUrl(path) {
  return `${API_BASE}${path}`;
}

function serverStatePayload() {
  ensureFarmModel();
  return {
    score: state.score,
    energy: state.energy,
    seed: state.seed,
    biomass: state.biomass,
    inventory: normalizeInventory(state.inventory),
    resonance: state.resonance,
    sessions: state.sessions,
    artifact: state.artifact,
    labUniqueMutations: state.labUniqueMutations,
    farmPass: normalizeFarmPass(state.farmPass),
    droneLevel: safeDroneLevel(),
    droneSkin: normalizeDroneSkin(),
    ownedDroneSkins: normalizeOwnedDroneSkins(),
    dataModuleLevel: safeDataModuleLevel(),
    unlockedSlots: normalizeUnlockedSlots(),
    missions: state.missions,
    farm: {
      plantedAt: Math.max(0, Number(state.plantedAt) || 0),
      growthDuration: Math.max(8_000, Number(state.growthDuration) || GROW_DURATION_MS),
      plantVariant: Math.max(0, Math.floor(Number(state.plantVariant) || 0)),
      boostUntil: Math.max(0, Number(state.boostUntil) || 0),
      autoCollect: Boolean(state.autoCollect),
      activeSlot: Math.max(0, Math.floor(Number(state.activeSlot) || 0)),
      slots: state.farmSlots.map((slot, index) => ({
        id: index,
        strain: farmStrainById(slot.strain) ? slot.strain : null,
        plantedAt: Math.max(0, Number(slot.plantedAt) || 0),
        growthDuration: Math.max(8_000, Number(slot.growthDuration) || GROW_DURATION_MS),
        plantVariant: Math.max(0, Math.floor(Number(slot.plantVariant) || 0)),
        boostUntil: Math.max(0, Number(slot.boostUntil) || 0),
        readyNotified: Boolean(slot.readyNotified)
      }))
    },
    lab: {
      uniqueMutations: Math.max(0, Math.floor(Number(state.labUniqueMutations) || 0)),
      rareUntil: Math.max(0, Number(state.labRareUntil) || 0),
      recipeId: normalizeLabRecipeId(state.labRecipeId),
      job: labActiveJob()
    },
    zen: {
      energy: Math.max(0, Math.floor(Number(state.zenEnergy) || 0)),
      duration: state.zenDuration || ZEN_DEFAULT_DURATION_MS,
      sound: normalizeZenSound(),
      gene: normalizeZenGene(),
      attentionHits: Math.max(0, Math.floor(Number(state.zenSessionDna) || 0))
    },
    hydrated: backendState.hydrated
  };
}

function playerSnapshot() {
  return JSON.stringify(serverStatePayload());
}

function leagueForScore(score = state.score) {
  const value = Math.max(0, Math.floor(Number(score) || 0));
  return LEAGUE_TIERS.find((tier) => value >= tier.min && value < tier.max) || LEAGUE_TIERS[0];
}

function leagueSnapshot(score = state.score) {
  const value = Math.max(0, Math.floor(Number(score) || 0));
  const current = leagueForScore(value);
  const index = LEAGUE_TIERS.findIndex((tier) => tier.id === current.id);
  const next = LEAGUE_TIERS[index + 1] || null;
  const floor = current.min;
  const ceiling = Number.isFinite(current.max) ? current.max : current.min;
  const range = Math.max(1, ceiling - floor);
  const progress = next
    ? clamp(Math.round(((value - floor) / range) * 100), 0, 100)
    : 100;
  const remaining = next ? Math.max(0, next.min - value) : 0;

  return {
    value,
    current,
    next,
    progress,
    remaining,
    floor,
    ceiling,
    index
  };
}

function formatLeagueAmount(value) {
  const amount = Math.max(0, Math.floor(Number(value) || 0));
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`;
  if (amount >= 1_000) return `${Math.floor(amount / 1_000)}K`;
  return String(amount);
}

function renderLeagueProgress() {
  const snapshot = leagueSnapshot();
  setText("#leagueTitle", snapshot.current.name);
  setText("#leagueBadge", snapshot.current.name);
  setText("#leagueCurrentName", snapshot.current.name);
  setText("#leagueCurrentRange", snapshot.next
    ? `${formatLeagueAmount(snapshot.floor)}-${formatLeagueAmount(snapshot.ceiling)} main`
    : `${formatLeagueAmount(snapshot.floor)}+ main`);
  setText("#leagueNextName", snapshot.next ? snapshot.next.name : "MAX League");
  setText("#leagueRemaining", snapshot.next
    ? `${formatLeagueAmount(snapshot.remaining)} left`
    : "Top league reached");
  setText("#leagueProgressValue", `${snapshot.progress}%`);
  setStyle("#leagueProgressFill", "--league-progress", `${snapshot.progress}%`);
  setClass("#leagueProgressCard", "maxed", !snapshot.next);

  const currentIcon = $("#leagueCurrentIcon");
  if (currentIcon) {
    currentIcon.className = `league-emblem big ${snapshot.current.tone}`;
    currentIcon.setAttribute("aria-label", snapshot.current.name);
  }

  const rail = $("#leagueVisualRail");
  if (rail) {
    rail.innerHTML = LEAGUE_VISUALS.map((tier, index) => {
      const isActive = tier.id === snapshot.current.id;
      const isUnlocked = index <= snapshot.index;
      return `
        <span class="league-mini ${tier.tone} ${isActive ? "active" : ""} ${isUnlocked ? "unlocked" : "locked"}" title="${escapeHtml(tier.name)}">
          <i></i>
          <b>${String(index + 1).padStart(2, "0")}</b>
        </span>
      `;
    }).join("");
  }
}

function renderLeaderboard() {
  renderLeagueProgress();
  setText("#backendState", backendState.status);
  const rows = $("#leaderboardRows");
  if (!rows) return;

  const players = backendState.leaderboard.length
    ? backendState.leaderboard
    : [
        { rank: 1, id: "mock:nova", name: "Nova", score: 920 },
        { rank: backendState.rank || Math.max(2, 12 - Math.floor(state.score / 80)), id: backendState.playerId || "local", name: state.playerName, score: state.score }
      ];

  rows.innerHTML = players.map((player) => {
    const isYou = player.id === backendState.playerId || (!backendState.playerId && player.name === state.playerName);
    const rank = String(player.rank).padStart(2, "0");
    const username = player.username ? ` @${escapeHtml(player.username)}` : "";
    const name = escapeHtml(player.name || "Player");
    return `
      <div class="leader-row ${isYou ? "you" : ""}">
        <span>${rank}</span>
        <b>${name}${username}</b>
        <strong>${player.score}</strong>
      </div>
    `;
  }).join("");
}

function leagueName(score = state.score) {
  return leagueSnapshot(score).current.name;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function updateLoadingSplash(progress, message) {
  if (loadingState.hidden) return;
  const safeProgress = clamp(Math.round(progress), loadingState.progress, 100);
  loadingState.progress = safeProgress;
  setText("#loadingPercent", `${safeProgress}%`);
  setText("#loadingText", message);
  setStyle("#loadingBar", "--loading-progress", `${safeProgress}%`);

  document.querySelectorAll(".loading-segments i").forEach((segment, index) => {
    segment.classList.toggle("is-active", index < Math.ceil((safeProgress / 100) * 8));
  });
}

function hideLoadingSplash() {
  if (loadingState.hidden) return;
  updateLoadingSplash(100, "Capsule ready");
  loadingState.hidden = true;
  const splash = $("#loadingSplash");
  window.setTimeout(() => {
    splash?.classList.add("is-hidden");
  }, 360);
  window.setTimeout(() => {
    if (splash?.classList.contains("is-hidden")) splash.hidden = true;
  }, 920);
}

function scheduleLoadingCompletion() {
  const elapsed = Date.now() - loadingState.startedAt;
  const delay = Math.max(3800, 4800 - elapsed);
  window.setTimeout(hideLoadingSplash, delay);
}

function scheduleBackendSync(force = false) {
  const now = Date.now();
  const snapshot = playerSnapshot();
  if (backendState.syncing) return;
  if (!force && snapshot === backendState.lastSnapshot && now - backendState.lastSyncAt < 15_000) return;
  if (!force && now - backendState.lastSyncAt < 5_000) return;
  backendState.syncing = true;
  backendState.lastSyncAt = now;
  backendState.lastSnapshot = snapshot;
  syncPlayer().finally(() => {
    backendState.syncing = false;
  });
}

function normalizeServerFarm(value = {}) {
  return {
    plantedAt: Math.max(0, Number(value.plantedAt) || 0),
    growthDuration: clamp(Number(value.growthDuration) || GROW_DURATION_MS, 8_000, 86_400_000),
    plantVariant: Math.max(0, Math.floor(Number(value.plantVariant) || 0)),
    boostUntil: Math.max(0, Number(value.boostUntil) || 0),
    autoCollect: value.autoCollect === true,
    activeSlot: clamp(Math.floor(Number(value.activeSlot) || 0), 0, FARM_SLOT_COUNT - 1),
    slots: normalizeFarmSlots(value.slots, value)
  };
}

function farmProgressFor(plantedAt, growthDuration) {
  return farmCore.slotProgress({
    strain: plantedAt ? "legacy" : null,
    plantedAt,
    growthDuration
  });
}

function applyServerPlayerState(player = {}) {
  if (!backendState.hydrated) {
    state.score = Math.max(Number(state.score) || 0, Number(player.score) || 0);
    state.energy = Math.max(Number(state.energy) || 0, Number(player.energy) || 0);
    state.seed = Math.max(Number(state.seed) || 0, Number(player.seed) || 0);
    state.biomass = Math.max(Number(state.biomass) || 0, Number(player.biomass ?? player.state?.biomass) || 0);
    const localInventory = normalizeInventory(state.inventory);
    const remoteInventory = normalizeInventory(player.inventory);
    state.inventory = {
      geneStrands: Math.max(localInventory.geneStrands, remoteInventory.geneStrands),
      quantumNutrients: Math.max(localInventory.quantumNutrients, remoteInventory.quantumNutrients),
      materials: { ...remoteInventory.materials, ...localInventory.materials },
      harvests: { ...remoteInventory.harvests, ...localInventory.harvests },
      strains: { ...remoteInventory.strains, ...localInventory.strains }
    };
    state.resonance = Math.max(Number(state.resonance) || 0, Number(player.resonance) || 0);
    state.sessions = Math.max(Number(state.sessions) || 0, Number(player.sessions) || 0);
    state.artifact = Math.max(Number(state.artifact) || 0, Number(player.artifact) || 0);
  }

  state.droneLevel = Math.max(safeDroneLevel(), safeDroneLevel(player.droneLevel));
  state.ownedDroneSkins = normalizeOwnedDroneSkins({
    ...normalizeOwnedDroneSkins(player.ownedDroneSkins),
    ...normalizeOwnedDroneSkins(state.ownedDroneSkins)
  });
  if (player.droneSkin) state.droneSkin = normalizeDroneSkin(player.droneSkin);
  if (!state.ownedDroneSkins[state.droneSkin]) state.droneSkin = "bubbles";
  state.dataModuleLevel = Math.max(safeDataModuleLevel(), safeDataModuleLevel(player.dataModuleLevel));
  state.missions = mergeMissionState(state.missions, player.missions);
  state.unlockedSlots = { ...normalizeUnlockedSlots(state.unlockedSlots), ...normalizeUnlockedSlots(player.unlockedSlots) };
  state.farmPass = normalizeFarmPass(
    player.farmPass && typeof player.farmPass === "object"
      ? {
        ...state.farmPass,
        activeUntil: Math.max(Number(state.farmPass?.activeUntil) || 0, Number(player.farmPass.activeUntil) || 0),
        purchasedAt: Math.max(Number(state.farmPass?.purchasedAt) || 0, Number(player.farmPass.purchasedAt) || 0),
        claimedDays: [
          ...(Array.isArray(state.farmPass?.claimedDays) ? state.farmPass.claimedDays : []),
          ...(Array.isArray(player.farmPass.claimedDays) ? player.farmPass.claimedDays : [])
        ],
        uniqueFlowerClaimed: Boolean(state.farmPass?.uniqueFlowerClaimed || player.farmPass.uniqueFlowerClaimed)
      }
      : state.farmPass
  );

  if (player.lab) {
    state.labUniqueMutations = Math.max(
      Math.floor(Number(state.labUniqueMutations) || 0),
      Math.floor(Number(player.lab.uniqueMutations) || 0)
    );
    state.labRareUntil = Math.max(Number(state.labRareUntil) || 0, Number(player.lab.rareUntil) || 0);
    state.labRecipeId = normalizeLabRecipeId(player.lab.recipeId || state.labRecipeId);
    if (!state.labSynthesis && player.lab.job) {
      state.labSynthesis = normalizeState({ labSynthesis: player.lab.job }).labSynthesis;
    }
  }

  if (player.zen) {
    state.zenEnergy = Math.max(
      Math.floor(Number(state.zenEnergy) || 0),
      Math.floor(Number(player.zen.energy) || 0)
    );
    state.zenDuration = ZEN_DURATION_OPTIONS.includes(Number(player.zen.duration))
      ? Number(player.zen.duration)
      : state.zenDuration;
    state.zenSound = normalizeZenSound(player.zen.sound || state.zenSound);
    state.zenGene = normalizeZenGene(player.zen.gene || state.zenGene);
  }

  if (player.farm) {
    const serverFarm = normalizeServerFarm(player.farm);
    if (!backendState.hydrated && Array.isArray(player.farm.slots)) {
      state.farmSlots = normalizeFarmSlots(player.farm.slots, serverFarm);
      state.activeSlot = clamp(Math.floor(Number(player.farm.activeSlot) || 0), 0, FARM_SLOT_COUNT - 1);
    }
    const localProgress = farmProgressFor(state.plantedAt, state.growthDuration);
    const serverProgress = farmProgressFor(serverFarm.plantedAt, serverFarm.growthDuration);
    const shouldUseServerFarm = serverFarm.plantedAt && (!state.plantedAt || serverProgress > localProgress);
    if (shouldUseServerFarm) {
      state.plantedAt = serverFarm.plantedAt;
      state.growthDuration = serverFarm.growthDuration;
      state.plantVariant = serverFarm.plantVariant;
      state.boostUntil = serverFarm.boostUntil;
    }
    state.autoCollect = state.autoCollect || serverFarm.autoCollect;
  }

  backendState.hydrated = true;
  saveState();
}

function applyAuthoritativePlayerState(player = {}) {
  state.score = Math.max(0, Math.floor(Number(player.score) || 0));
  state.energy = Math.max(0, Math.floor(Number(player.energy) || 0));
  state.seed = Math.max(0, Math.floor(Number(player.seed) || 0));
  state.biomass = Math.max(0, Math.floor(Number(player.biomass ?? player.state?.biomass) || 0));
  state.inventory = normalizeInventory(player.inventory);
  state.resonance = Math.max(0, Math.floor(Number(player.resonance) || 0));
  state.sessions = Math.max(0, Math.floor(Number(player.sessions) || 0));
  state.artifact = Math.max(0, Math.floor(Number(player.artifact) || 0));
  state.droneLevel = safeDroneLevel(player.droneLevel);
  state.droneSkin = normalizeDroneSkin(player.droneSkin || state.droneSkin);
  state.dataModuleLevel = safeDataModuleLevel(player.dataModuleLevel);
  state.missions = mergeMissionState(state.missions, player.missions);
  state.unlockedSlots = normalizeUnlockedSlots(player.unlockedSlots);
  state.farmPass = normalizeFarmPass(player.farmPass || state.farmPass);

  if (player.lab) {
    state.labUniqueMutations = Math.max(0, Math.floor(Number(player.lab.uniqueMutations) || 0));
    state.labRareUntil = Math.max(0, Number(player.lab.rareUntil) || 0);
    state.labRecipeId = normalizeLabRecipeId(player.lab.recipeId || state.labRecipeId);
    state.labSynthesis = player.lab.job ? normalizeState({ labSynthesis: player.lab.job }).labSynthesis : null;
  }

  if (player.zen) {
    state.zenEnergy = Math.max(0, Math.floor(Number(player.zen.energy) || 0));
    state.zenDuration = ZEN_DURATION_OPTIONS.includes(Number(player.zen.duration))
      ? Number(player.zen.duration)
      : state.zenDuration;
    state.zenSound = normalizeZenSound(player.zen.sound || state.zenSound);
    state.zenGene = normalizeZenGene(player.zen.gene || state.zenGene);
  }

  if (player.farm) {
    const serverFarm = normalizeServerFarm(player.farm);
    state.farmSlots = normalizeFarmSlots(player.farm.slots, serverFarm);
    state.activeSlot = clamp(Math.floor(Number(player.farm.activeSlot) || 0), 0, FARM_SLOT_COUNT - 1);
    state.plantedAt = serverFarm.plantedAt;
    state.growthDuration = serverFarm.growthDuration;
    state.plantVariant = serverFarm.plantVariant;
    state.boostUntil = serverFarm.boostUntil;
    state.autoCollect = serverFarm.autoCollect;
  }

  backendState.hydrated = true;
  saveState();
}

async function callFarmApi(path, options = {}) {
  const method = options.method || "GET";
  const headers = {
    "x-client-id": CLIENT_ID,
    "x-telegram-init-data": tg?.initData || "",
    ...(method === "GET" ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {})
  };
  const response = await fetch(apiUrl(path), {
    method,
    headers,
    ...(method === "GET" ? {} : {
      body: JSON.stringify({
        clientId: CLIENT_ID,
        initData: tg?.initData || "",
        ...(options.body || {})
      })
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Farm request failed");
  }
  return data;
}

async function syncFarmStateFromServer() {
  const data = await callFarmApi("/api/farm/state");
  if (data.player) {
    applyAuthoritativePlayerState(data.player);
    backendState.available = true;
    backendState.playerId = data.player.id || backendState.playerId;
  }
  return data;
}

async function plantFarmSlotServer(index = state.activeSlot, strainId = null, options = {}) {
  const data = await callFarmApi("/api/farm/plant", {
    method: "POST",
    body: {
      slotIndex: index,
      strainId
    }
  });
  if (data.player) {
    applyAuthoritativePlayerState(data.player);
    backendState.available = true;
    backendState.playerId = data.player.id || backendState.playerId;
  }
  if (options.toast !== false && data.message) toast(data.message);
  if (options.shouldRender !== false) render();
  return data;
}

async function collectHarvestServer(auto = false, index = state.activeSlot, options = {}) {
  const data = await callFarmApi("/api/farm/harvest", {
    method: "POST",
    body: {
      slotIndex: index,
      auto
    }
  });
  if (data.player) {
    applyAuthoritativePlayerState(data.player);
    backendState.available = true;
    backendState.playerId = data.player.id || backendState.playerId;
  }
  if (options.tone !== false) playTone("collect");
  if (options.toast !== false && data.message) toast(data.message);
  if (options.shouldRender !== false) render();
  return data;
}

async function syncPlayer() {
  try {
    updateLoadingSplash(78, "Connecting server");
    const response = await fetch(apiUrl("/api/player/sync"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: CLIENT_ID,
        initData: tg?.initData || "",
        state: serverStatePayload()
      })
    });
    if (!response.ok) throw new Error("Backend sync failed");
    const data = await response.json();
    backendState.available = true;
    backendState.status = data.player?.verified ? "Live TG" : "Live";
    backendState.playerId = data.player?.id || backendState.playerId;
    backendState.rank = data.rank || backendState.rank;
    backendState.leaderboard = data.leaderboard || backendState.leaderboard;
    applyServerPlayerState(data.player);
    render();
    updateLoadingSplash(94, "Leaderboard synced");
    scheduleLoadingCompletion();
  } catch {
    backendState.available = false;
    backendState.status = "Local";
    renderLeaderboard();
    updateLoadingSplash(88, "Offline preview ready");
    scheduleLoadingCompletion();
  }
}

function stateSummary() {
  return serverStatePayload();
}

function trackAction(type, details = {}) {
  const payload = {
    clientId: CLIENT_ID,
    initData: tg?.initData || "",
    type,
    details,
    state: stateSummary()
  };

  fetch(apiUrl("/api/player/event"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(() => {});
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toast(message) {
  const node = $("#toast");
  if (!node) return;
  node.textContent = message;
  node.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => node.classList.remove("show"), 1800);
}

function growthProgress() {
  const slot = activeFarmSlot();
  if (slot?.strain) return farmSlotProgress(slot);
  if (!state.plantedAt) return 0;
  return clamp(((Date.now() - state.plantedAt) / state.growthDuration) * 100, 0, 100);
}

function remainingSeconds(progress) {
  const slot = activeFarmSlot();
  if (slot?.strain) {
    if (progress >= 100) return 0;
    return Math.ceil((slot.growthDuration - (Date.now() - slot.plantedAt)) / 1000);
  }
  if (!state.plantedAt || progress >= 100) return 0;
  return Math.ceil((state.growthDuration - (Date.now() - state.plantedAt)) / 1000);
}

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function zenElapsed() {
  if (!state.zenStartedAt) return state.zenElapsed || 0;
  if (state.zenPausedAt) return state.zenElapsed || 0;
  return Date.now() - state.zenStartedAt;
}

function zenPhase(elapsed) {
  const loop = elapsed % BREATH_LOOP_MS;
  if (loop < 4_000) {
    return {
      label: "Inhale",
      scale: 1 + (loop / 4_000) * 0.16,
      breathProgress: (loop / 4_000) * 42
    };
  }
  if (loop < 6_000) {
    return { label: "Hold", scale: 1.16, breathProgress: 50 };
  }
  const exhale = (loop - 6_000) / 6_000;
  return {
    label: "Exhale",
    scale: 1.16 - exhale * 0.16,
    breathProgress: 50 + exhale * 50
  };
}

function zenDnaCycle(elapsed) {
  return Math.max(0, Math.floor(elapsed / ZEN_DNA_WINDOW_MS));
}

function zenDnaIsVisible(elapsed, isActive, isPaused) {
  if (!isActive || isPaused) return false;
  const windowProgress = elapsed % ZEN_DNA_WINDOW_MS;
  return windowProgress >= ZEN_DNA_SHOW_START_MS && windowProgress <= ZEN_DNA_SHOW_END_MS;
}

function zenDnaClaimKey(elapsed, index) {
  return `${zenDnaCycle(elapsed)}:${index}`;
}

function zenSessionMinutes(duration = state.zenDuration || ZEN_DEFAULT_DURATION_MS) {
  return Math.max(1, Math.ceil((Math.max(0, Number(duration) || ZEN_DEFAULT_DURATION_MS)) / 60_000));
}

function zenCycleWindowStart(cycle) {
  return cycle * ZEN_DNA_WINDOW_MS + ZEN_DNA_SHOW_START_MS;
}

function zenExpectedTargetsByMinute(duration = state.zenDuration || ZEN_DEFAULT_DURATION_MS) {
  const minutes = zenSessionMinutes(duration);
  const totals = Array.from({ length: minutes }, () => 0);
  for (let cycle = 0; ; cycle += 1) {
    const windowStart = zenCycleWindowStart(cycle);
    if (windowStart >= duration) break;
    const minuteIndex = Math.floor(windowStart / 60_000);
    if (minuteIndex >= 0 && minuteIndex < totals.length) totals[minuteIndex] += 3;
  }
  return totals;
}

function zenClaimedTargetsByMinute(claims = state.zenDnaClaims || {}) {
  const totals = [];
  Object.keys(claims || {}).forEach((key) => {
    const cycle = Math.max(0, Math.floor(Number(String(key).split(":")[0]) || 0));
    const minuteIndex = Math.floor(zenCycleWindowStart(cycle) / 60_000);
    totals[minuteIndex] = (totals[minuteIndex] || 0) + 1;
  });
  return totals;
}

function zenCrcRewardBreakdown(duration = state.zenDuration || ZEN_DEFAULT_DURATION_MS, claims = state.zenDnaClaims || {}) {
  const expected = zenExpectedTargetsByMinute(duration);
  const claimed = zenClaimedTargetsByMinute(claims);
  const minutes = zenSessionMinutes(duration);
  const details = Array.from({ length: minutes }, (_, minuteIndex) => {
    const claimedCount = Math.max(0, Math.floor(Number(claimed[minuteIndex]) || 0));
    const expectedCount = Math.max(0, Math.floor(Number(expected[minuteIndex]) || 0));
    const doubled = expectedCount > 0 && claimedCount >= expectedCount;
    return {
      minute: minuteIndex,
      claimed: claimedCount,
      expected: expectedCount,
      doubled,
      crc: doubled ? 120 : 60
    };
  });
  return {
    total: details.reduce((sum, item) => sum + item.crc, 0),
    doubledMinutes: details.filter((item) => item.doubled).length,
    details
  };
}

function growthStage(progress) {
  if (!state.plantedAt) return "Seed";
  if (progress >= 100) return "Ready";
  if (progress >= 72) return "Bloom";
  if (progress >= 36) return "Grow";
  return "Sprout";
}

function currentPlantVariant() {
  const safeId = Number.isFinite(state.plantVariant) ? state.plantVariant : 0;
  state.plantVariant = ((safeId % PLANT_VARIANTS.length) + PLANT_VARIANTS.length) % PLANT_VARIANTS.length;
  return PLANT_VARIANTS[state.plantVariant];
}

function applyPlantVariant(variant, progress, motion) {
  const plant = $("#plantVisual");
  const capsule = $("#plantCapsule");
  if (!plant || !capsule) return;

  plant.dataset.variant = String(variant.id + 1).padStart(3, "0");
  plant.style.setProperty("--leaf-hue", variant.leafHue);
  plant.style.setProperty("--stem-hue", variant.stemHue);
  plant.style.setProperty("--accent-hue", variant.accentHue);
  plant.style.setProperty("--core-hue", variant.coreHue);
  plant.style.setProperty("--branch-spread", variant.branchSpread.toFixed(2));
  plant.style.setProperty("--leaf-scale", variant.leafScale.toFixed(2));
  plant.style.setProperty("--filament-speed", variant.filamentSpeed.toFixed(2));
  plant.style.setProperty("--maturity", (0.55 + progress / 220).toFixed(2));
  capsule.style.setProperty("--accent-hue", variant.accentHue);
  capsule.style.setProperty("--motion", motion.toFixed(2));
}

function renderSpecimenPods(progress, motion) {
  document.querySelectorAll(".specimen-pod").forEach((pod, index) => {
    const variant = PLANT_VARIANTS[(state.plantVariant + index * 13) % PLANT_VARIANTS.length];
    const slotUnlocked = isSlotUnlocked(index);
    const isFuturePremium = index >= 4;
    const isGrowing = Boolean(state.plantedAt && progress < 100);

    pod.classList.toggle("active-pod", index === 0);
    pod.classList.toggle("empty-pod", index > 0);
    pod.classList.toggle("locked-pod", index === 1 || index === 2);
    pod.classList.toggle("paid-pod", index === 3 && !slotUnlocked);
    pod.classList.toggle("unlocked-pod", index === 3 && slotUnlocked);
    pod.classList.toggle("future-pod", isFuturePremium);
    pod.classList.toggle("growing", index === 0 && isGrowing);
    pod.classList.toggle("bursting", index === 0 && state.boostUntil > Date.now());
    pod.style.setProperty("--chamber-index", index);

    if (index > 0) {
      pod.style.setProperty("--leaf-hue", variant.leafHue);
      pod.style.setProperty("--stem-hue", variant.stemHue);
      pod.style.setProperty("--accent-hue", variant.accentHue);
      pod.style.setProperty("--core-hue", variant.coreHue);
      pod.style.setProperty("--pod-growth", "0.42");
      pod.style.setProperty("--motion", "0.35");
      pod.classList.remove("ready", "artifact-ready");

      if (index === 3 && !slotUnlocked) {
        setText("#podSun3", "");
        setText("#podArtifact3", "★ 10");
        setText("#podId3", "START");
        return;
      }

      if (index === 3 && slotUnlocked) {
        setText("#podSun3", "ON");
        setText("#podArtifact3", "Ready");
        setText("#podId3", "OPEN");
        return;
      }

      if (isFuturePremium) {
        setText(`#podSun${index}`, "");
        setText(`#podArtifact${index}`, "Stars");
        setText(`#podId${index}`, "NEXT");
        return;
      }

      setText(`#podSun${index}`, "--");
      setText(`#podArtifact${index}`, "Empty");
      setText(`#podId${index}`, "LOCK");
      return;
    }

    const podProgress = state.plantedAt ? clamp(progress + index * 9 - (index % 2) * 14, 8, 100) : 0;
    const artifactChance = clamp(10 + index * 4 + state.artifact * 3 + Math.floor(podProgress / 14), 8, 64);
    const sunValue = clamp(54 + ((variant.coreHue + progress + index * 11) % 43), 48, 99);
    const artifactActive = podProgress >= 70 && ((state.score + index + variant.id) % 3 === 0 || progress >= 100);

    pod.style.setProperty("--leaf-hue", variant.leafHue);
    pod.style.setProperty("--stem-hue", variant.stemHue);
    pod.style.setProperty("--accent-hue", variant.accentHue);
    pod.style.setProperty("--core-hue", variant.coreHue);
    pod.style.setProperty("--pod-growth", (0.48 + podProgress / 150).toFixed(2));
    pod.style.setProperty("--pod-progress", `${podProgress}%`);
    pod.style.setProperty("--motion", motion.toFixed(2));
    pod.classList.toggle("ready", podProgress >= 100);
    pod.classList.toggle("artifact-ready", artifactActive);

    setText(`#podSun${index}`, sunValue);
    setText(`#podArtifact${index}`, artifactActive ? "NEW" : `${artifactChance}%`);
    setText(`#podId${index}`, String(variant.id + 1).padStart(3, "0"));
  });
  updateChamberNav();
}

function renderSpecimenPodsV2(progress, motion) {
  ensureFarmModel();
  document.querySelectorAll(".specimen-pod").forEach((pod, index) => {
    const slot = farmSlotAt(index);
    const strain = farmStrainById(slot.strain);
    const slotProgress = Math.round(farmSlotProgress(slot));
    const variant = PLANT_VARIANTS[(slot.plantVariant + index * 13) % PLANT_VARIANTS.length];
    const slotUnlocked = isSlotUnlocked(index);
    const unlockMeta = firstCapsuleUnlockMeta(index);
    const isPremiumLocked = Boolean(unlockMeta && !slotUnlocked);
    const isFuturePremium = index >= 4 && !unlockMeta;
    const isGrowing = Boolean(strain && slotProgress < 100);
    const isReady = Boolean(strain && slotProgress >= 100);

    pod.classList.toggle("active-pod", index === state.activeSlot);
    pod.classList.toggle("empty-pod", !strain);
    pod.classList.toggle("locked-pod", !slotUnlocked && !unlockMeta);
    pod.classList.toggle("paid-pod", isPremiumLocked);
    pod.classList.toggle("unlocked-pod", Boolean(unlockMeta && slotUnlocked));
    pod.classList.toggle("future-pod", isFuturePremium);
    pod.classList.toggle("growing", isGrowing);
    pod.classList.toggle("bursting", slot.boostUntil > Date.now());
    pod.style.setProperty("--chamber-index", index);
    pod.style.setProperty("--leaf-hue", variant.leafHue);
    pod.style.setProperty("--stem-hue", variant.stemHue);
    pod.style.setProperty("--accent-hue", variant.accentHue);
    pod.style.setProperty("--core-hue", variant.coreHue);

    if (isPremiumLocked) {
      pod.style.setProperty("--pod-growth", "0.32");
      pod.style.setProperty("--pod-progress", "0%");
      pod.style.setProperty("--motion", "0.25");
      pod.classList.remove("ready", "artifact-ready");
      setText(`#podSun${index}`, "");
      setText(`#podArtifact${index}`, unlockMeta.cost);
      setText(`#podState${index}`, unlockMeta.bonus);
      setText(`#podId${index}`, unlockMeta.title);
      return;
    }

    if (index === 3 && !slotUnlocked) {
      pod.style.setProperty("--pod-growth", "0.5");
      pod.style.setProperty("--pod-progress", "0%");
      pod.style.setProperty("--motion", "0.35");
      pod.classList.remove("ready", "artifact-ready");
      setText("#podSun3", "");
      setText("#podArtifact3", "10");
      setText("#podState3", "Buy slot");
      setText("#podId3", "START");
      return;
    }

    if (!strain) {
      pod.style.setProperty("--pod-growth", "0.28");
      pod.style.setProperty("--pod-progress", "0%");
      pod.style.setProperty("--motion", "0.25");
      pod.classList.remove("ready", "artifact-ready");
      setText(`#podSun${index}`, "--");
      setText(`#podArtifact${index}`, "Seed");
      setText(`#podState${index}`, slotUnlocked ? "Choose" : "Locked");
      setText(`#podId${index}`, slotUnlocked ? "OPEN" : "LOCK");
      return;
    }

    const artifactChance = clamp(10 + index * 4 + state.artifact * 3 + Math.floor(slotProgress / 14), 8, 72);
    const sunValue = clamp(54 + ((variant.coreHue + slotProgress + index * 11) % 43), 48, 99);
    const artifactActive = slotProgress >= 70 && ((state.score + index + variant.id) % 3 === 0 || isReady);

    pod.style.setProperty("--pod-growth", (0.48 + slotProgress / 150).toFixed(2));
    pod.style.setProperty("--pod-progress", `${slotProgress}%`);
    pod.style.setProperty("--motion", motion.toFixed(2));
    pod.classList.toggle("ready", isReady);
    pod.classList.toggle("artifact-ready", artifactActive);

    setText(`#podSun${index}`, sunValue);
    setText(`#podArtifact${index}`, isReady ? "READY" : `${artifactChance}%`);
    setText(`#podState${index}`, isReady ? "Harvest" : `${slotProgress}% grow`);
    setText(`#podId${index}`, strain.shortName);
  });
  updateChamberNav();
}

function scrollSpecimenChambers(direction) {
  const grid = $("#specimenGrid");
  if (!grid) return;

  const podWidth = grid.querySelector(".specimen-pod")?.getBoundingClientRect().width || 140;
  grid.scrollBy({
    left: direction * (podWidth + 14),
    behavior: "smooth"
  });
  playTone("tap");
  window.setTimeout(updateChamberNav, 260);
}

function updateChamberNav() {
  const grid = $("#specimenGrid");
  const prev = $("#chamberPrevBtn");
  const next = $("#chamberNextBtn");
  if (!grid || !prev || !next) return;

  const maxScroll = Math.max(0, grid.scrollWidth - grid.clientWidth - 2);
  prev.disabled = grid.scrollLeft <= 2;
  next.disabled = grid.scrollLeft >= maxScroll;
}

function renderCapsuleBaseCubes(progress) {
  document.querySelectorAll(".capsule-base i").forEach((cube, index) => {
    const fill = clamp(progress * 6 - index * 100, 0, 100);
    cube.style.setProperty("--cube-fill", `${fill}%`);
    cube.classList.toggle("active", fill > 0);
    cube.classList.toggle("full", fill >= 100);
  });
}

function renderTokenFlow(progress, secondsLeft) {
  const map = $("#tokenFlowMap");
  if (!map) return;

  const level = safeDroneLevel();
  const isBoosting = state.boostUntil > Date.now();
  const isGrowing = Boolean(state.plantedAt && progress < 100);
  const isReady = progress >= 100;
  const reservoirFill = clamp(Math.round((state.energy / 30) * 100), 0, 100);
  const pipeFill = isReady
    ? 100
    : isGrowing
      ? clamp(Math.round(progress + 16 + level * 3), 20, 98)
      : clamp(Math.round(reservoirFill / 2), 8, 44);
  const pressure = clamp(24 + level * 7 + (isGrowing ? 24 : 0) + (isBoosting ? 20 : 0), 18, 100);
  const speed = Math.max(3.8, 9 - level * 0.45 - (isBoosting ? 1.5 : 0));

  map.classList.toggle("flow-active", isGrowing);
  map.classList.toggle("flow-ready", isReady);
  map.classList.toggle("flow-low", state.energy <= 2);
  map.style.setProperty("--token-fill", `${reservoirFill}%`);
  map.style.setProperty("--token-pipe", `${pipeFill}%`);
  map.style.setProperty("--token-pressure", `${pressure}%`);
  map.style.setProperty("--token-speed", `${speed.toFixed(1)}s`);

  setText("#tokenPoolValue", `${reservoirFill}%`);
  setText("#tokenFarmValue", isReady ? "MAX" : isGrowing ? `${secondsLeft}s` : "Idle");
  setText("#tokenDroneValue", `L${level}`);
  setResourceNumber("#tokenZenValue", state.resonance);
}

function renderMutationLabLegacyUnused(progress) {
  const variant = currentPlantVariant();
  const recipe = labRecipe();
  const inventory = normalizeInventory(state.inventory);
  const labLevel = 4 + Math.min(9, state.artifact);
  const uniqueCount = Math.max(0, Math.floor(Number(state.labUniqueMutations) || 0));
  const fusionProgress = clamp(46 + state.artifact * 7 + uniqueCount * 3 + Math.round(progress / 5), 42, 99);
  const rareChance = clamp(12 + state.artifact * 3 + uniqueCount * 6 + Math.round(progress / 12), 12, 88);
  const familyA = ["Neon Lettuce", "Crystal Sprout", "Solar Moss", "Aqua Fern"][variant.id % 4];
  const familyB = ["Prism Root", "Glow Chard", "Lunar Mint", "Cyan Basil"][(variant.id + state.artifact) % 4];
  const tier = rareChance >= 72 ? "Unique chance" : rareChance >= 42 ? "Epic chance" : rareChance >= 24 ? "Rare chance" : "Stable chance";
  const rareActive = state.labRareUntil > Date.now();

  setText("#fusionProgressLabel", `${fusionProgress}%`);
  setStyle("#fusionProgressBar", "--fusion", `${fusionProgress}%`);
  setText("#fusionDnaA", `DNA A: ${familyA} · Recipe ${recipe.result}`);
  setText("#fusionDnaB", `DNA B: ${familyB} · ${labStoredSummary(recipe, inventory)}`);
  setText("#rareChance", `${rareChance}%`);
  setText("#mutationTier", tier);
  setText("#labLevelValue", labLevel);
  setText("#labUpgradeLevelValue", labLevel);
  setText("#nanoReactorLevel", `R${labLevel}`);
  setText("#nanoUpgradeLevel", `L${labLevel}`);
  setText("#nanoChamberState", activeJob ? (jobState.ready ? "DONE" : `${Math.round(jobState.progress * 100)}%`) : "1/3");
  setText("#nanoStarsState", zenEnergyBalance() > 0 ? "ZEN" : "ST");
  setText("#mutationAutoState", state.mutationAuto ? "On" : "Off");
  setText("#uniqueMutationCount", `${uniqueCount} rare cores`);
  setText("#labActionState", synthState.label);
  setText("#labActiveRecipeTitle", recipe.name);
  setText("#labActiveRecipeNote", recipe.note || "Check the formula inputs and run the capsule when all lines are ready.");
  setText("#fusionDnaA", `${recipe.modeLabel || "Fusion"} formula: ${recipe.result}`);
  setText("#fusionDnaB", `${familyA} feed · ${labStoredSummary(recipe, inventory)}`);
  setText("#mutationTier", `${tier} · ${recipe.modeLabel || "Fusion"}`);
  setText("#labFormulaState", `Target result: ${recipe.result}`);
  setText(
    "#labActiveRecipeNote",
    canSynth
      ? (recipe.note || "All lines are stable. Launch the capsule to create a new result.")
      : synthState.detail
  );
  setText("#labRequirementSummary", `${readyRequirements}/${requirements.length} ready`);
  setText("#labOutputSectionState", recipe.output || "Lab output");
  setText("#labMapState", zenLink.tag);
  setText("#labOutputType", recipe.output || "Lab output");
  setText("#labOutputName", recipe.result);
  setText("#labOutputEffect", labEffectSummary(recipe));
  setText("#labOutputZenTag", zenLink.tag);
  setText("#labOutputZenLink", zenLink.text);
  setText("#labActionState", synthState.label);
  setText("#labActiveRecipeTitle", recipe.name);
  setText("#labActiveRecipeNote", recipe.note || "Check the formula inputs and run the capsule when all lines are ready.");
  setText("#labOutputType", recipe.output || "Lab output");
  setText("#labOutputName", recipe.result);
  setText("#labOutputEffect", labEffectSummary(recipe));
  setText("#labOutputZenTag", zenLink.tag);
  setText("#labOutputZenLink", zenLink.text);
  setText("#synthCostLabel", labRecipeSummary(recipe));
  setText("#synthBoostLabel", zenEnergyBalance() > 0 ? `GS ${labGeneCost()} / CRC ${labEnergyCost()} / SE ${labSeCost()} / Zen` : `GS ${labGeneCost()} / CRC ${labEnergyCost()} / SE ${labSeCost()}`);
  setText("#synthBoostLabel", zenEnergyBalance() > 0 ? `GS ${labGeneCost()} · Energy ${labEnergyCost()} · Zen` : `GS ${labGeneCost()} · Energy ${labEnergyCost()}`);
  setText("#synthBoostLabel", zenEnergyBalance() > 0 ? `GS ${labGeneCost()} / CRC ${labEnergyCost()} / SE ${labSeCost()} / Zen` : `GS ${labGeneCost()} / CRC ${labEnergyCost()} / SE ${labSeCost()}`);
  setHTML("#synthBoostLabel", resourceCostListHtml([
    { type: "gs", value: labGeneCost() },
    { type: "crc", value: labEnergyCost() },
    { type: "se", value: labSeCost() },
    ...(zenEnergyBalance() > 0 ? [{ type: "zen", value: 1 }] : [])
  ]));
  setText("#synthCostLabel", `Create ${recipe.result}`);
  setText("#synthActionHint", synthState.detail);
  setText("#synthCostLabel", activeJob ? (jobState.ready ? "Claim artifact" : "Synthesis running") : canSynth ? "Launch synthesis" : synthState.label);
  setText("#synthBoostLabel", activeJob ? jobRecipe.result : `Create ${recipe.result}`);
  setText("#synthActionHint", `Cost: ${synthCosts.join(" · ")}`);
  setClass("#mutationAutoBtn", "active", state.mutationAuto);
  setClass("#labRoom", "rare-active", rareActive);

  const strip = $("#labHarvestStrip");
  if (strip) {
    strip.innerHTML = recipe.materials.map((entry) => {
      const material = labMaterialById(entry.id);
      const count = labMaterialCount(entry.id, inventory);
      const ready = count >= entry.amount;
      return `
        <div class="lab-mat-chip ${ready ? "ready" : ""}" style="--mat-color:${escapeHtml(material?.color || "#7effde")}">
          <strong>${escapeHtml(material?.short || entry.id)}</strong>
          <span>${count}/${entry.amount}</span>
        </div>
      `;
    }).join("");
  }
}

function renderMutationLab(progress) {
  const variant = currentPlantVariant();
  const recipe = labRecipe();
  const inventory = normalizeInventory(state.inventory);
  const labLevel = 4 + Math.min(9, state.artifact);
  const uniqueCount = Math.max(0, Math.floor(Number(state.labUniqueMutations) || 0));
  state.labInventoryCategory = normalizeLabInventoryCategory(state.labInventoryCategory);
  const fusionProgress = clamp(
    46 + state.artifact * 7 + uniqueCount * 3 + Math.round(progress / 5)
      + (recipe.effect?.type === "serum" ? 8 : 0)
      + (labRecipeReady(recipe, inventory) ? 4 : 0),
    42,
    99
  );
  const rareChance = clamp(
    12 + state.artifact * 3 + uniqueCount * 6 + Math.round(progress / 12)
      + (recipe.effect?.type === "catalyst" ? 18 : 0)
      - (recipe.effect?.type === "serum" ? 4 : 0),
    12,
    88
  );
  const familyA = ["Neon Lettuce", "Crystal Sprout", "Solar Moss", "Aqua Fern"][variant.id % 4];
  const tier = rareChance >= 72 ? "Unique chance" : rareChance >= 42 ? "Epic chance" : rareChance >= 24 ? "Rare chance" : "Stable chance";
  const rareActive = state.labRareUntil > Date.now();
  const serumProgress = clamp(
    18 + safeDataModuleLevel() * 7 + Math.round(progress / 4) + (recipe.effect?.type === "serum" ? 22 : 0),
    8,
    100
  );
  const catalystProgress = clamp(
    14 + uniqueCount * 8 + state.artifact * 4 + (rareActive ? 20 : 0) + (recipe.effect?.type === "catalyst" ? 16 : 0),
    8,
    100
  );
  const synthState = labSynthState(recipe, inventory);
  const canSynth = synthState.ok;
  const activeJob = labActiveJob();
  const jobRecipe = activeJob ? labRecipeById(activeJob.recipeId) || recipe : recipe;
  const jobState = labJobProgress(activeJob);
  const formulaSync = clamp(
    Math.round((fusionProgress + serumProgress + catalystProgress + rareChance) / 4),
    1,
    99
  );
  const formulaFactors = [
    ...(labEnergyCost() > 0 ? [{
      type: "crc",
      label: "A1 CRC",
      value: `${Math.min(state.energy, labEnergyCost())}/${labEnergyCost()}`,
      power: clamp(Math.round((state.energy / Math.max(1, labEnergyCost())) * 100), 0, 100)
    }] : []),
    {
      type: "se",
      label: "A2 SE",
      value: `${Math.min(state.seed, labSeCost())}/${labSeCost()}`,
      power: clamp(Math.round((state.seed / Math.max(1, labSeCost())) * 100), 0, 100)
    },
    {
      type: "zen",
      label: "ω Zen",
      value: zenEnergyBalance() > 0 ? `x${zenEnergyBalance()}` : "0",
      power: clamp(zenEnergyBalance() * 34, 0, 100)
    },
    {
      type: "lab",
      label: "L Lab",
      value: `L${labLevel}`,
      power: clamp(labLevel * 8, 0, 100)
    }
  ];
  const zenLink = labZenLinkSummary(recipe);
  const requirements = labRequirementItems(recipe, inventory);
  const readyRequirements = requirements.filter((item) => item.ready).length;
  const synthCosts = [
    `${labGeneCost()} GS`,
    ...(labEnergyCost() > 0 ? [`${labEnergyCost()} CRC`] : []),
    `${labSeCost()} SE`,
    ...(zenEnergyBalance() > 0 ? ["1 ZEN"] : [])
  ];

  setText("#fusionProgressLabel", `${fusionProgress}%`);
  setStyle("#fusionProgressBar", "--fusion", `${fusionProgress}%`);
  setText("#fusionDnaA", `${recipe.modeLabel || "Fusion"}: ${recipe.result} · ${familyA}`);
  setText("#fusionDnaB", `${recipe.note || "Lab recipe"} · ${labStoredSummary(recipe, inventory)}`);
  setText("#rareChance", `${rareChance}%`);
  setText("#mutationTier", `${tier} · ${recipe.modeLabel || "Fusion"}`);
  setText("#labFormulaState", `Collapse: ${recipe.result}`);
  setText("#labFormulaSync", `SYNC ${formulaSync}%`);
  setText("#labLevelValue", labLevel);
  setText("#labUpgradeLevelValue", labLevel);
  setText("#nanoReactorLevel", `R${labLevel}`);
  setText("#nanoUpgradeLevel", `L${labLevel}`);
  setText("#nanoChamberState", activeJob ? (jobState.ready ? "DONE" : `${Math.round(jobState.progress * 100)}%`) : "1/3");
  setText("#nanoStarsState", zenEnergyBalance() > 0 ? "ZEN" : "ST");
  setText("#mutationAutoState", state.mutationAuto ? "On" : "Off");
  setText("#uniqueMutationCount", `${uniqueCount} rare cores`);
  setText("#labActionState", synthState.label);
  setText("#labActiveRecipeTitle", recipe.name);
  setText("#labActiveRecipeNote", recipe.note || "Check the formula inputs and run the capsule when all lines are ready.");
  setText("#fusionDnaA", `${recipe.modeLabel || "Fusion"} formula: ${recipe.result}`);
  setText("#fusionDnaB", `${familyA} feed · ${labStoredSummary(recipe, inventory)}`);
  setText("#mutationTier", `${tier} · ${recipe.modeLabel || "Fusion"}`);
  setText("#labFormulaState", `Target result: ${recipe.result}`);
  setText(
    "#labActiveRecipeNote",
    canSynth
      ? (recipe.note || "All lines are stable. Launch the capsule to create a new result.")
      : synthState.detail
  );
  setText("#labRequirementSummary", `${readyRequirements}/${requirements.length} ready`);
  setText("#labOutputSectionState", recipe.output || "Lab output");
  setText("#labMapState", zenLink.tag);
  setText("#labOutputType", recipe.output || "Lab output");
  setText("#labOutputName", recipe.result);
  setText("#labOutputEffect", labEffectSummary(recipe));
  setText("#labOutputZenTag", zenLink.tag);
  setText("#labOutputZenLink", zenLink.text);
  setText("#synthCostLabel", `${recipe.result} · ${recipe.output || "Lab output"}`);
  setHTML("#synthBoostLabel", resourceCostListHtml([
    { type: "gs", value: labGeneCost() },
    ...(labEnergyCost() > 0 ? [{ type: "crc", value: labEnergyCost() }] : []),
    { type: "se", value: labSeCost() },
    ...(zenEnergyBalance() > 0 ? [{ type: "zen", value: 1 }] : [])
  ]));
  setText("#synthCostLabel", `Create ${recipe.result}`);
  setText("#synthActionHint", synthState.detail);
  setText("#synthCostLabel", activeJob ? (jobState.ready ? "Claim artifact" : "Synthesis running") : canSynth ? "Launch synthesis" : synthState.label);
  setText("#synthBoostLabel", activeJob ? jobRecipe.result : `Create ${recipe.result}`);
  setText("#synthActionHint", activeJob ? (jobState.ready ? "Capsule stabilized. Claim the result." : `ETA ${labFormatClock(jobState.remainingMs)}`) : `Cost: ${synthCosts.join(" / ")}`);
  setText("#labReactorTimer", activeJob ? (jobState.ready ? "CLAIM" : labFormatClock(jobState.remainingMs)) : labFormatClock(labRecipeDurationMs(recipe)));
  setClass("#mutationAutoBtn", "active", state.mutationAuto);
  setClass("#labRoom", "rare-active", rareActive);
  setClass("#labRoom", "synth-ready", canSynth || jobState.ready);
  setClass("#labRoom", "synth-blocked", !canSynth && !activeJob);
  setClass("#labRoom", "synth-running", Boolean(activeJob && !jobState.ready));
  setClass("#labRoom", "synth-claim", Boolean(jobState.ready));
  setStyle("#labRoom", "--lab-accent", jobRecipe.accent || recipe.accent || "#7effde");
  setStyle("#labRoom", "--reactor-progress", `${Math.round(jobState.progress * 100)}%`);
  const labRoom = $("#labRoom");
  if (labRoom) labRoom.dataset.labMode = jobRecipe.effect?.type || recipe.effect?.type || "artifact";
  renderLabInventoryBar(inventory, uniqueCount);
  renderLabSynthesisPanel(recipe, inventory, activeJob);
  renderLabInventory(recipe, inventory, uniqueCount);
  updateLabScene(buildLabSceneState({
    recipe,
    inventory,
    fusionProgress,
    serumProgress,
    catalystProgress,
    formulaSync,
    rareChance,
    rareActive,
    canSynth
  }));

  const synthButton = $("#synthBtn");
  if (synthButton) {
    synthButton.disabled = Boolean(activeJob && !jobState.ready) || (!activeJob && !canSynth);
    synthButton.classList.toggle("ready", canSynth || jobState.ready);
    synthButton.classList.toggle("blocked", !canSynth && !activeJob);
    synthButton.classList.toggle("running", Boolean(activeJob && !jobState.ready));
    synthButton.classList.toggle("claim", Boolean(jobState.ready));
    const label = synthButton.querySelector("b");
    if (label) label.textContent = activeJob ? (jobState.ready ? "Claim" : "Synthesizing") : "Synthesize";
  }

  document.querySelectorAll(".lab-chamber").forEach((chamber, index) => {
    const isPrimary = index === 0;
    chamber.classList.toggle("running", isPrimary && Boolean(activeJob && !jobState.ready));
    chamber.classList.toggle("claim", isPrimary && Boolean(jobState.ready));
    chamber.classList.toggle("active", isPrimary && !activeJob);
  });

  const strip = $("#labHarvestStrip");
  if (strip) {
    strip.innerHTML = recipe.materials.map((entry) => {
      const material = labMaterialById(entry.id);
      const count = labMaterialCount(entry.id, inventory);
      const ready = count >= entry.amount;
      return `
        <div class="lab-mat-chip ${ready ? "ready" : ""}" style="--mat-color:${escapeHtml(material?.color || "#7effde")}">
          <strong>${escapeHtml(material?.short || entry.id)}</strong>
          <span>${count}/${entry.amount}</span>
        </div>
      `;
    }).join("");
  }

  const requirementList = $("#labRequirementList");
  if (requirementList) {
    requirementList.innerHTML = requirements.map((item) => `
      <article class="lab-req-item ${item.ready ? "ready" : "blocked"}" style="--req-color:${escapeHtml(item.color)}">
        <span>${escapeHtml(item.label)}</span>
        <strong>${escapeHtml(item.value)}</strong>
        <em>${escapeHtml(item.name)}</em>
      </article>
    `).join("");
  }

  const lastResult = $("#labLastResult");
  if (lastResult) {
    if (lastLabSynthesis) {
      const linkSuffix = lastLabSynthesis.zenLinked ? " / Zen linked" : "";
      lastResult.textContent = `Last result: ${lastLabSynthesis.result}${lastLabSynthesis.meta}${linkSuffix}`;
    } else {
      lastResult.textContent = canSynth
        ? "Launch the capsule to mint this result."
        : "Load every requirement above to unlock the launch.";
    }
  }

  const recipeGrid = $("#labRecipeGrid");
  if (recipeGrid) {
    recipeGrid.innerHTML = LAB_RECIPES.map((entry) => {
      const active = entry.id === recipe.id;
      const ready = labRecipeReady(entry, inventory);
      return `
        <button
          class="lab-recipe-card ${active ? "active" : ""} ${ready ? "ready" : ""}"
          type="button"
          data-lab-recipe="${entry.id}"
          style="--recipe-accent:${escapeHtml(entry.accent || "#7effde")}"
          aria-pressed="${active ? "true" : "false"}"
        >
          <span>${escapeHtml(entry.modeLabel || "Lab")}</span>
          <strong>${escapeHtml(entry.name)}</strong>
          <small>${escapeHtml(entry.result)}</small>
          <em>${ready ? "Ready" : escapeHtml(labRecipeSummary(entry))}</em>
        </button>
      `;
    }).join("");
  }

  const formulaPanel = $("#labFormulaFactors");
  if (formulaPanel) {
    formulaPanel.innerHTML = formulaFactors.map((factor) => `
      <span class="formula-factor ${factor.power >= 100 ? "ready" : ""}" style="--factor-power:${factor.power}%">
        <i class="formula-factor-icon ${escapeHtml(factor.type)}"></i>
        <b>${escapeHtml(factor.label)}</b>
        <em>${escapeHtml(factor.value)}</em>
      </span>
    `).join("");
  }

  const mutationMap = $("#labMutationMap");
  if (mutationMap) {
    const branches = [
      {
        id: "fusion",
        label: "Fusion",
        progress: fusionProgress,
        accent: "#7effde",
        status: recipe.effect?.type === "artifact" ? recipe.result : "Core map",
        note: `Artifact depth ${Math.max(1, state.artifact)}`
      },
      {
        id: "growth",
        label: "Growth",
        progress: serumProgress,
        accent: "#58dcff",
        status: recipe.effect?.type === "serum" ? "Active serum" : "Capsule line",
        note: `${labGrowingTargets().length} live slots`
      },
      {
        id: "rare",
        label: "Rare",
        progress: catalystProgress,
        accent: "#ffd670",
        status: recipe.effect?.type === "catalyst" ? "Catalyst" : `${rareChance}% chance`,
        note: rareActive ? "Window open" : `${uniqueCount} rare cores`
      }
    ];

    mutationMap.innerHTML = branches.map((branch) => `
      <article class="lab-path-card ${recipe.effect?.type === branch.id || (branch.id === "fusion" && recipe.effect?.type === "artifact") ? "active" : ""}" style="--path-accent:${branch.accent}; --path-progress:${branch.progress}%">
        <div class="lab-path-head">
          <b>${escapeHtml(branch.label)}</b>
          <span>${branch.progress}%</span>
        </div>
        <div class="lab-path-bar"><i class="lab-path-fill"></i></div>
        <small>${escapeHtml(branch.status)} · ${escapeHtml(branch.note)}</small>
      </article>
    `).join("");
  }
}

function completeZenSession() {
  const reward = 3 + Math.min(9, state.artifact);
  const dnaHits = Math.max(0, Math.floor(Number(state.zenSessionDna) || 0));
  const energyBonus = 1 + Math.min(5, Math.floor(dnaHits / 3));
  const artifactBonus = Math.min(3, Math.floor(state.artifact / 2));
  const totalZenEnergy = energyBonus + artifactBonus;
  const crcReward = zenCrcRewardBreakdown(state.zenDuration || ZEN_DEFAULT_DURATION_MS, state.zenDnaClaims || {});
  state.sessions += 1;
  state.resonance += reward + totalZenEnergy;
  state.energy += crcReward.total;
  state.zenEnergy = zenEnergyBalance() + totalZenEnergy;
  trackAction("zen_completed", {
    reward,
    crcReward: crcReward.total,
    doubledMinutes: crcReward.doubledMinutes,
    energyBonus: totalZenEnergy,
    artifactBonus,
    dnaHits,
    durationMs: state.zenDuration || ZEN_DEFAULT_DURATION_MS
  });
  state.zenStartedAt = 0;
  state.zenPausedAt = 0;
  state.zenElapsed = 0;
  state.zenSessionDna = 0;
  state.zenDnaClaims = {};
  stopZenAmbient(2.2);
  playTone("zen");
  toast(`CRC +${crcReward.total} · Zen +${reward} · Energy +${totalZenEnergy}`);
}

function renderZen() {
  const elapsed = zenElapsed();
  const duration = state.zenDuration || ZEN_DEFAULT_DURATION_MS;
  const isActive = state.zenStartedAt > 0;
  const isPaused = state.zenPausedAt > 0;
  const progress = clamp((elapsed / duration) * 100, 0, 100);
  const phase = zenPhase(elapsed);
  const remaining = Math.max(0, duration - elapsed);
  const crcProjection = zenCrcRewardBreakdown(duration, state.zenDnaClaims || {});

  if (isActive && !isPaused && elapsed >= duration) {
    completeZenSession();
    return;
  }

  setText("#zenTimer", formatTime(remaining || duration));
  setText("#zenPhase", isActive ? phase.label : "Breathe");
  setText("#zenSessionTimer", formatTime(remaining || duration));
  setText("#zenSessionPhase", isActive ? phase.label : "Ready");
  setText("#zenActionIcon", isActive && !isPaused ? "\u23f8" : "\u25ce");
  setText("#zenActionText", isActive ? (isPaused ? "Resume" : "Pause") : "Start");
  setText("#zenState", isActive ? (isPaused ? "Paused" : phase.label) : state.sessions > 0 ? `x${state.sessions}` : "Calm");
  setText("#zenDepthValue", Math.round(progress));
  setText("#zenFlowValue", isActive ? phase.label : "Quiet");
  setText("#zenRewardValue", `+${crcProjection.total}`);
  setText("#zenPotLevel", `N${clamp(1 + Math.floor((state.sessions || 0) / 3), 1, 9)}`);
  setStyle("#zenOrb", "--zen-progress", `${progress}%`);
  setStyle("#zenOrb", "--zen-scale", phase.scale.toFixed(3));
  setStyle("#zenBreathLine", "--breath", `${phase.breathProgress}%`);
  setStyle("#zenRoom", "--zen-progress", `${progress}%`);
  setClass("#zenRoom", "zen-running", isActive && !isPaused);
  setClass("#zenRoom", "zen-paused", isPaused);

  const zenGene = normalizeZenGene(state.zenGene);
  const zenRoom = $("#zenRoom");
  if (zenRoom) {
    ZEN_GENE_OPTIONS.forEach((gene) => zenRoom.classList.toggle(`zen-gene-${gene}`, gene === zenGene));
  }

  if (isActive && !isPaused && $(".app")?.classList.contains("room-zen")) {
    startZenAmbient();
  } else if (!isActive || isPaused || !state.soundOn) {
    stopZenAmbient(isPaused ? 0.7 : 1.4);
  }

  document.querySelectorAll(".zen-mode").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.zenDuration) === duration);
    button.disabled = isActive && !isPaused;
  });

  document.querySelectorAll(".zen-sound").forEach((button) => {
    button.classList.toggle("active", button.dataset.zenSound === normalizeZenSound(state.zenSound));
  });

  document.querySelectorAll(".zen-gene-card").forEach((button) => {
    button.classList.toggle("active", button.dataset.zenGene === zenGene);
  });

  const dnaVisible = zenDnaIsVisible(elapsed, isActive, isPaused);
  document.querySelectorAll(".zen-dna-target").forEach((button) => {
    const index = Number(button.dataset.dnaIndex) || 0;
    const claimed = Boolean(state.zenDnaClaims?.[zenDnaClaimKey(elapsed, index)]);
    button.classList.toggle("active", dnaVisible && !claimed);
    button.classList.toggle("claimed", dnaVisible && claimed);
    button.disabled = !dnaVisible || claimed;
  });
}

function renderMissions() {
  const grid = $("#missionsGrid");
  const now = Date.now();
  const claimed = claimedMissionCount();
  const totalEnergy = MISSIONS.reduce((sum, mission) => sum + (state.missions.claimed[mission.id] ? Number(mission.reward.energy || 0) : 0), 0);

  setText("#missionsClaimed", `${claimed}/${MISSIONS.length}`);
  setText("#missionsEnergy", `+${totalEnergy}`);
  setStyle("#missionsProgress", "--missions-progress", `${(claimed / Math.max(1, MISSIONS.length)) * 100}%`);

  if (!grid) return;
  grid.innerHTML = MISSIONS.map((mission) => {
    const openedAt = Number(state.missions.opened[mission.id] || 0);
    const claimedMission = Boolean(state.missions.claimed[mission.id]);
    const readyAt = openedAt + MISSION_WAIT_MS;
    const secondsLeft = Math.max(0, Math.ceil((readyAt - now) / 1000));
    const isReady = openedAt > 0 && secondsLeft <= 0;
    const status = claimedMission ? "Claimed" : isReady ? "Ready" : openedAt ? `${secondsLeft}s` : "Locked";

    return `
      <article class="mission-card ${claimedMission ? "claimed" : ""} ${isReady ? "ready" : ""}" data-mission="${mission.id}">
        <div class="mission-icon ${mission.type}">${missionIcon(mission.type)}</div>
        <div class="mission-copy">
          <span>${escapeHtml(mission.note)}</span>
          <strong>${escapeHtml(mission.title)}</strong>
          <small>${missionRewardHtml(mission)}</small>
        </div>
        <b class="mission-status">${escapeHtml(status)}</b>
        <div class="mission-actions">
          <button type="button" data-open-mission="${mission.id}" ${claimedMission ? "disabled" : ""}>${escapeHtml(mission.label)}</button>
          <button type="button" data-claim-mission="${mission.id}" ${!isReady || claimedMission ? "disabled" : ""}>Claim</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderDrone() {
  const level = safeDroneLevel();
  const skin = droneSkinById();
  const cost = droneUpgradeCost(level);
  const speedSeconds = Math.round(droneSpeedBonus(level) / 100) / 10;
  const harvestBonus = droneHarvestBonus(level);
  const canUpgrade = level < 9 && state.score >= cost.score && state.energy >= cost.energy;

  setText("#droneLevelBadge", `L${level}`);
  setText("#droneSheetLevel", `Level ${level}`);
  setText("#droneSpeedValue", `-${speedSeconds}s`);
  setText("#droneHarvestValue", `+${harvestBonus}`);
  setText("#droneCostValue", level >= 9 ? "MAX" : `${cost.score} CRC · ${cost.energy} energy`);
  setHTML("#droneCostValue", level >= 9 ? "MAX" : resourceCostListHtml([
    { type: "main", value: cost.score },
    { type: "crc", value: cost.energy }
  ]));
  setText("#droneUpgradeText", level >= 9 ? "Max level" : "Upgrade");
  setText("#droneSignalValue", state.plantedAt ? "Scanning" : "Idle");
  setText("#droneSkinName", skin.name);
  setText("#droneSkinNote", skin.note);
  setText("#droneSkinValue", skin.tag);
  setClass("#capsuleDrone", "active", Boolean(state.plantedAt));
  setClass("#capsuleDrone", "ready", growthProgress() >= 100);
  setStyle("#capsuleDrone", "--drone-power", `${Math.min(100, 26 + level * 8)}%`);

  const drone = $("#capsuleDrone");
  if (drone) {
    drone.dataset.level = String(level);
    drone.dataset.tier = String(Math.min(5, Math.ceil(level / 2)));
    drone.dataset.skin = skin.id;
  }

  setText("#donorDroneLevelBadge", `L${level}`);
  const donorDrone = $("#donorDroneBtn");
  if (donorDrone) {
    donorDrone.dataset.level = String(level);
    donorDrone.dataset.tier = String(Math.min(5, Math.ceil(level / 2)));
    donorDrone.dataset.skin = skin.id;
    donorDrone.classList.toggle("active", Boolean(state.plantedAt));
    donorDrone.classList.toggle("ready", growthProgress() >= 100);
  }

  const miniDrone = $(".mini-drone");
  if (miniDrone) miniDrone.dataset.skin = skin.id;
  const sheet = $("#droneSheet");
  if (sheet) sheet.dataset.skin = skin.id;

  renderDroneSkins(skin.id);

  const button = $("#droneUpgradeBtn");
  if (button) button.disabled = !canUpgrade;
}

function renderDroneSkins(activeId = normalizeDroneSkin()) {
  const grid = $("#droneSkinGrid");
  if (!grid) return;
  const ownedSkins = normalizeOwnedDroneSkins();

  grid.innerHTML = DRONE_SKINS.map((skin) => {
    const active = skin.id === activeId;
    const locked = Boolean(skin.premium && !ownedSkins[skin.id]);
    const price = Math.max(1, Math.floor(Number(skin.stars) || 50));
    return `
      <button class="drone-skin-card ${active ? "active" : ""} ${locked ? "locked premium" : ""}" type="button" data-drone-skin="${skin.id}" aria-pressed="${active ? "true" : "false"}">
        <span class="skin-swatch skin-${skin.id}" aria-hidden="true"><i></i><b></b></span>
        <strong>${escapeHtml(skin.name)}</strong>
        <small>${escapeHtml(locked ? `★ ${price}` : skin.route)}</small>
        <em>${escapeHtml(locked ? "Unlock" : skin.effect)}</em>
      </button>
    `;
  }).join("");
}

function selectDroneSkin(id) {
  const skin = droneSkinById(id);
  const ownedSkins = normalizeOwnedDroneSkins();
  if (skin.premium && !ownedSkins[skin.id]) {
    playTone("stars");
    toast(`${skin.name} / ★ ${skin.stars || 50}`);
    trackAction("drone_skin_purchase_started", {
      skin: skin.id,
      productId: skin.productId || "drone_skin_tech_50",
      stars: skin.stars || 50
    });
    buyStarsProduct(skin.productId || "drone_skin_tech_50");
    return;
  }
  state.droneSkin = skin.id;
  playTone(skin.id === "aurora" || skin.id === "tech" ? "boost" : "tap");
  toast(`${skin.name} skin`);
  trackAction("drone_skin_selected", {
    skin: skin.id,
    route: skin.route
  });
  render();
  scheduleBackendSync(true);
}

function upgradeDrone() {
  const level = safeDroneLevel();
  if (level >= 9) {
    toast("Drone max");
    return;
  }

  const cost = droneUpgradeCost(level);
  if (state.score < cost.score || state.energy < cost.energy) {
    toast("Need resources");
    trackAction("drone_upgrade_blocked", {
      level,
      needScore: cost.score,
      needEnergy: cost.energy,
      score: state.score,
      energy: state.energy
    });
    render();
    return;
  }

  state.score -= cost.score;
  state.energy -= cost.energy;
  state.droneLevel = level + 1;
  playTone("boost");
  toast(`Drone L${state.droneLevel}`);
  trackAction("drone_upgraded", {
    level: state.droneLevel,
    spentScore: cost.score,
    spentEnergy: cost.energy
  });
  render();
  scheduleBackendSync(true);
}

function renderDataModule(progress = growthProgress()) {
  const level = safeDataModuleLevel();
  const cost = dataModuleUpgradeCost(level);
  const syncActive = Boolean(state.plantedAt && progress < 100);
  const ready = progress >= 100;
  const signal = syncActive ? "SYNC" : ready ? "READY" : "IDLE";
  const canUpgrade = level < 9 && state.score >= cost.score && state.resonance >= cost.resonance;

  setText("#dataModuleLevelBadge", `D${level}`);
  setText("#dataModuleSignal", signal);
  setText("#dataModuleSheetLevel", `Capsule level ${level}`);
  setText("#dataSyncValue", signal);
  setText("#dataSignalValue", `+${dataModuleSignalBonus(level)}%`);
  setText("#dataMemoryValue", String(8 + level * 4));
  setText("#dataModuleCostValue", level >= 9 ? "MAX" : `${cost.score} CRC · ${cost.resonance} ZEN`);
  setHTML("#dataModuleCostValue", level >= 9 ? "MAX" : resourceCostListHtml([
    { type: "main", value: cost.score },
    { type: "zen", value: cost.resonance }
  ]));
  setText("#dataModuleUpgradeText", level >= 9 ? "Max capsule" : "Upgrade capsule");
  setClass("#plantCapsule", "data-syncing", syncActive);
  setClass("#plantCapsule", "data-ready", ready);

  const module = $("#dataModuleBtn");
  if (module) {
    module.dataset.level = String(level);
    module.dataset.signal = signal.toLowerCase();
  }

  const button = $("#dataModuleUpgradeBtn");
  if (button) button.disabled = !canUpgrade;
}

function upgradeDataModule() {
  const level = safeDataModuleLevel();
  if (level >= 9) {
    toast("Core max");
    return;
  }

  const cost = dataModuleUpgradeCost(level);
  if (state.score < cost.score || state.resonance < cost.resonance) {
    toast("Need core resources");
    trackAction("data_module_upgrade_blocked", {
      level,
      needScore: cost.score,
      needResonance: cost.resonance,
      score: state.score,
      resonance: state.resonance
    });
    render();
    return;
  }

  state.score -= cost.score;
  state.resonance -= cost.resonance;
  state.dataModuleLevel = level + 1;
  playTone("boost");
  toast(`Core D${state.dataModuleLevel}`);
  trackAction("data_module_upgraded", {
    level: state.dataModuleLevel,
    spentScore: cost.score,
    spentResonance: cost.resonance
  });
  render();
  scheduleBackendSync(true);
}

function missionIcon(type) {
  const icons = {
    telegram: "✈",
    youtube: "▶",
    instagram: "◉",
    tiktok: "♪"
  };
  return icons[type] || "✦";
}

function openMission(id) {
  const mission = MISSIONS.find((item) => item.id === id);
  if (!mission) return;

  state.missions.opened[mission.id] = Date.now();
  playTone("tap");
  toast("Mission opened");
  trackAction("mission_opened", {
    missionId: mission.id,
    missionType: mission.type,
    rewardEnergy: mission.reward.energy || 0
  });

  if (tg?.openLink) {
    tg.openLink(mission.url);
  } else {
    window.open(mission.url, "_blank", "noopener");
  }
  render();
}

function claimMission(id) {
  const mission = MISSIONS.find((item) => item.id === id);
  if (!mission || state.missions.claimed[mission.id]) return;

  const openedAt = Number(state.missions.opened[mission.id] || 0);
  if (!openedAt || Date.now() - openedAt < MISSION_WAIT_MS) {
    toast("Open mission first");
    return;
  }

  state.energy += Number(mission.reward.energy || 0);
  state.resonance += Number(mission.reward.resonance || 0);
  state.score += Number(mission.reward.score || 0);
  state.missions.claimed[mission.id] = new Date().toISOString();
  playTone("collect");
  toast(`${missionRewardText(mission)} claimed`);
  trackAction("mission_claimed", {
    missionId: mission.id,
    missionType: mission.type,
    rewardEnergy: mission.reward.energy || 0,
    claimedCount: claimedMissionCount()
  });
  render();
  scheduleBackendSync(true);
}

function setFarmStageClass(stage) {
  const farmRoom = $("#farmRoom");
  if (!farmRoom) return;
  farmRoom.classList.remove("stage-seed", "stage-sprout", "stage-grow", "stage-bloom", "stage-ready", "boosted");
  farmRoom.classList.add(`stage-${stage.toLowerCase()}`);
  farmRoom.classList.toggle("boosted", state.boostUntil > Date.now());
}

function render() {
  if (SINGLE_CAPSULE_MODE) state.activeSlot = 0;
  syncLegacyFarmFromActiveSlot();
  const progress = Math.round(growthProgress());
  state.growth = progress;

  const rank = Math.max(2, 12 - Math.floor(state.score / 80));
  const stage = growthStage(progress);
  const activeSlot = activeFarmSlot();
  const activeStrain = farmStrainById(activeSlot?.strain);
  const isGrowing = activeSlot?.strain && progress < 100;
  const actionState = progress >= 100 && activeSlot?.strain ? "collect" : activeSlot?.strain ? "selected" : "choose";
  const action = progress >= 100 && activeSlot?.strain ? ["", "Harvest"] : activeSlot?.strain ? ["", "Selected"] : ["", "Plant"];
  const processState = progress >= 100 ? "Ready" : isGrowing ? "Run" : "Idle";
  const plantScale = state.plantedAt ? 0.92 + (progress / 100) * 0.34 : 0.76;
  const motion = state.plantedAt ? 0.7 + progress / 180 : 0.42;
  const variant = currentPlantVariant();
  const secondsLeft = remainingSeconds(progress);
  const waterLevel = clamp(Math.round((state.energy / 20) * 100), 0, 99);
  const lightLevel = state.boostUntil > Date.now() ? 99 : clamp(56 + Math.round(progress / 3), 56, 92);
  const growthStep = clamp(Math.ceil(progress / 9), 1, 12);

  setResourceNumber("#scoreValue", state.score);
  setResourceNumber("#energyValue", state.energy);
  setResourceNumber("#resonanceValue", state.resonance);
  setResourceNumber("#seedValue", state.seed);
  setText("#growthPercent", `${progress}%`);
  setStyle("#growthRing", "--progress", `${progress}%`);
  setStyle("#growthRing", "--progress-angle", `${progress * 3.6}deg`);
  setText("#processPercent", `${progress}%`);
  setText("#processState", processState);
  setStyle("#processMeter", "--process", `${progress}%`);
  setStyle("#processMeter", "--process-angle", `${progress * 3.6}deg`);
  setClass(".process-rail", "running", progress > 0 && progress < 100);
  setClass(".process-rail", "ready", progress >= 100);
  setClass("#plantCapsule", "is-growing", isGrowing);
  setClass("#plantCapsule", "is-ready", progress >= 100);
  setClass("#plantCapsule", "is-idle", !state.plantedAt);
  setStyle("#plantCapsule", "--growth", `${progress}%`);
  setStyle("#plantCapsule", "--motion", motion.toFixed(2));
  setStyle("#plantVisual", "--plant-scale", plantScale.toFixed(2));
  setStyle("#plantVisual", "--motion", motion.toFixed(2));
  applyPlantVariant(variant, progress, motion);
  renderSpecimenPodsV2(progress, motion);
  renderCapsuleBaseCubes(progress);
  renderTokenFlow(progress, secondsLeft);
  setText("#plantStage", EXACT_DONOR_MODE ? "LEVEL II" : stage);
  setText("#mainActionIcon", action[0]);
  setText("#mainActionText", action[1]);
  const mainActionButton = $("#mainActionBtn");
  if (mainActionButton) mainActionButton.dataset.action = actionState;
  setResourceNumber("#leaderScore", state.score);
  setText("#rankValue", backendState.rank || rank);
  setText("#playerName", state.playerName);
  setText("#leaderName", state.playerName);
  setText("#avatar", state.playerName.slice(0, 1).toUpperCase());
  renderLeagueProgress();
  const dailyProgress = dailyMissionProgressSnapshot();
  setText("#dailyMissionHudCount", `${dailyProgress.done}/${dailyProgress.total}`);
  setText("#dailyCubeCount", `${dailyProgress.done}/${dailyProgress.total}`);
  setText("#artifactLabel", state.artifact > 0 ? `x${state.artifact}` : "Empty");
  setText("#farmSelectedTier", activeStrain ? `${activeStrain.type} strain` : "Choose donor plant");
  setText("#farmSelectedPlant", activeStrain ? activeStrain.name : selectedPlantingStrain()?.name || "NEON BASIL");
  setText("#farmSelectedStatus", donorPlantStatus(activeSlot, activeStrain));
  setHTML("#farmSelectedReward", resourceAmountHtml("main", activeStrain?.score || selectedPlantingStrain()?.score || 22));
  setHTML("#farmSelectedGene", resourceAmountHtml("gs", activeStrain?.geneStrands || selectedPlantingStrain()?.geneStrands || 0));
  setHTML("#farmSelectedCost", donorPlantCostHtml(activeStrain || selectedPlantingStrain()));
  setText("#farmSelectedTimer", activeStrain ? (remainingSeconds(progress) ? formatTime(remainingSeconds(progress) * 1000) : "00:00") : `${Math.round((selectedPlantingStrain()?.durationMs || 300000) / 60_000).toString().padStart(2, "0")}:00`);
  if (!EXACT_DONOR_MODE) {
    setText("#plantStage", activeStrain ? activeStrain.shortName : "Choose");
  }
  renderMutationLab(progress);
  renderZen();
  renderMissions();
  renderShopPass();
  if (EXACT_DONOR_MODE) renderDonorFarm();
  if (EXACT_DONOR_MODE) renderFarmEventDockV2();
  renderDrone();
  renderDataModule(progress);
  if (EXACT_DONOR_MODE && $("#donorFarmModal") && !$("#donorFarmModal").hidden) renderDonorPlantModal();
  if ($("#farmPlantSheet") && !$("#farmPlantSheet").hidden) renderFarmPlantSheet();
  setText("#waterModule", waterLevel);
  setText("#lightModule", lightLevel);
  setText("#timeModule", progress >= 100 ? "OK" : state.plantedAt ? `${secondsLeft}s` : "--");
  setText("#growthBubbleA", `+${growthStep}%`);
  setText("#growthBubbleB", `+${growthStep + 1}%`);
  setText("#growthBubbleC", progress >= 100 ? "MAX" : `+${growthStep + 2}%`);
  setText("#autoCollectState", SINGLE_CAPSULE_MODE ? "-5m" : state.autoCollect ? "On" : "Off");
  setClass("#autoCollectBtn", "active", SINGLE_CAPSULE_MODE ? Boolean(activeStrain && !farmSlotReady(activeSlot)) : state.autoCollect);
  setClass("#autoCollectBtn", "armed", SINGLE_CAPSULE_MODE ? Boolean(activeStrain && !farmSlotReady(activeSlot) && state.resonance >= 1) : state.autoCollect && state.plantedAt && progress < 100);
  setText("#soundIcon", state.soundOn ? "\u266a" : "\u2022");
  setText("#soundState", state.soundOn ? "On" : "Off");
  setText("#soundVolumeValue", `${Math.round(settingPercent(state.soundVolume, 70))}%`);
  setInputValue("#soundVolume", settingPercent(state.soundVolume, 70));
  setText("#vibrationIcon", state.vibrationOn ? "\u25a6" : "\u25a1");
  setText("#vibrationState", state.vibrationOn ? "On" : "Off");
  setText("#vibrationValue", state.vibrationOn ? `${Math.round(settingPercent(state.vibrationLevel, 60))}%` : "Off");
  setInputValue("#vibrationLevel", settingPercent(state.vibrationLevel, 60));
  setClass("#soundBtn", "active", state.soundOn);
  setClass("#vibrationBtn", "active", state.vibrationOn);
  const soundSettingsPanel = $("#soundSettingsPanel");
  const soundSettingsSummary = state.soundOn && state.vibrationOn
    ? "Sound / Vib"
    : state.soundOn
      ? "Sound"
      : state.vibrationOn
        ? "Vib"
        : "Off";
  setText("#soundSettingsIcon", state.soundOn ? "\u266a" : state.vibrationOn ? "\u25a6" : "\u2022");
  setText("#soundSettingsState", soundSettingsSummary);
  setClass("#soundSettingsBtn", "active", state.soundOn || state.vibrationOn);
  $("#soundSettingsBtn")?.setAttribute("aria-expanded", soundSettingsPanel?.hidden ? "false" : "true");
  renderTelegramStatus();
  renderLeaderboard();
  scheduleBackendSync();

  setFarmStageClass(stage);
  saveState();
  scheduleAutoCollectV2();
}

function collectHarvest(auto = false) {
  const harvest = 18 + state.artifact * 4 + droneHarvestBonus();
  const biomassGain = farmBiomassGain(harvest);
  state.score += harvest;
  state.biomass = safeBiomass() + biomassGain;
  state.resonance += state.artifact > 0 ? 1 : 0;
  state.plantedAt = 0;
  state.growth = 0;
  state.growthDuration = GROW_DURATION_MS;
  state.boostUntil = 0;
  state.plantVariant = (state.plantVariant + 1 + state.artifact) % PLANT_VARIANTS.length;
  playTone("collect");
  toast(auto ? `Auto +${harvest} · Bio +${biomassGain}` : `+${harvest} · Bio +${biomassGain}`);
  trackAction(auto ? "farm_auto_collected" : "farm_collected", {
    harvest,
    biomassGain,
    biomass: state.biomass,
    artifact: state.artifact
  });
  render();
}

function scheduleAutoCollect(progress) {
  if (!state.autoCollect || progress < 100 || !state.plantedAt || autoCollectTimer) return;
  autoCollectTimer = window.setTimeout(() => {
    autoCollectTimer = null;
    if (state.autoCollect && growthProgress() >= 100 && state.plantedAt) {
      collectHarvest(true);
    }
  }, 700);
}

function farmAction() {
  const progress = growthProgress();
  if (progress >= 100) {
    collectHarvest(false);
    return;
  }

  if (state.energy <= 0) {
    toast("Need \u26a1");
    trackAction("farm_blocked_no_energy", { progress: Math.round(progress) });
    return;
  }

  state.energy -= 1;
  if (!state.plantedAt) {
    const zenBoosted = consumeZenBoost();
    state.growthDuration = Math.max(18_000, GROW_DURATION_MS - state.artifact * 1_500);
    state.growthDuration = Math.max(12_000, state.growthDuration - droneSpeedBonus());
    if (zenBoosted) state.growthDuration = Math.max(9_000, Math.round(state.growthDuration * 0.78));
    state.plantedAt = Date.now();
    playTone("grow");
    toast(zenBoosted ? "Planted · Zen boosted" : "Planted");
    trackAction("farm_grow_clicked", {
      growthDuration: state.growthDuration,
      plantVariant: state.plantVariant,
      zenBoosted,
      zenEnergyLeft: zenEnergyBalance()
    });
  } else {
    const zenBoosted = consumeZenBoost();
    const boostMs = BOOST_MS + state.artifact * 450 + safeDroneLevel() * 260 + (zenBoosted ? 2_200 : 0);
    state.plantedAt -= boostMs;
    state.boostUntil = Date.now() + 2_800;
    playTone("boost");
    toast(zenBoosted ? "Boost · Zen" : "Boost");
    trackAction("farm_boost_clicked", {
      progress: Math.round(progress),
      boostMs,
      zenBoosted,
      zenEnergyLeft: zenEnergyBalance()
    });
  }
  render();
}

function farmRewardTier() {
  return farmCore.rewardTier();
}

function farmSlotHarvestBonus(index) {
  return farmCore.slotHarvestBonus(index);
}

function plantFarmSlot(index = state.activeSlot, strainId = null) {
  ensureFarmModel();
  if (!isSlotUnlocked(index) || index >= FARM_SLOT_COUNT) {
    toast(index === 3 ? "Unlock slot first" : "Slot locked");
    return false;
  }

  const slot = farmSlotAt(index);
  if (slot.strain) return false;
  const strain = farmStrainById(strainId) || farmStrainById(defaultFarmStrainForSlot(index));
  if (!strain) return false;
  const affordance = plantAffordanceFor(strain);
  if (!affordance.ok) {
    toast(`Need ${plantBlockedCostLabel(affordance.reason, strain)}`);
    trackAction("farm_blocked_no_cost", {
      slot: index + 1,
      action: "plant",
      cost: affordance.reason === "crc" ? "score" : affordance.reason,
      need: affordance.need || 0
    });
    return false;
  }

  const zenBoosted = consumeZenBoost();
  const cost = spendPlantCostFor(strain);
  slot.strain = strain.id;
  slot.plantedAt = Date.now();
  slot.growthDuration = farmCore.growthDuration({
    strain,
    artifact: state.artifact,
    droneSpeedBonus: droneSpeedBonus(),
    zenBoosted
  });
  slot.plantVariant = (state.plantVariant + strain.variantShift + index * 11 + state.artifact) % PLANT_VARIANTS.length;
  slot.boostUntil = 0;
  slot.readyNotified = false;
  state.activeSlot = index;
  syncLegacyFarmFromActiveSlot();
  playTone("grow");
  toast(zenBoosted ? `${strain.shortName} + Zen` : `${strain.shortName} planted`);
  trackAction("farm_slot_planted", {
    slot: index + 1,
    strain: strain.id,
    growthDuration: slot.growthDuration,
    costMain: cost.main,
    costScore: cost.crc,
    costResonance: cost.resonance,
    zenBoosted,
    zenEnergyLeft: zenEnergyBalance()
  });
  return true;
}

function plantCapsuleSlot(index, strainId = null, capsuleIndex = activeDonorCapsule) {
  ensureFarmModel();
  if (capsuleIndex === 0) return plantFarmSlot(index, strainId);
  if (!isCapsuleSlotUnlocked(capsuleIndex, index)) {
    toast("Slot locked");
    return false;
  }

  const slot = capsuleSlotAt(index, capsuleIndex);
  if (slot.strain) return false;
  const strain = capsuleStrainById(strainId, capsuleIndex) || capsuleStrainChoices(capsuleIndex)[0];
  if (!strain) return false;
  const affordance = plantAffordanceFor(strain);
  if (!affordance.ok) {
    toast(`Need ${plantBlockedCostLabel(affordance.reason, strain)}`);
    trackAction("capsule_blocked_no_cost", {
      capsule: capsuleIndex + 1,
      slot: index + 1,
      strain: strain.id,
      cost: affordance.reason,
      need: affordance.need || 0
    });
    return false;
  }

  const zenBoosted = consumeZenBoost();
  const cost = spendPlantCostFor(strain);
  slot.strain = strain.id;
  slot.plantedAt = Date.now();
  slot.growthDuration = farmCore.growthDuration({
    strain,
    artifact: state.artifact,
    droneSpeedBonus: droneSpeedBonus(),
    zenBoosted,
    capsuleIndex
  });
  slot.plantVariant = (state.plantVariant + strain.variantShift + index * 7 + capsuleIndex * 17) % PLANT_VARIANTS.length;
  slot.boostUntil = 0;
  slot.readyNotified = false;
  playTone("grow");
  toast(zenBoosted ? `${strain.shortName} + Zen` : `${strain.shortName} planted`);
  trackAction("capsule_slot_planted", {
    capsule: capsuleIndex + 1,
    slot: index + 1,
    strain: strain.id,
    growthDuration: slot.growthDuration,
    costMain: cost.main,
    costScore: cost.crc,
    costResonance: cost.resonance,
    zenBoosted,
    zenEnergyLeft: zenEnergyBalance()
  });
  return true;
}

function collectCapsuleSlot(index, capsuleIndex = activeDonorCapsule, shouldRender = true) {
  ensureFarmModel();
  if (capsuleIndex === 0) return collectHarvestV2(false, index, shouldRender);
  const slot = capsuleSlotAt(index, capsuleIndex);
  if (!farmSlotReady(slot)) return false;

  const strain = capsuleStrainById(slot.strain, capsuleIndex) || capsuleStrainChoices(capsuleIndex)[0];
  const material = strain.labMaterial || null;
  const { tier, slotBonus, harvest, biomassGain, geneGain } = farmCore.harvestReward({
    strain,
    artifact: state.artifact,
    droneHarvestBonus: droneHarvestBonus(),
    slotIndex: index,
    artifactFactor: 3,
    includeSlotBonus: false
  });
  state.score += harvest;
  state.biomass = safeBiomass() + biomassGain;
  state.resonance += state.artifact > 0 ? 1 : 0;
  state.inventory = normalizeInventory(state.inventory);
  state.inventory.geneStrands += geneGain;
  state.inventory.harvests[strain.id] = Math.max(0, Math.floor(Number(state.inventory.harvests[strain.id]) || 0)) + 1;
  if (material?.id) {
    state.inventory.materials[material.id] = labMaterialCount(material.id, state.inventory) + Math.max(1, Math.floor(Number(material.amount) || 1));
  }
  slot.strain = null;
  slot.plantedAt = 0;
  slot.growthDuration = GROW_DURATION_MS;
  slot.boostUntil = 0;
  slot.readyNotified = false;
  state.plantVariant = (state.plantVariant + 1 + state.artifact + index + capsuleIndex) % PLANT_VARIANTS.length;
  playTone("collect");
  const materialToast = material?.short ? ` / ${material.short} +${Math.max(1, Math.floor(Number(material.amount) || 1))}` : "";
  toast(`${tier.label} ${strain.shortName} +${harvest} Bio +${biomassGain}${materialToast}`);
  trackAction("capsule_collected", {
    capsule: capsuleIndex + 1,
    slot: index + 1,
    strain: strain.id,
    harvest,
    biomassGain,
    geneGain,
    slotMultiplier: slotBonus.multiplier,
    seGain: slotBonus.seGain,
    labMaterial: material?.id || "",
    labMaterialGain: Math.max(0, Math.floor(Number(material?.amount) || 0)),
    rewardTier: tier.label,
    biomass: state.biomass,
    artifact: state.artifact
  });
  if (shouldRender) render();
  return true;
}

function boostFarmSlot(index = state.activeSlot) {
  ensureFarmModel();
  const slot = farmSlotAt(index);
  if (!slot?.strain || farmSlotReady(slot)) return false;
  if (state.energy <= 0) {
    toast("Need energy");
    trackAction("farm_blocked_no_energy", { slot: index + 1, action: "boost" });
    return false;
  }

  const zenBoosted = consumeZenBoost();
  const boostMs = BOOST_MS + state.artifact * 450 + safeDroneLevel() * 260 + (zenBoosted ? 2_200 : 0);
  state.energy -= 1;
  slot.plantedAt -= boostMs;
  slot.boostUntil = Date.now() + 2_800;
  state.activeSlot = index;
  syncLegacyFarmFromActiveSlot();
  playTone("boost");
  toast(zenBoosted ? "Boost + Zen" : "Boost");
  trackAction("farm_slot_boosted", {
    slot: index + 1,
    strain: slot.strain,
    progress: Math.round(farmSlotProgress(slot)),
    boostMs,
    zenBoosted,
    zenEnergyLeft: zenEnergyBalance()
  });
  return true;
}

function collectHarvestV2(auto = false, index = state.activeSlot, shouldRender = true) {
  ensureFarmModel();
  const slot = farmSlotAt(index);
  if (!farmSlotReady(slot)) return false;

  const strain = farmStrainById(slot.strain) || FARM_STRAINS[0];
  const material = strain.labMaterial || null;
  const reward = farmCore.harvestReward({
    strain,
    artifact: state.artifact,
    droneHarvestBonus: droneHarvestBonus(),
    slotIndex: index
  });
  const { tier, slotBonus, harvest, biomassGain, geneGain } = reward;
  state.score += harvest;
  state.biomass = safeBiomass() + biomassGain;
  state.seed += slotBonus.seGain;
  state.resonance += state.artifact > 0 ? 1 : 0;
  state.inventory = normalizeInventory(state.inventory);
  state.inventory.geneStrands += geneGain;
  state.inventory.harvests[strain.id] = Math.max(0, Math.floor(Number(state.inventory.harvests[strain.id]) || 0)) + 1;
  if (material?.id) {
    state.inventory.materials[material.id] = labMaterialCount(material.id, state.inventory) + Math.max(1, Math.floor(Number(material.amount) || 1));
  }
  slot.strain = null;
  slot.plantedAt = 0;
  slot.growthDuration = GROW_DURATION_MS;
  slot.boostUntil = 0;
  slot.readyNotified = false;
  state.activeSlot = index;
  state.plantVariant = (state.plantVariant + 1 + state.artifact + index) % PLANT_VARIANTS.length;
  syncLegacyFarmFromActiveSlot();
  playTone("collect");
  const materialToast = material?.short ? ` · ${material.short} +${Math.max(1, Math.floor(Number(material.amount) || 1))}` : "";
  const slotBonusToast = slotBonus.seGain ? ` / SE +${slotBonus.seGain}` : slotBonus.label ? ` / ${slotBonus.label}` : "";
  toast(auto ? `Auto ${strain.shortName} +${harvest}${materialToast}${slotBonusToast}` : `${tier.label} +${harvest} Bio +${biomassGain}${materialToast}${slotBonusToast}`);
  trackAction(auto ? "farm_auto_collected" : "farm_collected", {
    slot: index + 1,
    strain: strain.id,
    harvest,
    biomassGain,
    geneGain,
    labMaterial: material?.id || "",
    labMaterialGain: Math.max(0, Math.floor(Number(material?.amount) || 0)),
    rewardTier: tier.label,
    biomass: state.biomass,
    artifact: state.artifact
  });
  if (shouldRender) render();
  return true;
}

function scheduleAutoCollectV2() {
  if (!state.autoCollect || autoCollectTimer || !readyFarmSlots().length) return;
  autoCollectTimer = window.setTimeout(() => {
    autoCollectTimer = null;
    void (async () => {
      const ready = readyFarmSlots();
      if (!state.autoCollect || !ready.length) return;
      let harvested = 0;
      for (const slot of ready) {
        try {
          const data = await collectHarvestServer(true, slot.id, { shouldRender: false, tone: false, toast: false });
          if (data?.player) harvested += 1;
        } catch {
          break;
        }
      }
      if (harvested) render();
    })();
  }, 700);
}

async function farmActionV2() {
  ensureFarmModel();
  const slot = activeFarmSlot();
  const progress = farmSlotProgress(slot);
  if (farmSlotReady(slot)) {
    try {
      await collectHarvestServer(false, state.activeSlot, { tone: false });
      playTone("collect");
    } catch (error) {
      toast(error.message || "Harvest failed");
    }
    return;
  }

  if (!slot?.strain) {
    openFarmPlantSheet(state.activeSlot);
    return;
  }

  toast(`${farmStrainById(slot.strain)?.name || "Plant"} · ${formatTime(remainingSeconds(progress) * 1000)}`);
}

function applyStarsReward(product = {}) {
  const catalogProduct = economyCore.starsProductById(product.id);
  product = {
    ...(catalogProduct || {}),
    ...product,
    reward: product.reward || catalogProduct?.reward || {}
  };

  if (product.id === FARM_PASS_PRODUCT_ID || product.reward?.farmPassDays) {
    activateFarmPass(product);
    return;
  }

  if (product.id === "farm_slot_4" || product.id === "farm_slot_6" || product.reward?.slot !== undefined) {
    const slot = Number(product.reward?.slot ?? 3);
    unlockSlot(slot);
    playTone("stars");
    toast(`Slot ${slot + 1} unlocked`);
    trackAction("stars_slot_unlocked", {
      productId: product.id || "farm_slot_4",
      slot: slot + 1
    });
    render();
    scheduleBackendSync(true);
    return;
  }

  if (product.id === "unique_mutation_10" || product.reward?.uniqueMutation) {
    applyUniqueMutationReward(product);
    return;
  }

  if (product.reward?.droneSkin) {
    const skin = droneSkinById(product.reward.droneSkin);
    state.ownedDroneSkins = normalizeOwnedDroneSkins({
      ...state.ownedDroneSkins,
      [skin.id]: true
    });
    state.droneSkin = skin.id;
    playTone("stars");
    toast(`${skin.name} unlocked`);
    trackAction("drone_skin_unlocked", {
      productId: product.id || skin.productId || "drone_skin_tech_50",
      skin: skin.id,
      stars: product.stars || skin.stars || 50
    });
    render();
    scheduleBackendSync(true);
    return;
  }

  const rewardEnergy = Number(product.reward?.energy || 12);
  state.energy += rewardEnergy;
  playTone("stars");
  toast(`Stars paid +${rewardEnergy} \u26a1`);
  render();
  scheduleBackendSync(true);
}

function mockStarsBuy(productId = "energy_pack_10") {
  const product = economyCore.starsProductById(productId);
  if (product) {
    applyStarsReward(product);
    trackAction("stars_preview_mock", {
      stars: product.stars,
      productId: product.id,
      mode: "preview"
    });
    return;
  }

  state.energy += 12;
  playTone("stars");
  toast("Mock \u2605 +12 \u26a1");
  trackAction("stars_preview_mock", {
    stars: 10,
    productId,
    energyAdded: 12,
    mode: "mock"
  });
  render();
}

async function buyStarsProduct(productId = "energy_pack_10") {
  const platform = telegramPlatform();
  const stars = economyCore.starsAmountForProduct(productId, 10);
  trackAction("stars_button_clicked", {
    stars,
    productId,
    mode: tg?.initData ? "telegram" : "preview",
    platform
  });

  if (!tg?.initData || typeof tg.openInvoice !== "function") {
    toast("Stars only in Telegram");
    mockStarsBuy(productId);
    return;
  }

  try {
    toast("Opening Stars");
    const response = await fetch(apiUrl("/api/stars/invoice"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: CLIENT_ID,
        initData: tg.initData,
        productId,
        platform,
        state: stateSummary()
      })
    });
    const data = await response.json();
    if (!response.ok || !data.invoiceLink) throw new Error(data.error || "Invoice failed");

    trackAction("stars_invoice_opened", {
      orderId: data.orderId,
      productId: data.product?.id || productId,
      stars: data.product?.stars || 10,
      platform
    });

    tg.openInvoice(data.invoiceLink, (status) => {
      trackAction("stars_invoice_closed", {
        orderId: data.orderId,
        status,
        platform
      });

      if (status === "paid") {
        applyStarsReward(data.product || { id: productId });
        return;
      }

      if (status === "pending") {
        toast("Payment pending");
        return;
      }

      toast(status === "cancelled" ? "Payment cancelled" : "Payment failed");
    });
  } catch (error) {
    toast("Stars unavailable");
    trackAction("stars_invoice_error", {
      message: error.message
    });
  }
}

function buyStarsEnergy() {
  return buyStarsProduct("energy_pack_10");
}

function buyFarmSlot4() {
  if (isSlotUnlocked(3)) {
    toast("Slot already open");
    return null;
  }
  return buyStarsProduct("farm_slot_4");
}

async function buyFarmSlot5() {
  if (isSlotUnlocked(4)) {
    toast("Slot already open");
    return null;
  }
  if (state.seed < 10) {
    toast("Need 10 SE");
    trackAction("farm_slot_5_blocked_no_se", {
      seed: state.seed,
      need: 10
    });
    return null;
  }
  state.seed -= 10;
  unlockSlot(4);
  playTone("stars");
  toast("Slot 5 unlocked / x3");
  trackAction("farm_slot_5_unlocked_se", {
    slot: 5,
    spentSe: 10,
    multiplier: 3
  });
  render();
  try {
    await syncPlayer();
  } catch {
    scheduleBackendSync(true);
  }
  return true;
}

function buyFarmSlot6() {
  if (isSlotUnlocked(5)) {
    toast("Slot already open");
    return null;
  }
  return buyStarsProduct("farm_slot_6");
}

function buyFarmPass30() {
  const snapshot = farmPassSnapshot();
  if (snapshot.active) {
    toast(`Pass active / ${snapshot.remainingDays}d left`);
  }
  return buyStarsProduct(FARM_PASS_PRODUCT_ID);
}

function applyUniqueMutationReward(product = {}) {
  const reward = product.reward || {};
  const artifactGain = Math.max(1, Number(reward.artifact || 2));
  const resonanceGain = Math.max(1, Number(reward.resonance || 3));
  const scoreGain = Math.max(8, Number(reward.score || 24));
  const seGain = Math.max(1, Number(reward.se ?? reward.seed ?? 1));

  state.artifact += artifactGain;
  state.resonance += resonanceGain;
  state.score += scoreGain;
  state.seed += seGain;
  state.labUniqueMutations = Math.max(0, Math.floor(Number(state.labUniqueMutations) || 0)) + 1;
  state.labRareUntil = Date.now() + 7_000;
  state.plantVariant = (state.plantVariant + 17 + state.labUniqueMutations) % PLANT_VARIANTS.length;
  playTone("stars");
  toast(`Unique mutation +${artifactGain} / SE +${seGain}`);
  trackAction("lab_unique_mutation_created", {
    productId: product.id || "unique_mutation_10",
    artifactGain,
    resonanceGain,
    scoreGain,
    seGain,
    uniqueMutations: state.labUniqueMutations
  });
  triggerLabSceneCue("rare", {
    accent: "#ffd670"
  });
  render();
  scheduleBackendSync(true);
}

function buyUniqueMutation() {
  return buyStarsProduct("unique_mutation_10");
}

function telegramPlatform() {
  const value = String(tg?.platform || "web").toLowerCase();
  if (value.includes("ios") || value.includes("iphone") || value.includes("ipad")) return "ios";
  if (value.includes("android")) return "android";
  if (value.includes("tdesktop") || value.includes("macos") || value.includes("windows") || value.includes("linux")) return "desktop";
  return value || "web";
}

function synthArtifactLegacyUnused() {
  const activeJob = labActiveJob();
  const activeState = labJobProgress(activeJob);
  if (activeJob && !activeState.ready) {
    toast(`Synthesis ${labFormatClock(activeState.remainingMs)}`);
    triggerLabSceneCue("reject", {
      accent: "#58dcff"
    });
    return;
  }
  if (activeJob && activeState.ready) {
    const finishedRecipe = labRecipeById(activeJob.recipeId) || labRecipe();
    labApplyFinishedRecipe(finishedRecipe, activeJob);
    playTone("lab");
    const resultToast = finishedRecipe.effect?.type === "serum"
      ? `${finishedRecipe.result} / ${activeJob.serumTargets || 0} slots`
      : finishedRecipe.effect?.type === "catalyst"
        ? `${finishedRecipe.result} / rare ${Math.round((Number(finishedRecipe.effect?.rareMs) || 0) / 60000)}m`
        : `${finishedRecipe.result} +${Math.max(1, Number(finishedRecipe.artifact || 1))}`;
    toast(activeJob.zenBoosted ? `${resultToast} / Zen linked` : resultToast);
    lastLabSynthesis = {
      result: finishedRecipe.result,
      meta: finishedRecipe.effect?.type === "serum"
        ? ` / ${activeJob.serumTargets || 0} live slots`
        : finishedRecipe.effect?.type === "catalyst"
          ? ` / rare ${Math.round((Number(finishedRecipe.effect?.rareMs) || 0) / 60000)}m`
          : ` / ${zenGeneLabel(state.zenGene)}`,
      zenLinked: activeJob.zenBoosted,
      at: Date.now()
    };
    state.labSynthesis = null;
    trackAction("lab_recipe_claimed", {
      recipeId: finishedRecipe.id,
      effectType: finishedRecipe.effect?.type || "artifact",
      artifact: state.artifact,
      zenBoosted: activeJob.zenBoosted
    });
    triggerLabSceneCue(finishedRecipe.effect?.type === "catalyst" ? "rare" : "synth", {
      accent: finishedRecipe.accent || "#7effde"
    });
    render();
    scheduleBackendSync(true);
    return;
  }

  const recipe = labRecipe();
  const energyCost = labEnergyCost();
  const geneCost = labGeneCost();
  const seCost = labSeCost();
  const inventory = normalizeInventory(state.inventory);
  const missingMaterial = recipe.materials.find((entry) => labMaterialCount(entry.id, inventory) < entry.amount);
  if (missingMaterial) {
    const material = labMaterialById(missingMaterial.id);
    toast(`Need ${missingMaterial.amount} ${material?.name || missingMaterial.id}`);
    trackAction("lab_blocked_no_material", {
      material: missingMaterial.id,
      have: labMaterialCount(missingMaterial.id, inventory),
      cost: missingMaterial.amount
    });
    return;
  }
  if (inventory.geneStrands < geneCost) {
    toast(`Need ${geneCost} GS`);
    trackAction("lab_blocked_no_genes", {
      geneStrands: inventory.geneStrands,
      cost: geneCost
    });
    return;
  }
  if (energyCost > 0 && state.energy < energyCost) {
    toast(`Need ${energyCost} \u26a1`);
    trackAction("lab_blocked_no_energy", {
      energy: state.energy,
      cost: energyCost
    });
    return;
  }
  if (state.seed < seCost) {
    toast(`Need ${seCost} SE`);
    trackAction("lab_blocked_no_se", {
      se: state.seed,
      cost: seCost
    });
    return;
  }
  const zenBoosted = consumeZenBoost();
  state.energy -= energyCost;
  state.seed -= seCost;
  state.inventory = inventory;
  recipe.materials.forEach((entry) => {
    state.inventory.materials[entry.id] = Math.max(0, labMaterialCount(entry.id, state.inventory) - entry.amount);
  });
  state.inventory.geneStrands -= geneCost;
  state.artifact += Math.max(1, Number(recipe.artifact || 1));
  state.plantVariant = (state.plantVariant + 7) % PLANT_VARIANTS.length;
  state.score += zenBoosted ? Math.max(14, Number(recipe.score || 8) + 6) : Math.max(8, Number(recipe.score || 8));
  state.resonance += zenBoosted ? Math.max(2, Number(recipe.resonance || 1) + 1) : Math.max(1, Number(recipe.resonance || 1));
  state.zenGene = state.artifact % 3 === 0 ? "aura" : state.artifact % 2 === 0 ? "crystal" : "sprout";
  playTone("lab");
  toast(zenBoosted ? `${recipe.result} +1 · Zen linked` : `${recipe.result} +1`);
  trackAction("lab_mutation_clicked", {
    artifact: state.artifact,
    recipeId: recipe.id,
    materials: recipe.materials,
    geneCost,
    energyCost,
    seCost,
    zenBoosted,
    zenGene: state.zenGene
  });
  render();
}

function synthArtifact() {
  const activeJob = labActiveJob();
  const activeState = labJobProgress(activeJob);
  if (activeJob && !activeState.ready) {
    toast(`Synthesis ${labFormatClock(activeState.remainingMs)}`);
    triggerLabSceneCue("reject", {
      accent: "#58dcff"
    });
    return;
  }
  if (activeJob && activeState.ready) {
    const finishedRecipe = labRecipeById(activeJob.recipeId) || labRecipe();
    labApplyFinishedRecipe(finishedRecipe, activeJob);
    playTone("lab");
    const resultToast = finishedRecipe.effect?.type === "serum"
      ? `${finishedRecipe.result} / ${activeJob.serumTargets || 0} slots`
      : finishedRecipe.effect?.type === "catalyst"
        ? `${finishedRecipe.result} / rare ${Math.round((Number(finishedRecipe.effect?.rareMs) || 0) / 60000)}m`
        : `${finishedRecipe.result} +${Math.max(1, Number(finishedRecipe.artifact || 1))}`;
    toast(activeJob.zenBoosted ? `${resultToast} / Zen linked` : resultToast);
    lastLabSynthesis = {
      result: finishedRecipe.result,
      meta: finishedRecipe.effect?.type === "serum"
        ? ` / ${activeJob.serumTargets || 0} live slots`
        : finishedRecipe.effect?.type === "catalyst"
          ? ` / rare ${Math.round((Number(finishedRecipe.effect?.rareMs) || 0) / 60000)}m`
          : ` / ${zenGeneLabel(state.zenGene)}`,
      zenLinked: activeJob.zenBoosted,
      at: Date.now()
    };
    state.labSynthesis = null;
    trackAction("lab_recipe_claimed", {
      recipeId: finishedRecipe.id,
      effectType: finishedRecipe.effect?.type || "artifact",
      artifact: state.artifact,
      zenBoosted: activeJob.zenBoosted
    });
    triggerLabSceneCue(finishedRecipe.effect?.type === "catalyst" ? "rare" : "synth", {
      accent: finishedRecipe.accent || "#7effde"
    });
    render();
    scheduleBackendSync(true);
    return;
  }

  const recipe = labRecipe();
  const energyCost = labEnergyCost();
  const geneCost = labGeneCost();
  const seCost = labSeCost();
  const inventory = normalizeInventory(state.inventory);
  const missingMaterial = recipe.materials.find((entry) => labMaterialCount(entry.id, inventory) < entry.amount);

  if (missingMaterial) {
    const material = labMaterialById(missingMaterial.id);
    toast(`Need ${missingMaterial.amount} ${material?.name || missingMaterial.id}`);
    triggerLabSceneCue("reject", {
      accent: "#ff6b7d"
    });
    trackAction("lab_blocked_no_material", {
      recipeId: recipe.id,
      material: missingMaterial.id,
      have: labMaterialCount(missingMaterial.id, inventory),
      cost: missingMaterial.amount
    });
    return;
  }
  if (inventory.geneStrands < geneCost) {
    toast(`Need ${geneCost} GS`);
    triggerLabSceneCue("reject", {
      accent: "#ff6b7d"
    });
    trackAction("lab_blocked_no_genes", {
      recipeId: recipe.id,
      geneStrands: inventory.geneStrands,
      cost: geneCost
    });
    return;
  }
  if (energyCost > 0 && state.energy < energyCost) {
    toast(`Need ${energyCost} CRC`);
    triggerLabSceneCue("reject", {
      accent: "#ff6b7d"
    });
    trackAction("lab_blocked_no_energy", {
      recipeId: recipe.id,
      energy: state.energy,
      cost: energyCost
    });
    return;
  }
  if (state.seed < seCost) {
    toast(`Need ${seCost} SE`);
    triggerLabSceneCue("reject", {
      accent: "#ff6b7d"
    });
    trackAction("lab_blocked_no_se", {
      recipeId: recipe.id,
      se: state.seed,
      cost: seCost
    });
    return;
  }

  let serumTargets = 0;
  if (recipe.effect?.type === "serum") {
    serumTargets = labGrowingTargets().length;
    if (!serumTargets) {
      toast("Need growing capsule");
      triggerLabSceneCue("reject", {
        accent: "#5f7a86"
      });
      trackAction("lab_blocked_no_target", {
        recipeId: recipe.id,
        capsule: activeDonorCapsule
      });
      return;
    }
  }

  const zenBoosted = consumeZenBoost();
  state.energy -= energyCost;
  state.seed -= seCost;
  state.inventory = inventory;
  recipe.materials.forEach((entry) => {
    state.inventory.materials[entry.id] = Math.max(0, labMaterialCount(entry.id, state.inventory) - entry.amount);
  });
  state.inventory.geneStrands -= geneCost;
  const durationMs = labRecipeDurationMs(recipe);
  state.labSynthesis = {
    id: `lab-${Date.now()}`,
    recipeId: recipe.id,
    startedAt: Date.now(),
    durationMs,
    zenBoosted,
    serumTargets,
    claimed: false
  };
  playTone("lab");
  toast(`Synthesis started / ${labFormatClock(durationMs)}`);
  trackAction("lab_recipe_synthesized", {
    recipeId: recipe.id,
    effectType: recipe.effect?.type || "artifact",
    materials: recipe.materials,
    geneCost,
    energyCost,
    seCost,
    zenBoosted,
    serumTargets,
    durationMs,
    artifact: state.artifact
  });
  triggerLabSceneCue("synth", {
    accent: recipe.accent || "#7effde"
  });
  render();
  scheduleBackendSync(true);
  return;
  state.plantVariant = (state.plantVariant + 7 + activeDonorCapsule) % PLANT_VARIANTS.length;
  state.score += zenBoosted ? Math.max(14, Number(recipe.score || 8) + 6) : Math.max(8, Number(recipe.score || 8));
  state.resonance += zenBoosted ? Math.max(2, Number(recipe.resonance || 1) + 1) : Math.max(1, Number(recipe.resonance || 1));

  if (recipe.effect?.type === "artifact") {
    state.artifact += Math.max(1, Number(recipe.artifact || 1));
  } else if (recipe.effect?.type === "catalyst") {
    const rareMs = Math.max(60_000, Number(recipe.effect?.rareMs) || 0);
    state.labRareUntil = Math.max(Date.now(), Number(state.labRareUntil) || 0) + rareMs;
    state.zenEnergy = zenEnergyBalance() + Math.max(0, Math.floor(Number(recipe.effect?.zenEnergy) || 0));
  }

  state.zenGene = state.artifact % 3 === 0 ? "aura" : state.artifact % 2 === 0 ? "crystal" : "sprout";
  playTone("lab");

  const resultToast = recipe.effect?.type === "serum"
    ? `${recipe.result} · ${serumTargets} slots`
    : recipe.effect?.type === "catalyst"
      ? `${recipe.result} · ${Math.round((Number(recipe.effect?.rareMs) || 0) / 60000)}m`
      : `${recipe.result} +1`;
  toast(zenBoosted ? `${resultToast} · Zen linked` : resultToast);
  lastLabSynthesis = {
    result: recipe.result,
    meta: recipe.effect?.type === "serum"
      ? ` / ${serumTargets} live slots`
      : recipe.effect?.type === "catalyst"
        ? ` / rare ${Math.round((Number(recipe.effect?.rareMs) || 0) / 60000)}m`
        : ` / ${zenGeneLabel(state.zenGene)}`,
    zenLinked: zenBoosted,
    at: Date.now()
  };
  trackAction("lab_recipe_synthesized", {
    recipeId: recipe.id,
    effectType: recipe.effect?.type || "artifact",
    materials: recipe.materials,
    geneCost,
    energyCost,
    seCost,
    zenBoosted,
    serumTargets,
    rareUntil: state.labRareUntil,
    artifact: state.artifact
  });
  triggerLabSceneCue(recipe.effect?.type === "catalyst" ? "rare" : "synth", {
    accent: recipe.accent || "#7effde"
  });
  render();
}

function claimZenDna(index) {
  const elapsed = zenElapsed();
  if (!state.zenStartedAt || state.zenPausedAt || !zenDnaIsVisible(elapsed, true, false)) return;

  const claimKey = zenDnaClaimKey(elapsed, index);
  state.zenDnaClaims ||= {};
  if (state.zenDnaClaims[claimKey]) return;

  state.zenDnaClaims[claimKey] = true;
  state.zenSessionDna = Math.max(0, Math.floor(Number(state.zenSessionDna) || 0)) + 1;
  playTone("zen");
  toast("DNA locked");
  trackAction("zen_dna_collected", {
    index,
    cycle: zenDnaCycle(elapsed)
  });
  render();
}

function meditate() {
  if (!state.zenStartedAt) {
    state.zenStartedAt = Date.now();
    state.zenPausedAt = 0;
    state.zenElapsed = 0;
    state.zenSessionDna = 0;
    state.zenDnaClaims = {};
    playTone("zen");
    startZenAmbient();
    toast("Zen started");
    trackAction("zen_started", {
      durationMs: state.zenDuration || ZEN_DEFAULT_DURATION_MS
    });
    render();
    return;
  }

  if (state.zenPausedAt) {
    state.zenStartedAt = Date.now() - state.zenElapsed;
    state.zenPausedAt = 0;
    playTone("tap");
    startZenAmbient();
    toast("Zen resumed");
    trackAction("zen_resumed", {
      elapsedMs: state.zenElapsed
    });
    render();
    return;
  }

  state.zenElapsed = zenElapsed();
  state.zenPausedAt = Date.now();
  playTone("tap");
  stopZenAmbient(0.8);
  toast("Zen paused");
  trackAction("zen_paused", {
    elapsedMs: state.zenElapsed
  });
  render();
}

function switchRoom(name) {
  closeSheets();
  playTone("nav");
  const app = $(".app");
  if (app) {
    app.classList.remove("room-farm", "room-lab", "room-zen", "room-daily", "room-missions", "room-shop");
    app.classList.add(`room-${name}`);
  }
  Object.entries(rooms).forEach(([key, room]) => {
    if (room) room.classList.toggle("active", key === name);
  });
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.room === name);
  });
  if (name === "zen" && state.zenStartedAt && !state.zenPausedAt) startZenAmbient();
  if (name !== "zen") stopZenAmbient(1);
  labSceneEngine?.setActive(name === "lab");
  trackAction("room_opened", { room: name });
}

function openSheet(selector) {
  const sheet = $(selector);
  if (!sheet) return;
  closeSheets(selector);
  sheet.hidden = false;
  sheet.classList.add("open");
  window.requestAnimationFrame(() => sheet.classList.add("open"));
}

function closeSheets(exceptSelector = "") {
  document.querySelectorAll(".control-sheet").forEach((sheet) => {
    if (exceptSelector && sheet.matches(exceptSelector)) return;
    sheet.classList.remove("open");
    window.setTimeout(() => {
      if (!sheet.classList.contains("open")) sheet.hidden = true;
    }, 180);
  });
}

$("#mainActionBtn")?.addEventListener("click", farmActionV2);
$("#starsBtn")?.addEventListener("click", buyStarsEnergy);
$("#autoCollectBtn")?.addEventListener("click", () => {
  if (SINGLE_CAPSULE_MODE) {
    donorBoostCapsule();
    return;
  }
  state.autoCollect = !state.autoCollect;
  playTone("tap");
  toast(state.autoCollect ? "Auto collect on" : "Auto collect off");
  trackAction("farm_auto_collect_toggled", {
    enabled: state.autoCollect
  });
  render();
});
$("#plantCapsule")?.addEventListener("click", () => {
  if (!SINGLE_CAPSULE_MODE) return;
  farmActionV2();
});
$("#mutationAutoBtn")?.addEventListener("click", () => {
  state.mutationAuto = !state.mutationAuto;
  playTone("tap");
  toast(state.mutationAuto ? "Mutation auto on" : "Mutation auto off");
  trackAction("lab_auto_toggled", {
    enabled: state.mutationAuto
  });
  render();
});
$("#labRecipeGrid")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-lab-recipe]");
  if (!button) return;
  const recipeId = normalizeLabRecipeId(button.dataset.labRecipe);
  if (state.labRecipeId === recipeId) return;
  state.labRecipeId = recipeId;
  playTone("tap");
  triggerLabSceneCue("pulse", {
    accent: labRecipeById(recipeId)?.accent || "#7effde"
  });
  trackAction("lab_recipe_selected", { recipeId });
  render();
  scheduleBackendSync(true);
});
$("#labInventorySegments")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-lab-category]");
  if (!button) return;
  const categoryId = normalizeLabInventoryCategory(button.dataset.labCategory);
  if (state.labInventoryCategory === categoryId) return;
  state.labInventoryCategory = categoryId;
  playTone("tap");
  trackAction("lab_inventory_category_selected", { categoryId });
  render();
});
$("#synthBtn")?.addEventListener("click", synthArtifact);
$("#labUpgradeBtn")?.addEventListener("click", () => {
  playTone("tap");
  openSheet("#labUpgradeSheet");
  trackAction("lab_upgrade_preview_opened", {
    level: 4 + Math.min(9, Math.max(0, Math.floor(Number(state.artifact) || 0)))
  });
});
$("#rareMutationBtn")?.addEventListener("click", buyUniqueMutation);
$("#meditateBtn")?.addEventListener("click", meditate);
$("#capsuleDrone")?.addEventListener("click", () => {
  openSheet("#droneSheet");
  playTone("tap");
  trackAction("drone_menu_opened", {
    level: safeDroneLevel()
  });
  render();
});
$("#donorDroneBtn")?.addEventListener("click", () => {
  openSheet("#droneSheet");
  playTone("tap");
  trackAction("drone_menu_opened", {
    level: safeDroneLevel(),
    source: "donor_left"
  });
  render();
});
$("#dataModuleBtn")?.addEventListener("click", () => {
  openSheet("#dataModuleSheet");
  playTone("tap");
  trackAction("data_module_opened", {
    level: safeDataModuleLevel()
  });
  render();
});
$("#donorCapsuleUpgradeBtn")?.addEventListener("click", () => {
  openSheet("#dataModuleSheet");
  playTone("tap");
  trackAction("capsule_upgrade_opened", {
    level: safeDataModuleLevel()
  });
  render();
});
$("#droneUpgradeBtn")?.addEventListener("click", upgradeDrone);
$("#dataModuleUpgradeBtn")?.addEventListener("click", upgradeDataModule);
$("#droneSkinGrid")?.addEventListener("click", (event) => {
  const skinButton = event.target.closest("[data-drone-skin]");
  if (!skinButton) return;
  selectDroneSkin(skinButton.dataset.droneSkin);
});
$("#farmStrainGrid")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-farm-strain]");
  if (!button) return;
  const strainId = button.dataset.farmStrain || farmPlantingStrain;
  const doubleTap = isPlantDoubleTap("farm-sheet", strainId);
  farmPlantingStrain = strainId;
  playTone("tap");
  if (doubleTap) {
    confirmFarmPlantSelection();
    return;
  }
  renderFarmPlantSheet();
});
$("#farmPlantConfirmBtn")?.addEventListener("click", () => {
  confirmFarmPlantSelection();
});
$("#donorCapsulePrevBtn")?.addEventListener("click", () => {
  setDonorCapsule(activeDonorCapsule - 1);
});
$("#donorCapsuleNextBtn")?.addEventListener("click", () => {
  setDonorCapsule(activeDonorCapsule + 1);
});
$("#farmRoom .donor-capsule-shell")?.addEventListener("pointerdown", (event) => {
  donorCapsuleSwipe = { x: event.clientX, y: event.clientY };
  donorCapsuleSwipeHandled = false;
});
$("#farmRoom .donor-capsule-shell")?.addEventListener("pointerup", (event) => {
  if (!donorCapsuleSwipe) return;
  const dx = event.clientX - donorCapsuleSwipe.x;
  const dy = event.clientY - donorCapsuleSwipe.y;
  donorCapsuleSwipe = null;
  if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) * 1.35) return;
  donorCapsuleSwipeHandled = true;
  setDonorCapsule(activeDonorCapsule + (dx < 0 ? 1 : -1));
  window.setTimeout(() => {
    donorCapsuleSwipeHandled = false;
  }, 80);
});
$("#farm-grid")?.addEventListener("click", (event) => {
  if (!EXACT_DONOR_MODE) return;
  if (donorCapsuleSwipeHandled) return;
  const button = event.target.closest("[data-donor-slot]");
  if (!button) return;
  const index = Number(button.dataset.donorSlot);
  const stateName = button.dataset.slotState || "";
  if (!Number.isFinite(index)) return;
  if (activeDonorCapsule > 1 || stateName === "future") {
    toast(`Capsule ${activeDonorCapsule + 1} soon`);
    return;
  }
  if (activeDonorCapsule === 0) state.activeSlot = clamp(index, 0, FARM_SLOT_COUNT - 1);
  if (stateName === "empty") {
    openFarmPlantSheet(index);
    return;
  }
  if (stateName === "ready") {
    if (activeDonorCapsule === 0) {
      void collectHarvestServer(false, index);
    } else {
      collectCapsuleSlot(index, activeDonorCapsule);
    }
    return;
  }
  if (stateName === "growing") {
    if (activeDonorCapsule > 0) {
      const slot = capsuleSlotAt(index, activeDonorCapsule);
      toast(`${capsuleStrainById(slot?.strain, activeDonorCapsule)?.name || "Plant"} / ${donorProgressLabel(slot)}`);
      render();
      return;
    }
    const slot = farmSlotAt(index);
    toast(`${farmStrainById(slot?.strain)?.name || "Plant"} · ${donorProgressLabel(slot)}`);
    render();
    return;
  }
  if (stateName === "paid") {
    const productId = button.dataset.productId || "farm_slot_4";
    if (productId === "farm_slot_6") {
      buyFarmSlot6();
    } else {
      buyFarmSlot4();
    }
    return;
  }
  if (stateName === "se-paid") {
    void buyFarmSlot5();
    return;
  }
  toast("Locked");
});
$("#seed-grid")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-donor-strain]");
  if (!button) return;
  const strainId = button.dataset.donorStrain || farmPlantingStrain;
  const doubleTap = isPlantDoubleTap("donor-modal", strainId);
  farmPlantingStrain = strainId;
  playTone("tap");
  if (doubleTap) {
    confirmFarmPlantSelection();
    return;
  }
  renderDonorPlantModal();
});
$("#donorFarmConfirmBtn")?.addEventListener("click", confirmFarmPlantSelection);
$("#donorFarmCancelBtn")?.addEventListener("click", () => {
  closeDonorPlantModal();
  farmPlantingSlot = null;
  farmPlantingStrain = null;
});
$("#donorFarmModal")?.addEventListener("click", (event) => {
  if (event.target === event.currentTarget) {
    closeDonorPlantModal();
    farmPlantingSlot = null;
    farmPlantingStrain = null;
  }
});
$("#donorAutoHarvestBtn")?.addEventListener("click", donorAutoHarvest);
$("#donorBoostBtn")?.addEventListener("click", donorBoostGrid);
$("#farmEventDock")?.addEventListener("click", (event) => {
  const claimButton = event.target.closest("#farmEventClaimBtn");
  if (claimButton) {
    claimFarmEventReward();
    return;
  }
  const card = event.target.closest("[data-farm-event-step]");
  if (!card) return;
  claimFarmEventReward(Number(card.dataset.farmEventStep));
});
$("#shopFarmSlotBtn")?.addEventListener("click", buyFarmSlot4);
$("#shopMutationBtn")?.addEventListener("click", buyUniqueMutation);
$("#shopPassBuyBtn")?.addEventListener("click", buyFarmPass30);
$("#shopPassClaimBtn")?.addEventListener("click", claimFarmPassDaily);
$("#specimenGrid")?.addEventListener("click", (event) => {
  if (SINGLE_CAPSULE_MODE) return;
  const pod = event.target.closest(".specimen-pod");
  if (!pod) return;
  const index = clamp(Math.floor(Number(pod.dataset.pod) || 0), 0, FARM_SLOT_COUNT - 1);
  const unlockMeta = firstCapsuleUnlockMeta(index);
  if (!isSlotUnlocked(index) && unlockMeta) {
    playTone("tap");
    if (index === 4) {
      void buyFarmSlot5();
    } else if (index === 5) {
      buyFarmSlot6();
    } else {
      buyFarmSlot4();
    }
    trackAction("farm_slot_buy_clicked", {
      slot: index + 1,
      cost: unlockMeta.cost,
      bonus: unlockMeta.bonus
    });
    return;
  }
  const paidPod = pod.closest('.paid-pod[data-buy-slot="stars"]');
  if (paidPod) {
    playTone("tap");
    buyFarmSlot4();
    trackAction("farm_slot_buy_clicked", {
      slot: Number(paidPod.dataset.pod || 3) + 1,
      stars: 10
    });
    return;
  }

  if (!isSlotUnlocked(index)) {
    playTone("tap");
    toast("Slot locked");
    return;
  }

  playTone("tap");
  state.activeSlot = index;
  const slot = farmSlotAt(index);
  if (farmSlotReady(slot)) {
    void collectHarvestServer(false, index);
    return;
  }
  if (!slot.strain) {
    openFarmPlantSheet(index);
    return;
  }
  syncLegacyFarmFromActiveSlot();
  toast(`Slot ${index + 1} selected`);
  render();
});
$("#chamberPrevBtn")?.addEventListener("click", () => scrollSpecimenChambers(-1));
$("#chamberNextBtn")?.addEventListener("click", () => scrollSpecimenChambers(1));
$("#specimenGrid")?.addEventListener("scroll", updateChamberNav, { passive: true });
$("#missionsGrid")?.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open-mission]");
  const claimButton = event.target.closest("[data-claim-mission]");
  if (openButton) openMission(openButton.dataset.openMission);
  if (claimButton) claimMission(claimButton.dataset.claimMission);
});
$("#leagueBtn")?.addEventListener("click", () => {
  renderLeaderboard();
  openSheet("#leagueSheet");
  playTone("tap");
  trackAction("league_opened", {
    rank: backendState.rank,
    league: leagueName()
  });
});
$("#leagueHudBtn")?.addEventListener("click", () => {
  renderLeaderboard();
  openSheet("#leagueSheet");
  playTone("tap");
  trackAction("league_opened", {
    rank: backendState.rank,
    league: leagueName(),
    source: "resource_hud"
  });
});
$("#dailyMissionHudBtn")?.addEventListener("click", () => {
  roomBeforeDaily = activeRoomName();
  switchRoom("daily");
  playTone("tap");
  const dailyProgress = dailyMissionProgressSnapshot();
  trackAction("daily_missions_opened", {
    source: "resource_hud",
    claimed: dailyProgress.done,
    total: dailyProgress.total
  });
});
function closeDailyRoom(source = "close") {
  const targetRoom = roomBeforeDaily && roomBeforeDaily !== "daily" && rooms[roomBeforeDaily]
    ? roomBeforeDaily
    : "farm";
  switchRoom(targetRoom);
  playTone("tap");
  trackAction("daily_missions_closed", { source, targetRoom });
}

$("#dailyCloseBtn")?.addEventListener("click", () => closeDailyRoom("button"));
$("#dailyRoom .daily-space")?.addEventListener("click", (event) => {
  if (event.target.closest(".daily-missions-cube")) return;
  closeDailyRoom("backdrop");
});
$("#settingsBtn")?.addEventListener("click", () => {
  openSheet("#settingsSheet");
  playTone("tap");
  trackAction("settings_opened");
});
$("#soundSettingsBtn")?.addEventListener("click", () => {
  const panel = $("#soundSettingsPanel");
  const button = $("#soundSettingsBtn");
  if (!panel) return;
  panel.hidden = !panel.hidden;
  button?.setAttribute("aria-expanded", panel.hidden ? "false" : "true");
  playTone("tap");
  trackAction("settings_sound_panel_toggled", {
    open: !panel.hidden
  });
});
$("#tonWalletBtn")?.addEventListener("click", () => {
  playTone("tap");
  toast("TON wallet connect");
  trackAction("ton_wallet_connect_clicked", {
    source: "settings"
  });
});
document.querySelectorAll("[data-close-sheet]").forEach((button) => {
  button.addEventListener("click", () => {
    closeSheets();
    playTone("tap");
  });
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (activeRoomName() === "daily") closeDailyRoom("escape");
    else closeSheets();
  }
});
document.querySelectorAll(".zen-mode").forEach((button) => {
  button.addEventListener("click", () => {
    if (state.zenStartedAt && !state.zenPausedAt) return;
    state.zenDuration = Number(button.dataset.zenDuration) || ZEN_DEFAULT_DURATION_MS;
    state.zenStartedAt = 0;
    state.zenPausedAt = 0;
    state.zenElapsed = 0;
    state.zenSessionDna = 0;
    state.zenDnaClaims = {};
    playTone("tap");
    trackAction("zen_duration_selected", {
      durationMs: state.zenDuration
    });
    render();
  });
});
document.querySelectorAll(".zen-sound").forEach((button) => {
  button.addEventListener("click", () => {
    state.zenSound = normalizeZenSound(button.dataset.zenSound);
    if (state.zenStartedAt && !state.zenPausedAt && $(".app")?.classList.contains("room-zen")) {
      stopZenAmbient(0.25);
      window.setTimeout(startZenAmbient, 280);
    }
    playTone("tap");
    trackAction("zen_sound_selected", {
      sound: state.zenSound
    });
    render();
  });
});
document.querySelectorAll(".zen-gene-card").forEach((button) => {
  button.addEventListener("click", () => {
    state.zenGene = normalizeZenGene(button.dataset.zenGene);
    playTone("zen");
    trackAction("zen_gene_selected", {
      gene: state.zenGene
    });
    render();
  });
});
document.querySelectorAll(".zen-dna-target").forEach((button) => {
  button.addEventListener("click", () => claimZenDna(Number(button.dataset.dnaIndex) || 0));
});
$("#soundBtn")?.addEventListener("click", () => {
  state.soundOn = !state.soundOn;
  if (!state.soundOn) stopZenAmbient(0.4);
  if (state.soundOn && state.zenStartedAt && !state.zenPausedAt && $(".app")?.classList.contains("room-zen")) {
    startZenAmbient();
  }
  playTone("tap");
  toast(state.soundOn ? "Sound on" : "Sound off");
  trackAction("sound_toggled", {
    enabled: state.soundOn
  });
  render();
});
$("#soundVolume")?.addEventListener("input", (event) => {
  state.soundVolume = settingPercent(event.target.value, 70);
  if (state.soundVolume > 0) state.soundOn = true;
  render();
});
$("#soundVolume")?.addEventListener("change", () => playTone("tap"));
$("#vibrationBtn")?.addEventListener("click", () => {
  state.vibrationOn = !state.vibrationOn;
  triggerHaptic("tap");
  toast(state.vibrationOn ? "Vibration on" : "Vibration off");
  trackAction("vibration_toggled", {
    enabled: state.vibrationOn
  });
  render();
});
$("#vibrationLevel")?.addEventListener("input", (event) => {
  state.vibrationLevel = settingPercent(event.target.value, 60);
  if (state.vibrationLevel > 0) state.vibrationOn = true;
  render();
});
$("#vibrationLevel")?.addEventListener("change", () => triggerHaptic("tap"));
$("#resetBtn")?.addEventListener("click", () => {
  const resetState = createInitialState({ playerName: state.playerName });
  state = {
    ...resetState,
    soundOn: state.soundOn,
    soundVolume: state.soundVolume,
    vibrationOn: state.vibrationOn,
    vibrationLevel: state.vibrationLevel,
    playerName: state.playerName,
    missions: normalizeMissionState()
  };
  playTone("tap");
  toast("Reset");
  trackAction("progress_reset_clicked");
  render();
});

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.room) switchRoom(button.dataset.room);
  });
});

updateLoadingSplash(18, "Initializing capsule");
window.setTimeout(() => updateLoadingSplash(42, "Growing microculture"), 220);
window.setTimeout(() => updateLoadingSplash(64, tg?.initData ? "Telegram signal found" : "Guest profile ready"), 520);
trackAction("app_opened", {
  room: "farm",
  telegram: Boolean(tg?.initData || tg?.initDataUnsafe?.user)
});
ensureLabSceneEngine();
render();
window.setInterval(render, 500);
