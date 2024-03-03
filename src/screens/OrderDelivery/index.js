import { ActivityIndicator, View, useWindowDimensions } from "react-native";
import React, { useRef, useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useOrderContext } from "../../contexts/OrderContext";
import BottomSheetDetails from "./BottomSheetDetails";
import CustomMarker from "../../components/CutomMarker";
import { DataStore } from "aws-amplify/dist/esm/datastore";
import { Courier } from "../../models";
import { useAuthContext } from "../../contexts/AuthContext";

const OrderDelivery = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const id = route.params?.id;

  const [driverLocation, setDriverLocation] = useState(null);

  const mapRef = useRef(null);

  const [totalMinutes, setTotalMinutes] = useState(null);
  const [totalKms, setTotalKms] = useState(null);

  const { height, width } = useWindowDimensions();

  const { order, user, restaurant, fetchOrder } = useOrderContext();
  const { dbCourier } = useAuthContext();

  useEffect(() => {
    fetchOrder(id);
  }, [id]);

  useEffect(() => {
    if (!driverLocation) return;
    DataStore.save(
      Courier.copyOf(dbCourier, (updated) => {
        updated.lat = driverLocation.latitude;
        updated.lng = driverLocation.longitude;
      })
    );
  }, [deliveryLocation]);

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

  const restaurantLocation = {
    latitude: restaurant?.lat,
    longitude: restaurant?.lng,
  };

  const deliveryLocation = {
    latitude: user?.lat,
    longitude: user?.lng,
  };

  const zoomInOnDriver = () => {
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
            // setIsDriverClose(result.distance <= 0.1);
            setTotalMinutes(result.duration);
            setTotalKms(result.distance);
          }}
        />

        <CustomMarker data={restaurant} type="RESTAURANT" />
        <CustomMarker data={user} type="USER" />

        {/* <Marker
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
        </Marker> */}
      </MapView>
      <BottomSheetDetails
        totalKms={totalKms}
        totalMinutes={totalMinutes}
        onAccept={zoomInOnDriver}
      />
      {order.status === "READY_FOR_PICKUP" && (
        <Ionicons
          onPress={() => navigation.goBack()}
          name="arrow-back-circle"
          size={45}
          color={"black"}
          style={{ position: "absolute", top: 30, left: 15 }}
        />
      )}
    </View>
  );
};

export default OrderDelivery;
