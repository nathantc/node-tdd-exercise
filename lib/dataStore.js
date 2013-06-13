var mongoUri = process.env.MONGOLAB_URI ||
        process.env.MONGOHQ_URL ||
        'mongodb://localhost/pathfinder_ninja',
    mongodb = require('mongodb');

var db;

exports.connect = function(callback) {
    mongodb.Db.connect(mongoUri, function(err, db) {
        if (err) throw err;
        console.log('connected to mongodb', db);
        users = new mongodb.Collection(db, 'users');
    });
}
