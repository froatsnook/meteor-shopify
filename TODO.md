## General
* Add URLs to Shopify API docs
* Add timeout option to all requests
* Handle/test bad `access_token`/`password`
* More browser tests
* maybe call this.debugLog instead of console.log, then one lint ignore can cover that and other console.logs will be detected
* Store API rate limit info and request queue (or at least count) in a global object which times out when the timers are done
* EASDK documentation
* Better EASDK integration
* Figure out when insecure makes sense
  + It's clear that clients shouldn't ever see `secret`, but what about `access_token`?
  + In order to preserve backwards compatibility, could add `Shopify.harden()` which would remove the `access_token` parameter in `onAuth`.  Could then add some server-side onAuth for saving credentials.
* Add `Shopify.harden` and `Shopify.onAuth` tests

