module("localization");

test("createLocale() normalizes language codes", function() {
  jQuery.localization.extend("en-US", "l10nTests", {
    "foo": "bar",
  });
  var locale = jQuery.localization.createLocale(["en-us"]);
  deepEqual(locale.languages, ["en-US"]);
  equal(locale.get("l10nTests:foo"), "bar");
});

test("getting names inherits from different languages", function() {
  jQuery.localization.extend("en-US", "l10nTests", {
    "about": "about",
    "inherited-msg": "This should pass through!"
  });
  jQuery.localization.extend("en-CA", "l10nTests", {
    "about": "aboot"
  });
  var locale = jQuery.localization.createLocale(["en-US", "en-CA"]);
  equal(locale.get("l10nTests:about"), "aboot");
  equal(locale.get("l10nTests:inherited-msg"), "This should pass through!");
});

test("scope function works w/ nonexistent scope", function() {
  var locale = jQuery.localization.createLocale(["uu-UU"]);
  var l10n = locale.scope("nonexistent");
  
  equal(l10n("foo"), "unable to find locale string nonexistent:foo");
});
