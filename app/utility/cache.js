import AsyncStorage from "@react-native-community/async-storage";

cacheKey = "reports"

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

const deleteByKey = async (objectKey) => {
  const cacheData = await get();
  const dataToKeep = cacheData.filter(d => d.externalID != objectKey);
  await AsyncStorage.setItem(cacheKey, JSON.stringify(dataToKeep));
}

const insertFromDb = async (dbData) => {
  try {
    await AsyncStorage.setItem(cacheKey, JSON.stringify(dbData.slice(0,10)));
  } catch (error) {
    console.log("Error occured when inserting data from Db to cache... ", error);
  }
}

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

const activeWalkPathCacheKey = "walkpath"
const cacheActiveWalkPath = async (data) => {
  try {
    await AsyncStorage.setItem(activeWalkPathCacheKey, JSON.stringify(data));
  } catch (error) {
    console.log("Error when caching active walkpath... ", error);
    
  }
}
 
const getActiveWalkPathData = async () => {
  try {
    const dataInCache = await get(activeWalkPathCacheKey)
    if(dataInCache) return dataInCache;
    return [];
  } catch (error) {
    console.log("Error when retriving active walkpathdata from cache... ", error);
  }
}

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
