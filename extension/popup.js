chrome.runtime.sendMessage({ type: "GET_FOCUS_STATE" }, (res) => {
  const el = document.getElementById("status");
  if (res && res.active) {
    el.textContent = "Focus mode is on";
    el.className = "status on";
  } else {
    el.textContent = "Focus mode is off";
    el.className = "status off";
  }
});
