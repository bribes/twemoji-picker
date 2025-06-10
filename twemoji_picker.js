/**
 * Licensed under the MIT license
 */
(function () {
    "use strict";
    if (typeof window.twemoji_picker !== 'undefined') return false;
    const getEmojiVersion = (unicodeName) => {
        const match = unicodeName.match(/E(\d+\.\d+)/);
        return match ? parseFloat(match[1]) : null;
    }
    const parseEmoji = (emoji) => {
        if (emoji.startsWith('00')) emoji = emoji.replace('00', '');
        if (emoji.includes('FE0F')) emoji = emoji.split(' ')[0];
        return emoji.toLowerCase().split(' ').join('-');
    }
    let emoji_json = false,
        window_width = null,
        style_generated = null,
        active_trigger = null,
        active_sel_cb = null,
        cat_waypoints = {};
    const category_icons = {
        "smileys-emotion": "😀",
        "people-body": "🧑",
        "animals-nature": "🐇",
        "food-drink": "🍔",
        "travel-places": "🚘",
        "activities": "⚽",
        "objects": "🎧",
        "symbols": "🈶",
        "flags": "🚩"
    },
        category_titles = {
            "smileys-emotion": "Smileys & Emotion",
            "people-body": "People & Body",
            "animals-nature": "Animals & Nature",
            "food-drink": "Food & Drink",
            "travel-places": "Travel & Places",
            "activities": "Activies",
            "objects": "Objects",
            "symbols": "Symbols",
            "flags": "Flags"
        },
        def_opts = {
            picker_trigger: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25"><path d="M12.5,0A12.5,12.5,0,1,0,25,12.5,12.52,12.52,0,0,0,12.5,0ZM23,12.5A10.5,10.5,0,1,1,12.5,2,10.5,10.5,0,0,1,23,12.5Z"/><path d="M17.79,15h0a1.1,1.1,0,0,0-1.34.12,4,4,0,0,0-.3.28l-.06.05a4.83,4.83,0,0,1-.42.37,5.06,5.06,0,0,1-5.41.57,5.12,5.12,0,0,1-1.61-1.19A1.14,1.14,0,1,0,7,16.75a7.36,7.36,0,0,0,5.49,2.37h.63a3.15,3.15,0,0,0,.37,0A7.41,7.41,0,0,0,18,16.74a1.34,1.34,0,0,0,.32-.58A1.09,1.09,0,0,0,17.79,15Z"/><path d="M7.44,10.18l0-.19c0-.15.1-.34.48-.47a1.1,1.1,0,0,1,1,.09.61.61,0,0,1,.31.51,1,1,0,0,0,1,.88h.08a1,1,0,0,0,1-1.06A2.84,2.84,0,0,0,8.26,7.5L8,7.53a4.85,4.85,0,0,0-.53.08A2.64,2.64,0,0,0,5.33,9.94a1,1,0,0,0,1,1.06A1.07,1.07,0,0,0,7.44,10.18Z"/><path d="M16.56,7.51h0A3,3,0,0,0,14,8.89a1.78,1.78,0,0,0-.3,1.31,1,1,0,0,0,1,.8,1.06,1.06,0,0,0,1-.7,1.7,1.7,0,0,0,.06-.31.69.69,0,0,1,.58-.5,1.07,1.07,0,0,1,1,.23.6.6,0,0,1,.17.4,1,1,0,0,0,1.15.87,1,1,0,0,0,1-1.06C19.62,8.55,18.27,7.51,16.56,7.51Z"/></svg>',
            trigger_position: {
                top: "5px",
                right: "5px"
            },
            trigger_size: {
                height: "22px",
                width: "22px"
            },
            target_r_padding: 27,
            emoji_json_url: "https://raw.githubusercontent.com/bribes/twemoji-picker/main/emojis.min.json",
            trigger_title: "insert emoji",
            labels: ["Insert emoji", "Search emojis", "No results..."],
            selection_callback: null
        };
    document.addEventListener("click", (function (e) {
        const picker = document.querySelector("#twemoji-picker.twep-shown");
        if (!picker || e.target.classList.contains("twep-trigger")) return true;
        for (const trigger of document.getElementsByClassName("twep-trigger"))
            if (trigger.contains(e.target)) return true;
        return picker.contains(e.target) || e.target.classList.contains("twep-shown") || (picker.classList.remove("twep-shown"), active_trigger = null, active_sel_cb = null), true
    })), window.addEventListener("resize", (function (e) {
        const picker = document.querySelector("#twemoji-picker.twep-shown");
        return !picker || window_width === window.innerWidth || (picker.classList.remove("twep-shown"), active_trigger = null, active_sel_cb = null, true)
    })), window.twemoji_picker = function (attachTo, options = {}) {
        return this.attachTo = attachTo, this.attachTo ? typeof options !== "object" ? console.error("Options must be an object") : (options = Object.assign({}, def_opts, options), this.init = function () {
            const $this = this;
            if (style_generated || (this.generate_style(), style_generated = true), typeof emoji_json !== "object") return document.addEventListener("DOMContentLoaded", (() => {
                this.fetch_emoji_data()
            })), true;
            maybe_querySelectorAll(attachTo).forEach((function (e) {
                e.tagName !== "TEXTAREA" && e.tagName !== "INPUT" || e.tagName === "INPUT" && e.getAttribute("type") !== "text" || e.parentNode.classList.length && e.parentNode.classList.contains("twep-el-wrap") || ($this.append_emoji_picker(), $this.wrap_element(e), document.querySelector(".twep-search input").addEventListener("keyup", (e => {
                    $this.emoji_search(e)
                })))
            }))
        }, this.emoji_search = function (e) {
            const parent = e.target.parentNode,
                val = e.target.value,
                categories = document.querySelectorAll("#twemoji-picker .twep-category"),
                emojis = document.querySelectorAll("#twemoji-picker .twep-all-categories li");
            if (val.length < 2)
                for (const emoji of emojis) emoji.classList.remove("twep-hidden-emoji"), parent.classList.remove("twep-searching");
            else {
                for (const emoji of emojis) emoji.getAttribute("data-name").toLowerCase().match(val.toLowerCase()) ? emoji.classList.remove("twep-hidden-emoji") : emoji.classList.add("twep-hidden-emoji");
                parent.classList.add("twep-searching")
            }
            for (const cat of categories) cat.querySelectorAll("li:not(.twep-hidden-emoji)").length ? cat.classList.remove("twep-hidden-emoji-cat") : cat.classList.add("twep-hidden-emoji-cat");
            document.querySelectorAll(".twep-all-categories ul:not(.twep-hidden-emoji-cat)").length ? document.querySelector(".twep-no-results") && document.querySelector(".twep-no-results").remove() : document.querySelector(".twep-no-results") || document.querySelector(".twep-all-categories").insertAdjacentHTML("beforeend", '<em class="twep-no-results">' + options.labels[2] + "</em>")
        }, this.clear_search = function () {
            const input = document.querySelector(".twep-search input");
            input.value = "", input.dispatchEvent(new Event("keyup"))
        }, this.go_to_emoji_cat = function (el, cat_id) {
            const top_pos = document.querySelector(".twep-category[category-name='" + cat_id + "']").offsetTop;
            document.querySelector(".twep-all-categories").scrollTop = top_pos - 100, document.querySelector("li.twep-active").classList.remove("twep-active"), el.classList.add("twep-active")
        }, this.cat_waypoints_check = function () {
            if (!document.querySelector(".twep-shown")) return true;
            const top_scroll = document.querySelector(".twep-all-categories").scrollTop,
                keys = Object.keys(cat_waypoints);
            keys.sort().reverse();
            let active = keys[0];
            for (const val of keys)
                if (top_scroll >= parseInt(val, 10)) {
                    active = val;
                    break
                } const i = cat_waypoints[active];
            document.querySelector("li.twep-active").classList.remove("twep-active"), document.querySelector(".twep-categories li[data-index='" + i + "']").classList.add("twep-active")
        }, this.reset_picker = function () {
            document.querySelector(".twep-search i").click(), document.querySelector(".twep-categories li").click()
        }, this.show_picker = function (e) {
            const picker = document.getElementById("twemoji-picker");
            if (window_width = window.innerWidth, e === active_trigger) return picker.classList.remove("twep-shown"), active_trigger = null, active_sel_cb = null, false;
            this.reset_picker(), active_trigger = e, active_sel_cb = options.selection_callback;
            const picker_w = picker.offsetWidth,
                picker_h = picker.offsetHeight,
                at_offsety = active_trigger.getBoundingClientRect(),
                at_h = parseInt(active_trigger.clientHeight, 10) + parseInt(getComputedStyle(active_trigger).borderTopWidth, 10) + parseInt(getComputedStyle(active_trigger).borderBottomWidth, 10),
                y_pos = parseInt(at_offsety.y, 10) + parseInt(window.pageYOffset, 10) + at_h + 5;
            let left = parseInt(at_offsety.right, 10) - picker_w;
            left < 0 && (left = 0), window.innerWidth < 700 && (left = Math.floor((window.innerWidth - picker_w) / 2));
            const y_pos_css = y_pos + picker_h - document.documentElement.scrollTop < window.innerHeight ? "top:" + y_pos : "transform: translate3d(0, calc((100% + " + (active_trigger.offsetHeight + 10) + "px) * -1), 0); top:" + y_pos;
            picker.setAttribute("style", y_pos_css + "px; left: " + left + "px;"), picker.classList.add("twep-shown")
        }, this.emoji_select = function (e) {
            const field = active_trigger.parentNode.querySelector("input, textarea"),
                true_emoji = e.getElementsByTagName("IMG").length ? e.getElementsByTagName("IMG")[0].getAttribute("alt") : e.innerText;
            field.value = field.value + true_emoji, active_sel_cb && typeof active_sel_cb === "function" && active_sel_cb.call(this, e, field)
        }, this.wrap_element = function (el) {
            const uniqid = Math.random().toString(36).substr(2, 9);
            let trigger_css = "";
            const trigger_css_props = {
                ...options.trigger_position,
                ...options.trigger_size
            };
            Object.keys(trigger_css_props).some((function (name) {
                trigger_css += name + ":" + trigger_css_props[name] + ";"
            }));
            let div = document.createElement("div");
            div.setAttribute("data-f-name", el.getAttribute("name")), div.classList.add("twep-el-wrap"), div.innerHTML = '<span id="' + uniqid + '" class="twep-trigger" style="' + trigger_css + '" title="' + options.labels[0] + '">' + options.picker_trigger + "</span>", el.parentNode.insertBefore(div, el), div.appendChild(el);
            const trigger = document.getElementById(uniqid);
            trigger.addEventListener("click", (e => {
                this.show_picker(trigger)
            }))
        }, this.fetch_emoji_data = function () {
            if (typeof emoji_json === "object") return this.init(), true;
            if (emoji_json === "loading") {
                const that = this;
                return setTimeout((function () {
                    that.fetch_emoji_data()
                }), 50), true
            }
            emoji_json = "loading", fetch(options.emoji_json_url).then((response => response.json())).then((object => {
                emoji_json = object, this.init()
            })).catch((function () {
                emoji_json = false
            }))
        }, this.append_emoji_picker = function () {
            if (document.getElementById("twemoji-picker")) return true;
            let picker = `\n            <div id="twemoji-picker">\n                <div class="twep-categories">%categories%\n                    <div class="twep-search">\n                        <input placeholder="${options.labels[1]}" />\n                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512.005 512.005" xml:space="preserve"><g><g><path d="M505.749,475.587l-145.6-145.6c28.203-34.837,45.184-79.104,45.184-127.317c0-111.744-90.923-202.667-202.667-202.667S0,90.925,0,202.669s90.923,202.667,202.667,202.667c48.213,0,92.48-16.981,127.317-45.184l145.6,145.6c4.16,4.16,9.621,6.251,15.083,6.251s10.923-2.091,15.083-6.251C514.091,497.411,514.091,483.928,505.749,475.587z M202.667,362.669c-88.235,0-160-71.765-160-160s71.765-160,160-160s160,71.765,160,160S290.901,362.669,202.667,362.669z"/></g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>\n                        <i>×</i>\n                    </div>\n                </div>\n                <div>%pickerContainer%</div>\n            </div>`,
                categoriesInner = "",
                outerUl = '<div class="twep-all-categories">%outerUL%</div>',
                innerLists = "",
                index = 0,
                object = emoji_json;
            for (const key in object)
                if (object.hasOwnProperty(key)) {
                    index++;
                    let keyToId = key.split(" ").join("-").split("&").join("").toLowerCase();
                    let categories = object[key];
                    categories = categories.filter(a => getEmojiVersion(a.unicodeName) < 15 && a.group !== 'component');
                    categoriesInner += `\n                    <li class="${1 === index ? "twep-active" : ""}" data-index="${keyToId}" title="${key}">\n                        <a href="javascript:void(0)">${category_icons[keyToId]}</a>\n                    </li>`, innerLists += `\n                    <ul class="twep-category" category-name="${keyToId}">\n                        <div class="twep-container-title">${category_titles[key]}</div>\n                        <div class="twep-grid">`, categories.forEach((e => {
                        innerLists += `\n                                <li data-name="${e.unicodeName}">\n                                    <a class="twep-item" title="${e.unicodeName}" data-name="${e.unicodeName}" data-code="${parseEmoji(e.codePoint)}" href="javascript:void(0)"><img draggable="false" class="emoji" alt="${e.character}" src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${parseEmoji(e.codePoint)}.png"></a>\n                                </li>`
                    })), innerLists += "\n                        </div>\n                    </ul>"
                } let allSmiles = outerUl.replace("%outerUL%", innerLists),
                    cats = "<ul>%categories%</ul>".replace("%categories%", categoriesInner);
            picker = picker.replace("%pickerContainer%", allSmiles).replace("%categories%", cats), document.body.insertAdjacentHTML("beforeend", picker);
            for (const cat of document.querySelectorAll(".twep-categories li")) cat.addEventListener("click", () => {
                this.go_to_emoji_cat(cat, cat.getAttribute("data-index"))
            });
            for (const cat_tit of document.querySelectorAll(".twep-container-title")) cat_waypoints[cat_tit.offsetTop - 112] = cat_tit.parentNode.getAttribute("category-name");
            let scroll_defer = false;
            document.querySelector(".twep-all-categories").addEventListener("scroll", (() => {
                scroll_defer && clearTimeout(scroll_defer), scroll_defer = setTimeout((() => {
                    this.cat_waypoints_check()
                }), 50)
            })), document.querySelector(".twep-search i").addEventListener("click", (e => {
                this.clear_search()
            }));
            for (const emoji of document.querySelectorAll(".twep-all-categories li")) emoji.addEventListener("click", () => {
                this.emoji_select(emoji)
            })
        }, this.generate_style = function () {
            document.head.insertAdjacentHTML("beforeend", `<style>.twep-trigger svg {fill: var(--text) !important;}.twep-trigger {filter: brightness(100%);transition: filter 200ms linear;}.twep-trigger:hover {filter: brightness(125%);}#twemoji-picker .twep-categories ul * {width: 30px; flex: 1;}#twemoji-picker {  background: var(--background) !important;}#twemoji-picker,#twemoji-picker * {  color: var(--light_text) !important;  border: none !important;  font-family: 'Minecraftia', 'Roboto', system-ui, sans-serif !important;}.twep-search input {  background: var(--darker_background) !important;border-radius: 6px !important;}.twep-search input::placeholder {color: var(--text);font-size: 12px;}.twep-grid>li,.twep-container-title {background: transparent !important;}\n.twep-el-wrap {\n    position: relative;\n}\n.twep-el-wrap > textarea,\n.twep-el-wrap > input {\n    padding-right: ${options.target_r_padding}px;\n}\n.twep-trigger {\n    display: inline-block;\n    position: absolute;\n    cursor: pointer;\n}\n.twep-trigger svg {\n    width: 100%;\n    height: 100%;\n    border-radius: 50%;\n    border: 2px solid transparent;\n    opacity: 0.8;\n    fill: #282828;\n    transition: all .15s ease;\n}\n.twep-trigger svg:hover {\n    fill: #202020;\n}\n#twemoji-picker,\n#twemoji-picker * {\n    box-sizing: border-box;\n}\n#twemoji-picker {\n    visibility: hidden;\n    z-index: -100;\n    opacity: 0;\n    position: absolute;\n    top: -9999px;\n    z-index: 999;\n    width: 280px;\n    min-height: 320px;\n    background: #fff;\n    box-shadow: 0px 2px 13px -2px rgba(0, 0, 0, 0.18);\n    border-radius: 6px;\n    overflow: hidden;\n    border: 1px solid #ccc;\n    transform: scale(0.85);\n    transition: opacity .2s ease, transform .2s ease;\n}\n#twemoji-picker.twep-shown {\n    visibility: visible;\n    z-index: 999;\n    transform: none;\n    opacity: 1;\n\n}\n#twemoji-picker .twep-all-categories {\n    height: 260px;\n    overflow-y: auto;\n    padding: 0 5px 20px 10px;\n}\n#twemoji-picker .twep-category:not(:first-child) {\n    margin-top: 22px;\n}\n#twemoji-picker .twep-container-title {\n    color: black;\n    margin: 10px 0;\n    text-indent: 10px;\n    font-size: 13px;\n    font-weight: bold;\n}\n#twemoji-picker * {\n    margin: 0;\n    padding: 0;\n    text-decoration: none;\n    color: #666;\n    font-family: sans-serif;\n    user-select: none;\n    -webkit-tap-highlight-color:  rgba(255, 255, 255, 0); \n}\n.twep ul {\n    list-style: none;\n    margin: 0;\n    padding: 0;\n}\n.twep-grid {\n    display: flex;\n    flex-wrap: wrap;\n}\n.twep-grid > li {\n    cursor: pointer;\n    flex: 0 0 calc(100% / 6);\n    max-width: calc(100% / 6);\n    height: 41px;\n    min-width: 0;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    background: #fff;\n    border-radius: 2px;\n    transition: all .2s ease;\n}\n.twep-grid > li:hover {\n    background: #99c9ef;\n}\nul.twep-hidden-emoji-cat,\n.twep-grid > li.twep-hidden-emoji {\n    display: none;\n}\n.twep-grid > li > a {\n    display: block;\n    font-size: 21px;\n    margin: 0;\n    padding: 22px 0px;\n    line-height: 0;\n}\n.twep-categories ul {\n    display: flex;\n    flex-wrap: wrap;\n    list-style: none;\n}\n.twep-categories li {\n    transition: all .3s ease;\n    flex: 0 0 calc(100% / 7);\n    display: flex;\n    max-width: calc(100% / 7);\n}\n.twep-categories li.twep-active {\n    box-shadow: 0 -3px 0 #48a6f0 inset;\n}\n.twep-categories a {\n    padding: 7px !important;\n    font-size: 19px;\n    height: 42px;\n    display: flex;\n    text-align: center;\n    justify-content: center;\n    align-items: center;\n    position: relative;\n    filter: grayscale(100%) contrast(150%);\n}\n.twep-categories a:before {\n    content: "";\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    background: rgba(255, 255, 255, .2);\n    cursor: pointer;\n    transition: background .25s ease;\n}\n.twep-categories li:not(.twep-active):hover a:before {\n    background: rgba(255, 255, 255, .4);\n}\n.twep-search {\n    position: relative;\n    border-top: 1px solid #ddd;\n    padding: 10px 6px !important;\n}\n.twep-search input {\n    width: 100%;\n    border: none;\n    padding: 8px 30px 8px 10px !important;\n    outline: none;\n    background: #fff;\n    font-size: 13px;\n    color: #616161;\n    border: 2px solid #ddd;\n    height: 30px;\n    border-radius: 25px; \n    user-select: auto !important;\n}\n.twep-search svg,\n.twep-search i {\n    width: 14px;\n    height: 14px;\n    position: absolute;\n    right: 16px;\n    top: 18px;\n    fill: #444;\n    cursor: pointer;\n}\n.twep-search i {\n    color: #444;\n    font-size: 22px;\n    font-family: arial;\n    line-height: 14px;\n    transition: opacity .15s ease;\n}\n.twep-search i:hover {\n    opacity: .8;\n}\n.twep-searching svg,\n.twep-search:not(.twep-searching) i {\n    display: none;\n}\n#twemoji-picker img.emoji {\n    width: 26px;\n    height: 26px;\n}\n#twemoji-picker .twep-no-results {\n\tfont-size: 90%;\n\tdisplay: block;\n\ttext-align: center;\n\tmargin-top: 1em;\n}\n</style>`)
        }, void this.init()) : console.error("You must provide a valid selector string first argument")
    };
    const maybe_querySelectorAll = selector => {
        if (typeof selector !== 'string') {
            if (selector instanceof Element) {
                return [selector];
            } else {
                let to_return = [];
                for (const obj of selector) obj instanceof Element && to_return.push(obj);
                return to_return
            }
        }
        return (selector.match(/(#[0-9][^\s:,]*)/g) || []).forEach((function (n) {
            selector = selector.replace(n, '[id="' + n.replace("#", "") + '"]')
        })), document.querySelectorAll(selector)
    }
}());