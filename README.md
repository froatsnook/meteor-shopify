Shopify API access for Meteor.

## Simple, Convenient, Synchronous
```javascript
// Server
var api = new Shopify.API({
    shop: "your-shop",
    access_token: "Your access token"
});

var orderCount = api.countOrders(); // => 1022

var recentOpenOrders = api.getOrders();
console.log(recentOpenOrders.length); // => 250
console.log(recentOpenOrders[0]); // => { name: "#2022", ... }

// Combine countOrders and getOrders:
var allOpenOrders = api.getAllOrders({ status: "any" });
console.log(allOpenOrders.length); // => 1022

var order102420 = api.getOrder({ id: 102420 });
console.log(order102420); // => { name: "#2022", ... }
```

## Public & Private Apps
This package supports both Public and Private Apps.

### Private Apps
If you just want to access your own shop's data, then it's easiest to make a Private App.  Login to your Shopify Partner account and create it, and take note of your `api_key` and `password`.

```javascript
// Private App API access (server)
ShopifyAPI = new Shopify.API({
    shop: "your-shop",
    api_key: "Your API Key",
    password: "Your API Password"
});
```

### Public Apps
If you need to access multiple shops, then you need a Public App.  The first time a user uses your app, they will need to authenticate with OAuth 2.  But the access code returned from Shopify can be turned into a permanent `access_token`.  Login to your Shopify Partner account and create your Public App, and take note of your `api_key` and `secret`.  You will also need to whitelist whichever `redirect_uri` you choose to use (App -> Your App -> Edit app settings -> Redirect URL).  If you use the `Shopify.PublicAppOAuthAuthenticator`, then whitelist `localhost:3000/__shopify-auth` (with 2 underscores).  And be sure to replace the `localhost:3000` when you go into production!

```javascript
// First-time Public App API access

// On the server (since you don't want to expose your secret to the client)
Shopify.addKeyset("default", {
    api_key: "Your API Key",
    secret: "Your API Shared Secret",
});

// On the client
var authenticator = new Shopify.PublicAppOAuthAuthenticator({
    shop: "your-shop",
    api_key: "Your API Key",
    keyset: "default",
    scopes: "all",

    // Once the login succeeds and a permanent access token is acquired, store
    // it in the user's profile for future use.
    onAuth: function(accessToken) {
        Meteor.users.update(Meteor.userId(), {
            $set: { "profile.shopifyAccessToken": access_token }
        });
    }
});

authenticator.openAuthTab();
```

NOTE: in the above scenario, the `access_token` is leaked to the client.  If this is a concern to you, then:

```javascript
// server/init.js
Shopify.harden(); // do not send accessToken to client
Shopify.onAuth(function(access_token, authConfig, userId) {
    // You can store the access_token in the user object for future use.  Don't
    // store it in the profile or it will leak to the client.
    Meteor.users.update(userId, {
        $set: {
            shop: authConfig.shop,
            access_token: access_token,
        },
    });
});
```

`scopes` (Public Apps only) tell Shopify what access your app needs.  The user will be prompted to grant access to the scopes your App requests when he/she navigates to `authURL`.  The default is `"all"`, but a comma separated string like `"read_orders,read_products"` should be given to the authenticator if you know you don't need access to everything.  The supported scopes are:

* `"read_content"`
* `"write_content"`
* `"read_themes"`
* `"write_themes"`
* `"read_products"`
* `"write_products"`
* `"read_customers"`
* `"write_customers"`
* `"read_orders"`
* `"write_orders"`
* `"read_script_tags"`
* `"write_script_tags"`
* `"read_fulfillments"`
* `"write_fulfillments"`
* `"read_shipping"`
* `"write_shipping"`

See below for more OAuth options, like if you want to authenticate in an iframe or with your own UI.

#### Signature verification
As of 1.6.0, if you use `Shopify.PublicAppOAuthAuthenticator`, then the hmac sent by Shopify is verified during auth.  This uses the shared secret stored in your keyset.

If the signature is invalid, an error message is shown: Shopify Auth failed because of invalid signature/shared secret.

This behavior can be disabled by calling `Shopify.ignoreHMACs()`.

```javascript
// Second-time Public App API access

// On the server or client.
var = new Shopify.API({
    shop: "your-shop",
    access_token: "Your access token"
});
```

You can also use a keyset if you don't want the client to see the `access_token`.  In this case, be sure to call `Shopify.harden()` so that the client will not receive `access_token` as an `onAuth` parameter in `PublicAppOAuthAuthenticator`.

```javascript
// On the server, e.g. server/init.js
Shopify.harden();

// On the client
var authenticator = new Shopify.PublicAppOAuthAuthenticator({
    ...
    onAuth: function(err, access_token) {
        console.assert(typeof access_token === "undefined");
    },
});

```

Instead you can save `access_token` and create a keyset using a global `onAuth` handler:

```javascript
Shopify.onAuth(function(access_token, authenticatorConfig, userId) {
    ShopifyCredentials.upsert(userId, {
        shop: authenticatorConfig.shop,
        api_key: authenticatorConfig.api_key,
        access_token: access_token,
    });
});
```

### Keysets
You don't want to expose your `secret` (Public Apps), or `password` (Private Apps) to the client.  Therefore, use a `keyset` instead.

