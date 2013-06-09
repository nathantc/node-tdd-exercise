var mongodb = require('mongodb'),
    mongoHost = process.env.MONGOLAB_URI ||
        process.env.MONGOHQ_URL ||
        'localhost',
    mongoserver = new mongodb.Server(mongoHost)


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