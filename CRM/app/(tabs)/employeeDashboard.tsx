import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Linking, useWindowDimensions } from "react-native";
import { 
  Text, 
  Card, 
  Avatar, 
  useTheme, 
  ActivityIndicator, 
  IconButton, 
  Divider,
  Surface,
  List,
  FAB,
  Appbar,
  Button,
  Chip,
  TextInput,
  Portal,
  Dialog
} from "react-native-paper";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  query?: string;
  source?: string;
  status?: string;
  assignedAt?: string;
}

export default function EmployeeDashboard() {
  const { logout, user, isLoading } = useAuth();
  const theme = useTheme();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  // Interaction Modal States
  const [interactionVisible, setInteractionVisible] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string>("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [addLeadVisible, setAddLeadVisible] = useState(false);
  const [newLead, setNewLead] = useState({ name: "", phone: "", email: "", source: "Employee Added", query: "" });

  const fetchData = async () => {
    const userId = user?.id || user?.userId;
    if (!userId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    
    try {
      const res = await API.get(`/employee/my-leads/${userId}`);
      setLeads(res.data);
    } catch (err) {
      console.error("Error fetching employee leads:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'employee') {
        router.replace("/employeeLogin");
      } else {
        fetchData();
      }
    }
  }, [isLoading, user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const openInteractionDialog = (lead: Lead, status: string) => {
    setActiveLead(lead);
    setPendingStatus(status);
    setNote("");
    setInteractionVisible(true);
  };

  const handleLogInteraction = async () => {
    if (!activeLead || !note || note.length < 5) return;
    setSubmitting(true);
    try {
      await API.put(`/leads/${activeLead.id}/status`, { 
        status: pendingStatus,
        note,
        employeeId: user?.id || user?.userId
      });
      setInteractionVisible(false);
      fetchData();
    } catch (err) {
      alert("Failed to log interaction. Note must be at least 5 characters.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddLead = async () => {
    if (!newLead.name || !newLead.phone) return alert("Name and phone are required.");
    const userId = user?.id || user?.userId;
    if (!userId) return alert("User session missing.");
    try {
      await API.post("/leads", { ...newLead, assigned_to: userId });
      alert("Lead added and assigned to you successfully!");
      setAddLeadVisible(false);
      setNewLead({ name: "", phone: "", email: "", source: "Employee Added", query: "" });
      fetchData();
    } catch(err) {
      alert("Failed to add lead.");
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00f3ff" />
        <Text style={styles.loadingText}>Syncing Workspace...</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      {!isDesktop && (
        <Appbar.Header style={styles.appbar} elevated>
          <Appbar.Content title="CRM Portal" titleStyle={styles.appbarTitle} />
          <Appbar.Action icon="account-circle-outline" onPress={() => router.push("/(tabs)/employeeProfile")} color="#00f3ff" />
          <Appbar.Action icon="logout" onPress={logout} color="#00f3ff" />
        </Appbar.Header>
      )}

      <View style={styles.layoutContainer}>
        {isDesktop && (
          <View style={styles.sidebar}>
            <Text style={styles.sidebarTitle}>C R M</Text>
            <Divider style={styles.sidebarDivider} />
            <List.Item 
              title="Portfolio" 
              left={() => <List.Icon icon="briefcase-outline" color="#00f3ff" />} 
              titleStyle={styles.sidebarItemText} 
            />
            <View style={{ flex: 1 }} />
            <List.Item 
              title="Profile" 
              left={() => <List.Icon icon="account-circle-outline" color="#94A3B8" />} 
              titleStyle={{ color: '#94A3B8' }} 
              onPress={() => router.push("/(tabs)/employeeProfile")}
            />
            <List.Item 
              title="Log out" 
              left={() => <List.Icon icon="logout" color="#EF4444" />} 
              titleStyle={{ color: '#EF4444' }} 
              onPress={logout}
            />
          </View>
        )}

        <ScrollView 
          style={styles.container}
          contentContainerStyle={[styles.scrollContent, isDesktop && { paddingLeft: 16 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00f3ff" />}
        >
          <View style={styles.responsiveWrapper}>
          
          {/* Header Stats */}
          <View style={styles.heroSection}>
            <View style={styles.heroText}>
              <Text variant="headlineMedium" style={styles.heroTitle}>Terminal</Text>
              <Text variant="bodyLarge" style={styles.heroSubtitle}>Track and manage your active leads</Text>
            </View>
            
            <View style={styles.statsGrid}>
              <Surface style={[styles.statBox, { shadowColor: '#00f3ff' }]} elevation={2}>
                <Text variant="displaySmall" style={[styles.statValue, { color: '#00f3ff' }]}>{leads.length}</Text>
                <Text variant="labelMedium" style={styles.statLabel}>TOTAL LEADS</Text>
              </Surface>
              <Surface style={[styles.statBox, { shadowColor: '#b537f2' }]} elevation={2}>
                <Text variant="displaySmall" style={[styles.statValue, { color: '#b537f2' }]}>
                  {leads.filter(l => l.status === 'contacted').length}
                </Text>
                <Text variant="labelMedium" style={styles.statLabel}>CONTACTED</Text>
              </Surface>
              <Surface style={[styles.statBox, { shadowColor: '#00E676' }]} elevation={2}>
                <Text variant="displaySmall" style={[styles.statValue, { color: '#00E676' }]}>
                  {leads.filter(l => l.status === 'converted').length}
                </Text>
                <Text variant="labelMedium" style={styles.statLabel}>CONVERTED</Text>
              </Surface>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.listHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>Active Nodes</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Button icon="account-plus" mode="contained" onPress={() => setAddLeadVisible(true)} buttonColor="rgba(0, 243, 255, 0.15)" textColor="#00f3ff" style={{marginRight: 8, borderColor: '#00f3ff', borderWidth: 1}}>Add</Button>
              <IconButton icon="filter-variant" size={20} iconColor="#00f3ff" />
            </View>
          </View>

          {leads.length === 0 ? (
            <Surface style={styles.emptySurface} elevation={1}>
              <IconButton icon="server-network-off" size={60} iconColor="rgba(0, 243, 255, 0.2)" />
              <Text variant="titleMedium" style={styles.emptyTitle}>No connections established</Text>
              <Text variant="bodyMedium" style={styles.emptyText}>Pull to refresh or contact CRM admin for allocation.</Text>
              <Button mode="contained" onPress={onRefresh} style={styles.refreshBtn} buttonColor="rgba(0, 243, 255, 0.2)" textColor="#00f3ff">Re-sync</Button>
            </Surface>
          ) : (
            <View style={styles.leadGrid}>
              {leads.map((l) => (
                <Surface key={l.id} style={styles.leadCard} elevation={2}>
                  <View style={styles.leadHeader}>
                    <Avatar.Text size={48} label={l.name[0]} style={styles.avatar} />
                    <View style={styles.leadInfo}>
                      <Text variant="titleMedium" style={styles.leadName}>{l.name}</Text>
                      <Text variant="bodySmall" style={styles.leadPhone}>{l.phone}</Text>
                      <Text variant="bodySmall" style={styles.leadEmail}>{l.email}</Text>
                      <Text variant="bodySmall" style={styles.leadQuery}>{'Purpose: '+ l.query}</Text>
                      <Text variant="bodySmall" style={styles.leadSource}>{'Source: '+ l.source}</Text>
                    </View>
                    <Chip 
                      style={[
                        styles.statusChip, 
                        l.status === 'contacted' && { backgroundColor: 'rgba(181, 55, 242, 0.2)', borderColor: 'rgba(181, 55, 242, 0.5)' },
                        l.status === 'converted' && { backgroundColor: 'rgba(0, 230, 118, 0.2)', borderColor: 'rgba(0, 230, 118, 0.5)' }
                      ]} 
                      textStyle={[
                        styles.statusText,
                        l.status === 'contacted' && { color: '#b537f2' },
                        l.status === 'converted' && { color: '#00E676' }
                      ]}
                    >
                      {l.status?.toUpperCase() || 'NEW'}
                    </Chip>
                  </View>
                  
                  <Divider style={styles.cardDivider} />
                  
                  <View style={styles.actionRow}>
                    <Button 
                      icon="phone-outline" 
                      mode="outlined" 
                      onPress={() => handleCall(l.phone)} 
                      style={styles.actionBtn}
                      contentStyle={styles.actionBtnContent}
                    >
                      Call
                    </Button>
                    <Button 
                      icon="email-outline" 
                      mode="outlined" 
                      onPress={() => l.email && Linking.openURL(`mailto:${l.email}`)} 
                      style={styles.actionBtn}
                      contentStyle={styles.actionBtnContent}
                    >
                      Email
                    </Button>
                  </View>

                  <View style={[styles.actionRow, { marginTop: 12 }]}>
                    <Button 
                      icon="account-check-outline" 
                      mode={l.status === 'contacted' ? "contained" : "contained-tonal"}
                      onPress={() => openInteractionDialog(l, 'contacted')} 
                      style={[styles.statusUpdateBtn, { flex: 1, borderWidth: l.status === 'contacted' ? 0 : 1, borderColor: '#b537f2' }]}
                      buttonColor={l.status === 'contacted' ? 'rgba(181, 55, 242, 0.8)' : 'rgba(181, 55, 242, 0.1)'}
                      textColor={l.status === 'contacted' ? '#FFF' : '#b537f2'}
                    >
                      Contacted
                    </Button>
                    <Button 
                      icon="currency-usd" 
                      mode={l.status === 'converted' ? "contained" : "contained-tonal"}
                      onPress={() => openInteractionDialog(l, 'converted')} 
                      style={[styles.statusUpdateBtn, { flex: 1.2, borderWidth: l.status === 'converted' ? 0 : 1, borderColor: '#00E676' }]}
                      buttonColor={l.status === 'converted' ? 'rgba(0, 230, 118, 0.8)' : 'rgba(0, 230, 118, 0.1)'}
                      textColor={l.status === 'converted' ? '#FFF' : '#00E676'}
                    >
                      Converted
                    </Button>
                  </View>
                </Surface>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      </View>

      <Portal>
        <Dialog 
          visible={interactionVisible} 
          onDismiss={() => !submitting && setInteractionVisible(false)} 
          style={[styles.dialog, styles.interactionDialog]}
        >
          <View style={styles.dialogHeader}>
            <IconButton icon="message-draw" iconColor="#1E293B" size={24} />
            <Dialog.Title style={styles.dialogTitle}>Activity Journal</Dialog.Title>
          </View>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogSubtitle}>
              Documenting progress for: <Text style={{fontWeight:'800', color: '#1A237E'}}>{activeLead?.name}</Text>
            </Text>
            <TextInput
              label="Interaction Evidence"
              placeholder="Provide a brief summary of the conversation..."
              value={note}
              onChangeText={setNote}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.dialogInput}
              outlineColor="#E2E8F0"
              activeOutlineColor="#1A237E"
              textColor="#000"
            />
            <View style={styles.inputFooter}>
               <Text style={[styles.charCount, note.length < 5 && {color: '#D32F2F'}]}>
                 {note.length} / 5 characters minimum
               </Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={() => setInteractionVisible(false)} disabled={submitting} mode="outlined" style={styles.dialogBtn}>Discard</Button>
            <Button 
              mode="contained" 
              onPress={handleLogInteraction} 
              loading={submitting}
              disabled={submitting || note.length < 5}
              buttonColor="#1A237E"
              textColor="white"
              style={[styles.dialogBtn, {flex: 2}]}
            >
              Verify & Update
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={addLeadVisible} onDismiss={() => setAddLeadVisible(false)} style={[styles.dialog, { backgroundColor: '#0B1120', borderWidth: 1, borderColor: 'rgba(0, 243, 255, 0.2)' }]}>
          <Dialog.Title style={[styles.dialogTitle, { color: '#00f3ff' }]}>Add Personal Lead</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Name" value={newLead.name} onChangeText={t => setNewLead({...newLead, name: t})} mode="outlined" style={styles.dialogInput} textColor="#E2E8F0" theme={{colors: {background: '#050914', primary: '#00f3ff', onSurfaceVariant: '#94A3B8'}}} />
            <TextInput label="Phone" value={newLead.phone} onChangeText={t => setNewLead({...newLead, phone: t})} mode="outlined" style={styles.dialogInput} textColor="#E2E8F0" theme={{colors: {background: '#050914', primary: '#00f3ff', onSurfaceVariant: '#94A3B8'}}} keyboardType="phone-pad" />
            <TextInput label="Email (Optional)" value={newLead.email} onChangeText={t => setNewLead({...newLead, email: t})} mode="outlined" style={styles.dialogInput} textColor="#E2E8F0" theme={{colors: {background: '#050914', primary: '#00f3ff', onSurfaceVariant: '#94A3B8'}}} keyboardType="email-address" />
            <TextInput label="Query/Purpose" value={newLead.query} onChangeText={t => setNewLead({...newLead, query: t})} mode="outlined" style={styles.dialogInput} textColor="#E2E8F0" theme={{colors: {background: '#050914', primary: '#00f3ff', onSurfaceVariant: '#94A3B8'}}} multiline numberOfLines={3} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddLeadVisible(false)} textColor="#64748B">Cancel</Button>
            <Button onPress={handleAddLead} buttonColor="#00f3ff" textColor="#050914" mode="contained" style={{ borderRadius: 8 }}>Save & Assign</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        color="#050914"
        label="Log Interaction"
        onPress={() => console.log('Log Interaction')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#050914',
  },
  layoutContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 260,
    backgroundColor: '#0B1120',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 243, 255, 0.2)',
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  sidebarTitle: {
    color: '#00f3ff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 243, 255, 0.5)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
  },
  sidebarDivider: {
    backgroundColor: 'rgba(0, 243, 255, 0.2)',
    marginBottom: 16,
  },
  sidebarItemText: {
    color: '#E2E8F0',
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  responsiveWrapper: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  appbar: {
    backgroundColor: '#0B1120',
    elevation: 4,
    shadowColor: '#00f3ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 243, 255, 0.1)',
  },
  appbarTitle: {
    fontWeight: '900',
    color: '#00f3ff',
    letterSpacing: 1,
  },
  heroSection: {
    marginBottom: 24,
  },
  heroText: {
    marginBottom: 24,
  },
  heroTitle: {
    fontWeight: '900',
    color: '#E2E8F0',
  },
  heroSubtitle: {
    color: '#94A3B8',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  statBox: {
    flex: 1,
    minWidth: 140,
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(16, 24, 48, 0.7)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 243, 255, 0.1)',
    shadowColor: '#00f3ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 3,
  },
  statValue: {
    fontWeight: '900',
    color: '#E2E8F0',
  },
  statLabel: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 4,
  },
  divider: {
    marginVertical: 24,
    backgroundColor: 'rgba(0, 243, 255, 0.2)',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '800',
    color: '#E2E8F0',
  },
  leadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  leadCard: {
    flex: 1,
    minWidth: 300,
    backgroundColor: 'rgba(16, 24, 48, 0.7)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 243, 255, 0.1)',
    shadowColor: '#00f3ff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  leadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'rgba(0, 243, 255, 0.2)',
  },
  leadInfo: {
    flex: 1,
    marginLeft: 16,
  },
  leadName: {
    fontWeight: '800',
    color: '#E2E8F0',
  },
  leadPhone: {
    color: '#94A3B8',
    marginTop: 2,
  },
  leadEmail: {
    color: '#94A3B8',
    fontSize: 12,
  },
  leadQuery: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  leadSource: {
    color: '#00f3ff',
    fontSize: 11,
    fontStyle: 'italic',
  },
  statusChip: {
    backgroundColor: 'rgba(0, 243, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 243, 255, 0.3)',
    height: 24,
  },
  statusText: {
    color: '#00f3ff',
    fontSize: 10,
    fontWeight: '700',
  },
  cardDivider: {
    marginVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
  },
  actionBtnContent: {
    height: 40,
  },
  statusUpdateBtn: {
    borderRadius: 12,
  },
  emptySurface: {
    padding: 48,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 24, 48, 0.7)',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 243, 255, 0.1)',
  },
  emptyTitle: {
    fontWeight: '800',
    color: '#E2E8F0',
    marginTop: 16,
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
  refreshBtn: {
    marginTop: 24,
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  fab: {
    position: 'absolute',
    margin: 24,
    right: 0,
    bottom: 0,
    backgroundColor: '#00f3ff',
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050914',
  },
  loadingText: {
    marginTop: 16,
    fontWeight: '600',
    color: '#00f3ff',
  },
  dialog: {
    borderRadius: 24,
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: 'rgba(0, 243, 255, 0.2)',
  },
  interactionDialog: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '95%',
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  dialogTitle: {
    fontWeight: '800',
    color: '#00f3ff',
    marginLeft: -8,
  },
  dialogSubtitle: {
    color: '#94A3B8',
    marginBottom: 16,
  },
  dialogInput: {
    backgroundColor: 'rgba(16, 24, 48, 0.5)',
  },
  inputFooter: {
    marginTop: 4,
    alignItems: 'flex-end',
  },
  charCount: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  dialogActions: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 8,
  },
  dialogBtn: {
    borderRadius: 12,
  }
});