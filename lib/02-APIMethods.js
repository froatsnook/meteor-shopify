Shopify._APIMethods = [
    {
        "name": "getPolicies",
        "method": "GET",
        "path": "/admin/policies.json",
        "returns": "policies",
        "description": "Receive a list of all Policies"
    },
    {
        "name": "createRecurringApplicationCharge",
        "method": "POST",
        "path": "/admin/recurring_application_charges.json",
        "returns": "recurring_application_charge",
        "description": "Create a recurring application charge"
    },
    {
        "name": "getRecurringApplicationCharge",
        "method": "GET",
        "path": "/admin/recurring_application_charges/#{id}.json",
        "returns": "recurring_application_charge",
        "description": "Receive a single RecurringApplicationCharge"
    },
    {
        "name": "getRecurringApplicationCharges",
        "method": "GET",
        "path": "/admin/recurring_application_charges.json",
        "returns": "recurring_application_charges",
        "description": "Retrieve all recurring application charges"
    },
    {
        "name": "activateRecurringApplicationCharge",
        "method": "POST",
        "path": "/admin/recurring_application_charges/#{id}/activate.json",
        "description": "Activate a recurring application charge"
    },
    {
        "name": "cancelRecurringApplicationCharge",
        "method": "DELETE",
        "path": "/admin/recurring_application_charges/#{id}.json",
        "description": "Cancel a recurring application charge"
    },
    {
        "name": "getMetafields",
        "method": "GET",
        "path": "/admin/metafields.json",
        "returns": "metafields",
        "description": "Get metafields that belong to a store"
    },
    {
        "name": "getProductMetafields",
        "method": "GET",
        "path": "/admin/products/#{id}/metafields.json",
        "returns": "metafields",
        "description": "Get metafields that belong to a product"
    },
    {
        "name": "countMetafields",
        "method": "GET",
        "path": "/admin/metafields/count.json",
        "returns": "count",
        "description": "Get a count of metafields that belong to a store"
    },
    {
        "name": "countProductMetafields",
        "method": "GET",
        "path": "/admin/products/#{id}/metafields/count.json",
        "returns": "count",
        "description": "Get a count of metafields that belong to a product"
    },
    {
        "name": "getMetafieldByID",
        "method": "GET",
        "path": "/admin/metafields/#{id}.json",
        "returns": "metafield",
        "description": "Get a single store metafield by its ID"
    },
    {
        "name": "getProductMetafieldByID",
        "method": "GET",
        "path": "/admin/products/#{productId}/metafields/#{id}.json",
        "returns": "metafield",
        "description": "Get a single product metafield by its ID"
    },
    {
        "name": "createMetafield",
        "method": "POST",
        "path": "/admin/metafields.json",
        "description": "Create a new metafield for a store"
    },
    {
        "name": "createProductMetafield",
        "method": "POST",
        "path": "/admin/products/#{id}/metafields.json",
        "returns": "metafield",
        "description": "Create a new metafield for a product"
    },
    {
        "name": "modifyMetafield",
        "method": "PUT",
        "path": "/admin/metafields/#{id}.json",
        "returns": "metafield",
        "description": "Update a store metafield"
    },
    {
        "name": "modifyProductMetafield",
        "method": "PUT",
        "path": "/admin/products/#{productId}/metafields/#{id}.json",
        "returns": "metafield",
        "description": "Update a product metafield"
    },
    {
        "name": "removeMetafield",
        "method": "DELETE",
        "path": "/admin/metafields/#{id}.json",
        "description": "Delete a store metafield"
    },
    {
        "name": "removeProductMetafield",
        "method": "DELETE",
        "path": "/admin/products/#{productId}/metafields/#{id}.json",
        "description": "Delete a product metafield"
    },
    {
        "name": "getWebhooks",
        "method": "GET",
        "path": "/admin/webhooks.json",
        "returns": "webhooks",
        "description": "Receive a list of all Webhooks"
    },
    {
        "name": "countWebhooks",
        "method": "GET",
        "path": "/admin/webhooks/count.json",
        "returns": "count",
        "description": "Receive a count of all Webhooks"
    },
    {
        "name": "getWebhook",
        "method": "GET",
        "path": "/admin/webhooks/#{id}.json",
        "returns": "webhook",
        "description": "Receive a single Webhook"
    },
    {
        "name": "createWebhook",
        "method": "POST",
        "path": "/admin/webhooks.json",
        "returns": "webhook",
        "description": "Create a new Webhook"
    },
    {
        "name": "modifyWebhook",
        "method": "PUT",
        "path": "/admin/webhooks/#{id}.json",
        "returns": "webhook",
        "description": "Modify an existing Webhook"
    },
    {
        "name": "removeWebhook",
        "method": "DELETE",
        "path": "/admin/webhooks/#{id}.json",
        "description": "Remove a Webhook from the database"
    },
    {
        "name": "getProvinces",
        "method": "GET",
        "path": "/admin/countries/#{id}/provinces.json",
        "returns": "provinces",
        "description": "Receive a list of all Provinces"
    },
    {
        "name": "countProvinces",
        "method": "GET",
        "path": "/admin/countries/#{id}/provinces/count.json",
        "returns": "count",
        "description": "Receive a count of all Provinces"
    },
    {
        "name": "getProvince",
        "method": "GET",
        "path": "/admin/countries/#{countryId}/provinces/#{id}.json",
        "returns": "province",
        "description": "Receive a single Province"
    },
    {
        "name": "modifyProvince",
        "method": "PUT",
        "path": "/admin/countries/#{countryId}/provinces/#{id}.json",
        "returns": "province",
        "description": "Modify an existing Province"
    },
    {
        "name": "getCustomerSavedSearches",
        "method": "GET",
        "path": "/admin/customer_saved_searches.json",
        "returns": "customer_saved_searches",
        "description": "Receive a list of all CustomerSavedSearches"
    },
    {
        "name": "countCustomerSavedSearches",
        "method": "GET",
        "path": "/admin/customer_saved_searches/count.json",
        "returns": "count",
        "description": "Receive a count of all CustomerSavedSearches"
    },
    {
        "name": "getCustomerSavedSearch",
        "method": "GET",
        "path": "/admin/customer_saved_searches/#{id}.json",
        "returns": "customer_saved_search",
        "description": "Receive a single CustomerSavedSearch"
    },
    {
        "name": "getCustomersFromCustomerSavedSearch",
        "method": "GET",
        "path": "/admin/customer_saved_searches/#{id}/customers.json",
        "returns": "customers",
        "description": "Receive all Customers resulting from a Customer Saved Search"
    },
    {
        "name": "createCustomerSavedSearch",
        "method": "POST",
        "path": "/admin/customer_saved_searches.json",
        "returns": "customer_saved_search",
        "description": "Create a new CustomerSavedSearch"
    },
    {
        "name": "modifyCustomerSavedSearch",
        "method": "PUT",
        "path": "/admin/customer_saved_searches/#{id}.json",
        "returns": "customer_saved_search",
        "description": "Modify an existing CustomerSavedSearch"
    },
    {
        "name": "removeCustomerSavedSearch",
        "method": "DELETE",
        "path": "/admin/customer_saved_searches/#{id}.json",
        "description": "Remove a CustomerSavedSearch from the database"
    },
    {
        "name": "getVariants",
        "method": "GET",
        "path": "/admin/products/#{id}/variants.json",
        "returns": "variants",
        "description": "Receive a list of all Product Variants"
    },
    {
        "name": "countVariants",
        "method": "GET",
        "path": "/admin/products/#{id}/variants/count.json",
        "returns": "count",
        "description": "Receive a count of all Product Variants"
    },
    {
        "name": "getVariant",
        "method": "GET",
        "path": "/admin/variants/#{id}.json",
        "returns": "variant",
        "description": "Receive a single Product Variant"
    },
    {
        "name": "createVariant",
        "method": "POST",
        "path": "/admin/products/#{id}/variants.json",
        "returns": "variant",
        "description": "Create a new Product Variant"
    },
    {
        "name": "modifyVariant",
        "method": "PUT",
        "path": "/admin/variants/#{id}.json",
        "returns": "variant",
        "description": "Modify an existing Product Variant"
    },
    {
        "name": "removeVariant",
        "method": "DELETE",
        "path": "/admin/products/#{productId}/variants/#{id}.json",
        "description": "Remove a Product Variant from the database"
    },
    {
        "name": "countCheckouts",
        "method": "GET",
        "path": "/admin/checkouts/count.json",
        "returns": "count",
        "description": "Receive a count of all Checkouts"
    },
    {
        "name": "getCheckouts",
        "method": "GET",
        "path": "/admin/checkouts.json",
        "returns": "checkouts",
        "description": "Receive a list of all Checkouts"
    },
    {
        "name": "getCustomers",
        "method": "GET",
        "path": "/admin/customers.json",
        "returns": "customers",
        "description": "Receive a list of all Customers"
    },
    {
        "name": "searchCustomers",
        "method": "GET",
        "path": "/admin/customers/search.json",
        "returns": "customers",
        "description": "Search for customers matching supplied query"
    },
    {
        "name": "getCustomer",
        "method": "GET",
        "path": "/admin/customers/#{id}.json",
        "returns": "customer",
        "description": "Receive a single Customer"
    },
    {
        "name": "createCustomer",
        "method": "POST",
        "path": "/admin/customers.json",
        "returns": "customer",
        "description": "Create a new Customer"
    },
    {
        "name": "modifyCustomer",
        "method": "PUT",
        "path": "/admin/customers/#{id}.json",
        "returns": "customer",
        "description": "Modify an existing Customer"
    },
    {
        "name": "removeCustomer",
        "method": "DELETE",
        "path": "/admin/customers/#{id}.json",
        "description": "Remove a Customer from the database"
    },
    {
        "name": "countCustomers",
        "method": "GET",
        "path": "/admin/customers/count.json",
        "returns": "count",
        "description": "Receive a count of all Customers"
    },
    {
        "name": "getShop",
        "method": "GET",
        "path": "/admin/shop.json",
        "returns": "shop",
        "description": "Receive a single Shop"
    },
    {
        "name": "getTransactions",
        "method": "GET",
        "path": "/admin/orders/#{id}/transactions.json",
        "returns": "transactions",
        "description": "Receive a list of all Transactions"
    },
    {
        "name": "countTransactions",
        "method": "GET",
        "path": "/admin/orders/#{id}/transactions/count.json",
        "returns": "count",
        "description": "Receive a count of all Transactions"
    },
    {
        "name": "getTransaction",
        "method": "GET",
        "path": "/admin/orders/#{orderId}/transactions/#{id}.json",
        "returns": "transaction",
        "description": "Receive a single Transaction"
    },
    {
        "name": "createTransaction",
        "method": "POST",
        "path": "/admin/orders/#{id}/transactions.json",
        "returns": "transaction",
        "description": "Create a new Transaction"
    },
    {
        "name": "getThemes",
        "method": "GET",
        "path": "/admin/themes.json",
        "returns": "themes",
        "description": "Receive a list of all Themes"
    },
    {
        "name": "getTheme",
        "method": "GET",
        "path": "/admin/themes/#{id}.json",
        "returns": "theme",
        "description": "Receive a single Theme"
    },
    {
        "name": "createTheme",
        "method": "POST",
        "path": "/admin/themes.json",
        "returns": "theme",
        "description": "Create a new Theme"
    },
    {
        "name": "modifyTheme",
        "method": "PUT",
        "path": "/admin/themes/#{id}.json",
        "returns": "theme",
        "description": "Modify an existing Theme"
    },
    {
        "name": "removeTheme",
        "method": "DELETE",
        "path": "/admin/themes/#{id}.json",
        "description": "Remove a Theme from the database"
    },
    {
        "name": "getProducts",
        "method": "GET",
        "path": "/admin/products.json",
        "returns": "products",
        "description": "Receive a list of all Products"
    },
    {
        "name": "countProducts",
        "method": "GET",
        "path": "/admin/products/count.json",
        "returns": "count",
        "description": "Receive a count of all Products"
    },
    {
        "name": "getProduct",
        "method": "GET",
        "path": "/admin/products/#{id}.json",
        "returns": "product",
        "description": "Receive a single Product"
    },
    {
        "name": "createProduct",
        "method": "POST",
        "path": "/admin/products.json",
        "returns": "product",
        "description": "Create a new Product"
    },
    {
        "name": "modifyProduct",
        "method": "PUT",
        "path": "/admin/products/#{id}.json",
        "returns": "product",
        "description": "Modify an existing Product"
    },
    {
        "name": "removeProduct",
        "method": "DELETE",
        "path": "/admin/products/#{id}.json",
        "description": "Remove a Product from the database"
    },
    {
        "name": "getComments",
        "method": "GET",
        "path": "/admin/comments.json",
        "returns": "comments",
        "description": "Receive a list of all Comments"
    },
    {
        "name": "countComments",
        "method": "GET",
        "path": "/admin/comments/count.json",
        "returns": "count",
        "description": "Receive a count of all Comments"
    },
    {
        "name": "getComment",
        "method": "GET",
        "path": "/admin/comments/#{id}.json",
        "returns": "comment",
        "description": "Receive a single Comment"
    },
    {
        "name": "createComment",
        "method": "POST",
        "path": "/admin/comments.json",
        "returns": "comment",
        "description": "Create a new Comment"
    },
    {
        "name": "modifyComment",
        "method": "PUT",
        "path": "/admin/comments/#{id}.json",
        "returns": "comment",
        "description": "Modify an existing Comment"
    },
    {
        "name": "markCommentSpam",
        "method": "POST",
        "path": "/admin/comments/#{id}/spam.json",
        "description": "Mark a Comment as spam"
    },
    {
        "name": "markCommentNotSpam",
        "method": "POST",
        "path": "/admin/comments/#{id}/not_spam.json",
        "description": "Mark a Comment as not spam"
    },
    {
        "name": "approveComment",
        "method": "POST",
        "path": "/admin/comments/#{id}/approve.json",
        "description": "Approve a Comment"
    },
    {
        "name": "removeComment",
        "method": "POST",
        "path": "/admin/comments/#{id}/remove.json",
        "description": "Remove a Comment"
    },
    {
        "name": "restoreComment",
        "method": "POST",
        "path": "/admin/comments/#{id}/restore.json",
        "description": "Restore a Comment"
    },
    {
        "name": "createApplicationCharge",
        "method": "POST",
        "path": "/admin/application_charges.json",
        "returns": "application_charge",
        "description": "Create a new one-time application charge"
    },
    {
        "name": "getApplicationCharge",
        "method": "GET",
        "path": "/admin/application_charges/#{id}.json",
        "returns": "application_charge",
        "description": "Receive a single ApplicationCharge"
    },
    {
        "name": "getApplicationCharges",
        "method": "GET",
        "path": "/admin/application_charges.json",
        "returns": "application_charges",
        "description": "Retrieve all one-time application charges"
    },
    {
        "name": "activateApplicationCharge",
        "method": "POST",
        "path": "/admin/application_charges/#{id}/activate.json",
        "description": "Activate a one-time application charge"
    },
    {
        "name": "getAssets",
        "method": "GET",
        "path": "/admin/themes/#{id}/assets.json",
        "returns": "assets",
        "description": "Receive a list of all Assets"
    },
    {
        "name": "getAsset",
        "method": "GET",
        "path": "/admin/themes/#{id}/assets.json",
        "returns": "asset",
        "description": "Receive a single Asset"
    },
    {
        "name": "modifyAsset",
        "method": "PUT",
        "path": "/admin/themes/#{id}/assets.json",
        "returns": "asset",
        "description": "Creating or Modifying an Asset"
    },
    {
        "name": "removeAsset",
        "method": "DELETE",
        "path": "/admin/themes/#{id}/assets.json",
        "description": "Remove a Asset from the database"
    },
    {
        "name": "createCarrierService",
        "method": "POST",
        "path": "/admin/carrier_services.json",
        "returns": "carrier_service",
        "description": "Create a new CarrierService"
    },
    {
        "name": "modifyCarrierService",
        "method": "PUT",
        "path": "/admin/carrier_services/#{id}.json",
        "returns": "carrier_service",
        "description": "Modify an existing CarrierService"
    },
    {
        "name": "getCarrierServices",
        "method": "GET",
        "path": "/admin/carrier_services.json",
        "returns": "carrier_services",
        "description": "Receive a list of all CarrierServices"
    },
    {
        "name": "getCarrierService",
        "method": "GET",
        "path": "/admin/carrier_services/#{id}.json",
        "returns": "carrier_service",
        "description": "Receive a single CarrierService"
    },
    {
        "name": "removeCarrierService",
        "method": "DELETE",
        "path": "/admin/carrier_services/#{id}.json",
        "description": "Remove a CarrierService from the database"
    },
    {
        "name": "getOrders",
        "method": "GET",
        "path": "/admin/orders.json",
        "returns": "orders",
        "description": "Retrieve a list of Orders (OPEN Orders by default, use status=any for ALL orders)"
    },
    {
        "name": "getOrder",
        "method": "GET",
        "path": "/admin/orders/#{id}.json",
        "returns": "order",
        "description": "Receive a single Order"
    },
    {
        "name": "countOrders",
        "method": "GET",
        "path": "/admin/orders/count.json",
        "returns": "count",
        "description": "Receive a count of all Orders"
    },
    {
        "name": "closeOrder",
        "method": "POST",
        "path": "/admin/orders/#{id}/close.json",
        "returns": "order",
        "description": "Close an Order"
    },
    {
        "name": "openOrder",
        "method": "POST",
        "path": "/admin/orders/#{id}/open.json",
        "returns": "order",
        "description": "Re-open a closed Order"
    },
    {
        "name": "cancelOrder",
        "method": "POST",
        "path": "/admin/orders/#{id}/cancel.json",
        "returns": "order",
        "description": "Cancel an Order"
    },
    {
        "name": "createOrder",
        "method": "POST",
        "path": "/admin/orders.json",
        "returns": "order",
        "description": "Create a new Order"
    },
    {
        "name": "modifyOrder",
        "method": "PUT",
        "path": "/admin/orders/#{id}.json",
        "returns": "order",
        "description": "Modify an existing Order"
    },
    {
        "name": "removeOrder",
        "method": "DELETE",
        "path": "/admin/orders/#{id}.json",
        "description": "Remove a Order from the database"
    },
    {
        "name": "getCustomerAddresses",
        "method": "GET",
        "path": "/admin/customers/#{id}/addresses.json",
        "returns": "addresses",
        "description": "Receive a list of all CustomerAddresses"
    },
    {
        "name": "getCustomerAddress",
        "method": "GET",
        "path": "/admin/customers/#{customerId}/addresses/#{id}.json",
        "returns": "address",
        "description": "Receive a single CustomerAddress"
    },
    {
        "name": "createCustomerAddress",
        "method": "POST",
        "path": "/admin/customers/#{id}/addresses.json",
        "returns": "address",
        "description": "Create a new CustomerAddress"
    },
    {
        "name": "modifyCustomerAddress",
        "method": "PUT",
        "path": "/admin/customers/#{customerId}/addresses/#{id}.json",
        "returns": "address",
        "description": "Modify an existing CustomerAddress"
    },
    {
        "name": "removeCustomerAddress",
        "method": "DELETE",
        "path": "/admin/customers/#{customerId}/addresses/#{id}.json",
        "description": "Remove a CustomerAddress from the database"
    },
    {
        "name": "bulkModifyCustomerAddresses",
        "method": "PUT",
        "path": "/admin/customers/#{id}/addresses/set.json",
        "description": "Perform bulk operations against a number of addresses"
    },
    {
        "name": "setDefaultCustomerAddress",
        "method": "PUT",
        "path": "/admin/customers/#{customerId}/addresses/#{id}/default.json",
        "returns": "customer_address",
        "description": "Sets default address for a customer"
    },
    {
        "name": "getArticles",
        "method": "GET",
        "path": "/admin/blogs/#{id}/articles.json",
        "returns": "articles",
        "description": "Receive a list of all Articles"
    },
    {
        "name": "countArticles",
        "method": "GET",
        "path": "/admin/blogs/#{id}/articles/count.json",
        "returns": "count",
        "description": "Receive a count of all Articles"
    },
    {
        "name": "getArticle",
        "method": "GET",
        "path": "/admin/blogs/#{blogId}/articles/#{id}.json",
        "returns": "article",
        "description": "Receive a single Article"
    },
    {
        "name": "createArticle",
        "method": "POST",
        "path": "/admin/blogs/#{id}/articles.json",
        "returns": "article",
        "description": "Create a new Article"
    },
    {
        "name": "modifyArticle",
        "method": "PUT",
        "path": "/admin/blogs/#{blogId}/articles/#{id}.json",
        "returns": "article",
        "description": "Modify an existing Article"
    },
    {
        "name": "getAuthors",
        "method": "GET",
        "path": "/admin/articles/authors.json",
        "returns": "authors",
        "description": "Get a list of all the authors"
    },
    {
        "name": "getTags",
        "method": "GET",
        "path": "/admin/articles/tags.json",
        "returns": "tags",
        "description": "Get a list of all the tags"
    },
    {
        "name": "removeArticle",
        "method": "DELETE",
        "path": "/admin/blogs/#{blogId}/articles/#{id}.json",
        "description": "Remove a Article from the database"
    },
    {
        "name": "getBlogs",
        "method": "GET",
        "path": "/admin/blogs.json",
        "returns": "blogs",
        "description": "Receive a list of all Blogs"
    },
    {
        "name": "countBlogs",
        "method": "GET",
        "path": "/admin/blogs/count.json",
        "returns": "count",
        "description": "Receive a count of all Blogs"
    },
    {
        "name": "getBlog",
        "method": "GET",
        "path": "/admin/blogs/#{id}.json",
        "returns": "blog",
        "description": "Receive a single Blog"
    },
    {
        "name": "createBlog",
        "method": "POST",
        "path": "/admin/blogs.json",
        "returns": "blog",
        "description": "Create a new Blog"
    },
    {
        "name": "modifyBlog",
        "method": "PUT",
        "path": "/admin/blogs/#{id}.json",
        "returns": "blog",
        "description": "Modify an existing Blog"
    },
    {
        "name": "removeBlog",
        "method": "DELETE",
        "path": "/admin/blogs/#{id}.json",
        "description": "Remove a Blog from the database"
    },
    {
        "name": "getPages",
        "method": "GET",
        "path": "/admin/pages.json",
        "returns": "pages",
        "description": "Receive a list of all Pages"
    },
    {
        "name": "countPages",
        "method": "GET",
        "path": "/admin/pages/count.json",
        "returns": "count",
        "description": "Receive a count of all Pages"
    },
    {
        "name": "getPage",
        "method": "GET",
        "path": "/admin/pages/#{id}.json",
        "returns": "page",
        "description": "Receive a single Page"
    },
    {
        "name": "createPage",
        "method": "POST",
        "path": "/admin/pages.json",
        "returns": "page",
        "description": "Create a new Page"
    },
    {
        "name": "modifyPage",
        "method": "PUT",
        "path": "/admin/pages/#{id}.json",
        "returns": "page",
        "description": "Modify an existing Page"
    },
    {
        "name": "removePage",
        "method": "DELETE",
        "path": "/admin/pages/#{id}.json",
        "description": "Remove a Page from the database"
    },
    {
        "name": "getLocations",
        "method": "GET",
        "path": "/admin/locations.json",
        "returns": "locations",
        "description": "Receive a list of all Locations"
    },
    {
        "name": "getLocation",
        "method": "GET",
        "path": "/admin/locations/#{id}.json",
        "returns": "location",
        "description": "Receive a single Location"
    },
    {
        "name": "getRedirects",
        "method": "GET",
        "path": "/admin/redirects.json",
        "returns": "redirects",
        "description": "Receive a list of all Redirects"
    },
    {
        "name": "countRedirects",
        "method": "GET",
        "path": "/admin/redirects/count.json",
        "returns": "count",
        "description": "Receive a count of all Redirects"
    },
    {
        "name": "getRedirect",
        "method": "GET",
        "path": "/admin/redirects/#{id}.json",
        "returns": "redirect",
        "description": "Receive a single Redirect"
    },
    {
        "name": "createRedirect",
        "method": "POST",
        "path": "/admin/redirects.json",
        "returns": "redirect",
        "description": "Create a new Redirect"
    },
    {
        "name": "modifyRedirect",
        "method": "PUT",
        "path": "/admin/redirects/#{id}.json",
        "returns": "redirect",
        "description": "Modify an existing Redirect"
    },
    {
        "name": "removeRedirect",
        "method": "DELETE",
        "path": "/admin/redirects/#{id}.json",
        "description": "Remove a Redirect from the database"
    },
    {
        "name": "getSmartCollections",
        "method": "GET",
        "path": "/admin/smart_collections.json",
        "returns": "smart_collections",
        "description": "Receive a list of all SmartCollections"
    },
    {
        "name": "countSmartCollections",
        "method": "GET",
        "path": "/admin/smart_collections/count.json",
        "returns": "count",
        "description": "Receive a count of all SmartCollections"
    },
    {
        "name": "getSmartCollection",
        "method": "GET",
        "path": "/admin/smart_collections/#{id}.json",
        "returns": "smart_collection",
        "description": "Receive a single SmartCollection"
    },
    {
        "name": "createSmartCollection",
        "method": "POST",
        "path": "/admin/smart_collections.json",
        "returns": "smart_collection",
        "description": "Create a new SmartCollection"
    },
    {
        "name": "modifySmartCollection",
        "method": "PUT",
        "path": "/admin/smart_collections/#{id}.json",
        "returns": "smart_collection",
        "description": "Modify an existing SmartCollection"
    },
    {
        "name": "removeSmartCollection",
        "method": "DELETE",
        "path": "/admin/smart_collections/#{id}.json",
        "description": "Remove a SmartCollection from the database"
    },
    {
        "name": "createCollect",
        "method": "POST",
        "path": "/admin/collects.json",
        "returns": "collect",
        "description": "Create a new Collect"
    },
    {
        "name": "removeCollect",
        "method": "DELETE",
        "path": "/admin/collects/#{id}.json",
        "description": "Remove a Collect from the database"
    },
    {
        "name": "getCollects",
        "method": "GET",
        "path": "/admin/collects.json",
        "returns": "collects",
        "description": "Receive a list of all Collects"
    },
    {
        "name": "countCollects",
        "method": "GET",
        "path": "/admin/collects/count.json",
        "returns": "count",
        "description": "Receive a count of all Collects"
    },
    {
        "name": "getCollect",
        "method": "GET",
        "path": "/admin/collects/#{id}.json",
        "returns": "collect",
        "description": "Receive a single Collect"
    },
    {
        "name": "getUsers",
        "method": "GET",
        "path": "/admin/users.json",
        "returns": "users",
        "description": "Receive a list of all Users"
    },
    {
        "name": "getUser",
        "method": "GET",
        "path": "/admin/users/#{id}.json",
        "returns": "user",
        "description": "Receive a single User"
    },
    {
        "name": "getEvents",
        "method": "GET",
        "path": "/admin/events.json",
        "returns": "events",
        "description": "Receive a list of all Events"
    },
    {
        "name": "getEvent",
        "method": "GET",
        "path": "/admin/events/#{id}.json",
        "returns": "event",
        "description": "Receive a single Event"
    },
    {
        "name": "countEvents",
        "method": "GET",
        "path": "/admin/events/count.json",
        "returns": "count",
        "description": "Receive a count of all Events"
    },
    {
        "name": "getFulfillments",
        "method": "GET",
        "path": "/admin/orders/#{id}/fulfillments.json",
        "returns": "fulfillments",
        "description": "Receive a list of all Fulfillments"
    },
    {
        "name": "countFulfillments",
        "method": "GET",
        "path": "/admin/orders/#{id}/fulfillments/count.json",
        "returns": "count",
        "description": "Receive a count of all Fulfillments"
    },
    {
        "name": "getFulfillment",
        "method": "GET",
        "path": "/admin/orders/#{orderId}/fulfillments/#{id}.json",
        "returns": "fulfillment",
        "description": "Receive a single Fulfillment"
    },
    {
        "name": "createFulfillment",
        "method": "POST",
        "path": "/admin/orders/#{id}/fulfillments.json",
        "returns": "fulfillment",
        "description": "Create a new Fulfillment"
    },
    {
        "name": "modifyFulfillment",
        "method": "PUT",
        "path": "/admin/orders/#{orderId}/fulfillments/#{id}.json",
        "returns": "fulfillment",
        "description": "Modify an existing Fulfillment"
    },
    {
        "name": "completeFulfillment",
        "method": "POST",
        "path": "/admin/orders/#{orderId}/fulfillments/#{id}/complete.json",
        "returns": "fulfillment",
        "description": "Complete a pending fulfillment"
    },
    {
        "name": "cancelFulfillment",
        "method": "POST",
        "path": "/admin/orders/#{orderId}/fulfillments/#{id}/cancel.json",
        "returns": "fulfillment",
        "description": "Cancel a pending fulfillment"
    },
    {
        "name": "getRefund",
        "method": "GET",
        "path": "/admin/orders/#{orderId}/refunds/#{id}.json",
        "returns": "refund",
        "description": "Receive a single Refund"
    },
    {
        "name": "getCustomCollections",
        "method": "GET",
        "path": "/admin/custom_collections.json",
        "returns": "custom_collections",
        "description": "Receive a list of all CustomCollections"
    },
    {
        "name": "countCustomCollections",
        "method": "GET",
        "path": "/admin/custom_collections/count.json",
        "returns": "count",
        "description": "Receive a count of all CustomCollections"
    },
    {
        "name": "getCustomCollection",
        "method": "GET",
        "path": "/admin/custom_collections/#{id}.json",
        "returns": "custom_collection",
        "description": "Receive a single CustomCollection"
    },
    {
        "name": "createCustomCollection",
        "method": "POST",
        "path": "/admin/custom_collections.json",
        "returns": "custom_collection",
        "description": "Create a new CustomCollection"
    },
    {
        "name": "modifyCustomCollection",
        "method": "PUT",
        "path": "/admin/custom_collections/#{id}.json",
        "returns": "custom_collection",
        "description": "Modify an existing CustomCollection"
    },
    {
        "name": "removeCustomCollection",
        "method": "DELETE",
        "path": "/admin/custom_collections/#{id}.json",
        "description": "Remove a CustomCollection from the database"
    },
    {
        "name": "getFulfillmentServices",
        "method": "GET",
        "path": "/admin/fulfillment_services.json",
        "returns": "fulfillment_services",
        "description": "Receive a list of all FulfillmentServices"
    },
    {
        "name": "createFulfillmentService",
        "method": "POST",
        "path": "/admin/fulfillment_services.json",
        "returns": "fulfillment_service",
        "description": "Create a new FulfillmentService"
    },
    {
        "name": "getFulfillmentService",
        "method": "GET",
        "path": "/admin/fulfillment_services/#{id}.json",
        "returns": "fulfillment_service",
        "description": "Receive a single FulfillmentService"
    },
    {
        "name": "modifyFulfillmentService",
        "method": "PUT",
        "path": "/admin/fulfillment_services/#{id}.json",
        "returns": "fulfillment_service",
        "description": "Modify an existing FulfillmentService"
    },
    {
        "name": "removeFulfillmentService",
        "method": "DELETE",
        "path": "/admin/fulfillment_services/#{id}.json",
        "description": "Remove a FulfillmentService from the database"
    },
    {
        "name": "getCountries",
        "method": "GET",
        "path": "/admin/countries.json",
        "returns": "countries",
        "description": "Receive a list of all Countries"
    },
    {
        "name": "countCountries",
        "method": "GET",
        "path": "/admin/countries/count.json",
        "returns": "count",
        "description": "Receive a count of all Countries"
    },
    {
        "name": "getCountry",
        "method": "GET",
        "path": "/admin/countries/#{id}.json",
        "returns": "country",
        "description": "Receive a single Country"
    },
    {
        "name": "createCountry",
        "method": "POST",
        "path": "/admin/countries.json",
        "returns": "country",
        "description": "Create a new Country"
    },
    {
        "name": "modifyCountry",
        "method": "PUT",
        "path": "/admin/countries/#{id}.json",
        "returns": "country",
        "description": "Modify an existing Country"
    },
    {
        "name": "removeCountry",
        "method": "DELETE",
        "path": "/admin/countries/#{id}.json",
        "description": "Remove a Country from the database"
    },
    {
        "name": "createRisk",
        "method": "POST",
        "path": "/admin/orders/#{id}/risks.json",
        "returns": "risk",
        "description": "Create a new Order Risks"
    },
    {
        "name": "getRisks",
        "method": "GET",
        "path": "/admin/orders/#{id}/risks.json",
        "returns": "risks",
        "description": "Receive a list of all Order Risks"
    },
    {
        "name": "getRisk",
        "method": "GET",
        "path": "/admin/orders/#{orderId}/risks/#{id}.json",
        "returns": "risk",
        "description": "Receive a single Order Risks"
    },
    {
        "name": "modifyRisk",
        "method": "PUT",
        "path": "/admin/orders/#{orderId}/risks/#{id}.json",
        "returns": "risk",
        "description": "Modify an existing Order Risks"
    },
    {
        "name": "getProductImages",
        "method": "GET",
        "path": "/admin/products/#{id}/images.json",
        "returns": "images",
        "description": "Receive a list of all Product Images"
    },
    {
        "name": "countProductImages",
        "method": "GET",
        "path": "/admin/products/#{id}/images/count.json",
        "returns": "count",
        "description": "Receive a count of all Product Images"
    },
    {
        "name": "getProductImage",
        "method": "GET",
        "path": "/admin/products/#{productId}/images/#{id}.json",
        "returns": "image",
        "description": "Receive a single Product Image"
    },
    {
        "name": "createProductImage",
        "method": "POST",
        "path": "/admin/products/#{id}/images.json",
        "returns": "image",
        "description": "Create a new Product Image"
    },
    {
        "name": "modifyProductImage",
        "method": "PUT",
        "path": "/admin/products/#{productId}/images/#{id}.json",
        "returns": "image",
        "description": "Modify an existing Product Image"
    },
    {
        "name": "removeProductImage",
        "method": "DELETE",
        "path": "/admin/products/#{productId}/images/#{id}.json",
        "description": "Remove a Product Image from the database"
    }
];

Object.freeze(Shopify._APIMethods);

Shopify._APIConcatMethods = [
    {
        "name": "getAllOrders",
        "count": "countOrders",
        "fetch": "getOrders"
    },
    {
        "name": "getAllProducts",
        "count": "countProducts",
        "fetch": "getProducts"
    },
    {
        "name": "getAllCollects",
        "count": "countCollects",
        "fetch": "getCollects"
    }
];

Object.freeze(Shopify._APIConcatMethods);

