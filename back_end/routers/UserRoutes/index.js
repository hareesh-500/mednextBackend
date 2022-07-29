//Index route to include all your user router files
module.exports = (app) => {
    require("./user_routes")(app);
};
