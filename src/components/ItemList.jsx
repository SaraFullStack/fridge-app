import React, { useState, useEffect } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { IconButton } from "react-native-paper";
import * as SQLite from "expo-sqlite";
import useWindowDimensions from "./WindowDimensions";
import { ActivityIndicator } from "react-native";

const db = SQLite.openDatabase("mydb.db");

const ItemList = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const ITEMS_PER_PAGE = 20;
  const image = require("../../assets/food.png");

  useEffect(() => {
    fetchData();
  }, [page]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchData);
    return unsubscribe;
  }, [navigation]);

  const getTotalItems = () => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "SELECT COUNT(*) as total FROM Items",
          [],
          (_, { rows }) => {
            const { total } = rows.item(0);
            setTotal(total);
          },
          (_, error) => {
            console.error(
              "Error executing the COUNT query in getTotalItems.",
              error
            );
            reject(error);
          }
        );
      },
      (error) => {
        console.error("Error opening the database in getTotalItems.", error);
        reject(error);
      }
    );
  };

  const fetchData = () => {
    setIsLoading(true);
    const offset = page * ITEMS_PER_PAGE;
    db.transaction(
      (tx) => {
        tx.executeSql(
          "SELECT * FROM Items ORDER BY expiry_date ASC LIMIT ?, ?",
          [offset, ITEMS_PER_PAGE],
          (_, { rows }) => {
            const len = rows.length;
            const temp = [];
            for (let i = 0; i < len; i++) {
              const row = rows.item(i);
              temp.push({
                id: row.id,
                name: row.name,
                expiry_date: row.expiry_date,
                size: row.size,
                photo: row.photo_base64,
              });
            }
            setData(temp);
            getTotalItems();
            setIsLoading(false);
          },
          (_, error) => {
            console.error(
              "Error executing the SELECT query in fetchData.",
              error
            );
            onError();
          }
        );
      },
      (error) => {
        console.error("Error opening the database in fetchData.", error);
        onError();
      }
    );
  };

  const handleNext = () => {
    setPage(page + 1);
  };

  const handlePrev = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleDelete = (itemId) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "DELETE FROM Items WHERE id = ?",
          [itemId],
          (_, { rowsAffected }) => {
            if (rowsAffected > 0) {
              console.log("The element has been successfully deleted.");
              fetchData();
            } else {
              console.log("The element to delete was not found.");
            }
          },
          (error) => {
            console.error("Error deleting the element.", error);
          }
        );
      },
      (error) => {
        console.error("Error opening the database.", error);
      }
    );
  };

  const handleSize = (itemId, newSize) => {
    if (newSize === 0) {
      handleDelete(itemId);
    } else {
      const query = "UPDATE Items SET size = ? WHERE id = ?";
      const params = [newSize, itemId];

      db.transaction(
        (tx) => {
          tx.executeSql(
            query,
            params,
            (_, { rowsAffected }) => {
              if (rowsAffected > 0) {
                console.log("The size has been updated successfully.");
                fetchData();
              } else {
                console.log("No element found with that ID.");
              }
            },
            (error) => {
              console.error("Error updating the size.", error);
            }
          );
        },
        (error) => {
          console.error("Error opening the database.", error);
        }
      );
    }
  };

  const handleDeleteAll = () => {
    Alert.alert(
      "Confirmation",
      "Are you sure you want to delete all the items?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            db.transaction(
              (tx) => {
                tx.executeSql(
                  "DELETE FROM Items",
                  [],
                  () => {
                    console.log("All elements have been deleted successfully.");
                    fetchData();
                  },
                  (error) => {
                    console.error("Error deleting all elements.", error);
                  }
                );
              },
              (error) => {
                console.error("Error opening the database.", error);
              }
            );
          },
        },
      ]
    );
  };

  const renderGridItem = ({ item, index }) => {
    const expiryDate = new Date(item.expiry_date);
    const currentDate = new Date();
    const timeDifference = expiryDate.getTime() - currentDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return (
      <TouchableOpacity style={styles.listItem}>
        {item.photo ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${item.photo}` }}
            style={styles.itemImage}
          />
        ) : (
          <Image source={image} style={styles.itemImage} />
        )}
        <View style={styles.sizeCircle}>
          <Text style={styles.sizeText}>{item.size}</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemExpiryDate}>{item.expiry_date}</Text>
        </View>
        <IconButton
          icon="delete"
          size={24}
          color="#fff"
          style={styles.deleteButton}
          onPress={() => handleSize(item.id, item.size - 1)}
          onLongPress={() => handleDelete(item.id)}
        />
        <MaterialCommunityIcons
          name="minus"
          size={24}
          color="#5b595c"
          style={styles.minusIcon}
          onPress={() => handleSize(item.id, item.size - 1)}
        />
        <MaterialCommunityIcons
          name="delete"
          size={24}
          color="#5b595c"
          style={styles.deleteIcon}
          onPress={() => handleDelete(item.id)}
        />
        {daysDifference == 3 && <View style={styles.overlayYellow}></View>}
        {daysDifference == 2 && <View style={styles.overlayOrange}></View>}
        {daysDifference == 1 && <View style={styles.overlayRed}></View>}
        {daysDifference < 1 && (
          <>
            <View style={styles.overlay}></View>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={24}
              color="#e16868"
              style={styles.expiredIcon}
            />
          </>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          onChangeText={(text) => setSearch(text)}
          value={search}
          placeholder="..."
          placeholderTextColor="#fafafa"
        />
        <TouchableOpacity style={styles.searchButton} onPress={fetchData}>
          <MaterialCommunityIcons name="magnify" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#ff7575" />
      ) : (
        <>
          <FlatList
            data={data.filter((item) =>
              item.name.toLowerCase().includes(search.toLowerCase())
            )}
            keyExtractor={(item) => item.id?.toString()}
            renderItem={renderGridItem}
            numColumns={width > 500 ? 2 : 1}
            contentContainerStyle={styles.listContainer}
          />
          {total > ITEMS_PER_PAGE && (
            <View style={styles.paginationContainer}>
              {page != 0 && (
                <TouchableOpacity
                  style={styles.paginationButton}
                  onPress={handlePrev}
                >
                  <AntDesign name="left" size={20} color="white" />
                </TouchableOpacity>
              )}
              <Text style={styles.pageText}>
                {page + 1} / {Math.ceil(total / ITEMS_PER_PAGE)}
              </Text>
              {total - (page + 1) * ITEMS_PER_PAGE > 0 && (
                <TouchableOpacity
                  style={styles.paginationButton}
                  onPress={handleNext}
                >
                  <AntDesign name="right" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          )}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("Create")}
          >
            <AntDesign name="plus" size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteAllButton}
            onPress={handleDeleteAll}
          >
            <AntDesign name="delete" size={32} color="white" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fbf6f2",
  },
  listContainer: {
    justifyContent: "space-between",
  },
  listItem: {
    flex: 1,
    margin: 10,
    height: 200,
    backgroundColor: "rgba(0, 0, 0, 1)",
    position: "relative",
    marginVertical: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  itemInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 5,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  itemName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  itemExpiryDate: {
    color: "#ffffff",
    fontSize: 14,
    marginBottom: 5,
  },
  sizeCircle: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#5b595c",
    justifyContent: "center",
    alignItems: "center",
  },
  sizeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    backgroundColor: "#5b595c",
    color: "black",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  overlayRed: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(238, 55, 55, 0.5)",
  },
  overlayOrange: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(236, 85, 15, 0.462)",
  },
  overlayYellow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(225, 197, 72, 0.353)",
  },
  expiredIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  minusIcon: {
    position: "absolute",
    top: 110,
    right: 10,
    fontSize: 24,
    backgroundColor: "#d1f180",
    borderColor: "#5b595c",
    borderRadius: 25,
    borderWidth: 1,
    alignContent: "center",
    zIndex: 1,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteIcon: {
    position: "absolute",
    top: 150,
    right: 10,
    fontSize: 24,
    backgroundColor: "#d1f180",
    borderColor: "#5b595c",
    borderRadius: 25,
    borderWidth: 1,
    alignContent: "center",
    padding: 5,
    shadowColor: "#000",
    zIndex: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButton: {
    position: "absolute",
    right: 90,
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#5b595c",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  deleteAllButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e16868",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 30,
    fontWeight: "bold",
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 20,
    paddingLeft: 20,
    backgroundColor: "#ff7575",
    color: "#fff",
    borderRadius: 25,
  },
  searchButton: {
    width: 50,
    height: 50,
    marginLeft: 10,
    borderRadius: 25,
    backgroundColor: "#ff7575",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginVertical: 5,
  },
  paginationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff7575",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginHorizontal: 3,
  },
  paginationText: {
    color: "white",
    fontWeight: "bold",
    marginHorizontal: 3,
  },
  pageText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ff7575",
    textAlign: "center",
    justifyContent: "center",
    top: 5,
  },
});

export default ItemList;
