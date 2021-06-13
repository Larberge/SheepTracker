import React, { useState, useEffect } from "react";
import { Platform, StyleSheet, Alert, Modal, View, Image } from "react-native";
import { useNavigation}  from "@react-navigation/native";
import MapView, { Marker, Polyline, LocalTile, UrlTile } from "react-native-maps";
import moment from "moment";
import haversine from "haversine";
import { v4 as uuidv4 } from "uuid";
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';

import AppButton from "../components/AppButton";
import Dropdown from "../components/Dropdown"
import Header from "../components/Header";
import { appColors } from "../config";
import Dialog from "../components/Dialog";
import API from "../api/reports";
import { useApi, useTimer } from "../hooks";
import useAuth from "../auth/useAuth";
import ObservationScreen from "./ObservationScreen";
import cache from "../utility/cache";
import AppActivityIndicator from "../components/AppActivityIndicator";
import AppTextInput from "../components/AppTextInput";

const LOCATION_TRACKING = "location-tracking"
const observationOptions = ["Sheep", "Other"]

/**
 * Component that renders the record screen with all its belongings
 * @component
 * @return {Fragment} Fragment to be rendered
 */
const RecordScreen = () => {
  const [ShowDialog, setShowDialog] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAddComment, setShowAddComment] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [userPos, updateUserPos] = useState([]);
  const [initRegion, setInitRegion] = useState();
  const [starttime, setStarttime] = useState(null);
  const [walkPath, setWalkPath] = useState([]);
  const [comment, setComment] = useState("");
  const [reportId, setReportId] = useState(uuidv4());
  const [recording, setRecording] = useState(false)
  const [paused, setPaused] = useState(false);
  const [enableSave, setEnableSave] = useState(false);
  const [mapRegion, setMapRegion] = useState();
  const [observationType, setObservationType] = useState(observationOptions[0]);
  const [markerComment, setMakerCommet] = useState(false);
  const timer = useTimer();
  const {user} = useAuth();
  const postReportAPI = useApi(API.postReport);
  const navigation = useNavigation();


/**
 * Function that runs every time the screen rerenders. It ask the user for permission to use their location
 * @returns {void} 
 */  
useEffect(() => {
    (async () => {
      const { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log("permisson not granted for location..");
        return; //A message that says user have to grant permisson to use location
      }
      const { coords } = await Location.getLastKnownPositionAsync();
      updateUserPos([
        {
          id: 0,
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      ]);
      setInitRegion({
        latitude: coords.latitude, //59.954066, 10.756325
        longitude: coords.longitude,
        latitudeDelta: 0.029,
        longitudeDelta: 0.019,
      });
    })();
  }, []);

/**
 * Function that runs once setting the update intervall for getting the position of user
 * @returns {void}
 */
  useEffect( () => {
    let interval = null;
    if(recording){
      //Only if android
      if(Platform.OS == "android"){
        interval = setInterval(() => setWalkPathFromCache(), 5000);
      }
    }
    return () => {
      clearInterval(interval);
    };
  }, [recording])

  
/**
 * Function that gets the walkpath data from cach and stores i in the walkpath state
 * @returns {View} Returns a view with camera or text depending on permisson
 */
  const setWalkPathFromCache = async () => {
    let walkpathData = await cache.getActiveWalkPathData();
    let path = walkpathData.map(loc => ({"latitude": loc.coords.latitude, "longitude": loc.coords.longitude}));
    setWalkPath(path);
    console.log(path.length, "location points successfully retrieved from cache");
    updateUserPos([
      {
        id: 0,
        latitude: path[path.length - 1].latitude,
        longitude: path[path.length - 1].longitude,
      },
    ]);
  }
 
/**
 * Function that runs when recoring starts
 * @returns {void}
 */
  const startRecording = async () => {
    if(Platform.OS == "ios") activateKeepAwake();
    const { status } = await Location.requestPermissionsAsync();
    if (status === 'granted') {
      setStarttime(moment())
      setRecording(true);
      if(Platform.OS == "android"){
        cache.clearActiveWalkPathData();
        await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 10,
          activityType: Location.ActivityType.Fitness,
          foregroundService: {
            notificationTitle: 'Using your location',
            notificationBody: 'To turn off, go back to the app and switch something off.',
          },
        });
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING);
        console.log("Tracking started? ", hasStarted);
      }
      if(Platform.OS == "ios"){
        Location.watchPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 15000,
          distanceInterval: 10,
        }, ({coords})  => {
          addToPath(coords);
        })
      }
    }
  };
  
