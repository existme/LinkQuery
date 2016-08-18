/**
 * Created by Reza on 2/9/2015.
 */
// TODO : Add another site config here
'use strict';

var SiteProfiles = function () {
  this.profiles = [];
};
SiteProfiles.prototype.addSite = function (siteProfile) {
  this.profiles.push(siteProfile);
};
var SiteProfile = function (siteName, url) {
  this.rules = [];
  this.siteName = siteName;
  this.base_url = url;
  this.replaceUrl = [];
};

SiteProfile.prototype.addRule = function (siteRule) {
  this.rules.push(siteRule);
};

var SiteRule = function (siteProfile, ruleName, theme) {
  this.ruleName = ruleName;
  this.siteProfile = siteProfile;
  this.theme = theme;
};


//SiteRule
//
//sp_vk.prototype.closest;
//  filterlist
//sp_vk.prototype.hasClass;
//  filterlist
//sp_vk.prototype.prevHasClass;
//  filterlist

//SiteRuleData
//  rule
//  data
//    title
//    filter
var sites = new SiteProfiles();
var vk_pr = new SiteProfile("VK", "https://vk.com");

vk_pr.replaceUrl.push("http://vkontakte.ru");
vk_pr.replaceUrl.push("http://vk.com");

var vk_pr_people = new SiteRule(vk_pr, "People-Rules", "qtip-dark");

vk_pr_people.closest = ".feed_friend_image, .feed_friend_name, .explain, .friends_bigph_wrap, .friends_field," +
    " .wk_likes_liker_row.inl_bl, .fl_l.mv_thumb, .reply_image, .people_cell, .name, .mem_link";
vk_pr_people.hasClass = ".right_list_title,.friends_common_thumb,.fans_fan_ph";
vk_pr_people.prevHasClass = "fl_r reply_actions_wrap ";

vk_pr_people.ruleData = {
    "Number of videos": ["#profile_videos a .header_count", "text","color:red"],
    "Status:": ["#friend_status span","text","color:yellow"],
    "fans:":[".counts_module a[href^='#'] .count","text","color:green"]
};

var vk_pr_pages = new SiteRule(vk_pr, "Pages-Rules", "qtip-blue");
vk_pr_pages.closest = ".video_row_info_author, .group_row_labeled, .group_row_photo, #mv_descr_field, .group_name, .fans_idol_name, .group_share, .mv_info_block.fl_l, .post_image";
vk_pr_pages.hasClass = ".page_group_name,.fans_idol_lnk";
vk_pr_pages.prevHasClass = "REZA";

vk_pr_pages.ruleData = {
  "Profile # of videos": ["#profile_videos a .header_count", "text","color:red"],
  // This is twice checked and if the second one exist will override the first one
  "Page # of videos": ["#group_videos .header_count", "text","color:red"],
  "Page # of videos": [".video_module .header_count", "text","color:red"],
  "Page # of photos": [".photos_module .header_count", "text","color:orange"],
  "Status": ["#join_button", "bool", "subscribe to this page","color:yellow"],
  "Private community": [".group_like_enter_desc", "text","color:purple"],
  "Subscription": ["#page_actions .page_actions_info", "text","color:black"],
  "info": [".page_current_info", "text","color:gray"],
  "Description": [".page_description", "text","color:gray"],
  // This is twice checked and if the second one exist will override the first one
  "URL":[".wall_fixed .post_image","href","href","color:black"],
  "URL":["#page_wall_posts .post_image","href","href","color:black"]
};

vk_pr.addRule(vk_pr_people);
vk_pr.addRule(vk_pr_pages);
sites.addSite(vk_pr);
///asd