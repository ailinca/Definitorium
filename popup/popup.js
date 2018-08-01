const titleCSS = "" +
    "text-shadow: -1px -1px hsl(0,100%,50%), " +
    "1px 1px hsl(5.4, 100%, 50%), " +
    "3px 2px hsl(10.8, 100%, 50%), " +
    "5px 3px hsl(16.2, 100%, 50%), " +
    "7px 4px hsl(21.6, 100%, 50%), " +
    "9px 5px hsl(27, 100%, 50%), " +
    "11px 6px hsl(32.4, 100%, 50%), " +
    "13px 7px hsl(37.8, 100%, 50%), " +
    "14px 8px hsl(43.2, 100%, 50%), " +
    "16px 9px hsl(48.6, 100%, 50%), " +
    "18px 10px hsl(54, 100%, 50%), " +
    "20px 11px hsl(59.4, 100%, 50%), " +
    "22px 12px hsl(64.8, 100%, 50%); " +
    "font-size: 40px;";

console.log("%cLogging from the popup console!!", titleCSS);

//global variable
let word = "placeholder";

// constants area
const API = {
    KEY: '1385e6443a1d02168b00f0d74cb0d6cfbbfe06c59c9d375a1',
    BASE_URL: 'http://api.wordnik.com:80/v4/word.json',
    ENDPOINTS: {
        DEFINITIONS: 'definitions',
        RELATED_WORDS: 'relatedWords'
    }
};

const LOGS_CSS = {
    SELECTED_WORD: "font-size: 20px; color: pink;",
    CANONICAL: "font-size: 20px; color: blue;",
    ORIGINAL: "font-size: 20px; color: green;",
    SYNONYMS: "font-size: 20px; color: yellow;"
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
        spinner: document.getElementById('spinner'),
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
        console.log('%cSelected word: ' + word, LOGS_CSS.SELECTED_WORD);
        clearPopup();
        getDefinitions(word);
        getSynonyms(word);
    });


    // get needed DOM elements
    const {
        userDefinition,
        errorMessage,
        spinner,
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

    const toggleSpinner = (show) => {
        spinner.style.display = show ? 'block' : 'none';
    };

    const showError = (error) => {
        errorMessage.innerHTML = error;
        errorMessage.style.display = 'block';
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

    const handleFetchError = err => {
        toggleSpinner(false);
        console.log('Fetch Error :-S', err);
    };

    // add a specific message to indicate that there might be a more useful definition available
    const displayCanonicalDefinitionIntro = (word) => {
        canonicalDefinitionIntro.innerHTML += `You also might be interested in knowing the definition for "${word}". Here ya go:`;
    };

    // add the canonical word and ALL it's definitions
    const displayCanonicalDefinition = (response) => {
        console.log(`%cCanonical definition is: ${response[0].text}`, LOGS_CSS.CANONICAL);
        canonicalDefinition.innerHTML += `${response[0].word} =`;
        response.map((resp, index) => appendDefinition(canonicalDefinition, resp.text, index + 1));
    };

    // display the definitions for the exact word selected by the user
    const displayOriginalDefinition = (response) => {
        console.log(`%cLiteral definition is: ${response[0].text}`, LOGS_CSS.ORIGINAL);
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
                    toggleSpinner(false);
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
                toggleSpinner(false);
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
                    toggleSpinner(false);
                    console.warn(`${ERROR_MESSAGES.SERVER_ERROR} Status Code: ${response.status}`);
                    showError(ERROR_MESSAGES.SERVER_ERROR);
                    reject(response);
                }
                resolve(response);
            });
        };

        const handleSuccessfulCanonicalDefinitionRequest = data => {
            return new Promise ((resolve, reject) => {
                if (data.length) {
                    // check if the definition returned is for the same word or a derived one
                    if (data[0].word.toLowerCase() === word.toLowerCase()) {
                        toggleSpinner(false);
                        displayCanonicalDefinition(data);
                    } else {
                        console.log('They are not equal, resolving promise with second param of resolve: ');
                        resolve(data);
                    }
                } else {
                    toggleSpinner(false);
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
            console.log(`%cSynonyms for the canonical form are: ${synonyms.join()}`, LOGS_CSS.SYNONYMS);
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
                    errorMessage.innerHTML += `<img width="388px" src="../assets/cookie.png"/>`;
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
