const titleCSS = "text-shadow: " +
    "-1px -1px hsl(0,100%,50%)," +
    "23px 13px hsl(70.2, 100%, 50%), " +
    "25px 14px hsl(75.6, 100%, 50%), " +
    "27px 15px hsl(81, 100%, 50%), " +
    "28px 16px hsl(86.4, 100%, 50%), " +
    "30px 17px hsl(91.8, 100%, 50%), " +
    "32px 18px hsl(97.2, 100%, 50%), " +
    "33px 19px hsl(102.6, 100%, 50%), " +
    "35px 20px hsl(108, 100%, 50%), " +
    "36px 21px hsl(113.4, 100%, 50%), " +
    "38px 22px hsl(118.8, 100%, 50%), " +
    "39px 23px hsl(124.2, 100%, 50%); " +
    "font-size: 40px;";
console.log('%cLogging from the background script!', titleCSS);

let wordToSearch = 'placeholder';

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