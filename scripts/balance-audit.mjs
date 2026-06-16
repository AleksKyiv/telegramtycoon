import { readFile } from "node:fs/promises";
import { Script, createContext } from "node:vm";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const rewardTiers = [
  { id: "quantum", probability: 0.06, multiplier: 4 },
  { id: "enhanced", probability: 0.17, multiplier: 1.8 },
  { id: "stable", probability: 0.32, multiplier: 1 },
  { id: "light", probability: 0.45, multiplier: 0.6 }
];

function safeAmount(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

function expectedMultiplier() {
  return rewardTiers.reduce((sum, tier) => sum + tier.probability * tier.multiplier, 0);
}

function multiplierStdDev() {
  const mean = expectedMultiplier();
  const variance = rewardTiers.reduce((sum, tier) => sum + tier.probability * (tier.multiplier - mean) ** 2, 0);
  return Math.sqrt(variance);
}

function plantMetrics(strain) {
  const durationMinutes = Math.max(0.1, Number(strain.durationMs) / 60_000);
  const harvestMean = (Number(strain.score) || 0) * expectedMultiplier();
  const harvestStdDev = (Number(strain.score) || 0) * multiplierStdDev();
  return {
    id: strain.id,
    durationMinutes,
    crcCost: safeAmount(strain.plantCostScore),
    mainCost: safeAmount(strain.plantCostMain),
    zenCost: safeAmount(strain.plantCostResonance),
    harvestMean,
    harvestStdDev,
    netBioMean: harvestMean - safeAmount(strain.plantCostScore),
    bioPerHour: harvestMean * (60 / durationMinutes),
    genePerHour: safeAmount(strain.geneStrands) * (60 / durationMinutes),
    materialPerHour: safeAmount(strain.labMaterial?.amount || 1) * (60 / durationMinutes)
  };
}

function starsProductValue(product) {
  const reward = product.reward || {};
  const stars = Math.max(1, safeAmount(product.stars));
  const passDays = safeAmount(reward.farmPassDays);
  const effectiveCrc = safeAmount(reward.energy) + safeAmount(reward.dailyCrc) * passDays;
  const effectiveSe = safeAmount(reward.se ?? reward.seed) + safeAmount(reward.dailySe) * passDays;
  return {
    id: product.id,
    stars,
    effectiveCrc,
    effectiveSe,
    crcPerStar: effectiveCrc / stars,
    sePerStar: effectiveSe / stars,
    scorePerStar: safeAmount(reward.score) / stars,
    hasCapacity: reward.slot !== undefined || reward.farmPassDays !== undefined,
    hasUnique: reward.uniqueFlower !== undefined || reward.uniqueMutation !== undefined
  };
}

function productIssues(products) {
  const values = Object.values(products).map(starsProductValue);
  const issues = [];
  const crcProducts = values.filter((item) => item.crcPerStar > 0);
  if (crcProducts.length > 1) {
    const min = Math.min(...crcProducts.map((item) => item.crcPerStar));
    const max = Math.max(...crcProducts.map((item) => item.crcPerStar));
    if (max / Math.max(0.1, min) > 3) {
      issues.push({
        level: "warn",
        area: "stars",
        message: `CRC per Star spread is too wide: ${min.toFixed(2)}-${max.toFixed(2)}. Keep similar products within 3x unless one is a subscription/pass.`
      });
    }
  }
  return { values, issues };
}

function labMaterialTimeModel(strains, recipes) {
  const materialRates = new Map();
  strains.forEach((strain) => {
    const material = strain.labMaterial;
    if (!material?.id) return;
    const metrics = plantMetrics(strain);
    const current = materialRates.get(material.id) || { materialId: material.id, ratePerHour: 0, source: "" };
    if (metrics.materialPerHour > current.ratePerHour) {
      materialRates.set(material.id, {
        materialId: material.id,
        ratePerHour: metrics.materialPerHour,
        source: strain.id
      });
    }
  });

  return recipes.map((recipe) => {
    const bottlenecks = (recipe.materials || []).map((entry) => {
      const rate = materialRates.get(entry.id);
      return {
        materialId: entry.id,
        need: safeAmount(entry.amount),
        source: rate?.source || "",
        hoursAtBestSource: rate?.ratePerHour ? safeAmount(entry.amount) / rate.ratePerHour : Infinity
      };
    });
    const totalHours = bottlenecks.reduce((sum, item) => sum + item.hoursAtBestSource, 0);
    return {
      id: recipe.id,
      totalHoursAtBestSources: totalHours,
      bottlenecks
    };
  });
}

async function loadCore() {
  const context = createContext({ window: {}, console, Math, Date });
  for (const file of [
    "game-core/config.js",
    "game-core/state.js",
    "game-core/economy.js",
    "game-core/farm.js",
    "game-core/lab.js",
    "game-core/zen.js",
    "game-core/telemetry.js"
  ]) {
    const code = await readFile(new URL(file, `file:///${root.replace(/\\/g, "/")}`), "utf8");
    new Script(code, { filename: file }).runInContext(context);
  }
  return context.window.CyberGreenCore;
}

const core = await loadCore();
const config = core.config;
const audit = core.economy.auditBalance();
const plantTable = config.FARM_STRAINS.map(plantMetrics);
const stars = productIssues(config.STARS_PRODUCTS);
const labTimes = labMaterialTimeModel(config.FARM_STRAINS, config.LAB_RECIPES);
const issues = [...audit.issues, ...stars.issues];

const report = {
  ok: !issues.some((issue) => issue.level === "error"),
  issues,
  rewardModel: {
    expectedMultiplier: expectedMultiplier(),
    multiplierStdDev: multiplierStdDev(),
    tiers: rewardTiers
  },
  farm: plantTable,
  lab: labTimes,
  stars: stars.values
};

console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);
