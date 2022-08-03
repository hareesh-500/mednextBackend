
//Global index model to include all your modals
module.exports = {
    //Define keys as same as the keys that you export in models
    MasterSymptoms: require("./MasterTableModels/master_symptoms_model"),
    Users: require("./UserTableModels/master_user_models"),
    MasterProducts: require("./MasterTableModels/master_produscts_model"),
    Patients: require("./PatientModels/patient_model"),
    PatientIntakeProcess: require("./PatientModels/patient_intake_process_model"),
    PatientAppointments: require("./PatientModels/patient_appointment_model"),
    AppointmentTransactions: require("./PatientModels/appointment_transaction_model")
}