module("localization");

test("scope function inherits names from locales", function() {
  jQuery.localization.extend("en-US", "l10nTests", {
    "about": "about",
    "inherited-msg": "This should pass through!"
  });
  jQuery.localization.extend("en-CA", "l10nTests", {
    "about": "aboot"
  });
  var locale = jQuery.localization.createLocale(["en-US", "en-CA"]);
  var l10n = jQuery.localization.scope("l10nTests", locale);
  equal(l10n("about"), "aboot");
  equal(l10n("inherited-msg"), "This should pass through!");
});

test("scope function works w/ nonexistent scope", function() {
  var locale = jQuery.localization.createLocale(["uu-UU"]);
  var l10n = jQuery.localization.scope("nonexistent", locale);
  
  equal(l10n("foo"), "unable to find locale string nonexistent:foo");
});
