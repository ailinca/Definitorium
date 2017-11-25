console.log('Logging from the background script!');
window.wordToSearch = 'defaultWord';

const messageReceived = (message, sender, sendResponse) => {
    wordToSearch = message.text;
};

// handle message sent from the content script
chrome.runtime.onMessage.addListener(messageReceived);
