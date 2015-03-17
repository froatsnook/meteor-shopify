"use strict";

var express = Npm.require("express");

var port = 10494;
var app = express();

// shop => rate limit (out of 40)
var buckets = { };

function Bucket(shop) {
    var self = this;
    buckets[shop] = this;

    this.val = 0;
    this.interval = setInterval(function() {
        if (--self.val <= 0) {
            clearInterval(self.val);
            delete buckets[shop];
        }
    }, 500);
}

function getBucket(shop) {
    var bucket = buckets[shop] || new Bucket(shop);
    return bucket.val;
}

function recordCall(shop) {
    var bucket = buckets[shop] || new Bucket(shop);
    return ++bucket.val;
}

setInterval(function() {
    for (var shop in buckets) {
        buckets[shop]--;
        if (buckets[shop] === 0) {
            console.log("bucket for '%s' is empty", shop);
            delete buckets[shop];
        }
    }
}, 500);

// Format a date like "2012-03-13T16:09:55-04:00" (API output format).
var formatDate = function(time) {
    var date = new Date(time);
    var iso = date.toISOString();
    return iso.slice(0, 19) + "+00:00";
};

var randomDate = function() {
    return formatDate(Date.now() - 100000000*Math.random()*Math.random());
};

// Parse a date like "2012-03-13 16:09" (API input format).
var parseDate = function(date) {
    return new Date(date + " GMT+0000");
};

var makeFinancialStatus = function(n) {
    switch (n%5) {
        case 0: return "authorized";
        case 1: return "pending";
        case 2: return "paid";
        case 3: return "refunded";
        case 4: return "voided";
    }
};

var makeFulfillmentStatus = function(n) {
    switch (n%3) {
        case 0: return "shipped";
        case 1: return "partial";
        case 2: return "unshipped";
    }
};

