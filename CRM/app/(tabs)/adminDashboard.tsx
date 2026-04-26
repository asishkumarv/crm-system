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
  const [bulkWhatsAppVisible, setBulkWhatsAppVisible] = useState(false);
  const [assignVisible, setAssignVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [emailContent, setEmailContent] = useState({ subject: "", message: "" });
  const [whatsAppContent, setWhatsAppContent] = useState({ message: "" });
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [activeEmployeeData, setActiveEmployeeData] = useState<Lead[]>([]);
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);

  // Filter States
  const [leadFilters, setLeadFilters] = useState({
    name: "",
    source: "",
    phone: "",
    date: "",
    assignment: "all" // all, assigned, unallocated
  });

  const filteredLeads = leads.filter(l => {
    const matchName = l.name.toLowerCase().includes(leadFilters.name.toLowerCase());
    const matchSource = (l.source || "").toLowerCase().includes(leadFilters.source.toLowerCase());
    const matchPhone = (l.phone || "").includes(leadFilters.phone);
    const matchDate = leadFilters.date ? (l as any).created_at?.includes(leadFilters.date) : true;
    
    let matchAssignment = true;
    if (leadFilters.assignment === 'assigned') matchAssignment = !!l.assigned_to;
    if (leadFilters.assignment === 'unallocated') matchAssignment = !l.assigned_to;

    return matchName && matchSource && matchPhone && matchDate && matchAssignment;
  });

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

  const handleBulkWhatsApp = async () => {
    try {
      await API.post("/leads/bulk-whatsapp", {
        ...whatsAppContent,
        leadIds: selectedLeads.length > 0 ? selectedLeads : "all"
      });
      alert("WhatsApp messages initiated successfully!");
      setBulkWhatsAppVisible(false);
      setWhatsAppContent({ message: "" });
    } catch (err) {
      alert("Failed to send bulk WhatsApp messages");
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
        <Appbar.Content title="Admin Dashboard" titleStyle={styles.appbarTitle} />
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
              <Surface style={[styles.statCard, { borderLeftColor: '#7C3AED' }]} elevation={1}>
                <IconButton icon="database-outline" iconColor="#7C3AED" size={24} style={styles.statIcon} />
                <View>
                  <Text variant="displaySmall" style={[styles.statValue, { color: '#7C3AED' }]}>
                    {leads.length}
                  </Text>
                  <Text variant="labelMedium" style={styles.statLabel}>TOTAL LEADS</Text>
                </View>
              </Surface>
              <Surface style={[styles.statCard, { borderLeftColor: '#EF4444' }]} elevation={1}>
                <IconButton icon="alert-circle-outline" iconColor="#EF4444" size={24} style={styles.statIcon} />
                <View>
                  <Text variant="displaySmall" style={[styles.statValue, { color: '#EF4444' }]}>
                    {leads.filter(l => !l.assigned_to).length}
                  </Text>
                  <Text variant="labelMedium" style={styles.statLabel}>UNALLOCATED</Text>
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
                onPress={() => setBulkWhatsAppVisible(true)}
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
                    <Text variant="bodySmall" style={{ color: '#64748B' }}>Search and filter leads below</Text>
                  </View>
                  <Chip icon="trending-up" style={styles.countChip}>{filteredLeads.length}</Chip>
                </View>

                {/* Filter Bar */}
                <Surface style={styles.filterBar} elevation={1}>
                  <TextInput 
                    placeholder="Name" 
                    value={leadFilters.name} 
                    onChangeText={t => setLeadFilters({...leadFilters, name: t})}
                    mode="outlined" 
                    style={styles.filterInput} 
                    dense
                    left={<TextInput.Icon icon="magnify" />}
                  />
                  <TextInput 
                    placeholder="Source" 
                    value={leadFilters.source} 
                    onChangeText={t => setLeadFilters({...leadFilters, source: t})}
                    mode="outlined" 
                    style={styles.filterInput} 
                    dense
                  />
                  <TextInput 
                    placeholder="Phone" 
                    value={leadFilters.phone} 
                    onChangeText={t => setLeadFilters({...leadFilters, phone: t})}
                    mode="outlined" 
                    style={styles.filterInput} 
                    dense
                  />
                  <TextInput 
                    placeholder="YYYY-MM-DD" 
                    value={leadFilters.date} 
                    onChangeText={t => setLeadFilters({...leadFilters, date: t})}
                    mode="outlined" 
                    style={styles.filterInput} 
                    dense
                    left={<TextInput.Icon icon="calendar" />}
                  />
                </Surface>
                <View style={styles.assignmentFilterRow}>
                  <SegmentedButtons
                    value={leadFilters.assignment}
                    onValueChange={v => setLeadFilters({...leadFilters, assignment: v})}
                    style={styles.assignmentSegment}
                    buttons={[
                      { value: 'all', label: 'All Leads' },
                      { value: 'assigned', label: 'Assigned' },
                      { value: 'unallocated', label: 'Unallocated' },
                    ]}
                  />
                  {(leadFilters.name || leadFilters.source || leadFilters.phone || leadFilters.date || leadFilters.assignment !== 'all') && (
                    <Button 
                      mode="text" 
                      onPress={() => setLeadFilters({name:"", source:"", phone:"", date:"", assignment: 'all'})}
                      textColor="#D32F2F"
                      icon="filter-variant-remove"
                    >
                      Clear
                    </Button>
                  )}
                </View>

                <View style={styles.itemGrid}>
                  {filteredLeads.map((l) => (
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
                          iconColor={selectedLeads.includes(l.id) ? "#1A237E" : (l.assigned_to ? "#E2E8F0" : "#94A3B8")}
                          onPress={() => !l.assigned_to && toggleLeadSelection(l.id)}
                          disabled={!!l.assigned_to}
                        />
                        <View style={styles.leadMeta}>
                          <Text variant="titleMedium" style={[styles.leadName, !!l.assigned_to && { color: '#94A3B8' }]}>{l.name}</Text>
                          <View style={styles.sourceTag}>
                            <IconButton icon={l.source?.toLowerCase().includes('facebook') ? 'facebook' : 'instagram'} size={14} style={{ margin: 0 }} />
                            <Text variant="labelSmall" style={styles.sourceText}>{l.source || 'Direct'}</Text>
                            <Text variant="labelSmall" style={styles.sourceText}>{'     Purpose: '+l.query}</Text>
                          </View>
                        </View>
                        {!l.assigned_to && !selectedLeads.includes(l.id) && (
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
                        <Chip 
                          style={[
                            styles.assignChip, 
                            l.assigned_to ? styles.assignedChip : styles.unallocatedChip
                          ]}
                          textStyle={[
                            styles.assignChipText,
                            l.assigned_to ? { color: '#1A237E' } : { color: '#FF8F00' }
                          ]}
                        >
                          {l.assigned_to ? 'Assigned' : 'Unallocated'}
                        </Chip>
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
          <Dialog visible={bulkEmailVisible} onDismiss={() => setBulkEmailVisible(false)} style={[styles.dialog, styles.portfolioDialog]}>
            <Dialog.Title style={styles.dialogTitle}>Broadcast Email</Dialog.Title>
            <Dialog.Content>
              <TextInput label="Subject" value={emailContent.subject} onChangeText={t => setEmailContent({...emailContent, subject: t})} mode="outlined" style={styles.dialogInput} textColor="#000" />
              <TextInput label="Message" multiline numberOfLines={5} value={emailContent.message} onChangeText={t => setEmailContent({...emailContent, message: t})} mode="outlined" style={styles.dialogInput} textColor="#000" />
            </Dialog.Content>
            <Dialog.Actions style={{ paddingHorizontal: 20 }}>
              <Button onPress={() => setBulkEmailVisible(false)}>Cancel</Button>
              <Button mode="contained" onPress={handleBulkEmail} buttonColor="#1A237E" textColor="white" style={{ flex: 1, borderRadius: 12 }}>Send Broadcast</Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog visible={bulkWhatsAppVisible} onDismiss={() => setBulkWhatsAppVisible(false)} style={[styles.dialog, styles.portfolioDialog]}>
            <Dialog.Title style={styles.dialogTitle}>Broadcast WhatsApp</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodySmall" style={styles.dialogSubtitle}>
                Twilio Sandbox Note: Recipients must have joined your sandbox (e.g., "join your-keyword").
              </Text>
              <TextInput 
                label="Message Content" 
                multiline 
                numberOfLines={5} 
                value={whatsAppContent.message} 
                onChangeText={t => setWhatsAppContent({...whatsAppContent, message: t})} 
                mode="outlined" 
                style={styles.dialogInput} 
                textColor="#000" 
              />
            </Dialog.Content>
            <Dialog.Actions style={{ paddingHorizontal: 20 }}>
              <Button onPress={() => setBulkWhatsAppVisible(false)}>Cancel</Button>
              <Button mode="contained" onPress={handleBulkWhatsApp} buttonColor="#25D366" textColor="white" style={{ flex: 1, borderRadius: 12 }}>Send WhatsApp</Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog visible={assignVisible} onDismiss={() => setAssignVisible(false)} style={[styles.dialog, styles.portfolioDialog]}>
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

          <Dialog visible={detailsVisible} onDismiss={() => setDetailsVisible(false)} style={[styles.dialog, styles.portfolioDialog]}>
            <Dialog.Title style={styles.dialogTitle}>{activeEmployee?.name}'s Portfolio</Dialog.Title>
            <Dialog.Content>
              <View style={styles.dialogStatsHeader}>
                <View style={styles.dialogStat}>
                  <Text variant="displaySmall" style={{color: '#E65100', fontWeight: '900'}}>{activeEmployee?.contacted_count || 0}</Text>
                  <Text variant="labelMedium" style={{color: '#E65100', fontWeight: '800'}}>CONTACTED</Text>
                </View>
                <View style={styles.dialogStat}>
                  <Text variant="displaySmall" style={{color: '#1B5E20', fontWeight: '900'}}>{activeEmployee?.converted_count || 0}</Text>
                  <Text variant="labelMedium" style={{color: '#1B5E20', fontWeight: '800'}}>CONVERTED</Text>
                </View>
              </View>
              <Divider style={{ marginVertical: 16, height: 2, backgroundColor: '#E2E8F0' }} />
              <ScrollView style={{ maxHeight: 500 }}>
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
                            l.status === 'contacted' && { backgroundColor: '#FFB300' },
                            l.status === 'converted' && { backgroundColor: '#2E7D32' },
                            (!l.status || l.status === 'new') && { backgroundColor: '#1A237E' }
                          ]}
                          textStyle={{ fontSize: 10, fontWeight: '900', color: '#fff' }}
                        >
                          {l.status?.toUpperCase() || 'NEW'}
                        </Chip>
                      </View>
                      <Text variant="bodyMedium" style={styles.detailLeadPhone}>{l.phone} • {l.source}</Text>
                      <Text variant="bodyMedium" style={styles.detailLeadQuery}>Purpose: {l.query || 'N/A'}</Text>
                      {l.last_note && (
                        <Surface style={styles.noteSurface} elevation={1}>
                          <Text variant="labelSmall" style={styles.noteLabel}>STAFF INTERACTION NOTE:</Text>
                          <Text variant="bodyMedium" style={styles.noteText}>"{l.last_note}"</Text>
                        </Surface>
                      )}
                      <Divider style={{ marginTop: 16, backgroundColor: '#F1F5F9' }} />
                    </View>
                  ))
                )}
              </ScrollView>
            </Dialog.Content>
            <Dialog.Actions style={{ paddingHorizontal: 20 }}>
              <Button mode="contained" onPress={() => setDetailsVisible(false)} buttonColor="#1A237E" textColor="#fff" style={{ flex: 1, borderRadius: 12 }}>Close Portfolio</Button>
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
    height: 28,
    borderRadius: 8,
  },
  assignedChip: {
    backgroundColor: '#E0E7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  unallocatedChip: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  assignChipText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
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
  portfolioDialog: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '95%',
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
  detailLeadQuery: {
    color: '#1A237E',
    fontWeight: '600',
    marginTop: 4,
    fontSize: 11,
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
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
    gap: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterInput: {
    flex: 1,
    minWidth: 140,
    height: 40,
    backgroundColor: '#fff',
  },
  assignmentFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  assignmentSegment: {
    maxWidth: 400,
    minWidth: 300,
  },
  actionButton: {
    borderRadius: 8,
  }
});