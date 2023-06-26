import { useState, useEffect } from "react";
import { Dimensions } from "react-native";

const getWindowDimensions = () => {
  const { width, height } = Dimensions.get("window");
  return {
    width,
    height,
  };
};

const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    const onChange = () => {
      setWindowDimensions(getWindowDimensions());
    };

    Dimensions.addEventListener("change", onChange);

    return () => {
      Dimensions.removeEventListener("change", onChange);
    };
  }, []);

  return windowDimensions;
};

export default useWindowDimensions;
