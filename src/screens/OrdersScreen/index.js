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

const OrdersScreen = () => {
  const [orders, setOrders] = useState(null);
  const [restaurants, setRestaurants] = useState([]);

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

  useEffect(() => {
    DataStore.query(Order, (order) =>
      order.status.eq(OrderStatus.READY_FOR_PICKUP)
    ).then(setOrders);
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

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       let { status } = await Location.requestForegroundPermissionsAsync();
  //       if (status !== "granted") {
  //         console.log("Permission to access location was denied");
  //         return;
  //       }

  //       let location = await Location.getCurrentPositionAsync({
  //         accuracy: Location.Accuracy.Balanced,
  //         enableHighAccuracy: true,
  //         timeInterval: 5,
  //       });
  //       setLocation(location);
  //       if (location) {
  //         setMapRegion({
  //           latitude: location.coords.latitude,
  //           longitude: location.coords.longitude,
  //           latitudeDelta: 0.005,
  //           longitudeDelta: 0.005,
  //         });
  //       }
  //       goToMyLocation();
  //     } catch (error) {
  //       console.log("Error fetching location: ", error);
  //     }
  //   })();
  // }, []);

  // const goToMyLocation = async () => {
  //   try {
  //     let r = {
  //       latitude: mapRegion.latitude,
  //       longitude: mapRegion.longitude,
  //       latitudeDelta: 0.005,
  //       longitudeDelta:
  //         (Dimensions.get("window").width / Dimensions.get("window").height) *
  //         0.522,
  //     };
  //     mapRef.current.animateToRegion(r, 1000);
  //   } catch (error) {
  //     console.log("Error moving to user: ", error);
  //   }
  // };

  if (!mapRegion || !orders || !restaurants) {
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
        showsMyLocationButton={true}
        // onMapReady={() => goToMyLocation()}
        provider={PROVIDER_GOOGLE}
      >
        {restaurants.map((restaurant, index) => {
          return (
            <Marker
              key={index}
              title={restaurant.name}
              description={restaurant.address}
              coordinate={{
                latitude: restaurant.lat,
                longitude: restaurant.lng,
              }}
            >
              <View
                style={{
                  backgroundColor: "green",
                  padding: 5,
                  borderRadius: 20,
                }}
              >
                <Entypo name="shop" size={24} color={"white"} />
              </View>
            </Marker>
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
