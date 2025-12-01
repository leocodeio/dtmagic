import { Ionicons } from "@expo/vector-icons";
import { FacultyUser, getStoredUser, logout, StudentUser, User } from "@/server/auth";
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
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="person-circle" size={24} color="#333" style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

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
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#fff",
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
    color: "#333",
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: "#E3F2FD",
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
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
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
    fontSize: 15,
    color: "#666",
  },
  value: {
    fontSize: 15,
    color: "#333",
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
