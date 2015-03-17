// Private Apps can authenticate using an API key and an API password.
//
// @param options
// @param options.api_key {String} Your Shopify App's API Key.
// @param options.password {String} Your Shopify App's API Password (not your login password!).
Shopify.PrivateAppAuthenticator = function PrivateAppAuthenticator(options) {
    check(options, Object);
    check(options.api_key, String);
    check(options.password, String);

    this.config = { };
    this.config.type = "private";
    this.config.api_key = options.api_key;
    this.config.password = options.password;
    this.ready = true;
};

Shopify.PrivateAppAuthenticator.prototype.authenticate = function(req) {
    req.auth = this.config.api_key + ":" + this.config.password;
};

// Public Apps can authenticate using a permanent access_token after logging in
// via OAuth 2.0.  This Authenticator should be used when you have already
// acquired an access_token (e.g. via a Shopify.PublicAppOAuthAuthenticator)
// and have retrieved it from the database.
//
// @param options {Object}
// @param options.shop
// @param options.access_token
Shopify.PublicAppAuthenticator = function PublicAppAuthenticator(options) {
    check(options, Object);
    check(options.access_token, String);

    this.config = { };
    this.config.type = "public";
    this.config.access_token = options.access_token;
    this.ready = true;
};

Shopify.PublicAppAuthenticator.prototype.authenticate = function(req) {
    if (!req.headers) {
        req.headers = { };
    }

    req.headers["X-Shopify-Access-Token"] = this.config.access_token;
};

