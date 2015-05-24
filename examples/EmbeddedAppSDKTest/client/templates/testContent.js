// Add a message to the iframe for debugging.
var addMessage = function(m) {
    $("#messages").append(m + "\n");
};

Template.testContent.onRendered(function() {
    $("#messages").text("");
    addMessage("Loading ShopifyApp");

    // Load the ShopifyApp object.
    Shopify.getEmbeddedAppAPI(function(err, ShopifyApp) {
        if (err) {
            addMessage("It failed:");
            addMessage("  " + err);
            return;
        }

        addMessage("It succeeded:");
        addMessage("  " + typeof ShopifyApp);

        // Make use of the API by initializing and showing a flash notice.
        addMessage("Initializing...");
        var api_key = localStorage.api_key;
        var shop = localStorage.shop;
        ShopifyApp.init({
            apiKey: api_key,
            shopOrigin: "https://" + shop + ".myshopify.com",
        });

        ShopifyApp.flashNotice("It works");
    });
});

