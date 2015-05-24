Router.map(function() {
    // For authentication
    this.route("home", {
        path: "/"
    });

    // Shown in an iframe on your store
    this.route("testContent", {
        path: "/testContent"

    });
});

