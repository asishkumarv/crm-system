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
  Button,
  Chip
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
        <ActivityIndicator size="large" color="#0F172A" />
        <Text style={styles.loadingText}>Syncing Workspace...</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <Appbar.Header style={styles.appbar} elevated>
        <Appbar.Content title="Portfolio" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon="logout" onPress={logout} color="#0F172A" />
      </Appbar.Header>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.responsiveWrapper}>
          
          {/* Header Stats */}
          <View style={styles.heroSection}>
            <View style={styles.heroText}>
              <Text variant="headlineMedium" style={styles.heroTitle}>Workplace</Text>
              <Text variant="bodyLarge" style={styles.heroSubtitle}>Track and manage your active lead flow</Text>
            </View>
            
            <View style={styles.statsGrid}>
              <Surface style={styles.statBox} elevation={1}>
                <Text variant="displaySmall" style={styles.statValue}>{leads.length}</Text>
                <Text variant="labelMedium" style={styles.statLabel}>TOTAL LEADS</Text>
              </Surface>
              <Surface style={styles.statBox} elevation={1}>
                <Text variant="displaySmall" style={[styles.statValue, { color: '#0F172A' }]}>
                  {leads.filter(l => l.status === 'contacted').length}
                </Text>
                <Text variant="labelMedium" style={styles.statLabel}>CONTACTED</Text>
              </Surface>
              <Surface style={styles.statBox} elevation={1}>
                <Text variant="displaySmall" style={[styles.statValue, { color: '#10B981' }]}>
                  {leads.filter(l => l.status === 'converted').length}
                </Text>
                <Text variant="labelMedium" style={styles.statLabel}>CONVERTED</Text>
              </Surface>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.listHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>Active Assignments</Text>
            <IconButton icon="filter-variant" size={20} />
          </View>

          {leads.length === 0 ? (
            <Surface style={styles.emptySurface} elevation={1}>
              <IconButton icon="account-off-outline" size={60} iconColor="#E2E8F0" />
              <Text variant="titleMedium" style={styles.emptyTitle}>No leads allocated</Text>
              <Text variant="bodyMedium" style={styles.emptyText}>Pull to refresh or contact your admin for assignments.</Text>
              <Button mode="contained" onPress={onRefresh} style={styles.refreshBtn} buttonColor="#0F172A">Check Again</Button>
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
                      <Text variant="bodySmall" style={styles.leadPhone}>{l.email}</Text>
                      <Text variant="bodySmall" style={styles.leadPhone}>{'Lead Purpose: '+ l.query}</Text>
                      <Text variant="bodySmall" style={styles.leadPhone}>{'Lead Source: '+ l.source}</Text>
                    </View>
                    <Chip style={styles.statusChip} textStyle={styles.statusText}>New</Chip>
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
                      mode="contained" 
                      onPress={() => l.email && Linking.openURL(`mailto:${l.email}`)} 
                      style={[styles.actionBtn, { backgroundColor: '#0F172A' }]}
                      contentStyle={styles.actionBtnContent}
                      textColor="white"
                    >
                      Email
                    </Button>
                  </View>
                </Surface>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        label="Log Interaction"
        onPress={() => console.log('Log Interaction')}
      />
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  appbarTitle: {
    fontWeight: '900',
    color: '#0F172A',
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
    color: '#1E293B',
  },
  heroSubtitle: {
    color: '#64748B',
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
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statValue: {
    fontWeight: '900',
    color: '#1E293B',
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
    backgroundColor: '#E2E8F0',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '800',
    color: '#1E293B',
  },
  leadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  leadCard: {
    flex: 1,
    minWidth: 300,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  leadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#F1F5F9',
  },
  leadInfo: {
    flex: 1,
    marginLeft: 16,
  },
  leadName: {
    fontWeight: '800',
    color: '#1E293B',
  },
  leadPhone: {
    color: '#64748B',
    marginTop: 2,
  },
  statusChip: {
    backgroundColor: '#E0F2FE',
    height: 24,
  },
  statusText: {
    color: '#0369A1',
    fontSize: 10,
    fontWeight: '700',
  },
  cardDivider: {
    marginVertical: 16,
    backgroundColor: '#F1F5F9',
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
  emptySurface: {
    padding: 48,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontWeight: '800',
    color: '#475569',
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
    backgroundColor: '#0F172A',
    borderRadius: 20,
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
    color: '#0F172A',
  }
});