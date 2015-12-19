# Setup

## Step 1: create the app
```
meteor create BasicExample
cd BasicExample
```

## Step 2: add froatsnook:shopify
```
meteor add froatsnook:shopify
```

## Step 3: create an app
* login to your partner account: https://app.shopify.com/services/partners
* Click Apps in the sidebar
* Click the "Create app" button on the top-right
* Fill in the details
* Read and accept the developer TOS and then click Create Application

## Step 4: add credentials to settings.json
Modify the settings.json and input values from the new App's settings page.  You'll need:
* API Key
* Shared Secret (click the Credential Sets field)

## Step 5: run the example
```
meteor --port 3000 --settings settings.json
```

# What's going on
This example uses a public app.  That means that the app works for multiple stores.

The app first creates an "auth" keyset in server/startup.js.  This keyset contains your app's `api_key` and `secret` found in settings.json.

When you run the example, you input the store (like "test-store-999" if your store is test-store-999.myshopify.com) and click Login via Shopify.

In the click handler, a new `Shopify.PublicAppOAuthAuthenticator` is created with your app's `api_key` and the given shop.  A new tab is opened where the user must grant the app access.

Next the onAuth runs on the server.  This is also located in server/startup.js.  Here a keyset for the shop is created.

Next onAuth is called on the client.  A new `Shopify.API` is created using the new keyset.  Finally an API call can be made.  This app counts the open orders.

