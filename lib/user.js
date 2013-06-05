var userStore = require('./userStore'),
    userRule = require('./userRule'),
    bcrypt = require('bcrypt');

exports.currentUser = function(req, res) {
    res.json({username: req.session.username || 'guest'});
};

exports.login = function(req, res) {

    function validateLogin() {
        if (!sessionInProgress())
            validateUsername();
        else
            res.send('User is already authenticated. Logout before attempting another login.', 409);
    }

    function sessionInProgress() {
        return req.session.username;
    }

    function validateUsername() {
        var profile = userStore.getUserByUsername(req.body.username);
        if (profile)
            validatePasswordWithProfile(profile)
        else
            sendInvalidUsernamePassword();
    }

    function validatePasswordWithProfile(profile) {
        var encryptedPassword = bcrypt.hashSync(req.body.password, profile.passwordSalt);
        if (encryptedPassword !== profile.password)
            sendInvalidUsernamePassword()
        else
            assignSessionAndSendValidLogin(profile.username);
    }

    function assignSessionAndSendValidLogin(username) {
        req.session.username = username;
        res.send(202);
    }

    function sendInvalidUsernamePassword() {
        res.send('Invalid username or password.', 403);
    }

    validateLogin();
};

exports.logout = function(req, res) {
    req.session = null;
    res.send(202);
};

exports.register = function(req, res) {
    var salt = '', password = '';

    function verifyUsernameIsUnique() {
        if (userStore.getUserByUsername(req.body.username))
            throw {message: 'Username ' + req.body.username + ' is not available.'};
    }

    function encryptPassword() {
        salt = bcrypt.genSaltSync(10);
        password = bcrypt.hashSync('new-password', salt);
    }

    try {
        verifyUsernameIsUnique();
        userRule.validateNewUser({username: req.body.username, password: req.body.password});
        encryptPassword();

        userStore.save({
            username: req.body.username,
            passwordSalt: salt,
            password: password
        });
        res.send(202);
    } catch(err) {
        res.send(err.message, 403);
    }
};