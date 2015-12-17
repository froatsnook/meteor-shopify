// Create an API access object.
//
// @example
//     var api = new Shopify.API({
//         shop: "test-shop-10",
//         backoff: 38,
//         insecure: true,
//         additionalHeaders: { "X-DEV-MOOD": "Pensive" }
//     });
//
// @param options {Object}
// @param options.shop {String} The target shop name, like `"my-store"` in `"my-store.my-shopify.com"`.
// @param [options.keyset] {String} Name of keyset (which must be registered on the server via `Shopify.addKeyset`).  A keyset can be used instead of providing `api_key+password` or `api_key+secret` or `access_token`.
// @param [options.api_key] {String} Your App's API Key (Public and Private Apps).  This can be provided on the server (instead of a keyset), and on the client.
// @param [options.password] {String} Your App's API Password (Private Apps only).  This can be provided on the server (instead of a keyset), and on the client if `options.insecure` is `true`.
// @param [options.secret] {String} Your App's API Shared Secret (Public Apps only).  This can be provided on the server (instead of a keyset), and on the client if `options.insecure` is `true`.
// @param [options.access_token] {String} This shop's permanent access token acquired via OAuth2.  This can be provided on the server (instead of a keyset), and on the client if `options.insecure` is `true`.
// @param [options.backoff] {Number} (default=`35`) The number of requests in Shopify's call bucket before requests are enqueued and fired off every half second.
// @param [options.insecure] {Boolean} (default=`false`) If `true`, then various security assertions and warnings will be ignored.
// @param [options.additionalHeaders] {Object} (default=`{ }`) Headers here will be sent with each call to Shopify (mainly for testing).
// @param [options.debug] {Boolean} If true, then `console.log` debug info.
var API = Shopify.API = function ShopifyAPI(options) {
    check(options, Object);
    check(options.shop, Shopify._IsNonEmptyString);

    // Until authenticated, or while waiting for the API rate limit to cool
    // down, requests are enqueued.
    //
    // [{ method, uri, [data], callback }, ...]
    this._requestQueue = [];

    this.config = {
        shop: options.shop,
        backoff: options.backoff || 35,
        insecure: options.insecure || false,
        additionalHeaders: options.additionalHeaders || { },
        _HOST_OVERRIDE: options._HOST_OVERRIDE || null,

        keyset: options.keyset || null,
        api_key: options.api_key || null,
        password: options.password || null,
        secret: options.secret || null,
        access_token: options.access_token || null,
        debug: options.debug || false
    };

    // On the server we can immediately replace the keyset with the credentials.
    if (Meteor.isServer && this.config.keyset) {
        var keyset = Shopify._keysets[this.config.keyset];
        switch (keyset.type) {
            case "private":
                this.config.api_key = keyset.api_key;
                this.config.password = keyset.password;
                break;
            case "oauth":
                this.config.api_key = keyset.api_key;
                this.config.secret = keyset.secret;
                break;
            case "public":
                this.config.access_token = keyset.access_token;
                break;
        }

        this.config.keyset = null;
    }

    // If user has an `access_token` or `password`, an authenticator can be
    // created.  Otherwise the user must later provide an authenticator with
    // API.addAuthenticator.
    this._authenticator = null;

    if (Meteor.isClient) {
        if (options.password && !options.insecure) {
            console.warn("Don't expose your App's password on the client!  Use `options.keyset` instead and `Shopify.addKeyset` on the server.  Use `options.insecure=true` to disable this warning.");
        }

        if (options.secret && !options.insecure) {
            console.warn("Don't expose your App's shared secret on the client!  Use `options.keyset` instead and `Shopify.addKeyset` on the server.  Use `options.insecure=true` to disable this warning.");
        }
    }

    // Try to make an authenticator even if client.
    if (this.config.password) {
        if (!options.api_key) {
            throw new Error("api_key is required for Private Apps (assuming Private App because you provided a password)");
        }

        var authenticator = new Shopify.PrivateAppAuthenticator({
            api_key: this.config.api_key,
            password: this.config.password,
        });

        this.addAuthenticator(authenticator);
    } else if (this.config.access_token) {
        var authenticator = new Shopify.PublicAppAuthenticator({
            access_token: this.config.access_token,
        });

        this.addAuthenticator(authenticator);
    }

    // From X-Shopify-Shop-Api-Call-Limit, like 32 in "32/40".
    this._lastCallLimit = 0;

    // Number of requests currently waiting.  If at backoff, then will
    // incremenet queue, wait a half second for each item in the queue, then
    // decrement the queue and make the API call.
    this._queueLength = 0;

    // Fix for 1.4.4: in functions created with `new Function`, underscore is
    // unavailable.  Since these functions have `API` as `this`, they can
    // access it here.
    this.underscore = _;
};

