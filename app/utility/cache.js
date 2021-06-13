import AsyncStorage from "@react-native-community/async-storage";

cacheKey = "reports"


/**
 * Returns data assosiated with the given cacheKey from the cache 
 * @param {String} key Default set to "reports". Key of the data to return
 * @returns {object}
 */
const get = async (key = cacheKey) => {
  try {
    const value = await AsyncStorage.getItem(key);
    const item = JSON.parse(value);
    if (!item) return null;
    return item;
  } catch (error) {
    console.log(error);
  }
};


/**
 * Post the given data to cache
 * @param {Object} data Data to post to cache
 * @returns {void}
 */
const post = async (data) => {
  try {
    let dataToPost = await get(cacheKey);
    if(Array.isArray(data)){
      dataToPost = data.concat(dataToPost);
    }else{
      dataToPost.unshift(data)
    }
    await AsyncStorage.setItem(cacheKey, JSON.stringify(dataToPost));
  } catch (err) {
    console.log("Error when posting data in cache.. ", err);
  }
};


/**
 * Deletes all data assosiated with the given key
 * @param {String} objectKey Key of the data to delete
 * @returns {void}
 */
const deleteByKey = async (objectKey) => {
  const cacheData = await get();
  const dataToKeep = cacheData.filter(d => d.externalID != objectKey);
  await AsyncStorage.setItem(cacheKey, JSON.stringify(dataToKeep));
}


/**
 * Inserts the given data to the cache
 * @param {object} dbData Data to be inserted in cache
 * @returns {void}
 */
const insertFromDb = async (dbData) => {
  try {
    await AsyncStorage.setItem(cacheKey, JSON.stringify(dbData.slice(0,10)));
  } catch (error) {
    console.log("Error occured when inserting data from Db to cache... ", error);
  }
}

/**
 * Function that returns data from cache that is not in DB
 * @returns {Array || null}
 */
const syncWithDb = async () => {
  try {
    const cacheData = await get();
    if(!cacheData) return null;
    const dataNotInDb = cacheData.filter(report => !report.inDb);
    if(dataNotInDb.length > 0) return dataNotInDb;
    return null;
  } catch (error) {
    console.log("Error when syncing with db...", error);
    return null;
  }
}

/**
 * caches the the active walkpath of a trip currently being perfromed
 * @returns {void}
 */
const activeWalkPathCacheKey = "walkpath"
const cacheActiveWalkPath = async (data) => {
  try {
    await AsyncStorage.setItem(activeWalkPathCacheKey, JSON.stringify(data));
  } catch (error) {
    console.log("Error when caching active walkpath... ", error);
    
  }
}


/**
 * Returns the active walkpath of a trip currently being perfromed
 * @returns {object || void}
 */
const getActiveWalkPathData = async () => {
  try {
    const dataInCache = await get(activeWalkPathCacheKey)
    if(dataInCache) return dataInCache;
    return [];
  } catch (error) {
    console.log("Error when retriving active walkpathdata from cache... ", error);
  }
}


/**
 * Removes the active walkpath of a trip currently being perfromed
 * @returns {void}
 */
const clearActiveWalkPathData = async () => {
  try {
    await AsyncStorage.removeItem(activeWalkPathCacheKey);
  } catch (error) {
    console.log("Error when clearing active walkpath data")
  }
}




export default {
  insertFromDb,
  post,
  get,
  syncWithDb,
  deleteByKey,
  cacheActiveWalkPath,
  getActiveWalkPathData,
  clearActiveWalkPathData
};
