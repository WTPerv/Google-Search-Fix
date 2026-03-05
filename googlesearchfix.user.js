// ==UserScript==
// @name         Google Search Fix
// @match        https://www.google.com/*
// @run-at       document-end
// @version      2026-03-05
// @description  Custom Google search bar, make every term obligatory, inject blacklist
// @author       WTP
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// @downloadURL  https://github.com/WTPerv/Google-Search-Fix/raw/refs/heads/main/googlesearchfix.user.js
// ==/UserScript==

(function () {

    const STORAGE_BLACKLIST = "gsf_blacklist";

    function getBlacklist() {
        return JSON.parse(GM_getValue(STORAGE_BLACKLIST) || "[]");
    }

    function saveBlacklist(list) {
        GM_setValue(STORAGE_BLACKLIST, JSON.stringify(list));
    }

    function getQueryParts(q) {
        const parts = q.match(/-?"[^"]+"|\S+/g) || [];
        return parts;
    }

    function transformQuery(q) {
        const googleResStarts = ["before:", "after:", "define:", "cache:", "filetype:", "ext:", "site:", "related:", "intitle:", "allintitle:", "inurl:", "allinurl:", "intext:", "allintext:", "weather:", "stocks:", "map:", "movie:", "source:"];
        const googleResEquals = ["OR", "|", "AND"];

        const parts = getQueryParts(q);
        const quoted = parts.map(p => {
            if (googleResEquals.some(e => p === e)) return p;

            const isNegated = p.startsWith('-');
            const content = isNegated ? p.slice(1) : p;

            const isOperator = googleResStarts.some(s => content.startsWith(s));

            if (isOperator) {
                return p;
            }

            if (isNegated) {
                return content.startsWith('"') ? p : `-"${content}"`;
            }

            return p.startsWith('"') ? p : `"${p}"`;
        }).join(" ");

        const blacklist = getBlacklist()
            .filter(i => i.enabled)
            .map(i => `-"${i.term}"`)
            .join(" ");

        return quoted + (blacklist ? " " + blacklist : "");
    }

    function getDefaultQuery() {
        const googleParams = new URLSearchParams(window.location.search);
        const googleQuery = googleParams.get("q") || "";
        const googleQueryParts = getQueryParts(googleQuery)

        const blacklist = getBlacklist();

        const query = [];

        for (let i = 0; i < googleQueryParts.length; i++) {
            let p = googleQueryParts[i];
            let isExcluded = p.startsWith('-');
            let cleaned = p.replace(/^-/, '').replace(/"/g, '');

            query.push({ term: cleaned, anti: isExcluded });
        }

        for (let i = 0; i < query.length; i++) {
            let p = query[i];
            if (!p.anti) continue;
            for (let j = 0; j < blacklist.length; j++) {
                let b = blacklist[j];
                if (b.enabled && b.term == p.term) {
                    query.splice(i, 1);
                    i--;
                    break;
                }
            }
        }

        let newQuery = "";
        for (let i = 0; i < query.length; i++) {
            let p = query[i];
            if (p.anti) newQuery += "-";
            newQuery += p.term.includes(" ") ? `"${p.term}"` : p.term;
            if (i < query.length - 1) newQuery += " ";
        }

        return newQuery;
    }

    function createBlacklistMenu() {

        if (document.getElementById("blacklistMenu")) return;

        const menu = document.createElement("div");
        menu.id = "blacklistMenu";
        menu.style.position = "fixed";
        menu.style.top = "50%";
        menu.style.left = "50%";
        menu.style.transform = "translate(-50%,-50%)";
        menu.style.width = "520px";
        menu.style.maxHeight = "70vh";
        menu.style.background = "#111";
        menu.style.color = "white";
        menu.style.borderRadius = "8px";
        menu.style.boxShadow = "0 0 20px rgba(0,0,0,.6)";
        menu.style.zIndex = "999999";
        menu.style.display = "none";
        menu.style.flexDirection = "column";
        menu.style.overflow = "hidden";
        menu.style.resize = "none";

        const header = document.createElement("div");
        header.style.display = "flex";
        header.style.justifyContent = "space-between";
        header.style.padding = "10px 14px";
        header.style.fontWeight = "bold";
        header.textContent = "Blacklist Settings";
        header.style.userSelect = "none";

        const close = document.createElement("button");
        close.textContent = "X";
        close.style.background = "transparent";
        close.style.border = "none";
        close.style.color = "white";
        close.style.cursor = "pointer";
        close.onclick = () => menu.remove();

        header.appendChild(close);

        //draggable window
        let dragging = false;
        let offsetX = 0;
        let offsetY = 0;

        header.onmousedown = (e) => {

            const rect = menu.getBoundingClientRect();

            dragging = true;

            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            menu.style.left = rect.left + "px";
            menu.style.top = rect.top + "px";

            menu.style.transform = "none";
        };

        document.onmousemove = (e) => {
            if (!dragging) return;

            menu.style.left = (e.clientX - offsetX) + "px";
            menu.style.top = (e.clientY - offsetY) + "px";
        };

        document.onmouseup = () => {
            dragging = false;
        };
        //end draggable window

        const listContainer = document.createElement("div");
        listContainer.style.flex = "1";
        listContainer.style.overflowY = "auto";
        listContainer.style.padding = "10px";
        listContainer.style.maxHeight = "50vh";

        const addRow = document.createElement("div");
        addRow.style.display = "flex";
        addRow.style.gap = "6px";
        addRow.style.padding = "10px";

        const addInput = document.createElement("input");
        addInput.placeholder = "Add term";
        addInput.style.flex = "1";
        addInput.style.background = "#4d5156";
        addInput.style.border = "none";
        addInput.style.color = "white";
        addInput.style.padding = "6px";

        const addBtn = document.createElement("button");
        addBtn.textContent = "+";
        addBtn.style.cursor = "pointer";
        addBtn.style.padding = "0 12px";
        addBtn.style.border = "solid";
        addBtn.style.borderColor = "white";
        addBtn.style.borderWidth = "1px";
        addBtn.style.borderRadius = "20px";

        addInput.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                addBtn.click();
            }
        });

        addRow.appendChild(addInput);
        addRow.appendChild(addBtn);

        menu.appendChild(header);
        menu.appendChild(addRow);
        menu.appendChild(listContainer);

        document.body.appendChild(menu);

        function render() {

            listContainer.innerHTML = "";

            const list = getBlacklist();

            listContainer.style.display = "flex";
            listContainer.style.flexWrap = "wrap";
            listContainer.style.gap = "6px";

            list.forEach((item, index) => {

                const chip = document.createElement("div");
                chip.style.display = "flex";
                chip.style.alignItems = "center";
                chip.style.gap = "6px";
                chip.style.padding = "6px 10px";
                chip.style.borderRadius = "16px";
                chip.style.fontSize = "13px";
                chip.style.cursor = "pointer";
                chip.style.userSelect = "none";

                chip.style.background = item.enabled ? "#5f6368" : "#3c4043";
                chip.style.color = "white";

                const text = document.createElement("span");
                text.textContent = item.term;

                const del = document.createElement("span");
                del.textContent = "✕";
                del.style.fontSize = "12px";
                del.style.opacity = "0.8";
                del.style.cursor = "pointer";

                del.onclick = (e) => {
                    e.stopPropagation();
                    list.splice(index, 1);
                    saveBlacklist(list);
                    render();
                };

                chip.onclick = () => {
                    list[index].enabled = !list[index].enabled;
                    saveBlacklist(list);
                    render();
                };

                chip.appendChild(text);
                chip.appendChild(del);

                listContainer.appendChild(chip);
            });
        }

        addBtn.onclick = () => {
            const v = addInput.value.trim();
            if (!v) return;

            const list = getBlacklist();
            list.push({ term: v, enabled: true });
            saveBlacklist(list);

            addInput.value = "";
            render();

            addInput.focus();
        };

        render();

        return menu;
    }

    function insertBar() {

        if (document.getElementById("customSearch")) return;

        let homepage = false;

        const form = document.querySelector('form[role="search"]');
        if (!form) return;

        // results page container
        let header = form.closest("#searchform");

        // homepage fallback
        if (!header) {
            homepage = true;
            header = form.parentElement;
        }

        if (!header) return;

        const backgroundColor = window.getComputedStyle(document.body).backgroundColor;

        const container = document.createElement("div");
        container.style.width = "100%";
        container.style.margin = homepage ? "10px 10px 0px 10px" : "0px 10px";
        container.style.padding = "10px 10px";
        container.style.background = backgroundColor;
        container.style.display = "flex";
        container.style.justifyContent = "center";
        container.style.alignItems = "center";

        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        wrapper.style.width = "50%";
        wrapper.style.display = "flex";
        wrapper.style.gap = "6px";

        const input = document.createElement("input");
        input.id = "customSearch";
        input.placeholder = "Fixed Search";
        input.value = getDefaultQuery();

        input.style.flex = "1";
        input.style.border = "solid";
        input.style.borderWidth = "1px";
        input.style.borderRadius = "24px";
        input.style.padding = "10px 50px 10px 16px";
        input.style.outline = "none";

        const button = document.createElement("button");

        input.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                button.click();
            }
        });

        button.style.background = "transparent";
        button.style.border = "none";
        button.style.cursor = "pointer";
        button.style.marginLeft = "-45px";
        button.style.padding = "4px";

        button.innerHTML = `
<svg viewBox="0 0 24 24" width="20" height="20" fill="#9aa0a6">
<path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16 c1.61 0 3.09-.59 4.23-1.57 l.27.28v.79l5 4.99 L20.49 19l-4.99-5zm-6 0 C7.01 14 5 11.99 5 9.5 S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
</svg>`;

        const blacklistBtn = document.createElement("button");
        blacklistBtn.textContent = "Blacklist Settings";
        blacklistBtn.style.background = "transparent";
        blacklistBtn.style.cursor = "pointer";
        blacklistBtn.style.border = "solid";
        blacklistBtn.style.borderWidth = "1px";
        blacklistBtn.style.borderRadius = "20px";
        blacklistBtn.style.padding = "0 12px";
        blacklistBtn.style.margin = "0 12px";


        blacklistBtn.onclick = () => {
            const modal = createBlacklistMenu();
            modal.style.display = "flex";
        };

        wrapper.appendChild(input);
        wrapper.appendChild(button);
        wrapper.appendChild(blacklistBtn);

        container.appendChild(wrapper);
        header.before(container);

        const spacer = document.querySelector(".LoygGf");
        if (spacer) spacer.style.height = "140px";

        button.onclick = e => {

            e.preventDefault();

            const googleInput = document.querySelector('textarea[name="q"], input[name="q"]');
            if (!googleInput) return;

            const newQuery = transformQuery(input.value);
            googleInput.value = newQuery;
            form.submit();
        };
    }

    insertBar();

    const observer = new MutationObserver(insertBar);
    observer.observe(document.body, { childList: true, subtree: true });

})();
