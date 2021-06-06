import { useContext } from "react";
import jwtDecode from "jwt-decode";

import AuthContext from "./context";
import authStorage from "./storage";

/**
 * Hook that provides all the authentication functionality throug login and logout functions
 */ 
const useAuth = () => {
  const { user, setUser } = useContext(AuthContext);


/**
 * Function that logs in the user if authtokin is provided
 * @param {String} authtoken of current user
 * @reutrn {void}
 */ 
  const logIn = (authToken) => {
    setUser(jwtDecode(authToken));
    authStorage.storeToken(authToken);
  };

/**
 * Function that logs ut the user and erases the authtoken
 * @reutrn {void}
 */ 
  const logOut = () => {
    setUser(null);
    authStorage.removeToken();
  };

  return { user, logIn, logOut };
};

export default {
  useAuth
}