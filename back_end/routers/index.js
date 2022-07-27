//To register all routes
module.exports = (app) => {
    console.log("UserRoutes...")
    require("./UserRoutes")(app);
};
