// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "injectPayload") {
    const payload = request.payload;
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    params.set("test", payload); // Change "test" to the parameter you want to fuzz
    url.search = params.toString();
    window.location.href = url.toString();
  }
});
