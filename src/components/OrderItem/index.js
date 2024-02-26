import { Image, StyleSheet, Text, View, Pressable } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import orders from "../../../assets/data/orders.json";

export default function OrderItem({ order }) {
  const navigation = useNavigation();

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
        source={{ uri: order.Restaurant.image }}
        style={{ height: "100%", width: "25%" }}
      />
      <View style={{ flex: 1, marginLeft: 10, paddingVertical: 5 }}>
        <Text style={{ fontSize: 18, fontWeight: "500" }}>
          {order.Restaurant.name}
        </Text>
        <Text style={{ color: "grey" }}>{order.Restaurant.address}</Text>
        <Text style={{ marginTop: 10 }}>Delivery details:</Text>
        <Text style={{ color: "grey" }}>{order.User.name}</Text>
        <Text style={{ color: "grey" }}>{order.User.address}</Text>
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
