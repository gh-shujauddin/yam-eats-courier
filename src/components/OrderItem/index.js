import {
  Image,
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { DataStore } from "aws-amplify/datastore";
import { Restaurant, User } from "../../models";
import { useEffect, useState } from "react";

export default function OrderItem({ order }) {
  const [restaurant, setRestaurant] = useState(null);
  const [user, setUser] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    DataStore.query(Restaurant, order.restaurantID).then(setRestaurant);
    DataStore.query(User, order.userID).then(setUser);
  }, []);

  if (!restaurant || !user) {
    return <ActivityIndicator size={"large"} style={{ flex: 1 }} />;
  }
  return (
    <Pressable
      style={{
        flexDirection: "row",
        margin: 10,
        borderColor: "#3fc060",

        borderWidth: 2,
        borderRadius: 12,
      }}
      onPress={() =>
        navigation.navigate("OrderDeliveryScreen", { id: order.id })
      }
    >
      <Image
        source={{ uri: restaurant.image }}
        style={{ height: "100%", width: "25%" }}
      />
      <View style={{ flex: 1, marginLeft: 10, paddingVertical: 5 }}>
        <Text style={{ fontSize: 18, fontWeight: "500" }}>
          {restaurant.name}
        </Text>
        <Text style={{ color: "grey" }}>{restaurant.address}</Text>
        <Text style={{ marginTop: 10 }}>Delivery details:</Text>
        <Text style={{ color: "grey" }}>{user.name}</Text>
        <Text style={{ color: "grey" }}>{user.address}</Text>
      </View>
      <View
        style={{
          padding: 5,
          backgroundColor: "#3fc060",
          justifyContent: "center",
          borderBottomRightRadius: 10,
          borderTopRightRadius: 10,
        }}
      >
        <Entypo name="check" size={30} color="white" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
