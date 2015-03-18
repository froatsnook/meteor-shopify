// For security reasons (cross-domain AJAX is not allowed by default in
// browsers, and api keys and passwords should not be exposed), most clients
// must proxy their requests through the server.
//
// Each time a request gets proxied, we look in a cache of Shopify.API objects
// that were created on the server.  A Shopify.API exists for each shop that
// has already been proxied.  These cached Shopify.API objects are only really
// needed for performance and for having a shared call limit tracker (and
// corresponding request queue).  These cached objects are deleted when the
// call limit (estimate) hits 0.
Shopify._cachedAPIs = { };

// @todo delete from cache when call limit tracker hits 0.
// @todo add tests
Shopify._getCachedAPI = function(apiConfig) {
    var shop = apiConfig.shop;

    var cached = Shopify._cachedAPIs[shop];
    if (!cached) {
        cached = Shopify._cachedAPIs[shop] = new Shopify.API(apiConfig);
    }

    return cached;
};

