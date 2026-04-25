import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions, Platform } from "react-native";
import { TouchableOpacity } from "react-native";
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
  contacted_count?: number;
  converted_count?: number;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  query?: string;   
  source?: string;
  assigned_to?: string;
  status?: string;
  last_note?: string;
}

export default function AdminDashboard() {
  const { logout, user, isLoading } = useAuth();
  const theme = useTheme();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal States
  const [viewMode, setViewMode] = useState<'employees' | 'leads'>('employees');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [bulkEmailVisible, setBulkEmailVisible] = useState(false);
  const [assignVisible, setAssignVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [emailContent, setEmailContent] = useState({ subject: "", message: "" });
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [activeEmployeeData, setActiveEmployeeData] = useState<Lead[]>([]);
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);

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

  const fetchEmployeeDetails = async (emp: Employee) => {
    setActiveEmployee(emp);
    setDetailsVisible(true);
    try {
      const res = await API.get(`/admin/employee-details/${emp.id}`);
      setActiveEmployeeData(res.data);
    } catch (err) {
      alert("Failed to fetch interaction history");
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

  const toggleLeadSelection = (id: string) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

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
        leadIds: selectedLeads.length > 0 ? selectedLeads : "all"
      });
      alert("Broadcast successful");
      setBulkEmailVisible(false);
      setSelectedLeads([]);
    } catch (err) {
      alert("Failed to send broadcast");
    }
  };

  const handleAssign = async () => {
    const leadsToAssign = selectedLead ? [selectedLead] : selectedLeads;
    if (leadsToAssign.length === 0 || !selectedEmployee) return;
    
    try {
      // If we have multiple leads, we might need a bulk endpoint or map over them
      // Assuming a bulk-assign endpoint exists or we use the single one in a loop
      await Promise.all(leadsToAssign.map(leadId => 
        API.post("/leads/assign", {
          leadId,
          employeeId: selectedEmployee
        })
      ));
      
      alert(`Success: ${leadsToAssign.length} leads allocated`);
      setAssignVisible(false);
      setSelectedLead(null);
      setSelectedLeads([]);
      setSelectedEmployee(null);
      fetchData();
    } catch (err) {
      alert("Allocation process encountered an error");
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
            <View style={styles.heroHeader}>
              <Text variant="headlineMedium" style={styles.heroTitle}>Overview</Text>
              <SegmentedButtons
                value={viewMode}
                onValueChange={v => setViewMode(v as any)}
                style={styles.viewSwitcher}
                buttons={[
                  { value: 'employees', label: 'Staff', icon: 'account-group' },
                  { value: 'leads', label: 'Leads', icon: 'target' },
                ]}
              />
            </View>
            
            <View style={styles.gridRow}>
              <Surface style={[styles.statCard, { borderLeftColor: '#1A237E' }]} elevation={1}>
                <IconButton icon="account-tie" iconColor="#1A237E" size={24} style={styles.statIcon} />
                <View>
                  <Text variant="displaySmall" style={styles.statValue}>{employees.length}</Text>
                  <Text variant="labelMedium" style={styles.statLabel}>TOTAL STAFF</Text>
                </View>
              </Surface>
              <Surface style={[styles.statCard, { borderLeftColor: '#FF8F00' }]} elevation={1}>
                <IconButton icon="account-check-outline" iconColor="#FF8F00" size={24} style={styles.statIcon} />
                <View>
                  <Text variant="displaySmall" style={[styles.statValue, { color: '#FF8F00' }]}>
                    {employees.reduce((acc, curr) => acc + (Number(curr.contacted_count) || 0), 0)}
                  </Text>
                  <Text variant="labelMedium" style={styles.statLabel}>TOTAL CONTACTED</Text>
                </View>
              </Surface>
              <Surface style={[styles.statCard, { borderLeftColor: '#00796B' }]} elevation={1}>
                <IconButton icon="currency-usd" iconColor="#00796B" size={24} style={styles.statIcon} />
                <View>
                  <Text variant="displaySmall" style={[styles.statValue, { color: '#00796B' }]}>
                    {employees.reduce((acc, curr) => acc + (Number(curr.converted_count) || 0), 0)}
                  </Text>
                  <Text variant="labelMedium" style={styles.statLabel}>TOTAL CONVERTED</Text>
                </View>
              </Surface>
            </View>
          </View>

          {/* Core Tools Section */}
          <Surface style={styles.toolsSurface} elevation={2}>
            <View style={styles.toolsHeader}>
              <Text variant="titleLarge" style={styles.sectionHeading}>Business Intelligence Tools</Text>
              {selectedLeads.length > 0 && (
                <Button 
                  mode="contained" 
                  icon="account-multiple-plus" 
                  buttonColor="#FF8F00"
                  onPress={() => setAssignVisible(true)}
                  style={styles.bulkAssignBtn}
                >
                  Assign {selectedLeads.length} Selected
                </Button>
              )}
            </View>
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
                {selectedLeads.length > 0 ? 'Email Selected' : 'Broadcast Email'}
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
            {viewMode === 'employees' ? (
              /* Employee Management */
              <View style={styles.listSection}>
                <View style={styles.listHeader}>
                  <Text variant="titleMedium" style={styles.listTitle}>Staff Management (Click for Details)</Text>
                  <Chip icon="check-circle" style={styles.countChip}>{employees.length}</Chip>
                </View>
                <View style={styles.itemGrid}>
                  {employees.map((e) => (
                    <TouchableOpacity key={e.id} onPress={() => fetchEmployeeDetails(e)} style={styles.employeeCardWrapper}>
                      <Card style={styles.modernCard} mode="elevated">
                        <Card.Content style={styles.modernCardContent}>
                          <Avatar.Text size={48} label={e.name.substring(0, 2).toUpperCase()} style={styles.avatar} />
                          <View style={styles.cardInfo}>
                            <Text variant="titleMedium" style={styles.userName}>{e.name}</Text>
                            <View style={styles.empStatsRow}>
                              <Text variant="labelSmall" style={{color: '#FF8F00'}}>Contacted: {e.contacted_count || 0}</Text>
                              <Text variant="labelSmall" style={{color: '#00796B'}}>  •  Converted: {e.converted_count || 0}</Text>
                            </View>
                          </View>
                          <View style={styles.cardAction}>
                            {e.status === "pending" ? (
                              <Button mode="contained" onPress={(evt) => { evt.stopPropagation(); approve(e.id); }} buttonColor="#1A237E" textColor="white" style={styles.actionButton}>Approve</Button>
                            ) : (
                              <Chip textStyle={{ color: '#00796B' }} style={styles.statusChip}>Active</Chip>
                            )}
                          </View>
                        </Card.Content>
                      </Card>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              /* Lead Queue */
              <View style={styles.listSection}>
                <View style={styles.listHeader}>
                  <View>
                    <Text variant="titleMedium" style={styles.listTitle}>Lead Allocation Queue</Text>
                    <Text variant="bodySmall" style={{ color: '#64748B' }}>Select leads for bulk actions</Text>
                  </View>
                  <Chip icon="trending-up" style={styles.countChip}>{leads.length}</Chip>
                </View>
                <View style={styles.itemGrid}>
                  {leads.map((l) => (
                    <Surface 
                      key={l.id} 
                      style={[
                        styles.leadSurface, 
                        selectedLeads.includes(l.id) && styles.selectedLeadSurface
                      ]} 
                      elevation={1}
                    >
                      <View style={styles.leadMain}>
                        <IconButton 
                          icon={selectedLeads.includes(l.id) ? "checkbox-marked" : "checkbox-blank-outline"} 
                          iconColor={selectedLeads.includes(l.id) ? "#1A237E" : "#94A3B8"}
                          onPress={() => toggleLeadSelection(l.id)}
                        />
                        <View style={styles.leadMeta}>
                          <Text variant="titleMedium" style={styles.leadName}>{l.name}</Text>
                          <View style={styles.sourceTag}>
                            <IconButton icon={l.source?.toLowerCase().includes('facebook') ? 'facebook' : 'instagram'} size={14} style={{ margin: 0 }} />
                            <Text variant="labelSmall" style={styles.sourceText}>{l.source || 'Direct'}</Text>
                            <Text variant="labelSmall" style={styles.sourceText}>{'     Purpose: '+l.query}</Text>
                          </View>
                        </View>
                        {!selectedLeads.includes(l.id) && (
                          <IconButton 
                            icon="account-plus-outline" 
                            mode="contained-tonal" 
                            onPress={() => { setSelectedLead(l.id); setAssignVisible(true); }}
                          />
                        )}
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
            )}
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
            <Dialog.Title style={styles.dialogTitle}>
              {selectedLead ? 'Allocate Lead' : `Bulk Allocate (${selectedLeads.length} Leads)`}
            </Dialog.Title>
            <Dialog.Content>
              <Text variant="bodySmall" style={styles.dialogSubtitle}>Choose an approved employee to handle these assignments</Text>
              <ScrollView style={{ maxHeight: 400 }}>
                <View style={styles.employeeSelectionList}>
                  {employees.filter(e => e.status === 'approved').map(emp => (
                    <TouchableOpacity 
                      key={emp.id} 
                      onPress={() => setSelectedEmployee(emp.id)}
                      style={[
                        styles.empPickItem, 
                        selectedEmployee === emp.id && styles.empPickItemSelected
                      ]}
                    >
                      <Avatar.Text size={40} label={emp.name[0]} style={styles.empAvatar} />
                      <View style={styles.empInfo}>
                        <Text variant="titleMedium" style={styles.empName}>{emp.name}</Text>
                        <Text variant="bodySmall" style={styles.empEmail}>{emp.email}</Text>
                      </View>
                      <IconButton 
                        icon={selectedEmployee === emp.id ? "check-circle" : "circle-outline"} 
                        iconColor={selectedEmployee === emp.id ? "#1A237E" : "#E2E8F0"} 
                      />
                    </TouchableOpacity>
                  ))}
                  {employees.filter(e => e.status === 'approved').length === 0 && (
                    <Text style={styles.emptyMsg}>No approved employees found.</Text>
                  )}
                </View>
              </ScrollView>
            </Dialog.Content>
            <Dialog.Actions style={styles.dialogActions}>
              <Button onPress={() => setAssignVisible(false)} mode="outlined" style={styles.dialogBtn}>Cancel</Button>
              <Button 
                mode="contained" 
                disabled={!selectedEmployee} 
                onPress={handleAssign} 
                buttonColor="#1A237E" 
                textColor="white"
                style={styles.dialogBtn}
              >
                Confirm Allocation
              </Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog visible={detailsVisible} onDismiss={() => setDetailsVisible(false)} style={styles.dialog}>
            <Dialog.Title style={styles.dialogTitle}>{activeEmployee?.name}'s Portfolio</Dialog.Title>
            <Dialog.Content>
              <View style={styles.dialogStatsHeader}>
                <View style={styles.dialogStat}>
                  <Text variant="titleLarge" style={{color: '#FF8F00'}}>{activeEmployee?.contacted_count || 0}</Text>
                  <Text variant="labelSmall">CONTACTED</Text>
                </View>
                <View style={styles.dialogStat}>
                  <Text variant="titleLarge" style={{color: '#00796B'}}>{activeEmployee?.converted_count || 0}</Text>
                  <Text variant="labelSmall">CONVERTED</Text>
                </View>
              </View>
              <Divider style={{ marginVertical: 12 }} />
              <ScrollView style={{ maxHeight: 400 }}>
                {activeEmployeeData.length === 0 ? (
                  <Text style={styles.emptyMsg}>No leads assigned to this employee yet.</Text>
                ) : (
                  activeEmployeeData.map(l => (
                    <View key={l.id} style={styles.detailLeadItem}>
                      <View style={styles.detailLeadHeader}>
                        <Text variant="titleMedium" style={styles.detailLeadName}>{l.name}</Text>
                        <Chip 
                          style={[
                            styles.statusChip, 
                            l.status === 'contacted' && { backgroundColor: '#FEF3C7' },
                            l.status === 'converted' && { backgroundColor: '#D1FAE5' }
                          ]}
                          textStyle={{ fontSize: 10, fontWeight: '700' }}
                        >
                          {l.status?.toUpperCase() || 'NEW'}
                        </Chip>
                      </View>
                      <Text variant="bodySmall" style={styles.detailLeadPhone}>{l.phone} • {l.source}</Text>
                      {l.last_note && (
                        <Surface style={styles.noteSurface} elevation={0}>
                          <Text variant="labelSmall" style={styles.noteLabel}>LAST INTERACTION:</Text>
                          <Text variant="bodySmall" style={styles.noteText}>"{l.last_note}"</Text>
                        </Surface>
                      )}
                      <Divider style={{ marginTop: 12 }} />
                    </View>
                  ))
                )}
              </ScrollView>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDetailsVisible(false)}>Close</Button>
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
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  heroTitle: {
    fontWeight: '800',
    color: '#1E293B',
  },
  viewSwitcher: {
    minWidth: 240,
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
  toolsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionHeading: {
    fontWeight: '800',
    color: '#1E293B',
  },
  bulkAssignBtn: {
    borderRadius: 12,
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
    flex: 1,
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
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  employeeCardWrapper: {
    flex: 1,
    minWidth: 320,
  },
  modernCard: {
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  modernCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
  empStatsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  cardAction: {
    marginLeft: 12,
  },
  statusChip: {
    backgroundColor: '#F0FDF4',
  },
  leadSurface: {
    flex: 1,
    minWidth: 320,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  selectedLeadSurface: {
    borderColor: '#1A237E',
    backgroundColor: '#F8FAFF',
    borderWidth: 2,
  },
  leadMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leadMeta: {
    flex: 1,
    marginLeft: 8,
  },
  leadName: {
    fontWeight: '700',
    color: '#1E293B',
  },
  sourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
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
    backgroundColor: '#F1F5F9',
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
    borderRadius: 32,
    backgroundColor: '#fff',
    paddingBottom: 8,
  },
  dialogTitle: {
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 24,
    color: '#0F172A',
  },
  dialogSubtitle: {
    textAlign: 'center',
    color: '#64748B',
    marginBottom: 20,
  },
  dialogStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  dialogStat: {
    alignItems: 'center',
  },
  detailLeadItem: {
    marginBottom: 16,
  },
  detailLeadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLeadName: {
    fontWeight: '700',
    color: '#1E293B',
  },
  detailLeadPhone: {
    color: '#64748B',
    marginTop: 2,
  },
  noteSurface: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1A237E',
  },
  noteLabel: {
    color: '#64748B',
    fontWeight: '800',
    fontSize: 9,
    letterSpacing: 1,
  },
  noteText: {
    color: '#1E293B',
    fontStyle: 'italic',
    marginTop: 4,
  },
  dialogInput: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  employeeSelectionList: {
    gap: 8,
  },
  empPickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  empPickItemSelected: {
    borderColor: '#1A237E',
    backgroundColor: '#F0F4FF',
  },
  empAvatar: {
    backgroundColor: '#E2E8F0',
  },
  empInfo: {
    flex: 1,
    marginLeft: 12,
  },
  empName: {
    fontWeight: '700',
    color: '#1E293B',
  },
  empEmail: {
    color: '#64748B',
  },
  emptyMsg: {
    textAlign: 'center',
    color: '#94A3B8',
    padding: 20,
  },
  dialogActions: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
  },
  dialogBtn: {
    flex: 1,
    borderRadius: 12,
  },
  actionButton: {
    borderRadius: 8,
  }
});