// Add an authenticator.
API.prototype.addAuthenticator = function(authenticator) {
    this._authenticator = authenticator;
};

Object.defineProperty(API.prototype, "authenticated", {
    get: function() {
        return !!this._authenticator;
    }
});

// Wait (if necessary) for rate limiting purposes, then call callback.
API.prototype._waitAsync = function(callback) {
    var self = this;

    // If not yet at backoff, then no wait is necessary.
    if (this._lastCallLimit < this.config.backoff) {
        Meteor.setTimeout(callback, 0);
        return;
    }

    this._queueLength++;
    if (this.config.debug) { console.log("Request will wait %sms because of call limit", 500*this._queueLength); }
    Meteor.setTimeout(function() {
        self._queueLength--;
        callback();
    }, 500*this._queueLength);
};

// When the client does API.getOrders(), this request has to be proxied to the
// server for security reasons (cross-domain AJAX not allowed and to prevent
// API Secret exposure).  The proxying happens by calling this Meteor Method.
//
// Server-only because we don't want the client to try to simulate it.
if (Meteor.isServer) {
    Meteor.methods({
        // @param name {String} Name of the meteor method.
        // @param options {Object} Method options.
        // @param config {Object} API.config object (for finding/created cached API object).
        "froatsnook:shopify/call": function(name, options, config) {
            // Retrieve cached server-side API object.
            var cachedAPI = Shopify._getCachedAPI(config);

            // Call the synchronous version of the method.
            return cachedAPI[name](options);
        }
    });
}

// Methods.

