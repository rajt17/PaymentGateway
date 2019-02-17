const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    customerId:String,
    username: String,
    email:String,
    password:String,
    plan:String,
    tokens:String,
    expDate:String
});

const User = mongoose.model('log', userSchema);

module.exports = User;