// Make 1000 test orders.
//
// * n counts from 1 to 1000
//
// * nth order has `id` n
// * nth order has `created_at` 2*n minutes after unix epoch
// * nth order has `updated_at` 2*n minutes after unix epoch
//
// * status:
//   * if n%2 === 0, then open
//   * if n%2 === 1, then closed
//
// * financial_status:
//   * if n%5 === 0, then authorized
//   * if n%5 === 1, then pending
//   * if n%5 === 2, then paid
//   * if n%5 === 3, then refunded
//   * if n%5 === 4, then voided
//
// * fulfillment_status:
//   * if n%3 === 0, then shipped
//   * if n%3 === 1, then partial
//   * if n%3 === 2, then unshipped
//
var orders = [];
for (var i = 1; i <= 1000; i++) {
    orders.push({
        "buyer_accepts_marketing": false,
        "cancel_reason": null,
        "cancelled_at": null,
        "cart_token": "68778783ad298f1c80c3bafcddeea02f",
        "checkout_token": null,
        "closed_at": i%2 === 1 ? randomDate() : null,
        "confirmed": false,
        "created_at": formatDate(i*2*1000*60),
        "currency": "USD",
        "device_id": null,
        "email": "customer-" + i + "@hostmail.com",
        "financial_status": makeFinancialStatus(i),
        "fulfillment_status": makeFulfillmentStatus(i),
        "gateway": "authorize_net",
        "id": i,
        "landing_site": "http:\/\/www.example.com?source=abc",
        "location_id": null,
        "name": "#" + i,
        "note": null,
        "number": 1,
        "processed_at": randomDate(),
        "reference": "fhwdgads",
        "referring_site": "http:\/\/www.otherexample.com",
        "source_identifier": "fhwdgads",
        "source_name": "web",
        "source_url": null,
        "subtotal_price": i/100,
        "taxes_included": false,
        "test": false,
        "token": "b1946ac92492d2347c6235b4d2611184",
        "total_discounts": "0.00",
        "total_line_items_price": "398.00",
        "total_price": 10 + i/100,
        "total_price_usd": i/100,
        "total_tax": "0.00",
        "total_weight": 0,
        "updated_at": formatDate(i*1000*60),
        "user_id": null,
        "browser_ip": null,
        "landing_site_ref": "abc",
        "order_number": 1000 + i,
        "discount_codes": [
        {
            "code": "TENOFF",
            "amount": "10.00",
            "type": "percentage"
        }
        ],
        "note_attributes": [
        {
            "name": "custom engraving",
            "value": "Happy Birthday"
        },
        {
            "name": "colour",
            "value": "green"
        }
        ],
        "processing_method": "direct",
        "source": "browser",
        "checkout_id": 100000 + i,
        "tax_lines": [
        {
            "price": "0.00",
            "rate": 0.06,
            "title": "State Tax"
        }
        ],
        "tags": "",
        "line_items": [{
            "fulfillment_service": "manual",
            "fulfillment_status": null,
            "gift_card": false,
            "grams": 200,
            "id": 100000 + i,
            "price": 10 + i/100,
            "product_id": 100000 + i,
            "quantity": 1,
            "requires_shipping": true,
            "sku": "ITEM" + i,
            "taxable": true,
            "title": "IPod Nano - 8gb",
            "variant_id": "VARIANT" + i,
            "variant_title": "green",
            "vendor": null,
            "name": "Product " + i,
            "variant_inventory_management": "shopify",
            "properties": [
            {
                "name": "Custom Engraving Front",
                "value": "Happy Birthday"
            },
            {
                "name": "Custom Engraving Back",
                "value": "Merry Christmas"
            }
            ],
            "product_exists": true,
            "fulfillable_quantity": 1,
            "total_discount": "0.00",
            "tax_lines": [
            ]
        }],
        "shipping_lines": [{
            "code": "Free Shipping",
            "price": "0.00",
            "source": "shopify",
            "title": "Free Shipping",
            "tax_lines": [
            ]
        }],
        "billing_address": {
            "address1": "123 Amoebobacterieae St",
            "address2": "",
            "city": "Ottawa",
            "company": "",
            "country": "Canada",
            "first_name": "Bob",
            "last_name": "Bobsen",
            "latitude": 45.41634,
            "longitude": -75.6868,
            "phone": "(555)555-5555",
            "province": "Ontario",
            "zip": "K2P0V6",
            "name": "Bob Bobsen",
            "country_code": "CA",
            "province_code": "ON"
        },
        "shipping_address": {
            "address1": "123 Amoebobacterieae St",
            "address2": "",
            "city": "Ottawa",
            "company": "",
            "country": "Canada",
            "first_name": "Bob",
            "last_name": "Bobsen",
            "latitude": 45.41634,
            "longitude": -75.6868,
            "phone": "(555)555-5555",
            "province": "Ontario",
            "zip": "K2P0V6",
            "name": "Bob Bobsen",
            "country_code": "CA",
            "province_code": "ON"
        },
        "fulfillments": [{
            "created_at": "2015-03-09T17:40:16-04:00",
            "id": 255858046,
            "order_id": 450789469,
            "service": "manual",
            "status": "failure",
            "tracking_company": null,
            "updated_at": "2015-03-09T17:40:16-04:00",
            "tracking_number": "1Z2345",
            "tracking_numbers": [
                "1Z2345"
            ],
            "tracking_url": "http:\/\/wwwapps.ups.com\/etracking\/tracking.cgi?InquiryNumber1=1Z2345&TypeOfInquiryNumber=T&AcceptUPSLicenseAgreement=yes&submit=Track",
            "tracking_urls": [
                "http:\/\/wwwapps.ups.com\/etracking\/tracking.cgi?InquiryNumber1=1Z2345&TypeOfInquiryNumber=T&AcceptUPSLicenseAgreement=yes&submit=Track"
            ],
                "receipt": {
                    "testcase": true,
                    "authorization": "123456"
                },
                "line_items": [
                {
                    "fulfillment_service": "manual",
                    "fulfillment_status": null,
                    "gift_card": false,
                    "grams": 200,
                    "id": 466157049,
                    "price": "199.00",
                    "product_id": 632910392,
                    "quantity": 1,
                    "requires_shipping": true,
                    "sku": "IPOD2008GREEN",
                    "taxable": true,
                    "title": "IPod Nano - 8gb",
                    "variant_id": 39072856,
                    "variant_title": "green",
                    "vendor": null,
                    "name": "IPod Nano - 8gb - green",
                    "variant_inventory_management": "shopify",
                    "properties": [
                    {
                        "name": "Custom Engraving Front",
                        "value": "Happy Birthday"
                    },
                    {
                        "name": "Custom Engraving Back",
                        "value": "Merry Christmas"
                    }
                    ],
                    "product_exists": true,
                    "fulfillable_quantity": 1,
                    "total_discount": "0.00",
                    "tax_lines": [
                    ]
                }
            ]
        }],
        "client_details": {
            "accept_language": null,
            "browser_height": null,
            "browser_ip": "0.0.0.0",
            "browser_width": null,
            "session_hash": null,
            "user_agent": null
        },
        "refunds": [{
            "created_at": "2015-03-09T17:40:16-04:00",
            "id": 509562969,
            "note": "it broke during shipping",
            "order_id": 450789469,
            "restock": true,
            "user_id": 799407056,
            "refund_line_items": [
            {
                "id": 104689539,
                "line_item_id": 703073504,
                "quantity": 1,
                "line_item": {
                    "fulfillment_service": "manual",
                    "fulfillment_status": null,
                    "gift_card": false,
                    "grams": 200,
                    "id": 703073504,
                    "price": "199.00",
                    "product_id": 632910392,
                    "quantity": 1,
                    "requires_shipping": true,
                    "sku": "IPOD2008BLACK",
                    "taxable": true,
                    "title": "IPod Nano - 8gb",
                    "variant_id": 457924702,
                    "variant_title": "black",
                    "vendor": null,
                    "name": "IPod Nano - 8gb - black",
                    "variant_inventory_management": "shopify",
                    "properties": [
                    ],
                    "product_exists": true,
                    "fulfillable_quantity": 1,
                    "total_discount": "0.00",
                    "tax_lines": [
                    ]
                }
            },
            {
                "id": 709875399,
                "line_item_id": 466157049,
                "quantity": 1,
                "line_item": {
                    "fulfillment_service": "manual",
                    "fulfillment_status": null,
                    "gift_card": false,
                    "grams": 200,
                    "id": 466157049,
                    "price": "199.00",
                    "product_id": 632910392,
                    "quantity": 1,
                    "requires_shipping": true,
                    "sku": "IPOD2008GREEN",
                    "taxable": true,
                    "title": "IPod Nano - 8gb",
                    "variant_id": 39072856,
                    "variant_title": "green",
                    "vendor": null,
                    "name": "IPod Nano - 8gb - green",
                    "variant_inventory_management": "shopify",
                    "properties": [
                    {
                        "name": "Custom Engraving Front",
                        "value": "Happy Birthday"
                    },
                    {
                        "name": "Custom Engraving Back",
                        "value": "Merry Christmas"
                    }
                    ],
                    "product_exists": true,
                    "fulfillable_quantity": 1,
                    "total_discount": "0.00",
                    "tax_lines": [
                    ]
                }
            }
            ],
            "transactions": [{
                "amount": "209.00",
                "authorization": "authorization-key",
                "created_at": "2005-08-05T12:59:12-04:00",
                "currency": "USD",
                "gateway": "bogus",
                "id": 179259969,
                "kind": "refund",
                "location_id": null,
                "message": null,
                "order_id": 450789469,
                "parent_id": null,
                "source_name": "web",
                "status": "success",
                "test": false,
                "user_id": null,
                "device_id": null,
                "receipt": {},
                "error_code": null
            }]
        }],
        "payment_details": {
            "avs_result_code": null,
            "credit_card_bin": null,
            "cvv_result_code": null,
            "credit_card_number": "•••• •••• •••• 4242",
            "credit_card_company": "Visa"
        },
        "customer": {
            "accepts_marketing": false,
            "created_at": "2015-03-09T17:40:16-04:00",
            "email": "bob.norman@hostmail.com",
            "first_name": "Bob",
            "id": 207119551,
            "last_name": "Norman",
            "last_order_id": 450789469,
            "multipass_identifier": null,
            "note": null,
            "orders_count": 1,
            "state": "disabled",
            "total_spent": "41.94",
            "updated_at": "2015-03-09T17:40:16-04:00",
            "verified_email": true,
            "tags": "",
            "last_order_name": "#1001",
            "default_address": {
                "address1": "Chestnut Street 92",
                "address2": "",
                "city": "Louisville",
                "company": null,
                "country": "United States",
                "first_name": null,
                "id": 207119551,
                "last_name": null,
                "phone": "555-625-1199",
                "province": "Kentucky",
                "zip": "40202",
                "name": "",
                "province_code": "KY",
            }
        }
    });
}

