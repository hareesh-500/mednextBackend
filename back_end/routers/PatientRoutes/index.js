//Index route to include all your patient router files
module.exports = (app) => {
    require("./patient_routes")(app);
};
