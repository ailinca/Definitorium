console.log('logging from the popup console!!');

const API = {
    KEY : 'a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5',
    BASE_URL: 'http://api.wordnik.com:80/v4/word.json/',
    ENDPOINTS: {
        DEFINITIONS: '/definitions',
        RELATED_WORDS: '/relatedWords'
    }
};

const ERROR_MESSAGES = {
    SERVER_ERROR : 'Ooops, looks like there was a problem fetching a definition. Please try again later!',
    DEFINITIONS_NOT_FOUND: 'Oooops, it appears that our dictionary does not have a definition for ',
    SYNONYMS_NOT_FOUND: 'We did not find any synonym for your word and for that we are really sorry. Here is a cookie!'
};

const LIMIT_MAX = 3;


const initialize = () => {
    return {
        userDefinition : document.getElementById('user-definition'),
        errorMessage : document.getElementById('error-message'),
        canonicalDefinitionIntro : document.getElementById('canonical-definition-intro'),
        canonicalDefinition : document.getElementById('canonical-definition'),
        synonymsIntro: document.getElementById('synonyms-intro'),
        synonymsElement: document.getElementById('synonyms')
    }
};

document.addEventListener("DOMContentLoaded", () => {

    // get needed DOM elements
    const {userDefinition, errorMessage, canonicalDefinitionIntro, canonicalDefinition, synonymsIntro, synonymsElement} = initialize();

    // instantiate helper functions
    const clearError = () => {
        errorMessage.innerHTML = '';
        errorMessage.style.display = 'none';
    };

    const showError = (error) => {
        errorMessage.innerHTML = error;
        errorMessage.style.display = 'inline-block';
    };

    // TODO: refactor fetchParams to iterate through param keys and dynamically append values to string
    const fetchParams = ({limit = 1, includeRelated = false, useCanonical = true, includeTags = false, relationshipTypes = "synonym"}) =>
        `?limit=${limit}&includeRelated=${includeRelated}&useCanonical=${useCanonical}&includeTags=${includeTags}&relationshipTypes=${relationshipTypes}&api_key=${API.KEY}`;

    const createUrl = ({wordToSearch = 'placeholder', endpoint = API.ENDPOINTS.DEFINITIONS, params = {useCanonical: true}}) =>
        API.BASE_URL + wordToSearch + endpoint + fetchParams(params);

    const displayDefinition = (selector, def, index) => {
        selector.innerHTML += ` ${index}. ${def} \n`;
    };

    const getOriginalDefinition = (word, responseCanonical= []) => {
        let urlWithoutCanonical = createUrl({wordToSearch: word, params: {useCanonical: false, limit: LIMIT_MAX}});
        fetch(urlWithoutCanonical)
            .then(response => {
                if (response.status !== 200) {
                    // if this call didn't succeed just display the canonical definition but don't show any error message to the user
                    if(responseCanonical.length) {
                        userDefinition.innerHTML += responseCanonical[0].text;
                    } else {
                        showError(ERROR_MESSAGES.SERVER_ERROR);
                    }
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
                            userDefinition.innerHTML += responseNonCanonical.text;

                            if(responseCanonical.length) {
                                // add a specific message to indicate that there might be a more useful definition available
                                canonicalDefinitionIntro.innerHTML += `You also might be interested in knowing the definition for "${responseCanonical[0].word}". Here ya go:`;

                                // add the canonical word and ALL it's definitions
                                canonicalDefinition.innerHTML += `${responseCanonical[0].word} =`;
                                responseCanonical.map((resp,index) => displayDefinition(canonicalDefinition, resp.text, index+1));
                            }
                        } else {
                            // again, don't let the user know we don't have a definition for him, just log to the console
                            console.warn(`${ERROR_MESSAGES.DEFINITIONS_NOT_FOUND}"${word}"`);
                        }
                    });
            })
            .catch(err => {
                console.log('Fetch Error :-S', err);
            });
    };

    const getCanonicalDefinition = (word) => {
        const urlWithCanonical = createUrl({wordToSearch: word, params:{useCanonical: true, limit: LIMIT_MAX}});
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

                                // just display ALL definitions obtained
                                data.map((resp, index) => displayDefinition(userDefinition, resp.text, index+1));
                            } else {
                                // request the definition for the original word
                                getOriginalDefinition(word, data);
                            }

                        } else {
                            console.warn(`${ERROR_MESSAGES.DEFINITIONS_NOT_FOUND}"${word}"`);
                            showError(`${ERROR_MESSAGES.DEFINITIONS_NOT_FOUND}"${word}"`);
                        }
                    });
            })
            .catch(err => {
                console.log('Fetch Error :-S', err);
            });
    };

    const getSynonyms = (word) => {
        const url = createUrl({wordToSearch: word, endpoint: API.ENDPOINTS.RELATED_WORDS, params: {useCanonical:true, limit: LIMIT_MAX} });
        fetch(url)
            .then(response => {
                if (response.status !== 200) {
                    console.warn(`${ERROR_MESSAGES.SERVER_ERROR} Status Code: ${response.status}`);
                    showError(ERROR_MESSAGES.SERVER_ERROR);
                    return;
                }

                response.json()
                    .then(data => {
                        if (data.length && data[0].words.length) {
                            const synonyms = data[0].words;
                            console.log(`Synonyms for the canonical form of ${word} are:`);
                            console.log(synonyms);

                            synonymsIntro.innerHTML = "Synonyms:";
                            synonyms.map(syn => synonymsElement.innerHTML += `${syn}, `);

                        } else {
                            console.warn(`${ERROR_MESSAGES.SYNONYMS_NOT_FOUND}"${word}"`);
                            // showError(`${ERROR_MESSAGES.SYNONYMS_NOT_FOUND}`);
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
    userDefinition.innerHTML = word + ' = ';

    clearError();
    getCanonicalDefinition(word);
    getSynonyms(word);
});
