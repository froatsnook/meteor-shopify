# Overview
* lib/routing/routes: setup routes
* client/templates/home: authenticate app for your store.  Credentials are stored in `localStorage` for quick access
* client/templates/testContent: displayed within store in an iframe!
* server/lib/AddKeyset.js: `Shopify.addKeyset` must be called in order to authenticate since you should never let the client see your `secret`.  But for testing it's easier to input it client side rather than setup settings.json

# Setup/Procedure

## Step 1
In Shopify Partner Login, add a new App, and check the box that says you'll use the Embedded App SDK

## Step 2
Add a new Shop admin link in Orders View called Test Content, pointing to https://yourapp.com/testContent

If you don't have an SSL certificate during development, that's fine.  Just allow mixed secure/insecure content.  In Chrome this can be allowed by clicking the shield on the right side of the URL bar.

## Step 3
Authenticate using `PublicOAuthAuthenticator`.  Be sure to set `embedded_app_sdk` to `true`.  See client/templates/home.js for an example.

## Step 4
Go to your Orders Overview and click the "..." button in the top right, and then Test Content.  You should see your app's testContent page.

## Step 5
To use `ShopifyApp`, call `Shopify.getEmbeddedAppAPI`.  This loads the js file from Shopify's CDN and evals it, returning ShopifyApp.

## Step 6
Initialize with `ShopifyApp.init`.  Give it your API key and the store's origin:

```javascript
ShopifyApp.init({
    apiKey: "Your API Key",
    shopOrigin: "https://mystore.myshopify.com" // <- note that you need the full domain here
});
```

## Step 7
Use the `ShopifyApp`:

```javascript
ShopifyApp.flashMessage("It works");
```

See client/templates/testContent.js for an example of steps 5-7.

