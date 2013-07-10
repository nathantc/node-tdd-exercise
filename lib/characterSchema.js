var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var regex20Characters = /^.{0,20}$/,
    regex50CharactersRequired = /^.{1,50}$/;

var CharacterSchema = new Schema({

    userId: { type: String, require: true },
    name: { type: String, require: true, trim: true, match: regex50CharactersRequired },
    race: { type: String, require: true, trim: true, match: regex20Characters },
    size: { type: String, trim: true, match: regex20Characters },
    alignment: { type: String, trim: true, match: regex20Characters },

    profile: {
        gender: { type: String, trim: true, match: regex20Characters },
        height: { type: String, trim: true, match: regex20Characters },
        weight: { type: String, trim: true, match: regex20Characters },
        age: { type: String, trim: true, match: regex20Characters },
        deity: { type: String, trim: true, match: regex20Characters },
        languages: { type: String }
    },

    abilities: [{
        name: { type: String, require: true, trim: true },
        scores: [{
            type: { type: String, require: true },
            value: { type: Number, require: false }
        }]
    }]
});

var CharacterModel = mongoose.model('Character', CharacterSchema);

CharacterModel.newCharacter = function(data) {
    return new Character(data);
}

exports.Character = CharacterModel;