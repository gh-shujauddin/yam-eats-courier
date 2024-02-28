import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useAuthenticator } from "@aws-amplify/ui-react-native";

import { DataStore } from "aws-amplify/datastore";
import { Courier, TransportationModes } from "../../models";
import { useAuthContext } from "../../contexts/AuthContext";

import { useNavigation } from "@react-navigation/native";
const userSelector = (context) => [context.user];

const Profile = () => {
  const navigation = useNavigation();
  const { sub, dbCourier, setDbCourier } = useAuthContext();

  const { user, signOut } = useAuthenticator(userSelector);

  const [name, setName] = useState(dbCourier?.name ? dbCourier?.name : "");
  const [transportationMode, setTransportationMode] = useState(
    TransportationModes.DRIVING
  );
  const [lat, setLat] = useState(dbCourier?.lat ? dbCourier?.lat + "" : "0");
  const [lng, setLng] = useState(dbCourier?.lng ? dbCourier?.lng + "" : "0");

  const onSave = async () => {
    if (dbCourier) {
      await updateCourier();
    } else {
      await createCourier();
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("HomeTabs");
    }
  };

  const updateCourier = async () => {
    try {
      const courier = await DataStore.save(
        Courier.copyOf(dbCourier, (updated) => {
          updated.name = name;
          updated.transportationMode = transportationMode;
        })
      );
      console.log(courier);
      setDbCourier(courier);
      console.warn("courier updated");
    } catch (e) {
      Alert.alert("Error updating: ", e.message);
    }
  };

  const createCourier = async () => {
    try {
      const courier = await DataStore.save(
        new Courier({
          name: name,
          transportationMode: transportationMode,
          lat: 0,
          lng: 0,
          sub: sub,
        })
      );
      console.log(courier);
      setDbCourier(courier);
    } catch (e) {
      Alert.alert("Error creating user: ", e.message);
    }
  };

  const onSignOut = () => {
    console.warn("Sign out pressed");
    signOut();
    setDbCourier(null);
  };

  return (
    <SafeAreaView>
      <Text style={styles.title}>Profile</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name"
        style={styles.input}
      />
      {/* <TextInput
        value={lat}
        onChangeText={setLat}
        placeholder="Latitude"
        style={styles.input}
      />
      <TextInput
        value={lng}
        onChangeText={setLng}
        placeholder="Longitude"
        style={styles.input}
      /> */}

      <View style={{ flexDirection: "row" }}>
        <Pressable
          onPress={() => setTransportationMode(TransportationModes.DRIVING)}
          style={{
            backgroundColor:
              transportationMode === TransportationModes.DRIVING
                ? "#3fc060"
                : "white",
            margin: 10,
            padding: 10,
            borderWidth: 1,
            borderColor: "gray",
            borderRadius: 10,
          }}
        >
          <FontAwesome5 name="car" size={40} color="black" />
        </Pressable>
        <Pressable
          onPress={() => setTransportationMode(TransportationModes.BICYCLING)}
          style={{
            backgroundColor:
              transportationMode === TransportationModes.BICYCLING
                ? "#3fc060"
                : "white",
            margin: 10,
            padding: 10,
            borderWidth: 1,
            borderColor: "gray",
            borderRadius: 10,
          }}
        >
          <MaterialIcons name="pedal-bike" size={40} color="black" />
        </Pressable>
      </View>

      <Pressable
        style={[styles.button, { borderColor: "#123489" }]}
        onPress={onSave}
      >
        <Text style={{ color: "#123489", fontSize: 15, fontWeight: "bold" }}>
          Save
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, { borderColor: "#993456" }]}
        onPress={onSignOut}
      >
        <Text style={{ color: "#993456", fontSize: 15, fontWeight: "bold" }}>
          Sign Out
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    margin: 10,
  },
  input: {
    margin: 10,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 5,
  },
  button: {
    height: 40,
    borderWidth: 1.5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
    borderRadius: 5,
  },
});

export default Profile;
