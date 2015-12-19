Shopify = { };

Shopify._IsNonEmptyString = Match.Where(function(x) {
    check(x, String);
    return x.length > 0;
});

// Load ShopifyApp from Shopify's CDN.  It must be initialized by calling
// ShopifyApp.init.
//
// @param callback(err, ShopifyAPI) {Function} Called on success or failure.
Shopify.getEmbeddedAppAPI = function(callback) {
    var url = "https://cdn.shopify.com/s/assets/external/app.js";

    if (!callback) {
        callback = function() { };
    }

   HTTP.get(url, function(err, res) {
        if (err) {
            callback(err);
            return;
        }

        if (res.statusCode !== 200) {
            callback("Request failed: " + res.statusCode, null);
            return;
        }

        eval(res.content);
        callback(null, this.ShopifyApp);
    });
};

if (Meteor.isServer) {
    Shopify.harden = function() {
        Shopify._isHardened = true;
    };

    /**
     * As of 1.6.0, the hmac sent by Shopify during auth is validated.  This
     * check is disabled by calling Shopify.ignoreHMAC.
     *
     * @returns {void}
     */
    Shopify.ignoreHMACs = function() {
        Shopify._ignoreHMACs = true;
    };
}

if (Meteor.isServer) {
    Shopify._onAuthHandlers = [];

    // Register a callback to be called on successful authentication.
    //
    // @param callback(access_token, config, userId) {Function} Called after successful authentication.
    // @param access_token {String} The new access_token
    // @param config {Object} The authenciator config
    // @param userId {String|null} The current user's ID or null.
    Shopify.onAuth = function(callback) {
        check(callback, Function);
        Shopify._onAuthHandlers.push(callback);
    };
}

