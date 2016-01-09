/**
 * Created by Reza on 2/2/2015.
 * TODO: check for other problems
 */
'use strict';
if (typeof String.prototype.startsWith !== 'function') {
    // see below for better implementation!
    String.prototype.startsWith = function (str) {
        return this.indexOf(str) === 0;
    };
}
if ((typeof (String.prototype.trim)) === "undefined") {
    String.prototype.trim = function () {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

var _current_url = document.URL;
var doNotify = false;

var extractor = function (url, sites) {
    this.getProperties();
    this.doc_url = url;
    this.site = null;
    var that = this;
    sites.profiles.forEach(function (site) {
        if (that.site === null && url.startsWith(site.base_url)) {
            that.site = site;
            console.warn("LinkQuery: using [" + site.siteName + "] profile");
            console.warn("Test Working");
        }
    });

    if (!this.site) return;

    this.MOUSE_VISITED_CLASSNAME = 'crx_mouse_visited';
    this.prevDOM = null;
    this.prevAnchor = null;
    this.prevHRef = null;
    this.mouseIn = null;
    this.popUpTimeout = null;

    function onMLoop(msg, sender, sendResponse) {
        that.message_loop(msg, sender, sendResponse, false);
    }

    chrome.runtime.onMessage.addListener(onMLoop);

    addEventListener('load', function () {
        console.log("LinkQuery: " + document.URL + " Loaded.");
    });

    addEventListener('mousemove', this.on_mousemove(this), false);
};

extractor.prototype.getProperties = function () {
    var that = this;
    chrome.storage.sync.get({doNotify: false}, function (e) {
        that.doNotify = e.doNotify;
    })
};
/**
 * Examines each site rule and finds the one that applies to
 * elementToCheck. Will return both the anchor and the rule
 *
 * @param siteRules         An array containing all available rules
 * @param elementToCheck    The element that is going to be checked against rules
 * @returns {{anchor: *, siteRule: *}}     Returns an object containing matched
 *                                          rule and the corresponding anchor
 */
extractor.prototype.findRuleAndAnchor = function (siteRules, elementToCheck) {
    var siteRule = null, anchor = null;
    if (siteRules == null)
        return {anchor: null, siteRule: null};

    for (var i = 0; i < siteRules.length; i++) {
        var rule = siteRules[i];
        anchor = extractor.findAnchorElement(elementToCheck, rule);
        if (anchor != null) {
            siteRule = rule;
            break;
        }
    }
    return {anchor: anchor, siteRule: siteRule};
}

//    ____          __  __                        __  __
//   / __ \        |  \/  |                      |  \/  |
//  | |  | |_ __   | \  / | ___  _   _ ___  ___  | \  / | _____   _____
//  | |  | | '_ \  | |\/| |/ _ \| | | / __|/ _ \ | |\/| |/ _ \ \ / / _ \
//  | |__| | | | | | |  | | (_) | |_| \__ \  __/ | |  | | (_) \ V /  __/
//   \____/|_| |_| |_|  |_|\___/ \__,_|___/\___| |_|  |_|\___/ \_/ \___|
//
//
extractor.prototype.on_mousemove = function (scope) {
    return function (e) {
        var that = scope;
        var srcElement = e.srcElement;
        var anchor = null, siteRule = null;

        // hitTest all siteRules for current profile;
        if (that.prevDOM == null || !srcElement.isSameNode(that.prevDOM)) {
            var ret = that.findRuleAndAnchor(that.site.rules, srcElement);
            anchor = ret.anchor;
            siteRule = ret.siteRule;
            if (anchor != null) {
                var hRef = anchor.attr('href');

                // Replace illegal addresses with base address
                var matched = false;
                if (hRef == null) {
                    console.log("startsWith not defined.")
                }

                that.site.replaceUrl.forEach(function (url) {
                    if (!matched && hRef.startsWith(url)) {
                        hRef = hRef.replace(url, that.site.base_url);
                        matched = true;
                    }
                });

                // Mouse In
                if (that.prevHRef != hRef) {
                    console.log("Using rule [" + siteRule.ruleName + "]");
                    //console.log(srcElement, "*", prevDOM);
                    that.doMouseOut();
                    that.doMouseIn(anchor, hRef, siteRule);
                }
                // Mouse Out
            }
            else {
                that.doMouseOut();
            }
        }
        that.prevDOM = srcElement;
    }
};

//   __  __                               _
//  |  \/  | ___ ___ ___  __ _  __ _  ___| |    ___   ___  _ __
//  | |\/| |/ _ \ __/ __|/ _` |/ _` |/ _ \ |   / _ \ / _ \| '_ \
//  | |  | |  __\__ \__ \ (_| | (_| |  __/ |___ (_) | (_) | |_) |
//  |_|  |_|\___|___/___/\__,_|\__, |\___|_____\___/ \___/| .__/
//                             |___/                      |_|
extractor.prototype.message_loop = function (msg, sender, sendResponse) {

    var extractorObj = this;
    //extractorObject.endBatchProcess = 0;
    if (msg.message == 'hide') {
        //extractorObj.getProperties();
        chrome.extension.sendMessage({
            greeting: "Processing links ...",
            progress: 0
        }, null);

        var inc = 0;

        var links = new Array;
        // info:
        // Start processing elements which has specific classes
        $(".feed_friend_name,.explain,.feed_explain_list,.friends_field,.fans_idol_name,.people_results").find('a[href]').each(
            function (index) {
                var anchorElement = this;
                var findRes = extractorObj.findRuleAndAnchor(extractorObj.site.rules, anchorElement);
                if ((findRes != null && findRes.siteRule != null) && (inc < 300)) {
                    links.push({anchorElement: anchorElement, findRes: findRes})
                    inc++;
                }
            }
        );
        var max = links.length;
        for (var index = 0; index < max; index++) {
            setTimeout(extractorObj.ProcessHTMLLink, index * 3000, extractorObj, links[index].findRes, links[index].anchorElement, index + 1, max);
        }
    }
    console.log(msg, sender);
    //alert(sender);
    sendResponse();
};

/**
 * Fetch and process the link. Set proper information on the element.
 * Show notification about the progress.
 *
 * @param extractorObject
 * @param ret
 * @param anchoreElement
 * @constructor
 */
extractor.prototype.ProcessHTMLLink = function (extractorObject, ret, anchoreElement, progress, max) {
    var href = $(anchoreElement).attr('href');
    $.ajax({
        url: href, // Use href to fetch new page
        cache: true
    }).then(function (content) {
        chrome.extension.sendMessage({
            greeting: "Process item " + progress.toString() + "/" + max.toString(),
            progress: Math.floor(100 * progress / max)
        }, null);

        var jq = $($.parseHTML(content));
        var result = extractorObject.extractDataObject(jq, ret.siteRule);
        console.warn(anchoreElement);
        if (result.valid) {
            $(anchoreElement).append("<br><p style='color:red'>" + result.content + "</p>");
            $(anchoreElement).parents('.fans_idol_row').append("<p style='color:red'>" + result.content + "</p>");
        }
        else {
            $(anchoreElement).append("<br><p style='color:red'> *na* </p>");
            $(anchoreElement).parents('.fans_idol_row').append("<p style='color:red'> *na* </p>");
        }
    }, function (xhr, status, error) {
        // Upon failure... set the tooltip content to the status and error value
        console.log("Error");
    });
}

//             _                  _   _____        _         ____  _     _           _
//            | |                | | |  __ \      | |       / __ \| |   (_)         | |
//    _____  __ |_ _ __ __ _  ___| |_| |  | | __ _| |_ __ _| |  | | |__  _  ___  ___| |_
//   / _ \ \/ / __| '__/ _` |/ __| __| |  | |/ _` | __/ _` | |  | | '_ \| |/ _ \/ __| __|
//  |  __/>  <| |_| | | (_| | (__| |_| |__| | (_| | |_ (_| | |__| | |_) | |  __/ (__| |_
//   \___/_/\_\\__|_|  \__,_|\___|\__|_____/ \__,_|\__\__,_|\____/|_.__/| |\___|\___|\__|
//                                                                     _/ |
//                                                                    |__/

/**
 * the result object contains two static fields ('valid') and ('title') and a bunch
 * of dynamic fields which are constructed based on the context.
 *
 * @param ajaxPage
 * @param siteRule
 * @returns {*}
 */
extractor.prototype.extractDataObject = function (ajaxPage, siteRule) {
    var result = {};
    result.content = "";
    result.title = ajaxPage.filter('title').text();
    result.valid = false;

    for (var key in siteRule.ruleData) {
        var val = siteRule.ruleData[key];
        var res = ajaxPage.find(val[0]);
        var style = val[2];
        if (res.length > 0) {
            result.valid = true;
            var out = "";
            switch (val[1]) {
                case "text":
                    out = res.text();
                    break;
                case "bool":
                    out = val[2];
                    break;
            }
            if(style) {
                result.content = result.content + "<span style='"+style+"'>"+key + " : " + out + "</span><br>";
            }
            else{
                result.content = result.content + key + " : " + out + "<br>";
            }
        }
    }

    return result;
};

/**
 * This function will extract information from retrieved html based on the url of the page.
 *
 * @param content   the html content of the new page
 * @param siteRule
 * @param api       tooltip api use it like api.set('content.text','custom status');
 */
extractor.prototype.extractData = function (content, api, siteRule) {
    var jq = $($.parseHTML(content));
    var result = this.extractDataObject(jq, siteRule);
    api.set('content.title', result.title);
    if (result.valid) {
        api.set('content.text', result.content);
    }
    else {
        api.set('content.text', 'The desired information does not exists on this page.');
    }
};


//   _____        __  __                      _____
//  |  __ \      |  \/  |                    |_   _|
//  | |  | | ___ | \  / | ___  _   _ ___  ___  | |  _ __
//  | |  | |/ _ \| |\/| |/ _ \| | | / __|/ _ \ | | | '_ \
//  | |__| | (_) | |  | | (_) | |_| \__ \  __/_| |_| | | |
//  |_____/ \___/|_|  |_|\___/ \__,_|___/\___|_____|_| |_|
//
//

/**
 *
 * @param anchor    An anchor jQuery element
 * @param siteRule
 * @param href      The hyperlink
 */
extractor.prototype.doMouseIn = function (anchor, href, siteRule) {
    var that = this;
    this.mouseIn = true;
    this.popUpTimeout = setTimeout(function () {
        //href = anchor.attr('href');
        anchor.qtip({
            overwrite: false,
            content: function (event, api) {
                $.ajax({
                    url: href, // Use href to fetch new page
                    cache: true
                }).then(function (content) {
                    that.extractData(content, api, siteRule);
                }, function (xhr, status, error) {
                    // Upon failure... set the tooltip content to the status and error value
                    api.set('content.text', status + ': ' + error);
                });
                return 'Loading...';
            },
            show: {
                delay: 1000
            },
            style: {
                classes: 'qtip-shadow qtip-rounded ' + siteRule.theme
            },
            ready: true
        });
        var api = anchor.qtip('api');
        api.show();
    }, 500);

    this.prevHRef = href;
    // this.prevAnchor = anchor;
};


//       _       __  __                       ____        _
//      | |     |  \/  |                     / __ \      | |
//    __| | ___ | \  / | ___  _   _ ___  ___| |  | |_   _| |_
//   / _` |/ _ \| |\/| |/ _ \| | | / __|/ _ \ |  | | | | | __|
//  | (_| | (_) | |  | | (_) | |_| \__ \  __/ |__| | |_| | |_
//   \__,_|\___/|_|  |_|\___/ \__,_|___/\___|\____/ \__,_|\__|
//


extractor.prototype.doMouseOut = function () {
    if (!this.mouseIn) return;

    clearTimeout(this.popUpTimeout);
    //console.log("****** Mouse Out *******");
    //if (this.prevAnchor != null) {
    //  this.prevAnchor.removeClass(this.MOUSE_VISITED_CLASSNAME);
    //}
    // this.prevAnchor = null;
    this.prevHRef = null;
    this.mouseIn = false;
};

//    __ _           _                     _                ______ _                           _
//   / _(_)         | |   /\              | |              |  ____| |                         | |
//  | |_ _ _ __   __| |  /  \   _ __   ___| |__   ___  _ __| |__  | | ___ _ __ ___   ___ _ __ | |_
//  |  _| | '_ \ / _` | / /\ \ | '_ \ / __| '_ \ / _ \| '__|  __| | |/ _ \ '_ ` _ \ / _ \ '_ \| __|
//  | | | | | | | (_| |/ ____ \| | | | (__| | | | (_) | |  | |____| |  __/ | | | | |  __/ | | | |_
//  |_| |_|_| |_|\__,_/_/    \_\_| |_|\___|_| |_|\___/|_|  |______|_|\___|_| |_| |_|\___|_| |_|\__|
//
//

/**
 * Finds and returns the anchor element related to the srcElement
 * @param srcElement    the dom element to be analyzed
 * @param siteRule
 * @returns {*}         an anchor jquery object/null
 */
extractor.findAnchorElement = function (srcElement, siteRule) {
    var jqueryE = $(srcElement);
    var anchorE = null;
    if (jqueryE.is("a")) {
        anchorE = jqueryE;
    }
    /* if the current element is inside an anchor, find it */
    else if (jqueryE.parents("a").length == 1) {
        anchorE = jqueryE.parents("a").first();
    }
    if (anchorE != null && (
        (anchorE.closest(siteRule.closest).length > 0) || anchorE.is(siteRule.hasClass) || anchorE.prev().hasClass(siteRule.prevHasClass)))
        return anchorE;
    return null;
};

var x = new extractor(_current_url, sites);
