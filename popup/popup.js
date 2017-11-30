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
    const userDefinition = document.getElementById('user-definition');
    const errorMessage = document.getElementById('error-message');
    const canonicalDefinitionIntro = document.getElementById('canonical-definition-intro');
    const canonicalDefinition = document.getElementById('canonical-definition');


    // instantiate helper functions
    const clearError = () => {
        errorMessage.innerHTML = '';
        errorMessage.style.display = 'none';
    };

    const showError = (error) => {
        errorMessage.innerHTML = error;
        errorMessage.style.display = 'inline-block';
    };

    const fetchParams = ({limit = 1, includeRelated = false, useCanonical = true, includeTags = false}) =>
        `?limit=${limit}&includeRelated=${includeRelated}&useCanonical=${useCanonical}&includeTags=${includeTags}&api_key=${API_KEY}`;

    const createUrl = ({wordToSearch = 'placeholder', endpoint = API_ENDPOINTS.DEFINITIONS, useCanonical = true}) =>
        BASE_URL + wordToSearch + endpoint + fetchParams({useCanonical:useCanonical});

    const getOriginalDefinition = (word, responseCanonical={}) => {
        let urlWithoutCanonical = createUrl({wordToSearch: word,useCanonical: false});
        fetch(urlWithoutCanonical)
            .then(response => {
                if (response.status !== 200) {
                    // if this call didn't succeed just display the canonical definition but don't show any error message to the user
                    userDefinition.innerHTML += ' = ' + responseCanonical.text;
                    console.warn(`${ERROR_MESSAGES.SERVER_ERROR} Status Code: ${response.status}`);
                    return;
                }
                response.json()
                    .then(data => {
                        console.log(data);
                        if(data.length) {
                            const responseNonCanonical = data[0];
                            console.log(`Literal definition is ${responseNonCanonical.text}`);

                            // append this definition to the DOM first
                            userDefinition.innerHTML += ' = ' + responseNonCanonical.text;

                            // add a specific message to indicate that there might be a better definition available
                            canonicalDefinitionIntro.innerHTML += `You also might be interested in knowing the definition for "${responseCanonical.word}". Here ya go:`;

                            // add the canonical word and it's definition
                            canonicalDefinition.innerHTML += `${responseCanonical.word} = ${responseCanonical.text}`;
                        } else {
                            // again, don't let the user know we don't have a definition for him, just log to the console
                            console.warn(`${ERROR_MESSAGES.NOT_FOUND}"${word}"`);
                        }
                    });
            })
            .catch(err => {
                console.log('Fetch Error :-S', err);
            });
    };

    const getCanonicalDefinition = (word) => {
        const urlWithCanonical = createUrl({wordToSearch: word});
        fetch(urlWithCanonical)
            .then(response => {
                if (response.status !== 200) {
                    console.warn(`${ERROR_MESSAGES.SERVER_ERROR} Status Code: ${response.status}`);
                    showError(ERROR_MESSAGES.SERVER_ERROR);
                    return;
                }
                // Examine the text in the response
                response.json()
                    .then(data => {
                        console.log(data);
                        if (data.length) {
                            const responseCanonical = data[0];
                            console.log(`Canonical definition is:${responseCanonical.text}`);

                            // check if the definition returned is for the same word or a derived one
                            if(responseCanonical.word.toLowerCase() === word.toLowerCase()) {

                                // just display the definition obtained
                                userDefinition.innerHTML += ' = ' + responseCanonical.text;
                            } else {
                                // request the definition for the original word
                                getOriginalDefinition(word, responseCanonical);
                            }

                        } else {
                            console.warn(`${ERROR_MESSAGES.NOT_FOUND}"${word}"`);
                            showError(`${ERROR_MESSAGES.NOT_FOUND}"${word}"`);
                        }
                    });
            })
            .catch(err => {
                console.log('Fetch Error :-S', err);
            });
    };

    // Obtain the selected word as a global variable of the background page and set it in the DOM TODO: change this!!!
    let backgroundPage = chrome.extension.getBackgroundPage();
    let word = backgroundPage.wordToSearch;
    userDefinition.innerHTML = word;

    clearError();
    getCanonicalDefinition(word);
});
