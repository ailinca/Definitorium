console.log('logging from the popup console!!');

const API_KEY = 'a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5';
const BASE_URL = 'http://api.wordnik.com:80/v4/word.json/';
const API_ENDPOINTS = {
    DEFINITIONS: '/definitions'
};

const ERROR_MESSAGES = {
    SERVER_ERROR : 'Ooops, looks like there was a problem fetching a definition. Please try again later!',
    NOT_FOUND: 'Oooops, it appears that our dictionary does not have a definition for '
};


document.addEventListener("DOMContentLoaded", () => {
    // get needed DOM elements
    const userInput = document.getElementById('user-input');
    const errorMessage = document.getElementById('error-message');

    // instantiate helper functions
    const clearError = () => {
        errorMessage.innerHTML = '';
        errorMessage.style.display = 'none';
    };
    const showError = (error) => {
        errorMessage.innerHTML = error;
        errorMessage.style.display = 'inline-block';
    };
    const fetchParams = (limit = 1, includeRelated = false, useCanonical = false, includeTags = false) =>
        `?limit=${limit}&includeRelated=${includeRelated}&useCanonical=${useCanonical}&includeTags=${includeTags}&api_key=${API_KEY}`;
    const createUrl = (wordToSearch = 'placeholder', endpoint = API_ENDPOINTS.DEFINITIONS) => BASE_URL + wordToSearch + endpoint + fetchParams();

    // Obtain the selected word as a global variable of the background page and set it in the DOM TODO: change this!!!
    let backgroundPage = chrome.extension.getBackgroundPage();
    let word = backgroundPage.wordToSearch;
    userInput.innerHTML = word;


    let url = createUrl(word);
    console.log(url);
    clearError();
    console.log('Fetching definition for ' + word);
    fetch(url)
        .then(response => {
            if (response.status !== 200) {
                console.warn(ERROR_MESSAGES.SERVER_ERROR + 'Status Code: ' + response.status);
                showError(ERROR_MESSAGES.SERVER_ERROR);
                return;
            }
            // Examine the text in the response
            response.json()
                .then(data => {
                    console.log(data);
                    if (data.length) {
                        console.log('Definition requested is: ' + data[0].text);
                        userInput.innerHTML += ' = ' + data[0].text;
                    } else {
                        console.warn(`${ERROR_MESSAGES.NOT_FOUND}"${word}"`);
                        showError(`${ERROR_MESSAGES.NOT_FOUND}"${word}"`);
                    }
                });
        })
        .catch(err => {
            console.log('Fetch Error :-S', err);
        });
});
