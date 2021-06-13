import React, {useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  Image,
  Text,
  Modal
} from "react-native";
import { Audio } from 'expo-av'
import { Camera } from 'expo-camera';
import { useNetInfo } from "@react-native-community/netinfo";

import { appColors, appSizes } from "../config";
import AppActivityIndicator from "../components/AppActivityIndicator";
import AppText from "../components/AppText";
import AppButton from "../components/AppButton";
import AppTextInput from "../components/AppTextInput";
import Screen from "../components/Screen";
import Dropdown from "../components/Dropdown";
import Apptext from "../components/AppText";
import Icon from "../components/Icon";

/**
 * Component that renders the observation screen 
 * @param {Function} cancelAction Function that runs when canceling the new marker placement.
 * @param {Function} confirmAction Function that runs when the new follow-up trip is confirmed
 * @param {Object} marker The newly added marker
 * @param {String} typeOfObsercation Observation type of either sheep of other
 * @return {Screen} Screen containing everyting to be displayed.
 */

const ObservationScreen = ({ cancelAction, confirmAction, marker, editMarkerFunc, typeOfObservation }) => {
  const [observationType, setObservationType] = useState(typeOfObservation);
  const [disableButton, setDisableButton] = useState(true);
  const [offset, setOffset] = useState(0);
  const [activeID, setactiveID] = useState(1);
  const [addComment, setAddComment] = useState(false);
  const netInfo = useNetInfo();

  //  Camera variables
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [showCamera, setShowCamera] = useState(false);
  const [previewImage, setPreviewImage] = useState(false);
  const [newPhoto, setNewPhoto] = useState({});
  const [photosToRender, setPhotosToRender] = useState([]);
  const [disableUsePhotoButton, setDiasbleUtPhotoButton] = useState(false);

  const categories = [
    {id: 1, name: "sows"}, {id: 2, name: "lambs"}, 
    {id: 3, name: "injured"}, {id: 4, name: "dead"}, 
    {id: 5, name: "gray"}, {id: 6, name: "white"}, 
    {id: 7, name: "black"}, {id: 8, name: "mix"}
  ];

/**
 * Function asking the user for permisson to use the camera
 * @return {View} Returns a view with camera or text depending on permisson
 */
  const askForCameraPermission = () => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    if(hasPermission == true){
      setShowCamera(true);
    }
    if (hasPermission === null) {
      return <View />;
    }
    if (hasPermission === false) {
      return <View><Text>No access to camera</Text></View>;
    }
  }

/**
 * Function asking the user for permisson to use the camera
 * @return {void}
 */
  const disable = () => {
    if(observationType == "Sheep"){
      if(  ((marker.sows == undefined || marker.sows == "" || marker.sows == "0") && (marker.lambs == undefined || marker.lambs == "" || marker.lambs == "0"))){
        setDisableButton(true);
      }else{
        setDisableButton(false)
      }
    }else if(observationType == "Other"){
      if(marker["typeAnnenObservasjon"] == undefined || marker["comment"] == undefined){
        setDisableButton(true)
      }else{
        setDisableButton(false);
      }
    }
  }

/**
 * Function playing the decrease sound when decreasing the number of category
 * @return {void}
 */
  const playSwoshSound = async () => {
    const soundObject = new Audio.Sound();
    try {
      await soundObject.loadAsync(require('../assets/sounds/down_sound.mp3'));
      await soundObject.playAsync();
    } catch (error) {
      console.log(error);
    }
  }

  /**
 * Function playing the increase sound when increasing the number of category
 * @return {void}
 */
  const playSwishSound = async () => {
    const soundObject = new Audio.Sound();
    try {
      await soundObject.loadAsync(require('../assets/sounds/up_sound.mp3'));
      await soundObject.playAsync();
    } catch (error) {
      console.log(error);
    }
  }

  /**
 * Function increasing the number of category
 * @return {void}
 */
  const increase = (categorie, currentVal) => {
    if(Number.isNaN(currentVal)){
      editMarkerFunc(categorie, ""+1);
      playSwishSound();
    }else{
      editMarkerFunc(categorie, ""+(currentVal + 1));
      playSwishSound();
      disable();
    }
  }

  /**
 * Function decreasing the number of category
 * @return {void}
 */
  const decrease = (categorie, currentVal) => {
    if(Number.isNaN(currentVal)) return;
    if(currentVal === 0) return;
    editMarkerFunc(categorie, ""+(currentVal - 1));
    playSwoshSound();
    disable();
  }

  /**
 * Function that either increases of decrease the value of a category
 * @return {void}
 */
  const editValue = (swipeEvent, categorie, currentVal) => {
    if(offset > swipeEvent.nativeEvent.contentOffset.y){
      increase(categorie.name, parseInt(currentVal));
    }else{
      decrease(categorie.name, parseInt(currentVal));
    }
  }

