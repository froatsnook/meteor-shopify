Template.home.helpers({
    settings() {
        if (Meteor.settings && Meteor.settings.public) {
            return JSON.stringify(Meteor.settings.public, null, 4);
        }

        return "";
    },
});

Template.home.events({
    // Authenticate when #go button is clicked
    "click #go": function(e, t) {
        var shopInput = t.find("#shop");
        var apiKeyInput = t.find("#api-key");
        var secretInput = t.find("#secret");

        var shop = shopInput.value;
        var api_key = apiKeyInput.value;
        var secret = secretInput.value;

        if (!shop || !api_key || !secret) {
            toastr.error("All fields are required");
            return;
        }

        // Store in localStorage for ease of use.
        localStorage.shop = shop;
        localStorage.api_key = api_key;
        localStorage.secret = secret;

        // NOTE: normally the client should never see the secret, which is why
        // Shopify.addKeyset is used.  See server/lib/AddKeyset.js and
        // froatsnook:shopify's README for more info.
        Meteor.call("AddKeyset", {
            keyset: "default",
            api_key: api_key,
            secret: secret,
        }, function(err) {
            if (err) {
                toastr.error(err, "Failed to create keyset");
            }

            // Prepare to authenticate
            var authenticator = new Shopify.PublicAppOAuthAuthenticator({
                shop: shop,
                api_key: api_key,
                keyset: "default",
                embedded_app_sdk: true,

                // This is called after successful authentication.
                onAuth: function(access_token) {
                    localStorage.access_token = access_token;

                    toastr.success("Successfully authenticated");
                },
            });

            // Start authenticating.
            authenticator.openAuthTab();
        });
    },
});

// Restore from localStorage for ease of use.
Template.home.onRendered(function() {
    var shopInput = $("#shop");
    var apiKeyInput = $("#api-key");
    var secretInput = $("#secret");

    shopInput.val(localStorage.shop);
    apiKeyInput.val(localStorage.api_key);
    secretInput.val(localStorage.secret);
});

