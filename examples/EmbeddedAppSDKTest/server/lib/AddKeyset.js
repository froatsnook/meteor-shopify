// Don't do this.  It only makes sense in a test app!
//
// Basically, clients should never see `secret`, so froatsnook:shopify
// requires you to call Shopify.addKeyset on the server.  Since we want to
// input the `secret` on the client in this test app, a meteor method does the
// trick.
Meteor.methods({
    "AddKeyset": function(keyset, api_key, secret) {
        check(keyset, String);
        check(api_key, String);
        check(secret, String);

        Shopify.addKeyset(keyset, {
            api_key: api_key,
            secret: secret
        });
    }
});
