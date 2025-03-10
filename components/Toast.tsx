// components/Toast.tsx
import React, {useEffect} from "react";
import {Animated, Text, StyleSheet, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";

interface ToastProps {
  visible: boolean;
  message: string;
  type: "success" | "warning" | "error" | null;
  onHide: () => void;
}

const Toast: React.FC<ToastProps> = ({visible, message, type, onHide}) => {
  const translateY = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  if (!type) return null;

  const getToastStyle = () => {
    switch (type) {
      case "success":
        return styles.successToast;
      case "warning":
        return styles.warningToast;
      case "error":
        return styles.errorToast;
      default:
        return styles.successToast;
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <Ionicons name="checkmark-circle" size={24} color="#fff" />;
      case "warning":
        return <Ionicons name="alert-circle" size={24} color="#fff" />;
      case "error":
        return <Ionicons name="close-circle" size={24} color="#fff" />;
      default:
        return null;
    }
  };

  return (
    <Animated.View
      style={[styles.container, getToastStyle(), {transform: [{translateY}]}]}
    >
      <View style={styles.content}>
        {getIcon()}
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity onPress={onHide} style={styles.closeButton}>
        <Ionicons name="close" size={20} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 40,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  successToast: {
    backgroundColor: "#4CAF50",
  },
  warningToast: {
    backgroundColor: "#FF9800",
  },
  errorToast: {
    backgroundColor: "#F44336",
  },
  message: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  closeButton: {
    marginLeft: 8,
  },
});

export default Toast;