```javascript
// Server
Meteor.startup(function() {
    // For Public Apps
    Shopify.addKeyset("default", {
        api_key: "Your API Key",
        secret: "Your API Shared Secret"
    });

    // Or for Private Apps
    Shopify.addKeyset("default", {
        api_key: "Your API Key",
        password: "Your API Password"
    });

    // Or for Public Apps when the user has logged in
    Shopify.addKeyset("default", {
        access_token: "This shop's OAuth permanent access token"
    });
});

// Client (or Server)
var api = new Shopify.API({
    shop: "your-store",
    keyset: "default"
});
```

You can also delete a keyset when you're done with it:
```javascript
// Server
Shopify.removeKeyset("default");
```

And you can check if a keyset exists by name:
```javascript
// Server
Shopify.keysetExists(shopName); // => true or false
```

### Insecure Client
If you are control of the browser environment, you can pass your `api_key` and `password/secret` in `options`, ignoring `options.keyset`.  Be sure to set `options.insecure` to `true`, and use underscored method names like `API._getOrders` in order to make the calls via AJAX.

If you call non-underscored methods, like `API.getOrders` on the client, requests will be proxied through the server using the Meteor Method `"froatsnook:shopify/call"`.

## Embedded App SDK
Version 1.3.0 adds experimental Embedded App SDK support.  The current workflow is:

* Set `embedded_app_sdk` to `true` in your `Shopify.PublicAppOAuthAuthenticator`
* Call `Shopify.getEmbeddedAppAPI` to load Shopify's `ShopifyApp` object
* Initialize it by providing an api key and the store's domain
* Make sure you've enabled embedded settings in your partner account (Apps -> Your App -> Edit app settings -> Embedded settings)
* Make sure the `redirect_uri` you're using (defaults to `Meteor.absoluteUrl("/__shopify-auth")`) is set in your partner account (Apps -> Your App -> Edit app settings -> Redirection URL)
* Do your thing

See an example [here](examples/EmbeddedAppSDKTest).

For a list of `ShopifyApp` methods, see Shopify's documentation [here](https://docs.shopify.com/embedded-app-sdk/methods).

If you have problems, questions, or suggestions, please make an issue on github.

### Shopify.getEmbeddedAppAPI

This function should be called on the client from within the iframe which is
embedded in the store in order to retrieve the Embedded App SDK `ShopifyApp`
object.  You can use this object to show messages and do other Embedded App SDK
stuff.

```javascript
Shopify.getEmbeddedAppAPI(function(err, ShopifyApp) {
    if (err) {
        toastr.error("Failed to load ShopifyApp");
        return;
    }

    ShopifyApp.init({
        apiKey: "...",
        shopOrigin: "https://" + shop + ".myshopify.com"
    });

    ShopifyApp.flashNotice("It works");
});
```

## Client and Server APIs
While the Server API is synchronous using `Fibers`, the client API is not.  So each method needs an additional callback, with `err` and possible return value.

```javascript
// Server
var count = api.countOrders();

// Client
api.countOrders(function(err, count) {
    ...
});

```

Instead of `err`, `Error`s are thrown on the server.

If you want to use the asynchronous API on the server, for example to share code between (an insecure) client and server, use underscored methods, like `api._getOrders`.

## API Updates
If the Shopify API changes and something breaks, of course please create an issue.  However, `API.define` and `API.defineConcat` are provided to hold you over.

Just call:

```javascript
Shopify.API.define({
    "name": "getProductMetafieldByID",
    "method": "GET",
    "path": "/admin/products/#{productId}/metafields/#{id}.json",
    "returns": "metafield",
    "description": "Get a single product metafield by its ID"
});
```

to directly modify `Shopify.API.prototype`, adding the `getProductMetafieldByID` method (sync on server, async on client), as well as `_getProductMetafieldByID` (async on both).  Since `#{id}` is in `path`, it will take a required param `id`.  The optional `returns` indicates that Shopify returns json like `{ "metafield": { ... } }` and `getProductMetafieldByID` should return the `metafield` of that object.

Sometimes Shopify specifies their API with two of the same params, such as `GET /admin/orders/#{id}/transactions/#{id}.json`.  Be sure to rename one of these, like `GET /admin/orders/#{orderId}/transactions/#{id}.json`.

Defining `getAllXYZ` methods is possible in the same way using:

```javascript
Shopify.API.defineConcat({
    "name": "getAllOrders",
    "count": "countOrders",
    "fetch": "getOrders"
});
```

## Get All
The Shopify API limits some calls, such as `getOrders`, to 250 items.  Get All methods are also defined for such methods in order to automate the work of counting the collection, fetching the pages individually, and then concatenating the results.

```javascript
var allOpenOrders = api.getAllOrders();
var allOrders = api.getAllOrders({ status: "any" });
```

The currently available Get All methods are:
* `getAllOrders`
* `getAllProducts`
* `getAllCollects`
* `getAllCustomers`

## Rate Limiting
This library does its best to not exceed the Shopify rate limit of one call each half second with bursts of up to 40 calls.

With each reply, Shopify returns a `X-Shopify-Shopify` header like `"32/40"`.  Once this reaches the `api.config.backoff` (default `35`), API calls will be queued and fired each half second until again below the backoff limit.

