var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {type: String, require: true, trim: true, unique: true, match: /^[\w@.-]{8,30}$/},
    password: {type: String, require: true}
});

var UserModel = mongoose.model('User', UserSchema);

UserModel.newUser = function(data) {
    return new User(data);
}

var passwordPattern = /^[*\w@.-]{8,30}$/
UserModel.validPassword = function(password) {
    return passwordPattern.exec(password) === password;
}

exports.User = UserModel;