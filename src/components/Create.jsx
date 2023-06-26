import React, { useState, useEffect } from "react";
import {
  TextInput,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { IconButton } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import { format } from "date-fns";
import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("mydb.db");
const image = require("../../assets/food.png");

export default function Create() {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [expiryDateStr, setExpiryDateStr] = useState(
    format(new Date(), "dd/MM/yyyy")
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [size, setSize] = useState(1);
  const [errors, setErrors] = useState({
    name: "",
    size: "",
  });

  useEffect(() => {
    if (route.params?.photo) {
      convertImageToBase64(route.params.photo.uri);
      setPhoto(route.params.photo);
    }
  }, [route.params?.photo]);

  const convertImageToBase64 = async (photoUri) => {
    if (typeof photoUri !== "string") {
      console.error("photoUri must be a string. Got:", photoUri);
      return;
    }

    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        photoUri,
        [
          {
            resize: {
              width: 400,
            },
          },
        ],
        { base64: true }
      );

      setBase64Photo(manipResult.base64);
    } catch (error) {
      console.error("Error converting the image to base64:", error);
    }
  };

  const [base64Photo, setBase64Photo] = useState("");

  const handleGuardar = () => {
    if (!validateForm()) {
      return;
    }
    const formattedDate = expiryDate.toISOString().split("T")[0];
    db.transaction(
      (tx) => {
        if (base64Photo) {
          tx.executeSql(
            "INSERT INTO Items (name, expiry_date, photo_base64, size) VALUES (?, ?, ?, ?)",
            [name, formattedDate, base64Photo, size],
            (_, { rowsAffected, insertId }) => {
              if (rowsAffected > 0) {
                console.log("The record has been saved successfully.");
                navigation.navigate("ItemList");
              } else {
                console.log("Error saving the record.");
              }
            },
            (error) => {
              console.error("Error saving the record:", error);
            }
          );
        } else {
          tx.executeSql(
            "INSERT INTO Items (name, expiry_date, size) VALUES (?, ?, ?)",
            [name, formattedDate, size],
            (_, { rowsAffected, insertId }) => {
              if (rowsAffected > 0) {
                console.log("The record has been saved successfully.");
                navigation.navigate("ItemList");
              } else {
                console.log("Error saving the record:");
              }
            },
            (error) => {
              console.error("Error saving the record:", error);
            }
          );
        }
      },
      (error) => {
        console.error("Error opening the database.", error);
        onError();
      }
    );
  };

  const handleAbrirCamara = () => {
    navigation.navigate("CameraView");
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExpiryDate(selectedDate);
      setExpiryDateStr(format(selectedDate, "dd/MM/yyyy"));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: "",
      size: "",
    };

    if (name.trim() === "") {
      newErrors.name = "Required";
      valid = false;
    }

    if (size === null || isNaN(size) || size < 1) {
      newErrors.size = "Required > 0";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={photo ? { uri: photo.uri } : image}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={handleAbrirCamara}
        >
          <AntDesign name="camera" size={25} color="#FFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Pizza"
        />
        {errors.name !== "" && (
          <MaterialIcons name="error" size={24} color="#e16868" />
        )}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={expiryDateStr}
          editable={false}
          placeholder="Fecha de caducidad"
        />
        <IconButton
          icon="calendar"
          size={20}
          onPress={() => setShowDatePicker(true)}
        />
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={expiryDate}
          mode="date"
          display="spinner"
          onChange={handleDateChange}
        />
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Quantity"
          keyboardType="numeric"
          defaultValue="1"
          onChangeText={(text) => setSize(parseInt(text))}
          minValue={1}
        />
        {errors.size !== "" && (
          <MaterialIcons name="error" size={24} color="#e16868" />
        )}
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
        <AntDesign
          name="save"
          size={20}
          color="#FFFFFF"
          style={styles.saveIcon}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.returnButton}
        onPress={() => navigation.navigate("ItemList")}
      >
        <AntDesign name="back" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#41515d",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 10,
    marginBottom: 20,
    padding: 10,
    width: "100%",
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 200,
    height: 200,
    marginBottom: 30,
    borderRadius: 15,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  imageButton: {
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    marginTop: 20,
  },
  saveButton: {
    position: "absolute",
    right: 90,
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e16868",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  errorText: {
    color: "#e16868",
    fontSize: 12,
  },
  returnButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#5b595c",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  cameraButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 6,
    borderRadius: 15,
  },
});
