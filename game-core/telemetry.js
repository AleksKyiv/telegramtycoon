(() => {
  const core = window.CyberGreenCore || (window.CyberGreenCore = {});

  const events = {
    appOpened: "app_opened",
    roomOpened: "room_opened",
    starsButtonClicked: "stars_button_clicked",
    starsInvoiceOpened: "stars_invoice_opened",
    starsInvoiceClosed: "stars_invoice_closed",
    starsInvoiceError: "stars_invoice_error",
    starsSlotUnlocked: "stars_slot_unlocked",
    farmSlotPlanted: "farm_slot_planted",
    farmCollected: "farm_collected",
    labRecipeSelected: "lab_recipe_selected",
    labRecipeSynthesized: "lab_recipe_synthesized",
    zenStarted: "zen_started",
    zenCompleted: "zen_completed"
  };

  function eventName(key = "") {
    return events[key] || String(key || "");
  }

  function payload(type, details = {}) {
    return {
      type: eventName(type),
      details: details && typeof details === "object" ? { ...details } : {}
    };
  }

  core.telemetry = {
    events,
    eventName,
    payload
  };
})();
