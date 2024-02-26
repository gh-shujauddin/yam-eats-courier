import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import React, { useRef, useMemo, useState, useEffect } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import { FontAwesome5, Fontisto, Ionicons } from "@expo/vector-icons";
import styles from "./styles";
import orders from "../../../assets/data/orders.json";
const order = orders[0];
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const ORDER_STATUS = {
  READY_FOR_PICKUP: "READY_FOR_PICKUP",
  ACCEPTED: "ACCEPTED",
  PICKED_UP: "PICKED_UP",
};

const restaurantLocation = {
  latitude: order.Restaurant.lat,
  longitude: order.Restaurant.lng,
};
const deliveryLocation = {
  latitude: order.User.lat,
  longitude: order.User.lng,
};

const OrderDelivery = () => {
  const navigation = useNavigation();

  const [driverLocation, setDriverLocation] = useState(null);
  const [totalMinutes, setTotalMinutes] = useState(null);
  const [totalKms, setTotalKms] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState(
    ORDER_STATUS.READY_FOR_PICKUP
  );
  const [isDriverClose, setIsDriverClose] = useState(false);

  const bottomSheetRef = useRef(null);
  const mapRef = useRef(null);

  const snapPoints = useMemo(() => ["12%", "90%"], []);

  const { height, width } = useWindowDimensions();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestBackgroundPermissionsAsync();
      if (!status) {
        console.log("Permission revoked");
        return;
      }
      let location = await Location.getCurrentPositionAsync();
      setDriverLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();

    const foregroundSubscription = async () =>
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
        },
        (updatedLocation) => {
          setDriverLocation({
            latitude: updatedLocation.coords.latitude,
            longitude: updatedLocation.coords.longitude,
          });
        }
      );
    return foregroundSubscription;
  }, []);

  if (!driverLocation) {
    return (
      <ActivityIndicator size={"large"} color={"black"} style={{ flex: 1 }} />
    );
  }

  const onButtonPressed = () => {
    if (deliveryStatus === ORDER_STATUS.READY_FOR_PICKUP) {
      try {
        bottomSheetRef.current?.collapse();
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: driverLocation.latitude,
              longitude: driverLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            1000
          );
        }
        setDeliveryStatus(ORDER_STATUS.ACCEPTED);
      } catch (e) {
        console.log("Error animate to region: ", e);
      }
    }
    if (deliveryStatus === ORDER_STATUS.ACCEPTED) {
      bottomSheetRef.current?.collapse();
      setDeliveryStatus(ORDER_STATUS.PICKED_UP);
    }
    if (deliveryStatus === ORDER_STATUS.PICKED_UP) {
      bottomSheetRef.current?.collapse();
      navigation.goBack();
      console.warn("Delivery finished");
    }
  };

  const renderButtonTitle = () => {
    if (deliveryStatus === ORDER_STATUS.READY_FOR_PICKUP) {
      return "Accept Order";
    }
    if (deliveryStatus === ORDER_STATUS.ACCEPTED) {
      return "Pick-up Order";
    }
    if (deliveryStatus === ORDER_STATUS.PICKED_UP) {
      return "Complete Delivery";
    }
  };

  const isButtonDisabled = () => {
    if (deliveryStatus === ORDER_STATUS.READY_FOR_PICKUP) {
      return false;
    }
    if (deliveryStatus === ORDER_STATUS.ACCEPTED && isDriverClose) {
      return false;
    }
    if (deliveryStatus === ORDER_STATUS.PICKED_UP && isDriverClose) {
      return false;
    }
    return true;
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={{ height, width }}
        showsUserLocation
        followsUserLocation
        initialRegion={{
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.07,
          longitudeDelta: 0.07,
        }}
      >
        <MapViewDirections
          origin={driverLocation}
          destination={
            deliveryStatus === ORDER_STATUS.ACCEPTED
              ? restaurantLocation
              : deliveryLocation
          }
          waypoints={
            deliveryStatus === ORDER_STATUS.READY_FOR_PICKUP
              ? [restaurantLocation]
              : []
          }
          strokeWidth={5}
          strokeColor="#3fc060"
          apikey={"AIzaSyCN7hyU2yOff1Ges8FOkfu23vs4FI2neXg"}
          onReady={(result) => {
            setIsDriverClose(result.distance <= 0.1);
            console.log(isDriverClose);
            setTotalMinutes(result.duration);
            setTotalKms(result.distance);
          }}
        />
        <Marker
          coordinate={{
            latitude: order.Restaurant.lat,
            longitude: order.Restaurant.lng,
          }}
          title={order.Restaurant.name}
          description={order.Restaurant.address}
        >
          <View
            style={{ backgroundColor: "green", padding: 5, borderRadius: 20 }}
          >
            <Entypo name="shop" size={24} color={"white"} />
          </View>
        </Marker>

        <Marker
          coordinate={{ latitude: order.User.lat, longitude: order.User.lng }}
          title={order.User.name}
          description={order.User.address}
        >
          <View
            style={{ backgroundColor: "green", padding: 5, borderRadius: 20 }}
          >
            <MaterialIcons name="restaurant" size={30} color={"white"} />
          </View>
        </Marker>
      </MapView>
      {deliveryStatus === ORDER_STATUS.READY_FOR_PICKUP && (
        <Ionicons
          onPress={() => navigation.goBack()}
          name="arrow-back-circle"
          size={45}
          color={"black"}
          style={{ position: "absolute", top: 30, left: 15 }}
        />
      )}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <View style={styles.handleIndicatorContainer}>
          <Text style={styles.routeDetailsText}>
            {totalMinutes && totalMinutes.toFixed(0)} min
          </Text>
          <FontAwesome5
            name="shopping-bag"
            size={30}
            color="#3fc060"
            style={{ marginHorizontal: 15 }}
          />
          <Text style={styles.routeDetailsText}>
            {totalKms && totalKms.toFixed(2)} km
          </Text>
        </View>
        <View style={styles.deliveryDetailContainer}>
          <Text style={{ fontSize: 25, letterSpacing: 1, paddingVertical: 20 }}>
            {orders[0].Restaurant.name}
          </Text>
          <View style={styles.addressContainer}>
            <Fontisto name="shopping-store" size={22} color={"grey"} />
            <Text style={styles.addressText}>
              {orders[0].Restaurant.address}
            </Text>
          </View>
          <View style={styles.addressContainer}>
            <FontAwesome5 name="map-marker-alt" size={30} color={"grey"} />
            <Text style={styles.addressText}>{orders[0].User.address}</Text>
          </View>
          <View style={styles.orderDetailContainer}>
            <Text style={styles.orderItemText}>Onion Kings x1</Text>
            <Text style={styles.orderItemText}>Big Kings x1</Text>
            <Text style={styles.orderItemText}>Big Taasty x1</Text>
            <Text style={styles.orderItemText}>Coca Cola x2</Text>
          </View>
        </View>
        <Pressable
          disabled={isButtonDisabled()}
          onPress={onButtonPressed}
          style={[
            styles.buttonContainer,
            { backgroundColor: isButtonDisabled() ? "grey" : "#3fc060" },
          ]}
        >
          <Text style={styles.buttonText}>{renderButtonTitle()}</Text>
        </Pressable>
      </BottomSheet>
    </View>
  );
};

export default OrderDelivery;
