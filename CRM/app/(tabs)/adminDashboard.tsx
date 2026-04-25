import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from "react-native";
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
  Appbar
} from "react-native-paper";
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
}

export default function AdminDashboard() {
  const { logout } = useAuth();
  const theme = useTheme();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const approve = async (id: string) => {
    try {
      await API.put(`/admin/approve/${id}`);
      fetchData(); // Refresh data
    } catch (err) {
      alert("Failed to approve employee");
    }
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
        <Appbar.Content title="Admin" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon="logout" onPress={logout} color="#1A237E" />
      </Appbar.Header>

      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.greeting}>Admin Oversight</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>System Management & Lead Control</Text>
        </View>

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

        <View style={styles.statsRow}>
          <Surface style={[styles.statCard, { borderLeftColor: '#00796B' }]} elevation={2}>
            <Text variant="labelMedium" style={styles.statLabel}>TOTAL LEADS</Text>
            <Text variant="headlineSmall" style={styles.statValue}>{leads.length}</Text>
          </Surface>
          <Surface style={[styles.statCard, { borderLeftColor: '#7B1FA2' }]} elevation={2}>
            <Text variant="labelMedium" style={styles.statLabel}>SYSTEM HEALTH</Text>
            <Text variant="headlineSmall" style={[styles.statValue, { color: '#4CAF50' }]}>OPTIMAL</Text>
          </Surface>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.sectionHeader}>
          <IconButton icon="account-group" size={24} iconColor={theme.colors.primary} />
          <Text variant="titleLarge" style={styles.sectionTitle}>Employee Management</Text>
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
                    labelStyle={{ fontSize: 12 }}
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
          <Text variant="titleLarge" style={styles.sectionTitle}>Global Leads</Text>
        </View>

        {leads.map((l) => (
          <List.Item
            key={l.id}
            title={l.name}
            description={`${l.phone} • ${l.source || 'Direct Entry'}`}
            left={props => <List.Icon {...props} icon="account-circle" color="#E91E63" />}
            right={props => <IconButton {...props} icon="chevron-right" />}
            style={styles.listItem}
          />
        ))}
        <View style={{ height: 40 }} />
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
    fontSize: 18,
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
    letterSpacing: 1,
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  greeting: {
    fontWeight: '800',
    color: '#1a1a1a',
  },
  subtitle: {
    color: '#757575',
    marginTop: 4,
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
    color: '#1a1a1a',
  },
  divider: {
    marginVertical: 20,
    marginHorizontal: 20,
    height: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#333',
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
    paddingVertical: 4,
  }
});