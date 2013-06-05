var store = {};

exports.getUserByUsername = function(username) {
    return store[username];
};

exports.save = function(profile) {
    store[profile.username] = profile;
}