console.log("Logging from the content script!");

// receive messages from the background script => currently unused functionality
const receivedMessage = (message, sender, sendResponse) => {
    console.log(message.text);
};

// wrap chrome.runtime.sendMessage in a try catch block to avoid background script not running issues
const sendMessage = (message) => {
    try {
        chrome.runtime.sendMessage(message);
    } catch(e) {
        if (
            e.message.match(/Invocation of form runtime\.connect/) &&
            e.message.match(/doesn't match definition runtime\.connect/)
        ) {
            alert('Definitorium has been reloaded. Please refresh the page');
        } else {
            throw(e);
        }
    }
};

const wordSelected = () => {
    let selectedText = window.getSelection().toString().trim();
    console.log(selectedText);
    selectedText.length > 0 ? sendMessage({text: selectedText}) : console.log('Empty string selected!');
};


// receive message from background script
chrome.runtime.onMessage.addListener(receivedMessage);

window.addEventListener('mouseup', wordSelected);