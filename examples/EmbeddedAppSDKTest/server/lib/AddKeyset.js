// Don't do this.  It only makes sense in a test app!
//
// Basically, clients should never see `secret`, so froatsnook:shopify
// requires you to call Shopify.addKeyset on the server.  Since we want to
// input the `secret` on the client in this test app, a meteor method does the
// trick.
Meteor.methods({
    "AddKeyset": function(options) {
        check(options, Object);
        check(options.keyset, String);

        // Either require access_token or api_key+secret
        if (options.access_token) {
            check(options.access_token, String);

            Shopify.addKeyset(options.keyset, {
                access_token: options.access_token,
            });
        } else {
            check(options.api_key, String);
            check(options.secret, String);

            Shopify.addKeyset(options.keyset, {
                api_key: options.api_key,
                secret: options.secret,
            });
        }
    },
});
