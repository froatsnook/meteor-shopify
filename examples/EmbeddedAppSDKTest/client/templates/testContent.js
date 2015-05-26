// Add a message to the iframe for debugging.
var addMessage = function(m) {
    $("#messages").append(m + "\n");
};

Template.testContent.onRendered(function() {
    $("#messages").text("");
    addMessage("Loading ShopifyApp");

    var api_key = localStorage.api_key;
    var shop = localStorage.shop;
    var access_token = localStorage.access_token;
    if (!access_token) {
        toastr.error("Either you haven't authenticated yet or you need to authenticate again", "access_token not in localStorage");
        return;
    }

    var api = new Shopify.API({
        shop: shop,
        access_token: access_token,
        insecure: true
    });

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
        ShopifyApp.init({
            apiKey: api_key,
            shopOrigin: "https://" + shop + ".myshopify.com",
        });

        addMessage("Counting orders...");
        api.countOrders(function(err, count) {
            addMessage("countOrders err=" + err + " count=" + count);
            if (err) {
                ShopifyApp.flashError("Counting orders failed: " + err);
            } else {
                ShopifyApp.flashNotice("There are " + count + " order(s)");
            }
        });
    });
});

