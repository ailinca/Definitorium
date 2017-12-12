console.log('logging from the popup console!!');

//global variable
let word = "placeholder";

// constants area
const API = {
    KEY: 'a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5',
    BASE_URL: 'http://api.wordnik.com:80/v4/word.json',
    ENDPOINTS: {
        DEFINITIONS: 'definitions',
        RELATED_WORDS: 'relatedWords'
    }
};

const ERROR_MESSAGES = {
    SERVER_ERROR: 'Ooops, looks like there was a problem with our server. Please try again later!',
    DEFINITIONS_NOT_FOUND: 'Oooops, it appears that our dictionary does not have a definition for ',
    SYNONYMS_NOT_FOUND: 'We did not find any synonym for your word and for that we are really sorry. Here is a cookie!'
};

const DEFINITIONS_LIMIT = 3;
const SYNONYMS_LIMIT = 10;


const initialize = () => {
    return {
        userDefinition: document.getElementById('user-definition'),
        errorMessage: document.getElementById('error-message'),
        canonicalDefinitionIntro: document.getElementById('canonical-definition-intro'),
        canonicalDefinition: document.getElementById('canonical-definition'),
        synonymsIntro: document.getElementById('synonyms-intro'),
        synonymsElement: document.getElementById('synonyms')
    }
};

