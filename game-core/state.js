(() => {
  const core = window.CyberGreenCore || (window.CyberGreenCore = {});
  const config = core.config;

  if (!config) {
    throw new Error("CyberGreenCore config is required before state helpers.");
  }

  const {
    GROW_DURATION_MS,
    ZEN_DEFAULT_DURATION_MS,
    ZEN_DURATION_OPTIONS,
    ZEN_SOUND_OPTIONS,
    ZEN_GENE_OPTIONS,
    PLANT_VARIANTS,
    FARM_SLOT_COUNT,
    FARM_STRAINS,
    DRONE_SKINS
  } = config;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function settingPercent(value, fallback = 70) {
    const number = Number(value);
    return clamp(Number.isFinite(number) ? number : fallback, 0, 100);
  }

  function normalizeZenSound(value = "deep") {
    return ZEN_SOUND_OPTIONS.includes(value) ? value : "deep";
  }

  function normalizeZenGene(value = "sprout") {
    return ZEN_GENE_OPTIONS.includes(value) ? value : "sprout";
  }

  function safeDroneLevel(value = 1) {
    const level = Math.floor(Number(value) || 1);
    return clamp(level, 1, 9);
  }

  function droneSkinById(value = "bubbles") {
    return DRONE_SKINS.find((skin) => skin.id === value) || DRONE_SKINS[0];
  }

  function normalizeDroneSkin(value = "bubbles") {
    return droneSkinById(String(value || "")).id;
  }

  function safeDataModuleLevel(value = 1) {
    const level = Math.floor(Number(value) || 1);
    return clamp(level, 1, 9);
  }

  function normalizeUnlockedSlots(value = {}) {
    const slots = { "0": true, "1": true, "2": true };
    if (!value || typeof value !== "object") return slots;
    Object.entries(value).forEach(([key, item]) => {
      const index = clamp(Math.floor(Number(key) || 0), 0, 8);
      if (item) slots[String(index)] = true;
    });
    return slots;
  }

  function farmStrainById(value) {
    return FARM_STRAINS.find((strain) => strain.id === value) || null;
  }

  function defaultFarmStrainForSlot(index) {
    return FARM_STRAINS[0]?.id || null;
  }

  function normalizeInventory(value = {}) {
    return {
      geneStrands: Math.max(0, Math.floor(Number(value.geneStrands) || 0)),
      quantumNutrients: Math.max(0, Math.floor(Number(value.quantumNutrients) || 0)),
      materials: value.materials && typeof value.materials === "object" ? { ...value.materials } : {},
      harvests: value.harvests && typeof value.harvests === "object" ? { ...value.harvests } : {},
      strains: value.strains && typeof value.strains === "object" ? { ...value.strains } : {}
    };
  }

  function normalizeMissionState(value = {}) {
    return {
      opened: value.opened && typeof value.opened === "object" ? value.opened : {},
      claimed: value.claimed && typeof value.claimed === "object" ? value.claimed : {}
    };
  }

  function normalizeFarmSlot(value = {}, index = 0, legacy = {}) {
    const legacyPlant = index === 0 && !value?.strain && legacy.plantedAt;
    const rawPlantedAt = Math.max(0, Number(value?.plantedAt ?? (legacyPlant ? legacy.plantedAt : 0)) || 0);
    const rawStrain = farmStrainById(value?.strain) ? value.strain : null;
    const strain = rawStrain && rawPlantedAt > 0
      ? rawStrain
      : legacyPlant
        ? defaultFarmStrainForSlot(index)
        : null;
    const plantedAt = strain ? rawPlantedAt : 0;
    const growthDuration = clamp(
      Number(value?.growthDuration ?? (legacyPlant ? legacy.growthDuration : GROW_DURATION_MS)) || GROW_DURATION_MS,
      8_000,
      86_400_000
    );
    return {
      id: index,
      strain,
      plantedAt: strain ? plantedAt : 0,
      growthDuration,
      plantVariant: Math.max(0, Math.floor(Number(value?.plantVariant ?? legacy.plantVariant ?? index * 13) || 0)) % PLANT_VARIANTS.length,
      boostUntil: Math.max(0, Number(value?.boostUntil ?? (legacyPlant ? legacy.boostUntil : 0)) || 0),
      readyNotified: Boolean(value?.readyNotified)
    };
  }

  function normalizeFarmSlots(value = [], legacy = {}) {
    const source = Array.isArray(value) ? value : [];
    const shouldUseLegacy = !source.some((slot) => slot?.strain || slot?.plantedAt);
    const legacySource = shouldUseLegacy ? legacy : {};
    return Array.from({ length: FARM_SLOT_COUNT }, (_, index) => normalizeFarmSlot(source[index], index, legacySource));
  }

  function createInitialState(options = {}) {
    const state = {
      score: 0,
      energy: 10,
      seed: 0,
      biomass: 0,
      inventory: {
        geneStrands: 0,
        quantumNutrients: 0,
        materials: {},
        harvests: {},
        strains: {}
      },
      resonance: 0,
      growth: 0,
      plantedAt: 0,
      growthDuration: GROW_DURATION_MS,
      boostUntil: 0,
      artifact: 0,
      activeSlot: 0,
      farmSlots: [],
      labUniqueMutations: 0,
      labRareUntil: 0,
      sessions: 0,
      plantVariant: 0,
      autoCollect: false,
      mutationAuto: false,
      farmEvent: {
        startedAt: Date.now(),
        durationMs: 7 * 60 * 60 * 1000,
        stepMs: 60 * 60 * 1000,
        claimedSteps: []
      },
      zenDuration: ZEN_DEFAULT_DURATION_MS,
      zenStartedAt: 0,
      zenPausedAt: 0,
      zenElapsed: 0,
      zenSound: "deep",
      zenGene: "sprout",
      zenEnergy: 0,
      zenSessionDna: 0,
      zenDnaClaims: {},
      soundOn: true,
      soundVolume: 70,
      vibrationOn: true,
      vibrationLevel: 60,
      playerName: "You",
      droneLevel: 1,
      droneSkin: "bubbles",
      dataModuleLevel: 1,
      unlockedSlots: { "0": true, "1": true, "2": true },
      missions: {
        opened: {},
        claimed: {}
      }
    };

    if (options.playerName) state.playerName = options.playerName;
    if (options.missions) state.missions = normalizeMissionState(options.missions);
    return state;
  }

  function normalizeState(value = {}, options = {}) {
    const base = createInitialState(options);
    const restored = { ...base, ...(value && typeof value === "object" ? value : {}) };
    restored.growthDuration ||= GROW_DURATION_MS;
    restored.missions = normalizeMissionState(restored.missions);
    const farmEvent = restored.farmEvent && typeof restored.farmEvent === "object" ? restored.farmEvent : {};
    restored.farmEvent = {
      startedAt: Math.max(0, Number(farmEvent.startedAt) || Date.now()),
      durationMs: 7 * 60 * 60 * 1000,
      stepMs: 60 * 60 * 1000,
      claimedSteps: Array.isArray(farmEvent.claimedSteps)
        ? farmEvent.claimedSteps
          .map((step) => clamp(Math.floor(Number(step) || 0), 0, 6))
          .filter((step, index, list) => list.indexOf(step) === index)
        : []
    };
    restored.seed = Math.max(0, Math.floor(Number(restored.seed) || 0));
    restored.biomass = Math.max(0, Math.floor(Number(restored.biomass) || 0));
    restored.soundVolume = settingPercent(restored.soundVolume, 70);
    restored.vibrationOn = restored.vibrationOn !== false;
    restored.vibrationLevel = settingPercent(restored.vibrationLevel, 60);
    restored.zenDuration = ZEN_DURATION_OPTIONS.includes(Number(restored.zenDuration))
      ? Number(restored.zenDuration)
      : ZEN_DEFAULT_DURATION_MS;
    restored.zenSound = normalizeZenSound(restored.zenSound);
    restored.zenGene = normalizeZenGene(restored.zenGene);
    restored.zenEnergy = Math.max(0, Math.floor(Number(restored.zenEnergy) || 0));
    restored.zenSessionDna = Math.max(0, Math.floor(Number(restored.zenSessionDna) || 0));
    restored.zenDnaClaims = restored.zenDnaClaims && typeof restored.zenDnaClaims === "object" ? restored.zenDnaClaims : {};
    restored.labUniqueMutations = Math.max(0, Math.floor(Number(restored.labUniqueMutations) || 0));
    restored.labRareUntil = Math.max(0, Number(restored.labRareUntil) || 0);
    restored.droneLevel = safeDroneLevel(restored.droneLevel);
    restored.droneSkin = normalizeDroneSkin(restored.droneSkin);
    restored.dataModuleLevel = safeDataModuleLevel(restored.dataModuleLevel);
    restored.unlockedSlots = normalizeUnlockedSlots(restored.unlockedSlots);
    restored.inventory = normalizeInventory(restored.inventory);
    restored.activeSlot = clamp(Math.floor(Number(restored.activeSlot) || 0), 0, FARM_SLOT_COUNT - 1);

    if (!restored.plantedAt && restored.growth > 0) {
      restored.plantedAt = Date.now() - (restored.growth / 100) * restored.growthDuration;
    }

    restored.farmSlots = normalizeFarmSlots(restored.farmSlots, restored);
    return restored;
  }

  core.state = {
    createInitialState,
    normalizeState,
    normalizeInventory,
    normalizeMissionState,
    normalizeZenSound,
    normalizeZenGene,
    safeDroneLevel,
    droneSkinById,
    normalizeDroneSkin,
    safeDataModuleLevel,
    normalizeUnlockedSlots,
    farmStrainById,
    defaultFarmStrainForSlot,
    normalizeFarmSlot,
    normalizeFarmSlots
  };
})();
