import { getStoredUser, User } from "@/server/auth";
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
          <Text style={styles.engagementIcon}>🎯</Text>
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
    marginTop: 80,
    alignItems: "center",
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
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
  engagementIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  engagementLabel: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  engagementHint: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
  },
});