document.addEventListener("DOMContentLoaded", () => {

    // tell the background script the popup is ready and get the word selected by the user
    chrome.runtime.sendMessage({text: "popupReady"}, response => {
        console.log(response);
        word = response.text;
        clearPopup();
        getCanonicalDefinition(word);
        getSynonyms(word);
    });


    // get needed DOM elements
    const {userDefinition, errorMessage, canonicalDefinitionIntro, canonicalDefinition, synonymsIntro, synonymsElement} = initialize();

    // instantiate helper functions
    const clearError = () => {
        errorMessage.innerHTML = '';
        errorMessage.style.display = 'none';
    };

    const clearPopup = () => {
        userDefinition.innerHTML = '';
        canonicalDefinitionIntro.innerHTML = '';
        canonicalDefinition.innerHTML = '';
        synonymsIntro.innerHTML = '';
        synonymsElement.innerHTML = '';
        clearError();
    };

    const showError = (error) => {
        errorMessage.innerHTML = error;
        errorMessage.style.display = 'inline-block';
    };

    const fetchParams = function (params) {
        let toReturn = '';
        for ([k, v] of Object.entries(Array.from(arguments)[0])) {
            toReturn += `${k}=${v}&`;
        }
        return toReturn;
    };

    const createUrl = ({wordToSearch = 'placeholder', endpoint = API.ENDPOINTS.DEFINITIONS, params = {}}) =>
        encodeURI(`${API.BASE_URL}/${wordToSearch}/${endpoint}?${fetchParams(params)}`);

    const appendDefinition = (selector, def, index) => {
        selector.innerHTML += ` ${index}. ${def} \n`;
    };

    const handleFetchError = err => console.log('Fetch Error :-S', err);

    // add a specific message to indicate that there might be a more useful definition available
    const displayCanonicalDefinitionIntro = (word) => {
        canonicalDefinitionIntro.innerHTML += `You also might be interested in knowing the definition for "${word}". Here ya go:`;
    };

    // add the canonical word and ALL it's definitions
    const displayCanonicalDefinition = (response) => {
        console.log(`Canonical definition is:${response[0].text}`);
        canonicalDefinition.innerHTML += `${response[0].word} =`;
        response.map((resp, index) => appendDefinition(canonicalDefinition, resp.text, index + 1));
    };

    // display the definitions for the exact word selected by the user
    const displayOriginalDefinition = (response) => {
        console.log(`Literal definition is ${response[0].text}`);
        userDefinition.innerHTML += `${response[0].word} =`;
        response.map((resp, index) => appendDefinition(userDefinition, resp.text, index + 1));
    };

    const getOriginalDefinition = (word, responseCanonical = []) => {
        const fetchParams = {
            useCanonical: false,
            limit: DEFINITIONS_LIMIT,
            includeRelated: false,
            includeTags: false,
            api_key: API.KEY
        };
        const urlWithoutCanonical = createUrl({
            wordToSearch: word,
            endpoint: API.ENDPOINTS.DEFINITIONS,
            params: fetchParams
        });

        fetch(urlWithoutCanonical)
            .then(response => {
                if (response.status !== 200) {
                    // if this call didn't succeed just display the canonical definition but don't show any error message to the user
                    if (responseCanonical.length) {
                        displayCanonicalDefinition(responseCanonical);
                    } else {
                        showError(ERROR_MESSAGES.SERVER_ERROR);
                    }
                    console.warn(`${ERROR_MESSAGES.SERVER_ERROR} Status Code: ${response.status}`);
                    return;
                }
                response.json()
                    .then(data => {
                        console.log(data);
                        if (data.length) {
                            displayOriginalDefinition(data);
                            if (responseCanonical.length) {
                                displayCanonicalDefinitionIntro(responseCanonical[0].word);
                                displayCanonicalDefinition(responseCanonical);
                            }
                        } else {
                            // again, don't let the user know we don't have a definition for him, just log to the console and display the canonical definition
                            displayCanonicalDefinition(responseCanonical);
                            console.warn(`${ERROR_MESSAGES.DEFINITIONS_NOT_FOUND}"${word}"`);
                        }
                    });
            })
            .catch(handleFetchError);
    };

    const getCanonicalDefinition = (word) => {
        const fetchParams = {
            useCanonical: true,
            limit: DEFINITIONS_LIMIT,
            includeRelated: false,
            includeTags: false,
            api_key: API.KEY
        };
        const urlWithCanonical = createUrl({
            wordToSearch: word,
            endpoint: API.ENDPOINTS.DEFINITIONS,
            params: fetchParams
        });

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
                            // check if the definition returned is for the same word or a derived one
                            if (data[0].word.toLowerCase() === word.toLowerCase()) {
                                displayCanonicalDefinition(data)
                            } else {
                                getOriginalDefinition(word, data);
                            }

                        } else {
                            console.warn(`${ERROR_MESSAGES.DEFINITIONS_NOT_FOUND}"${word}"`);
                            showError(`${ERROR_MESSAGES.DEFINITIONS_NOT_FOUND}"${word}"`);
                        }
                    });
            })
            .catch(handleFetchError)
    };

    const getSynonyms = (word) => {
        const fetchParams = {
            useCanonical: true,
            limitPerRelationshipType: SYNONYMS_LIMIT,
            includeTags: true,
            relationshipTypes: "synonym",
            api_key: API.KEY
        };
        const url = createUrl({wordToSearch: word, endpoint: API.ENDPOINTS.RELATED_WORDS, params: fetchParams});
        console.log('URL for getting synonyms: ' + url);
        fetch(url)
            .then(response => {
                if (response.status !== 200) {
                    console.warn(`${ERROR_MESSAGES.SERVER_ERROR} Status Code: ${response.status}`);
                    showError(ERROR_MESSAGES.SERVER_ERROR);
                    return;
                }

                response.json()
                    .then(data => {
                        console.log(data);
                        if (data.length && data[0].words.length) {
                            const synonyms = data[0].words;
                            console.log(`Synonyms for the canonical form of ${word} are:`);
                            console.log(synonyms);

                            synonymsIntro.innerHTML = "Synonyms:";
                            synonyms.map(syn => synonymsElement.innerHTML += `${syn}, `);

                        } else {
                            console.warn(`${ERROR_MESSAGES.SYNONYMS_NOT_FOUND}"${word}"`);
                            showError(`${ERROR_MESSAGES.SYNONYMS_NOT_FOUND}`);
                        }
                    });
            })
            .catch(handleFetchError)
    };
});
