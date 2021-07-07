const twilio_accountSid = 'KEY';
const twilio_authToken = 'KEY';

const twilio = require('twilio')(twilio_accountSid, twilio_authToken);

const {parsePhoneNumberFromString} = require('libphonenumber-js');

const sendText = (toNumber, message) => {
    const phone = formatNumber(toNumber);

    return twilio.messages.create({
        body: message,
        to: phone,
        from: '+15153052963'
    })
}

const getEmail = async function(jovo) {
    if (jovo.isAlexaSkill()) {
        try {
            const email = await jovo.$alexaSkill.$user.getEmail();
            return email;
        } catch (err) {
            jovo.$alexaSkill.showAskForContactPermissionCard('email');
        }
    } else {
        const token = jovo.$request.getAccessToken();
        if (token) {
            const profile = jwt.decode(token);
            console.log('profile: ', profile)
            return profile.email;
        } else {
            jovo.askForSignIn('To get your email');
        }
    }

    const {email} = jovo.$user.$data;
    return email;
}

const formatNumber = (phone) => {
    return parsePhoneNumberFromString(phone, 'US').number;
}

const getPhoneNumber = async (jovo) => {
    if (jovo.isAlexaSkill()) {
        try {
            const mobileNumber = await jovo.$alexaSkill.$user.getMobileNumber();
            return mobileNumber;
        } catch(error) {
            jovo.$alexaSkill.showAskForContactPermissionCard('mobile_number');
        }
    }

    const {phone} = jovo.$user.$data;
    return phone;
}

module.exports = {
    getEmail,
    getPhoneNumber,
    sendText
}