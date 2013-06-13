var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
    username: {type: String, require: true, trim: true, unique: true},
    password: {type: String, require: true}
});

var User = mongoose.model('User', UserSchema);

exports.getUserByUsername = function(username, callback) {
    User.findOne({username: username}, function (err, user) {
        if (err) throw err;
        callback(user);
    });
};

exports.save = function(profile, callback) {
    var user = new User(profile);
    user.save(callback)
}