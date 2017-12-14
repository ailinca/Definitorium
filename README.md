# Definitorium
Chrome extension for getting definitions

### Overview ###
Isn't it annoying when you find a word you don't know in a delightful article or a nice book and you have to copy it, open another tab, paste it, pray to gods Google understands what you meant and find it's definition? If the gods are not in a good day, you must then open the [Cambridge English Dictionary](https://dictionary.cambridge.org/) paste it there and find what you need THEN go back to the original page and resume your reading. 

...or, (if you're lazy like me) try to figure out the meaning from the context.

But that doesn't always work.

For those kind of moments, there is **Definitorium**.

**Definitorium** is a Chrome extension, soon to be available in the [Chrome Extension Store](https://chrome.google.com/webstore/category/extensions), which gives you the  definition you need for that stubborn word you stopped at, without you leaving the page or doing any kind of spiritual incantation. 

All you have to do is select the word and then click the **Definitorium** icon and that's it! You have your definition right there !
 

Hurray ! 

### Features ### 

##### Recognising canonical form #####

The extension detects if a word is in the canonical form or not and, in the second case, fetches definitions for both forms. 
For example, if you select the word _requested_, you'll get:

``requested = Simple past tense and past participle of request``

... but you will also get: 

``request = 1. To express a desire for; ask for. Often used with an infinitive or clause: requested information about the experiment; requested to see the evidence firsthand; requested that the bus driver stop at the next corner. 2. To ask (a person) to do something: The police requested her to accompany them. 3. The act of asking.``  

##### Multiple definitions #####

As you probably noticed above, for the canonical form of the word, the user gets multiple definitions, gathered from a multiple dictionaries, when available.

##### Synonyms #####

When available, the extension will also show some synonyms for the canonical form of the word selected. This way you can get a better sense of the word and it's usage. 

##### Error Handling #####

Man I hate it when bogus happens. But sometimes it does. And we can't stop it. Period. What we can do is be aware of it, keep calm and don't throw pianos out through the window. 

If something bad happens, let's say the server is down because of a hurracane or you selected a bunch of letters with no meaning because you wanted to #hackthesystem or simply no definitions were found.... **We will tell you!** You won't be left hanging, not knowing anything, looking at a blank screen, contemplating the futility of existence. We care about you. 


### Details ### 

The extension uses the [Wordnik API](http://developer.wordnik.com/docs.html) to fetch definitions. 


### How To Use ###

Before the extension will be deployed on Chrome and Mozilla stores, you can play with it in developer mode:

* Checkout the master branch of this repo: `` git checkout https://github.com/ailinca/Definitorium.git``
* Go to Chrome and enter _chrome://extensions_ in the search bar
* Thick the _Developer mode_ checkbox at the top of the page
* Hit _Load unpacked extension_ 
* Select the parent folder of the project 
* Navigate to any page, select a word and press the Definitorium icon
* Be amazed

### TODO ###

*   display spinner while loading
*   use colored fonts for debugging messages 
*   let the user manually change the word