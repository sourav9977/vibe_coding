function sendFocusStateToBackground(detail) {
  chrome.runtime.sendMessage({
    type: "FOCUS_STATE",
    active: !!detail.active,
    blockedSites: detail.blockedSites || [],
  });
}

window.addEventListener("todoFocusUpdate", (e) => {
  if (e.detail) sendFocusStateToBackground(e.detail);
});
