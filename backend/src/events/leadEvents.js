const EventEmitter = require("events");

// Single shared event bus for the lead pipeline (validate -> dedupe -> score -> assign -> notify).
// In-process only (no queue/Redis) - appropriate for this project's scale; see
// backend/src/events/listeners/ for subscribers.
class LeadEventBus extends EventEmitter {}

const leadEvents = new LeadEventBus();

// Keep going even if a listener throws - one failing step (e.g. ML service down)
// must never crash the process or block the others.
leadEvents.on("error", (err) => {
  // eslint-disable-next-line no-console
  console.error("[leadEvents] listener error:", err);
});

const LEAD_EVENTS = {
  LEAD_CREATED: "LEAD_CREATED",
  LEAD_INTERACTION_RECORDED: "LEAD_INTERACTION_RECORDED",
};

module.exports = { leadEvents, LEAD_EVENTS };
