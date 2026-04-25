import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Linking } from "react-native";
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
  Button
} from "react-native-paper";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status?: string;
  assignedAt?: string;
}

export default function EmployeeDashboard() {
  const { logout, user, isLoading } = useAuth();
  const theme = useTheme();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00796B" />
        <Text style={styles.loadingText}>Syncing Workspace...</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Employee Dashboard" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon="logout" onPress={logout} color="#00796B" />
      </Appbar.Header>

      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00796B" />
        }
      >
        <View style={[styles.header, { backgroundColor: '#00796B' }]}>
          <View style={styles.headerTop}>
            <View>
              <Text variant="headlineMedium" style={styles.greeting}>My Portfolio</Text>
              <Text variant="bodyMedium" style={styles.subtitle}>Manage and track your active leads</Text>
            </View>
            <Avatar.Icon size={50} icon="account" style={styles.profileAvatar} />
          </View>
        </View>

        <View style={styles.content}>
          <Surface style={styles.overviewCard} elevation={1}>
            <View style={styles.overviewItem}>
              <Text variant="headlineSmall" style={styles.overviewValue}>{leads.length}</Text>
              <Text variant="labelSmall" style={styles.overviewLabel}>ASSIGNED LEADS</Text>
            </View>
            <Divider style={styles.verticalDivider} />
            <View style={styles.overviewItem}>
              <Text variant="headlineSmall" style={[styles.overviewValue, { color: '#00796B' }]}>
                {leads.filter(l => l.status === 'contacted').length}
              </Text>
              <Text variant="labelSmall" style={styles.overviewLabel}>CONTACTED</Text>
            </View>
          </Surface>

          <Text variant="titleMedium" style={styles.listHeader}>Active Assignments</Text>

          {leads.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <IconButton icon="tray" size={40} iconColor="#ccc" />
                <Text variant="bodyLarge" style={styles.emptyText}>No leads assigned to you yet.</Text>
                <Button mode="outlined" onPress={onRefresh} style={{ marginTop: 10 }}>Refresh</Button>
              </Card.Content>
            </Card>
          ) : (
            leads.map((l) => (
              <Card key={l.id} style={styles.leadCard} mode="elevated">
                <Card.Content style={styles.cardContent}>
                  <View style={styles.leadMain}>
                    <Avatar.Text size={40} label={l.name.substring(0, 1)} style={styles.leadAvatar} />
                    <View style={styles.leadInfo}>
                      <Text variant="titleMedium" style={styles.leadName}>{l.name}</Text>
                      <Text variant="bodySmall" style={styles.leadPhone}>{l.phone}</Text>
                    </View>
                  </View>
                  <View style={styles.leadActions}>
                    <IconButton 
                      icon="phone-outline" 
                      mode="contained" 
                      containerColor="#E0F2F1" 
                      iconColor="#00796B"
                      size={20}
                      onPress={() => handleCall(l.phone)} 
                    />
                    <IconButton 
                      icon="email-outline" 
                      mode="contained" 
                      containerColor="#E0F2F1" 
                      iconColor="#00796B"
                      size={20}
                      onPress={() => l.email && Linking.openURL(`mailto:${l.email}`)} 
                    />
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        label="Quick Add"
        onPress={() => console.log('Add lead')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    color: '#00796B',
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
    color: '#00796B',
    fontWeight: '600',
  },
  header: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  profileAvatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -30,
  },
  overviewCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 25,
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewValue: {
    fontWeight: '800',
    color: '#333',
  },
  overviewLabel: {
    color: '#9E9E9E',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  verticalDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#eee',
  },
  listHeader: {
    marginBottom: 15,
    fontWeight: '700',
    color: '#444',
    paddingLeft: 4,
  },
  leadCard: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  leadMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leadAvatar: {
    backgroundColor: '#F5F5F5',
  },
  leadInfo: {
    marginLeft: 15,
  },
  leadName: {
    fontWeight: '600',
  },
  leadPhone: {
    color: '#757575',
    marginTop: 2,
  },
  leadActions: {
    flexDirection: 'row',
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyText: {
    color: '#9E9E9E',
    marginTop: 10,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#00796B',
    borderRadius: 28,
  },
});