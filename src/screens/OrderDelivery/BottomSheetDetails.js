import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { Pressable, Text, View } from "react-native";
import React, { useRef, useMemo } from "react";
import { FontAwesome5, Fontisto } from "@expo/vector-icons";
import styles from "./styles";
import { useOrderContext } from "../../contexts/OrderContext";
import { useNavigation } from "@react-navigation/native";

const STATUS_TO_ORDER = {
  READY_FOR_PICKUP: "Accept Order",
  ACCEPTED: "Pick-up Order",
  PICKED_UP: "Complete Delivery",
};

const BottomSheetDetails = (props) => {
  const { totalKms, totalMinutes, onAccept } = props;
  const isDriverClose = totalKms <= 1; //decrease for higher accuracy

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["12%", "90%"], []);

  const navigation = useNavigation();
  
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

  const onButtonPressed = async () => {
    // if (deliveryStatus === ORDER_STATUS.READY_FOR_PICKUP) {
    if (order.status === "READY_FOR_PICKUP") {
      try {
        bottomSheetRef.current?.collapse();
        // setDeliveryStatus(ORDER_STATUS.ACCEPTED);
        acceptOrder();
      } catch (e) {
        console.log("Error animate to region: ", e);
      }
    }
    // if (deliveryStatus === ORDER_STATUS.ACCEPTED) {
    if (order.status === "ACCEPTED") {
      bottomSheetRef.current?.collapse();
      onAccept();
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

  const isButtonDisabled = () => {
    const { status } = order;

    if (status === "READY_FOR_PICKUP") {
      return false;
    }
    if ((status === "ACCEPTED" || status === "PICKED_UP") && isDriverClose) {
      return false;
    }
    return true;
  };

  return (
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
        <Text style={styles.buttonText}>{STATUS_TO_ORDER[order.status]}</Text>
      </Pressable>
    </BottomSheet>
  );
};

export default BottomSheetDetails;
