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

        var code = uri.query.code;
        var signature = uri.query.signature;
        var timestamp = uri.query.timestamp;

        var pathname = uri.pathname;
        var uuid = pathname.replace("/__shopify-auth/", "");

        console.log("%s => %s", uuid, code);

        var handler = handlers[counter];
        if (!handler) {
            console.error("No handler");
            res.writeHeader(500, { });
            res.end("<html><head>Error</head><body>Shopify Auth failed because no handler</body></html>");
            return;
        }

        var authenticatorConfig = handler.authenticatorConfig;
        var callback = handler.callback;
        delete handlers[uuid];

        if (authenticatorConfig.post_auth_uri === "close") {
            res.writeHead(200, { });
            res.end("<html><head><script>window.close()</script></head><body></body></html>");
        } else {
            res.writeHead(302, {
                "Location": authenticatorConfig.post_auth_uri
            });
            res.end();
        }

        Shopify.getPermanentAccessToken(authenticatorConfig, code, callback);
    });
});

Shopify._getPermanentAccessToken = function(authenticatorConfig, code, callback) {
    var accessTokenUrl = [
        "https://",
        authenticatorConfig.shop,
        ".myshopify.com/admin/oauth/access_token"
    ].join("");

    var res = HTTP.post(accessTokenUrl, {
        data: {
            client_id: authenticatorConfig.api_key,
            client_secret: authenticatorConfig.secret,
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
    console.log("asyncHandleAuthRedirect with redirect_uri=%s", redirect_uri);

    var uri = url.parse(redirect_uri, true);
    var pathname = uri.pathname;
    var uuid = pathname.replace("/__shopify-auth/", "");

    handlers[uuid] = {
        authenticatorConfig: authenticatorConfig,
        callback: callback
    };
};

var handleAuthRedirect = Meteor.wrapAsync(asyncHandleAuthRedirect);

Meteor.methods({
    "__ShopifyHandleAuthRedirect": function(authenticatorConfig) {
        var access_token = handleAuthRedirect(authenticatorConfig);
        console.log("Got access_token:", access_token);
        return access_token;
    }
});

