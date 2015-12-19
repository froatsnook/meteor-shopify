1.6.0 - 2015-12-19
==================
* The `hmac` returned by Shopify during auth is now checked (`Shopify.PublicAppOAuthAuthenticator` only).
* Added Shopify.ignoreHMACs to disable this check.

1.5.1 - 2015-12-17
==================
* Fix private API keyset use thanks to [toszter](https://github.com/toszter)

1.5.0 - 2015-11-11
==================
* Add server-side `Shopify.onAuth`
* Add `Shopify.harden()` to prevent leaking `access_token` to client
* Add `Shopify.keysetExists`

1.4.4 - 2015-11-04
==================
* Fix `_ undefined` error in getAllCustomers and friends.

1.4.3 - 2015-11-04
==================
* Another auth fix, this time thanks to [sum1youno](https://github.com/sum1youno)

1.4.2 - 2015-10-11
==================
* Fix auth

1.4.0 - 2015-07-06
==================
* Fix `addKeyset` so that providing `access_token` "overrules" other options
* Further improvements to embedded app SDK example
* Fix automatic Authenticator creation when keyset given as option in `new Shopify.API`
* Fix POST requests when there's a request body

1.3.1 - 2015-05-26
==================
* Improve embedded app SDK example

1.3.0 - 2015-05-24
==================
* Add experimental Embedded App SDK support

1.2.0 - 2015-04-22
==================
* Add `getAllCustomers`

1.1.0 - 2015-04-16
==================
* Add `options.debug` to `Shopify.API` constructor

1.0.0 - 2015-03-18
==================
* Major client security overhaul

0.1.0 - 2015-03-17
==================
* Initial version

