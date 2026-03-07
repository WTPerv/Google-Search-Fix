# Google-Search-Fix
GreaseMonkey Script to make Google usable again.

<img width="1047" height="167" alt="firefox_S7jLvMAaF1" src="https://github.com/user-attachments/assets/05900b40-e27f-4540-8cd5-b34e2e2b607f" />

## What does this do?
Injects a new search bar on top of google's search bar.\
Type in this bar as you would as a human.\
Once you hit enter or click on search it will process it, feed it to Google's own search bar and hit search for you.

## Features
* **Forced/Relaxed mode**
  * Forced mode makes **every word** you type be relevant in your results.
  * Relaxed mode disables this.
* **Blacklist**
   * Easily editable list of words for google to avoid in your search.
   * Every word can be temporarily disabled.
* **Whitelist**
   * The opposite of the blacklist.
   * Every word here will be added to your normal search.

Examples below.

## How to install?
1. Get a GM Extension:
    * [GreaseMonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox only)
    * [ViolentMonkey](https://violentmonkey.github.io/get-it/) (Everything else)
    * [TamperMonkey](https://www.tampermonkey.net/) (Ewww closed source)
2. Click this link:
    * [Install Google Search Fix](https://github.com/WTPerv/Google-Search-Fix/raw/refs/heads/main/googlesearchfix.user.js)

## Examples
### Forced/Relaxed Mode
Google ever took your search and said *"hm, I think some of these words are optional..."*\
Enter Forced mode and it'll make **every single word matter** *(by adding quotes around "every" "single" "word")*.

This:
<img width="1050" height="405" alt="firefox_N1SVIawkmY" src="https://github.com/user-attachments/assets/fe4ac1b1-6c65-4368-936b-29fbbd8b470d" />

Becomes this:
<img width="1146" height="420" alt="firefox_yRZ4e0m3Vf" src="https://github.com/user-attachments/assets/95070971-c9d5-475f-ae87-e7986a2d74b9" />

### Blacklist
Ever search for an image and Google was like *"I bet they want an image of this image in a shirt"*\
Add as many words as you want to the blacklist and never see them again in your results *(unless you click to disable them)*.

<img width="1364" height="783" alt="firefox_nLjrHKYaiY" src="https://github.com/user-attachments/assets/8bd7d299-d564-48bb-ac8a-2e05f1dc927d" />

### Whitelist
A bit harder to explain this one, but it can be used to store words or operators you frequently need.\
For instance, I find YouTube's search even worse than Google, so I can just add `site:youtube.com` and browse it from within Google.\
You could also have something like `before:2017` and relive the old days

<img width="1351" height="599" alt="firefox_r597Ctkwtm" src="https://github.com/user-attachments/assets/c122741a-a3aa-462f-9541-da13c515e36b" />
