Shopify._keysets = { };

// Since the client shouldn't know your Shopify App's `api_key` or `secret`,
// you must provide these secrets server-side, and name the keyset so that it
// can be referred to on the client.
//
// @example
//     // For private apps
//     Shopify.addKeyset("private app", {
//         api_key: "Your API Key",
//         password: "Your API Password"
//     });
//
// @example
//     // For public apps that haven't been authenticated yet
//     Shopify.addKeyset("public app", {
//         api_key: "Your API Key",
//         secret: "Your API Shared Secret"
//     });
//
// @example
//     // For public apps that have already been authenticated
//     Shopify.addKeyset("my-shop permanent", {
//         access_token: "Permanent access token acquired via OAuth2"
//     });
//
// @example
//     // On the server
//     var user = Meteor.users.findOne(this.userId);
//     var access_token = user.profile.shopifyAccessToken;
//     Shopify.addKeyset("shopify-" + user._id, {
//         access_token: access_token
//     });
//
//     // On the client
//     var user = Meteor.user();
//     var api = new Shopify.API({
//         shop: "my-shop-10",
//         keyset: "shopify-" + user._id
//     });
//
// @param name {String} The keyset name.
// @param auth {Object}
// @param [auth.api_key] {String}
// @param [auth.password] {String}
// @param [auth.secret] {String}
// @param [auth.access_token] {String}
Shopify.addKeyset = function(name, auth) {
    check(name, Shopify._IsNonEmptyString);
    check(auth, Object);

    if (typeof auth.access_token === "string") {
        check(auth.access_token, Shopify._IsNonEmptyString);

        Shopify._keysets[name] = {
            type: "public",
            access_token: auth.access_token
        };
    } else if (typeof auth.password === "string") {
        check(auth.api_key, Shopify._IsNonEmptyString);
        check(auth.password, Shopify._IsNonEmptyString);

        Shopify._keysets[name] = {
            type: "private",
            api_key: auth.api_key,
            password: auth.password
        };
    } else if (typeof auth.secret === "string") {
        check(auth.api_key, Shopify._IsNonEmptyString);
        check(auth.secret, Shopify._IsNonEmptyString);

        Shopify._keysets[name] = {
            type: "oauth",
            api_key: auth.api_key,
            secret: auth.secret
        };
    } else {
        throw new Error("Invalid 'auth'.  Needs 'password' or 'secret' or 'access_token'.");
    }
};

Shopify.removeKeyset = function(name) {
    check(name, Shopify._IsNonEmptyString);

    if (Shopify._keysets[name]) {
        delete Shopify._keysets[name];
    }
};

/**
 * Return whether a keyset exists.
 */
Shopify.keysetExists = function(name) {
    return !!Shopify._keysets[name];
};

