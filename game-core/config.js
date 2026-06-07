(() => {
  const config = {
    GROW_DURATION_MS: 30_000,
    BOOST_MS: 4_500,
    ZEN_DEFAULT_DURATION_MS: 60_000,
    ZEN_DURATION_OPTIONS: [60_000, 120_000, 180_000],
    ZEN_SOUND_OPTIONS: ["deep", "rain", "pulse"],
    ZEN_GENE_OPTIONS: ["sprout", "crystal", "aura"],
    ZEN_DNA_WINDOW_MS: 9_000,
    ZEN_DNA_SHOW_START_MS: 900,
    ZEN_DNA_SHOW_END_MS: 7_600,
    ZEN_SOUND_PRESETS: {
      deep: { master: 0.105, filter: 330, lfo: 0.045, lfoGain: 76, a: 87.31, b: 130.81, shimmer: 261.63, air: 680, airGain: 0.038 },
      rain: { master: 0.095, filter: 420, lfo: 0.03, lfoGain: 54, a: 73.42, b: 110, shimmer: 196, air: 1180, airGain: 0.075 },
      pulse: { master: 0.11, filter: 510, lfo: 0.075, lfoGain: 96, a: 98, b: 146.83, shimmer: 293.66, air: 860, airGain: 0.044 }
    },
    BREATH_LOOP_MS: 12_000,
    MISSION_WAIT_MS: 10_000,
    MISSIONS: [
      {
        id: "telegram_channel",
        type: "telegram",
        title: "Green Channel",
        label: "Join",
        url: "https://t.me/Qwanttarium_bot",
        reward: { energy: 25 },
        note: "Starter energy"
      },
      {
        id: "youtube_signal",
        type: "youtube",
        title: "YouTube Signal",
        label: "Open",
        url: "https://www.youtube.com/",
        reward: { energy: 15 },
        note: "Watch path"
      },
      {
        id: "instagram_growth",
        type: "instagram",
        title: "Instagram Growth",
        label: "Open",
        url: "https://www.instagram.com/",
        reward: { energy: 15 },
        note: "Social pulse"
      },
      {
        id: "tiktok_pulse",
        type: "tiktok",
        title: "TikTok Pulse",
        label: "Open",
        url: "https://www.tiktok.com/",
        reward: { energy: 15 },
        note: "Viral sprout"
      }
    ],
    PLANT_VARIANTS: Array.from({ length: 100 }, (_, index) => {
      const seed = index + 1;
      return {
        id: index,
        leafHue: 82 + ((seed * 37) % 66),
        stemHue: 92 + ((seed * 19) % 48),
        accentHue: 166 + ((seed * 29) % 82),
        coreHue: 52 + ((seed * 11) % 54),
        branchSpread: 0.78 + (((seed * 17) % 46) / 100),
        leafScale: 0.68 + (((seed * 13) % 36) / 100),
        filamentSpeed: 0.82 + (((seed * 23) % 44) / 100)
      };
    }),
    FARM_SLOT_COUNT: 6,
    FARM_STRAINS: [
      {
        id: "neon_basil",
        name: "NEON BASIL",
        shortName: "BASIL",
        type: "common",
        durationMs: 5 * 60_000,
        score: 22,
        biomass: 3,
        geneStrands: 0,
        variantShift: 0,
        plantCostScore: 10,
        labMaterial: {
          id: "bio_leaf",
          name: "Bio Leaf",
          short: "Leaf",
          amount: 1
        },
        color: "#00D870"
      },
      {
        id: "cyber_rukola",
        name: "CYBER RUKOLA",
        shortName: "RUKOLA",
        type: "common",
        durationMs: 10 * 60_000,
        score: 45,
        biomass: 4,
        geneStrands: 1,
        variantShift: 13,
        plantCostScore: 25,
        labMaterial: {
          id: "green_fiber",
          name: "Green Fiber",
          short: "Fiber",
          amount: 1
        },
        color: "#00B860"
      },
      {
        id: "glitch_sunflower",
        name: "GLITCH SUNFLR",
        shortName: "SUNFLR",
        type: "common",
        durationMs: 20 * 60_000,
        score: 80,
        biomass: 6,
        geneStrands: 2,
        variantShift: 29,
        plantCostScore: 50,
        labMaterial: {
          id: "solar_pollen",
          name: "Solar Pollen",
          short: "Pollen",
          amount: 1
        },
        color: "#FFB800"
      },
      {
        id: "pixel_wheat",
        name: "PIXEL WHEAT",
        shortName: "WHEAT",
        type: "common",
        durationMs: 30 * 60_000,
        score: 90,
        biomass: 7,
        geneStrands: 1,
        variantShift: 37,
        plantCostScore: 60,
        labMaterial: {
          id: "grain_mesh",
          name: "Grain Mesh",
          short: "Mesh",
          amount: 1
        },
        color: "#C8A030"
      },
      {
        id: "chroma_mint",
        name: "CHROMA MINT",
        shortName: "CHROMA",
        type: "rare",
        durationMs: 40 * 60_000,
        score: 160,
        biomass: 9,
        geneStrands: 0,
        variantShift: 47,
        plantCostResonance: 1,
        labMaterial: {
          id: "mint_flux",
          name: "Mint Flux",
          short: "Flux",
          amount: 1
        },
        color: "#00FFB2"
      },
      {
        id: "prime_spirulina",
        name: "PRIME SPIRULINA",
        shortName: "SPIRUL",
        type: "epic",
        durationMs: 90 * 60_000,
        score: 620,
        biomass: 18,
        geneStrands: 6,
        variantShift: 71,
        plantCostMain: 5000,
        labMaterial: {
          id: "spiru_cell",
          name: "Spiru Cell",
          short: "Spira",
          amount: 2
        },
        color: "#B48EFF"
      }
    ],
    LAB_RECIPES: [
      {
        id: "starter_bio_fusion",
        name: "Starter Bio Fusion",
        result: "Proto Core",
        materials: [
          { id: "bio_leaf", amount: 2 },
          { id: "green_fiber", amount: 2 },
          { id: "solar_pollen", amount: 1 }
        ],
        geneStrands: 2,
        energy: 5,
        se: 1,
        score: 8,
        resonance: 1,
        artifact: 1
      }
    ],
    DRONE_SKINS: [
      {
        id: "bubbles",
        name: "Bubbles",
        tag: "Base",
        route: "Owned",
        note: "Soft balloon shell with a calm floating service pulse.",
        effect: "Air float"
      },
      {
        id: "smile",
        name: "Smile",
        tag: "Fun reward",
        route: "Tasks",
        note: "Friendly face shell for a warmer farm-control feeling.",
        effect: "Mood glow"
      },
      {
        id: "aurora",
        name: "Aurora Core",
        tag: "Stars rare",
        route: "Stars",
        note: "Premium prism shell for rare drops and future paid skins.",
        effect: "Prism aura"
      },
      {
        id: "tech",
        name: "Tech Sentinel",
        tag: "Lab tech",
        route: "Lab",
        note: "A plated service shell with sensor rails and a slower precision patrol.",
        effect: "Slow scan"
      }
    ]
  };

  config.FARM_STRAIN_IDS = config.FARM_STRAINS.map((strain) => strain.id);

  const core = window.CyberGreenCore || (window.CyberGreenCore = {});
  core.config = config;
})();
