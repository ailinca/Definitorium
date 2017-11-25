document.addEventListener("DOMContentLoaded", () => {
    const userInput = document.getElementById('user-input');

    userInput.addEventListener('input', () => {
        changeText();
    });

    const changeText = () => {
        const params = {
            active: true,
            currentWindow: true
        };
        chrome.tabs.query(params, gotTabs);
    };

    const gotTabs = (tabs) => {
        const message = {
            text: userInput.value
        };
        chrome.tabs.sendMessage(tabs[0].id, message)
    };
});