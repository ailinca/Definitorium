console.log('Logging from the background script!');

let wordToSearch = 'defaultWord';

// message handler => either save the word received from the content script or send it to the popup when requested
const messageReceived = (message, sender, sendResponse) => {
    console.log('Received message from the content script!');
    console.log(message);
    if(message.text === "popupReady") {
        console.log('Received popupReady message from the popup => sending "' + wordToSearch + '" to popup!');
        sendResponse({text: wordToSearch})
    } else {
        console.log('Received "' + message.text + '" from the content script => saving it in the background script!');
        wordToSearch = message.text;
    }
};

// handle message sent from the content script
chrome.runtime.onMessage.addListener(messageReceived);