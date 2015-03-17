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
// Private App API access
ShopifyAPI = new Shopify.API({
    shop: "your-shop",
    api_key: "Your API Key",
    password: "Your API Password"
});
```

### Public Apps
If you need to access multiple shops, then you need a Public App.  The first time a user uses your app, they will need to authenticate with OAuth 2.  But the access code returned from Shopify can be turned into a permanent `access_token`.  Login to your Shopify Partner account and create your Public App, and take note of your `api_key` and `secret`.

```javascript
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

`scopes` tell Shopify what access your app needs.  The default is `"all"`, but a comma separated string like `"read_orders,read_products"` should be given to the authenticator if you know you don't need access to everything.  The supported scopes are:

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

```javascript
// Second-time Public App API access

// On the server or client.
var = new Shopify({
    shop: "your-shop",
    access_token: "Your access token"
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

If you want to use the asynchronous API on the server, for example to share code between client and server, use underscored methods, like `api._getOrders`.

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
The Shopify API limits some calls, like `getOrders` to 250 items.  Get All methods are also defined for such methods in order to automate the work of counting the collection, fetching the pages individually, and then concatenating the results.

```javascript
var allOpenOrders = api.getAllOrders();
var allOrders = `pi.getAllOrders({ status: "any" });
```

The currently available Get All methods are:
* `getAllOrders`
* `getAllProducts`
* `getAllCollects`

## Rate Limiting
This library does its best to not exceed the Shopify rate limit of one call each half second with bursts of up to 40 calls.

With each reply, Shopify returns a `X-Shopify-Shopify` header like `"32/40"`.  Once this reaches the `api.backoff` (default `35`), API calls will be queued and fired each half second until again below the backoff limit.

## Custom OAuth
`PublicAppOAuthAuthenticator.openAuthTab` is provided as the simplest way to do OAuth.  However, you can also take control at various steps in the process if you want a more customized experience.

### Scenario 1: Automatic
```javascript
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
```javascript
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
```javascript
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

Each function takes an optional parameter, `options`.  See the Shopify API documentation for details on supported options and return types.

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

Whenever an endpoint has a parameter in the path (e.g. `#{id}`), it ends up as a required option in `options`.  So, for example,

```javascript
// Shopify.API.getRecurringApplicationCharge
// => GET /admin/recurring_application_charges/#{id}.json

var charge = api.getRecurringApplicationCharge(); // WRONG
var charge = api.getRecurringApplicationCharge({ id: 10233 }); // OK
```

End point list
--------------

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
MIT

