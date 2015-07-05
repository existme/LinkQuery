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
vk_pr_people.hasClass = ".like_tt_usr, .fans_fan_ph, .fans_fan_lnk";
vk_pr_people.prevHasClass = "fl_r reply_actions_wrap ";

vk_pr_people.ruleData = {
    "Number of videos": ["#profile_videos a .p_header_bottom", "text","color:red"],
    "Status:": ["#friend_status .profile_frdd_wrap","text","color:yellow"],
    "fans:":[".fans .fl_r","text","color:blue"]
};

var vk_pr_pages = new SiteRule(vk_pr, "Pages-Rules", "qtip-blue");
vk_pr_pages.closest = ".video_row_info_author, .group_row_labeled, .group_row_photo, #mv_descr_field, .group_name, .fans_idol_name, .group_share, .mv_info_block.fl_l, .post_image";
vk_pr_pages.hasClass = "#profile_idols div a, .fans_idol_ph, .author";
vk_pr_pages.prevHasClass = "REZA";

vk_pr_pages.ruleData = {
  "Profile # of videos": ["#profile_videos a .p_header_bottom", "text"],
  "Page # of videos": ["#group_videos a .p_header_bottom, #public_videos a .p_header_bottom", "text"],
  "Status": ["#subscribe:not(.unshown)", "bool", "subscribe to this page"],
  "Private community": [".group_like_enter_desc", "text"],
  "Summary": [".summary_tab3", "text"]
};

vk_pr.addRule(vk_pr_people);
vk_pr.addRule(vk_pr_pages);
sites.addSite(vk_pr);