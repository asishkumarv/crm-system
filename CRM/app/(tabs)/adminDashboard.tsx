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

  // Mock File Upload (for web)
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'rejected': return '#F44336';
      default: return '#757575';
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading Analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Admin Command Center" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon="logout" onPress={logout} color="#1A237E" />
      </Appbar.Header>

      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Bulk Action Buttons */}
        <Surface style={styles.actionSurface} elevation={2}>
          <Text variant="titleMedium" style={styles.actionTitle}>Bulk Operations</Text>
          <View style={styles.actionRow}>
            {Platform.OS === 'web' && (
              <Button 
                icon="upload" 
                mode="outlined" 
                onPress={() => (document.getElementById('csv-upload') as any)?.click()}
                style={styles.actionBtn}
              >
                Import CSV
              </Button>
            )}
            <input 
              type="file" 
              id="csv-upload" 
              style={{ display: 'none' }} 
              accept=".csv"
              onChange={handleFileUpload} 
            />
            <Button 
              icon="email-multiple" 
              mode="contained" 
              buttonColor="#1565C0"
              onPress={() => setBulkEmailVisible(true)}
              style={styles.actionBtn}
              textColor="white"
            >
              Bulk Email
            </Button>
            <Button 
              icon="whatsapp" 
              mode="contained" 
              buttonColor="#25D366"
              onPress={() => alert("Bulk WhatsApp integration ready. Connect your API provider in Settings.")}
              style={styles.actionBtn}
              textColor="white"
            >
              WhatsApp
            </Button>
          </View>
        </Surface>

        <View style={styles.statsRow}>
          <Surface style={[styles.statCard, { borderLeftColor: '#1565C0' }]} elevation={2}>
            <Text variant="labelMedium" style={styles.statLabel}>TOTAL EMPLOYEES</Text>
            <Text variant="headlineSmall" style={styles.statValue}>{employees.length}</Text>
          </Surface>
          <Surface style={[styles.statCard, { borderLeftColor: '#FF9800' }]} elevation={2}>
            <Text variant="labelMedium" style={styles.statLabel}>PENDING APPROVAL</Text>
            <Text variant="headlineSmall" style={[styles.statValue, { color: '#FF9800' }]}>
              {employees.filter(e => e.status === 'pending').length}
            </Text>
          </Surface>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.sectionHeader}>
          <IconButton icon="account-group" size={24} iconColor={theme.colors.primary} />
          <Text variant="titleLarge" style={styles.sectionTitle}>Employee Control</Text>
        </View>

        {employees.map((e) => (
          <Card key={e.id} style={styles.itemCard} mode="outlined">
            <Card.Content style={styles.cardContent}>
              <View style={styles.itemMain}>
                <Avatar.Text size={44} label={e.name.substring(0, 2).toUpperCase()} style={styles.avatar} />
                <View style={styles.itemInfo}>
                  <Text variant="titleMedium">{e.name}</Text>
                  <Text variant="bodySmall">{e.email}</Text>
                </View>
              </View>
              <View style={styles.itemActions}>
                <Chip 
                  textStyle={{ color: '#fff', fontSize: 10 }}
                  style={{ backgroundColor: getStatusColor(e.status), height: 24 }}
                >
                  {e.status.toUpperCase()}
                </Chip>
                {e.status === "pending" && (
                  <Button 
                    mode="contained" 
                    onPress={() => approve(e.id)} 
                    style={styles.approveBtn}
                    buttonColor="#1565C0"
                    textColor="white"
                  >
                    Approve
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>
        ))}

        <View style={[styles.sectionHeader, { marginTop: 30 }]}>
          <IconButton icon="bullseye-arrow" size={24} iconColor="#E91E63" />
          <Text variant="titleLarge" style={styles.sectionTitle}>Lead Management</Text>
        </View>

        {leads.map((l) => (
          <List.Item
            key={l.id}
            title={l.name}
            description={`${l.phone} • Source: ${l.source || 'Direct'}\n${l.assigned_to ? 'Assigned' : 'Unassigned'}`}
            left={props => <List.Icon {...props} icon="account-circle" color="#E91E63" />}
            right={props => (
              <IconButton 
                icon="account-arrow-right" 
                onPress={() => {
                  setSelectedLead(l.id);
                  setAssignVisible(true);
                }} 
              />
            )}
            style={styles.listItem}
          />
        ))}
        <View style={{ height: 40 }} />

        {/* Portals */}
        <Portal>
          <Dialog visible={bulkEmailVisible} onDismiss={() => setBulkEmailVisible(false)}>
            <Dialog.Title>Send Bulk Email</Dialog.Title>
            <Dialog.Content>
              <TextInput 
                label="Subject" 
                value={emailContent.subject} 
                onChangeText={t => setEmailContent({...emailContent, subject: t})}
                style={{ marginBottom: 12 }}
              />
              <TextInput 
                label="Message Body" 
                multiline 
                numberOfLines={4}
                value={emailContent.message} 
                onChangeText={t => setEmailContent({...emailContent, message: t})}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setBulkEmailVisible(false)}>Cancel</Button>
              <Button mode="contained" onPress={handleBulkEmail}>Send to All Leads</Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog visible={assignVisible} onDismiss={() => setAssignVisible(false)}>
            <Dialog.Title>Assign Lead</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium" style={{ marginBottom: 16 }}>Select an employee to handle this lead:</Text>
              <ScrollView style={{ maxHeight: 200 }}>
                {employees.filter(e => e.status === 'approved').map(emp => (
                  <List.Item
                    key={emp.id}
                    title={emp.name}
                    left={p => <List.Icon {...p} icon="account" />}
                    right={p => (
                      <IconButton 
                        icon={selectedEmployee === emp.id ? "check-circle" : "circle-outline"} 
                        onPress={() => setSelectedEmployee(emp.id)}
                      />
                    )}
                    onPress={() => setSelectedEmployee(emp.id)}
                  />
                ))}
              </ScrollView>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setAssignVisible(false)}>Cancel</Button>
              <Button mode="contained" disabled={!selectedEmployee} onPress={handleAssign}>Assign Now</Button>
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
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  appbar: {
    backgroundColor: '#fff',
    elevation: 4,
  },
  appbarTitle: {
    fontWeight: '800',
    color: '#1A237E',
  },
  actionSurface: {
    margin: 20,
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#fff',
  },
  actionTitle: {
    marginBottom: 16,
    fontWeight: '700',
    color: '#333',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    minWidth: 120,
    borderRadius: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 15,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  statCard: {
    width: (Dimensions.get('window').width - 50) / 2,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderLeftWidth: 4,
  },
  statLabel: {
    color: '#9E9E9E',
    fontSize: 10,
    fontWeight: '700',
  },
  statValue: {
    marginTop: 8,
    fontWeight: '800',
  },
  divider: {
    marginVertical: 20,
    marginHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  itemCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#E3F2FD',
  },
  itemInfo: {
    marginLeft: 12,
  },
  itemActions: {
    alignItems: 'flex-end',
  },
  approveBtn: {
    marginTop: 8,
    borderRadius: 8,
  },
  listItem: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
  }
});