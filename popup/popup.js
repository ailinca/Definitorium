console.log('logging from the popup console!!');

document.addEventListener("DOMContentLoaded", () => {
    const userInput = document.getElementById('user-input');
    let backgroundPage = chrome.extension.getBackgroundPage();
    let word = backgroundPage.wordToSearch;
    userInput.innerHTML = word;

    let url = `http://api.wordnik.com:80/v4/word.json/${word}/definitions?
    limit=1
    &includeRelated=false
    &useCanonical=false
    &includeTags=false
    &api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5`;

    console.log('Fetching definition for ' + word);

    fetch(url)
        .then(response => {
            if (response.status !== 200) {
                console.warn('Looks like there was a problem. Status Code: ' + response.status);
                return;
            }

            // Examine the text in the response
            response.json()
                .then(data => {
                    console.log(data);
                    if(data.length) {
                        console.log('Definition requested is: ' + data[0].text);
                        userInput.innerHTML += ' = ' + data[0].text;
                    } else {
                        console.warn('Sorry, it appears that our dictionary did not have a definition for "' + word + '"');
                    }

            });
        })
        .catch(err => {
            console.log('Fetch Error :-S', err);
        });
});

