var userStore = require('./userStore'),
    userRule = require('./userRule'),
    bcrypt = require('bcrypt');

exports.currentUser = function(req, res) {
    res.json({username: req.session.username || 'guest'});
};

exports.login = function(req, res) {

    function validateUser(profile) {
        if (profile)
            validatePasswordWithProfile(profile)
        else
            sendInvalidUsernamePassword();
    }

    function validatePasswordWithProfile(profile) {
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

    if (!sessionInProgress(req))
        userStore.getUserByUsername(req.body.username, validateUser);
    else
        res.send('User is already authenticated. Logout before attempting another login.', 409);

};

exports.logout = function(req, res) {
    req.session = null;
    res.send(202);
};

exports.register = function(req, res) {

    function setResponse(err) {
        if (err) {
            res.send(err, 403);
        } else {
            res.send(202);
        }
    }

    function validateUsername(user) {
        if (user) {
            setResponse('Username ' + req.body.username + ' is not available.');
        } else {
            try{
                userRule.validateNewUser({username: req.body.username, password: req.body.password});
                var user = {
                    username: req.body.username,
                    password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
                }
                userStore.save(user, setResponse);
            }
            catch(err) {
                res.send(err.message, 403);
            }
        }
    }

    userStore.getUserByUsername(req.body.username, validateUsername);

};


function sessionInProgress(req) {
    return req.session.username;
}
