Shopify API access for Meteor.

## Simple, Convenient, Synchronous Shopify API
```
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

## Public+Private Apps
This package supports both Public and Private Apps.

### Private Apps
If you just want to access your own shop's data, then it's easiest to make a Private App.  Login to your Shopify Partner account and create it, and take note of your `api_key` and `password`.

```
// Private App API access
ShopifyAPI = new Shopify.API({
    shop: "your-shop",
    api_key: "Your API Key",
    password: "Your API Password"
});
```

### Public Apps
If you need to access multiple shops, then you need a Public App.  The first time a user uses your app, they will need to authenticate with OAuth 2.  But the access code returned from Shopify can be turned into a permanent `access_token`.

```
// First-time Public App API access

// On the client.
var authenticator = new Shopify.PublicAppOAuthAuthenticator({
    shop: "your-shop",
    api_key: "Your API Key",
    secret: "Your API Shared Secret",
    scopes: "all",
    onAuth: function(accessToken) {
        Meteor.users.update(Meteor.userId(), {
            $set: { "profile.shopifyAccessToken": access_token }
        });
    }
});

authenticater.openAuthTab();
```

See below for more OAuth options.

```
// Second-time Public App API access

// On the server or client.
var = new Shopify({
    shop: "your-shop",
    access_token: "Your access token"
});
```

## Client and Server APIs
While the Server API is synchronous using `Fibers`, the client API is not.  So each method needs an additional callback, with `err` and possible return value.

```
// Server
var count = api.countOrders();

// Client
api.countOrders(function(err, count) {
    ...
});

```

Instead of `err`, `Error`s are thrown on the server.

## API Updates
If the Shopify API changes and something breaks, of course please create an issue.  However, `API.define` and `API.defineConcat` are provided to hold you over.

Just call:

```
Shopify.API.define({
    "name": "getProductMetafieldByID",
    "method": "GET",
    "path": "/admin/products/#{productId}/metafields/#{id}.json",
    "returns": "metafield",
    "description": "Get a single product metafield by its ID"
});
```

to directly modify `Shopify.API.prototype`, adding the `getProductMetafieldByID` method (sync on server, async on client).  Since `#{id}` is in `path`, it will take a required param `id`.  The optional `returns` indicates that Shopify returns json like `{ "metafield": { ... } }` and `getProductMetafieldByID` should return the `metafield` of that object.

Defining `getAllXYZ` methods is possible in the same way using:

```
Shopify.API.defineConcat({
    "name": "getAllOrders",
    "count": "countOrders",
    "fetch": "getOrders"
});
```

## Get All
The Shopify API limits some calls, like `getOrders` to 250 items.  Get All methods are also defined for such methods in order to automate the work of counting the collection, fetching the pages individually, and then concatenating the results.

```
var allOpenOrders = api.getAllOrders();
var allOrders = `pi.getAllOrders({ status: "any" });
```

## Rate Limiting
This library does its best to not exceed the Shopify rate limit of one call each half second with bursts of up to 40 calls.

With each reply, Shopify returns a `X-Shopify-Shopify` header like `"32/40"`.  Once this reaches the `api.backoff` (default `35`), API calls will be queued and fired each half second until again below the backoff limit.

## Custom OAuth
`PublicAppOAuthAuthenticator.openAuthTab` is provided as the simplest way to do OAuth.  However, you can also take control at various steps in the process if you want a more customized experience.

### Scenario 1: Automatic
```
     console.assert(Meteor.isClient);
     var authenticator = new Shopfiy.PublicAppOAuthAuthenticator({
         shop: "my-shop-40",
         api_key: "Your Shopify App's API Key",
         secret: "Your Shopify App's Shared Secret",
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
```
     console.assert(Meteor.isClient);

     // Let the user install your app in an iframe instead of a new tab.
     var iframe = $("<iframe>");
     iframe.appendTo("body");

     var authenticator = new Shopify.PublicAppOAuthAuthenticator({
         shop: "my-shop-40",
         api_key: "Your Shopify App's API Key",
         secret: "Your Shopify App's Shared Secret",
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
```
     console.assert(Meteor.isClient);

     var authenticator = new Shopify.PublicAppOAuthAuthenticator({
         shop: "my-shop-40",
         api_key: "Your Shopify App's API Key",
         secret: "Your Shopify App's Shared Secret",
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

## API

#### `Shopify.API.getPolicies`
```
GET /admin/policies.json
Receive a list of all Policies
```

#### `Shopify.API.createRecurringApplicationCharge`
```
POST /admin/recurring_application_charges.json
Create a recurring application charge
```

#### `Shopify.API.getRecurringApplicationCharge`
```
GET /admin/recurring_application_charges/#{id}.json
Receive a single RecurringApplicationCharge
```

#### `Shopify.API.getRecurringApplicationCharges`
```
GET /admin/recurring_application_charges.json
Retrieve all recurring application charges
```

#### `Shopify.API.activateRecurringApplicationCharge`
```
POST /admin/recurring_application_charges/#{id}/activate.json
Activate a recurring application charge
```

#### `Shopify.API.cancelRecurringApplicationCharge`
```
DELETE /admin/recurring_application_charges/#{id}.json
Cancel a recurring application charge
```

#### `Shopify.API.getMetafields`
```
GET /admin/metafields.json
Get metafields that belong to a store
```

#### `Shopify.API.getProductMetafields`
```
GET /admin/products/#{id}/metafields.json
Get metafields that belong to a product
```

#### `Shopify.API.countMetafields`
```
GET /admin/metafields/count.json
Get a count of metafields that belong to a store
```

#### `Shopify.API.countProductMetafields`
```
GET /admin/products/#{id}/metafields/count.json
Get a count of metafields that belong to a product
```

#### `Shopify.API.getMetafieldByID`
```
GET /admin/metafields/#{id}.json
```
POST /admin/orders/#{id}/risks.json
Create a new Order Risks
```

#### `Shopify.API.getRisks`
```
GET /admin/orders/#{id}/risks.json
Receive a list of all Order Risks
```

#### `Shopify.API.getRisk`
```
GET /admin/orders/#{orderId}/risks/#{id}.json
Receive a single Order Risks
```

#### `Shopify.API.modifyRisk`
```
PUT /admin/orders/#{orderId}/risks/#{id}.json
Modify an existing Order Risks
```

#### `Shopify.API.getProductImages`
```
GET /admin/products/#{id}/images.json
Receive a list of all Product Images
```

#### `Shopify.API.countProductImages`
```
GET /admin/products/#{id}/images/count.json
Receive a count of all Product Images
```

#### `Shopify.API.getProductImage`
```
GET /admin/products/#{productId}/images/#{id}.json
Receive a single Product Image
```

#### `Shopify.API.createProductImage`
```
POST /admin/products/#{id}/images.json
Create a new Product Image
```

#### `Shopify.API.modifyProductImage`
```
PUT /admin/products/#{productId}/images/#{id}.json
Modify an existing Product Image
```

#### `Shopify.API.removeProductImage`
```
DELETE /admin/products/#{productId}/images/#{id}.json
Remove a Product Image from the database
```

## License
MIT

