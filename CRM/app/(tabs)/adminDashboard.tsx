import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions, Platform, useWindowDimensions } from "react-native";
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

import DashboardOverview from "../components/admin/DashboardOverview";
import LeadsView from "../components/admin/LeadsView";
import ImportLeads from "../components/admin/ImportLeads";
import WhatsAppMessaging from "../components/admin/WhatsAppMessaging";
import SettingsView from "../components/admin/SettingsView";
import EmployeeMatrix from "../components/admin/EmployeeMatrix";

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
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  // Modal States
  const [viewMode, setViewMode] = useState<'dashboard' | 'leads' | 'import' | 'whatsapp' | 'settings' | 'employees'>('dashboard');
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
  const [downloadDialogVisible, setDownloadDialogVisible] = useState(false);
  const [downloadTarget, setDownloadTarget] = useState<string | null>(null);
  const [addLeadVisible, setAddLeadVisible] = useState(false);
  const [newLead, setNewLead] = useState({ name: "", phone: "", email: "", source: "Admin Added", query: "" });

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

  const handleBulkEmail = async (params: {subject: string, message: string, leadIds: string[]}) => {
    try {
      await API.post("/leads/bulk-email", {
        subject: params.subject,
        message: params.message,
        leadIds: params.leadIds.length > 0 ? params.leadIds : "all"
      });
      alert("Broadcast successful");
      setBulkEmailVisible(false);
    } catch (err) {
      alert("Failed to send broadcast");
    }
  };

  const handleBulkWhatsApp = async (params: {message: string, leadIds: string[]}) => {
    try {
      await API.post("/leads/bulk-whatsapp", {
        message: params.message,
        leadIds: params.leadIds.length > 0 ? params.leadIds : "all"
      });
      alert("WhatsApp messages initiated successfully!");
      setBulkWhatsAppVisible(false);
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

  const handleAddLead = async () => {
    if (!newLead.name || !newLead.phone) return alert("Name and phone are required.");
    try {
      await API.post("/leads", newLead);
      alert("Lead added successfully!");
      setAddLeadVisible(false);
      setNewLead({ name: "", phone: "", email: "", source: "Admin Added", query: "" });
      fetchData();
    } catch(err) {
      alert("Failed to add lead.");
    }
  };

  const openDownloadModal = (target: string) => {
    setDownloadTarget(target);
    setDownloadDialogVisible(true);
  };

  const handleDownload = (format: 'excel' | 'pdf') => {
    if (!downloadTarget) return;
    
    let dataToDownload: any[] = [];
    let title = "Data";

    if (downloadTarget === 'staff') {
      dataToDownload = employees.map(e => ({ ID: e.id, Name: e.name, Email: e.email, Status: e.status, Contacted: e.contacted_count || 0, Converted: e.converted_count || 0 }));
      title = "Staff_List";
    } else if (downloadTarget === 'leads') {
      dataToDownload = leads.map(l => ({ ID: l.id, Name: l.name, Phone: l.phone, Email: l.email || '', Status: l.status || 'new', Assigned: l.assigned_to ? 'Yes' : 'No' }));
      title = "All_Leads";
    } else if (downloadTarget === 'unallocated') {
      dataToDownload = leads.filter(l => !l.assigned_to).map(l => ({ ID: l.id, Name: l.name, Phone: l.phone, Email: l.email || '' }));
      title = "Unallocated_Leads";
    } else if (downloadTarget === 'contacted') {
      dataToDownload = employees.map(e => ({ Name: e.name, Contacted_Count: e.contacted_count || 0 }));
      title = "Contacted_Stats";
    } else if (downloadTarget === 'converted') {
      dataToDownload = employees.map(e => ({ Name: e.name, Converted_Count: e.converted_count || 0 }));
      title = "Converted_Stats";
    }

    if (format === 'excel') {
      if (Platform.OS === 'web') {
        const headers = Object.keys(dataToDownload[0] || {}).join(",");
        const csvRows = dataToDownload.map(row => Object.values(row).map(v => `"${v}"`).join(","));
        const csvString = [headers, ...csvRows].join("\n");
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert("Download as Excel available on Web platform.");
      }
    } else if (format === 'pdf') {
      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          let html = `<html><head><title>${title}</title><style>table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } body{font-family: sans-serif;}</style></head><body><h2>${title.replace('_', ' ')}</h2><table>`;
          if (dataToDownload.length > 0) {
            html += `<tr>${Object.keys(dataToDownload[0]).map(k => `<th>${k}</th>`).join('')}</tr>`;
            dataToDownload.forEach(row => {
              html += `<tr>${Object.values(row).map(v => `<td>${v}</td>`).join('')}</tr>`;
            });
          } else {
            html += `<p>No data available</p>`;
          }
          html += `</table></body></html>`;
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.print();
        }
      } else {
        alert("Download as PDF available on Web platform.");
      }
    }
    setDownloadDialogVisible(false);
    setDownloadTarget(null);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text style={styles.loadingText}>Initializing CRM System...</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      {!isDesktop && (
        <Appbar.Header style={styles.appbar} elevated>
          <Appbar.Content title="CRM Admin" titleStyle={styles.appbarTitle} />
          <Appbar.Action icon="account-circle-outline" onPress={() => router.push("/(tabs)/adminProfile")} color="#0EA5E9" />
          <Appbar.Action icon="logout" onPress={logout} color="#0EA5E9" />
        </Appbar.Header>
      )}

      <View style={styles.layoutContainer}>
        {isDesktop && (
          <View style={styles.sidebar}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingHorizontal: 8}}>
              <Avatar.Icon size={40} icon="earth" style={{backgroundColor: '#3B82F6', marginRight: 12}} color="#FFF" />
              <View>
                <Text style={{color: '#0F172A', fontSize: 20, fontWeight: '900', letterSpacing: 0.5}}>VisaCRM</Text>
                <Text style={{color: '#64748B', fontSize: 10, fontWeight: '600'}}>Immigration Hub</Text>
              </View>
            </View>

            <TouchableOpacity style={viewMode === 'dashboard' ? styles.sidebarItemActive : styles.sidebarItem} onPress={() => setViewMode('dashboard')}>
              <List.Icon icon="view-dashboard" color={viewMode === 'dashboard' ? "#FFF" : "#64748B"} style={{margin: 0, marginRight: 12}} />
              <Text style={viewMode === 'dashboard' ? styles.sidebarItemTextActive : styles.sidebarItemText}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity style={viewMode === 'leads' ? styles.sidebarItemActive : styles.sidebarItem} onPress={() => setViewMode('leads')}>
              <List.Icon icon="account-group" color={viewMode === 'leads' ? "#FFF" : "#64748B"} style={{margin: 0, marginRight: 12}} />
              <Text style={viewMode === 'leads' ? styles.sidebarItemTextActive : styles.sidebarItemText}>Leads</Text>
              <View style={{flex: 1}} />
              <Chip textStyle={{fontSize: 10, color: '#FFF'}} style={{backgroundColor: 'rgba(255,255,255,0.2)', height: 20, borderRadius: 10}}>{leads.length}</Chip>
            </TouchableOpacity>

            <TouchableOpacity style={viewMode === 'import' ? styles.sidebarItemActive : styles.sidebarItem} onPress={() => setViewMode('import')}>
              <List.Icon icon="database-import" color={viewMode === 'import' ? "#FFF" : "#64748B"} style={{margin: 0, marginRight: 12}} />
              <Text style={viewMode === 'import' ? styles.sidebarItemTextActive : styles.sidebarItemText}>Import Leads</Text>
            </TouchableOpacity>

            <TouchableOpacity style={viewMode === 'employees' ? styles.sidebarItemActive : styles.sidebarItem} onPress={() => setViewMode('employees')}>
              <List.Icon icon="account-group" color={viewMode === 'employees' ? "#FFF" : "#64748B"} style={{margin: 0, marginRight: 12}} />
              <Text style={viewMode === 'employees' ? styles.sidebarItemTextActive : styles.sidebarItemText}>Team Staff</Text>
            </TouchableOpacity>

            <TouchableOpacity style={viewMode === 'whatsapp' ? styles.sidebarItemActive : styles.sidebarItem} onPress={() => setViewMode('whatsapp')}>
              <List.Icon icon="message-text-outline" color={viewMode === 'whatsapp' ? "#FFF" : "#64748B"} style={{margin: 0, marginRight: 12}} />
              <Text style={viewMode === 'whatsapp' ? styles.sidebarItemTextActive : styles.sidebarItemText}>Messaging</Text>
            </TouchableOpacity>

            <TouchableOpacity style={viewMode === 'settings' ? styles.sidebarItemActive : styles.sidebarItem} onPress={() => setViewMode('settings')}>
              <List.Icon icon="cog" color={viewMode === 'settings' ? "#FFF" : "#64748B"} style={{margin: 0, marginRight: 12}} />
              <Text style={viewMode === 'settings' ? styles.sidebarItemTextActive : styles.sidebarItemText}>Settings</Text>
            </TouchableOpacity>

            <View style={{ flex: 1 }} />
            
            <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16, marginBottom: 12}}>
              <Avatar.Text size={36} label={user?.name?.[0] || 'A'} style={{backgroundColor: '#3B82F6'}} color="#FFF" />
              <View style={{marginLeft: 12, flex: 1}}>
                <Text style={{color: '#0F172A', fontWeight: 'bold', fontSize: 14}} numberOfLines={1}>{user?.name || 'Admin'}</Text>
                <Text style={{color: '#64748B', fontSize: 10, fontWeight: '700'}}>ADMINISTRATOR</Text>
              </View>
              <IconButton icon="logout" size={20} iconColor="#EF4444" onPress={logout} style={{margin: 0}} />
            </View>
          </View>
        )}

        <ScrollView 
          style={styles.container}
          contentContainerStyle={[styles.scrollContent, isDesktop && { paddingLeft: 16 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0EA5E9" />}
        >
          <View style={styles.responsiveWrapper}>
            {viewMode === 'dashboard' && <DashboardOverview leads={leads} employees={employees} openDownloadModal={openDownloadModal} />}
            {viewMode === 'leads' && <LeadsView leads={filteredLeads} filters={leadFilters} setFilters={setLeadFilters} setAddLeadVisible={setAddLeadVisible} setSelectedLead={setSelectedLead} setAssignVisible={setAssignVisible} />}
            {viewMode === 'employees' && <EmployeeMatrix employees={employees} approve={approve} fetchEmployeeDetails={fetchEmployeeDetails} />}
            {viewMode === 'import' && <ImportLeads handleFileUpload={handleFileUpload} />}
            {viewMode === 'whatsapp' && <WhatsAppMessaging leads={leads} handleBulkWhatsApp={handleBulkWhatsApp} handleBulkEmail={handleBulkEmail} emailContent={emailContent} setEmailContent={setEmailContent} />}
            {viewMode === 'settings' && <SettingsView />}
          </View>
        </ScrollView>

        {/* Portals */}
        <Portal>
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
                        iconColor={selectedEmployee === emp.id ? "#1A237E" : "#0F172A"} 
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
              <Divider style={{ marginVertical: 16, height: 2, backgroundColor: '#0F172A' }} />
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

          <Dialog visible={downloadDialogVisible} onDismiss={() => setDownloadDialogVisible(false)} style={[styles.dialog, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(14, 165, 233, 0.2)' }]}>
            <Dialog.Title style={[styles.dialogTitle, { color: '#0EA5E9' }]}>Export Data</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium" style={[styles.dialogSubtitle, { color: '#64748B' }]}>Select your preferred export format for the requested data module.</Text>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <Button 
                  mode="contained" 
                  icon="file-excel" 
                  onPress={() => handleDownload('excel')} 
                  buttonColor="rgba(0, 230, 118, 0.2)" 
                  textColor="#00E676" 
                  style={{ flex: 1, borderRadius: 12, borderColor: 'rgba(0, 230, 118, 0.5)', borderWidth: 1 }}
                >
                  Excel (CSV)
                </Button>
                <Button 
                  mode="contained" 
                  icon="file-pdf-box" 
                  onPress={() => handleDownload('pdf')} 
                  buttonColor="rgba(255, 0, 127, 0.2)" 
                  textColor="#FF007F" 
                  style={{ flex: 1, borderRadius: 12, borderColor: 'rgba(255, 0, 127, 0.5)', borderWidth: 1 }}
                >
                  PDF Report
                </Button>
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDownloadDialogVisible(false)} textColor="#64748B">Cancel</Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog visible={addLeadVisible} onDismiss={() => setAddLeadVisible(false)} style={[styles.dialog, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(255, 193, 7, 0.2)' }]}>
            <Dialog.Title style={[styles.dialogTitle, { color: '#FFC107' }]}>Add New Lead</Dialog.Title>
            <Dialog.Content>
              <TextInput label="Name" value={newLead.name} onChangeText={t => setNewLead({...newLead, name: t})} mode="outlined" style={styles.dialogInput} textColor="#0F172A" theme={{colors: {background: '#F0F9FF', primary: '#FFC107', onSurfaceVariant: '#64748B'}}} />
              <TextInput label="Phone" value={newLead.phone} onChangeText={t => setNewLead({...newLead, phone: t})} mode="outlined" style={styles.dialogInput} textColor="#0F172A" theme={{colors: {background: '#F0F9FF', primary: '#FFC107', onSurfaceVariant: '#64748B'}}} keyboardType="phone-pad" />
              <TextInput label="Email (Optional)" value={newLead.email} onChangeText={t => setNewLead({...newLead, email: t})} mode="outlined" style={styles.dialogInput} textColor="#0F172A" theme={{colors: {background: '#F0F9FF', primary: '#FFC107', onSurfaceVariant: '#64748B'}}} keyboardType="email-address" />
              <TextInput label="Query/Purpose" value={newLead.query} onChangeText={t => setNewLead({...newLead, query: t})} mode="outlined" style={styles.dialogInput} textColor="#0F172A" theme={{colors: {background: '#F0F9FF', primary: '#FFC107', onSurfaceVariant: '#64748B'}}} multiline numberOfLines={3} />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setAddLeadVisible(false)} textColor="#64748B">Cancel</Button>
              <Button onPress={handleAddLead} buttonColor="#FFC107" textColor="#F0F9FF" mode="contained" style={{ borderRadius: 8 }}>Save Lead</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  layoutContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: 'rgba(14, 165, 233, 0.2)',
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  sidebarTitle: {
    color: '#0EA5E9',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(14, 165, 233, 0.5)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
  },
  sidebarDivider: {
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
    marginBottom: 16,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  sidebarItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    marginBottom: 8,
  },
  sidebarItemText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14,
  },
  sidebarItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
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
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(14, 165, 233, 0.1)',
  },
  appbarTitle: {
    fontWeight: '900',
    color: '#0EA5E9',
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
    color: '#0F172A',
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
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statIcon: {
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    marginRight: 16,
  },
  statValue: {
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 40,
  },
  statLabel: {
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 1,
  },
  toolsSurface: {
    padding: 28,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 2,
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
    color: '#0F172A',
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
    color: '#0F172A',
  },
  countChip: {
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  employeeCardWrapper: {
    flex: 1,
    minWidth: 320,
  },
  modernCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4,
  },
  modernCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatar: {
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontWeight: '700',
    color: '#0F172A',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.1)',
  },
  selectedLeadSurface: {
    borderColor: '#0EA5E9',
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
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
    color: '#0F172A',
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
    color: '#0EA5E9',
    fontWeight: '700',
  },
  assignChip: {
    height: 28,
    borderRadius: 8,
  },
  assignedChip: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  unallocatedChip: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
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
    width: '90%',
    maxWidth: 500,
    alignSelf: 'center',
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
    backgroundColor: '#0F172A',
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
    color: '#64748B',
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
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    gap: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.1)',
  },
  filterInput: {
    flex: 1,
    minWidth: 140,
    height: 40,
    backgroundColor: '#F8FAFC',
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