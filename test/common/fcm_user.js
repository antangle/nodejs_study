//#region fcm_functions

const admin = require("firebase-admin");
const path = require('path');

var serviceAccount = require(path.join(__dirname, '../../peachphone_user_key.json'));

var peachphone_user = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://peachphone-2090f.firebaseio.com"
}, "peachphone_user");

const sendMessageToDeviceUser = async(push_token, payload, options) => {
    try{
        let response = await peachphone_user.messaging().sendToDevice(push_token, payload, options);
        return response;
    }
    catch(error){
        console.log(error);
        return -1;
    }
}

const subscribeTopic = async(push_tokens, topic) => {
    try{
        let response = await peachphone_user.messaging().subscribeToTopic(push_tokens, topic);
        return response;
    }
    catch(error){
        console.log(error);
        return -1;
    }
}
//#endregion
module.exports ={
    sendMessageToDeviceUser,
    subscribeTopic,
}