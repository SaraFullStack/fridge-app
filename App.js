import * as SQLite from "expo-sqlite";
import CameraView from "./src/components/CameraView.jsx";
import Create from "./src/components/Create.jsx";
import ItemList from "./src/components/ItemList.jsx";
import Main from "./src/components/Main.jsx";
import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { View, Text, StyleSheet } from "react-native";

const Stack = createStackNavigator();
const db = SQLite.openDatabase("mydb.db");

const resetTable = () => {
  db.transaction((tx) => {
    tx.executeSql(
      "DROP TABLE IF EXISTS Items",
      [],
      () => {
        console.log("Tabla eliminada correctamente");
        createTable();
      },
      (error) => {
        console.error("Error al eliminar la tabla:", error);
      }
    );
  });
};

const createTable = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS Items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        expiry_date TIMESTAMP,
        photo_base64 TEXT DEFAULT NULL,
        size DECIMAL
      )`,
      [],
      () => {
        console.log("Tabla creada correctamente");
      },
      (error) => {
        console.error("Error al crear la tabla:", error);
      }
    );
  });
};

export default function App() {
  useEffect(() => {
    createTable();
  }, []);

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Main">
          <Stack.Screen
            name="Main"
            options={{ headerShown: false }}
            component={Main}
          />
          <Stack.Screen
            name="ItemList"
            options={{ headerShown: false }}
            component={ItemList}
          />
          <Stack.Screen
            name="Create"
            options={{ headerShown: false }}
            component={Create}
          />
          <Stack.Screen
            name="CameraView"
            options={{ headerShown: false }}
            component={CameraView}
          />
        </Stack.Navigator>
        <Footer />
      </NavigationContainer>
    </View>
  );
}

const Footer = () => (
  <View style={styles.footer}>
    <Text style={styles.text}>Version beta - © 2023 Sara Cubero</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    left: 0,
    right: 0,
    bottom: 0,
    height: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fbbebe",
    position: "absolute",
  },
  text: {
    color: "white",
    fontSize: 10,
  },
});
