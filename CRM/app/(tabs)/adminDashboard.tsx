import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions, Platform } from "react-native";
import { 
  Text, 
  Card, 
  Avatar, 
  Button, 
  useTheme, 
  ActivityIndicator, 
  IconButton, 
  Chip,
  Divider,
  Surface,
  List,
  Appbar,
  Portal,
  Dialog,
  TextInput,
  SegmentedButtons
} from "react-native-paper";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

interface Employee {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  query?: string;   
  source?: string;
  assigned_to?: string;
}

export default function AdminDashboard() {
  const { logout, user, isLoading } = useAuth();
  const theme = useTheme();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal States
  const [bulkEmailVisible, setBulkEmailVisible] = useState(false);
  const [assignVisible, setAssignVisible] = useState(false);
  const [emailContent, setEmailContent] = useState({ subject: "", message: "" });
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [empRes, leadRes] = await Promise.all([
        API.get("/admin/employees"),
        API.get("/leads")
      ]);
      setEmployees(empRes.data);
      setLeads(leadRes.data);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'admin') {
        router.replace("/adminLogin");
      } else {
        fetchData();
      }
    }
  }, [isLoading, user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const approve = async (id: string) => {
    try {
      await API.put(`/admin/approve/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to approve employee");
    }
  };

  const handleBulkEmail = async () => {
    try {
      await API.post("/leads/bulk-email", {
        ...emailContent,
        leadIds: "all"
      });
      alert("Bulk emails sent successfully");
      setBulkEmailVisible(false);
    } catch (err) {
      alert("Failed to send bulk emails");
    }
  };

  const handleAssign = async () => {
    if (!selectedLead || !selectedEmployee) return;
    try {
      await API.post("/leads/assign", {
        leadId: selectedLead,
        employeeId: selectedEmployee
      });
      alert("Lead assigned successfully");
      setAssignVisible(false);
      fetchData();
    } catch (err) {
      alert("Failed to assign lead");
    }
  };

  const handleFileUpload = (event: any) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    API.post("/leads/upload", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => {
      alert(res.data);
      fetchData();
    }).catch(err => {
      alert("Error uploading CSV");
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A237E" />
        <Text style={styles.loadingText}>Loading Analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <Appbar.Header style={styles.appbar} elevated>
        <Appbar.Content title="Command Center" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon="logout" onPress={logout} color="#1A237E" />
      </Appbar.Header>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.responsiveWrapper}>
          
          {/* Dashboard Hero / Stats Summary */}
          <View style={styles.heroSection}>
            <Text variant="headlineMedium" style={styles.heroTitle}>Overview</Text>
            <View style={styles.gridRow}>
              <Surface style={[styles.statCard, { borderLeftColor: '#1A237E' }]} elevation={1}>
                <IconButton icon="account-tie" iconColor="#1A237E" size={24} style={styles.statIcon} />
                <View>
                  <Text variant="displaySmall" style={styles.statValue}>{employees.length}</Text>
                  <Text variant="labelMedium" style={styles.statLabel}>TOTAL STAFF</Text>
                </View>
              </Surface>
              <Surface style={[styles.statCard, { borderLeftColor: '#FF8F00' }]} elevation={1}>
                <IconButton icon="clock-alert-outline" iconColor="#FF8F00" size={24} style={styles.statIcon} />
                <View>
                  <Text variant="displaySmall" style={[styles.statValue, { color: '#FF8F00' }]}>
                    {employees.filter(e => e.status === 'pending').length}
                  </Text>
                  <Text variant="labelMedium" style={styles.statLabel}>PENDING APPROVAL</Text>
                </View>
              </Surface>
              <Surface style={[styles.statCard, { borderLeftColor: '#00796B' }]} elevation={1}>
                <IconButton icon="target" iconColor="#00796B" size={24} style={styles.statIcon} />
                <View>
                  <Text variant="displaySmall" style={[styles.statValue, { color: '#00796B' }]}>{leads.length}</Text>
                  <Text variant="labelMedium" style={styles.statLabel}>ACTIVE LEADS</Text>
                </View>
              </Surface>
            </View>
          </View>

          {/* Core Tools Section */}
          <Surface style={styles.toolsSurface} elevation={2}>
            <Text variant="titleLarge" style={styles.sectionHeading}>Business Intelligence Tools</Text>
            <View style={styles.toolsGrid}>
              {Platform.OS === 'web' && (
                <Button 
                  icon="file-upload-outline" 
                  mode="contained-tonal" 
                  onPress={() => (document.getElementById('csv-upload') as any)?.click()}
                  style={styles.toolBtn}
                  contentStyle={styles.toolBtnContent}
                >
                  Import Leads
                </Button>
              )}
              <input type="file" id="csv-upload" style={{ display: 'none' }} accept=".csv" onChange={handleFileUpload} />
              
              <Button 
                icon="email-plus-outline" 
                mode="contained" 
                buttonColor="#1A237E"
                onPress={() => setBulkEmailVisible(true)}
                style={styles.toolBtn}
                contentStyle={styles.toolBtnContent}
                textColor="white"
              >
                Bulk Email
              </Button>
              
              <Button 
                icon="whatsapp" 
                mode="contained" 
                buttonColor="#25D366"
                onPress={() => alert("Connect to WhatsApp Business API...")}
                style={styles.toolBtn}
                contentStyle={styles.toolBtnContent}
                textColor="white"
              >
                Bulk WhatsApp
              </Button>
            </View>
          </Surface>

          {/* Lists Section */}
          <View style={styles.listsContainer}>
            {/* Employee Management */}
            <View style={styles.listSection}>
              <View style={styles.listHeader}>
                <Text variant="titleMedium" style={styles.listTitle}>Staff Management</Text>
                <Chip icon="check-circle" style={styles.countChip}>{employees.length}</Chip>
              </View>
              {employees.map((e) => (
                <Card key={e.id} style={styles.modernCard} mode="elevated">
                  <Card.Content style={styles.modernCardContent}>
                    <Avatar.Text size={48} label={e.name.substring(0, 2).toUpperCase()} style={styles.avatar} />
                    <View style={styles.cardInfo}>
                      <Text variant="titleMedium" style={styles.userName}>{e.name}</Text>
                      <Text variant="bodySmall" style={styles.userEmail}>{e.email}</Text>
                    </View>
                    <View style={styles.cardAction}>
                      {e.status === "pending" ? (
                        <Button mode="contained" onPress={() => approve(e.id)} buttonColor="#1A237E" textColor="white" style={styles.actionButton}>Approve</Button>
                      ) : (
                        <Chip textStyle={{ color: '#00796B' }} style={styles.statusChip}>Active</Chip>
                      )}
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>

            {/* Lead Queue */}
            <View style={styles.listSection}>
              <View style={styles.listHeader}>
                <Text variant="titleMedium" style={styles.listTitle}>Lead Allocation Queue</Text>
                <Chip icon="trending-up" style={styles.countChip}>{leads.length}</Chip>
              </View>
              {leads.map((l) => (
                <Surface key={l.id} style={styles.leadSurface} elevation={1}>
                  <View style={styles.leadMain}>
                    <View style={styles.leadMeta}>
                      <Text variant="titleMedium" style={styles.leadName}>{l.name}</Text>
                      <View style={styles.sourceTag}>
                        <IconButton icon={l.source?.toLowerCase().includes('facebook') ? 'facebook' : 'instagram'} size={14} style={{ margin: 0 }} />
                        <Text variant="labelSmall" style={styles.sourceText}>{l.source || 'Direct'}</Text>
                        <Text variant="labelSmall" style={styles.sourceText}>{'     Lead Purpose: '+l.query}</Text>
                      </View>
                    </View>
                    <IconButton 
                      icon="account-plus-outline" 
                      mode="contained-tonal" 
                      onPress={() => { setSelectedLead(l.id); setAssignVisible(true); }}
                    />
                  </View>
                  <Divider style={{ marginVertical: 8 }} />
                  <View style={styles.leadFooter}>
                    <Text variant="labelSmall" style={styles.phoneText}>{l.phone}</Text>
                    <Text variant="labelSmall" style={styles.phoneText}>{l.email}</Text>
                    <Chip style={styles.assignChip}>{l.assigned_to ? 'Assigned' : 'Unallocated'}</Chip>
                  </View>
                </Surface>
              ))}
            </View>
          </View>
        </View>
        <View style={{ height: 40 }} />

        {/* Portals */}
        <Portal>
          <Dialog visible={bulkEmailVisible} onDismiss={() => setBulkEmailVisible(false)} style={styles.dialog}>
            <Dialog.Title style={styles.dialogTitle}>Broadcast Email</Dialog.Title>
            <Dialog.Content>
              <TextInput label="Subject" value={emailContent.subject} onChangeText={t => setEmailContent({...emailContent, subject: t})} mode="outlined" style={styles.dialogInput} />
              <TextInput label="Message" multiline numberOfLines={5} value={emailContent.message} onChangeText={t => setEmailContent({...emailContent, message: t})} mode="outlined" style={styles.dialogInput} />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setBulkEmailVisible(false)}>Cancel</Button>
              <Button mode="contained" onPress={handleBulkEmail} buttonColor="#1A237E" textColor="white">Send Broadcast</Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog visible={assignVisible} onDismiss={() => setAssignVisible(false)} style={styles.dialog}>
            <Dialog.Title style={styles.dialogTitle}>Allocate Lead</Dialog.Title>
            <Dialog.Content>
              <ScrollView style={{ maxHeight: 300 }}>
                {employees.filter(e => e.status === 'approved').map(emp => (
                  <List.Item
                    key={emp.id}
                    title={emp.name}
                    description={emp.email}
                    onPress={() => setSelectedEmployee(emp.id)}
                    left={p => <Avatar.Text {...p} size={36} label={emp.name[0]} />}
                    right={p => <IconButton icon={selectedEmployee === emp.id ? "check-circle" : "circle-outline"} iconColor={selectedEmployee === emp.id ? "#1A237E" : "#ccc"} />}
                    style={[styles.listItem, selectedEmployee === emp.id && styles.selectedListItem]}
                  />
                ))}
              </ScrollView>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setAssignVisible(false)}>Cancel</Button>
              <Button mode="contained" disabled={!selectedEmployee} onPress={handleAssign} buttonColor="#1A237E" textColor="white">Confirm Allocation</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  responsiveWrapper: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  appbar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  appbarTitle: {
    fontWeight: '900',
    color: '#1A237E',
    letterSpacing: 1,
  },
  heroSection: {
    marginBottom: 32,
  },
  heroTitle: {
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 280,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderLeftWidth: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    backgroundColor: '#F1F5F9',
    marginRight: 16,
  },
  statValue: {
    fontWeight: '900',
    color: '#1E293B',
    lineHeight: 40,
  },
  statLabel: {
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 1,
  },
  toolsSurface: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#fff',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeading: {
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 20,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolBtn: {
    flex: 1,
    minWidth: 180,
    borderRadius: 12,
  },
  toolBtnContent: {
    height: 48,
  },
  listsContainer: {
    flexDirection: Platform.OS === 'web' && Dimensions.get('window').width > 900 ? 'row' : 'column',
    gap: 24,
  },
  listSection: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  listTitle: {
    fontWeight: '700',
    color: '#475569',
  },
  countChip: {
    backgroundColor: '#F1F5F9',
  },
  modernCard: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  modernCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#E2E8F0',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontWeight: '700',
    color: '#1E293B',
  },
  userEmail: {
    color: '#64748B',
  },
  cardAction: {
    marginLeft: 12,
  },
  statusChip: {
    backgroundColor: '#F0FDF4',
  },
  leadSurface: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  leadMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leadMeta: {
    flex: 1,
  },
  leadName: {
    fontWeight: '700',
    color: '#1E293B',
  },
  sourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  sourceText: {
    color: '#64748B',
    fontWeight: '600',
  },
  leadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phoneText: {
    color: '#1A237E',
    fontWeight: '700',
  },
  assignChip: {
    height: 24,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontWeight: '600',
    color: '#1A237E',
  },
  dialog: {
    borderRadius: 24,
    backgroundColor: '#fff',
  },
  dialogTitle: {
    textAlign: 'center',
    fontWeight: '800',
  },
  dialogInput: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  listItem: {
    borderRadius: 12,
    marginBottom: 4,
  },
  selectedListItem: {
    backgroundColor: '#F1F5F9',
  },
  actionButton: {
    borderRadius: 8,
  }
});