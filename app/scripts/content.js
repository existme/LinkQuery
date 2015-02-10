/**
 * Created by Reza on 2/2/2015.
 */
'use strict';

var _current_url = document.URL;

var extractor = function (url, sites) {

  this.doc_url = url;
  this.site = null;
  var that = this;
  sites.profiles.forEach(function (site) {
    if (that.site == null && url.startsWith(site.base_url)) {
      that.site = site;
      console.warn("LinkQuery: using [" + site.siteName + "] profile");
    }
  });

  if (!this.site) {
    return;
  }

  this.color1 = "rgb(255, 0, 0)";
  this.color2 = "rgb(155, 155, 55)";

  this.MOUSE_VISITED_CLASSNAME = 'crx_mouse_visited';
  this.prevDOM = null;
  this.prevAnchor = null;
  this.prevHRef = null;
  this.mouseIn = null;
  this.popUpTimeout = null;

  chrome.runtime.onMessage.addListener(this.message_loop);
  addEventListener('load', function () {
    console.log("LinkQuery: " + document.URL + " Loaded.");
  });

  addEventListener('mousemove', this.on_mousemove(this), false);
};

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

    // hitTest all siteRules for current profile
    if (that.prevDOM == null || !srcElement.isSameNode(that.prevDOM)) {
      for (var i = 0; i < that.site.rules.length; i++) {
        var rule = that.site.rules[i];
        anchor = extractor.findAnchorElement(srcElement, rule);
        if (anchor != null) {
          siteRule = rule;
          break;
        }
      }

      if (anchor != null) {
        var hRef = anchor.attr('href');
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

extractor.prototype.message_loop = function (msg, sender, sendResponse) {
  if (msg.message == 'hide') {
    var color = $("body").css("background-color");
    console.log(color.toString());
    if (color.toString() === this.color1)
      $("body").css("background-color", this.color2);
    else
      $("body").css("background-color", this.color1);
  }
  console.log(msg, sender);
  //alert(sender);
  sendResponse();
};

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
      result.content = result.content + key + " : " + out + "<br>";
    }
  }

  return result;
};

/**
 * This function will extract information from retrieved html based on the url of the page.
 *
 * @param content   the html content of the new page
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
 * @param href      The hyperlink
 */
extractor.prototype.doMouseIn = function (anchor, href, siteRule) {
  var that = this;
  this.mouseIn = true;
  this.popUpTimeout = setTimeout(function () {
    href = anchor.attr('href');
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
        classes: 'qtip-shadow qtip-rounded qtip-dark'
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
