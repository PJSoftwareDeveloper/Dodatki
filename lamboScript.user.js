// ==UserScript==
// @name         Panel Dodatków by Lambo
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Motyw margonem z 2006 roku + characterSwitcher
// @author       Lambo aka Ronnie Radke
// @match        https://world-retro.margatron.ovh/
// @match        https://world-legacy.margatron.ovh/
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';


    // ======================== GRAPHQL MANAGER ========================
    const GraphQLManager = {
        API_URL: `https://engine-${window.location.href.includes("legacy") ? "legacy" : "retro"}.margatron.ovh/graphql`,
        authToken: null,

        getToken() {
            return this.authToken;
        },

        async init() {
            this.injectFetchHook();
            this.waitForToken();
        },

        injectFetchHook() {
            const script = document.createElement('script');
            script.textContent = `
            (function () {
    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
        const response = await originalFetch.apply(this, args);

        try {
            const url = args[0];

            const opts = args[1];
            const headers = opts?.headers;
            let auth =
                headers?.authorization ||
                headers?.Authorization ||
                (headers instanceof Headers ? headers.get('authorization') : null);

            if (auth) {
                window.__AUTH_TOKEN__ = auth;
                window.dispatchEvent(new Event("auth-ready"));
            }

            if (url.includes('/graphql')) {
                response.clone().json().then(json => {
                    if (json?.data) {
                        window.dispatchEvent(new CustomEvent("graphql-update", {
                            detail: json.data
                        }));
                    }
                });
            }

        } catch (e) {
            console.error("GraphQL hook error:", e);
        }

        return response;
    };
})();
        `;

            document.documentElement.appendChild(script);
            script.remove();
        },

        waitForToken() {
            const interval = setInterval(() => {
                const token = unsafeWindow.__AUTH_TOKEN__;
                if (token) {
                    clearInterval(interval);
                    console.log('[AuthTokenFetch] Token gotowy:', token);

                    this.authToken = token;
                    OldMargoInterface.updateStats();
                }
            }, 100);
        },

        async query(queryString, variables = {}) {
            const token = this.getToken();
            if (!token) throw new Error("Brak tokena");

            const res = await fetch(this.API_URL, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "authorization": token
                },
                body: JSON.stringify({
                    query: queryString,
                    variables
                })
            });

            const json = await res.json();
            if (json.errors) throw new Error(JSON.stringify(json.errors));
            return json.data;
        }

    };

    // ======================== KONFIGURACJA ========================
    const CONFIG = {
        ICONS: {
            KILL_COUNTER: 'https://i.imgur.com/5vXz9jK.png',
            DEFAULT: 'https://i.imgur.com/rjqhc5n.png',
            HOVER: 'https://i.imgur.com/Sa1MLfu.png',
            HOTKEYS: {
                OFF: [
                    'https://i.imgur.com/NGtHaDH.png',
                    'https://i.imgur.com/55JcyLB.png',
                    'https://i.imgur.com/0YaXQVO.png',
                    'https://i.imgur.com/txuzY4I.png',
                    'https://i.imgur.com/zvVWQaY.png',
                    'https://i.imgur.com/cUTbXHW.png',
                    'https://i.imgur.com/PN7M0jC.png',
                    'https://imgur.com/qXsCrvP.png',
                    'https://imgur.com/CI15o3m.png',
                    'https://imgur.com/9HISvJE.png',
                ],
                ON: [
                    'https://i.imgur.com/aLIJ57i.png',
                    'https://i.imgur.com/aBjx3l2.png',
                    'https://i.imgur.com/tdLexLS.png',
                    'https://i.imgur.com/24X6V19.png',
                    'https://i.imgur.com/F9MmVRl.png',
                    'https://i.imgur.com/RIYmqMj.png',
                    'https://i.imgur.com/9GQvZe3.png',
                    'https://imgur.com/T7Km6GJ.png',
                    'https://imgur.com/oyvgiSQ.png',
                    'https://imgur.com/9HISvJE.png',
                ]
            }
        },
        COLORS: {
            RANK: {
                HERO: '#ffc600',
                TITAN: '#ff6c00',
                ELITE_II: '#54ff00',
                ELITE: '#00aeff'
            },
            RANK_NAMES: {
                HERO: 'Heros',
                TITAN: 'Tytan',
                ELITE_II: 'Elita II',
                ELITE: 'Elita'
            }
        },
        MONSTERS: [
            { name: 'Czarna Wilczyca', lvl: '20', rank: 'ELITE' },
            { name: 'Astratus', lvl: '22', rank: 'ELITE' },
            { name: 'Kotołak Tropiciel', lvl: '23', rank: 'ELITE' },
            { name: 'Władca rzek', lvl: '37', rank: 'ELITE_II' },
            { name: 'Razuglag Oklash', lvl: '47', rank: 'ELITE_II' },
            { name: 'Goplana', lvl: '75', rank: 'ELITE_II' },
            { name: 'Mroczny Patryk', lvl: '35', rank: 'HERO' },
            { name: 'Lisz', lvl: '60', rank: 'ELITE' },
            { name: 'Vonaros', lvl: '60', rank: 'ELITE' },
            { name: 'Wilcza Paszcza', lvl: '48', rank: 'ELITE' },
            { name: 'Gnom Figlid', lvl: '48', rank: 'ELITE' },
            { name: 'Krogor', lvl: '48', rank: 'ELITE' },
            { name: 'Thowar', lvl: '47', rank: 'ELITE' },
            { name: 'Wilcza Jagoda', lvl: '47', rank: 'ELITE' },
            { name: 'Tollok Shimger', lvl: '43', rank: 'ELITE' },
            { name: 'Herszt rozbójników', lvl: '37', rank: 'ELITE' },
            { name: 'Mula Furla', lvl: '34', rank: 'ELITE' },
            { name: 'Cerber', lvl: '28', rank: 'ELITE' },
            { name: 'Paladyński Apostata', lvl: '25', rank: 'ELITE' },
            { name: 'Astaratus', lvl: '22', rank: 'ELITE' },
            { name: 'Szczęt alias Gładki', lvl: '47', rank: 'ELITE_II' },
            { name: 'Tarmus Wuden', lvl: '50', rank: 'ELITE_II' },
            { name: 'Tollok Atamatu', lvl: '73', rank: 'ELITE_II' },
            { name: 'Tollok Utumutu', lvl: '73', rank: 'ELITE_II' },
            { name: 'Wyznawca ciemnych mocy', lvl: '82', rank: 'ELITE_II' },
            { name: 'Mazurnik Przybrzeżny', lvl: '82', rank: 'ELITE_II' },
            { name: 'Łowca czaszek', lvl: '84', rank: 'ELITE_II' },
            { name: 'Grabarz świątynny', lvl: '88', rank: 'ELITE_II' },
            { name: 'Podły zbrojmistrz', lvl: '89', rank: 'ELITE_II' },
            { name: 'Nieumarły krzyżowiec', lvl: '92', rank: 'ELITE_II' },
            { name: 'Szkielet władcy żywiołów', lvl: '92', rank: 'ELITE_II' },
            { name: 'Morthen', lvl: '96', rank: 'ELITE_II' },
            { name: 'Miłośnik Łowców', lvl: '108', rank: 'ELITE_II' },
            { name: 'Miłośnik Rycerzy', lvl: '108', rank: 'ELITE_II' },
            { name: 'Miłośnik Magii', lvl: '108', rank: 'ELITE_II' },
            { name: 'Wójt Fistuła', lvl: '118', rank: 'ELITE_II' },
            { name: 'Krab pustelnik', lvl: '123', rank: 'ELITE_II' },
            { name: 'Królowa śniegu', lvl: '124', rank: 'ELITE_II' },
            { name: 'Teściowa Rumcajsa', lvl: '125', rank: 'ELITE_II' },
            { name: 'Poskramiacz Hydr', lvl: '128', rank: 'ELITE_II' },
            { name: 'Pogromczyni Mantikor', lvl: '128', rank: 'ELITE_II' },
            { name: 'Pogromca gryfów', lvl: '128', rank: 'ELITE_II' },
            { name: 'Burkog Lorulk', lvl: '135', rank: 'ELITE_II' },
            { name: 'Jertek Moxos', lvl: '136', rank: 'ELITE_II' },
            { name: 'Berserker Amuno', lvl: '139', rank: 'ELITE_II' },
            { name: 'Fodug Zolash', lvl: '145', rank: 'ELITE_II' },
            { name: 'Mistrz Worundriel', lvl: '148', rank: 'ELITE_II' },
            { name: 'Goons Asterus', lvl: '150', rank: 'ELITE_II' },
            { name: 'Adariel', lvl: '155', rank: 'ELITE_II' },
            { name: 'Duch władcy klanów', lvl: '160', rank: 'ELITE_II' },
            { name: 'Ogr Stalowy Pazur', lvl: '164', rank: 'ELITE_II' },
            { name: 'Fursharag pożeracz umysłów', lvl: '170', rank: 'ELITE_II' },
            { name: 'Ziuggrael strażnik królowej', lvl: '170', rank: 'ELITE_II' },
            { name: 'Bragarth myśliwy dusz', lvl: '170', rank: 'ELITE_II' },
            { name: 'Lusgrathera królowa pramatka', lvl: '175', rank: 'ELITE_II' },
            { name: 'Borgoros Garamir III', lvl: '175', rank: 'ELITE_II' },
            { name: 'Chryzoprenia', lvl: '178', rank: 'ELITE_II' },
            { name: 'Czempion Furboli', lvl: '183', rank: 'ELITE_II' },
            { name: 'Torunia Ankelwald', lvl: '186', rank: 'ELITE_II' },
            { name: 'Breheret żelazny łeb', lvl: '192', rank: 'ELITE_II' },
            { name: 'Mysiur myświórowy król', lvl: '193', rank: 'ELITE_II' },
            { name: 'Sadolia nadzorczyni Hurys', lvl: '197', rank: 'ELITE_II' },
            { name: 'Bergermona krwawa hrabina', lvl: '200', rank: 'ELITE_II' },
            { name: 'Sataniel skrytobójca', lvl: '200', rank: 'ELITE_II' },
            { name: 'Annaniel wysysacz marzeń', lvl: '200', rank: 'ELITE_II' },
            { name: 'Gothardus kolekcjoner głów', lvl: '200', rank: 'ELITE_II' },
            { name: 'Zufulus smakosz serc', lvl: '205', rank: 'ELITE_II' },
            { name: 'Arachniregina Colosseus', lvl: '220', rank: 'ELITE_II' },
            { name: 'Mocny Maddoks', lvl: '235', rank: 'ELITE_II' },
            { name: 'Cuaitl Citlalin', lvl: '250', rank: 'ELITE_II' },
            { name: 'Quetzalcoatl', lvl: '260', rank: 'ELITE_II' },
            { name: 'Neferkar Set', lvl: '274', rank: 'ELITE_II' },
            { name: 'Nymphemonia', lvl: '287', rank: 'ELITE_II' },
            { name: 'Zorin', lvl: '300', rank: 'ELITE_II' },
            { name: 'Furion', lvl: '300', rank: 'ELITE_II' },
            { name: 'Artenius', lvl: '300', rank: 'ELITE_II' },
            { name: 'Domina Ecclesiae', lvl: '21', rank: 'HERO' },
            { name: 'Mietek Żul', lvl: '25', rank: 'HERO' },
            { name: 'Karmazynowy Mściciel', lvl: '45', rank: 'HERO' },
            { name: 'Złodziej', lvl: '50', rank: 'HERO' },
            { name: 'Zły Przewodnik', lvl: '63', rank: 'HERO' },
            { name: 'Piekielny Kościej', lvl: '74', rank: 'HERO' },
            { name: 'Opętany Paladyn', lvl: '85', rank: 'HERO' },
            { name: 'Kochanka Nocy', lvl: '100', rank: 'HERO' },
            { name: 'Perski Książę', lvl: '116', rank: 'HERO' },
            { name: 'Baca Bez Łowiec', lvl: '123', rank: 'HERO' },
            { name: 'Obłąkany łowca orków', lvl: '144', rank: 'HERO' },
            { name: 'Czarująca Atalia', lvl: '157', rank: 'HERO' },
            { name: 'Święty Braciszek', lvl: '165', rank: 'HERO' },
            { name: 'Viviana Nandin', lvl: '184', rank: 'HERO' },
            { name: 'Demonis Pan Nicości', lvl: '210', rank: 'HERO' },
            { name: 'Tepeyollotl', lvl: '260', rank: 'HERO' },
            { name: 'Dziewicza Orlica', lvl: '51', rank: 'TITAN' },
            { name: 'Zabójczy królik', lvl: '70', rank: 'TITAN' },
            { name: 'Renegat Baulus', lvl: '101', rank: 'TITAN' },
            { name: 'Piekielny Arcymag', lvl: '131', rank: 'TITAN' },
            { name: 'Versus Zoons', lvl: '154', rank: 'TITAN' },
            { name: 'Łowczyni Wspomnień', lvl: '177', rank: 'TITAN' },
            { name: 'Przyzywacz demonów', lvl: '204', rank: 'TITAN' },
            { name: 'Maddok Magua', lvl: '231', rank: 'TITAN' },
            { name: 'Tezcatlipoca', lvl: '258', rank: 'TITAN' },
            { name: 'Tanroth', lvl: '285', rank: 'TITAN' },
            { name: 'Biała Dama', lvl: '40', rank: 'HERO' },
            { name: 'Zjawa Pustej Maski', lvl: '43', rank: 'ELITE_II' },
            { name: 'Dowódca Ghuli', lvl: '45', rank: 'ELITE' },
            { name: 'Łowca skór', lvl: '81', rank: 'ELITE' },
            { name: 'Zarządca magazynu', lvl: '82', rank: 'ELITE' },
            { name: 'Szalony miś', lvl: '115', rank: 'ELITE' },
            { name: 'Zabalsamowany wyznawca Seta', lvl: '118', rank: 'ELITE' },
            { name: 'Cheperu', lvl: '114', rank: 'ELITE' },
            { name: 'Henry Kaprawe Oko', lvl: '114', rank: 'ELITE' },
            { name: 'Marid', lvl: '120', rank: 'ELITE' },
            { name: 'Szkielet bosmana', lvl: '130', rank: 'ELITE' },
            { name: 'Monstrum z Bremus An', lvl: '85', rank: 'ELITE' }
        ],
        API: {
            CHARACTERS: 'https://margatron.ovh/game/api/characters',
            JOIN: 'https://margatron.ovh/game/api/characters/join',
            CURRENTCHARACTER: 'https://margatron.ovh/game-credentials',
        },
    };

    const Elements = {
        Config: {
            Menu: null,
            Loaded: false,
        },
        async init() {
            this.createAddonButton();
        },

        createAddonButton() {
            const btn = document.createElement("div");
            btn.id = "addon-settings-btn";
            btn.textContent = "⚙";
            Object.assign(btn.style, {
                position: "absolute",
                top: "10px",
                left: "10px",
                width: "26px",
                height: "26px",
                background: "rgba(0,0,0,0.5)",
                border: "1px solid #4CAF50",
                borderRadius: "4px",
                color: "white",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 999999
            });

            btn.addEventListener("click", () => {
                AddonMenu.toggle();
            });

            document.body.appendChild(btn);
        },




    };

    const AddonSettings = {
        defaults: {
            characterSwitcher: false,
            oldInterface: false,
        },

        get(key) {
            return GM_getValue(key, this.defaults[key]);
        },

        set(key, value) {
            GM_setValue(key, value);
        }
    };

    const AddonMenu = {
        panel: null,

        toggle() {
            if (!this.panel) {
                this.create();
                this.panel.style.display = "flex";
                return;
            }

            this.panel.style.display =
                this.panel.style.display === "none" ? "flex" : "none";
        },


        create() {
            this.panel = document.createElement("div");
            this.panel.id = "addon-settings-panel";

            Object.assign(this.panel.style, {
                position: "absolute",
                top: "50px",
                left: "10px",
                width: "220px",
                background: "rgba(0,0,0,0.85)",
                border: "1px solid #4CAF50",
                borderRadius: "6px",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                color: "white",
                fontFamily: "Times New Roman",
                zIndex: 999999
            });

            this.panel.innerHTML = `
            <div style="font-size:16px; margin-bottom:6px; text-align:center;">
                Ustawienia dodatku
            </div>

            ${this.toggleHTML("characterSwitcher", "Przełącznik postaci")}
            ${this.toggleHTML("oldInterface", "Stare UI")}
        `;

            document.body.appendChild(this.panel);
            this.initListeners();
        },

        toggleHTML(key, label) {
            const checked = AddonSettings.get(key) ? "checked" : "";
            return `
            <label style="display:flex; justify-content:space-between; cursor:pointer;">
                <span>${label}</span>
                <input type="checkbox" id="addon-${key}" ${checked} />
            </label>
        `;
        },

        initListeners() {
            this.panel.addEventListener("change", e => {
                if (!e.target.id.startsWith("addon-")) return;

                const key = e.target.id.replace("addon-", "");
                const value = e.target.checked;

                AddonSettings.set(key, value);
                this.apply(key, value);
            });
        },

        apply(key, value) {
            switch (key) {
                case "characterSwitcher":
                    value ? CharacterSwitcher.init() : CharacterSwitcher.remove?.();
                    break;

                case "oldInterface":
                    value ? OldMargoInterface.init() : OldMargoInterface.disable?.();
                    window.location.reload();
                    break;
            }
        }
    };




    // ======================== CharacterSwitcher ========================
    const CharacterSwitcher = {
        panel: null,
        characters: [],
        gameInfo: null,
        currentWorld: null,

        async init() {
            try {
                if (window.game && window.game.current_character_id) {
                    this.currentCharacterId = window.game.current_character_id;
                }

                const res = await fetch(CONFIG.API.CHARACTERS, {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                if (!res.ok) {
                    console.error('[CharacterSwitcher] Status:', res.status, res.statusText);
                    return;
                }

                this.characters = await res.json();

                if (!Array.isArray(this.characters) || this.characters.length === 0) {
                    console.warn('[CharacterSwitcher] Brak postaci do wyświetlenia');
                    return;
                }

                const resCurrent = await fetch(CONFIG.API.CURRENTCHARACTER, {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                if (!resCurrent.ok) {
                    console.error('[CharacterSwitcher] Status:', resCurrent.status, resCurrent.statusText);
                    return;
                }

                this.gameInfo = await resCurrent.json();
                console.log(this.gameInfo);
                const currentChar = this.characters.find(c => c.id === this.gameInfo.characterId);
                console.log('[CharacterSwitcher] Aktualne ID postaci:', this.gameInfo.characterId);
                this.currentWorld = currentChar?.world_name || 'retro';

                this.createPanel();
            } catch (err) {
                console.error('[CharacterSwitcher] Błąd przy pobieraniu postaci:', err);
            }
        },

        createPanel() {
            this.remove();

            this.panel = document.createElement('div');

            Object.assign(this.panel.style, {
                position: 'absolute',
                top: '-40px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: '-9999'
            });



            const charactersContainer = document.createElement('div');
            charactersContainer.id = 'lambo-characters-container';

            Object.assign(charactersContainer.style, {
                display: 'flex',
                flexDirection: 'row',
                gap: '12px',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0',
                margin: '0'
            });

            this.panel.appendChild(charactersContainer);


            const wrapper = document.querySelector('.centered-wrapper[data-v-73783980]');
            wrapper.appendChild(this.panel);
            const worldBtn = document.createElement('div');
            worldBtn.textContent = '⋮';
            worldBtn.id = 'world-switch-btn';

            Object.assign(worldBtn.style, {
                fontSize: '20px',
                color: '#fff',
                cursor: 'pointer',
                userSelect: 'none',
                padding: '4px 6px',
                borderRadius: '6px',
                background: 'rgba(0,0,0,0.4)',
                position: 'absolute',
                right: '-28px',
                top: '0',
                zIndex: '99999'
            });

            this.panel.appendChild(worldBtn);

            const worldMenu = document.createElement('div');
            worldMenu.id = 'world-switch-menu';

            Object.assign(worldMenu.style, {
                position: 'absolute',
                right: '-28px',
                top: '28px',
                background: 'rgba(0,0,0,0.85)',
                border: '1px solid #4CAF50',
                borderRadius: '6px',
                padding: '6px',
                display: 'none',
                flexDirection: 'column',
                gap: '4px',
                zIndex: '99999'
            });
            document.body.appendChild(worldMenu);
            const panelRect = this.panel.getBoundingClientRect();

            Object.assign(worldMenu.style, {
                position: 'absolute',
                width: '90px',
                top: (panelRect.top + 20) + 'px',
                left: (panelRect.right + 5) + 'px',
                zIndex: 999999,
            });

            const worlds = [...new Set(this.characters.map(c => c.world_name || 'retro'))];

            worlds.forEach(world => {
                const item = document.createElement('div');
                item.textContent = world;


                item.addEventListener('click', () => {
                    this.currentWorld = world;
                    this.renderCharacters(world);
                    worldMenu.style.display = 'none';
                });

                worldMenu.appendChild(item);
            });
            worldBtn.addEventListener('click', () => {
                worldMenu.style.display = worldMenu.style.display === 'none' ? 'flex' : 'none';
            });


            this.renderCharacters(this.currentWorld);
        },

        createWorldSwitcher(worlds) {
            const container = document.createElement('div');
            container.id = 'world-switcher-container';
            Object.assign(container.style, {
                display: 'flex',
                gap: '6px',
                justifyContent: 'center',
                padding: '4px',
                borderBottom: '1px solid rgba(76,175,80,0.3)',
                marginBottom: '4px'
            });

            const worldNames = {
                'retro': 'Retro',
                'legacy': 'Legacy',
                'classic': 'Classic'
            };

            const sortedWorlds = Object.keys(worlds).sort((a, b) => {
                const order = { 'retro': 0, 'legacy': 1, 'classic': 2 };
                return (order[a] || 99) - (order[b] || 99);
            });

            sortedWorlds.forEach(worldKey => {
                const btn = document.createElement('button');
                btn.textContent = worldNames[worldKey] || worldKey;
                btn.dataset.world = worldKey;
                btn.className = 'world-switch-btn';
                const isActive = this.currentWorld === worldKey;
                Object.assign(btn.style, {
                    padding: '6px 16px',
                    color: 'white',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    fontFamily: 'times-new-roman'
                });

                btn.addEventListener('mouseenter', () => {
                    if (this.currentWorld !== worldKey) {
                        btn.style.background = 'rgba(76,175,80,0.15)';
                    }
                });

                btn.addEventListener('mouseleave', () => {
                    if (this.currentWorld !== worldKey) {
                        btn.style.background = 'rgba(255,255,255,0.05)';
                    }
                });

                btn.addEventListener('click', () => {
                    this.currentWorld = worldKey;
                    this.updateWorldButtons();
                    this.renderCharacters(worldKey);
                });

                container.appendChild(btn);
            });

            return container;
        },

        updateWorldButtons() {
            const container = document.getElementById('world-switcher-container');
            if (!container) return;

            container.querySelectorAll('.world-switch-btn').forEach(btn => {
                const isActive = btn.dataset.world === this.currentWorld;
                btn.style.background = isActive ? 'rgba(76,175,80,0.3)' : 'rgba(255,255,255,0.05)';
                btn.style.border = isActive ? '1px solid rgba(76,175,80,0.6)' : '1px solid rgba(76,175,80,0.2)';
            });
        },

        renderCharacters(worldName = 'retro') {
            const container = document.getElementById('lambo-characters-container');
            if (!container) return;

            container.innerHTML = '';

            const worldCharacters = this.characters.filter(c =>
                                                           (c.world_name || 'retro') === worldName
                                                          );

            worldCharacters.forEach(character => {
                const charElement = this.createCharacterElement(character);
                container.appendChild(charElement);
            });
        },

        createCharacterElement(character) {
            const isCurrentCharacter = this.gameInfo && this.gameInfo.characterId === character.id;
            const container = document.createElement('div');

            if (isCurrentCharacter) {
                container.classList.add('active-character');
            }

            Object.assign(container.style, {
                width: '32px',
                height: '48px',
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                padding: '0',
                margin: '0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                transition: 'transform 0.1s linear',
            });
            container.addEventListener('mouseenter', () => {
                container.style.transform = 'translateY(-8px)';
            });

            container.addEventListener('mouseleave', () => {
                container.style.transform = 'translateY(0)';
            });
            if (isCurrentCharacter) {
                container.style.filter = 'drop-shadow(0 0 6px #4CAF50)';
            }

            const imgWrapper = document.createElement('div');
            Object.assign(imgWrapper.style, {
                width: '32px',
                height: '48px',
                overflow: 'hidden',
                borderRadius: '6px'
            });

            const sprite = document.createElement('div');
            Object.assign(sprite.style, {
                width: '32px',
                height: '48px',
                backgroundImage: `url(${character.src})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'auto',
                backgroundPosition: '0px 0px',
                imageRendering: 'pixelated'
            });

            imgWrapper.appendChild(sprite);

            const lvl = document.createElement('span');
            lvl.textContent = character.lvl + ' lvl';
            Object.assign(lvl.style, {
                display: 'block',
                fontSize: '11px',
                fontFamily: 'times-new-roman',
                color: '#fff',
                fontWeight: '600',
                textShadow: '0 1px 3px rgba(0,0,0,0.8)'
            });

            container.appendChild(imgWrapper);
            container.title = character.name;

            container.addEventListener('mouseenter', () => {
                if (!isCurrentCharacter) {
                    container.style.background = 'transparent';
                }
                container.style.transform = 'translateY(-2px)';
            });

            container.addEventListener('mouseleave', () => {
                container.style.background = 'transparent';
                container.style.transform = 'translateY(0)';
            });

            container.addEventListener('click', () => this.switchCharacter(character));
            return container;
        },

        async switchCharacter(character) {
            try {
                const joinRes = await fetch(CONFIG.API.JOIN, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({ character: character.id })
                });

                if (!joinRes.ok) {
                    const errorText = await joinRes.text();
                    console.error('[CharacterSwitcher] Join failed:', joinRes.status, errorText);
                    return;
                }

                const joinData = await joinRes.json();

                if (joinRes.ok && joinData) {
                    setTimeout(() => {
                        window.location.href = `https://world-${character.world_name}.margatron.ovh/`;
                    }, 500);
                } 
            } catch (err) {
                console.error('[CharacterSwitcher]', err);
            }
        },

        remove() {
            if (this.panel) {
                this.panel.remove();
                this.panel = null;
            }
        }
    };

    // ======================== OldMargoInteface ========================
    const OldMargoInterface = {
        isLoaded: false,
        async init() {
            this.oldMargoStyles();
            this.oldPanel();
            this.avatarLoader();
            this.barsLoader();
            this.isLoaded = true;
        },

        disable(){
            this.isLoaded = false;
        },

        async oldMargoStyles() {
            try{
                const style = document.createElement('style');
                style.textContent =
`/*bars*/
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
                document.head.appendChild(style);
                console.log("[OldMargoStyle] Załadowano style");
            }
            catch(err) {
                console.error("[OldMargoStyle] " + err);
            }
        },

        async oldPanel() {
            try{

                const oldPanel = "https://i.imgur.com/oX17ID7.png";
                const oldBottomBar = 'https://i.imgur.com/f8IKicJ.png';

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
            catch(err) {
                console.error("[OldMargoInterface] " + err);
            }
        },

        async avatarLoader() {
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

            }
            catch(err) {
                console.error("[OldMargoAvatar] " + err);
            }
        },

        async barsLoader() {
            try{
                const BarContainer = document.querySelector('div.bars[data-v-ed829f6e]');
                const Bars = [...document.querySelectorAll('div.bar[data-v-ed829f6e]')];
                if(Bars != null){
                    const hpBarBack = document.createElement('div');
                    const expBarBack = document.createElement('div');
                    Bars.forEach((element) => element.style = 'z-index: 5;');
                    hpBarBack.style = 'width: 140px; height: 8px; background: darkred; position: absolute; z-index: 0;';
                    expBarBack.style = 'width: 140px; top: 15px; height: 8px; background: #884400; position: absolute; z-index: 0;';
                    console.log(Elements);
                    BarContainer.appendChild(hpBarBack);
                    BarContainer.appendChild(expBarBack);
                }

            }
            catch(err) {}
        },

        async updateStats() {
            if(!this.isLoaded) return;
            const query = `
        query {
        hero {
        name,
        strength,
        dexterity,
        intelligence,
        gold
        }
        }
        `;
            GraphQLManager.query(query).then(data => {

                const container = document.querySelector('div.container[data-v-1ceaa76c][data-v-3865c13a]');
                const containerGold = document.querySelector('span[data-v-27e581d9][data-color]');
                if (!container) return;
                const heroObj = data.hero;

                container.style = 'text-align: center';
                container.innerText = `Siła: ${heroObj.strength} Zręcz.: ${heroObj.dexterity} Intel.: ${heroObj.intelligence}`;
                containerGold.style = 'text-align: center; color: gold;';
                containerGold.innerText = `Złoto: ${heroObj.gold}`;
            });
        }
    };

    window.addEventListener('load', () => {
        GraphQLManager.init();
        Elements.init();
        if (AddonSettings.get("characterSwitcher")) CharacterSwitcher.init();
        if (AddonSettings.get("oldInterface")) {
            OldMargoInterface.init();
        }
    });

    window.addEventListener('graphql-update', () => {
        OldMargoInterface.updateStats();
    });
})();
