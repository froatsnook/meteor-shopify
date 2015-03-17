Shopify = { };
require("../lib/02-APIMethods.js");

Shopify._APIMethods.forEach(function(info) {
    console.log("#### `Shopify.API.%s`", info.name);
    console.log("```");
    console.log("%s %s", info.method, info.path);
    console.log("```");
    console.log(info.description);
    console.log("\n");
});

