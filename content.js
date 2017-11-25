console.log("Logging from the content script!");

chrome.runtime.onMessage.addListener(receivedMessage);

function receivedMessage(message, sender, sendResponse) {
    console.log(message.text);
}