import React, { PureComponent } from "react";
import { View, StyleSheet, TouchableHighlight } from "react-native";
import moment from "moment";

import { appColors, appSizes } from "../config";
import AppText from "./AppText";
import MapView, { Polyline, Marker } from "react-native-maps";

const ReportItem = ({ item, onPress }) => {

  const getPathRegion = (report) => {
    try {
      if(report.walkpath){
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
            latitudeDelta: latDelta > 0.055 ? latDelta : 0.055,
            longitudeDelta: longDelta > 0.055 ? longDelta : 0.055
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

  const mapWalkPath = (report) => {
    if(report.walkpath){
      return (
        <Polyline
          key={report.walkpath}
          coordinates={eval(report.walkpath)}
          strokeColor={appColors.error}
          strokeWidth={4}
        />
      );
    }
  }

  const mapStartStop = (report) => {
    if(report.walkpath){
      try{
        const wp = eval(report.walkpath)
        if(wp.length > 1){
          let startStop = [ 
            {id: 0, coords: wp[0]},
            {id: 1, coords: wp[wp.length -1]},
          ];
          return startStop.map(point => (
            <Marker 
              key = {point.id}
              coordinate = {point.coords}
              pinColor={point.id == 0 ? "green" : "tomato"}
            >
            </Marker> 
            )
          );
        }
      }catch(error){
        return;
      }
    }
  }

  return (
    <TouchableHighlight
      style={styles.touchContainer}
      underlayColor={appColors.primaryLight}
      onPress={onPress}
    >
      <View style={styles.reportItem}>
        <View style={styles.itemHeader}>
          <AppText
            style={styles.itemHeaderText}
            text={item["username"]}
          />
          <AppText
            style={styles.itemHeaderText}
            text={moment(item["starttime"]).calendar()}
          />
        </View>
        <View style={styles.mapView}>
          <View style={styles.overlay}/>
          <MapView
            liteMode
            provider="google"
            mapType="terrain"
            style={{ flex: 1 }}
            region={getPathRegion(item)}
            zoomEnabled={false}
            zoomControlEnabled={false}
            rotateEnabled={false}
            scrollEnabled={false}
            pitchEnabled={false}
            cacheEnabled
            loadingEnabled
          >
            {mapWalkPath(item)}
            {mapStartStop(item)}
          </MapView>
        </View>
        <View style={styles.itemBody}>
          <View style={styles.itemBodyComponent}>
            <AppText text="Ewes" />
            <AppText text={JSON.stringify(parseInt(item["totalSowCount"]))} />
          </View>
          <View style={styles.itemBodyComponent}>
            <AppText text="Lambs" />
            <AppText text={JSON.stringify(parseInt(item["totalLambCount"]))} />
          </View>
          <View style={styles.itemBodyComponent}>
            <AppText text="Injured" />
            <AppText text={JSON.stringify(parseInt(item["injurycount"]))} />
          </View>
          <View style={styles.itemBodyComponent}>
            <AppText text="Dead" />
            <AppText text={JSON.stringify(parseInt(item["deathcount"]))} />
          </View>
        </View>
      </View>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  itemBody: {
    flexDirection: "row",
    flex: 0.5,
    backgroundColor: appColors.secondary,
    borderColor: appColors.secondaryDark,
    borderTopWidth: 1,
  },
  itemBodyComponent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  itemHeader: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    backgroundColor: appColors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemHeaderText: {
    color: appColors.secondary,
    fontWeight: "500",
    fontSize: 16,
  },
  mapView: {
    flex: 3,
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  reportItem: {
    minHeight: 230,
    overflow: "hidden",
    shadowColor: appColors.gray300,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  touchContainer: {
    marginVertical: 8,
    marginHorizontal: 16,
    overflow: "hidden",
    borderRadius: appSizes.themeRadius,
    elevation: 2,
    borderWidth: 1,
    borderRadius: appSizes.themeRadius,
    borderColor: appColors.secondaryDark,
  },
});

export default ReportItem;
