import React, { useState, useEffect } from "react";
import { AntDesign } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

const CameraView = ({ navigation }) => {
  const [camera, setCamera] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [photo, setPhoto] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleTakePhoto = async () => {
    if (camera) {
      const photoData = await camera.takePictureAsync({
        quality: 1,
        exif: true,
        width: 640,
        height: 480,
      });
      setPhoto(photoData);
    }
  };

  const handleConfirmPhoto = () => {
    navigation.navigate("Create", { photo });
  };

  const toggleCameraType = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {photo ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo.uri }} style={styles.previewImage} />
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmPhoto}
          >
            <AntDesign name="check" size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setPhoto(null)}
          >
            <AntDesign name="close" size={32} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <Camera
          style={styles.camera}
          type={cameraType}
          ref={(ref) => setCamera(ref)}
        >
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleCameraType}
          >
            <AntDesign name="retweet" size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleTakePhoto}
          >
            <AntDesign name="camera" size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.returnButton}
            onPress={() => navigation.navigate("Create")}
          >
            <AntDesign name="back" size={32} color="white" />
          </TouchableOpacity>
        </Camera>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  toggleButton: {
    position: "absolute",
    top: 40,
    right: 20,
  },
  captureButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  previewImage: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
  },
  confirmButton: {
    position: "absolute",
    top: 40,
    right: 20,
  },
  cancelButton: {
    position: "absolute",
    bottom: 40,
    right: 20,
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
});

export default CameraView;
