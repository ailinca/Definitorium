console.log("Logging from the content script!");

const receivedMessage = (message, sender, sendResponse) => {
    console.log(message.text);
};

const wordSelected = () => {
    let selectedText = window.getSelection().toString().trim();
    console.log(selectedText);
    if (selectedText.length > 0) {
        let message = {
            text: selectedText
        };
        chrome.runtime.sendMessage(message);
    }
};

// receive message from background script
chrome.runtime.onMessage.addListener(receivedMessage);

window.addEventListener('mouseup', wordSelected);