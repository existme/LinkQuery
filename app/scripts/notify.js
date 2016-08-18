/**
 * Created by Reza on 2/1/2015.
 */
// Declare a variable to generate unique notification IDs
var notID = null;
var bgPage = chrome.extension.getBackgroundPage();
var ignoreNotificationClicks = false;
//bgPage.$window.open();

// partial URLs to the images used in the example
var asURLs = [
    "/images/niceAnimatedTriangles.gif",
    "/images/Preloader_3_128.gif"
];

function creationCallback(notID) {
    setTimeout(function () {
        chrome.notifications.clear(notID, function (wasCleared) {
            return false;
        });
    }, 40000);


}

// Event handlers for the various notification events
function notificationClosed(notID, bByUser) {
    //notificationBtnClick(null, null);
}

function log(msg) {
    bgPage.console.log(msg);
    console.log(msg);
}
function notificationClicked(notID) {
    log("The notification '" + notID + "' was clicked");
}

function notificationBtnClick(notID, iBtn) {
    alert("closed");
    if (!ignoreNotificationClicks) {
        log("Terminating...");
        for (var i = 0; i < timeouts.length; i++) {
            clearTimeout(timeouts[i]);
        }
        timeouts = [];
        log("Batch Process Terminated");
    }
    ignoreNotificationClicks = true;
    setTimeout(function () {
        ignoreNotificationClicks = false
    }, 500);
    alert("terminated");
}

// List of sample notifications. These are further customized
// in the code according the UI settings.
var notOptions = [
    {
        type: "progress",
        title: "Processing...",
        message: "",
        progress: 90,
        priority: 2,
        iconUrl: chrome.runtime.getURL(asURLs[1]),
        buttons: [
            {title: "Hide Notifications"}
        ]
    }
];

// Window initialization code. Set up the various event handlers
window.addEventListener("load", function () {
    // set up the event listeners
    //chrome.notifications.onClosed.addListener(notificationClosed);
    //chrome.notifications.onClicked.addListener(notificationClicked);
    chrome.notifications.onButtonClicked.addListener(notificationBtnClick);
});

// Create the notification with the given parameters as they are set in the UI
function doNotify(evt, str, progress) {
    chrome.storage.sync.get({doNotify: false}, function (e) {
        if (e.doNotify == true) {
            var options = notOptions[0];
            options.progress = progress;
            options.title = str;
            chrome.notifications.create("id" + notID, options, creationCallback);
        }
    });
};
