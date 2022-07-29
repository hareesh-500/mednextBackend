
//Global index model to include all your modals
module.exports = {
    //Define keys as same as the keys that you export in models
    PatientSymptoms: require("./PatientModels/patient_symptoms_model"),
    MasterSymptoms: require("./MasterTableModels/master_symptoms_model"),
    Users: require("./UserTableModels/master_user_models")
}