//#region fcm_functions

const admin = require("firebase-admin");
const path = require('path');

var serviceAccount = require(path.join(__dirname, '../peachphone_store_key.json'));

var peachphone_store = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://peachphone-store.firebaseio.com"
}, "peachphone_store");

const sendMessageToDeviceStore = async(push_token, payload, options) => {
    try{
        let response = await peachphone_store.messaging().sendToDevice(push_token, payload, options);
        return response;
    }
    catch(error){
        console.log(error);
        return -1;
    }
}

const subscribeTopicStore = async(push_tokens, topic) => {
    try{
        let response = await peachphone_store.messaging().subscribeToTopic(push_tokens, topic);
        return response;
    }
    catch(error){
        console.log(error);
        return -1;
    }
}
//#endregion
module.exports ={
    sendMessageToDeviceStore,
    subscribeTopicStore,
}