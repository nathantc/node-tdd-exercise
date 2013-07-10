var Character = require('./characterSchema').Character,
    user = require('./user');

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

exports.update = function(req, res) {
    var data = req.body;
    data.userId = user.sessionUserId(req);

    Character.findOneAndUpdate({_id: data._id, userId: data.userId}, data, function(error, updated) {
        res.send(updated, 200);
    });
};

exports.get = function(req, res) {
    Character.findOne({_id: req.params.id, userId: req.params.userId});
};

