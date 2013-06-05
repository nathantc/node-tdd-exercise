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
//        var encryptedPassword = bcrypt.hashSync(req.body.password, profile.passwordSalt);
//        if (encryptedPassword !== profile.password)
        if (bcrypt.compareSync(req.body.password, profile.password))
            assignSessionAndSendValidLogin(profile.username)
        else
            sendInvalidUsernamePassword();
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

    function verifyUsernameIsUnique() {
        if (userStore.getUserByUsername(req.body.username))
            throw {message: 'Username ' + req.body.username + ' is not available.'};
    }

    try {
        verifyUsernameIsUnique();
        userRule.validateNewUser({username: req.body.username, password: req.body.password});
        userStore.save({
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
        });
        res.send(202);
    } catch(err) {
        res.send(err.message, 403);
    }
};