document.getElementById("startFuzzing").addEventListener("click", () => {
  const payloads = document.getElementById("payloads").value.split("\n");
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.runtime.sendMessage({
      action: "startFuzzing",
      payloads: payloads
    });
  });
});
