import { createContext, useState, useEffect, useContext } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { DataStore } from "aws-amplify/datastore";
import { Courier } from "../models";
import { Auth } from "aws-amplify";

const AuthContext = createContext({});

const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [dbCourier, setDbCourier] = useState(null);
  const sub = authUser?.userId;

  useEffect(() => {
    getCurrentUser().then(setAuthUser);
  }, []);

  useEffect(() => {
    DataStore.query(Courier, (cour) => cour.sub.eq(sub)).then((couriers) =>
      setDbCourier(couriers[0])
    );
  }, [sub]);

  console.log(dbCourier);

  return (
    <AuthContext.Provider value={{ authUser, dbCourier, sub, setDbCourier }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;

export const useAuthContext = () => useContext(AuthContext);
