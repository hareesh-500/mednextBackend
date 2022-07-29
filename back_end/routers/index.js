//Global index route to include all your routes
module.exports = (app) => {
    require("./UserRoutes")(app);
    require("./PatientRoutes")(app);
};
