import { createContext, useState, useEffect, useContext } from "react";
import { DataStore } from "aws-amplify/datastore";
import { Courier, Dish, Order, OrderDish, Restaurant, User } from "../models";
import { useAuthContext } from "../contexts/AuthContext";
const OrderContext = createContext({});

const OrderContextProvider = ({ children }) => {
  const { dbCourier } = useAuthContext();
  const [order, setOrder] = useState();
  const [user, setUser] = useState();
  const [restaurant, setRestaurant] = useState();
  const [dishes, setDishes] = useState();

  const fetchOrder = async (id) => {
    if (!id) {
      setOrder(null);
      return;
    }
    try {
      const fetchedOrder = await DataStore.query(Order, id);
      setOrder(fetchedOrder);

      DataStore.query(User, fetchedOrder.userID).then(setUser);

      //Fetching the order dishes of the order
      DataStore.query(Restaurant, fetchedOrder.restaurantID).then(
        setRestaurant
      );

      const orderDishes = await DataStore.query(OrderDish, (od) =>
        od.orderID.eq(fetchedOrder.id)
      );

      //Now for each dish querying for the dish from id got from orderDish
      const dishPromises = orderDishes.map(async (orderDish) => {
        const dish = await DataStore.query(Dish, orderDish.dishID);
        //   //returning the dish with the quantity
        return { ...dish, quantity: orderDish.quantity };
      });

      // //get all the dish items with the order quantity
      Promise.all(dishPromises).then(setDishes);
    } catch (e) {
      console.log("Error fetching order: ", e);
    }
  };

  useEffect(() => {
    if (!order) {
      return;
    }
    const subscription = DataStore.observe(Order, order.id).subscribe(
      ({ opType, element }) => {
        if (opType === "UPDATE") {
          fetchOrder(element.id);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [order?.id]);

  const acceptOrder = () => {
    // update the order and change status and assign the driver to the order
    DataStore.save(
      Order.copyOf(order, (updated) => {
        updated.status = "ACCEPTED";
        updated.courierID = dbCourier.id;
      })
    ).then(setOrder);
  };

  const pickUpOrder = () => {
    // update the order and change status
    DataStore.save(
      Order.copyOf(order, (updated) => {
        updated.status = "PICKED_UP";
      })
    ).then(setOrder);
  };
  const completeOrder = async () => {
    // update the order and change status
    const updatedOrder = await DataStore.save(
      Order.copyOf(order, (updated) => {
        updated.status = "COMPLETED";
      })
    );
    setOrder(updatedOrder);
  };

  return (
    <OrderContext.Provider
      value={{
        order,
        user,
        restaurant,
        dishes,
        acceptOrder,
        fetchOrder,
        pickUpOrder,
        completeOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContextProvider;

export const useOrderContext = () => useContext(OrderContext);
