import apiClient from "./client";

const getAllDataEndpoint = "/6023e9689c67a04eba4c2739/6026374e51c4b281d3903ea9";

const postReportEndpoint = "/6023e9689c67a04eba4c2739/6026383151c4b281d3903eaf";

const deleteReportEndpoint = "/6023e9689c67a04eba4c2739/602639bb51c4b281d3903eb4";


 /**
 * Function that gets the data relevant for a specific user
 * @param {String} userId Id of the user to get the data for
 * @param {fromCache} params An object of additional params to be used in the request
 * @returns {Void}
 */ 
const getAllData = async (userId, fromCache = false) => apiClient.get(getAllDataEndpoint, {"userId": userId}, fromCache);

 /**
 * Function that post a report to the database
 * @param {object} report The report to be posted to the database
 * @param {boolean} postToCache set to true if the data shoul be cached locally as well
 * @returns {Void}
 */ 
const postReport = async (report, postToCache = true) => apiClient.post(postReportEndpoint, report, postToCache);

 /**
 * Function deletes a report from the dabase and cache
 * @param {String} id Id of the report to be delete
 * @returns {Void}
 */ 
const deleteReport = (id) => apiClient.delete(deleteReportEndpoint, {id: id}, reportCacheKey);

export default {
  getAllData,
  postReport,
  deleteReport,
};
