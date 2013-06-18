var User = require('./userSchema').User;

exports.getUserByUsername = function(username, callback) {
    User.findOne({username: username}, function (err, user) {
        if (err) throw err;
        callback(user);
    });
};

exports.save = function(profile, callback) {
    var user = new User(profile);
    user.save(callback)
};

exports.update = function(username, values, callback) {
    var query = {username: username};
    User.findOneAndUpdate(query, values, function(err, user) {
        callback(user);
    })
};