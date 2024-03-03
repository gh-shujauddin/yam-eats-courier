import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";

import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { Entypo } from "@expo/vector-icons";
import React, { useRef, useMemo, useEffect, useState } from "react";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { DataStore } from "aws-amplify/datastore";
import { Order, OrderStatus, Restaurant } from "../../models";
import orders from "../../../assets/data/orders.json";
import OrderItem from "../../components/OrderItem";
import CustomMarker from "../../components/CutomMarker";

const OrdersScreen = () => {
  const [orders, setOrders] = useState(null);
  const [restaurants, setRestaurants] = useState([]);

  const bottomSheetRef = useRef(null);
  const mapRef = React.createRef();
  // variables
  const snapPoints = useMemo(() => ["12%", "90%"], []);

  const { height, width } = useWindowDimensions();
  const [driverLocation, setDriverLocation] = useState(null);

  const [mapRegion, setMapRegion] = useState({
    latitude: 28.6139,
    longitude: 77.209,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const fetchOrder = () => {
    DataStore.query(Order, (order) =>
      order.status.eq(OrderStatus.READY_FOR_PICKUP)
    ).then(setOrders);
  };
  useEffect(() => {
    fetchOrder();
    const subscription = DataStore.observe(Order).subscribe(
      ({ opType, element }) => {
        if (opType === "UPDATE") {
          fetchOrder();
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!orders) return;
    const fetchRestaurants = async () => {
      const restaurantPromises = orders.map(async (order) => {
        const restaurant = await DataStore.query(
          Restaurant,
          order.restaurantID
        );
        return restaurant;
      });
      const resolvedRestaurants = await Promise.all(restaurantPromises);
      setRestaurants(resolvedRestaurants);
    };
    fetchRestaurants();
  }, [orders]);

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
  }, []);

  if (!mapRegion || !orders || !restaurants || !driverLocation) {
    return <ActivityIndicator style={{ flex: 1 }} size={"large"} />;
  }

  return (
    <View style={{ flex: 1, width: "100%", backgroundColor: "lightblue" }}>
      <MapView
        ref={mapRef}
        // region={mapRegion}
        style={{
          height: height,
          width: width,
        }}
        showsUserLocation
        followsUserLocation
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.07,
          longitudeDelta: 0.07,
        }}
      >
        {restaurants.map((restaurant, index) => {
          return (
            <CustomMarker key={index} data={restaurant} type="RESTAURANT" />
          );
        })}
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
        <BottomSheetFlatList
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
