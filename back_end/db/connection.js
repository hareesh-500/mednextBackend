const mongoose = require('mongoose');
const db_url = 'mongodb://localhost:27017/mydb';

const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true, //make this also true
};
mongoose.connect(db_url, dbOptions, function (err) {
    if (err) throw err; console.log('Successfully connected to mongodb');
});

