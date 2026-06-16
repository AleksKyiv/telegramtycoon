(() => {
  const core = window.CyberGreenCore || (window.CyberGreenCore = {});
  const config = core.config;

  if (!config) {
    throw new Error("CyberGreenCore config is required before zen helpers.");
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function sessionMinutes(durationMs = config.ZEN_DEFAULT_DURATION_MS) {
    return Math.max(1, Math.round((Number(durationMs) || config.ZEN_DEFAULT_DURATION_MS) / 60_000));
  }

  function sessionProgress(elapsedMs = 0, durationMs = config.ZEN_DEFAULT_DURATION_MS) {
    const duration = Math.max(1, Number(durationMs) || config.ZEN_DEFAULT_DURATION_MS);
    return clamp((Number(elapsedMs) || 0) / duration, 0, 1);
  }

  function breathPhase(elapsedMs = 0, loopMs = config.BREATH_LOOP_MS) {
    const duration = Math.max(1, Number(loopMs) || 12_000);
    const phase = ((Number(elapsedMs) || 0) % duration) / duration;
    if (phase < 0.4) return { id: "inhale", label: "Inhale", progress: phase / 0.4 };
    if (phase < 0.7) return { id: "hold", label: "Hold", progress: (phase - 0.4) / 0.3 };
    return { id: "exhale", label: "Exhale", progress: (phase - 0.7) / 0.3 };
  }

  function completionReward({ artifact = 0, dnaHits = 0 } = {}) {
    const reward = 3 + Math.min(9, Math.max(0, Math.floor(Number(artifact) || 0)));
    const energyBonus = 1 + Math.min(5, Math.floor(Math.max(0, Number(dnaHits) || 0) / 3));
    const artifactBonus = Math.min(3, Math.floor(Math.max(0, Number(artifact) || 0) / 2));
    return {
      resonance: reward + energyBonus + artifactBonus,
      zenEnergy: energyBonus + artifactBonus
    };
  }

  core.zen = {
    sessionMinutes,
    sessionProgress,
    breathPhase,
    completionReward
  };
})();
