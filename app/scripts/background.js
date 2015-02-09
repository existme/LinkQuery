'use strict';
if (isNaN(chrome.reza)) chrome.reza = 0;
if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str) {
    return this.indexOf(str) == 0;
  };
}
if (typeof(String.prototype.trim) === "undefined") {
  String.prototype.trim = function () {
    return String(this).replace(/^\s+|\s+$/g, '');
  };
}
chrome.manifest = chrome.app.getDetails();
chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
  chrome.tabs.query({}, function (tabs) {
    var scripts = chrome.manifest.content_scripts[0].js;
    console.log(scripts);
    for (var i = 0; i < tabs.length; i++) {
      //  //chrome.tabs.sendRequest(tabs[i].id, { action: "xxx" });
      var tab = tabs[i];
      if (!tab.url.startsWith("chrome:") && tab.url.startsWith('https://vk.com')) {
        //chrome.tabs.executeScript(tab.id, {file: "scripts/jquery-2.1.3.js"}, function () {
        //});
        chrome.tabs.executeScript(tab.id, {file: "scripts/content.js", runAt: "document_start"}, function () {
        });
      }
      //chrome.tabs.sendMessage(tab.id, {action: "reza"});
      //  console.log('iterating:' + JSON.stringify(tab.title));
    }
    //console.log(tabs[0]);/
  });
});
//function callback() {
//  console.log(chrome.runtime.lastError);
//}
//chrome.browserAction.setBadgeText({text: chrome.reza.toString()});

console.log('background.js loaded');

chrome.browserAction.onClicked.addListener(function (tab) {
  //chrome.tabs.executeScript(null, {code: "document.body.bgColor='red'"});
  //exec("$('body').css('background-color', 'red')");
  //$('body').css('background-color', 'red');
  chrome.tabs.executeScript(null, {"file": "scripts/jquery-2.1.3.js"},
    function () {
      chrome.reza = chrome.reza + 1;
      chrome.tabs.sendMessage(tab.id, {"message": "hide", "id": chrome.reza}
        , null,
        function () {
          console.log("response " + chrome.reza.toString());
          chrome.browserAction.setBadgeText({text: "R" + chrome.reza.toString()});
        });
    });

  //doNotify('progress', "Now setted");
//console.log('reza');
})
;

function exec(codeInst) {
  chrome.tabs.executeScript(null, {code: codeInst});
}
//window.addEventListener('load', function (evt) {
//  //doNotify('progress');
//});

chrome.tabs.onUpdated.addListener(function (id, info, tab) {
  console.log("LOADED");
  console.log(JSON.stringify(id));

  //if (tab.url != "chrome://extensions/") {
  //  chrome.tabs.executeScript({
  //    code: 'console.log(\'##Loaded:' + JSON.stringify(tab.url) + '\')'
  //  });
  //}
  //var notification = new Notification('Notification title', {
  //  body: "Hey there! You've been notified!"
  //});
  //chrome.pageAction.show(tab.id);

  //if (tab.url.toLowerCase().indexOf("facebook.com") > -1) {
  //  chrome.pageAction.show(tab.id);
  //  +
  //    +chrome.storage.sync.get("be_a_buzzkill", function (data) {
  //      +
  //      if (data["be_a_buzzkill"] && tab.url.toLowerCase().indexOf("facebook.com/buzzfeed") !== -1) {
  //        +chrome.tabs.update(tab.id, {url: "http://www.facebook.com/?no-buzzfeed-for-you!"});
  //        +
  //      }
  //      +
  //    });
  //}
});