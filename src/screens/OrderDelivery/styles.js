import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "lightblue",
  },
  handleIndicator: {
    backgroundColor: "grey",
    width: 100,
  },
  handleIndicatorContainer: {
    marginTop: 10,
    paddingBottom: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderColor: "lightgrey",
  },
  routeDetailsText: {
    fontSize: 25,
    letterSpacing: 1,
  },
  deliveryDetailContainer: {
    paddingHorizontal: 20,
  },
  addressContainer: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
  },
  addressText: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: "grey",
    marginLeft: 15,
  },
  orderDetailContainer: {
    borderTopWidth: 1,
    borderColor: "lightgrey",
    paddingTop: 20,
  },
  orderItemText: {
    fontSize: 18,
    color: "grey",
    fontWeight: "500",
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  buttonContainer: {
    marginTop: "auto",
    marginVertical: 30,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    paddingVertical: 15,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});

export default styles;
