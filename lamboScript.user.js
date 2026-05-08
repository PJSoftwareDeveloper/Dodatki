// ==UserScript==
// @name         Margonem 2006 Interface
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Podmienia grafiki na te z 2006 roku. :D
// @author       Lambo
// @match        https://world-legacy.margatron.ovh/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=margatron.ovh
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const oldPanel = "https://pjsoftwaredeveloper.github.io/PrivateStash/panel.png";
    const oldBottomBar = 'https://pjsoftwaredeveloper.github.io/PrivateStash/bottombar.png';
    const linkCSS = 'https://pjsoftwaredeveloper.github.io/PrivateStash/lamboStyles.css';


    function injectExternalCSS() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = linkCSS;
        document.head.appendChild(link);
        console.log('External CSS loaded:', linkCSS);
    }


    function waitForStatsContainer(callback) {
        const check = setInterval(() => {
            const container = document.querySelector('div.container[data-v-1ceaa76c][data-v-3865c13a]');
            if (container) {
                clearInterval(check);
                callback(container);
            }
        }, 50);
    }

    function observeStats(container) {
        const observer = new MutationObserver(() => {
            const divs = [...container.querySelectorAll('div[data-v-1ceaa76c]')];
            if (divs.length !== 3) return;

            const values = divs.map(d => d.innerText.trim());

            // jeśli Vue już wstawił liczby → działamy
            if (values.every(v => v !== "")) {
                console.log("[stats] Załadowane:", values);
                updateStats(values);
                observer.disconnect();
            }
        });

        observer.observe(container, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    function updateStats(values) {
        const container = document.querySelector('div.container[data-v-1ceaa76c][data-v-3865c13a]');
        const containerGold = document.querySelector('span[data-v-27e581d9][data-color]');
        if (!container) return;

        const gold = containerGold.innerText.trim();
        const [str, dex, intl] = values;

        containerGold.innerHTML = `<div style="text-align: center; color: gold;">Złoto: ${gold}</div>`;
        container.innerHTML = `
            <div style="text-align: center;">
                Siła: ${str}
                Zręcz.: ${dex}
                Intel.: ${intl}
            </div>
        `;
    }


    function oldInterface() {
        const panel = document.getElementById("panel");
        if (panel) {
            panel.style.backgroundImage = `url(${oldPanel})`;
            panel.style.backgroundSize = 'cover';
            panel.style.backgroundRepeat = 'no-repeat';
            console.log('Tło bottom bar zostało podmienione.');
        } else {
            console.log('Nie znaleziono elementu div.bottom-bar.');
        }
        const bbar = document.querySelector('div.bottom-bar');
        if (bbar) {
            bbar.style.backgroundImage = `url(${oldBottomBar})`;
            bbar.style.backgroundSize = 'cover';
            bbar.style.backgroundRepeat = 'no-repeat';
            console.log('Tło bottom bar zostało podmienione.');
        } else {
            console.log('Nie znaleziono elementu div.bottom-bar.');
        }
    }

    // Poczekaj aż strona się załaduje
    window.addEventListener('load', () => {
        oldInterface();
        injectExternalCSS();
        waitForStatsContainer(container => {
            observeStats(container);
        });
    });
})();
