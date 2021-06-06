import React, { useEffect, useState, useRef } from "react";
import { Animated, Image, Modal, StyleSheet, Text, View, ScrollView as SW , Dimensions, Pressable } from "react-native";
import { MaterialIcons } from '@expo/vector-icons'; 
import { useRoute } from "@react-navigation/native";
import MapView, { Polyline, Marker } from "react-native-maps";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";

import { appColors, appSizes } from "../config";
import AppText from "../components/AppText";
import AppButton from "../components/AppButton";
import useAuth from "../auth/useAuth";
import { ScrollView } from "react-native-gesture-handler";

  /**
 * Function that renders the selected follow-up trip
 * @Component
 * @returns {Void}
 */
const ReportScreen = () => {
  const navigation = useNavigation();
  const [ref, setRef] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeMarker, setActiveMarker] = useState(null);
  const [visibleLineId, setVisibleLineId] = useState(null);
  const {user} = useAuth();
  const route = useRoute();
  const [report, setReport] = useState(route.params.item);
  const [editButtonVisible, setEditButtonVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const walkPath = eval(report.walkpath);
  const animationHeight = useRef(new Animated.Value(0)).current;
  const [commentLines, setCommentLines] = useState(4);
  const [readMoreVisible, setReadMoreVisible] = useState(true);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  
  const infoBars = [
    {visible: true, name: "Distance", value: Number.parseFloat(report["distance"]).toFixed(2)+" km"}, 
    {visible: true, name: "Duration", value:  moment().startOf('day').seconds(report["duration"]).format('H:mm:ss') },
    {visible: true, name: "Observed sheep", value: ""+report["totalAnimalCount"]}, 
    {Visible: true, name: "Other observations", value: ""+(report.markers.filter( marker => marker["typeAnnenObservasjon"]).length)},
    {visible: detailsVisible, name: "Ewes", value: ""+report["totalSowCount"]}, 
    {visible: detailsVisible, name: "Lambs", value: ""+report["totalLambCount"]},
    {visible: detailsVisible, name: "Gray", value: ""+report.markers.filter(m => !m["typeAnnenObservasjon"]).reduce( (sum, marker) => sum + parseInt(marker.gray), 0)}, 
    {visible: detailsVisible, name: "White", value: ""+report.markers.filter(m => !m["typeAnnenObservasjon"]).reduce( (sum, marker) => sum + marker.white, 0)},
    {visible: detailsVisible, name: "Black", value: ""+report.markers.filter(m => !m["typeAnnenObservasjon"]).reduce( (sum, marker) => sum + marker.black, 0)}, 
    {visible: detailsVisible, name: "Mix", value: ""+report.markers.filter(m => !m["typeAnnenObservasjon"]).reduce( (sum, marker) => sum + marker.mix, 0)},
  ];
  

/**
 * Function that rns upon viewload setting som initial values
 * @returns {Void}
 */
  useEffect(() => {
    setEditButtonVisible(user.userId == report.sTUser);
    if(commentLines > 4){
      setCommentLines(4);
      setReadMoreVisible(true);
    }
  }, []);


  /**
 * Function that gets the regian the map shall initial render
 * @param {boolean} fullscreen To display the map in fullscreen or not
 * @returns {Void}
 */
  const getPathRegion = (fullscreen = false) => {
    try {
      if(report){
        let wp = eval(report.walkpath);
        if (wp.length === 0) {
          //Set to Trondheim City center
          return {
            latitude: 63.43048,
            longitude: 10.394966,
            latitudeDelta: 0.0092,
            longitudeDelta: 0.0091,
          };
        }
        else {
          const lats = wp.map((c) => c.latitude);
          const longs = wp.map((c) => c.longitude);
          const maxLat = Math.max(...lats);
          const minLat = Math.min(...lats);
          const maxLong = Math.max(...longs);
          const minLong = Math.min(...longs);
          const midLat = (minLat + maxLat) / 2;
          const midLong = (minLong + maxLong) / 2;
          const latDelta = (maxLat - minLat) + (latDelta / 100) * 16;
          const longDelta = (maxLong - minLong) +(longDelta / 100) * 16;
          return {
            latitude: midLat,
            longitude: midLong,
            latitudeDelta: latDelta > 0.055 ? latDelta : (fullscreen ? 0.095 : 0.055),
            longitudeDelta: longDelta > 0.055 ? longDelta : (fullscreen ? 0.085 : 0.055)
          };
        }
      }
    } catch (error) {
      return {
        latitude: 63.43048,
        longitude: 10.394966,
        latitudeDelta: 0.0092,
        longitudeDelta: 0.0091,
      };
    }
  }

 /**
 * Function that toggle the visibility of the modal
 * @returns {Void}
 */
  const toggleModal = () => {
    setShowModal(!showModal);
    hideCards();
  };

  /**
 * Function that renders the observation line of the selected marker
 * @returns {Void}
 */
  const mapObservationLines = () => {
    if(report.markers){
      return report.markers.filter(m => m._id == visibleLineId)
      .map(marker => (
          <Polyline
            key={marker.id}
            coordinates={[
              { latitude: marker.markerLat, longitude: marker.markerLong },
              { latitude: marker.userLat, longitude: marker.userLong },
            ]}
            strokeColor={"blue"}
            strokeWidth={3}
          />
        )
      );
    }
  };
    
  /**
 * Function that renders the walkpath of the selected follow-up trip
 * @returns {Void}
 */
  const mapWalkPath = () => {
    if(walkPath){
      return (
        <Polyline
          coordinates={walkPath}
          strokeColor={appColors.error}
          strokeWidth={4}
        />
      );
    }
  }

 /**
 * Function that renders the markers of the selected follow-up trip
 * @returns {Void}
 */
  const mapMarkers = () => {
    if(report.markers){
      report.markers.forEach(m => m["id"] = Math.floor(Math.random() * 13001))
      return report.markers.map(marker => (
        <Marker
          pinColor={activeMarker && marker.id == activeMarker.id ? "navy" : (marker["typeAnnenObservasjon"] ? "black" : "orange")}
          key={marker.id}
          coordinate={{
            latitude: marker.markerLat,
            longitude: marker.markerLong,
          }}
          onPress={() => {
            if(activeMarker == marker){
              hideCards();
            }else{
              showCards(marker);
              setScroll(marker);
            }
          }}
        />
      ));
    }
    return null
  };

   /**
 * Function that renders the start and stop position of the selected follow-up trip
 * @returns {Void}
 */
  const mapStartStop = () => {
    if(walkPath){
      if(walkPath.length > 0){
        let startStop = [ 
          {id: 1, coords: walkPath[0]},
          {id: 2, coords: walkPath[walkPath.length -1]},
        ];
        return startStop.map(point => (
            <Marker 
              pinColor={point.id == 1 ? "green" : "tomato"}
              key = {point.id}
              coordinate = {point.coords}
           />
          )
        );
      }
    }
  }

   /**
 * Function that sets a scrollview of informationcards visible
 * @param {object} the selected marker that is on focurs
 * @returns {Void}
 */
  const showCards = (marker) => {
    setActiveMarker(marker);
    setVisibleLineId(marker._id);
    fadeIn();
    
  }

   /**
 * Function that hides the scroll view of information cards
 * @returns {Void}
 */
  const hideCards = () => {
    setVisibleLineId(null);
    setActiveMarker(null);
    fadeOut();
  }

   /**
 * Function that sets the cards with a fade upon apperance
 * @returns {Void}
 */
  const fadeIn = () => {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(animationHeight, {
      duration: 200,
      toValue: 1,
      useNativeDriver: true, // <-- Add this
    }).start();
  };

    /**
 * Function that sets the cards with a fade when disappearaing
 * @returns {Void}
 */
  const fadeOut = () => {
    // Will change fadeAnim value to 0 in 5 seconds
    Animated.timing(animationHeight, {
      duration: 200,
      toValue: 0,
      useNativeDriver: true, // <-- Add this
    }).start();
  };

/**
 * Function sets the inital values of the scrollview showing information cards based in the selected marker
 * @param {object} marker The selected marker
 * @returns {Void}
 */
  const setScroll = (marker) => {
    ref.scrollTo({
      x: Dimensions.get("window").width * report.markers.indexOf(marker),
      y: 0,
      animated: true,
    });
  }

/**
 * Function that updates the scrollview showing the information cards with the xpos of the marker to be selected
 * @param {integer} xpos pixel value of the card corresponing to the newly selected marker
 * @returns {Void}
 */
  const handleScroll = (xpos) => {

    try {
      let index = xpos / Dimensions.get("window").width;
      index = Math.round(index);
      setActiveMarker(report.markers[index]);
      setVisibleLineId(report.markers[index]._id);
      // setScroll(report.markers[index]);
    } catch (error) {
      console.log("error when scrolling and setting active marker.. ", error);
    }
  }

  /**
 * Function that renders the images of a marker
 * @param {object} marker The marker to render the images for
 * @returns {Void}
 */
  const renderImages = (marker) => {
    if(marker.urls){
      try{
        return marker.urls.map(url => (
          <Pressable key={url} style={styles.smallImage} onPress={() => setImageModalVisible(true)}>
            <Image style={{flex: 1}} source={{ uri: url}}/>
          </Pressable>
        ));
      } catch (err){
        console.log(err)
      }
    }
  }

    /**
 * Function that renders the images of a marker n a large view
 * @param {object} marker The marker to render the images for
 * @returns {Void}
 */
  const renderLargeImages = (marker) => {
    if(marker.urls){
      try{
        return marker.urls.map(url => (
          <View key={url} style={styles.largeImage}>
            <Image style={{flex: 1}} source={{ uri: url}} />
          </View>
        ));
      } catch (err){
        console.log(err)
      }
    }
  }


 /**
 * Function that renders the scrollview showing cards corresponding to each marker shown their infor
 * @returns {View} View with all content
 */ 
  const renderScrollView = () => {
    report.markers.forEach( m => m["id"] = Math.floor(Math.random() * 13020));
    return (
      <View style={{width: Dimensions.get("window").width}}>
        <ScrollView 
          horizontal 
          pagingEnabled 
          style={{height: "100%"}} 
          onMomentumScrollEnd ={ (event) => handleScroll(event.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}
          ref={(ref) => setRef(ref)}
          showsHorizontalScrollIndicator={false}
          >
        {report.markers.map(marker =>
          <View key={marker.id} style={{width: Dimensions.get("window").width}}>
            <ScrollView style={styles.card}>
              <View style={{width: "100%", flexDirection: "row"}}>
                <AppText text={moment(marker.timestamp).format('LT') }/>
                <AppButton 
                  buttonStyle={{position: "absolute", elevation: 0, right: -20, top: -20, borderColor: appColors.transparent, backgroundColor: appColors.transparent, zIndex: 1}} 
                  iconName="close"
                  iconColor={appColors.gray800}
                  iconSize= {30}
                  onPress={() => hideCards()}
                />
              </View>
              {!marker["typeAnnenObservasjon"] && <View style={{flex: 1, flexDirection: "column", flexWrap: "wrap", justifyContent: "space-around", width: "100%"}}>
                
                <View style={{flex: 1, flexDirection: "row", justifyContent: "space-between"}}>
                  {[{"name": "ewes", "id": 1}, {"name": "lambs", "id": 2}, {"name": "dead", "id": 3}, {"name": "injured", "id" : 4},
                  {"name": "black", "id": 5},{"name": "white", "id":6}, {"name": "gray", "id": 7}, {"name": "mix", "id": 8}].filter(cat => marker[cat.name] !== 0).map(cat => 
                  <View key={cat.id} style = {{minWidth: "20%", paddingVertical: 8}}>
                    <AppText text={cat.name} style={{color: appColors.gray500, fontWeight: "600", fontSize: 16, textTransform: "capitalize"}}/>
                    <AppText text={JSON.stringify(parseInt(marker[cat.name == "ewes" ? "sows" : cat.name]))} style={{color: appColors.gray900, fontWeight: "500", fontSize: 24}}/>
                  </View>)}
                </View>
                <View style={{flex: 1, flexDirection: "column", alignItems: "flex-start", marginRight: 8}}>
                  <AppText text="Comment" style={{color: appColors.gray500, fontWeight: "600", fontSize: 16, textTransform: "capitalize"}}/>
                  <AppText text={marker["comment"]} style={{fontSize: 17, color: appColors.primaryDark, textAlign: "left"}}/>
                </View>
              </View>}

              {marker["typeAnnenObservasjon"] && 
                <View style={{alignItems: "flex-start", paddingTop: 16}}>
                  <AppText text="Type of observation" style={{fontSize: 14, color: appColors.primaryLight}}/>
                  <AppText text={report.dot[marker["typeAnnenObservasjon"]]} style={{fontSize: 17, color: appColors.primaryDark}}/>
                  <AppText text="Comment" style={{fontSize: 14, paddingTop: 16, color: appColors.primaryLight}}/>
                  <AppText text={marker["comment"]} style={{fontSize: 17, color: appColors.primaryDark, textAlign: "left"}}/>
                </View>}
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator
                style={{marginHorizontal: -16, paddingHorizontal: 16, marginTop: 8}}>
                {renderImages(marker)}
              </ScrollView>
            </ScrollView>
          </View> )
        }
      </ScrollView>
    </View>)
  }

  const renderScrollDots = () => {
    if(activeMarker){
      return report.markers.map( m => 
        <View key={m.id+1000} style={{height: activeMarker.id == m.id ? 15 : 10, width: activeMarker.id == m.id ? 15 : 10, borderRadius: "50%", backgroundColor: activeMarker.id == m.id ? appColors.primaryDark : appColors.primaryLight, marginHorizontal: 1}} />
        );
    }
  }

 /**
 * Function that renders the detailed information of the selected follow-up trip
 * @returns {Void}
 */ 
  const renderInfo = () => {
    let result = []
    for(let i = 0; i < infoBars.length; i+=2){
        result.push(
          infoBars[i].visible && 
            <View key={Math.floor(Math.random() * 1234)} style={{marginHorizontal: 8, flexDirection: "row", height: 60, alignItems: "center", borderBottomWidth: i < infoBars.length - 2 ? 1 : 0, borderColor: appColors.gray200}}>
              <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <AppText text={infoBars[i].name} style={{fontSize: 16, color: appColors.gray500}}/>
                <AppText text={infoBars[i].value} style={{fontSize: 24, fontWeight: "500", color: appColors.gray900}}/>
              </View>
              <View style={{width: 1, height: "60%", backgroundColor: appColors.gray200}}/>
              <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <AppText text={infoBars[i+1].name} style={{fontSize: 16, color: appColors.gray500}}/>
                <AppText text={infoBars[i+1].value} style={{fontSize: 24, fontWeight: "500", color: appColors.gray900}}/>
              </View>
            </View>
        )
    }
    return (
      result    
    );
  }

/**
 * Function that does so even more information becomes visible
 * @returns {Void}
 */ 
  const readMore = () => {
    setCommentLines(20);
    setReadMoreVisible(false);
  }

  return (
    <>
      <SW contentContainerStyle={{paddingBottom: 16}}>
        <View style={styles.topContainer}>
          <AppButton onPress={() => navigation.navigate("Home")} buttonStyle={styles.closeButton} iconName="close" iconColor={appColors.primaryDark}/>
          <View style={styles.profileImgContainer}>
            <Image
              resizeMode="center"
              source={require("../assets/sheep_128.png")}
            />
          </View>
          <View style={{alignItems: "flex-start", flex: 1}}>
            <AppText text={report.username ? report.username : "Ukjent"} style={{fontSize: 18, fontWeight: "bold"}}/>
            <AppText text={moment(report.starttime).calendar()} style={{fontSize: 16, color: appColors.gray700}}/>
          </View>
          {editButtonVisible && <MaterialIcons name="more-horiz" size={42} color={appColors.gray700} />}
        </View>
        <AppText numberOfLines={4} text={"Comment"} style={styles.infoCommentTitle}/>
        <AppText numberOfLines={commentLines} text={report.comment} style={styles.infoComment}/>
        {readMoreVisible && <Text style={{color: appColors.gray600, marginLeft: 16, marginVertical: 8}} onPress={() => readMore()}>{"Read more"}</Text>}
        <View style={styles.mapView} color={appColors.gray600}>
          <View style={{width: "100%", height: "100%", position: "absolute", backgroundColor: appColors.transparent, zIndex: 5}}>
            <AppButton 
              iconName="fullscreen" 
              iconColor={appColors.primary} 
              buttonStyle={styles.modalButton}
              onPress={toggleModal}
            />
          </View>
          <MapView
            provider="google"
            mapType="terrain"
            style={{ flex: 1 }}
            region={getPathRegion()}
            zoomEnabled={false}
            zoomControlEnabled={false}
            rotateEnabled={false}
            scrollEnabled={false}
            pitchEnabled={false}
            cacheEnabled
            loadingEnabled
          >
            {mapWalkPath()}
            {mapMarkers()}
            {mapStartStop()}
          </MapView>
        </View>
        {renderInfo()}
        {!detailsVisible &&<AppButton buttonText="Show all details" textColor={appColors.secondaryLight} buttonStyle={{marginHorizontal: "25%", height: 30, marginTop: 8}} onPress={()=>setDetailsVisible(true)}/>}
      </SW>
      <Modal visible={showModal} transparent animationType={"slide"}>
        <View style={styles.modal}>
          <MapView
            provider="google"
            mapType="terrain"
            zoomEnabled
            zoomControlEnabled
            showsCompass
            style={{ flex: 1 }}
            initialRegion={getPathRegion(true)}
            loadingEnabled
          >
            {mapWalkPath()}
            {mapObservationLines()}
            {mapMarkers()}
            {mapStartStop()}
          </MapView>
          <AppButton
            buttonStyle={styles.modalButton}
            iconName="fullscreen-exit"
            iconColor={appColors.gray900}
            onPress={toggleModal}
          />
          <Animated.View
            style={[   
              {
              position: "absolute", 
              bottom: 24, 
              minHeight: Dimensions.get("window").height / 4, 
              width: "100%",
              },
              { transform: [ {scaleY: animationHeight}] }
            ]}
            >
            {renderScrollView()}
          </Animated.View>
          
          <View style={{position: "absolute", bottom: 16, flexDirection: "row", width: "100%", justifyContent: "center", alignItems: "center"}}>
            {renderScrollDots()}
          </View>
        </View>
        {imageModalVisible &&
        <View style={{width: Dimensions.get("window").width, position: "absolute", height: "100%"}}>
          <ScrollView  
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator
            style={{height: "100%", backgroundColor: appColors.gray200}}>
            {renderLargeImages(activeMarker)}
          </ScrollView>
          <AppButton iconName="close" buttonStyle={{position: "absolute", top: 16, right: 16}} onPress={() => setImageModalVisible(false)}/>
        </View>}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, 
    margin: 16,
    padding: 16, 
    backgroundColor: appColors.white, 
    borderWidth: 1, 
    borderColor: appColors.gray700, 
    borderRadius: 20, 
    elevation: 16,
    shadowColor: appColors.gray800,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  closeButton: {
    borderColor: appColors.transparent,
    backgroundColor: appColors.transparent,
    elevation: 0,
    position: "absolute",
    right: 8,
    top: 8
  },
  fadingContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "powderblue",
    opacity: 0.9,
    width: "100%",
    height: "100%"
  },
  fadingText: {
    fontSize: 28,
    textAlign: "center",
    margin: 10
  },
  mapStyle: {
    flex: 1,
  },
  mapView: {
    borderColor: appColors.gray200,
    borderWidth: 1,
    minHeight: 250,
    marginBottom: 8,
  },
  infoCommentTitle: {
    color: appColors.gray600,
    top: 8,
    fontSize: 12,
    textAlign: "left",
    paddingHorizontal: 16,
    bottom: 8
  },
  infoComment: {
    color: appColors.gray800,
    fontSize: 18,
    textAlign: "left",
    paddingHorizontal: 16,
    marginBottom: 8,
    top: 8
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: appColors.gray200,
  },
  infoTitle: {
    color: appColors.gray500,
    fontWeight: "400",
    textAlign: "center",
  },
  infoText: {
    fontWeight: "bold",
    color: appColors.gray700,
    fontSize: 24,
  },
  modal: {
    height: "25%",
    flex: 1,
    overflow: "hidden",
  },
  modalButton: {
    position: "absolute", 
    right: 8, 
    top: 8, 
    backgroundColor: appColors.secondaryLight, 
    borderColor: appColors.gray200, 
    borderWidth: 1
  },
  moreButton: {
    backgroundColor: appColors.transparent,
    borderColor: appColors.transparent,
    elevation: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  profileImgContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: "dodgerblue",
    marginRight: 8,
    overflow: "hidden",
    borderColor: appColors.primaryLight,
    borderWidth: 2,

  },
  seeMoreButton: {
    backgroundColor: appColors.transparent, 
    borderColor:appColors.transparent, 
    height: 20, 
    marginBottom: 4,
    width: 100,
  },
  topContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 4
  },
  smallImage: {
    marginHorizontal: 4,
    borderRadius: appSizes.themeRadius,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: appColors.gray200,
    height: 60,
    width: 60,
  },
  largeImage: {
    overflow: "hidden",
    flex: 1,
    maxHeight: "100%",
    width: Dimensions.get("window").width
  }
});

export default ReportScreen;
