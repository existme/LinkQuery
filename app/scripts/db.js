/**
 * Created by Reza on 5/21/2016.
 */
'use strict';

var SiteDb = function () {
    this.db = null;
    this.dbName = "cache";
    this.version = 1;
    console.log("Database script started.");
    this.data = null;
    //indexedDB.deleteDatabase(this.dbName);
}

//   _____                       _   _                 _ _
//  | ____|_ __ _ __ ___  _ __  | | | | __ _ _ __   __| | | ___ _ __
//  |  _| | '__| '__/ _ \| '__| | |_| |/ _` | '_ \ / _` | |/ _ \ '__|
//  | |___| |  | | | (_) | |    |  _  | (_| | | | | (_| | |  __/ |
//  |_____|_|  |_|  \___/|_|    |_| |_|\__,_|_| |_|\__,_|_|\___|_|
//
SiteDb.prototype.dbErrorHandler = function (e) {
    console.dir(e);
    var msg;
    if (e.target && e.target.error)
        e = e.target.error;
    if (e.message)
        msg = e.message;
    else if (e.name)
        msg = e.name;
    else if (e.code)
        msg = "Code " + e.code;
    else
        msg = e.toString();
    //alert('Error: ' + msg);
}

//    ____                _         ____        _        _
//   / ___|_ __ ___  __ _| |_ ___  |  _ \  __ _| |_ __ _| |__   __ _ ___  ___
//  | |   | '__/ _ \/ _` | __/ _ \ | | | |/ _` | __/ _` | '_ \ / _` / __|/ _ \
//  | |___| | |  __/ (_| | |_  __/ | |_| | (_| | |_ (_| | |_) | (_| \__ \  __/
//   \____|_|  \___|\__,_|\__\___| |____/ \__,_|\__\__,_|_.__/ \__,_|___/\___|
//
SiteDb.prototype.createOpenDb = function () {
    console.log("creating db");
    var request = indexedDB.open(this.dbName, this.version);
    var that = this;
    request.onsuccess = function (event) {
        that.db = request.result;
        that.db.onerror = SiteDb.prototype.dbErrorHandler;
        console.log('Database opened', that.db);
        that.dbOpenComplete();
    }

    request.onerror = SiteDb.prototype.dbErrorHandler;
    request.onupgradeneeded = function (event) {
        that.db = event.target.result;
        //indexedDB.deleteDatabase(that.dbName);
        var store = that.db.createObjectStore("pages", {autoIncrement: true});
        store.createIndex("href-index", "href", {unique: false});
        console.log("Databse (re)created!");
        store.transaction.oncomplete = function (event) {
            that.dbOpenComplete();
        }
    };

}

SiteDb.prototype.dbOpenComplete = function () {
    var that = this;
    this.getAllItems(function (items) {
        that.data = items;
        //console.log(items);
    })
}

SiteDb.prototype.getAllItems = function (callback) {
    var trans = this.db.transaction("pages");
    var store = trans.objectStore("pages");
    var items = new Object();

    trans.oncomplete = function (evt) {
        callback(items);
    };

    var cursorRequest = store.openCursor();

    cursorRequest.onerror = function (error) {
        console.log(error);
    };

    cursorRequest.onsuccess = function (evt) {
        var cursor = evt.target.result;
        if (cursor) {
            items[cursor.value.href] = cursor.value;
            cursor.continue();
        }
    };
}

SiteDb.prototype.addRecord = function (href, intVal, strVal, titleText, joined) {

    var that = this;
    var now = new Date();
    var obj = {
        href: href,
        val: intVal,
        txt: strVal,
        joined: joined,
        title: titleText,
        date: now
    };
    console.log("Adding obj to db:", obj);
    this.data[href] = obj;
    var objectStore = this.db.transaction("pages", "readwrite").objectStore("pages");
    var deleteRequest = objectStore.delete(href);
    deleteRequest.onsuccess = function () {
        var putRequest = that.db.transaction("pages", "readwrite").objectStore("pages").put(obj, href);
    }
    deleteRequest.onerror = function (e) {
        console.log("delete failed for", href, e)
    }

}

SiteDb.prototype.findByHRef = function (href) {
    return this.data[href];
}