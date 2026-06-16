(() => {
  const core = window.CyberGreenCore || (window.CyberGreenCore = {});
  const config = core.config;

  if (!config) {
    throw new Error("CyberGreenCore config is required before farm helpers.");
  }

  const { GROW_DURATION_MS } = config;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function slotProgress(slot, now = Date.now()) {
    if (!slot?.strain || !slot.plantedAt) return 0;
    const duration = Math.max(1, Number(slot.growthDuration) || GROW_DURATION_MS);
    return clamp(((now - Number(slot.plantedAt)) / duration) * 100, 0, 100);
  }

  function slotReady(slot, now = Date.now()) {
    return Boolean(slot?.strain && slotProgress(slot, now) >= 100);
  }

  function remainingMs(slot, now = Date.now()) {
    if (!slot?.strain || !slot.plantedAt) return 0;
    const duration = Math.max(1, Number(slot.growthDuration) || GROW_DURATION_MS);
    return Math.max(0, duration - (now - Number(slot.plantedAt)));
  }

  function growthDuration({ strain, artifact = 0, droneSpeedBonus = 0, zenBoosted = false, capsuleIndex = 0 } = {}) {
    const baseDuration = Math.max(1, Number(strain?.durationMs) || GROW_DURATION_MS);
    const artifactMs = Math.max(0, Number(artifact) || 0) * (capsuleIndex > 0 ? 1_000 : 1_200);
    const zenMultiplier = zenBoosted ? (capsuleIndex > 0 ? 0.82 : 0.78) : 1;
    return Math.max(9_000, Math.round((baseDuration - artifactMs - Math.max(0, Number(droneSpeedBonus) || 0)) * zenMultiplier));
  }

  function rewardTier(roll = Math.random()) {
    if (roll > 0.94) return { multiplier: 4, label: "Quantum", color: "#ffb800" };
    if (roll > 0.77) return { multiplier: 1.8, label: "Enhanced", color: "#7effde" };
    if (roll > 0.45) return { multiplier: 1, label: "Stable", color: "#74ffda" };
    return { multiplier: 0.6, label: "Light", color: "#9aa8b8" };
  }

  function slotHarvestBonus(index) {
    if (Number(index) === 4) return { multiplier: 3, seGain: 0, label: "x3" };
    if (Number(index) === 5) return { multiplier: 5, seGain: 5, label: "x5 +5 SE" };
    return { multiplier: 1, seGain: 0, label: "" };
  }

  function plantCost(strain = {}) {
    return {
      main: Math.max(0, Math.floor(Number(strain.plantCostMain) || 0)),
      crc: Math.max(0, Math.floor(Number(strain.plantCostScore) || 0)),
      resonance: Math.max(0, Math.floor(Number(strain.plantCostResonance) || 0)),
      inventory: strain.requiresInventory ? 1 : 0,
      inventoryKey: strain.inventoryKey || strain.id || ""
    };
  }

  function plantAffordance(strain, { score = 0, energy = 0, resonance = 0, inventory = {} } = {}) {
    if (!strain) return { ok: false, reason: "strain", cost: plantCost() };

    const cost = plantCost(strain);
    const strains = inventory?.strains && typeof inventory.strains === "object" ? inventory.strains : {};
    const ownedInventory = Math.max(0, Math.floor(Number(strains[cost.inventoryKey]) || 0));

    if (cost.inventory && ownedInventory < cost.inventory) {
      return { ok: false, reason: "inventory", cost, need: cost.inventory, have: ownedInventory };
    }
    if (cost.main && Number(score) < cost.main) {
      return { ok: false, reason: "main", cost, need: cost.main, have: Math.max(0, Number(score) || 0) };
    }
    if (cost.crc && Number(energy) < cost.crc) {
      return { ok: false, reason: "crc", cost, need: cost.crc, have: Math.max(0, Number(energy) || 0) };
    }
    if (cost.resonance && Number(resonance) < cost.resonance) {
      return { ok: false, reason: "resonance", cost, need: cost.resonance, have: Math.max(0, Number(resonance) || 0) };
    }

    return { ok: true, reason: "", cost };
  }

  function spendPlantCost(strain, { score = 0, energy = 0, resonance = 0, inventory = {} } = {}) {
    const cost = plantCost(strain);
    const nextInventory = {
      ...inventory,
      strains: inventory?.strains && typeof inventory.strains === "object" ? { ...inventory.strains } : {}
    };

    if (cost.inventory && cost.inventoryKey) {
      nextInventory.strains[cost.inventoryKey] = Math.max(0, Math.floor(Number(nextInventory.strains[cost.inventoryKey]) || 0) - cost.inventory);
    }

    return {
      score: Math.max(0, Number(score) || 0) - cost.main,
      energy: Math.max(0, Number(energy) || 0) - cost.crc,
      resonance: Math.max(0, Number(resonance) || 0) - cost.resonance,
      inventory: nextInventory,
      cost
    };
  }

  function biomassGain(harvest, artifact = 0) {
    return 2 + Math.floor(Math.max(0, Number(harvest) || 0) / 16) + Math.min(4, Math.floor(Math.max(0, Number(artifact) || 0) / 2));
  }

  function harvestReward({ strain, artifact = 0, droneHarvestBonus = 0, slotIndex = 0, tier = rewardTier(), artifactFactor = 4, includeSlotBonus = true } = {}) {
    const slotBonus = includeSlotBonus ? slotHarvestBonus(slotIndex) : slotHarvestBonus(-1);
    const baseScore = Number(strain?.score) || 0;
    const harvest = Math.round((baseScore + Math.max(0, Number(artifact) || 0) * artifactFactor + Math.max(0, Number(droneHarvestBonus) || 0)) * tier.multiplier * slotBonus.multiplier);
    return {
      tier,
      slotBonus,
      harvest,
      biomassGain: (Number(strain?.biomass) || 0) + biomassGain(harvest, artifact),
      geneGain: Math.max(0, Math.floor(Number(strain?.geneStrands) || 0)),
      seGain: slotBonus.seGain
    };
  }

  core.farm = {
    slotProgress,
    slotReady,
    remainingMs,
    growthDuration,
    rewardTier,
    slotHarvestBonus,
    plantCost,
    plantAffordance,
    spendPlantCost,
    biomassGain,
    harvestReward
  };
})();
