Template.BasicExample.helpers({
    error: function() {
        var error = Session.get("error");
        return error ? "Error: " + error : "";
    },

    orderCount: function() {
        var count = Session.get("orderCount");
        if (typeof count === "number") {
            return "Found " + count + " orders.";
        }

        return "";
    },
});

Template.BasicExample.events({
    "click #login": function(e, t) {
        var shop = $("#shop").val();
        var authenticator = new Shopify.PublicAppOAuthAuthenticator({
            shop: shop,
            api_key: Meteor.settings.public.api_key,
            keyset: "auth", // this keyset is defined in BasicExample/server/startup.js
            scopes: "all",
            onAuth: makeAPI,
        });

        authenticator.openAuthTab();
    },
});

Template.BasicExample.onRendered(function() {
    Session.set("error", "");
    Session.set("orderCount", "");
});

function makeAPI() {
    var shop = $("#shop").val();

    // The keyset for this shop is created in BasicExample/server/startup.js in
    // the Shopify.onAuth.  In other words, a keyset with the name of the shop
    // is created each time a shop authenticates.
    //
    // This isn't actually secure!  One solution would be to have user accounts
    // and store the name of the keyset (which should be a UUID) in the user's
    // profile.
    var keyset = shop;

    console.log("Creating API...");
    var api = new Shopify.API({
        shop: shop,
        keyset: keyset,
    });

    console.log("Counting orders...");
    api.countOrders(function(err, count) {
        if (err) {
            console.error("countOrders failed:", err);
        } else {
            console.log("Found " + count + " orders.");
        }
        Session.set("error", err || "");
        Session.set("orderCount", count || "");
    });
}