## Custom OAuth
`PublicAppOAuthAuthenticator.openAuthTab` is provided as the simplest way to do OAuth.  However, you can also take control at various steps in the process if you want a more customized experience.

For new apps, you will need to whitelist the `redirect_uri` you're using.  This defaults to `Meteor.absoluteUrl("/__shopify-auth")` if you're using the `Shopify.PublicAppOAuthAuthenticator`.  The setting can be found in your partner account (Apps -> Your App -> Edit app settings -> Redirection URL).

### All scenarios
```javascript
// On the server (since you don't want clients to know your API Shared Secret).
Shopify.addKeyset("default", {
    api_key: "Your Shopify App's API Key",
    secret: "Your Shopify App's API Shared Secret"
});
```

### Scenario 1: Automatic
```javascript
     console.assert(Meteor.isClient);
     var authenticator = new Shopfiy.PublicAppOAuthAuthenticator({
         shop: "my-shop-40",
         api_key: "Your Shopify App's API Key",
         keyset: "default",
         scopes: "read_products,read_customers",
         onAuth: function(access_token) {
             Meteor.call("SaveShopifyCredentials", access_token);

             var api = new Shopify.API({ authenticator: authenticator });
             api.getProducts(function() { ... });
         }
     });

     // Open a new tab in the browser where the user can login with user name and password.  The user will then see the scopes that you requested and will be able to click an "Install App" button.  Shopify will redirect the tab back to this Meteor app, which will then exchange the given code for an access_token, and close the tab.
     authenticator.openAuthTab();
```

### Scenario 2: iframe
```javascript
     console.assert(Meteor.isClient);

     // Let the user install your app in an iframe instead of a new tab.
     var iframe = $("<iframe>");
     iframe.appendTo("body");

     var authenticator = new Shopify.PublicAppOAuthAuthenticator({
         shop: "my-shop-40",
         api_key: "Your Shopify App's API Key",
         keyset: "default",
         scopes: "read_products,read_customers",

         // Navigate iframe to a success message after authentication
         post_auth_uri: Meteor.absoluteUrl("shopify-login-success"),

         // After authentication, save the access_token, then remove the
         // iframe after 2 seconds.
         onAuth: function(access_token) {
             Meteor.call("SaveShopifyCredentials", access_token);

             Meteor.setTimeout(function() {
                 iframe.remove();
             }, 2000);

             var api = new Shopify.API({ authenticator: authenticator });
             api.getProducts(function() { ... });
         }
     });

     // Navigate the iframe to a Shopify page where the user can login with user name and password.  The user will then see the scopes that you requested and will be able to click an "Install App" button.  Shopify will redirect the tab back to this Meteor app, which will then exchange the given code for an access_token, and close the tab.
     iframe.attr("src", authenticator.authURL);
```

### Scenario 3: direct navigation
```javascript
     console.assert(Meteor.isClient);

     var authenticator = new Shopify.PublicAppOAuthAuthenticator({
         shop: "my-shop-40",
         api_key: "Your Shopify App's API Key",
         keyset: "default",
         scopes: "read_products,read_customers",

         // Logging in will redirect here.
         redirect_uri: Meteor.absoluteUrl("shopify-logging-in"),

         // Navigate iframe to a success message after authentication
         post_auth_uri: Meteor.absoluteUrl("shopify-login-success"),

         // This will be called after authenticator.getPermanentAccessToken
         // succeeds.
         onAuth: function(access_token) {
             Meteor.call("SaveShopifyCredentials", access_token);

             var api = new Shopify.API({ authenticator: authenticator });
             api.getProducts(function() { ... });
         }
     });

     // Start login by navigating.
     location.href = authenticator.auth_uri;

     // ... acquire code from redirect_uri using WebApp.connectHandlers.use or an iron:router route.

     // Upgrade code to permanent access_token
     authenticator.getPermanentAccessToken(code);
```

## Testing

Tests can be run using:

`meteor test-packages ./`

This starts a Shopify API Simulator and runs tests, which can be checked at `http://localhost:3000/`.

## API

### Shopify.API constructor

Shopify API access objects can be created with `new Shopify.API`:

```javascript
var api = new Shopify.API({
    shop: "test-shop-10",
    backoff: 38,
    insecure: true,
    additionalHeaders: { "X-DEV-MOOD": "Pensive" }
});
```

The available options are:

* `options.shop {String}` The target shop name, like `"my-store"` in `"my-store.my-shopify.com"`.
* `[options.keyset] {String}` Name of keyset (which must be registered on the server via `Shopify.addKeyset`).  A keyset can be used instead of providing `api_key+password` or `api_key+secret` or `access_token`.
* `[options.api_key] {String}` Your App's API Key (Public and Private Apps).  This can be provided on the server (instead of a keyset), and on the client if `options.insecure` is `true`.
* `[options.password] {String}` Your App's API Password (Private Apps only).  This can be provided on the server (instead of a keyset), and on the client if `options.insecure` is `true`.
* `[options.secret] {String}` Your App's API Shared Secret (Public Apps only).  This can be provided on the server (instead of a keyset), and on the client if `options.insecure` is `true`.
* `[options.access_token] {String}` This shop's permanent access token acquired via OAuth2.  This can be provided on the server (instead of a keyset), and on the client if `options.insecure` is `true`.
* `[options.backoff] {Number}` (default=`35`) The number of requests in Shopify's call bucket before requests are enqueued and fired off every half second.
* `[options.insecure] {Boolean}` (default=`false`) If `true`, then various security assertions and warnings will be ignored.
* `[options.additionalHeaders]` {Object} (default=`{ }`) Headers here will be sent with each call to Shopify (mainly for testing).
* `[options.debug]` {Boolean} (default=`false`) If `true`, then some messages will be logged with `console.log`.

