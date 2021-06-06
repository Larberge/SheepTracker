import client from "./client";

const authEndpoint = "/6023e9689c67a04eba4c2739/6023e9689c67a04eba4c273a"
const pinEndpoint = "/6023e9689c67a04eba4c2739/602f5a392fb23040b6bf3152"


 /**
 * Function sendinga request to an the authentication endpoint in appfarm with the email and pin the user provided to be validated
 * @param {String} email The email provided by the user
 * @param {integer} pin the pin entered from the user
 * @returns {Void}
 */ 
const login = (email, pin) => client.post(authEndpoint, {email: email, pin: pin});

 /**
 * Function that request a pin by sending the entered email to the pin-endpoint in appfarm
 * @param {String} email Email entered by a user to recieve a pin to log in with
 * @returns {Void}
 */ 
const getPin = (email) => client.post(pinEndpoint, {email: email}, false);


export default{
    login,
    getPin
};