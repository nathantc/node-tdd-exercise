var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
    username: {type: String, require: true, trim: true, unique: true, match: /^[\w@.-]{8,30}$/},
    password: {type: String, require: true, match: /^[\w.@#$%-]{8,30}$/}
});

exports.User = mongoose.model('User', UserSchema);