// Make 1000 test products.
var products = [];
for (var i = 1; i <= 1000; i++) {
    products.push({
        body_html: "",
        "created_at": formatDate(i*2*1000*60),
        handle: "product-" + i,
        id: i,
        images: "[]",
        options: "[]",
        product_type: i%2 === 0 ? "Even Products" : "Odd Products",
        published_at: new Date(Date.now() - 10000000*Math.random()*Math.random()).toISOString(),
        published_scope: "global",
        tags: "Product, Nice Product",
        template_suffix: "null",
        title: "Product " + i,
        updated_at: new Date().toISOString(),
        variants: [{
            barcode: ("0000000" + i).slice(-6, -1),
            compare_at_price: "null",
            created_at: new Date(Date.now() - 100000000*Math.random()*Math.random()).toISOString(),
            fulfillment_service: "manual",
            grams: 200,
            weight: 0.2,
            weight_unit: "kg",
            id: 10000 + i,
            inventory_management: "shopify",
            inventory_policy: "continue",
            inventory_quantity: Math.max(0, 950 - i),
            option1: "Red",
            position: "1",
            price: i/100,
            product_id: 100000 + i,
            requires_shipping: i <= 500,
            sku: "PROD" + i,
            taxable: false,
            title: "Variant " + i,
            updated_at: new Date(Date.now() - 100000000*Math.random()*Math.random()).toISOString()
        }]
    });
}

