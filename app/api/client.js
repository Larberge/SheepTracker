import { create } from "apisauce";
import cache from "../utility/cache";
import settings from "../config/settings"

const apiClient = create({
  baseURL: settings.apiBaseUrl,
  headers: {
    authorization:
      "Bearer 6023f14f9385889cfe95cd09.898a2dcdb90d8d1d679a85cfe546c736bd592141ff3193f3",
  }
});

 /**
 * Function that runs a get request
 * @param {String} url The endpoint sending the request to
 * @param {object} params An object of additional params to be used in the request
 * @param {boolean} fromCache If true, get the data from the cache. Typical when no internet connection
 * @param {}
 * @returns {Void}
 */ 
const get = apiClient.get;
apiClient.get = async (url, params, fromCache, axiosConfig) => {
  if(fromCache){
    console.log("returning data from cache")
    const data = await cache.get();
    if(data) return { ok: true, data };
    return {ok: false, data: null}
  }
  console.log("Getting data from db")
  const response = await get(url, params, axiosConfig);
  if(response.data){//Setting "inDB" parameter to true before inserting the data to chache
    response.data.forEach(report => report["inDb"] = true);
  }
  await cache.insertFromDb(response.data);
  return response;
};


 /**
 * Function that runs a post request
 * @param {String} url The endpoint sending the request to
 * @param {object} data An object of data to be sent in the body of the request
 * @param {boolean} postToCache If true, post the data to the cache. Typical when no internet connection
 * @param {}
 * @returns {Void}
 */ 
const post = apiClient.post;
apiClient.post = async (url, data, postToCache, axiosConfig) => {
  try{
    if(!postToCache){
      data.forEach(r => r.markers.forEach( m => m.photos.forEach(p => p.base64 = "")));
    }
  }catch(err){
    console.log(err);
  }
  const response = await post(url, data, axiosConfig);
  if(postToCache && data){ //post to chache since no internett connection
    if(response.ok) data["inDb"] = true;
    await cache.post(data);
  }
  return response
};


export default apiClient;
