import { getStoredUser, logout, User } from "@/server/auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const storedUser = await getStoredUser();
    setUser(storedUser);
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.name || "N/A"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || "N/A"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Role</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user?.role === "faculty" ? "Faculty" : "Student"}
            </Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  header: {
    marginTop: 60,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: {
    fontSize: 16,
    color: "#666",
  },
  value: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  roleBadge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 30,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
