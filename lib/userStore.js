var mongo = require('mongodb');
var mongoUri = process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/pathfinder-ninja'
//var store = {};
console.log(mongoUri);

exports.getUserByUsername = function(username) {
    return null;
};

exports.save = function(profile) {
//    store[profile.username] = profile;
    mongo.DB.connect(mongoUri, function(err, db) {
        console.log(db);
        db.collection('users', function(er, collection) {
            console.log(collection)
            collection.insert(profile, {safe: true}, function(e, rs) {
                console.log(rs);
            })
        });
    });
}