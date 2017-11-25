console.log('logging from the popup console!!');

document.addEventListener("DOMContentLoaded", () => {
    const userInput = document.getElementById('user-input');
    let backgroundPage = chrome.extension.getBackgroundPage();
    let word = backgroundPage.wordToSearch;
    userInput.innerHTML = word;
});

