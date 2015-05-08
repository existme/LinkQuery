'use strict';

function save_options() {

    var doNotify = document.getElementById('notify').checked;
    chrome.storage.sync.set({
        doNotify: doNotify
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        doNotify: false
    }, function (items) {
        document.getElementById('notify').checked = items.doNotify;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);