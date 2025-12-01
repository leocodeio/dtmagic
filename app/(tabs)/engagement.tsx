import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
    Event,
    EventNiche,
    getEvents,
    getMyParticipations,
    participateInEvent,
    Participation,
} from "@/server/auth";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const NICHE_INFO: Record<EventNiche, { icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }> = {
  gaming: { icon: "gamepad-variant", color: "#9C27B0" },
  singing: { icon: "microphone", color: "#E91E63" },
  dancing: { icon: "human-female-dance", color: "#FF5722" },
  coding: { icon: "code-braces", color: "#2196F3" },
};

export default function EngagementTabScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registering, setRegistering] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [eventsData, participationsData] = await Promise.all([
        getEvents(),
        getMyParticipations(),
      ]);
      setEvents(eventsData);
      setParticipations(participationsData);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load events. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const isRegistered = (eventId: string) => {
    return participations.some((p) => p.eventId === eventId);
  };

  const handleEventPress = (event: Event) => {
    if (isRegistered(event._id)) {
      Alert.alert("Already Registered", "You are already registered for this event.");
      return;
    }
    setSelectedEvent(event);
  };

  const handleRegister = async (niche: EventNiche) => {
    if (!selectedEvent) return;

    setRegistering(true);
    try {
      await participateInEvent(selectedEvent._id, niche);
      Alert.alert("Success!", `You have registered for ${selectedEvent.name}`);
      setSelectedEvent(null);
      loadData(); // Refresh data
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to register";
      Alert.alert("Error", message);
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="calendar" size={24} color="#333" style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>Engagement</Text>
      </View>

      {/* Event Selection Modal */}
      {selectedEvent && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Select Your Interest</Text>
            <Text style={styles.modalSubtitle}>{selectedEvent.name}</Text>

            <View style={styles.nicheGrid}>
              {(Object.keys(NICHE_INFO) as EventNiche[]).map((niche) => (
                <Pressable
                  key={niche}
                  style={[
                    styles.nicheButton,
                    { backgroundColor: NICHE_INFO[niche].color },
                  ]}
                  onPress={() => handleRegister(niche)}
                  disabled={registering}
                >
                  <MaterialCommunityIcons name={NICHE_INFO[niche].icon} size={32} color="#fff" />
                  <Text style={styles.nicheLabel}>
                    {niche.charAt(0).toUpperCase() + niche.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={styles.cancelButton}
              onPress={() => setSelectedEvent(null)}
              disabled={registering}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            {registering && (
              <ActivityIndicator
                style={styles.registeringIndicator}
                color="#007AFF"
              />
            )}
          </View>
        </View>
      )}

      {/* Events List */}
      <ScrollView
        style={styles.eventsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={20} color="#333" />
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Tap on an event to register your interest
        </Text>

        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No upcoming events</Text>
            <Text style={styles.emptyStateSubtext}>
              Check back later for new events
            </Text>
          </View>
        ) : (
          events.map((event) => {
            const registered = isRegistered(event._id);
            const nicheInfo = NICHE_INFO[event.niche];

            return (
              <Pressable
                key={event._id}
                style={[styles.eventCard, registered && styles.eventCardRegistered]}
                onPress={() => handleEventPress(event)}
              >
                <View style={styles.eventHeader}>
                  <View
                    style={[
                      styles.nicheBadge,
                      { backgroundColor: nicheInfo.color },
                    ]}
                  >
                    <MaterialCommunityIcons name={nicheInfo.icon} size={14} color="#fff" style={{ marginRight: 4 }} />
                    <Text style={styles.nicheBadgeText}>{event.niche}</Text>
                  </View>
                  {registered && (
                    <View style={[styles.registeredBadge, { flexDirection: "row", alignItems: "center" }]}>
                      <Ionicons name="checkmark-circle" size={14} color="#fff" style={{ marginRight: 4 }} />
                      <Text style={styles.registeredBadgeText}>Registered</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.eventName}>{event.name}</Text>
                <Text style={styles.eventDescription}>{event.description}</Text>

                <View style={styles.eventDetails}>
                  <View style={styles.eventDetailItem}>
                    <Ionicons name="location-outline" size={14} color="#666" style={{ marginRight: 4 }} />
                    <Text style={styles.eventDetailText}>{event.venue}</Text>
                  </View>
                  <View style={styles.eventDetailItem}>
                    <Ionicons name="calendar-outline" size={14} color="#666" style={{ marginRight: 4 }} />
                    <Text style={styles.eventDetailText}>
                      {formatDate(event.date)}
                    </Text>
                  </View>
                  <View style={styles.eventDetailItem}>
                    <Ionicons name="time-outline" size={14} color="#666" style={{ marginRight: 4 }} />
                    <Text style={styles.eventDetailText}>{event.time}</Text>
                  </View>
                </View>

                <View style={[styles.eventFooter, { flexDirection: "row", alignItems: "center" }]}>
                  <Ionicons name="people-outline" size={14} color="#888" style={{ marginRight: 4 }} />
                  <Text style={styles.capacityText}>
                    {event.participantCount || 0} / {event.capacity} spots
                  </Text>
                </View>
              </Pressable>
            );
          })
        )}

        {/* My Registrations */}
        {participations.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: 32 }]}>
              <Ionicons name="checkmark-done-circle" size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>My Registrations</Text>
            </View>
            <View style={styles.registrationsContainer}>
              {participations.map((participation) => {
                const event = events.find((e) => e._id === participation.eventId);
                if (!event) return null;

                return (
                  <View key={participation._id} style={styles.registrationCard}>
                    <Text style={styles.registrationEventName}>{event.name}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <MaterialCommunityIcons 
                        name={NICHE_INFO[participation.selectedNiche].icon} 
                        size={16} 
                        color={NICHE_INFO[participation.selectedNiche].color} 
                        style={{ marginRight: 4 }} 
                      />
                      <Text style={styles.registrationNiche}>
                        {participation.selectedNiche}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
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
  eventsContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventCardRegistered: {
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  nicheBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nicheBadgeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  nicheBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  registeredBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  registeredBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  eventName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  eventDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  eventDetailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventDetailIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  eventDetailText: {
    fontSize: 13,
    color: "#666",
  },
  eventFooter: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  capacityText: {
    fontSize: 13,
    color: "#888",
  },
  registrationsContainer: {
    marginTop: 12,
  },
  registrationCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  registrationEventName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  registrationNiche: {
    fontSize: 14,
    color: "#666",
    textTransform: "capitalize",
  },
  bottomSpacing: {
    height: 40,
  },
  // Modal styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  nicheGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  nicheButton: {
    width: "45%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  nicheIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  nicheLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    marginTop: 20,
    padding: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  registeringIndicator: {
    marginTop: 12,
  },
});
