const RULE_ID_START = 1;
const MAX_RULES = 100;

let currentRuleIds = [];
let focusActive = false;

function buildRules(blockedSites) {
  const rules = [];
  const sites = Array.isArray(blockedSites) ? blockedSites : [];
  const normalized = sites
    .map((s) => String(s).trim().toLowerCase())
    .filter((s) => s.length > 0);
  const seen = new Set();
  let id = RULE_ID_START;
  for (const host of normalized) {
    if (seen.has(host) || id > RULE_ID_START + MAX_RULES - 1) continue;
    seen.add(host);
    const domain = host.startsWith(".") ? host.slice(1) : host;
    rules.push({
      id,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: `*://*.${domain}/*`,
        resourceTypes: ["main_frame"],
      },
    });
    rules.push({
      id: id + 1,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: `*://${domain}/*`,
        resourceTypes: ["main_frame"],
      },
    });
    id += 2;
  }
  return rules;
}

function applyFocusState(active, blockedSites) {
  focusActive = !!active;
  const toRemove = [...currentRuleIds];
  currentRuleIds = [];
  chrome.declarativeNetRequest.updateDynamicRules(
    { removeRuleIds: toRemove },
    () => {
      if (active && blockedSites && blockedSites.length > 0) {
        const rules = buildRules(blockedSites);
        currentRuleIds = rules.map((r) => r.id);
        chrome.declarativeNetRequest.updateDynamicRules(
          { addRules: rules },
          () => {}
        );
      }
    }
  );
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "FOCUS_STATE") {
    applyFocusState(msg.active, msg.blockedSites);
    sendResponse({ ok: true });
  } else if (msg.type === "GET_FOCUS_STATE") {
    sendResponse({ active: focusActive });
  }
  return true;
});
