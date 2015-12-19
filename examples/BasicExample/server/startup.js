if (!Meteor.settings || !Meteor.settings.public || !Meteor.settings.public.api_key || !Meteor.settings.secret) {
    console.log("↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓");
    console.log("You must run meteor with settings.json");
    console.log("↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑");
    process.abort();
}

if (Meteor.settings.public.api_key === "Your API Key" || Meteor.settings.secret === "Your Shared Secret") {
    console.log("↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓");
    console.log("You must add your API Key and Secret");
    console.log("↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑");
    process.abort();
}

// This ensures that the access token won't be exposed client-side.
Shopify.harden();

// Create a keyset for authenticating users.
Shopify.addKeyset("auth", {
    api_key: Meteor.settings.public.api_key,
    secret: Meteor.settings.secret
});

// Create a shop keyset whenever a user authenticates.
Shopify.onAuth(function(accessToken, authConfig) {
    var shop = authConfig.shop;
    Shopify.addKeyset(shop, {
        access_token: accessToken
    });
});

