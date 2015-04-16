Package.describe({
    name: "froatsnook:shopify",
    version: "1.1.0",
    summary: "Shopify API Access",
    git: "https://github.com/froatsnook/meteor-shopify",
    documentation: "README.md"
});

Package.onUse(function(api) {
    api.versionsFrom("1.0.3.1");
    api.use("check", ["client", "server"]);
    api.use("http", ["client", "server"]);
    api.use("underscore", ["client", "server"]);
    api.use("webapp", "server");
    api.use("froatsnook:sleep@1.1.0", ["client", "server"]);
    api.addFiles("lib/01-shopify.js", ["client", "server"]);
    api.addFiles("lib/02-APIMethods.js", ["client", "server"]);
    api.addFiles("lib/api.js", ["client", "server"]);
    api.addFiles("lib/Authenticators.js", ["client", "server"]);
    api.addFiles("lib/AuthRedirect.js", "server");
    api.addFiles("lib/DefaultScopes.js", ["client", "server"]);
    api.addFiles("lib/Keyset.js", ["server"]);
    api.addFiles("lib/ProxyAPICache.js", ["server"]);
    api.export("Shopify", ["client", "server"]);
});

Package.onTest(function(api) {
    Npm.depends({ "express": "4.12.2" });

    api.use("tinytest");
    api.use("webapp", "server");
    api.use("tracker");
    api.use("froatsnook:sleep@1.1.0");
    api.use("froatsnook:shopify");
    api.addFiles("test/shopify-api-simulator.js", ["server"]);
    api.addFiles("test/shopify-tests.js");
});

