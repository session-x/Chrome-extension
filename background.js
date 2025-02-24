let payloads = [];
let currentIndex = 0;
let tabId = null;

// Load payloads from storage
chrome.storage.local.get("payloads", (data) => {
  payloads = data.payloads || [];
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startFuzzing") {
    payloads = request.payloads;
    tabId = sender.tab.id;
    currentIndex = 0;
    chrome.storage.local.set({ payloads });
    injectPayload();
  }
});

// Inject the next payload
function injectPayload() {
  if (currentIndex < payloads.length) {
    const payload = payloads[currentIndex];
    chrome.scripting.executeScript({
      target: { tabId },
      func: (payload) => {
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        params.set("test", payload); // Change "test" to the parameter you want to fuzz
        url.search = params.toString();
        window.location.href = url.toString();
      },
      args: [payload]
    });
    currentIndex++;
  } else {
    console.log("Fuzzing complete!");
  }
}

// Listen for page reloads
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    setTimeout(() => {
      chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          const bodyText = document.body.innerText;
          return bodyText;
        }
      }, (results) => {
        const bodyText = results[0].result;
        const payload = payloads[currentIndex - 1];
        if (bodyText.includes(payload)) {
          console.log(`Triggered with payload: ${payload}`);
          alert(`XSS Triggered with payload: ${payload}`);
        }
        injectPayload();
      });
    }, 1000); // Wait for the page to fully load
  }
});
