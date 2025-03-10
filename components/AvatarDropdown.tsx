import React, {useState, useRef, useEffect} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {router} from "expo-router";

interface User {
  name: string | null;
}

interface AvatarDropdownProps {
  user: User | null;
  logout: () => Promise<void>;
}

const AvatarDropdown = ({user, logout}: AvatarDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getUserInitials = () => {
    if (user?.name) {
      const names = user.name.split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    return "U";
  };

  const handleNotifications = () => {
    setIsOpen(false);
    router.push("/(auth)/notification");
  };

  const handleProfile = () => {
    setIsOpen(false);
    router.push("/(auth)/profile");
  };

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const dropdownPosition = {
    top: Platform.OS === "android" ? 110 : 140,
    right: Platform.OS === "android" ? 15 : 20,
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.avatarText}>{getUserInitials()}</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={isOpen}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View
            style={[
              styles.dropdownContainer,
              {right: dropdownPosition.right, top: dropdownPosition.top},
            ]}
          >
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleNotifications}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#324c6e"
              />
              <Text style={styles.dropdownItemText}>Notificações</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleProfile}
            >
              <Ionicons name="person-outline" size={20} color="#324c6e" />
              <Text style={styles.dropdownItemText}>Perfil</Text>
            </TouchableOpacity>

            <View style={styles.dropdownDivider} />

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#F44336" />
              <Text style={[styles.dropdownItemText, {color: "#F44336"}]}>
                Sair
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#0D47A1",
    fontWeight: "bold",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  dropdownContainer: {
    position: "absolute",
    width: 150,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingVertical: 2,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#212121",
    marginLeft: 12,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 4,
  },
});

export default AvatarDropdown;
