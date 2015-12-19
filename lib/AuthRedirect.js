var crypto = Npm.require("crypto");
var url = Npm.require("url");

// There is one connect handler used by all auth redirects.  Keep track of all
// handlers which are currently being processed by shopify so that the connect
// handler knows where to "return".
//
// uuid => { authenticatorConfig, callback }
var handlers = { };

// Install the connect handler the first time it's needed.
var installWebAppHandler = _.once(function() {
    WebApp.connectHandlers.use("/__shopify-auth", function ShopifyAuthRedirect(req, res) {
        var uri = url.parse(req.url, true);

        var pathname = uri.pathname;
        var code = uri.query.code;
        var signature = uri.query.signature;
        var shop = uri.query.shop;
        var timestamp = uri.query.timestamp;
        var hmac = uri.query.hmac;

        // The state parameter should be our original redirect id
        // If not, we should not continue, since something has gone wrong
        var uuid = uri.query.state;

        var handler = handlers[uuid];
        if (handler) {
            delete handlers[uuid];
        } else {
            console.error("No handler (uuid=%s)", uuid);
            console.error("Handlers are", Object.keys(handlers));
            res.writeHeader(500, { });
            res.end("<html><head><title>Error</title></head><body>Shopify Auth failed because no handler</body></html>");
            return;
        }

        var authenticatorConfig = handler.authenticatorConfig;

        // Verify hmac if the keyset has secret (unless ignoreHMACs has been
        // called).
        if (authenticatorConfig.keyset && !Shopify._ignoreHMACs) {
            var keyset = Shopify._keysets[authenticatorConfig.keyset];
            var secret = keyset.secret;
            if (secret) {
                var parts = [];
                _.each(uri.query, function(val, key) {
                    if (key === "signature" || key === "hmac") {
                        return;
                    }

                    key = key.replace(/&/g, "%26");
                    key = key.replace(/%/g, "%25");
                    key = key.replace(/=/g, "%3D");
                    val = val.replace(/&/g, "%26");
                    val = val.replace(/%/g, "%25");
                    parts.push({ key: key, val: val });
                });

                parts.sort(function(x, y) {
                    return x.key.localeCompare(y.key);
                });

                var message = parts.map(function(part) {
                    return [part.key, part.val].join("=");
                }).join("&");

                var hash = crypto.createHmac("sha256", secret).update(message).digest("hex");
                if (hash !== hmac) {
                    console.error("Signature failed");
                    res.writeHeader(500, { });
                    res.end("<html><head><title>Error</title></head><body>Shopify Auth failed because of invalid signature/shared secret</body></html>");
                    return;
                }
            }
        }

        if (authenticatorConfig.post_auth_uri === "close") {
            res.writeHead(200, { });
            res.end("<html><head><script>window.close()</script></head><body></body></html>");
        } else if (authenticatorConfig.embedded_app_sdk) {
            res.writeHead(200, { });
            res.end("<script type='text/javascript'>window.top.location.href = '" + authenticatorConfig.post_auth_uri + "';</script>");
        } else {
            res.writeHead(302, {
                "Location": authenticatorConfig.post_auth_uri
            });
            res.end();
        }

        var callback = handler.callback;
        Shopify._getPermanentAccessToken(authenticatorConfig, code, callback);
    });
});

Shopify._getPermanentAccessToken = function(authenticatorConfig, code, callback) {
    var accessTokenUrl = [
        "https://",
        authenticatorConfig.shop,
        ".myshopify.com/admin/oauth/access_token"
    ].join("");

    var keyset = Shopify._keysets[authenticatorConfig.keyset];
    var secret = keyset.secret;

    var res = HTTP.post(accessTokenUrl, {
        data: {
            client_id: authenticatorConfig.api_key,
            client_secret: secret,
            code: code
        }
    });

    if (res.statusCode === 200) {
        callback(null, res.data.access_token);
    } else {
        callback("Shopify access_token request failed with status " + res.statusCode);
    }
};

var asyncHandleAuthRedirect = function(authenticatorConfig, callback) {
    var redirect_uri = authenticatorConfig.redirect_uri;

    // Pick out the redirect id associated with this request
    var uuid = authenticatorConfig.redirect_id;

    handlers[uuid] = {
        authenticatorConfig: authenticatorConfig,
        callback: callback
    };
};

var handleAuthRedirect = Meteor.wrapAsync(asyncHandleAuthRedirect);

Meteor.methods({
    "froatsnook:shopify/HandleAuthRedirect": function(authenticatorConfig) {
        // Install the web app handler in case it hasn't already been installed
        installWebAppHandler();

        var access_token = handleAuthRedirect(authenticatorConfig);

        // Call globally defined onAuth handlers.
        var userId = this.userId;
        Shopify._onAuthHandlers.forEach(function(handler) {
            handler(access_token, authenticatorConfig, userId);
        });

        // If hardened, don't return access_token to client.
        if (Shopify._isHardened) {
            return;
        }

        return access_token;
    }
});

