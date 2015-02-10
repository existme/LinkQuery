/**
 * Created by Reza on 2/9/2015.
 */
var SiteProfiles = function () {
  this.profiles = new Array();
}
SiteProfiles.prototype.addSite = function (siteProfile) {
  this.profiles.push(siteProfile);
}
var SiteProfile = function (siteName, url) {
  this.rules = new Array();
  this.siteName = siteName;
  this.base_url = url;
};

SiteProfile.prototype.addRule = function (siteRule) {
  this.rules.push(siteRule);
};

var SiteRule = function (siteProfile, ruleName) {
  this.ruleName = ruleName;
  this.siteProfile = siteProfile;
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
var vk_pr_people = new SiteRule(vk_pr, "People-Rules");

vk_pr_people.closest = ".friends_bigph_wrap, .friends_field, .wk_likes_liker_row.inl_bl, .fl_l.mv_thumb, .reply_image, .post_image, .people_cell";
vk_pr_people.hasClass = ".like_tt_usr, .fans_fan_ph, .fans_fan_lnk";
vk_pr_people.prevHasClass = "fl_r reply_actions_wrap ";

vk_pr_people.ruleData = {
  "Number of videos": ["#profile_videos a .p_header_bottom", "text"]
};

var vk_pr_pages = new SiteRule(vk_pr, "Pages-Rules");
vk_pr_pages.closest = ".group_name, .fans_idol_name";
vk_pr_pages.hasClass = "#profile_idols div a, .fans_idol_ph";
vk_pr_pages.prevHasClass = "REZA";

vk_pr_pages.ruleData = {
  "Profile # of videos": ["#profile_videos a .p_header_bottom", "text"],
  "Page # of videos": ["#group_videos a .p_header_bottom, #public_videos a .p_header_bottom", "text"],
  "Status": ["#subscribe:not(.unshown)", "bool", "subscribe to this page"],
  "Private community": [".group_like_enter_desc", "text"]
};

vk_pr.addRule(vk_pr_people);
vk_pr.addRule(vk_pr_pages);
sites.addSite(vk_pr);