/**
 * Function that renders the view with all categories
 * @return {View} A View 
 */
  const renderViewState = () => {
    return categories.map( cat =>
      <View style={{width: Dimensions.get("window").width}} key={cat.id} >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1}}
          onScrollBeginDrag={ (event) => setOffset(event.nativeEvent.contentOffset.y)}
          onScrollEndDrag={ (event) => editValue(event, cat, marker[cat.name])}
          bounces
          >
          <View style={styles.catMainContainer}>
            <AppButton iconName="add" iconSize={64} onPress={() => increase(cat.name, parseInt(marker[cat.name]))} buttonStyle={styles.increaseButton}/>
            <View style={styles.catMainInfoContainer}>
              <Icon MI={false} iconName={"gesture-swipe-vertical"} iconColor={appColors.primary} iconSize={48}/>
              <View style={styles.catContainer}>
                <AppText style={styles.catName} text={cat.name == "sows" ? "Ewes" : cat.name} />
                <AppText style={styles.catValue} text={marker[cat.name]}/>
              </View>
              <Icon MI={false} iconName={"gesture-swipe-vertical"} iconColor={appColors.primary} iconSize={48}/>
            </View>
            <AppButton iconName="remove" iconSize={64} onPress={() => decrease(cat.name, parseInt(marker[cat.name]))} buttonStyle={styles.decreaseButton}/>
          </View>
        </ScrollView>
      </View>
    )
  }

  /**
 * Function theat renders navigation dots at bootom of screen
 * @return {View}
 */
  const renderNavDots = () => {
    return categories.map( cat => {
      if(activeID != cat.id){
        return <View key={cat.id} style={styles.navDot}/>
      }else{
        return <View key={cat.id} style={styles.activeNavDot}/>
      }
    });
  }

  /**
 * Function that updates active nav dot styles
 * @param {Integer} xpos integer that is used when updating the active nav dot
 * @return {void}
 */
  const updateActiveNavDot = (xpos) => {
    setactiveID(Math.round(xpos / Dimensions.get("window").width + 1));
  }

  /**
 * Function that runs when user takes a picture 
 * @return {void}
 */
  const takePicture = async () => {
    if (this.camera) {
      let photo = await this.camera.takePictureAsync({quality: 0, base64: true});
      setNewPhoto(photo);
      setPreviewImage(true);
    }
  };

  /**
 * Function uploads the newly taken photo to cloud
 * @param {photo} photo to be uploaded
 * @return {void}
 */
  const uploadPhoto = async (photo) => {
    if (photo.base64) {
      let base64Img = `data:image/jpg;base64,${photo.base64}`;
      let apiUrl =
        'https://api.cloudinary.com/v1_1/dlpfyaci8/image/upload';
      let data = {
        file: base64Img,
        upload_preset: 'myUploadPreset'
      };

      if(netInfo.isInternetReachable){
        let response = await fetch(apiUrl, {
          body: JSON.stringify(data),
          headers: {
            'content-type': 'application/json'
          },
          method: 'POST'
        });
        let response_data = await response.json();
        if(response_data.secure_url){
          //alert('Upload successful');
          return response_data.secure_url;
        }else{
          //alert('Cannot upload');
          console.log("Error", err);
          return null;
        }
      }else{
        return photo.uri;
      }
    }
  } 

  /**
 * Function that deletes the newley taken photo and opens the camera 
 * @return {void}
 */
  const deleteAndRetakePhote = () => {
    setPreviewImage(false);
    setShowCamera(true);
    setNewPhoto({});
  }

  /**
 * Function function that stores the newly taken photo
 * @return {void}
 */
  const usePhoto = async () => {
    setDiasbleUtPhotoButton(true);
    let url = await uploadPhoto(newPhoto);
    if(url){
      newPhoto["url"] = url;
      if(marker.photos){
        marker.photos.push(newPhoto);
        marker.urls.push(url);
      }else{
        marker["photos"] = [newPhoto];
        marker["urls"] = [url];
      }
      setPhotosToRender(marker.photos);
      setPreviewImage(false);
      setShowCamera(false);
      setNewPhoto({});
    }
    setDiasbleUtPhotoButton(false);
  }

  /**
 * Function that renders all saved photos
 * @return {View} View displaying all photos
 */
  const renderPhotos = () => {
    if(photosToRender.length > 0){
      return photosToRender.map( p => (
        <View key={photosToRender.indexOf(p)} style={styles.smallImage}>
          <Image style={{flex: 1}} source={{ uri: p.uri}}/>
        </View>
      ));
    }
  }

  return (
  <Screen style={styles.mainScreen}>
    {observationType == "Sheep" && <View style={styles.mainContainer}>
      <View style={{flex: 1, marginTop: 16}}>
        {!addComment && <ScrollView 
          style={{paddingTop: 8}} 
          showsHorizontalScrollIndicator={false} 
          horizontal 
          pagingEnabled 
          onMomentumScrollEnd ={(event)=> updateActiveNavDot(event.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}>
          {renderViewState()}
        </ScrollView>}
        {!addComment && <View style={styles.navDotsContainer}> 
          {renderNavDots()}
        </View>}
        {addComment &&
          <View style={{flex: 1, flexDirection: "column", padding: 16, justifyContent: "center"}}>
            <View style={{justifyContent: "center", marginBottom: 16}}>
              <AppText text="Add comment" style={{fontSize: 32, color: appColors.gray800, fontWeight: "bold"}}/>
              <AppTextInput 
                style={{marginBottom: 8, backgroundColor: appColors.gray100, height: 150, borderColor: appColors.secondaryDark}} 
                placeholder = "Comment"
                valueFunc = { (inputText) => {marker["comment"] = inputText; disable()}}
              />
            </View>
            <AppButton buttonText="Add photos" iconName="camera-alt" iconSideLeft={false} onPress={() => askForCameraPermission()}/>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator 
              style={styles.imageScrollview}>
              {renderPhotos()}
            </ScrollView>
          </View>

        }
     </View>
     
      <View style={styles.bottomContainer}>
        <AppButton
          buttonText={"Cancel"}
          textSize={20}
          textColor={appColors.gray600}
          buttonStyle={{
            backgroundColor: appColors.secondaryLight,
            borderColor: appColors.gray600,
          }}
          onPress={cancelAction}
        />
        {observationType == "Sheep" && !addComment && <AppButton
          buttonText="Add Comment"
          textColor={appColors.secondaryLight}
          textSize={20}
          onPress={() => setAddComment(true)}
          disabled={disableButton}
          buttonStyle={{backgroundColor: disableButton ? appColors.gray200 : appColors.primary, borderColor: disableButton ? appColors.gray500 : appColors.primaryDark}}
        />}
        {observationType != "Sheep" || addComment && <AppButton
          buttonText="Done"
          iconName="check"
          iconSize={22}
          textColor={appColors.secondaryLight}
          textSize={20}
          onPress={confirmAction}
          disabled={disableButton}
          buttonStyle={{backgroundColor: disableButton ? appColors.gray200 : appColors.primary, borderColor: disableButton ? appColors.gray500 : appColors.primaryDark}}
        />}
      </View>
    
    </View>}

    {observationType == "Other" &&<View style={styles.mainContainer}>
      <View style={{flex: 1, padding: 16, paddingTop: 32}}>
        <Apptext text="Describe observation" style={{fontSize: 32, marginBottom: 32, color: appColors.gray800, fontWeight: "bold"}}/>
        <Dropdown 
          labelText="Category"
          defaultValue="Choose category"
          options = {["Bjørn", "Ulv", "Gaupe", "Jerv", "Annet"]}
          onOptionPress={ obsType => {marker["typeAnnenObservasjon"] = obsType; disable()}}
        />
        <View style={{alignItems: "flex-start", marginTop: 16}}>
          <AppText text="Description" style={{color: appColors.gray700}}/>
        </View>
        <AppTextInput
          multiline
          valueFunc = { (inputText) => {marker["comment"] = inputText; disable()}}
          numberOfLines={10}
          placeHolderText="Describe the observation"
          style={{minHeight: 100, backgroundColor: appColors.gray100, marginBottom: 16}}
          />
        <AppButton buttonText="Add photos" iconName="camera-alt" iconSideLeft={false} onPress={() => askForCameraPermission()}/>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator 
          style={styles.imageScrollview}>
          {renderPhotos()}
        </ScrollView>
      </View>
      <View style={styles.bottomContainer}>
        <AppButton
          buttonText={"Cancel"}
          textSize={20}
          textColor={appColors.gray600}
          buttonStyle={{
            backgroundColor: appColors.secondaryLight,
            borderColor: appColors.gray600,
          }}
          onPress={cancelAction}
        />
        <AppButton
          buttonText="Done"
          iconName="check"
          iconSize={22}
          textColor={appColors.secondaryLight}
          textSize={20}
          onPress={confirmAction}
          disabled={disableButton}
          buttonStyle={{backgroundColor: disableButton ? appColors.gray200 : appColors.primary, borderColor: disableButton ? appColors.gray500 : appColors.primaryDark}}
        />
      </View>
    </View>}
          
    
    <Modal visible={showCamera} transparent animationType={"slide"}>
      {!previewImage &&<Camera 
        style={styles.camera} 
        type={type}
        ref={ref => {
          this.camera = ref;
        }}>
        <View style={{flexDirection: "column", position: "absolute", top: 24, right: 16}}>
          <AppButton 
            iconName={"close"}
            onPress={() => setShowCamera(false)}
            buttonStyle={{width: 60, height: 60, borderRadius: 30, marginBottom: 8}}
          />
          <AppButton 
            iconName={"switch-camera"}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}
            buttonStyle={{width: 60, height: 60, borderRadius: 30}}
          />
        </View>
        <AppButton 
          iconName={"camera-alt"}
          onPress={() => takePicture()}
          buttonStyle={styles.cameraButton}
        />
      </Camera>}
      {previewImage && <View style={{flex: 1}}>
        <View style={{flexDirection: "column", position: "absolute", zIndex: 5, top: 24, right: 16}}>
          <AppButton 
            iconName={"close"}
            onPress={() => deleteAndRetakePhote()}
            buttonStyle={{width: 60, height: 60, borderRadius: 30, marginBottom: 8}}
          />
        </View>
        <View style={{
          width: "100%", 
          backgroundColor: appColors.transparent, 
          flexDirection: "colomn", 
          position: "absolute", 
          zIndex: 5, 
          bottom: 24,
          justifyContent: "space-around",
          alignItems: "center"}}>
          {!disableUsePhotoButton && <AppButton 
            buttonText="Use photo"
            onPress={() => usePhoto()}
            disabled={disableUsePhotoButton}
          />}
          <AppActivityIndicator visible={disableUsePhotoButton} style={styles.loader}/>
        </View>
        <Image
          style={{flex:1}}
          source={{
            uri: newPhoto.uri,
          }}
        />
      </View>}
    </Modal>


  </Screen>
  );
}