/**
 * Function to stop the recording. It stops the recoring and opens the comment dialog
 * @returns {void}
 */
  const stopRecording = () => {
    Alert.alert(
      "End tracking?",
      "Are you sure you want to end this tracking?",
      [
        {
          text: "Discard",
          onPress: () => navigation.navigate("Main", { Screen: "Home" }),
          style: "destructive",
        },
        {
          text: "Cancel",
          onPress: () => setPaused(false),
        },
        {
          text: "Save and exit",
          onPress: async () => {
            if(Platform.OS == "ios") deactivateKeepAwake();
            if(Platform.OS == "android"){
              TaskManager.unregisterAllTasksAsync();
              const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING);
              console.log("Tracking stopped? ", !hasStarted);
            }
            setShowAddComment(true);
          },
          style: "cancel",
        },
      ],
      { cancelable: false }
    );
  };

  /**
 * Function that saves the report to database and cache depending
 * @returns {void}
 */
  const saveReport = async () => {
    const report = {};
    report["userId"] = user.userId;
    report["username"] = user.name
    report["externalID"] = reportId;
    report["comment"] = comment;
    report["endtime"] = moment();
    report["starttime"] = starttime;
    report["deathcount"] = markers.reduce( (acc, m) => acc + parseInt(m.dead), 0);
    report["injurycount"] = markers.reduce( (acc, m) => acc + parseInt(m.injured), 0);
    report["totalAnimalCount"] = markers.reduce( (acc, m) => acc + parseInt(m.sows) + parseInt(m.lambs), 0);
    report["totalLambCount"] = markers.reduce( (acc, m) => acc + parseInt(m.lambs), 0);
    report["totalSowCount"] = markers.reduce( (acc, m) => acc + parseInt(m.sows), 0);
    report["walkPath"] = walkPath ? JSON.stringify(walkPath) : [];
    report["markers"] = markers;
    report["inDb"] = false;
    report["duration"] = Number.parseFloat(report["endtime"].diff(starttime)/1000).toFixed(0);
    report["distance"] = 0
    for(let i = 1; i < walkPath.length; i++){
      report["distance"] += haversine(walkPath[i - 1], walkPath[i], { unit: "km" })
    }
    await postReportAPI.request(report);
    navigation.navigate("Main", { Screen: "Home" });
  }

  /**
 * Function that checks if a comment was entered whit the text param being null or not
 * @param {String} text The comment the user enters
 * @returns {void}
 */
  const valuateComment = (text) => {
    if(text){
      setComment(text);
      setEnableSave(true);
    }else{
      setEnableSave(false);
    }
  }

  /**
 * Function that adds the newly recieved coordinates of user position to the walkpath
 * @param {array} coords Newly recived coords of user position
 * @returns {void}
 */
  const addToPath = (coords) => {
    let { latitude, longitude } = coords;
    let newPos = {};
    newPos["latitude"] = latitude;
    newPos["longitude"] = longitude;
    updateUserPos([
      {
        id: 0,
        latitude: latitude,
        longitude: longitude,
      },
    ]);
    if (walkPath.length > 0) {
      if (haversine(walkPath[walkPath.length - 1], newPos, { unit: "meter" }) >= 10){
        setWalkPath((walkPath) => [...walkPath, newPos]);
      }
    } else {
      setWalkPath((walkPath) => [...walkPath, newPos]);
    }
  };

  /**
 * Adds a marker to the marker array holding all markes of this follow-up trip
 * @param {object} pos Object holding position info of the new marker
 * @returns {void}
 */
  const addMarker = async (pos) => {
    setObservationType(observationOptions[0])
    setShowDialog(true);
    let newLat = pos.nativeEvent.coordinate.latitude;
    let newLong = pos.nativeEvent.coordinate.longitude;
    let newPos = {};
    newPos["userId"] = user.userId;
    newPos["id"] = markers.length + 1;
    newPos["externalReportId"] = reportId;
    newPos["markerLat"] = newLat;
    newPos["markerLong"] = newLong;
    newPos["userLat"] = userPos[0].latitude;
    newPos["userLong"] = userPos[0].longitude;
    newPos["visible"] = false;
    newPos["sows"] = "0";
    newPos["lambs"] = "0";
    newPos["injured"] = "0";
    newPos["dead"] = "0";
    newPos["gray"] = "0";
    newPos["white"] = "0";
    newPos["black"] = "0";
    newPos["mix"] = "0";
    newPos["timestamp"] = moment();
    setMarkers((markers) => [...markers, newPos]);
  };

  /**
 * Function that places the marker
 * @returns {void}
 */
  const confirmMarkerPlacement = () => {
    let updatedMarkers = markers;
    updatedMarkers[updatedMarkers.length - 1]["observationType"] = observationType;
    updatedMarkers[updatedMarkers.length - 1].visible = true;
    setMarkers(updatedMarkers);
    setShowDialog(false);
    setShowModal(true);
  };

  /**
 * Function that cancels the marker placment and empties the relevant variables
 * @returns {void}
 */
  const cancleMarkerPlacement = () => {
    let updatedMarkers = markers;
    updatedMarkers.pop();
    setMarkers(updatedMarkers);
    setShowDialog(false);
    setShowModal(false)
  };

  /**
 * Function that renders the markes on the map
 * @returns {void}
 */
  const mapMarkers = () => {
    if(markers.length > 0){
      return markers.filter(m => m.visible).map(marker => (
        <Marker
        pinColor={"orange"}
          key={marker.id}
          coordinate={{
            latitude: marker.markerLat,
            longitude: marker.markerLong,
          }}
        />
      ));
    }
    return null;
  };

  /**
 * Function that renders the user's positon on the map
 * @returns {void}
 */
  const mapPos = () => {
    if(userPos){
      if(userPos.length > 0){
        return userPos.map((pos) => (
          <Marker
            pinColor={"teal"}
            //icon={markerImg ? markerImg : null}
            key={pos.id}
            coordinate={{
              latitude: pos.latitude,
              longitude: pos.longitude,
            }}
          />
        ));
      }
    }
  };

  /**
 * Function that rrenders the walkpath on the map
 * @returns {void}
 */
  const mapPath = () => {
    if(walkPath.length > 0){
      return <Polyline
        coordinates={walkPath}
        strokeColor={appColors.pathColor}
        strokeWidth={4}
      />
    }
  }

  /**
 * Function that updates a key-value pair of a marker
 * @param {object} Marker The markerobject to update
 * @param {variable} key The key to hold the new value
 * @param {variable}
 * @returns {String} value the new value
 */
  const editMarker = (marker, key, value) => {
    marker[key] = value;
  };

  return (
    <>
      <Header
        headerTitle={recording ? moment().startOf('day').seconds(timer.curMoment.diff(starttime, "seconds")).format('H:mm:ss') : " "}
        navBack={!recording}
        onNavBack={() => navigation.navigate("Main", { Screen: "Home" })}
      />
      <View style={{flex: 1}}>
        <MapView
          provider={"google"}
          mapType={"terrain"}
          loadingEnabled
          zoomEnabled
          initialRegion={initRegion}
          style={{ flex: 1 }}
          pitchEnabled={false}
          onRegionChange={(mapRegion) => setMapRegion({mapRegion})}
          onPress={(pos) => {if(recording){addMarker(pos);}}}>
          {mapPos()}
          {mapMarkers()}
          {mapPath()}
        </MapView>
       
        <View style={{position: "absolute", width: "100%", bottom: 12, backgroundColor: appColors.transparent, flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
          {paused && recording && <AppButton
            buttonStyle={styles.buttonResume}
            fontWeight="bold"
            onPress={() => {timer.resume(); setPaused(false)}}
            buttonText="Continue"
            textSize={11}
            textColor={appColors.stopColor}
          />}
          {paused && recording && <AppButton
            buttonStyle={styles.buttonFinish}
            fontWeight="bold"
            onPress={() => {stopRecording()}}
            buttonText="Stop"
            textSize={12}
            textColor={appColors.secondaryLight}
            iconSize={48}
          />}
          {!paused && recording && <AppButton
            buttonStyle={styles.buttonStop}
            fontWeight="bold"
            onPress={() => {timer.pause(); setPaused(true);}}
            iconName="stop"
            iconSize={48}
            />}
          {!recording && <AppButton
            buttonStyle={styles.buttonStart}
            onPress={() => startRecording()}
            iconName="play-arrow"
            iconSize={48}
            />}
        </View>
    
        <Dialog
          visible={ShowDialog}
          cancleAction={() => cancleMarkerPlacement()}
          dialogText={"Press OK to position the marker"}
          dialogTitle="Place marker"
          confirmAction={() => confirmMarkerPlacement()}
          transparent={true}
          childComponent={ 
            <Dropdown 
              labelText={"Type of observation"}
              options={observationOptions}
              onOptionPress={setObservationType}
            />}
        />

        <Modal visible={showModal} transparent animationType={"slide"}>
          <ObservationScreen
            typeOfObservation={observationType}
            cancelAction={() => cancleMarkerPlacement()}
            confirmAction={() => setShowModal(false)}
            marker={markers[markers.length - 1]}
            editMarkerFunc={(key, value) =>
              editMarker(markers[markers.length - 1], key, value)
            }
          />
        </Modal>
        

        <Modal visible={showAddComment} transparent animationType={"slide"}>
          <View style={{flex: 1, backgroundColor: appColors.secondaryTransparent_65, justifyContent: "center", alignItems: "center"}}>
            <View style={styles.commentContainer}>
              <AppTextInput 
                style={{flex: 1, marginBottom: 8, backgroundColor: appColors.secondary, height: 150, borderColor: appColors.secondaryDark}} 
                placeholder = "Comment"
                onChangeText = {(text) => valuateComment(text)}
                />
              <AppButton 
                buttonText="Save" 
                buttonStyle={
                  {
                    backgroundColor: !enableSave ? appColors.gray100 : appColors.primary,
                    borderColor: !enableSave ? appColors.gray200 : appColors.primaryDark,
                  }}
                textColor = {!enableSave ? appColors.grey400 : appColors.secondaryLight}
                disabled={!enableSave} 
                onPress={()=>saveReport()}/>
              <AppActivityIndicator visible={postReportAPI.loading}/>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  buttonStart: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: appColors.startColor,
    borderColor: appColors.startColorDark,
  },
  buttonStop: {
    width: 64,
    height: 64,
    borderRadius: 32,
    zIndex: 2,
    backgroundColor: appColors.stopColor,
    borderColor: appColors.stopColorDark,
  },
  buttonFinish: {
    width: 80,
    height: 80,
    borderRadius: 40,
    zIndex: 2,
    backgroundColor: appColors.stopColor,
    borderColor: appColors.stopColorDark,
    marginLeft: 8,

  },
  buttonResume: {
    width: 80,
    height: 80,
    borderRadius: 40,
    zIndex: 2,
    backgroundColor: appColors.secondaryLight,
    borderColor: appColors.stopColor,

  },
  commentContainer: {
    height: 250,
    width: "90%",
    backgroundColor: appColors.secondaryLight,
    borderRadius: 20,
    borderColor: appColors.primary,
    borderWidth: 2,
    padding: 8,
    overflow: "hidden",
    opacity: 1,
  }
});

export default RecordScreen;

TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
  if (error) {
    console.log('LOCATION_TRACKING task ERROR:', error);
    return;
  }
  if (data) {
    const { locations } = data;
    if(locations.length > 0){
      console.log("Caching data in background.. ")
      let dataInCache = await cache.getActiveWalkPathData();
      for(let loc of locations){
        dataInCache.push(loc);
      }
      console.log(dataInCache.length, " locationpoints cached")      
      await cache.cacheActiveWalkPath(dataInCache);
    }
  }
});
