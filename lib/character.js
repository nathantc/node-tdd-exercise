var Character = require('./characterSchema').Character,
    user = require('./user');

exports.getAll = function(req, res) {
    var conditions = {userId: user.sessionUserId(req)},
        fields = {},
        options = {};
    Character.find(conditions, fields, options, function(error, characters) {
        res.send(characters, 200);
    });
};

exports.getOne = function(req, res) {
    var conditions = {_id: req.params.id, userId: user.sessionUserId(req)},
        fields = {},
        options = {};
    Character.findOne(conditions, fields, options, function(error, character) {
        res.send(character, 200);
    });
};

exports.create = function(req, res) {

    var data = req.body;
    data.userId = user.sessionUserId(req);

    if (typeof data.userId !== 'undefined') {
        var character = Character.newCharacter(data);
        character.save(function(err, character) {
            res.send(character);
        });
    } else {
        res.send('Authentication is required to save character', 403);
    }
};

exports.edit = function(req, res) {
    var data = req.body;
    data.userId = user.sessionUserId(req);

    Character.findOneAndUpdate({_id: data._id, userId: data.userId}, data, function(error, updated) {
        res.send(updated, 200);
    });
};

exports.delete = function(req, res) {
    var userId = user.sessionUserId(req);
    Character.findOneAndRemove({_id: req.params.id, userId: userId}, {}, function(error) {
        res.send(204);
    });
};
