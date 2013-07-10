//var character = require('../lib/character'),
//    Character = require('../lib/characterSchema').Character,
//    assert = require('assert'),
//    sinon = require('sinon');
//
//describe('character.get: ', function() {
//
//    var req = {},
//        res = {send: function() {}};
//
//    beforeEach(function() {
//        Character.findOne = sinon.stub();
//    });
//
//    beforeEach(function() {
////        Character.findOne.restore();
//    })
//
//    describe('when requesting character, it', function() {
//
//        beforeEach(function() {
//            req.params = {};
//            req.session = {userId: 'user-id'};
//            character.get(req, res);
//        });
//
//        it('returns all characters for authenticated user', function() {
//            assert(Character.find({userId: req.session.userId}))
//        });
//    });
//
//    describe('when requesting character by id, it', function() {
//
//        beforeEach(function() {
//            req.params = {id: 'character-id'};
//            req.session = {userId: 'user-id'};
//            character.get(req, res);
//        })
//
//        it('returns character for authenticated user', function() {
//            assert(Character.findOne.calledWith({_id: req.params.id, userId: req.params.userId}))
//        });
//    });
//});