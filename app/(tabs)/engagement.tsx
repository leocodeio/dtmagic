import {
  createEvent,
  CreateEventData,
  Event,
  EventNiche,
  EventParticipant,
  getEventParticipants,
  getEvents,
  getMyParticipations,
  getStoredUser,
  markAttendance,
  participateInEvent,
  Participation,
  updateEvent,
  User
} from "@/server/auth";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

const NICHE_INFO: Record<EventNiche, { icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }> = {
  gaming: { icon: "gamepad-variant", color: "#9C27B0" },
  singing: { icon: "microphone", color: "#E91E63" },
  dancing: { icon: "human-female-dance", color: "#FF5722" },
  coding: { icon: "code-braces", color: "#2196F3" },
};

export default function EngagementTabScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registering, setRegistering] = useState(false);
  // Faculty-specific state
  const [managingEvent, setManagingEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [markingAttendance, setMarkingAttendance] = useState<string | null>(null);
  const [pointsInput, setPointsInput] = useState<Record<string, string>>({});
  // Create/Edit event state
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState<CreateEventData>({
    name: "",
    description: "",
    niche: "coding",
    venue: "",
    date: "",
    time: "",
    capacity: 50,
  });
  const [savingEvent, setSavingEvent] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [storedUser, eventsData, participationsData] = await Promise.all([
        getStoredUser(),
        getEvents(),
        getMyParticipations(),
      ]);
      setUser(storedUser);
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

  const isFaculty = user?.role === "faculty";

  const handleEventPress = (event: Event) => {
    if (isFaculty) {
      // Faculty can manage events
      handleManageEvent(event);
      return;
    }
    if (isRegistered(event._id)) {
      Alert.alert("Already Registered", "You are already registered for this event.");
      return;
    }
    setSelectedEvent(event);
  };

  const handleManageEvent = async (event: Event) => {
    setManagingEvent(event);
    setLoadingParticipants(true);
    try {
      const participantsList = await getEventParticipants(event._id);
      setParticipants(participantsList);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load participants";
      Alert.alert("Error", message);
      setManagingEvent(null);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleMarkAttendance = async (participantId: string, participantName: string) => {
    if (!managingEvent) return;
    
    const pointsStr = pointsInput[participantId] || "10";
    const points = parseInt(pointsStr, 10) || 10;
    
    setMarkingAttendance(participantId);
    try {
      await markAttendance(managingEvent._id, participantId, points);
      Alert.alert("Success!", `Attendance marked for ${participantName}. ${points} points awarded!`);
      // Refresh participants list
      const participantsList = await getEventParticipants(managingEvent._id);
      setParticipants(participantsList);
      // Clear points input for this participant
      setPointsInput((prev) => {
        const updated = { ...prev };
        delete updated[participantId];
        return updated;
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to mark attendance";
      Alert.alert("Error", message);
    } finally {
      setMarkingAttendance(null);
    }
  };

  const resetEventForm = () => {
    setEventForm({
      name: "",
      description: "",
      niche: "coding",
      venue: "",
      date: "",
      time: "",
      capacity: 50,
    });
  };

  const handleCreateEvent = () => {
    resetEventForm();
    setEditingEvent(null);
    setShowCreateEvent(true);
  };

  const handleEditEvent = () => {
    if (!managingEvent) return;
    setEventForm({
      name: managingEvent.name,
      description: managingEvent.description,
      niche: managingEvent.niche,
      venue: managingEvent.venue,
      date: new Date(managingEvent.date).toISOString().split("T")[0],
      time: managingEvent.time,
      capacity: managingEvent.capacity,
    });
    setEditingEvent(managingEvent);
    setManagingEvent(null);
    setShowCreateEvent(true);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.name || !eventForm.description || !eventForm.venue || !eventForm.date || !eventForm.time) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setSavingEvent(true);
    try {
      if (editingEvent) {
        await updateEvent(editingEvent._id, eventForm);
        Alert.alert("Success!", "Event updated successfully");
      } else {
        await createEvent(eventForm);
        Alert.alert("Success!", "Event created successfully");
      }
      setShowCreateEvent(false);
      setEditingEvent(null);
      resetEventForm();
      loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save event";
      Alert.alert("Error", message);
    } finally {
      setSavingEvent(false);
    }
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

      {/* Faculty: Manage Event Modal */}
      {managingEvent && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { maxHeight: "85%" }]}>
            <Text style={styles.modalTitle}>Manage Event</Text>
            <Text style={styles.modalSubtitle}>{managingEvent.name}</Text>
            
            {/* Event Info */}
            <View style={styles.eventInfoSection}>
              <View style={styles.eventInfoRow}>
                <Ionicons name="location-outline" size={14} color="#9BA1A6" />
                <Text style={styles.eventInfoText}>{managingEvent.venue}</Text>
              </View>
              <View style={styles.eventInfoRow}>
                <Ionicons name="calendar-outline" size={14} color="#9BA1A6" />
                <Text style={styles.eventInfoText}>{formatDate(managingEvent.date)}</Text>
              </View>
              <View style={styles.eventInfoRow}>
                <Ionicons name="time-outline" size={14} color="#9BA1A6" />
                <Text style={styles.eventInfoText}>{managingEvent.time}</Text>
              </View>
            </View>

            {/* Edit Event Button */}
            <Pressable style={styles.editEventButton} onPress={handleEditEvent}>
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={styles.editEventButtonText}>Edit Event Details</Text>
            </Pressable>

            <Text style={[styles.participantsTitle, { marginTop: 16 }]}>Participants</Text>

            {loadingParticipants ? (
              <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 20 }} />
            ) : participants.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No participants yet</Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 250 }}>
                {participants.map((participant) => (
                  <View key={participant._id} style={styles.participantCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.participantName}>{participant.name}</Text>
                      <Text style={styles.participantInfo}>
                        {participant.rollNumber} • {participant.selectedNiche}
                      </Text>
                    </View>
                    {participant.status === "attended" ? (
                      <View style={styles.attendedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                        <Text style={styles.attendedText}>Done</Text>
                      </View>
                    ) : (
                      <View style={styles.attendanceActions}>
                        <TextInput
                          style={styles.pointsInput}
                          placeholder="10"
                          placeholderTextColor="#666"
                          keyboardType="numeric"
                          value={pointsInput[participant._id] || ""}
                          onChangeText={(text) => setPointsInput(prev => ({ ...prev, [participant._id]: text }))}
                        />
                        <Pressable
                          style={styles.markAttendanceButton}
                          onPress={() => handleMarkAttendance(participant._id, participant.name)}
                          disabled={markingAttendance === participant._id}
                        >
                          {markingAttendance === participant._id ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <>
                              <Ionicons name="star" size={14} color="#fff" />
                              <Text style={styles.markAttendanceText}>Award</Text>
                            </>
                          )}
                        </Pressable>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}

            <Pressable
              style={styles.cancelButton}
              onPress={() => {
                setManagingEvent(null);
                setParticipants([]);
                setPointsInput({});
              }}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Faculty: Create/Edit Event Modal */}
      {showCreateEvent && (
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.createEventModal}>
            <Text style={styles.modalTitle}>
              {editingEvent ? "Edit Event" : "Create Event"}
            </Text>

            <Text style={styles.inputLabel}>Event Name</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Enter event name"
              placeholderTextColor="#666"
              value={eventForm.name}
              onChangeText={(text: string) => setEventForm(prev => ({ ...prev, name: text }))}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.formInput, { height: 80, textAlignVertical: "top" }]}
              placeholder="Enter description"
              placeholderTextColor="#666"
              multiline
              value={eventForm.description}
              onChangeText={(text: string) => setEventForm(prev => ({ ...prev, description: text }))}
            />

            <Text style={styles.inputLabel}>Niche</Text>
            <View style={styles.nicheSelector}>
              {(Object.keys(NICHE_INFO) as EventNiche[]).map((niche) => (
                <Pressable
                  key={niche}
                  style={[
                    styles.nicheSelectorButton,
                    eventForm.niche === niche && { backgroundColor: NICHE_INFO[niche].color },
                  ]}
                  onPress={() => setEventForm(prev => ({ ...prev, niche }))}
                >
                  <MaterialCommunityIcons 
                    name={NICHE_INFO[niche].icon} 
                    size={20} 
                    color={eventForm.niche === niche ? "#fff" : "#9BA1A6"} 
                  />
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Venue</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Enter venue"
              placeholderTextColor="#666"
              value={eventForm.venue}
              onChangeText={(text: string) => setEventForm(prev => ({ ...prev, venue: text }))}
            />

            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Date</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#666"
                  value={eventForm.date}
                  onChangeText={(text: string) => setEventForm(prev => ({ ...prev, date: text }))}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.inputLabel}>Time</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 3:00 PM"
                  placeholderTextColor="#666"
                  value={eventForm.time}
                  onChangeText={(text: string) => setEventForm(prev => ({ ...prev, time: text }))}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Capacity</Text>
            <TextInput
              style={styles.formInput}
              placeholder="50"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={String(eventForm.capacity)}
              onChangeText={(text: string) => setEventForm(prev => ({ ...prev, capacity: parseInt(text, 10) || 0 }))}
            />

            <Pressable
              style={[styles.saveEventButton, savingEvent && { opacity: 0.7 }]}
              onPress={handleSaveEvent}
              disabled={savingEvent}
            >
              {savingEvent ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveEventButtonText}>
                  {editingEvent ? "Update Event" : "Create Event"}
                </Text>
              )}
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={() => {
                setShowCreateEvent(false);
                setEditingEvent(null);
                resetEventForm();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </ScrollView>
        </View>
      )}

      {/* Events List */}
      <ScrollView
        style={styles.eventsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Create Event Button - Faculty Only */}
        {isFaculty && (
          <Pressable style={styles.createEventButton} onPress={handleCreateEvent}>
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.createEventButtonText}>Create New Event</Text>
          </Pressable>
        )}

        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={20} color="#ECEDEE" />
          <Text style={styles.sectionTitle}>
            {isFaculty ? "Manage Events" : "Upcoming Events"}
          </Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          {isFaculty 
            ? "Tap on an event to view participants and assign incentives"
            : "Tap on an event to register your interest"
          }
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
                style={[styles.eventCard, !isFaculty && registered && styles.eventCardRegistered]}
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
                  {isFaculty ? (
                    <View style={[styles.manageBadge, { flexDirection: "row", alignItems: "center" }]}>
                      <Ionicons name="settings-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
                      <Text style={styles.registeredBadgeText}>Manage</Text>
                    </View>
                  ) : registered ? (
                    <View style={[styles.registeredBadge, { flexDirection: "row", alignItems: "center" }]}>
                      <Ionicons name="checkmark-circle" size={14} color="#fff" style={{ marginRight: 4 }} />
                      <Text style={styles.registeredBadgeText}>Registered</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.eventName}>{event.name}</Text>
                <Text style={styles.eventDescription}>{event.description}</Text>

                <View style={styles.eventDetails}>
                  <View style={styles.eventDetailItem}>
                    <Ionicons name="location-outline" size={14} color="#9BA1A6" style={{ marginRight: 4 }} />
                    <Text style={styles.eventDetailText}>{event.venue}</Text>
                  </View>
                  <View style={styles.eventDetailItem}>
                    <Ionicons name="calendar-outline" size={14} color="#9BA1A6" style={{ marginRight: 4 }} />
                    <Text style={styles.eventDetailText}>
                      {formatDate(event.date)}
                    </Text>
                  </View>
                  <View style={styles.eventDetailItem}>
                    <Ionicons name="time-outline" size={14} color="#9BA1A6" style={{ marginRight: 4 }} />
                    <Text style={styles.eventDetailText}>{event.time}</Text>
                  </View>
                </View>

                <View style={[styles.eventFooter, { flexDirection: "row", alignItems: "center" }]}>
                  <Ionicons name="people-outline" size={14} color="#9BA1A6" style={{ marginRight: 4 }} />
                  <Text style={styles.capacityText}>
                    {event.participantCount || 0} / {event.capacity} spots
                  </Text>
                </View>
              </Pressable>
            );
          })
        )}

        {/* My Registrations - only for students */}
        {!isFaculty && participations.length > 0 && (
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
    backgroundColor: "#151718",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#151718",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#9BA1A6",
  },
  eventsContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ECEDEE",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#9BA1A6",
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
    color: "#9BA1A6",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
  },
  eventCard: {
    backgroundColor: "#1e2022",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
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
  manageBadge: {
    backgroundColor: "#007AFF",
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
    color: "#ECEDEE",
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: "#9BA1A6",
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
    color: "#9BA1A6",
  },
  eventFooter: {
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 12,
  },
  capacityText: {
    fontSize: 13,
    color: "#9BA1A6",
  },
  registrationsContainer: {
    marginTop: 12,
  },
  registrationCard: {
    backgroundColor: "#1a3d2e",
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
    color: "#ECEDEE",
  },
  registrationNiche: {
    fontSize: 14,
    color: "#9BA1A6",
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  modal: {
    backgroundColor: "#1e2022",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ECEDEE",
    textAlign: "center",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#9BA1A6",
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
    color: "#9BA1A6",
    fontSize: 16,
    fontWeight: "500",
  },
  registeringIndicator: {
    marginTop: 12,
  },
  // Faculty participant management styles
  participantCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252829",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  participantName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ECEDEE",
  },
  participantInfo: {
    fontSize: 13,
    color: "#9BA1A6",
    marginTop: 2,
  },
  attendedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a3d2e",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  attendedText: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  markAttendanceButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF9800",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  markAttendanceText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  // Event info styles in manage modal
  eventInfoSection: {
    backgroundColor: "#252829",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  eventInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  eventInfoText: {
    color: "#9BA1A6",
    fontSize: 13,
    marginLeft: 8,
  },
  editEventButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
  },
  editEventButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  participantsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ECEDEE",
    marginBottom: 12,
  },
  attendanceActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pointsInput: {
    backgroundColor: "#1e2022",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 50,
    color: "#ECEDEE",
    fontSize: 14,
    textAlign: "center",
  },
  // Create/Edit event modal styles
  createEventModal: {
    backgroundColor: "#1e2022",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    maxHeight: "90%",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9BA1A6",
    marginTop: 16,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: "#252829",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 12,
    color: "#ECEDEE",
    fontSize: 15,
  },
  formRow: {
    flexDirection: "row",
  },
  nicheSelector: {
    flexDirection: "row",
    gap: 10,
  },
  nicheSelectorButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#252829",
    borderRadius: 8,
    padding: 12,
  },
  saveEventButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 24,
  },
  saveEventButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  createEventButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  createEventButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
