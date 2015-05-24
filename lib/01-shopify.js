Shopify = { };

Shopify._IsNonEmptyString = Match.Where(function(x) {
    check(x, String);
    return x.length > 0;
});

// Load ShopifyApp from Shopify's CDN.  It must be initialized by calling
// ShopifyApp.init.
//
// @param callback(err, ShopifyAPI) {Function} Called on success or failure.  Optional on server.
Shopify.getEmbeddedAppAPI = function(callback) {
    var url = "https://cdn.shopify.com/s/assets/external/app.js";

    if (callback) {
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

    } else if (!Meteor.isServer) {
        throw new Error("Invalid usage: must provide callback on client");
    } else {
        var res = HTTP.get(url);
        if (res.statusCode !== 200) {
            throw new Error("Failed to load ShopifyAPI");
        }

        eval(res.content);
        return this.ShopifyApp;
    }
};

