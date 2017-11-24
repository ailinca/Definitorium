console.log('Logging from the background script!');

chrome.browserAction.onClicked.addListener(buttonClicked);

function buttonClicked(tab) {
    const message = {
        text: "Hello World!"
    };
    chrome.tabs.sendMessage(tab.id,message);
}