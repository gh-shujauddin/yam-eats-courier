import {
  StyleSheet,
  Text,
  View,
  FlatList,
  useWindowDimensions,
  Dimensions,
  PermissionsAndroid,
} from "react-native";

import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { Entypo } from "@expo/vector-icons";
import React, { useRef, useMemo, useEffect, useState } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import orders from "../../../assets/data/orders.json";
import OrderItem from "../../components/OrderItem";

const OrdersScreen = () => {
  const bottomSheetRef = useRef(null);
  const mapRef = React.createRef();
  // variables
  const snapPoints = useMemo(() => ["12%", "90%"], []);

  const { height, width } = useWindowDimensions();

  const [location, setLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 28.6139,
    longitude: 77.209,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          enableHighAccuracy: true,
          timeInterval: 5,
        });
        setLocation(location);
        if (location) {
          setMapRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
        }
        goToMyLocation();
      } catch (error) {
        console.log("Error fetching location: ", error);
      }
    })();
  }, []);

  const goToMyLocation = async () => {
    try {
      let r = {
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
        latitudeDelta: 0.005,
        longitudeDelta:
          (Dimensions.get("window").width / Dimensions.get("window").height) *
          0.522,
      };
      mapRef.current.animateToRegion(r, 1000);
    } catch (error) {
      console.log("Error moving to user: ", error);
    }
  };

  return (
    <View style={{ flex: 1, width: "100%", backgroundColor: "lightblue" }}>
      <MapView
        ref={mapRef}
        region={{ mapRegion }}
        style={{
          height: height,
          width: width,
        }}
        showsUserLocation
        followsUserLocation
        showsMyLocationButton={true}
        // onUserLocationChange={() => goToMyLocation()}
        onMapLoaded={() => goToMyLocation()}
      >
        {orders.map((order) => (
          <Marker
            key={order.id}
            title={order.Restaurant.name}
            description={order.Restaurant.address}
            coordinate={{
              latitude: order.Restaurant.lat,
              longitude: order.Restaurant.lng,
            }}
          >
            <View
              style={{ backgroundColor: "green", padding: 5, borderRadius: 20 }}
            >
              <Entypo name="shop" size={24} color={"white"} />
            </View>
          </Marker>
        ))}
      </MapView>
      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints}>
        <View style={{ alignItems: "center", marginBottom: 30 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              letterSpacing: 0.5,
              paddingBottom: 5,
            }}
          >
            You're online
          </Text>
          <Text style={{ letterSpacing: 0.5, color: "grey" }}>
            Available orders: {orders.length}
          </Text>
        </View>
        <FlatList
          style={{ width: "100%" }}
          data={orders}
          renderItem={({ item }) => <OrderItem order={item} />}
        />
      </BottomSheet>
    </View>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({});
