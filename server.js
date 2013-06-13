var mongoUri = process.env.MONGOLAB_URI ||
        process.env.MONGOHQ_URL ||
        'mongodb://localhost/pathfinder_ninja',
    mongoose = require('mongoose');

mongoose.connect(mongoUri);
mongoose.connection.on('open', function() {
    console.log('Connected to mongoose');
})

module.exports = require('./lib/route');