// This authenticator is useful for the first time your user accesses shopify.
//
// Scenario 1: Automatic
//     console.assert(Meteor.isClient);
//     var authenticator = new Shopfiy.PublicAppOAuthAuthenticator({
//         shop: "my-shop-40",
//         api_key: "Your Shopify App's API Key",
//         secret: "Your Shopify App's Shared Secret",
//         scopes: "read_products,read_customers",
//         onAuth: function(access_token) {
//             Meteor.call("SaveShopifyCredentials", access_token);
//
//             var api = new Shopify.API({ authenticator: authenticator });
//             api.getProducts(function() { ... });
//         }
//     });
//
//     // Open a new tab in the browser where the user can login with user name and password.  The user will then see the scopes that you requested and will be able to click an "Install App" button.  Shopify will redirect the tab back to this Meteor app, which will then exchange the given code for an access_token, and close the tab.
//     authenticator.openAuthTab();
//
// Scenario 2: iframe
//     console.assert(Meteor.isClient);
//
//     // Let the user install your app in an iframe instead of a new tab.
//     var iframe = $("<iframe>");
//     iframe.appendTo("body");
//
//     var authenticator = new Shopify.PublicAppOAuthAuthenticator({
//         shop: "my-shop-40",
//         api_key: "Your Shopify App's API Key",
//         secret: "Your Shopify App's Shared Secret",
//         scopes: "read_products,read_customers",
//
//         // Navigate iframe to a success message after authentication
//         post_auth_uri: Meteor.absoluteUrl("shopify-login-success"),
//
//         // After authentication, save the access_token, then remove the
//         // iframe after 2 seconds.
//         onAuth: function(access_token) {
//             Meteor.call("SaveShopifyCredentials", access_token);
//
//             Meteor.setTimeout(function() {
//                 iframe.remove();
//             }, 2000);
//
//             var api = new Shopify.API({ authenticator: authenticator });
//             api.getProducts(function() { ... });
//         }
//     });
//
//     // Navigate the iframe to a Shopify page where the user can login with user name and password.  The user will then see the scopes that you requested and will be able to click an "Install App" button.  Shopify will redirect the tab back to this Meteor app, which will then exchange the given code for an access_token, and close the tab.
//     iframe.attr("src", authenticator.authURL);
//
// Scenario 3: direct navigation
//     console.assert(Meteor.isClient);
//
//     var authenticator = new Shopify.PublicAppOAuthAuthenticator({
//         shop: "my-shop-40",
//         api_key: "Your Shopify App's API Key",
//         secret: "Your Shopify App's Shared Secret",
//         scopes: "read_products,read_customers",
//
//         // Logging in will redirect here.
//         redirect_uri: Meteor.absoluteUrl("shopify-logging-in"),
//
//         // Navigate iframe to a success message after authentication
//         post_auth_uri: Meteor.absoluteUrl("shopify-login-success"),
//
//         // This will be called after authenticator.getPermanentAccessToken
//         // succeeds.
//         onAuth: function(access_token) {
//             Meteor.call("SaveShopifyCredentials", access_token);
//
//             var api = new Shopify.API({ authenticator: authenticator });
//             api.getProducts(function() { ... });
//         }
//     });
//
//     // Start login by navigating.
//     location.href = authenticator.auth_uri;
//
//     // ... acquire code from redirect_uri using WebApp.connectHandlers.use or an iron:router route.
//
//     // Upgrade code to permanent access_token
//     authenticator.getPermanentAccessToken(code);
//
// @param options {Object}
// @param options.shop {String}
// @params option.api_key {String}
// @params options.secret {String}
// @params [options.scopes] {String}
// @params [options.post_auth_uri] {String} A URL to navigate to, or "close" (default).
// @params [onAuth] {Function} Called after authentication with `access_token` as parameter.  It's time to save the access_token to the database and start accessing shopify.
Shopify.PublicAppOAuthAuthenticator = function PublicAppOAuthAuthenticator(options) {
    var self = this;

    check(options, Object);
    check(options.shop, String);
    check(options.api_key, String);
    check(options.secret, String);

    this.config = { };
    this.config.type = "public";
    this.config.shop = options.shop;
    this.config.api_key = options.api_key;
    this.config.secret = options.secret;
    this.config.scopes = options.scopes || Shopify.DefaultScopes;
    this.config.post_auth_uri = options.post_auth_uri || "close";
    this.config.onAuth = options.onAuth || function() { };

    // Shopify will redirect to this address after login.
    if (options.redirect_uri) {
        // Library consumer will handle code -> access_token upgrade.
        this.config.redirect_uri = options.redirect_uri;
    } else {
        // Automatic handling.
        this.config.redirect_uri = Meteor.absoluteUrl("__shopify-auth/" + Meteor.uuid());

        // Install handler for automatic handling.  The library conusmer still
        // has to somehow navigate to auth_uri, be it in a new tab, an iframe,
        // or directly.
        Meteor.call("__ShopifyHandleAuthRedirect", this.config, function(err, access_token) {
            if (err) {
                throw new Error("Auth failed: " + err);
            }

            self.config.access_token = access_token;
            self.config.onAuth(self.config.access_token);
        });
    }

    // Navigating here lets the user login and install the app.
    this.auth_uri = [
        "https://",
        this.config.shop,
        ".myshopify.com/admin/oauth/authorize",
        "?client_id=",
        this.config.api_key,
        "&scope=",
        this.config.scopes,
        "&redirect_uri=",
        encodeURIComponent(this.config.redirect_uri)
    ].join("");

    this.ready = false;
};

// Open a new tab to auth_uri.
Shopify.PublicAppOAuthAuthenticator.prototype.openAuthTab = function() {
    if (!Meteor.isClient) {
        throw new Error("Can only open a new tab client-side.");
    }

    window.open(this.auth_uri, "_blank");
};

// If you provide your own redirect_uri, you must turn the access code into a
// permenanet access_token.  This can be done by calling
// authenticator.getPermanentAccessToken.
//
// @param code {String} Access code passed as a query parameter from Shopify to redirect_uri.
// @param callback {Function} Called on success/failure as callback(err, access_token).  If an error occurs, then err will be non-null.  Otherwise, access_token is a string.
Shopify.PublicAppOAuthAuthenticator.prototype.getPermanentAccessToken = function(code, callback) {
    var self = this;

    Shopify._getPermanentAccessToken(this.config, code, function(err, access_token) {
        if (!err) {
            self.onAuth(access_token);
        }

        if (callback) {
            callback(err, access_token);
        }
    });
};

// Authenticate a request.
Shopify.PublicAppOAuthAuthenticator.prototype.authenticate = function(req) {
    if (!this.config.access_token) {
        throw new Error("No access token.  Navigate to auth_uri first.");
    }

    if (!req.headers) {
        req.headers = { };
    }

    req.headers["X-Shopify-Access-Token"] = this.config.access_token;
};