// Define an API method.
//
// @param info {Object} Endpoint info
// @param info.name {String}
// @param info.method {String} HTTP method of API endpoint, like "GET"
// @param info.path {String} Path of API endpoint, like "/admin/orders.json"
// @param [info.description] {String} 
API.define = function(info) {
    check(info.name, Shopify._IsNonEmptyString);
    check(info.method, Shopify._IsNonEmptyString);
    check(info.path, Shopify._IsNonEmptyString);

    var description = info.method + " \"" + info.path + "\"";
    if (info.description) {
        description += ": " + info.description;
    }

    var paramFinder = /#{(.+?)}/g;
    var params = [];

    var m;
    while ((m = paramFinder.exec(info.path))) {
        params.push(m[1]);
    }

    // If params are given (e.g. `id` in GET /admin/orders/:id.json), then we
    // have to substitute `options[param]` into `path` for each param.
    var paramCode;
    if (params.length > 0) {
        var lines = [];
        params.forEach(function(param) {
            lines.push("");
            lines.push("    if (!options['" + param + "']) {");
            lines.push("        throw new Error('Missing option " + param + "');");
            lines.push("    }");
            lines.push("");
            lines.push("    path = path.replace('#{" + param + "}', options['" + param + "']);");
        });

        // Make helpers for 
        lines.push("var paramCount = " + params.length + ";");
        lines.push("var isParam = { '" + params.join("': true, '") + "': true };");

        paramCode = lines.join("\n");
    } else {
        paramCode = "var paramCount = 0, isParam = { };";
    }

    var returnCode;
    if (info.returns) {
        returnCode = "            callback(null, res.data." + info.returns + ");\n";
    } else {
        returnCode = "            callback(null, res.data);\n";
    }

    API.prototype["_" + info.name] = new Function([
        // Name the function
        "return function ",
        info.name,
        // Takes options and callback.
        "(options, callback) {\n",
        // expose underscore
        "    var _ = this.underscore;\n",
        // Add the description in a comment for toString
        "    /* " + description + " */\n",
        "    var self = this;\n",

        "\n",
        "    if (typeof options === 'function') {\n",
        "        callback = options;\n",
        "        options = { };\n",
        "    }\n",
        "\n",

        "    this._waitAsync(function() { // for rate limiting\n",

        "    var method = '" + info.method + "';\n",
        "    var path = '" + info.path + "';\n",

        "\n",
        paramCode,
        "\n",

        // Extract request body content from `content' or `data'.
        "    var req = { };\n",
        "    if (options.content) {\n",
        "        req.content = options.content;\n",
        "        delete options.content;\n",
        "    }\n",
        "    if (options.data) {\n",
        "        req.data = options.data;\n",
        "        delete options.data;\n",
        "    }\n",
        "\n",

        // Using paramCode helpers from above, generate a query string from all
        // the other options.
        "    var queryParams = [];\n",
        "    for (var option in options) {\n",
        "        if (isParam[option]) {\n",
        "            continue;\n",
        "        }\n",
        "\n",
        "        var optionVal = options[option];\n",
        "        if (optionVal instanceof Date) {\n",
        "            optionVal = optionVal.toISOString().slice(0, 16).replace('T', ' ');\n",
        "        }\n",
        "\n",
        "        queryParams.push(option + '=' + optionVal);\n",
        "    }\n",
        "\n",
        "    var search = queryParams.length === 0 ? '' : '?' + queryParams.join('&');\n",
        "\n",

        "    var url = 'https://' + self.config.shop + '.myshopify.com' + path + search;\n",
        "    self._authenticator.authenticate(req);\n",
        "    var res = self._httpCall(method, url, req, function(err, res) {\n",
        "        if (err) { return callback(err); }\n",
        "\n",
        "        // Try again if hit rate limit\n",
        "        if (res.statusCode === 429) { return " + info.name + "(options, callback); }\n",
        "\n",
        "        // Set call limit\n",
        "        var callLimit = res.headers['x-shopify-shop-api-call-limit'];\n",
        "        if (callLimit) {\n",
        "            var callLimitParts = callLimit.split('/');\n",
        "            var bucket = parseInt(callLimitParts[0], 10);\n",
        "            if (isNaN(bucket)) {\n",
        "                console.warn('Invalid call limit %s', callLimit);\n",
        "            } else {\n",
        "                self._lastCallLimit = parseInt(bucket);\n",
        "            }\n",
        "        }\n",
        "\n",
        "        // 2XX codes indicate success\n",
        "        if (200 <= res.statusCode && res.statusCode <= 299) {\n",
        returnCode,
        "            return;\n",
        "        }\n",
        "\n",
        "        // It failed\n",
        "        callback(res.statusCode);\n",
        "    });\n",

        "    }); // waitAsync\n",
        "}"
    ].join(""))();

    if (Meteor.isServer) {
        API.prototype[info.name] = Meteor.wrapAsync(API.prototype["_" + info.name]);
    } else {
        API.prototype[info.name] = function(options, callback) {
            if (typeof options === "function") {
                callback = options;
                options = { };
            }

            if (typeof callback !== "function") {
                throw new Error("Missing required param 'callback'");
            }

            Meteor.call("froatsnook:shopify/call", info.name, options, this.config, callback);
        };
    }
};

Shopify._APIMethods.forEach(function(apiMethod) {
    API.define(apiMethod);
});

