// ==UserScript==
// @name         Google Search Fix
// @match        https://www.google.com/*
// @run-at       document-end
// @version      1.1.3
// @description  Custom Google search bar, make every term relevant, custom blacklist
// @author       WTP
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// @grant       GM_download
// @grant       GM_setClipboard
// @downloadURL  https://github.com/WTPerv/Google-Search-Fix/raw/refs/heads/main/googlesearchfix.user.js
// ==/UserScript==

(function () {

    const STORAGE_FORCED = "gsf_forced";
    const STORAGE_BLACKLIST = "gsf_blacklist";
    const STORAGE_WHITELIST = "gsf_whitelist";

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

        const backgroundColor = window.getComputedStyle(document.body).backgroundColor;

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
        input.placeholder = "Search here instead...";
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

        const forcedBtn = document.createElement("button");
        forcedBtn.id = "gsf_forcedBtn";
        forcedBtn.textContent = getForcedLabel();
        btnStyle(forcedBtn);

        forcedBtn.onclick = () => {
            setForced(!isForced());
            forcedBtn.textContent = getForcedLabel();
        }

        const blacklistBtn = document.createElement("button");
        blacklistBtn.id = "gsf_blacklistBtn";
        blacklistBtn.innerHTML = "Blacklist";
        btnStyle(blacklistBtn);

        blacklistBtn.onclick = () => {
            createMenu("blacklist", "Blacklist Settings", getBlacklist, saveBlacklist);
        };

        const whitelistBtn = document.createElement("button");
        whitelistBtn.id = "gsf_whitelistBtn";
        whitelistBtn.innerHTML = "Whitelist";
        btnStyle(whitelistBtn);

        whitelistBtn.onclick = () => {
            const menu = createMenu("whitelist", "Whitelist Settings", getWhitelist, saveWhitelist);
            menu.style.borderStyle = "solid";
            menu.style.borderWidth = "1px";
            menu.style.borderColor = "white";
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
            wrapper.append(forcedBtn);
            wrapper.appendChild(blacklistBtn);
            wrapper.appendChild(whitelistBtn);
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
            container.style.maxWidth = "100%";
            container.style.margin = "0px";
            container.style.padding = isHomepage ? "20px 20px 10px 20px" : "10px 10%";
            container.style.background = backgroundColor;
            container.style.display = "flex";
            container.style.justifyContent = isHomepage ? "center" : "left";
            container.style.alignItems = "center";
            container.style.zIndex = "999";
            container.style.position = "relative";
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
            bar.style.background = backgroundColor;
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

        function btnStyle(btn) {
            btn.style.background = backgroundColor;
            btn.style.cursor = "pointer";
            btn.style.border = "solid";
            btn.style.borderWidth = "1px";
            btn.style.borderRadius = "20px";
            btn.style.padding = "0 10px";
            btn.style.margin = "0px";
        }
    }

    function createMenu(id, menuTitle, getData, saveData) {
        const prevMenu = document.getElementById("gsf_menu");
        if (prevMenu) {
            if (prevMenu.name == id) return;
            else prevMenu.remove();
        }

        let dragging = false;
        let drag_offsetX = 0;
        let drag_offsetY = 0;

        const menu = document.createElement("div");
        menu.id = "gsf_menu";
        menu.name = id;
        menuStyle();

        const header = document.createElement("div");
        header.id = "gsf_menu_header";
        headerStyle();

        const closeBtn = document.createElement("button");
        closeBtn.id = "gsf_menu_closeBtn";
        closeBtnStyle();
        closeBtn.onclick = () => menu.remove();

        const addContainer = document.createElement("div");
        addContainer.id = "gsf_menu_add";
        containerStyle(addContainer);

        const addInput = document.createElement("input");
        addInput.id = "gsf_menu_add_input";
        addInput.placeholder = "Add term or terms (separated by comma)";
        addInputStyle();

        const addBtn = document.createElement("button");
        addBtn.id = "gsf_menu_add_btn";
        addBtn.textContent = "+";
        btnStyle(addBtn);

        addInput.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                addBtn.click();
            }
        });

        addBtn.onclick = () => {
            const values = addInput.value;
            if (!values) return;

            const data = getData();

            const valuesArr = values.split(",");
            valuesArr.forEach(v => {
                v = v.trim();
                let isRepeat = false;
                for (let i = 0; i < data.length; i++) {
                    let b = data[i];
                    if (b.term == v) {
                        isRepeat = true;
                        break;
                    }
                }
                if (!isRepeat)
                    data.push({ term: v, enabled: true });
            })

            saveData(data);

            addInput.value = "";
            render();

            addInput.focus();
        };

        const listContainer = document.createElement("div");
        listContainer.id = "gsf_menu_list";
        listContainerStyle();

        const bottomContainer = document.createElement("div");
        bottomContainer.id = "gsf_menu_extra";
        containerStyle(bottomContainer);

        const allEnableBtn = document.createElement("button");
        allEnableBtn.id = "gsf_menu_extra_allE";
        allEnableBtn.textContent = "Enable All";
        btnStyle(allEnableBtn);

        allEnableBtn.onclick = () => {
            const data = getData();

            data.forEach(item => { item.enabled = true; });
            saveData(data);
            render();
        }

        const allDisableBtn = document.createElement("button");
        allDisableBtn.id = "gsf_menu_extra_allD";
        allDisableBtn.textContent = "Disable All";
        btnStyle(allDisableBtn);

        allDisableBtn.onclick = () => {
            const data = getData();

            data.forEach(item => { item.enabled = false; });
            saveData(data);
            render();
        }

        const gap = document.createElement("div");
        gap.id = "gsf_menu_gap";
        gap.style.margin = "auto";

        const exportBtn = document.createElement("button");
        exportBtn.id = "gsf_menu_extra_export";
        exportBtn.textContent = "Export";
        btnStyle(exportBtn);

        exportBtn.onclick = () => exportSettingstoFile();

        const exportClipboardBtn = document.createElement("button");
        exportClipboardBtn.id = "gsf_menu_extra_exportClip";
        exportClipboardBtn.textContent = "Export to Clipboard";
        btnStyle(exportClipboardBtn);

        exportClipboardBtn.onclick = () => exportSettingsToClipboard(getData);

        insertToHTML();
        makeDraggable();

        render();

        return menu;

        function insertToHTML() {
            header.appendChild(closeBtn);
            addContainer.appendChild(addInput);
            addContainer.appendChild(addBtn);
            bottomContainer.appendChild(allEnableBtn);
            bottomContainer.appendChild(allDisableBtn);
            bottomContainer.appendChild(gap);
            bottomContainer.appendChild(exportBtn);
            bottomContainer.appendChild(exportClipboardBtn);
            menu.appendChild(header);
            menu.appendChild(addContainer);
            menu.appendChild(listContainer);
            menu.appendChild(bottomContainer);

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

            const data = getData();

            data.forEach((item, index) => {
                const chip = document.createElement("div");
                chipStyle(chip, item);

                const chipText = document.createElement("span");
                chipText.textContent = item.term;

                const chipDel = document.createElement("span");
                chipDelStyle(chipDel);

                chipDel.onclick = (e) => {
                    e.stopPropagation();
                    data.splice(index, 1);
                    saveData(data);
                    render();
                };

                chip.onclick = () => {
                    data[index].enabled = !data[index].enabled;
                    saveData(data);
                    render();
                };

                chip.appendChild(chipText);
                chip.appendChild(chipDel);
                listContainer.appendChild(chip);
            });
        }

        //##### STYLE #####

        function menuStyle() {
            menu.style.display = "flex";
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
            menu.style.flexDirection = "column";
            menu.style.overflow = "hidden";
            menu.style.resize = "both";
            menu.style.padding = "6px";
        }

        function headerStyle() {
            header.style.display = "flex";
            header.style.justifyContent = "space-between";
            header.style.padding = "10px 14px";
            header.style.fontWeight = "bold";
            header.textContent = menuTitle;
            header.style.userSelect = "none";
        }

        function closeBtnStyle() {
            closeBtn.textContent = "✕";
            closeBtn.style.background = "transparent";
            closeBtn.style.border = "none";
            closeBtn.style.color = "white";
            closeBtn.style.cursor = "pointer";
        }

        function containerStyle(container) {
            container.style.display = "flex";
            container.style.gap = "6px";
            container.style.padding = "10px";
        }

        function addInputStyle() {
            addInput.style.flex = "1";
            addInput.style.background = "#4d5156";
            addInput.style.border = "none";
            addInput.style.color = "white";
            addInput.style.padding = "6px 12px";
            addInput.style.borderRadius = "20px";
        }

        function btnStyle(btn) {
            btn.style.cursor = "pointer";
            btn.style.padding = "0 12px";
            btn.style.border = "solid";
            btn.style.borderColor = "white";
            btn.style.borderWidth = "1px";
            btn.style.borderRadius = "20px";
            btn.style.background = "transparent";
            btn.style.color = "white";
            btn.style.height = "30px";
        }

        function listContainerStyle() {
            listContainer.style.display = "flex";
            listContainer.style.flexWrap = "wrap";
            listContainer.style.gap = "6px";
            listContainer.style.flex = "1";
            listContainer.style.overflowY = "auto";
            listContainer.style.padding = "10px";
            listContainer.style.maxHeight = "50vh";
            listContainer.style.alignContent = "flex-start";
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
            chip.style.background = item.enabled ? "#5f6368" : "#282a2c";
            chip.style.color = "white";
            chip.style.height = "20px";
        }

        function chipDelStyle(chipDel) {
            chipDel.textContent = "✕";
            chipDel.style.fontSize = "12px";
            chipDel.style.opacity = "0.8";
            chipDel.style.cursor = "pointer";
        }
    }

    function isForced() {
        return GM_getValue(STORAGE_FORCED, "1") == "1";
    }

    function setForced(value) {
        GM_setValue(STORAGE_FORCED, value ? "1" : "0");
    }

    function getForcedLabel() {
        return isForced() ? "Forced" : "Relaxed";
    }

    function getBlacklist() {
        return JSON.parse(GM_getValue(STORAGE_BLACKLIST, "[]"));
    }

    function saveBlacklist(list) {
        GM_setValue(STORAGE_BLACKLIST, JSON.stringify(list));
    }

    function getWhitelist() {
        return JSON.parse(GM_getValue(STORAGE_WHITELIST, "[]"));
    }

    function saveWhitelist(list) {
        GM_setValue(STORAGE_WHITELIST, JSON.stringify(list));
    }

    function getQueryParts(q) {
        const parts = q.match(/-?"[^"]+"|\S+/g) || [];
        return parts;
    }

    function transformQuery(q) {
        const is_forced = isForced();

        const googleResStarts = ["before:", "after:", "define:", "cache:", "filetype:", "ext:", "site:", "related:", "intitle:", "allintitle:", "inurl:", "allinurl:", "intext:", "allintext:", "weather:", "stocks:", "map:", "movie:", "source:"];
        const googleResEquals = ["OR", "|", "AND"];

        // YOUR QUERY
        const parts = getQueryParts(q);
        const quoted = parts.map(p => {
            if (!is_forced) return p;

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

        //WHITELIST
        const whitelist = getWhitelist()
            .filter(w => w.enabled)
            .map(w => {
                if (!is_forced && !w.term.includes(" ")) return w.term;

                const isOperator = googleResStarts.some(s => w.term.startsWith(s));
                if (isOperator)
                    return w.term;

                return `"${w.term}"`;
            })
            .join(" ");

        //BLACKLIST
        const blacklist = getBlacklist()
            .filter(b => b.enabled)
            .map(b => {
                if (!is_forced && !b.term.includes(" ")) return `-${b.term}`;

                const isOperator = googleResStarts.some(s => b.term.startsWith(s));
                if (isOperator)
                    return `-${b.term}`;

                return `-"${b.term}"`;
            })
            .join(" ");

        return quoted + (whitelist ? " " + whitelist : "") + (blacklist ? " " + blacklist : "");
    }

    function getDefaultQuery() {
        const googleParams = new URLSearchParams(window.location.search);
        const googleQuery = googleParams.get("q") || "";
        const googleQueryParts = getQueryParts(googleQuery)

        const is_forced = isForced();
        const whitelist = getWhitelist();
        const blacklist = getBlacklist();

        const query = [];

        //organize google query
        for (let i = 0; i < googleQueryParts.length; i++) {
            let p = googleQueryParts[i];
            let isExcluded = p.startsWith('-');
            let cleaned = p.replace(/^-/, ''); //remove -
            if (is_forced) cleaned = cleaned.replace(/"/g, ''); //remove "

            query.push({ term: cleaned, anti: isExcluded });
        }

        //filter out blacklist and whitelist
        for (let i = 0; i < query.length; i++) {
            let p = query[i];
            if (p.anti) {
                for (let j = 0; j < blacklist.length; j++) {
                    let b = blacklist[j];
                    if (b.enabled && b.term == p.term) {
                        query.splice(i, 1);
                        i--;
                        break;
                    }
                }
            } else {
                for (let j = 0; j < whitelist.length; j++) {
                    let w = whitelist[j];
                    if (w.enabled && w.term == p.term) {
                        query.splice(i, 1);
                        i--;
                        break;
                    }
                }
            }
        }

        //rebuild cute query
        let newQuery = "";
        for (let i = 0; i < query.length; i++) {
            let p = query[i];
            if (p.anti) newQuery += "-";
            newQuery += (is_forced && p.term.includes(" ")) ? `"${p.term}"` : p.term;
            if (i < query.length - 1) newQuery += " ";
        }

        return newQuery;
    }

    function getExportData() {
        let data = "GOOGLE SEARCH FIX - SETTINGS\n";
        data += "Paste into the Blacklist or Whitelist windows respectively. Duplicates are ignored.\n\n\n"

        data += "### BLACKLIST ###\n"
        data += getListExportData(getBlacklist) + "\n\n";

        data += "### WHITELIST ###\n";
        data += getListExportData(getWhitelist);

        return data;
    }

    function getListExportData(getData) {
        const list = getData();
        let data = ""

        list.forEach((p, i) => {
            data += p.term;
            if (i < list.length - 1) data += ",";
        })

        return data;
    }

    function exportSettingsToClipboard(getData) {
        const data = getListExportData(getData);
        GM_setClipboard(data, "text");
    }

    function exportSettingstoFile() {
        const data = getExportData();
        const txt_file = new File([data], "GoogleSearchFix - Settings.txt", { type: "text/plain" });

        GM_download({
            url: window.URL.createObjectURL(txt_file),
            name: txt_file.name,
            saveAs: true
        });
    }

})();