// @todo figure out how shopify actually reacts to bad auth.
app.use(function(req, res, next) {
    if (req.path.indexOf("/admin") !== 0) {
        next();
        return;
    }

    // User can authenticate with access_token (for Public Apps) or password
    // (for Private Apps).
    var access_token = req.header("X-Shopify-Access-Token");
    var auth = req.header("authorization");

    if (access_token === "yes") {
        // Good access_token => OK
    } else if (access_token) {
        // Bad access token => Forbidden
        res.sendStatus(403);
        return;
    } else if (/^Basic (.*)$/.test(auth)) {
        var auth = RegExp.$1;
        var userpass = new Buffer(auth, "base64").toString();
        if (/^[^:]*:yes$/.test(userpass)) {
            // Good password => OK
        } else {
            // Bad password => Forbidden
            res.sendStatus(403);
            return;
        }
    } else if (auth) {
        // Malformed auth => Bad Request
        res.sendStatus(400);
        return;
    } else {
        // No auth => Unauthorized
        res.sendStatus(401);
        return;
    }

    next();
});

app.use(function(req, res, next) {
    var shop = req.header("X-SHOP");
    if (!shop) {
        next();
        return;
    }

    // If already at limit, reject.
    var bucket = getBucket(shop);
    if (bucket >= 40) {
        res.sendStatus(429);
        return;
    }

    // Increment the counter.
    var newBucket = recordCall(shop);
    res.setHeader("X-Shopify-Shop-Api-Call-Limit", newBucket + "/40");

    next();
});

// Return orders that match filters.
//
// @param filters {Object}
//   Key-val, like { status: "open", created_at_min: "2008-12-31 03:00" }
var filterOrders = function(filters) {
    var matching = orders;

    for (var key in filters) {
        var val = filters[key];

        switch (key) {
            case "created_at_min":
                var date = parseDate(val);
                var formatted = formatDate(date.getTime());
                matching = matching.filter(function(order) { return order.created_at >= formatted; });
                break;
            case "created_at_max":
                var date = parseDate(val);
                var formatted = formatDate(date.getTime());
                matching = matching.filter(function(order) { return order.created_at <= formatted; });
                break;
            case "updated_at_min":
                var date = parseDate(val);
                var formatted = formatDate(date.getTime());
                matching = matching.filter(function(order) { return order.updated_at >= formatted; });
                break;
            case "updated_at_max":
                var date = parseDate(val);
                var formatted = formatDate(date.getTime());
                matching = matching.filter(function(order) { return order.updated_at <= formatted; });
                break;
            case "status":
                switch (val) {
                    case "open":
                        matching = matching.filter(function(order) { return !order.closed_at; });
                        break;
                    case "closed":
                        matching = matching.filter(function(order) { return !!order.closed_at; });
                        break;
                    case "any":
                        break;
                    default:
                        console.warn("Unrecognized status: " + val);
                        break;
                }
                break;
            case "financial_status":
                if (val !== "any") {
                    matching = matching.filter(function(x) { return x.financial_status === val; });
                }
                break;
            case "fulfillment_status":
                if (val !== "any") {
                    matching = matching.filter(function(x) { return x.fulfillment_status === val; });
                }
                break;
            default:
                console.warn("Unrecognized filter '%s'", key);
                break;
        }
    }

    return matching;
}

