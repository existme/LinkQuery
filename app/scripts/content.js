/**
 * Created by Reza on 2/2/2015.
 */
'use strict';

var _current_url = document.URL;

var extractor = function (url) {
  this.doc_url = url;

  if (!url.startsWith('https://vk.com')) {
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
    console.log("REZA");
    console.warn(document.URL);
  });

  //todo: add the above section to the hover only for anchor elements
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
    //console.log(srcElement, "*", prevDOM);
    if (that.prevDOM == null || !srcElement.isSameNode(that.prevDOM)) {
      var anchor = extractor.findAnchorElement(srcElement);
      if (anchor != null) {
        var hRef = anchor.attr('href');
        // Mouse In
        if (that.prevHRef != hRef) {
          //console.log(srcElement, "*", prevDOM);
          that.doMouseOut();
          that.doMouseIn(anchor, hRef);
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
extractor.prototype.extractDataObject = function (ajaxPage) {
  var result = {};
  result.title = ajaxPage.filter('title').text();
  var vids = ajaxPage.find('#profile_videos a .p_header_bottom');
  result.valid = vids.length;

  if (!result.valid) return result;
  result["number of videos: "] = vids.length != 0 ? vids.text() : '';
  return result;
};

/**
 * This function will extract information from retrieved html based on the url of the page.
 *
 * @param content   the html content of the new page
 * @param api       tooltip api use it like api.set('content.text','custom status');
 */
extractor.prototype.extractData = function (content, api) {
  var jq = $($.parseHTML(content));
  var result = this.extractDataObject(jq);
  api.set('content.title', result.title);
  if (result.valid) {
    api.set('content.text', result["number of videos: "]);
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
extractor.prototype.doMouseIn = function (anchor, href) {
  var that = this;
  this.mouseIn = true;
  //anchor.addClass(this.MOUSE_VISITED_CLASSNAME);
  //popUpTimeout = setTimeout(function () {
  //  //console.log(href);
  //  anchor.css("background-color", "rgba(255, 255, 44, 0.3)");
  //
  //  var popup = $('#gdx-bubble-main');
  //  popup.css("display", "none");
  //  console.log(popup);
  //  $.get(href, function (data) {
  //    var jq = $($.parseHTML(data));
  //    //$('h1 span').text()
  //    var res = jq.find('#profile_videos a .p_header_bottom');
  //    console.log(href + " : " + res.text());
  //  });
  //}, 1000);
  this.popUpTimeout = setTimeout(function () {
    //anchor.css("background-color", "rgba(255, 255, 44, 0.3)");
    href = anchor.attr('href');
    anchor.qtip({
      overwrite: false,
      content: function (event, api) {
        // Remove protocol from the entry (if exists) to avoid mixed content blocking
        // href = href.replace(/.*?:\/\//g, "");
        $.ajax({
          url: href, // Use href to fetch new page
          cache: true
        }).then(function (content) {
          that.extractData(content, api);
        }, function (xhr, status, error) {
          // Upon failure... set the tooltip content to the status and error value
          api.set('content.text', status + ': ' + error);
        });
        return 'Loading...';
      },
      show: {
        delay: 1000,
        solo: false,
        hide: false
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
  this.prevAnchor = anchor;
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
  if (this.prevAnchor != null) {
    this.prevAnchor.removeClass(this.MOUSE_VISITED_CLASSNAME);
  }
  this.prevAnchor = null;
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
extractor.findAnchorElement = function (srcElement) {
  var jqueryE = $(srcElement);
  var anchorE = null;
  if (jqueryE.is("a")) {
    anchorE = jqueryE;
  }
  /* if the current ellement is inside an anchor, find it */
  else if (jqueryE.parents("a").length == 1) {
    anchorE = jqueryE.parents("a").first();
  }
  if (anchorE != null && ( (anchorE.closest('.friends_bigph_wrap, .friends_field, .wk_likes_liker_row.inl_bl, .fl_l.mv_thumb, .reply_image, .post_image').length > 0) || anchorE.hasClass('like_tt_usr') || anchorE.prev().hasClass('fl_r reply_actions_wrap')))
    return anchorE;
  return null;
};

var x = new extractor(_current_url);