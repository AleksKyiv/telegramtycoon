(() => {
  const core = window.CyberGreenCore || (window.CyberGreenCore = {});
  const config = core.config;

  if (!config) {
    throw new Error("CyberGreenCore config is required before lab helpers.");
  }

  const recipes = Array.isArray(config.LAB_RECIPES) ? config.LAB_RECIPES : [];

  function safeAmount(value) {
    return Math.max(0, Math.floor(Number(value) || 0));
  }

  function defaultRecipeId() {
    return String(recipes[0]?.id || "starter_bio_fusion");
  }

  function recipeById(id = defaultRecipeId()) {
    return recipes.find((recipe) => recipe.id === id) || recipes[0] || null;
  }

  function normalizeRecipeId(id = defaultRecipeId()) {
    return recipeById(id)?.id || defaultRecipeId();
  }

  function materialCatalog() {
    const materials = new Map();
    recipes.forEach((recipe) => {
      (recipe.materials || []).forEach((entry) => {
        if (!entry?.id || materials.has(entry.id)) return;
        materials.set(entry.id, {
          id: entry.id,
          short: entry.short || entry.id,
          name: entry.name || entry.short || entry.id,
          color: recipe.accent || "#7effde"
        });
      });
    });
    return [...materials.values()];
  }

  function materialById(id = "") {
    return materialCatalog().find((material) => material.id === id) || null;
  }

  function materialCount(id = "", inventory = {}) {
    return safeAmount(inventory?.materials?.[id]);
  }

  function recipeRequirements(recipe = recipeById(), inventory = {}) {
    const activeRecipe = recipe || recipeById();
    return (activeRecipe?.materials || []).map((entry) => {
      const have = materialCount(entry.id, inventory);
      const need = Math.max(1, safeAmount(entry.amount) || 1);
      const material = materialById(entry.id);
      return {
        id: entry.id,
        have,
        need,
        ready: have >= need,
        short: material?.short || entry.id,
        name: material?.name || entry.id,
        color: material?.color || activeRecipe?.accent || "#7effde"
      };
    });
  }

  function recipeReady(recipe = recipeById(), inventory = {}) {
    return recipeRequirements(recipe, inventory).every((item) => item.ready);
  }

  function recipeCost(recipe = recipeById()) {
    return {
      geneStrands: Math.max(1, safeAmount(recipe?.geneStrands) || 1),
      energy: Math.max(1, safeAmount(recipe?.energy) || 1),
      se: Math.max(1, safeAmount(recipe?.se ?? recipe?.seed) || 1),
      score: safeAmount(recipe?.score),
      resonance: safeAmount(recipe?.resonance),
      artifact: safeAmount(recipe?.artifact)
    };
  }

  core.lab = {
    defaultRecipeId,
    recipeById,
    normalizeRecipeId,
    materialCatalog,
    materialById,
    materialCount,
    recipeRequirements,
    recipeReady,
    recipeCost
  };
})();