app.get("/admin/orders/count.json", function(req, res) {
    var matching = filterOrders(req.query);

    res.status(200);
    res.send({ count: matching.length });
});

app.get("/admin/orders/:id.json", function(req, res) {
    var id = parseInt(req.params.id, 10);

    if (id <= 0 || id > 1000) {
        res.sendStatus(404);
    } else {
        var order = orders[id - 1];
        if (req.query.fields) {
            res.status(200);
            var partialOrder = { };
            var fieldList = req.query.fields.split(",");
            fieldList.forEach(function(field) {
                partialOrder[field] = order[field];
            });
            res.send({
                order: partialOrder
            });
        } else {
            res.status(200);
            res.send({
                order: orders[id - 1]
            });
        }
    }
});

app.get("/admin/orders.json", function(req, res) {
    var options = req.query;
    if (options.ids) {
        var ids = options.ids.split(",");
        res.status(200);
        res.send({
            orders: ids.map(function(x) {
                var id = parseInt(x, 10);
                return orders[id - 1];
            })
        });

        return;
    }

    // By default, only fetch open orders.
    if (!options.status) {
        options.status = "open";
    }

    var page = options.page || 1;
    var limit = options.limit || 50;
    var start = limit*(page - 1);
    delete options.page;
    delete options.limit;

    var matching = filterOrders(options);
    res.status(200);
    res.send({
        orders: matching.slice(start, start + limit)
    });
});

app.post("/admin/orders/:id/close.json", function(req, res) {
    res.status(200);
    orders[req.params.id - 1].closed_at = formatDate(Date.now());
    res.send({ });
});

app.post("/admin/orders/:id/open.json", function(req, res) {
    res.status(200);
    orders[req.params.id - 1].closed_at = null;
    res.send({ });
});

var filterProducts = function(filters) {
    var matching = products;

    for (var key in filters) {
        var val = filters[key];

        switch (key) {
            case "created_at_min":
                var date = parseDate(val);
                var formatted = formatDate(date.getTime());
                matching = matching.filter(function(product) { return product.created_at >= formatted; });
                break;
            case "created_at_max":
                var date = parseDate(val);
                var formatted = formatDate(date.getTime());
                matching = matching.filter(function(product) { return product.created_at <= formatted; });
                break;
            case "updated_at_min":
                var date = parseDate(val);
                var formatted = formatDate(date.getTime());
                matching = matching.filter(function(product) { return product.updated_at >= formatted; });
                break;
            case "updated_at_max":
                var date = parseDate(val);
                var formatted = formatDate(date.getTime());
                matching = matching.filter(function(product) { return product.updated_at <= formatted; });
                break;
            case "vendor":
            case "handle":
            case "product_type":
            case "collection_id":
                if (val !== "any") {
                    matching = matching.filter(function(x) { return x[key] === val; });
                }
                break;
            default:
                console.warn("Unrecognized filter '%s'", key);
                break;
        }
    }

    return matching;
}

app.get("/admin/products/count.json", function(req, res) {
    var matching = filterProducts(req.query);

    res.status(200);
    res.send({ count: matching.length });
});

app.get("/admin/products/:id.json", function(req, res) {
    var id = parseInt(req.params.id, 10);

    if (id <= 0 || id > 1000) {
        res.sendStatus(404);
    } else {
        var product = products[id - 1];
        if (req.query.fields) {
            res.status(200);
            var partialProduct = { };
            var fieldList = req.query.fields.split(",");
            fieldList.forEach(function(field) {
                partialProduct[field] = product[field];
            });
            res.send({
                product: partialProduct
            });
        } else {
            res.status(200);
            res.send({
                product: products[id - 1]
            });
        }
    }
});

app.get("/admin/products.json", function(req, res) {
    var options = req.query;
    if (options.ids) {
        var ids = options.ids.split(",");
        res.status(200);
        res.send({
            products: ids.map(function(x) {
                var id = parseInt(x, 10);
                return products[id - 1];
            })
        });

        return;
    }

    var page = options.page || 1;
    var limit = options.limit || 50;
    var start = limit*(page - 1);
    delete options.page;
    delete options.limit;

    var matching = filterProducts(options);
    res.status(200);
    res.send({
        products: matching.slice(start, start + limit)
    });
});

app.listen(port);
console.log("Started Shopify Simulator on port %s", port);

