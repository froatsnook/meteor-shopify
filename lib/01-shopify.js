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
}

