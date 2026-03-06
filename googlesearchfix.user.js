// ==UserScript==
// @name         Google Search Fix
// @match        https://www.google.com/*
// @run-at       document-end
// @version      2026-03-06
// @description  Custom Google search bar, make every term obligatory, inject blacklist
// @author       WTP
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// @downloadURL  https://github.com/WTPerv/Google-Search-Fix/raw/refs/heads/main/googlesearchfix.user.js
// ==/UserScript==

(function () {

    const STORAGE_BLACKLIST = "gsf_blacklist";

    createCustomBar();

    const observer = new MutationObserver(createCustomBar);
    observer.observe(document.body, { childList: true, subtree: true });


    function createCustomBar() {

        if (document.getElementById("gsf_bar_input")) return;

        let isHomepage = false;

        const form = document.querySelector('form[role="search"]'); //find og searchbar
        if (!form) return;

        let ogContainer = document.getElementById("searchform"); //find results page's container
        if (!ogContainer) {
            isHomepage = true;
            ogContainer = form.parentElement; //else, find homepage's container
        }
        if (!ogContainer) return;

        //creating HTML
        const container = document.createElement("div");
        container.id = "gsf_container";
        containerStyle();

        const wrapper = document.createElement("div");
        wrapper.id = "gsf_wrapper"
        wrapperStyle();

        const bar = document.createElement("div");
        bar.id = "gsf_bar";
        barStyle();

        const input = document.createElement("input");
        input.id = "gsf_bar_input";
        input.placeholder = "Fixed Search";
        input.value = getDefaultQuery();
        inputStyle();

        const searchBtn = document.createElement("button");
        searchBtn.id = "gsf_bar_searchBtn";
        searchBtnStyle();

        input.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                searchBtn.click();
            }
        });

        const blacklistBtn = document.createElement("button");
        blacklistBtn.id = "gsf_blacklistBtn";
        blacklistBtn.textContent = "Blacklist \n Settings";
        blacklistBtnStyle();

        blacklistBtn.onclick = () => {
            const modal = createBlacklistMenu();
            modal.style.display = "flex";
        };

        insertToHTML();

        //SEARCH!!!1!!
        searchBtn.onclick = e => {

            e.preventDefault();

            const googleInput = document.querySelector('textarea[name="q"], input[name="q"]');
            if (!googleInput) return;

            const newQuery = transformQuery(input.value);
            googleInput.value = newQuery;
            form.submit();
        };

        function insertToHTML() {
            bar.appendChild(input);
            bar.appendChild(searchBtn);
            wrapper.append(bar);
            wrapper.appendChild(blacklistBtn);
            container.appendChild(wrapper);

            ogContainer.before(container);

            //make space bitcheessss
            if (!isHomepage) {
                const spacer = getHighestParent(form);
                if (spacer) spacer.style.height = "140px";
            }

            function getHighestParent(element) {
                if (!element.parentElement || element.parentElement.nodeName == "BODY")
                    return element;
                return getHighestParent(element.parentElement);
            }
        }

        //##### STYLE #####

        function containerStyle() {
            const backgroundColor = window.getComputedStyle(document.body).backgroundColor;
            container.style.width = "100%";
            container.style.margin = "0px";
            container.style.padding = isHomepage ? "20px 20px 10px 20px" : "10px 10%";
            container.style.background = backgroundColor;
            container.style.display = "flex";
            container.style.justifyContent = isHomepage ? "center" : "left";
            container.style.alignItems = "center";
        }

        function wrapperStyle() {
            wrapper.style.position = "relative";
            wrapper.style.minWidth = "350px";
            wrapper.style.maxWidth = "1000px";
            wrapper.style.width = "80%";
            wrapper.style.display = "flex";
            wrapper.style.gap = "6px";
            wrapper.style.height = "45px";
        }

        function barStyle() {
            bar.style.display = "flex";
            bar.style.border = "solid";
            bar.style.flex = "2";
            bar.style.borderWidth = "1px";
            bar.style.borderRadius = "24px";
            bar.style.padding = "0px 16px";
            bar.style.outline = "none";
            bar.style.gap = "6px";
        }

        function inputStyle() {
            input.style.border = "none";
            input.style.background = "transparent";
            input.style.width = "100%";
            input.style.padding = "0";
        }

        function searchBtnStyle() {
            searchBtn.style.background = "transparent";
            searchBtn.style.border = "none";
            searchBtn.style.cursor = "pointer";
            searchBtn.style.padding = "0px 8px";
            searchBtn.style.marginRight = "-8px";
            searchBtn.innerHTML = `
<svg viewBox="0 0 24 24" width="20" height="20" fill="#9aa0a6">
<path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16 c1.61 0 3.09-.59 4.23-1.57 l.27.28v.79l5 4.99 L20.49 19l-4.99-5zm-6 0 C7.01 14 5 11.99 5 9.5 S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
</svg>`;
        }

        function blacklistBtnStyle() {
            blacklistBtn.style.background = "transparent";
            blacklistBtn.style.cursor = "pointer";
            blacklistBtn.style.border = "solid";
            blacklistBtn.style.borderWidth = "1px";
            blacklistBtn.style.borderRadius = "20px";
            blacklistBtn.style.padding = "0 8px";
            blacklistBtn.style.margin = "0px";
        }
    }

    function createBlacklistMenu() {

        if (document.getElementById("gsf_bl_menu")) return;

        let dragging = false;
        let drag_offsetX = 0;
        let drag_offsetY = 0;

        const menu = document.createElement("div");
        menu.id = "gsf_bl_menu";
        menuStyle();

        const header = document.createElement("div");
        header.id = "gsf_bl_header";
        headerStyle();

        const closeBtn = document.createElement("button");
        closeBtn.id = "gsf_bl_closeBtn";
        closeBtnStyle();
        closeBtn.onclick = () => menu.remove();


        const addContainer = document.createElement("div");
        addContainer.id = "gsf_bl_add";
        addContainerStyle();

        const addInput = document.createElement("input");
        addInput.id = "gsf_bl_add_input";
        addInput.placeholder = "Add term";
        addInputStyle();

        const addBtn = document.createElement("button");
        addBtn.id = "gsf_bl_add_btn";
        addBtnStyle();

        addInput.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                addBtn.click();
            }
        });

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

        const listContainer = document.createElement("div");
        listContainer.id = "gsf_bl_list";
        listContainerStyle();

        insertToHTML();
        makeDraggable();

        render();

        return menu;

        function insertToHTML() {
            header.appendChild(closeBtn);
            addContainer.appendChild(addInput);
            addContainer.appendChild(addBtn);
            menu.appendChild(header);
            menu.appendChild(addContainer);
            menu.appendChild(listContainer);

            document.body.appendChild(menu);
        }

        function makeDraggable() {
            header.onmousedown = (e) => {

                const rect = menu.getBoundingClientRect();

                dragging = true;

                drag_offsetX = e.clientX - rect.left;
                drag_offsetY = e.clientY - rect.top;

                menu.style.left = rect.left + "px";
                menu.style.top = rect.top + "px";

                menu.style.transform = "none";
            };

            document.onmousemove = (e) => {
                if (!dragging) return;

                menu.style.left = (e.clientX - drag_offsetX) + "px";
                menu.style.top = (e.clientY - drag_offsetY) + "px";
            };

            document.onmouseup = () => {
                dragging = false;
            };
        }

        function render() {
            listContainer.innerHTML = ""; //reset

            const list = getBlacklist();

            list.forEach((item, index) => {
                const chip = document.createElement("div");
                chipStyle(chip, item);

                const chipText = document.createElement("span");
                chipText.textContent = item.term;

                const chipDel = document.createElement("span");
                chipDelStyle(chipDel);

                chipDel.onclick = (e) => {
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

                chip.appendChild(chipText);
                chip.appendChild(chipDel);
                listContainer.appendChild(chip);
            });
        }

        //##### STYLE #####

        function menuStyle() {
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
        }

        function headerStyle() {
            header.style.display = "flex";
            header.style.justifyContent = "space-between";
            header.style.padding = "10px 14px";
            header.style.fontWeight = "bold";
            header.textContent = "Blacklist Settings";
            header.style.userSelect = "none";
        }

        function closeBtnStyle() {
            closeBtn.textContent = "✕";
            closeBtn.style.background = "transparent";
            closeBtn.style.border = "none";
            closeBtn.style.color = "white";
            closeBtn.style.cursor = "pointer";
        }

        function addContainerStyle() {
            addContainer.style.display = "flex";
            addContainer.style.gap = "6px";
            addContainer.style.padding = "10px";
        }

        function addInputStyle() {
            addInput.style.flex = "1";
            addInput.style.background = "#4d5156";
            addInput.style.border = "none";
            addInput.style.color = "white";
            addInput.style.padding = "6px";
        }

        function addBtnStyle() {
            addBtn.textContent = "+";
            addBtn.style.cursor = "pointer";
            addBtn.style.padding = "0 12px";
            addBtn.style.border = "solid";
            addBtn.style.borderColor = "white";
            addBtn.style.borderWidth = "1px";
            addBtn.style.borderRadius = "20px";
        }

        function listContainerStyle() {
            listContainer.style.display = "flex";
            listContainer.style.flexWrap = "wrap";
            listContainer.style.gap = "6px";
            listContainer.style.flex = "1";
            listContainer.style.overflowY = "auto";
            listContainer.style.padding = "10px";
            listContainer.style.maxHeight = "50vh";
        }

        function chipStyle(chip, item) {
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
        }

        function chipDelStyle(chipDel) {
            chipDel.textContent = "✕";
            chipDel.style.fontSize = "12px";
            chipDel.style.opacity = "0.8";
            chipDel.style.cursor = "pointer";
        }
    }

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
            if (isOperator)
                return p;

            if (isNegated)
                return content.startsWith('"') ? p : `-"${content}"`;

            return p.startsWith('"') ? p : `"${p}"`;
        }).join(" ");

        const blacklist = getBlacklist()
            .filter(b => b.enabled)
            .map(b => {
                const isOperator = googleResStarts.some(s => b.term.startsWith(s));
                if (isOperator)
                    return `-${b.term}`;

                return `-"${b.term}"`;
            })
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

})();
