import { FacultyUser, getStoredUser, logout, StudentUser, User } from "@/server/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

/** Type guard for Student user */
function isStudentUser(user: User): user is StudentUser {
  return user.role === "student";
}

/** Type guard for Faculty user */
function isFacultyUser(user: User): user is FacultyUser {
  return user.role === "faculty";
}

export default function ProfileScreen() {
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
    <ScrollView style={styles.container}>
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || "?"}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || "User"}</Text>
        <View style={[styles.roleBadge, { flexDirection: "row", alignItems: "center" }]}>
          <Ionicons 
            name={user?.role === "faculty" ? "school" : "school-outline"} 
            size={16} 
            color="#007AFF" 
            style={{ marginRight: 4 }} 
          />
          <Text style={styles.roleText}>
            {user?.role === "faculty" ? "Faculty" : "Student"}
          </Text>
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Information</Text>

        <View style={styles.infoRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="mail-outline" size={16} color="#666" style={{ marginRight: 4 }} />
            <Text style={styles.label}>Email</Text>
          </View>
          <Text style={styles.value}>{user?.email || "N/A"}</Text>
        </View>

        {user && isStudentUser(user) && (
          <>
            <View style={styles.infoRow}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="id-card-outline" size={16} color="#666" style={{ marginRight: 4 }} />
                <Text style={styles.label}>Roll Number</Text>
              </View>
              <Text style={styles.value}>{user.rollNumber || "N/A"}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="star-outline" size={16} color="#666" style={{ marginRight: 4 }} />
                <Text style={styles.label}>Incentive Points</Text>
              </View>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>
                  {user.incentivePoints || 0}
                </Text>
              </View>
            </View>
          </>
        )}

        {user && isFacultyUser(user) && (
          <>
            <View style={styles.infoRow}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="business-outline" size={16} color="#666" style={{ marginRight: 4 }} />
                <Text style={styles.label}>Employee ID</Text>
              </View>
              <Text style={styles.value}>{user.employeeId || "N/A"}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="library-outline" size={16} color="#666" style={{ marginRight: 4 }} />
                <Text style={styles.label}>Department</Text>
              </View>
              <Text style={styles.value}>{user.department || "N/A"}</Text>
            </View>
          </>
        )}
      </View>

      {/* Logout Button */}
      <Pressable style={[styles.logoutButton, { flexDirection: "row", alignItems: "center", justifyContent: "center" }]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </Pressable>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#151718",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#151718",
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingTop: 80,
    backgroundColor: "#1e2022",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ECEDEE",
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: "#1a3a5c",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#1e2022",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ECEDEE",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  label: {
    fontSize: 15,
    color: "#9BA1A6",
  },
  value: {
    fontSize: 15,
    color: "#ECEDEE",
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },
  pointsBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pointsText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "700",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 100,
  },
});
