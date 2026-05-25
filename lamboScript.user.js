// ==UserScript==
// @name         Margonem 2006 Interface
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Podmienia grafiki na te z 2006 roku. :D
// @author       Lambo aka Ronnie Radke
// @match        https://world-retro.margatron.ovh/
// @match        https://world-legacy.margatron.ovh/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let authToken;

    function waitForToken() {
        const interval = setInterval(() => {
            const token = localStorage.__AUTH_TOKEN__;
            if (token) {
                clearInterval(interval);
                console.log(`[AuthTokenFetch] Token gotowy: ${token}`);
                authToken = token;
            }
        }, 100);
    }

    waitForToken();

    const GraphQLManager = {
        API_URL: `https://engine-${(window.location.href.includes('legacy') ? "legacy" : "retro")}.margatron.ovh/graphql`,

        getToken() {
            return authToken;
        },

        async query(queryString) {
            const token = this.getToken();
            if (!token) {
                console.warn('[GraphQLManager] Brak tokena autoryzacji');
                throw new Error('Brak tokena autoryzacji');
            }

            try {
                const res = await fetch(this.API_URL, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        "authorization": token
                    },
                    body: JSON.stringify({ query: queryString })
                });
                const json = await res.json();

                if (json.errors) {
                    console.error('[GraphQLManager] GraphQL Errors:', json.errors);
                    throw new Error('GraphQL Error: ' + JSON.stringify(json.errors));
                }

                return json.data;
            } catch (e) {
                console.error('[GraphQLManager] Błąd zapytania:', e);
                throw e;
            }
        }
    };

//Avatar
(async function() {
    try {
        const credRes = await fetch("https://margatron.ovh/game-credentials", {
            credentials: "include",
            headers: {
                "Accept": "application/json",
                "X-Requested-With": "XMLHttpRequest"
            }
        });

        const cred = await credRes.json();
        console.log("game-credentials:", cred);

        const currentId = cred?.characterId;

        if (!currentId) {
            console.error("Nie znaleziono ID postaci w game-credentials");
            return;
        }

        const charsRes = await fetch("https://margatron.ovh/game/api/characters", {
            credentials: "include",
            headers: {
                "Accept": "application/json",
                "X-Requested-With": "XMLHttpRequest"
            }
        });

        const characters = await charsRes.json();
        console.log("Lista postaci:", characters);

        const currentChar = characters.find(c =>
            c.id === currentId ||
            c.characterId === currentId ||
            c.userId === currentId
        );

        if (!currentChar) {
            console.error("Nie znaleziono postaci o ID:", currentId);
            return;
        }

        if (!currentChar.src) {
            console.error("Postać nie ma pola src");
            return;
        }

        const img = document.createElement("div");
        img.style = `background-image: url("${currentChar.src}"); width: 32px; height: 48px;  margin-left: 38px; image-rendering: pixelated;`;
        document.getElementById("panel").appendChild(img);

    } catch (err) {
        console.error("Błąd skryptu:", err);
    }
})();

    const oldPanel = "https://i.imgur.com/zEqVNJX.png";
    const oldBottomBar = 'https://i.imgur.com/f8IKicJ.png';


    function injectExternalCSS() {

        const barsCont = document.querySelector('div.bars[data-v-ed829f6e]');
        const bars = [...document.querySelectorAll('div.bar[data-v-ed829f6e]')];
        bars.forEach((element) => element.style = 'z-index: 5;');
        var hpBarBack = document.createElement('div');
        var expBarBack = document.createElement('div');

        hpBarBack.style = 'width: 140px; height: 8px; background: darkred; position: absolute;';
        expBarBack.style = 'width: 140px; top: 15px; height: 8px; background: #884400; position: absolute;';
        barsCont.appendChild(hpBarBack);
        barsCont.appendChild(expBarBack);
        var style = document.createElement('style');

        document.head.appendChild(style);

        style.textContent = `
/*bars*/
.container .bars[data-v-ed829f6e]{
    gap: 3px;
}
.container[data-v-ed829f6e]{
    left: 120px;
    top: 48px;
    width: 130px;
}
.border{
    display: none;
}
#nick[data-v-3865c13a] {
    margin-top: 13px;
    margin-left: 50px;
}
/*stats*/
.container .window[data-v-113125a0]{
    margin-left: -10px;
    margin-top: 14px;
}
[data-v-3865c13a] .small-buttons {
    position: absolute;
    top: -32px;
    left: 25px;
    width: 300px;
    height: 22px;
}
/*BaseStats*/
.container[data-v-1ceaa76c]{
    width: 150px;
    height: 0px;
    top: 75px;
    left: 110px;
    font-size: 11px;
}
/*Eq*/
.equipment-grid[data-v-21259a50] {
    top: 107px;
    left: 7px;
}
.skillset[data-v-3865c13a]{
    top: 106px;
    left: 80px;
}

div span[data-v-27e581d9]{
    width: 150px;
    text-align: center;
    top: 7px;
    left: 55px;
}

/*chat*/
.chatIn[data-v-c06ccf29]{
    top: 482px;
    left: 29px;
    height: 15px;
    width: 215px;
}
.chatTxt[data-v-c06ccf29] {
    scrollbar-color: gray white;
    scrollbar-width: initial;
    font-family: Times New Roman;
}
.chat[data-v-c06ccf29] {
    width: 231px;
    top: 272px;
    left: 15px;
}
/*other*/
.lagmeter[data-v-54d472dd] {
    top: 8px;
    left: 490px;
}
.pvpmode[data-v-54d472dd] {
    top: 8px;
    left: 8px;
}
.location[data-v-54d472dd]{
    left: 30px;
}
div[data-v-7b98ceba] {
    top: 230px;
    left: 120px;
}

div[data-v-92e99f9c]{
    top: 230px;
    left: 200px;
}`;

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

        container.style = 'text-align: center';
        container.innerText = `Siła: ${str} Zręcz.: ${dex} Intel.: ${intl}`;
        containerGold.style = 'text-align: center; color: gold;';
        containerGold.innerText = `Złoto: ${gold}`;
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
    window.addEventListener('load', () => {
        oldInterface();
        injectExternalCSS();
        waitForStatsContainer(container => {
            observeStats(container);
        });
    });
})();
