import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, RefreshControl} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useNetInfo } from "@react-native-community/netinfo";

import AppActivityIndicator from "../components/AppActivityIndicator";
import { appColors } from "../config";
import AppButton from "../components/AppButton";
import AppText from "../components/AppText";
import cache from "../utility/cache";
import reportAPI from "../api/reports";
import ReportItem from "../components/ReportItem";
import { useApi } from "../hooks";
import useAuth from "../auth/useAuth";

  /**
 * Function that renders tthe scrollview with all performed follow-up trips
 * @returns {View} View containing all content to be rendered
 */
const ReportlistScreen = () => {
  const navigation = useNavigation();
  const [refreshing, serRefreshing] = useState(false); 
  const [renderNum, setRenderNum] = useState(2);
  const [notsynced, setNotsynced] = useState();
  const netInfo = useNetInfo();
  const {user} = useAuth();
  const getReports = useApi(reportAPI.getAllData);
  const postReports = useApi(reportAPI.postReport);

/**
 * Function that runs upon view load and runs refresh and sync function
 * @returns {Void}
 */
  useEffect( () => {
    refreshAndSync();
  }, []);
  
/**
 * Function that uploads images if they are not in synch with database
 * @returns {Void}
 */
  const uploadImage = async (reportsNotInSync) => {
    reportsNotInSync.forEach( r => {
      r.markers.forEach( m => {
        if(m.photos){
          m.photos.forEach( async (p) => {
            let base64Img = `data:image/jpg;base64,${p.base64}`;
            let apiUrl =
              'https://api.cloudinary.com/v1_1/dlpfyaci8/image/upload';
            let data = {
              file: base64Img,
              upload_preset: 'myUploadPreset'
            };
            let response = await fetch(apiUrl, {
              body: JSON.stringify(data),
              headers: {
                'content-type': 'application/json'
              },
              method: 'POST'
            });
            let response_data = await response.json();
            if(response_data.secure_url){
              console.log(response_data.secure_url);
              p["url"] = response_data.secure_url
            }
            else{
              console.log(response_data);
            }
          })
        }
      })
    });
  }

    /**
 * Syncing the data in cache with thte data in db if internet concection. Triggerd on swipe-down gesture
 * @returns {Void}
 */
  const refreshAndSync = async () => {
    console.log("Refeshing and syncing..")
    const reportsNotInSync = await cache.syncWithDb();
    const noInternet = netInfo.type !== "unknown" && netInfo.isInternetReachable === false;
    if(reportsNotInSync && !noInternet){
      await uploadImage(reportsNotInSync);
      await postReports.request(reportsNotInSync, false);
    }
    await getReports.request(user.userId, noInternet);
  }

  /**
 * Function that returs the performed follow-up trips in a an array if any
 * @returns {array} Returns as list of all performed follow-trips if any
 */
  const renderReports = () => {
    if(getReports.data){
      let relevant_reports = getReports.data.slice(0, renderNum);
      relevant_reports.forEach( r => r["id"] = Math.floor(Math.random() * 13003))
      return getReports.data.slice(0, renderNum).map((report) => (
        <ReportItem
          key={report.id}
          item={report}
          onPress={() => {navigation.navigate("Report", { item: report })}}
        />
      ));
    }
  }

  return (
    <View style={{flex: 1}}>
      {notsynced && <AppText text={notsynced.starttime} />}
      {getReports.error && (
        <View style={styles.errorView}>
          <AppText
            style={styles.errorTextStyle}
            text="Coudn't retrive reports.."
          />
          <AppButton
            buttonStyle={styles.errorButton}
            onPress={() => refreshAndSync()}
            buttonText="Reload"
            textColor={appColors.secondaryLight}
            textSize={24}
          />
        </View>
      )}
      <AppActivityIndicator visible={getReports.loading} />
      <ScrollView
        alwaysBounceVertical
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => refreshAndSync()}
          />
        }
        >
        {renderReports()}
        {getReports.data.length === 0 &&(
          <View style={styles.errorView}>
            <AppText
              style={styles.errorTextStyle}
              text="Create your first report by clicking the pluss button below"
            />
          </View> 
        )}
        {getReports.data.slice(0, renderNum).length < getReports.data.length && <View style={{alignItems:"center", paddingBottom: 64}}>
          <AppButton textColor={appColors.primary} buttonStyle={styles.loadMoreButton} buttonText="Vis mer" onPress={() => setRenderNum(renderNum + 2)}/>
        </View>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  errorTextStyle: {
    fontSize: 32,
    fontStyle: "italic",
    color: appColors.gray600,
    marginBottom: 16,
    textAlign: "center",
  },
  errorView: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadMoreButton:{
    top: 16,
    backgroundColor: appColors.transparent,
    borderColor: appColors.transparent,
    elevation: 0,
    height: 40
  }
});

export default ReportlistScreen;
