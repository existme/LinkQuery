if (isNaN(chrome.reza)) {
    chrome.reza = 0;
}
if (typeof String.prototype.startsWith !== 'function') {
    // see below for better implementation!
    String.prototype.startsWith = function (str) {
        'use strict';
        return this.indexOf(str) === 0;
    };
}
if ((typeof (String.prototype.trim)) === "undefined") {
    String.prototype.trim = function () {
        'use strict';
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    doNotify("progress", message.greeting, message.progress);
});
//noinspection JSUnresolvedFunction
chrome.manifest = chrome.app.getDetails();
chrome.runtime.onInstalled.addListener(function (details) {
    'use strict';
    console.log('previousVersion', details.previousVersion);
    chrome.tabs.query({}, function (tabs) {
        //noinspection JSUnresolvedVariable
        var scripts = chrome.manifest.content_scripts[0].js,
            i,
            tab;

        //console.log(scripts);
        for (i = 0; i < tabs.length; i++) {
            tab = tabs[i];
            if (!tab.url.startsWith("chrome:") && tab.url.startsWith('https://vk.com')) {
                chrome.tabs.executeScript(tab.id, {file: "scripts/content.js", runAt: "document_start"}, function () {
                });
            }
        }
    });
});

//function callback() {
//  console.log(chrome.runtime.lastError);
//}
//chrome.browserAction.setBadgeText({text: chrome.reza.toString()});

console.log('background.js loaded !!');

function exec(codeInst) {
    'use strict';
    chrome.tabs.executeScript(null, {code: codeInst});
}

//noinspection JSUnusedLocalSymbols
chrome.tabs.onUpdated.addListener(function (id, info, tab) {
    that = this;
    console.log("LOADED!");
    //console.log(JSON.stringify(id));
    //alert("REZA");

    //chrome.pageAction.show(id);
    var url = tab.url;
    that.sites.profiles.forEach(function (site) {
        if (url.startsWith(site.base_url)) {
            that.site = site;
            console.warn("LinkQuery: using [" + site.siteName + "] profile");
            console.warn("Test Working");
            chrome.pageAction.show(id);
        }
    });

});

/**
 * When user clicks on the page LinkQuery icon. The page
 * Processing starts
 */
chrome.pageAction.onClicked.addListener(function (tab) {
    chrome.reza = chrome.reza + 1;
    chrome.tabs.sendMessage(tab.id, {"message": "hide", "id": chrome.reza}, null,
        function () {
            console.log("response " + chrome.reza.toString());
            //chrome.pageAction.setBadgeText("R" + chrome.reza.toString(), tab.id);
        });
});

//chrome.browserAction.onClicked.addListener(function (tab) {
//    chrome.reza = chrome.reza + 1;
//    chrome.tabs.sendMessage(tab.id, {"message": "hide", "id": chrome.reza}, null,
//        function () {
//            console.log("response " + chrome.reza.toString());
//            chrome.browserAction.setBadgeText({text: "R" + chrome.reza.toString()});
//        });
//});