(() => {
  const core = window.CyberGreenCore || (window.CyberGreenCore = {});
  const config = core.config;

  if (!config) {
    throw new Error("CyberGreenCore config is required before economy helpers.");
  }

  const farmPassConfig = config.FARM_PASS_CONFIG || {};
  const starsProducts = config.STARS_PRODUCTS || {};

  function safeAmount(value) {
    return Math.max(0, Math.floor(Number(value) || 0));
  }

  function cloneReward(reward = {}) {
    return reward && typeof reward === "object" ? { ...reward } : {};
  }

  function starsProductById(productId = "energy_pack_10") {
    const id = String(productId || "energy_pack_10");
    return starsProducts[id] || starsProducts.energy_pack_10 || null;
  }

  function starsAmountForProduct(productId = "energy_pack_10", fallback = 10) {
    const product = starsProductById(productId);
    return safeAmount(product?.stars || fallback);
  }

  function starsReward(productId = "energy_pack_10") {
    return cloneReward(starsProductById(productId)?.reward);
  }

  function farmPassDayKey(time = Date.now()) {
    const date = new Date(time);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function normalizeFarmPass(value = {}, days = farmPassConfig.days || 30) {
    const pass = value && typeof value === "object" ? value : {};
    const claimedDays = Array.isArray(pass.claimedDays)
      ? pass.claimedDays.map((day) => String(day)).filter(Boolean)
      : [];
    return {
      activeUntil: Math.max(0, Number(pass.activeUntil) || 0),
      purchasedAt: Math.max(0, Number(pass.purchasedAt) || 0),
      claimedDays: [...new Set(claimedDays)].slice(-safeAmount(days || 30)),
      uniqueFlowerClaimed: Boolean(pass.uniqueFlowerClaimed)
    };
  }

  function farmPassSnapshot(value = {}, now = Date.now()) {
    const pass = normalizeFarmPass(value);
    const active = pass.activeUntil > now;
    const today = farmPassDayKey(now);
    const remainingMs = Math.max(0, pass.activeUntil - now);
    return {
      pass,
      active,
      today,
      claimedToday: pass.claimedDays.includes(today),
      remainingDays: active ? Math.max(1, Math.ceil(remainingMs / 86_400_000)) : 0,
      claimedCount: pass.claimedDays.length
    };
  }

  function applyFlatReward(state = {}, reward = {}) {
    const next = state && typeof state === "object" ? { ...state } : {};
    next.energy = safeAmount(next.energy) + safeAmount(reward.energy);
    next.score = safeAmount(next.score) + safeAmount(reward.score);
    next.seed = safeAmount(next.seed) + safeAmount(reward.se ?? reward.seed);
    next.resonance = safeAmount(next.resonance) + safeAmount(reward.resonance);
    next.artifact = safeAmount(next.artifact) + safeAmount(reward.artifact);
    return next;
  }

  function productUnlockSlot(productId = "") {
    const reward = starsReward(productId);
    return reward.slot === undefined ? null : safeAmount(reward.slot);
  }

  function expectedRewardMultiplier() {
    return (0.06 * 4) + (0.17 * 1.8) + (0.32 * 1) + (0.45 * 0.6);
  }

  function farmStrainBalance(strain = {}) {
    const expectedHarvest = Math.round((Number(strain.score) || 0) * expectedRewardMultiplier());
    const durationMs = Math.max(1, Number(strain.durationMs) || 1);
    const crcCost = safeAmount(strain.plantCostScore);
    return {
      id: strain.id || "",
      durationMs,
      durationSeconds: Math.round(durationMs / 1000),
      crcCost,
      expectedHarvest,
      expectedHarvestPerMinute: Math.round((expectedHarvest / Math.max(0.1, durationMs / 60_000)) * 10) / 10
    };
  }

  function auditBalance({
    farmStrains = config.FARM_STRAINS || [],
    labRecipes = config.LAB_RECIPES || [],
    products = starsProducts
  } = {}) {
    const issues = [];
    const starter = Array.isArray(farmStrains) ? farmStrains[0] : null;
    const starterBalance = farmStrainBalance(starter);

    if (!starter) {
      issues.push({ level: "error", area: "farm", message: "Starter strain is missing." });
    } else {
      if (starterBalance.durationMs > 45_000) {
        issues.push({ level: "error", area: "farm", message: "Starter strain must complete in 45 seconds or less." });
      }
      if (starterBalance.crcCost > 2) {
        issues.push({ level: "warn", area: "farm", message: "Starter strain should cost 0-2 CRC so the first loop is not blocked." });
      }
    }

    (Array.isArray(labRecipes) ? labRecipes : []).forEach((recipe) => {
      if (safeAmount(recipe.energy) > 0) {
        issues.push({
          level: "error",
          area: "lab",
          id: recipe.id || "",
          message: "Lab recipes must not use CRC as a synthesis ingredient."
        });
      }
    });

    Object.values(products || {}).forEach((product) => {
      if (!product?.id) {
        issues.push({ level: "error", area: "stars", message: "Stars product is missing id." });
      }
      if (safeAmount(product?.stars) <= 0) {
        issues.push({ level: "error", area: "stars", id: product?.id || "", message: "Stars product must have a positive Stars price." });
      }
      if (!product?.reward || !Object.keys(product.reward).length) {
        issues.push({ level: "error", area: "stars", id: product?.id || "", message: "Stars product must declare paid value reward." });
      }
    });

    return {
      ok: !issues.some((issue) => issue.level === "error"),
      issues,
      starter: starterBalance,
      expectedRewardMultiplier: expectedRewardMultiplier()
    };
  }

  core.economy = {
    currencies: {
      main: { id: "score", label: "Bio", stateKey: "score" },
      crc: { id: "energy", label: "CRC", stateKey: "energy" },
      se: { id: "seed", label: "SE", stateKey: "seed" },
      zen: { id: "resonance", label: "ZEN", stateKey: "resonance" },
      stars: { id: "stars", label: "Stars", telegramCurrency: "XTR" }
    },
    farmPassConfig,
    starsProducts,
    safeAmount,
    starsProductById,
    starsAmountForProduct,
    starsReward,
    farmPassDayKey,
    normalizeFarmPass,
    farmPassSnapshot,
    applyFlatReward,
    productUnlockSlot,
    expectedRewardMultiplier,
    farmStrainBalance,
    auditBalance
  };
})();
