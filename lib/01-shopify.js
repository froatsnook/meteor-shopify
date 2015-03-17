Shopify = { };

Shopify._IsNonEmptyString = Match.Where(function(x) {
    check(x, String);
    return x.length > 0;
});

