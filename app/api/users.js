import client from "./client";

const registrationEndpoint = "/6023e9689c67a04eba4c2739/6023f63a9c67a04eba4c2756";

 /**
 * Function that post the infor of the new user to register
 * @param {object} userInfo JSONobject containing user information to be posted
 * @returns {Void}
 */ 
const register = (userInfo) => client.post(registrationEndpoint, userInfo);

export default { register };