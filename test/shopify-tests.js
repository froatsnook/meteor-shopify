// test.isFalse(v, msg)
// test.isTrue(v, msg)
// test.equal(actual, expected, message, not)
// test.length(obj, len)
// test.include(s, v)
// test.isNaN(v, msg)
// test.isUndefined(v, msg)
// test.isNotNull
// test.isNull
// test.throws(func)
// test.instanceOf(obj, klass)
// test.notEqual(actual, expected, message)
// test.runId()
// test.exception(exception)
// test.expect_fail()
// test.ok(doc)
// test.fail(doc)

/* global Meteor */
/* global check */
/* global Tinytest */
/* global Shopify */
/* global Meteor */

"use strict";

var newAPI = function(options) {
    if (!options) {
        options = { };
    }

    options.access_token = options.access_token || "yes";
    options.shop = options.shop || Meteor.uuid();

    var api = new Shopify.API(options);
    api._HOST_OVERRIDE = "http://localhost:10494";
    api.additionalHeaders["X-SHOP"] = options.shop;

    return api;
};

if (Meteor.isServer) {

    // @todo api - valid params (and use dot form instead of [])

    Tinytest.add("api - valid params", function(test) {
        Shopify._APIMethods.forEach(function(info) {
            var paramFinder = /#{(.+?)}/g;
            var params = [];

            var m;
            while ((m = paramFinder.exec(info.path))) {
                params.push(m[1]);
            }

            params.forEach(function(param) {
                test.isTrue(/^\w+$/.test(param));
            });
        });
    });

    Tinytest.add("api - valid returns", function(test) {
        Shopify._APIMethods.forEach(function(info) {
            if (info.returns) {
                test.isTrue(/^\w+$/.test(info.returns));
            }
        });
    });

    Tinytest.add("auth - good access_token", function(test) {
        var api = newAPI();
        api.countOrders();
        test.ok(true);
    });

    Tinytest.add("auth - bad access_token", function(test) {
        var api = newAPI({ access_token: "no" });

        test.throws(function() {
            api.countOrders();
        });
    });

    Tinytest.add("auth - good password", function(test) {
        var api = newAPI({
            access_token: null,
            api_key: "apikey",
            password: "yes"
        });

        api.countOrders();
        test.ok(true);
    });

    Tinytest.add("auth - bad password", function(test) {
        var api = newAPI({
            access_token: null,
            api_key: "apikey",
            password: "no"
        });

        test.throws(function() {
            api.countOrders();
        });
    });

    Tinytest.add("getOrder - basic", function(test) {
        var api = newAPI();

        var order = api.getOrder({
            id: 4
        });

        test.equal(typeof order, "object");
        test.equal(order.id, 4);
    });

    Tinytest.add("getOrder - no such order", function(test) {
        var api = newAPI();

        test.throws(function() {
            api.getOrder({
                id: 1004
            });
        });
    });

    Tinytest.add("getOrder - fields", function(test) {
        var api = newAPI();

        var fields = ["currency", "name", "source_name"];
        var order = api.getOrder({
            id: 1000,
            fields: fields.join(",")
        });

        var keys = Object.keys(order);
        test.equal(keys.length, fields.length);
        test.equal(order.currency, "USD");
        test.equal(order.name, "#1000");
        test.equal(order.source_name, "web");
    });

    Tinytest.add("countOrders - basic", function(test) {
        var api = newAPI();
        var count = api.countOrders();
        test.equal(count, 1000);
    });

    Tinytest.add("countOrders - created_at_max", function(test) {
        var api = newAPI();
        var count = api.countOrders({
            // There are two orders created in the first 5 minutes after the unix epoch
            created_at_max: new Date(5*1000*60)
        });

        test.equal(count, 2);
    });

    Tinytest.add("countOrders - created_at_min and created_at_max", function(test) {
        var api = newAPI();
        var count = api.countOrders({
            // There are 10 orders between 5 minutes after epoch and 25 minutes after epoch
            created_at_min: new Date(5*1000*60),
            created_at_max: new Date(25*1000*60)
        });

        test.equal(count, 10);
    });

    Tinytest.add("countOrders - status", function(test) {
        var api = newAPI();
        var open = api.countOrders({ status: "open" });
        var closed = api.countOrders({ status: "closed" });
        var any = api.countOrders({ status: "any" });

        test.equal(open, 500);
        test.equal(closed, 500);
        test.equal(any, 1000);
    });

    Tinytest.add("countOrders - all filters", function(test) {
        var api = newAPI();

        // Ensure open, authorized, shipped
        var n = 5*2*3;

        var count = api.countOrders({
            status: "open",
            financial_status: "authorized",
            fulfillment_status: "shipped",
            updated_at_min: new Date(1*1000*60),
            updated_at_max: new Date((2*n - 1)*1000*60)
        });

        test.equal(count, 1);
    });

    Tinytest.add("getOrders - basic", function(test) {
        var api = newAPI();
        var page1 = api.getOrders();
        var page2 = api.getOrders({ page: 2 });

        test.equal(page1.length, 50);
        test.equal(page2.length, 50);

        // Orders 2,4,6,8,... are open.
        test.equal(page1[0].name, "#2");
        test.equal(page2[0].name, "#102");
    });

    Tinytest.add("getOrders - with IDs", function(test) {
        var api = newAPI();
        var orders = api.getOrders({ ids: "1,4,10,14" });

        test.equal(orders.length, 4);
        test.equal(orders[0].name, "#1");
        test.equal(orders[1].name, "#4");
        test.equal(orders[2].name, "#10");
        test.equal(orders[3].name, "#14");
    });

    Tinytest.add("getOrders - with params", function(test) {
        var api = newAPI();

        var orders = api.getOrders({
            financial_status: "authorized",
            fulfillment_status: "shipped",
        });

        // Orders are open, authorized, and shipped every 30 starting at 15.
        test.equal(orders.length, 33);

        var order = orders[0];
        test.equal(order.closed_at, null);
        test.equal(order.financial_status, "authorized");
        test.equal(order.fulfillment_status, "shipped");
    });

    Tinytest.add("getAllOrders - basic", function(test) {
        var api = newAPI();

        var orders = api.getAllOrders();

        test.equal(orders.length, 500);
        test.equal(orders[499].name, "#1000");
    });

    Tinytest.add("getAllOrders - with params", function(test) {
        var api = newAPI();

        var orders = api.getAllOrders({
            status: "any",
            created_at_min: new Date(5*1000*60)
        });

        test.equal(orders.length, 998);
    });

    Tinytest.add("order actions - close and open", function(test) {
        var api = newAPI({ shop: "close-shop" });

        var before = api.getOrder({ id: 4, fields: "closed_at" });
        test.equal(before.closed_at, null);

        api.closeOrder({ id: 4 });

        var after = api.getOrder({ id: 4, fields: "closed_at" });
        test.equal(typeof after.closed_at, "string");

        api.openOrder({ id: 4 });

        var restored = api.getOrder({ id: 4, fields: "closed_at" });
        test.equal(restored.closed_at, null);
    });

    Tinytest.add("getProduct - basic", function(test) {
        var api = newAPI();

        var order = api.getProduct({
            id: 4
        });

        test.equal(typeof order, "object");
        test.equal(order.id, 4);
    });

    Tinytest.add("getProduct - fields", function(test) {
        var api = newAPI();

        var fields = ["id", "handle", "product_type"];
        var order = api.getProduct({
            id: 1000,
            fields: fields.join(",")
        });

        var keys = Object.keys(order);
        test.equal(keys.length, fields.length);
        test.equal(order.id, 1000);
        test.equal(order.handle, "product-1000");
        test.equal(order.product_type, "Even Products");
    });

    Tinytest.add("countProducts - basic", function(test) {
        var api = newAPI();
        var count = api.countProducts();
        test.equal(count, 1000);
    });

    Tinytest.add("getProducts - basic", function(test) {
        var api = newAPI();
        var page1 = api.getProducts();
        var page2 = api.getProducts({ page: 2 });

        test.equal(page1.length, 50);
        test.equal(page2.length, 50);

        test.equal(page1[0].id, 1);
        test.equal(page2[0].id, 51);
    });

    Tinytest.add("getAllProducts - basic", function(test) {
        var api = newAPI();

        var orders = api.getAllProducts();

        test.equal(orders.length, 1000);
        test.equal(orders[999].id, 1000);
    });

    Tinytest.add("getAllProducts - with params", function(test) {
        var api = newAPI();

        var orders = api.getAllProducts({
            created_at_min: new Date(201*1000*60),
            product_type: "Even Products"
        });

        test.equal(orders.length, 450);
    });

    Tinytest.add("rate limiting - ensure wait", function(test) {
        var api = newAPI({ shop: "rate-limit-shop" });

        // Start backing off faster than normal for testing rate limiting.
        api.backoff = 10;

        // First hit the backoff limit.
        var start = Date.now();
        for (var i = 0; i < 10; i++) { api.countOrders(); }
        var mid = Date.now();

        // The first requests should have been fast.
        test.isTrue(mid - start < 100, "first batch should be fast");

        // Then make 6 more requests (use the async version).
        var done = 0;
        for (var i = 0; i < 6; i++) {
            api._countOrders(function() { done++; });
        }

        // Wait until done (50ms resolution is enough for testing).
        while (done < 6) {
            Meteor.sleep(50);
        }

        // The last requests should have taken about 500ms each.
        var end = Date.now();
        test.isTrue(end - mid > 2500, "second batch should take more than 4.5s");
        test.isTrue(end - mid < 3500, "second batch should take less than 5.5s");
    });

    Tinytest.add("utils - IsNonEmptyString", function(test) {
        var runTest = function(str, shouldThrow) {
            try {
                check(str, Shopify._IsNonEmptyString);
                test.equal(shouldThrow, "does not throw");
            } catch (err) {
                test.equal(shouldThrow, "does throw");
            }
        };

        // These should not throw.
        runTest("a", "does not throw");
        runTest("abcd", "does not throw");

        // These should throw.
        runTest("", "does throw");
        runTest(null, "does throw");
        runTest(undefined, "does throw");
        runTest({}, "does throw");
        runTest([], "does throw");
        runTest(1, "does throw");
        runTest(new Date(), "does throw");
    });

} else if (Meteor.isClient) {

}

