# Definitorium

Version 0.5

Chrome extension for getting definitions

* [Overview](#overview)
* [Inspiration](#inspiration)
* [Features](#features)
* [How to use](#how-to-use)

### Overview <a id="overview"></a> ###
Isn't it annoying when you find a word you don't know in a delightful article or a nice book and you have to copy it, open another tab, paste it, pray to gods Google understands what you meant and find it's definition? If the gods are not in a good day, you must then open the [Cambridge English Dictionary](https://dictionary.cambridge.org/) paste it there and find what you need THEN go back to the original page and resume your reading. 

...or, (if you're lazy like me) try to figure out the meaning from the context.

But that doesn't always work.

For those kind of moments, there is **Definitorium**.

**Definitorium** is a Chrome extension, available in the [Chrome Extension Store](https://chrome.google.com/webstore/detail/definitorium/fmfmlbniffpmlmnddheggpgdmoklpkja), which gives you the  definition you need for that stubborn word you stopped at, without you leaving the page or doing any kind of spiritual incantation. 

All you have to do is to select the word and then click the **Definitorium** icon and that's it! You have your definition right there !
 

Hurray ! 

### Inspiration <a id="inspiration"></a> ###

This extension was inspired by Daniel Shiffman's Youtube series about Chrome extensions, which you can find [here](https://www.youtube.com/watch?v=hkOTAmmuv_4&list=PLRqwX-V7Uu6bL9VOMT65ahNEri9uqLWfS). He has lots of interesting videos about programming, coding challenges, tutorials and much more on his channel, [The Coding Train](https://www.youtube.com/channel/UCvjgXvBlbQiydffZU7m1_aw).

Also, you can find his implementation of the Chrome extension that fetches definitions on his [Github page](https://github.com/CodingTrain/website/tree/master/CodingChallenges/CC_84_Word_Definition_Extension).

### Features <a id="features"></a> ### 

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

Man, I hate it when bogus happens. But sometimes it does. And we can't stop it. Period. What we can do is be aware of it, keep calm and don't throw pianos out through the window. 

If something bad happens, let's say the server is down because of a hurricane or you selected a bunch of letters with no meaning because you wanted to _#hackthesystem_ or simply no definitions were found.... **We will tell you!** You won't be left hanging, not knowing anything, looking at a blank screen, contemplating the futility of existence. We care about you. 


### How To Use <a id="how-to-use"></a> ###

##### User mode:

* install the extension directly from the [Chrome Web Store](https://chrome.google.com/webstore/detail/definitorium/fmfmlbniffpmlmnddheggpgdmoklpkja) (**it's free**) 
* navigate to a new tab or refresh an existing one
* select a word with and hit the Definitorium icon 

##### Developer mode:

* Checkout the master branch of this repo: `` git checkout https://github.com/ailinca/Definitorium.git``
* Go to Chrome and enter _chrome://extensions_ in the search bar
* Thick the _Developer mode_ checkbox at the top of the page
* Hit _Load unpacked extension_ 
* Select the parent folder of the project 
* Navigate to any page, select a word and press the Definitorium icon
* Be amazed
