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

import { DataStore } from "aws-amplify/datastore";
import { Dish, Order, OrderDish, Restaurant, User } from "../../models";

const ORDER_STATUS = {
  READY_FOR_PICKUP: "READY_FOR_PICKUP",
  ACCEPTED: "ACCEPTED",
  PICKED_UP: "PICKED_UP",
};

const OrderDelivery = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const id = route.params?.id;

  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [dishItems, setDishItems] = useState([]);

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
    if (!id) return;
    DataStore.query(Order, id).then(setOrder);
  }, [id]);

  useEffect(() => {
    if (!order) return;
    DataStore.query(User, order.userID).then(setUser);
    DataStore.query(Restaurant, order.restaurantID).then(setRestaurant);
    const fetchDishItems = async () => {
      //Fetching the order dishes of the order
      const orderDishes = await DataStore.query(OrderDish, (od) =>
        od.orderID.eq(order.id)
      );

      //Now for each dish querying for the dish from id got from orderDish
      const dishPromises = orderDishes.map(async (orderDish) => {
        const dish = await DataStore.query(Dish, orderDish.dishID);
        //returning the dish with the quantity
        return { dish, quantity: orderDish.quantity };
      });
      //get all the dish items with the order quantity
      const resolvedDishes = await Promise.all(dishPromises);
      setDishItems(resolvedDishes);
    };
    fetchDishItems();
  }, [order]);

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

  const restaurantLocation = {
    latitude: restaurant?.lat,
    longitude: restaurant?.lng,
  };

  const deliveryLocation = {
    latitude: user?.lat,
    longitude: user?.lng,
  };

  console.log("Dish item: ", dishItems);
  if (!driverLocation || !order) {
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
          coordinate={restaurantLocation}
          title={restaurant.name}
          description={restaurant.address}
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
            {restaurant.name}
          </Text>
          <View style={styles.addressContainer}>
            <Fontisto name="shopping-store" size={22} color={"grey"} />
            <Text style={styles.addressText}>{restaurant.address}</Text>
          </View>
          <View style={styles.addressContainer}>
            <FontAwesome5 name="map-marker-alt" size={30} color={"grey"} />
            <Text style={styles.addressText}>{user.address}</Text>
          </View>
          <View style={styles.orderDetailContainer}>
            <BottomSheetFlatList
              data={dishItems}
              renderItem={({ item }) => (
                <Text style={styles.orderItemText}>
                  {item.dish.name} x{item.quantity}
                </Text>
              )}
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
