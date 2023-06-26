import React, { useEffect, useRef } from "react";
import { View, Text, Image, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

export default function AnimatedLogo() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const image = require("../../assets/orange.png");

  const navigation = useNavigation();

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(translateAnim, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      navigation.navigate("ItemList");
    }, 1500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, translateAnim, navigation]);

  return (
    <LinearGradient
      colors={["#e16868", "#e1a668", "#efc5a3"]}
      style={styles.container}
    >
      <View style={styles.logo}>
        <Text style={styles.logoText}>
          Stay
          <Image source={image} style={styles.logoImage} />
          Fresh
        </Text>
      </View>
      <Text style={styles.thankYouText}>Thanks for using the app.</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e16868",
    padding: 10,
    borderRadius: 5,
    top: "50%",
    transform: [{ translateY: -25 }],
  },
  logoText: {
    fontSize: 32,
    color: "#FFFFFF",
    marginLeft: 10,
  },
  logoImage: {
    width: 24,
    height: 24,
    marginHorizontal: 5,
  },
  thankYouText: {
    fontSize: 20,
    color: "#FFFFFF",
    marginTop: 200,
  },
});
