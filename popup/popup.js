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
        word = response.text;
        console.log('Selected word: ' + word);
        clearPopup();
        getDefinitions(word);
        getSynonyms(word);
    });


    // get needed DOM elements
    const {
        userDefinition,
        errorMessage,
        canonicalDefinitionIntro,
        canonicalDefinition,
        synonymsIntro,
        synonymsElement
    } = initialize();

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
        console.log(`Canonical definition is: ${response[0].text}`);
        canonicalDefinition.innerHTML += `${response[0].word} =`;
        response.map((resp, index) => appendDefinition(canonicalDefinition, resp.text, index + 1));
    };

    // display the definitions for the exact word selected by the user
    const displayOriginalDefinition = (response) => {
        console.log(`Literal definition is: ${response[0].text}`);
        userDefinition.innerHTML += `${response[0].word} =`;
        response.map((resp, index) => appendDefinition(userDefinition, resp.text, index + 1));
    };

    const getOriginalDefinition = (responseCanonical = []) => {
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

        const handleFailedOriginalDefinitionRequest = (response, responseCanonical) => {
            return new Promise((resolve, reject) => {
                if (response.status !== 200) {
                    // if this call didn't succeed just display the canonical definition but don't show any error message to the user
                    if (responseCanonical.length) {
                        displayCanonicalDefinition(responseCanonical);
                    } else {
                        showError(ERROR_MESSAGES.SERVER_ERROR);
                    }
                    console.warn(`${ERROR_MESSAGES.SERVER_ERROR} Status Code: ${response.status}`);
                    reject(response);
                }
                resolve(response);
            });
        };

        const handleSuccessfulOriginalDefinitionRequest = (data, responseCanonical) => {
            return new Promise((resolve, reject) => {
                if (data.length) {
                    displayOriginalDefinition(data);
                    if (responseCanonical.length) {
                        displayCanonicalDefinitionIntro(responseCanonical[0].word);
                        displayCanonicalDefinition(responseCanonical);
                        resolve('Successfully found both original definition AND canonical form!');
                    }
                    resolve('Successfully found original definition but NO definition was found for the canonical form!');
                } else {
                    // again, don't let the user know we don't have a definition for him, just log to the console and display the canonical definition
                    displayCanonicalDefinition(responseCanonical);
                    console.warn(`${ERROR_MESSAGES.DEFINITIONS_NOT_FOUND}"${word}"`);
                    reject('Successfully found definition for the canonical form but NO definition for the original word!');
                }
            });
        };

        // Marvelous piece of code, should be framed in the JS museum one day
        fetch(urlWithoutCanonical)
            .then(responseWithoutCanonical => handleFailedOriginalDefinitionRequest(responseWithoutCanonical, responseCanonical))
            .then(response => response.json())
            .then(data => handleSuccessfulOriginalDefinitionRequest(data, responseCanonical))
            .catch(handleFetchError);
    };

    /*
        Start point for the fetch definitions logic
        We first request definitions using the "useCanonical" flag set to true.
        This way, we can compare the original word with the one in the response and find out if it's in a canonical form.
        If it's not, we request the definition with the "useCanonical" flag set to false.
        Depending on the responses, we display either the original word with it's definitions, either the canonical form, either both.
        Or none. Could be none.
    */
    const getDefinitions = (word) => {
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

        const handleFailedCanonicalDefinitionRequest = response => {
            return new Promise((resolve, reject) => {
                if (response.status !== 200) {
                    console.warn(`${ERROR_MESSAGES.SERVER_ERROR} Status Code: ${response.status}`);
                    showError(ERROR_MESSAGES.SERVER_ERROR);
                    reject(response);
                }
                resolve(response);
            });
        };

        const handleSuccessfulCanonicalDefinitionRequest = data => {
            return new Promise ((resolve, reject) => {
                console.log('ENTERED HANDLE SUCCESSFUL CANONICAL DEFINITION REQUEST');
                if (data.length) {
                    // check if the definition returned is for the same word or a derived one
                    console.log('Comparing ' + data[0].word.toLowerCase() + ' with ' + word.toLowerCase());
                    if (data[0].word.toLowerCase() === word.toLowerCase()) {
                        displayCanonicalDefinition(data);
                    } else {
                        // getOriginalDefinition(word, data);
                        console.log('They are not equal, resolving promise with second param of resolve: ');
                        resolve(data);
                    }
                } else {
                    console.warn(`${ERROR_MESSAGES.DEFINITIONS_NOT_FOUND}"${word}"`);
                    showError(`${ERROR_MESSAGES.DEFINITIONS_NOT_FOUND}"${word}"`);
                    reject('No canonical definition found, aborting everything, going home!')
                }
            })
        };

        // This code is just pure gold, I can't believe I though of this ** self pat on the back **
        fetch(urlWithCanonical)
            .then(handleFailedCanonicalDefinitionRequest)
            .then(response => response.json())
            .then(handleSuccessfulCanonicalDefinitionRequest)
            .then(getOriginalDefinition)
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

        const url = createUrl({
            wordToSearch: word,
            endpoint: API.ENDPOINTS.RELATED_WORDS,
            params: fetchParams
        });

        const handleFailedSynonymsRequest = response => {
            return new Promise((resolve, reject) => {
                if (response.status !== 200) {
                    console.warn(`${ERROR_MESSAGES.SERVER_ERROR} Status Code: ${response.status}`);
                    showError(ERROR_MESSAGES.SERVER_ERROR);
                    reject(response);
                }
                resolve(response);
            })
        };

        const displaySynonymsWithIntro = synonyms => {
            console.log(`Synonyms for the canonical form are: ${synonyms.join()}`);
            synonymsIntro.innerHTML = "Synonyms:";
            synonyms.map(syn => synonymsElement.innerHTML += `${syn}, `);
        };

        const handleSuccessfulSynonymsRequest = data => {
            return new Promise((resolve, reject) => {
                if (data.length && data[0].words.length) {
                    displaySynonymsWithIntro(data[0].words);
                    resolve('Successfully obtained synonyms, displaying them now!');
                } else {
                    console.warn(`${ERROR_MESSAGES.SYNONYMS_NOT_FOUND}"${word}"`);
                    showError(`${ERROR_MESSAGES.SYNONYMS_NOT_FOUND}`);
                    reject('Did not obtain any synonyms, we sad puppies!');
                }
            })
        };

        // This is coding orgasm right here, you can't get any better than this next 5 lines
        fetch(url)
            .then(handleFailedSynonymsRequest)
            .then(response => response.json())
            .then(handleSuccessfulSynonymsRequest)
            .catch(handleFetchError)
    };
});
