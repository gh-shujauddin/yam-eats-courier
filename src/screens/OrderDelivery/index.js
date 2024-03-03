import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import React, { useRef, useMemo, useState, useEffect } from "react";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { FontAwesome5, Fontisto, Ionicons } from "@expo/vector-icons";
import styles from "./styles";

import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useOrderContext } from "../../contexts/OrderContext";

// const ORDER_STATUS = {
//   READY_FOR_PICKUP: "READY_FOR_PICKUP",
//   ACCEPTED: "ACCEPTED",
//   PICKED_UP: "PICKED_UP",
// };

const OrderDelivery = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const id = route.params?.id;

  const [driverLocation, setDriverLocation] = useState(null);
  const [totalMinutes, setTotalMinutes] = useState(null);
  const [totalKms, setTotalKms] = useState(null);
  // const [deliveryStatus, setDeliveryStatus] = useState(
  //   ORDER_STATUS.READY_FOR_PICKUP
  // );
  const [isDriverClose, setIsDriverClose] = useState(false);

  const bottomSheetRef = useRef(null);
  const mapRef = useRef(null);

  const snapPoints = useMemo(() => ["12%", "90%"], []);

  const { height, width } = useWindowDimensions();

  const {
    order,
    user,
    restaurant,
    dishes,
    acceptOrder,
    fetchOrder,
    pickUpOrder,
    completeOrder,
  } = useOrderContext();

  useEffect(() => {
    fetchOrder(id);
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (!status) {
          console.log("Permission revoked");
          return;
        }
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          enableHighAccuracy: true,
          timeInterval: 5,
        });
        setDriverLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (e) {
        console.log("Error fetch location: ", e);
      }
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

  const onButtonPressed = async () => {
    // if (deliveryStatus === ORDER_STATUS.READY_FOR_PICKUP) {
    if (order.status === "READY_FOR_PICKUP") {
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
        // setDeliveryStatus(ORDER_STATUS.ACCEPTED);
        acceptOrder();
      } catch (e) {
        console.log("Error animate to region: ", e);
      }
    }
    // if (deliveryStatus === ORDER_STATUS.ACCEPTED) {
    if (order.status === "ACCEPTED") {
      bottomSheetRef.current?.collapse();
      pickUpOrder();
      // setDeliveryStatus(ORDER_STATUS.PICKED_UP);
    }
    // if (deliveryStatus === ORDER_STATUS.PICKED_UP) {
    if (order.status === "PICKED_UP") {
      await completeOrder();
      bottomSheetRef.current?.collapse();
      navigation.goBack();
    }
  };

  const renderButtonTitle = () => {
    if (order.status === "READY_FOR_PICKUP") {
      return "Accept Order";
    }
    if (order.status === "ACCEPTED") {
      return "Pick-up Order";
    }
    if (order.status === "PICKED_UP") {
      return "Complete Delivery";
    }
  };

  const isButtonDisabled = () => {
    if (order.status === "READY_FOR_PICKUP") {
      return false;
    }
    if (order.status === "ACCEPTED" && isDriverClose) {
      return false;
    }
    if (order.status === "PICKED_UP" && isDriverClose) {
      return false;
    }
    return true;
  };

  const restaurantLocation = {
    latitude: restaurant?.lat,
    longitude: restaurant?.lng,
  };

  const deliveryLocation = {
    latitude: user?.lat,
    longitude: user?.lng,
  };

  if (!driverLocation || !order || !user || !restaurant) {
    return (
      <ActivityIndicator size={"large"} color={"black"} style={{ flex: 1 }} />
    );
  }

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
            order.status === "ACCEPTED" ? restaurantLocation : deliveryLocation
          }
          waypoints={
            order.status === "READY_FOR_PICKUP" ? [restaurantLocation] : []
          }
          strokeWidth={5}
          strokeColor="#3fc060"
          apikey={"AIzaSyCN7hyU2yOff1Ges8FOkfu23vs4FI2neXg"}
          onReady={(result) => {
            setIsDriverClose(result.distance <= 0.1);
            setTotalMinutes(result.duration);
            setTotalKms(result.distance);
          }}
        />

        <Marker
          coordinate={restaurantLocation}
          title={restaurant?.name}
          description={restaurant?.address}
        >
          <View
            style={{ backgroundColor: "green", padding: 5, borderRadius: 20 }}
          >
            <Entypo name="shop" size={24} color={"white"} />
          </View>
        </Marker>
        <Marker
          coordinate={deliveryLocation}
          title={user.name}
          description={user.address}
        >
          <View
            style={{ backgroundColor: "green", padding: 5, borderRadius: 20 }}
          >
            <MaterialIcons name="restaurant" size={30} color={"white"} />
          </View>
        </Marker>
      </MapView>
      {order.status === "READY_FOR_PICKUP" && (
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
            {restaurant?.name}
          </Text>
          <View style={styles.addressContainer}>
            <Fontisto name="shopping-store" size={22} color={"grey"} />
            <Text style={styles.addressText}>{restaurant?.address}</Text>
          </View>
          <View style={styles.addressContainer}>
            <FontAwesome5 name="map-marker-alt" size={30} color={"grey"} />
            <Text style={styles.addressText}>{user.address}</Text>
          </View>
          <View style={styles.orderDetailContainer}>
            <BottomSheetFlatList
              data={dishes}
              renderItem={({ item }) => {
                return (
                  <Text style={styles.orderItemText}>
                    {item.name} x{item.quantity}
                  </Text>
                );
              }}
            />
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