API.defineConcat = function(info) {
    check(info.name, Shopify._IsNonEmptyString);
    check(info.count, Shopify._IsNonEmptyString);
    check(info.fetch, Shopify._IsNonEmptyString);

    // Orders need options.status set to "open" if getAllOrders.
    var addStatusCode;
    if (info.name === "getAllOrders") {
        addStatusCode = [
            "",
            "    // By default, getOrders only returns open orders.  So",
            "    // getAllOrders should do the same.  If not explicitly provided",
            "    // then getOrders and countOrders will behave differently.",
            "    if (!options.status) {",
            "        options.status = 'open';",
            "    }",
            ""
        ].join("\n");
    } else {
        addStatusCode = "\n";
    }

    API.prototype["_" + info.name] = new Function([
        "return function " + info.name + "(options, callback) {",
        // expose underscore
        "    var _ = this.underscore;\n",
        "    var self = this;",
        "    if (typeof options === 'function') {",
        "        callback = options;",
        "        options = { };",
        "    } else {",
        "        options = _.clone(options);",
        "    }",
        addStatusCode,

        "    // Check how many items to fetch total",
        "    if (self.config.debug) { console.log('" + info.name + ": counting via _" + info.count + "'); }",
        "    if (self.config.debug) { console.log('" + info.name + ": fetching via _" + info.fetch + "'); }",
        "    this._" + info.count + "(options, function(err, count) {",

        "        // Check for count fail",
        "        if (err) {",
        "            if (self.config.debug) { console.log('" + info.name + ": count error: %s', err); }",
        "            callback('count failed: ' + err);",
        "            return;",
        "        }",
        "",
        "        if (self.config.debug) { console.log('" + info.name + ": count=%s', count); }",
        "",
        "        // Request 250 at a time starting at page 1",
        "        options.limit = 250;",
        "        options.page = 1;",
        "",
        "        // Append results here",
        "        var results = new Array(count);",

        "        // Request a page each time caller is called",
        "        (function caller(n) {",
        "            if (self.config.debug) { console.log('" + info.name + ": caller(%s)', n); }",

        "            // Return if done",
        "            if (n >= count) {",
        "                if (self.config.debug) { console.log('" + info.name + ": success!'); }",
        "                callback(null, results);",
        "                return;",
        "            }",
        "",

        "            // Fetch a page",
        "            self._" + info.fetch + "(options, function(err, list) {",

        "                // Check for fetch fail",
        "                if (err) {",
        "                    if (self.config.debug) { console.log('" + info.name + ": fetch error: %s', list.length); }",
        "                    callback('fetch (page ' + options.page + ') failed: ' + err);",
        "                    return;",
        "                }",

        "                if (self.config.debug) { console.log('" + info.name + ": fetch list.length=%s', list.length); }",
        "",
        "                // Add to results",
        "                for (var i = 0, len = list.length; i < len; i++) {",
        "                    results[n + i] = list[i];",
        "                }",
        "",
        "                // Recurse",
        "                options.page++;",
        "                caller(n + options.limit);",

        "            });", // fetch

        "        })(0);", // caller
        "",

        "    });", // count

        "};" // new Function
    ].join("\n"))();

    if (Meteor.isServer) {
        API.prototype[info.name] = Meteor.wrapAsync(API.prototype["_" + info.name]);
    } else {
        API.prototype[info.name] = function(options, callback) {
            if (typeof options === "function") {
                callback = options;
                options = { };
            }

            Meteor.call("froatsnook:shopify/call", info.name, options, this.config, callback);
        };
    }
};

Shopify._APIConcatMethods.forEach(function(apiMethod) {
    API.defineConcat(apiMethod);
});

API.prototype._httpCall = function(method, uri, req, callback) {
    if (this.config._HOST_OVERRIDE) {
        var path;
        if (Meteor.isServer) {
            var url = Npm.require("url");
            var parsedUri = url.parse(uri);
            path = parsedUri.path;
        } else {
            var link = document.createElement("a");
            link.href = uri;
            path = link.pathname + link.search;
        }

        uri = this.config._HOST_OVERRIDE + path;
    }

    if (!req.headers) {
        req.headers = { };
    }

    for (var key in this.config.additionalHeaders) {
        var val = this.config.additionalHeaders[key];
        if (!req.headers[key]) {
            req.headers[key] = val;
        }
    }

    if (this.config.debug) { console.log("%s %s", method, uri); }

    HTTP.call(method, uri, req, callback);
};

