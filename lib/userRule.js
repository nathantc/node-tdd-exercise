exports.validateNewUser = function(profile) {

    function requiredField(field) {
        return 'The ' + field + ' field is required.';
    }

    function requiredFieldLength(field, length) {
        return 'The ' + field + ' field must be at least ' + length + ' characters.';
    }

    var passwordLength = 6,
        usernameLength = 6;

    if (!profile.username)
        throw requiredField('username');

    if (profile.username.length < usernameLength)
        throw requiredFieldLength('username', usernameLength);

    if (!profile.password)
        throw requiredField('password');

    if (profile.password.length < passwordLength)
        throw requiredFieldLength('password', passwordLength);
}