### Shopify Endpoint functions

```javascript
// Server
var count = api.countOrders(options);

// Client
api.countOrders(options, function(err, count) {
    ...
});

```

Each such function takes an optional parameter, `options`.  See the Shopify API documentation for details on supported options and return types.

For requests that require a request body, such as [`POST /admin/metafields.json`](https://docs.shopify.com/api/metafield#create), you can specify the `content` or `data` properties.  `content` is an arbitrary string, whereas `data` is an object (converted to JSON).

```javascript
var res = api.createMetafield({
    data: {
        metafield: {
            namespace: "inventory",
            key: "warehouse",
            value: 25,
            value_type: "integer",
        }
    },
});

```

Many Shopify API options are date strings.  If you provide a Javascript `Date` object, then it will be automatically formatted to match Shopify's expected date format, `"YYYY-MM-DD HH:mm:ss"`.

```javascript
// Get all customers created or changed in the past 24 hours.
Shopify.getAllCustomers({ updated_at_min: new Date(Date.now() - 24*60*60*1000) });
```

Whenever an endpoint has a parameter in the path (e.g. `#{id}`), it ends up as a required option in `options`.  So, for example,

```javascript
// Shopify.API.getRecurringApplicationCharge
// => GET /admin/recurring_application_charges/#{id}.json

var charge = api.getRecurringApplicationCharge(); // WRONG
var charge = api.getRecurringApplicationCharge({ id: 10233 }); // OK
```

Whenever shopify returns an object like:

```json
{
    "order": {
        ...
    }
}
```

the content of `"order"` is returned instead.  This means that:

```javascript
var count = api.countOrders().count; // WRONG
var count = api.countOrders(); // OK
```

### Endpoint list

#### `Shopify.API.getPolicies`
```
GET /admin/policies.json
```
Receive a list of all Policies


#### `Shopify.API.createRecurringApplicationCharge`
```
POST /admin/recurring_application_charges.json
```
Create a recurring application charge


#### `Shopify.API.getRecurringApplicationCharge`
```
GET /admin/recurring_application_charges/#{id}.json
```
Receive a single RecurringApplicationCharge


#### `Shopify.API.getRecurringApplicationCharges`
```
GET /admin/recurring_application_charges.json
```
Retrieve all recurring application charges


#### `Shopify.API.activateRecurringApplicationCharge`
```
POST /admin/recurring_application_charges/#{id}/activate.json
```
Activate a recurring application charge


#### `Shopify.API.cancelRecurringApplicationCharge`
```
DELETE /admin/recurring_application_charges/#{id}.json
```
Cancel a recurring application charge


#### `Shopify.API.getMetafields`
```
GET /admin/metafields.json
```
Get metafields that belong to a store


#### `Shopify.API.getProductMetafields`
```
GET /admin/products/#{id}/metafields.json
```
Get metafields that belong to a product


#### `Shopify.API.countMetafields`
```
GET /admin/metafields/count.json
```
Get a count of metafields that belong to a store


#### `Shopify.API.countProductMetafields`
```
GET /admin/products/#{id}/metafields/count.json
```
Get a count of metafields that belong to a product


#### `Shopify.API.getMetafieldByID`
```
GET /admin/metafields/#{id}.json
```
Get a single store metafield by its ID


#### `Shopify.API.getProductMetafieldByID`
```
GET /admin/products/#{productId}/metafields/#{id}.json
```
Get a single product metafield by its ID


#### `Shopify.API.createMetafield`
```
POST /admin/metafields.json
```
Create a new metafield for a store


#### `Shopify.API.createProductMetafield`
```
POST /admin/products/#{id}/metafields.json
```
Create a new metafield for a product


#### `Shopify.API.modifyMetafield`
```
PUT /admin/metafields/#{id}.json
```
Update a store metafield


#### `Shopify.API.modifyProductMetafield`
```
PUT /admin/products/#{productId}/metafields/#{id}.json
```
Update a product metafield


#### `Shopify.API.removeMetafield`
```
DELETE /admin/metafields/#{id}.json
```
Delete a store metafield


#### `Shopify.API.removeProductMetafield`
```
DELETE /admin/products/#{productId}/metafields/#{id}.json
```
Delete a product metafield


#### `Shopify.API.getWebhooks`
```
GET /admin/webhooks.json
```
Receive a list of all Webhooks


#### `Shopify.API.countWebhooks`
```
GET /admin/webhooks/count.json
```
Receive a count of all Webhooks


#### `Shopify.API.getWebhook`
```
GET /admin/webhooks/#{id}.json
```
Receive a single Webhook


#### `Shopify.API.createWebhook`
```
POST /admin/webhooks.json
```
Create a new Webhook


#### `Shopify.API.modifyWebhook`
```
PUT /admin/webhooks/#{id}.json
```
Modify an existing Webhook


#### `Shopify.API.removeWebhook`
```
DELETE /admin/webhooks/#{id}.json
```
Remove a Webhook from the database


#### `Shopify.API.getProvinces`
```
GET /admin/countries/#{id}/provinces.json
```
Receive a list of all Provinces


#### `Shopify.API.countProvinces`
```
GET /admin/countries/#{id}/provinces/count.json
```
Receive a count of all Provinces


#### `Shopify.API.getProvince`
```
GET /admin/countries/#{countryId}/provinces/#{id}.json
```
Receive a single Province


#### `Shopify.API.modifyProvince`
```
PUT /admin/countries/#{countryId}/provinces/#{id}.json
```
Modify an existing Province


#### `Shopify.API.getCustomerSavedSearches`
```
GET /admin/customer_saved_searches.json
```
Receive a list of all CustomerSavedSearches


#### `Shopify.API.countCustomerSavedSearches`
```
GET /admin/customer_saved_searches/count.json
```
Receive a count of all CustomerSavedSearches


#### `Shopify.API.getCustomerSavedSearch`
```
GET /admin/customer_saved_searches/#{id}.json
```
Receive a single CustomerSavedSearch


#### `Shopify.API.getCustomersFromCustomerSavedSearch`
```
GET /admin/customer_saved_searches/#{id}/customers.json
```
Receive all Customers resulting from a Customer Saved Search


#### `Shopify.API.createCustomerSavedSearch`
```
POST /admin/customer_saved_searches.json
```
Create a new CustomerSavedSearch


#### `Shopify.API.modifyCustomerSavedSearch`
```
PUT /admin/customer_saved_searches/#{id}.json
```
Modify an existing CustomerSavedSearch


#### `Shopify.API.removeCustomerSavedSearch`
```
DELETE /admin/customer_saved_searches/#{id}.json
```
Remove a CustomerSavedSearch from the database


#### `Shopify.API.getVariants`
```
GET /admin/products/#{id}/variants.json
```
Receive a list of all Product Variants


#### `Shopify.API.countVariants`
```
GET /admin/products/#{id}/variants/count.json
```
Receive a count of all Product Variants


#### `Shopify.API.getVariant`
```
GET /admin/variants/#{id}.json
```
Receive a single Product Variant


#### `Shopify.API.createVariant`
```
POST /admin/products/#{id}/variants.json
```
Create a new Product Variant


#### `Shopify.API.modifyVariant`
```
PUT /admin/variants/#{id}.json
```
Modify an existing Product Variant


#### `Shopify.API.removeVariant`
```
DELETE /admin/products/#{productId}/variants/#{id}.json
```
Remove a Product Variant from the database


#### `Shopify.API.countCheckouts`
```
GET /admin/checkouts/count.json
```
Receive a count of all Checkouts


#### `Shopify.API.getCheckouts`
```
GET /admin/checkouts.json
```
Receive a list of all Checkouts


#### `Shopify.API.getCustomers`
```
GET /admin/customers.json
```
Receive a list of all Customers


#### `Shopify.API.searchCustomers`
```
GET /admin/customers/search.json
```
Search for customers matching supplied query


#### `Shopify.API.getCustomer`
```
GET /admin/customers/#{id}.json
```
Receive a single Customer


#### `Shopify.API.createCustomer`
```
POST /admin/customers.json
```
Create a new Customer


#### `Shopify.API.modifyCustomer`
```
PUT /admin/customers/#{id}.json
```
Modify an existing Customer


#### `Shopify.API.removeCustomer`
```
DELETE /admin/customers/#{id}.json
```
Remove a Customer from the database


#### `Shopify.API.countCustomers`
```
GET /admin/customers/count.json
```
Receive a count of all Customers


#### `Shopify.API.getShop`
```
GET /admin/shop.json
```
Receive a single Shop


#### `Shopify.API.getTransactions`
```
GET /admin/orders/#{id}/transactions.json
```
Receive a list of all Transactions


#### `Shopify.API.countTransactions`
```
GET /admin/orders/#{id}/transactions/count.json
```
Receive a count of all Transactions


#### `Shopify.API.getTransaction`
```
GET /admin/orders/#{orderId}/transactions/#{id}.json
```
Receive a single Transaction


#### `Shopify.API.createTransaction`
```
POST /admin/orders/#{id}/transactions.json
```
Create a new Transaction


#### `Shopify.API.getThemes`
```
GET /admin/themes.json
```
Receive a list of all Themes


#### `Shopify.API.getTheme`
```
GET /admin/themes/#{id}.json
```
Receive a single Theme


#### `Shopify.API.createTheme`
```
POST /admin/themes.json
```
Create a new Theme


#### `Shopify.API.modifyTheme`
```
PUT /admin/themes/#{id}.json
```
Modify an existing Theme


#### `Shopify.API.removeTheme`
```
DELETE /admin/themes/#{id}.json
```
Remove a Theme from the database


#### `Shopify.API.getProducts`
```
GET /admin/products.json
```
Receive a list of all Products


#### `Shopify.API.countProducts`
```
GET /admin/products/count.json
```
Receive a count of all Products


#### `Shopify.API.getProduct`
```
GET /admin/products/#{id}.json
```
Receive a single Product


#### `Shopify.API.createProduct`
```
POST /admin/products.json
```
Create a new Product


#### `Shopify.API.modifyProduct`
```
PUT /admin/products/#{id}.json
```
Modify an existing Product


#### `Shopify.API.removeProduct`
```
DELETE /admin/products/#{id}.json
```
Remove a Product from the database


#### `Shopify.API.getComments`
```
GET /admin/comments.json
```
Receive a list of all Comments


#### `Shopify.API.countComments`
```
GET /admin/comments/count.json
```
Receive a count of all Comments


#### `Shopify.API.getComment`
```
GET /admin/comments/#{id}.json
```
Receive a single Comment


#### `Shopify.API.createComment`
```
POST /admin/comments.json
```
Create a new Comment


#### `Shopify.API.modifyComment`
```
PUT /admin/comments/#{id}.json
```
Modify an existing Comment


#### `Shopify.API.markCommentSpam`
```
POST /admin/comments/#{id}/spam.json
```
Mark a Comment as spam


#### `Shopify.API.markCommentNotSpam`
```
POST /admin/comments/#{id}/not_spam.json
```
Mark a Comment as not spam


#### `Shopify.API.approveComment`
```
POST /admin/comments/#{id}/approve.json
```
Approve a Comment


#### `Shopify.API.removeComment`
```
POST /admin/comments/#{id}/remove.json
```
Remove a Comment


#### `Shopify.API.restoreComment`
```
POST /admin/comments/#{id}/restore.json
```
Restore a Comment


#### `Shopify.API.createApplicationCharge`
```
POST /admin/application_charges.json
```
Create a new one-time application charge


#### `Shopify.API.getApplicationCharge`
```
GET /admin/application_charges/#{id}.json
```
Receive a single ApplicationCharge


#### `Shopify.API.getApplicationCharges`
```
GET /admin/application_charges.json
```
Retrieve all one-time application charges


#### `Shopify.API.activateApplicationCharge`
```
POST /admin/application_charges/#{id}/activate.json
```
Activate a one-time application charge


#### `Shopify.API.getAssets`
```
GET /admin/themes/#{id}/assets.json
```
Receive a list of all Assets


#### `Shopify.API.getAsset`
```
GET /admin/themes/#{id}/assets.json
```
Receive a single Asset


#### `Shopify.API.modifyAsset`
```
PUT /admin/themes/#{id}/assets.json
```
Creating or Modifying an Asset


#### `Shopify.API.removeAsset`
```
DELETE /admin/themes/#{id}/assets.json
```
Remove a Asset from the database


#### `Shopify.API.createCarrierService`
```
POST /admin/carrier_services.json
```
Create a new CarrierService


#### `Shopify.API.modifyCarrierService`
```
PUT /admin/carrier_services/#{id}.json
```
Modify an existing CarrierService


#### `Shopify.API.getCarrierServices`
```
GET /admin/carrier_services.json
```
Receive a list of all CarrierServices


#### `Shopify.API.getCarrierService`
```
GET /admin/carrier_services/#{id}.json
```
Receive a single CarrierService


#### `Shopify.API.removeCarrierService`
```
DELETE /admin/carrier_services/#{id}.json
```
Remove a CarrierService from the database


#### `Shopify.API.getOrders`
```
GET /admin/orders.json
```
Retrieve a list of Orders (OPEN Orders by default, use status=any for ALL orders)


#### `Shopify.API.getOrder`
```
GET /admin/orders/#{id}.json
```
Receive a single Order


#### `Shopify.API.countOrders`
```
GET /admin/orders/count.json
```
Receive a count of all Orders


#### `Shopify.API.closeOrder`
```
POST /admin/orders/#{id}/close.json
```
Close an Order


#### `Shopify.API.openOrder`
```
POST /admin/orders/#{id}/open.json
```
Re-open a closed Order


#### `Shopify.API.cancelOrder`
```
POST /admin/orders/#{id}/cancel.json
```
Cancel an Order


#### `Shopify.API.createOrder`
```
POST /admin/orders.json
```
Create a new Order


#### `Shopify.API.modifyOrder`
```
PUT /admin/orders/#{id}.json
```
Modify an existing Order


#### `Shopify.API.removeOrder`
```
DELETE /admin/orders/#{id}.json
```
Remove a Order from the database


#### `Shopify.API.getCustomerAddresses`
```
GET /admin/customers/#{id}/addresses.json
```
Receive a list of all CustomerAddresses


#### `Shopify.API.getCustomerAddress`
```
GET /admin/customers/#{customerId}/addresses/#{id}.json
```
Receive a single CustomerAddress


#### `Shopify.API.createCustomerAddress`
```
POST /admin/customers/#{id}/addresses.json
```
Create a new CustomerAddress


#### `Shopify.API.modifyCustomerAddress`
```
PUT /admin/customers/#{customerId}/addresses/#{id}.json
```
Modify an existing CustomerAddress


#### `Shopify.API.removeCustomerAddress`
```
DELETE /admin/customers/#{customerId}/addresses/#{id}.json
```
Remove a CustomerAddress from the database


#### `Shopify.API.bulkModifyCustomerAddresses`
```
PUT /admin/customers/#{id}/addresses/set.json
```
Perform bulk operations against a number of addresses


#### `Shopify.API.setDefaultCustomerAddress`
```
PUT /admin/customers/#{customerId}/addresses/#{id}/default.json
```
Sets default address for a customer


#### `Shopify.API.getArticles`
```
GET /admin/blogs/#{id}/articles.json
```
Receive a list of all Articles


#### `Shopify.API.countArticles`
```
GET /admin/blogs/#{id}/articles/count.json
```
Receive a count of all Articles


#### `Shopify.API.getArticle`
```
GET /admin/blogs/#{blogId}/articles/#{id}.json
```
Receive a single Article


#### `Shopify.API.createArticle`
```
POST /admin/blogs/#{id}/articles.json
```
Create a new Article


#### `Shopify.API.modifyArticle`
```
PUT /admin/blogs/#{blogId}/articles/#{id}.json
```
Modify an existing Article


#### `Shopify.API.getAuthors`
```
GET /admin/articles/authors.json
```
Get a list of all the authors


#### `Shopify.API.getTags`
```
GET /admin/articles/tags.json
```
Get a list of all the tags


#### `Shopify.API.removeArticle`
```
DELETE /admin/blogs/#{blogId}/articles/#{id}.json
```
Remove a Article from the database


#### `Shopify.API.getBlogs`
```
GET /admin/blogs.json
```
Receive a list of all Blogs


#### `Shopify.API.countBlogs`
```
GET /admin/blogs/count.json
```
Receive a count of all Blogs


#### `Shopify.API.getBlog`
```
GET /admin/blogs/#{id}.json
```
Receive a single Blog


#### `Shopify.API.createBlog`
```
POST /admin/blogs.json
```
Create a new Blog


#### `Shopify.API.modifyBlog`
```
PUT /admin/blogs/#{id}.json
```
Modify an existing Blog


#### `Shopify.API.removeBlog`
```
DELETE /admin/blogs/#{id}.json
```
Remove a Blog from the database


#### `Shopify.API.getPages`
```
GET /admin/pages.json
```
Receive a list of all Pages


#### `Shopify.API.countPages`
```
GET /admin/pages/count.json
```
Receive a count of all Pages


#### `Shopify.API.getPage`
```
GET /admin/pages/#{id}.json
```
Receive a single Page


#### `Shopify.API.createPage`
```
POST /admin/pages.json
```
Create a new Page


#### `Shopify.API.modifyPage`
```
PUT /admin/pages/#{id}.json
```
Modify an existing Page


#### `Shopify.API.removePage`
```
DELETE /admin/pages/#{id}.json
```
Remove a Page from the database


#### `Shopify.API.getLocations`
```
GET /admin/locations.json
```
Receive a list of all Locations


#### `Shopify.API.getLocation`
```
GET /admin/locations/#{id}.json
```
Receive a single Location


#### `Shopify.API.getRedirects`
```
GET /admin/redirects.json
```
Receive a list of all Redirects


#### `Shopify.API.countRedirects`
```
GET /admin/redirects/count.json
```
Receive a count of all Redirects


#### `Shopify.API.getRedirect`
```
GET /admin/redirects/#{id}.json
```
Receive a single Redirect


#### `Shopify.API.createRedirect`
```
POST /admin/redirects.json
```
Create a new Redirect


#### `Shopify.API.modifyRedirect`
```
PUT /admin/redirects/#{id}.json
```
Modify an existing Redirect


#### `Shopify.API.removeRedirect`
```
DELETE /admin/redirects/#{id}.json
```
Remove a Redirect from the database


#### `Shopify.API.getSmartCollections`
```
GET /admin/smart_collections.json
```
Receive a list of all SmartCollections


#### `Shopify.API.countSmartCollections`
```
GET /admin/smart_collections/count.json
```
Receive a count of all SmartCollections


#### `Shopify.API.getSmartCollection`
```
GET /admin/smart_collections/#{id}.json
```
Receive a single SmartCollection


#### `Shopify.API.createSmartCollection`
```
POST /admin/smart_collections.json
```
Create a new SmartCollection


#### `Shopify.API.modifySmartCollection`
```
PUT /admin/smart_collections/#{id}.json
```
Modify an existing SmartCollection


#### `Shopify.API.removeSmartCollection`
```
DELETE /admin/smart_collections/#{id}.json
```
Remove a SmartCollection from the database


#### `Shopify.API.createCollect`
```
POST /admin/collects.json
```
Create a new Collect


#### `Shopify.API.removeCollect`
```
DELETE /admin/collects/#{id}.json
```
Remove a Collect from the database


#### `Shopify.API.getCollects`
```
GET /admin/collects.json
```
Receive a list of all Collects


#### `Shopify.API.countCollects`
```
GET /admin/collects/count.json
```
Receive a count of all Collects


#### `Shopify.API.getCollect`
```
GET /admin/collects/#{id}.json
```
Receive a single Collect


#### `Shopify.API.getUsers`
```
GET /admin/users.json
```
Receive a list of all Users


#### `Shopify.API.getUser`
```
GET /admin/users/#{id}.json
```
Receive a single User


#### `Shopify.API.getEvents`
```
GET /admin/events.json
```
Receive a list of all Events


#### `Shopify.API.getEvent`
```
GET /admin/events/#{id}.json
```
Receive a single Event


#### `Shopify.API.countEvents`
```
GET /admin/events/count.json
```
Receive a count of all Events


#### `Shopify.API.getFulfillments`
```
GET /admin/orders/#{id}/fulfillments.json
```
Receive a list of all Fulfillments


#### `Shopify.API.countFulfillments`
```
GET /admin/orders/#{id}/fulfillments/count.json
```
Receive a count of all Fulfillments


#### `Shopify.API.getFulfillment`
```
GET /admin/orders/#{orderId}/fulfillments/#{id}.json
```
Receive a single Fulfillment


#### `Shopify.API.createFulfillment`
```
POST /admin/orders/#{id}/fulfillments.json
```
Create a new Fulfillment


#### `Shopify.API.modifyFulfillment`
```
PUT /admin/orders/#{orderId}/fulfillments/#{id}.json
```
Modify an existing Fulfillment


#### `Shopify.API.completeFulfillment`
```
POST /admin/orders/#{orderId}/fulfillments/#{id}/complete.json
```
Complete a pending fulfillment


#### `Shopify.API.cancelFulfillment`
```
POST /admin/orders/#{orderId}/fulfillments/#{id}/cancel.json
```
Cancel a pending fulfillment


#### `Shopify.API.getRefund`
```
GET /admin/orders/#{orderId}/refunds/#{id}.json
```
Receive a single Refund


#### `Shopify.API.getCustomCollections`
```
GET /admin/custom_collections.json
```
Receive a list of all CustomCollections


#### `Shopify.API.countCustomCollections`
```
GET /admin/custom_collections/count.json
```
Receive a count of all CustomCollections


#### `Shopify.API.getCustomCollection`
```
GET /admin/custom_collections/#{id}.json
```
Receive a single CustomCollection


#### `Shopify.API.createCustomCollection`
```
POST /admin/custom_collections.json
```
Create a new CustomCollection


#### `Shopify.API.modifyCustomCollection`
```
PUT /admin/custom_collections/#{id}.json
```
Modify an existing CustomCollection


#### `Shopify.API.removeCustomCollection`
```
DELETE /admin/custom_collections/#{id}.json
```
Remove a CustomCollection from the database


#### `Shopify.API.getFulfillmentServices`
```
GET /admin/fulfillment_services.json
```
Receive a list of all FulfillmentServices


#### `Shopify.API.createFulfillmentService`
```
POST /admin/fulfillment_services.json
```
Create a new FulfillmentService


#### `Shopify.API.getFulfillmentService`
```
GET /admin/fulfillment_services/#{id}.json
```
Receive a single FulfillmentService


#### `Shopify.API.modifyFulfillmentService`
```
PUT /admin/fulfillment_services/#{id}.json
```
Modify an existing FulfillmentService


#### `Shopify.API.removeFulfillmentService`
```
DELETE /admin/fulfillment_services/#{id}.json
```
Remove a FulfillmentService from the database


#### `Shopify.API.getCountries`
```
GET /admin/countries.json
```
Receive a list of all Countries


#### `Shopify.API.countCountries`
```
GET /admin/countries/count.json
```
Receive a count of all Countries


#### `Shopify.API.getCountry`
```
GET /admin/countries/#{id}.json
```
Receive a single Country


#### `Shopify.API.createCountry`
```
POST /admin/countries.json
```
Create a new Country


#### `Shopify.API.modifyCountry`
```
PUT /admin/countries/#{id}.json
```
Modify an existing Country


#### `Shopify.API.removeCountry`
```
DELETE /admin/countries/#{id}.json
```
Remove a Country from the database


#### `Shopify.API.createRisk`
```
POST /admin/orders/#{id}/risks.json
```
Create a new Order Risks


#### `Shopify.API.getRisks`
```
GET /admin/orders/#{id}/risks.json
```
Receive a list of all Order Risks


#### `Shopify.API.getRisk`
```
GET /admin/orders/#{orderId}/risks/#{id}.json
```
Receive a single Order Risks


#### `Shopify.API.modifyRisk`
```
PUT /admin/orders/#{orderId}/risks/#{id}.json
```
Modify an existing Order Risks


#### `Shopify.API.getProductImages`
```
GET /admin/products/#{id}/images.json
```
Receive a list of all Product Images


#### `Shopify.API.countProductImages`
```
GET /admin/products/#{id}/images/count.json
```
Receive a count of all Product Images


#### `Shopify.API.getProductImage`
```
GET /admin/products/#{productId}/images/#{id}.json
```
Receive a single Product Image


#### `Shopify.API.createProductImage`
```
POST /admin/products/#{id}/images.json
```
Create a new Product Image


#### `Shopify.API.modifyProductImage`
```
PUT /admin/products/#{productId}/images/#{id}.json
```
Modify an existing Product Image


#### `Shopify.API.removeProductImage`
```
DELETE /admin/products/#{productId}/images/#{id}.json
```
Remove a Product Image from the database

## License
[MIT](https://tldrlegal.com/license/mit-license)

