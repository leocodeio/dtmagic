import { getStoredUser, User } from "@/server/auth";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function DashboardScreen() {
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
        <Text style={styles.welcomeText}>
          Welcome, {user?.name?.split(" ")[0] || "User"}!
        </Text>
        <Text style={styles.subtitle}>
          {user?.role === "faculty"
            ? "Ready to engage with students?"
            : "Ready to participate in events?"}
        </Text>
      </View>

      {/* Main Engagement Icon */}
      <View style={styles.mainContent}>
        <View style={styles.engagementCircle}>
          <Ionicons name="calendar" size={64} color="#fff" />
          <Text style={styles.engagementLabel}>Engagement</Text>
          <Text style={styles.engagementHint}>Tap the tab below</Text>
        </View>
      </View>

      <Text style={styles.footerText}>
        Browse upcoming events and register your interest
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#151718",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#151718",
  },
  header: {
    marginTop: 80,
    alignItems: "center",
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ECEDEE",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#9BA1A6",
    marginTop: 8,
    textAlign: "center",
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  engagementCircle: {
    backgroundColor: "#007AFF",
    borderRadius: 100,
    padding: 40,
    alignItems: "center",
    width: 200,
    height: 200,
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  engagementLabel: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 12,
  },
  engagementHint: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#9BA1A6",
    textAlign: "center",
    marginBottom: 20,
  },
});
