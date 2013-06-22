var user = require('../lib/user'),
    User = require('../lib/userSchema').User,
    bcrypt = require('bcrypt'),
    sinon = require('sinon'),
    assert = require('assert');

describe('user.register:', function() {

    var req = {},
        res = {send: function() {}},
        userModel = { save: function() {} };

    beforeEach(function() {
        User.newUser = sinon.stub();
        User.findOne = sinon.stub();
        User.validPassword = sinon.stub().returns(true);

        bcrypt.genSaltSync = sinon.stub();
        bcrypt.hashSync = sinon.stub();
        res.send = sinon.spy();
    });

    describe('when submitting valid data,', function() {

        var newUser = {username: 'new-user', password: 'new-password'},
            saveUser = {username: 'new-user', password: 'new-encrypted-password'},
            error = undefined,
            storedUser = undefined;

        beforeEach(function() {
            req.body = newUser;

            User.findOne.callsArgWith(1, error, storedUser);
            User.newUser.returns(userModel);
            userModel.save = sinon.stub().callsArg(0);

            bcrypt.genSaltSync.returns('new-salt');
            bcrypt.hashSync.returns('new-encrypted-password');

            user.register(req, res);
        });

        it('looks for existing username in database', function() {
            assert(User.findOne.calledWith({username:'new-user'}));
        });

        it('create new salt value for password', function() {
            assert(bcrypt.genSaltSync.called);
        });

        it('encrypt password with salt value', function() {
            assert(bcrypt.hashSync.calledWith('new-password', 'new-salt'));
        });

        it('creates new user object', function() {
            assert(User.newUser.calledWith(saveUser));
        });

        it('save user profile', function() {
            assert(userModel.save.called);
        });

        it('return success status code 202', function() {
            assert(res.send.calledWith(202));
        });
    });

    describe('when password is not valid,', function() {

        var error = undefined,
            storedUser = undefined;

        beforeEach(function() {
            req.body = {username: 'new-user', password: 'invalid password'};
            User.validPassword.returns(false);
            User.findOne.callsArgWith(1, error, storedUser);
            user.register(req, res);
        });

        it('return error code and message', function() {
            assert(res.send.calledWith('Invalid password', 403));
        });

        it('does not call password methods', function() {
            assert(bcrypt.genSaltSync.notCalled);
            assert(bcrypt.hashSync.notCalled);
        });

        it('does not save user data', function() {
            assert(User.newUser.notCalled);
        })
    });

    describe('when username already exists', function() {

        var error = undefined,
            storedUser = {username: 'existing-user'};

        beforeEach(function() {
            req.body = {username: 'existing-user', password: 'new-password'};
            User.findOne.callsArgWith(1, error, storedUser);
            user.register(req, res);
        });

        it('return error code and message', function() {
            assert(res.send.calledWith('Username existing-user is not available.', 403));
        });

        it('does not call password methods', function() {
            assert(bcrypt.genSaltSync.notCalled);
            assert(bcrypt.hashSync.notCalled);
        });

        it('does not save user data', function() {
            assert(User.newUser.notCalled);
        })
    });
});