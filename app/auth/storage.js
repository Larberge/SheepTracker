import * as SecureStore from "expo-secure-store";
import jwtDecode from "jwt-decode";

const key = "authToken";

 /**
 * Function that stores the authentication token of the user in the secure store so the user stays logged in if application is closed
 * @returns {Void}
 */ 
const storeToken = async authToken => {
    try {
        await SecureStore.setItemAsync(key, authToken)
    } catch (error) {
        console.log("Error storing the auth-token... ", error);
    }
}

 /**
 * Function that gets the authentication token based on the key
 * @returns {promise} Returns a promise if success, otherwise throse an error
 */ 
const getToken = async () => {
    try {
        return await SecureStore.getItemAsync(key);
    } catch (error) {
        console.log("Error getting the authtoken... ", error);
    } 
}

 /**
 * Function that returns true if user is authenticated
 * @returns {boolean} Return true if user is authenticated, false otherwise
 */ 
const getUser = async () => {
    const token = await getToken();
    return token ? jwtDecode(token) : null;
}

 /**
 * Function that remove the authentication token. This runs when user sign out of the application
 * @returns {Void}
 */ 
const removeToken = async () => {
    try {
        await SecureStore.deleteItemAsync(key);
    } catch (error) {
        console.log("Error removing authtoken... ", error);
    }
}

export default {
    getUser,
    storeToken,
    removeToken,
}