const styles = StyleSheet.create({
  mainScreen: {
    backgroundColor: appColors.transparent
  },
  bigButton: {
    backgroundColor: appColors.gray200,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    borderRadius: appSizes.themeRadius,
    borderWidth: 2,
    margin: 8,
    borderColor: appColors.gray600,
  },
  bottomContainer: {
    minHeight: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderColor: appColors.gray200,
    paddingTop: 16,
    margin: 8,
    marginTop: 0
  },
  camera: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end"
  },
  cameraButton: {
    width: 80, 
    height: 80,
    borderColor: appColors.primaryLight, 
    borderWidth: 8, 
    borderRadius: 40, 
    bottom: 32
  },
  mainContainer: {
    flex: 1, 
    backgroundColor: appColors.secondary, 
    borderTopLeftRadius: appSizes.themeRadius,
    borderTopRightRadius: appSizes.themeRadius
  },
  input: {
    width: 100,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  imageScrollview: { 
    flexDirection: "row", 
    maxHeight: 70, 
    marginTop: 16,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: appColors.gray200,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  navDotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: Dimensions.get("window").width, 
    height: 20,
    marginVertical: 16,
    bottom: 0, 
    zIndex: -2
  },
  navDot: {
    width: 15, 
    minHeight: 15, 
    borderRadius: 7.5, 
    backgroundColor: appColors.gray300, 
    marginHorizontal: 1
  },
  activeNavDot: {
    width: 20, 
    height: 20, 
    borderRadius: 10, 
    backgroundColor: appColors.gray600, 
    marginHorizontal: 2
  },
  title: {
    marginTop: 16,
    fontSize: 24,
    color: appColors.gray700,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  labelText: {
    color: appColors.gray600,
    fontSize: 22,
    width: "50%",
    textTransform: "uppercase",
    textAlign: "center"
  },
  smallImage: {
    marginHorizontal: 4,
    borderRadius: appSizes.themeRadius,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: appColors.gray200,
    height: 60,
    width: 60
  },
  loader: {
    backgroundColor: appColors.transparent,
    zIndex: 5,
    width: 100,
    height: 100,
  },
  increaseButton: {
    backgroundColor: "green",
    width: "90%", 
    flex: 1
  },
  decreaseButton: {
    backgroundColor: "tomato", 
    width: "90%", 
    flex: 1
  },
  catName: {
    color: appColors.gray700, 
    fontSize: 42, 
    marginBottom: -8, 
    textTransform: "uppercase"
  },
  catValue: {
    color: appColors.gray700,
    fontSize: 64
  },
  catContainer: {
    alignItems: "center", 
    justifyContent: "center", 
    marginVertical: -32
  },
  catMainInfoContainer: {
    flexDirection: "row", 
    alignItems: "center", 
    width: "100%", 
    justifyContent: "space-between", 
    padding: 32
  },
  catMainContainer: {
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center"
  }
});

export default ObservationScreen;

