import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, useWindowDimensions, TouchableOpacity } from "react-native";
import { Text, Avatar, ActivityIndicator, IconButton, Appbar, Portal, Dialog, TextInput, Button, Menu, Divider, List } from "react-native-paper";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

import EmployeeDashboardOverview from "../components/employee/EmployeeDashboardOverview";
import EmployeeLeadsView from "../components/employee/EmployeeLeadsView";
import EmployeeSettingsView from "../components/employee/EmployeeSettingsView";

export default function EmployeeDashboard() {
  const { logout, user, isLoading } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const [viewMode, setViewMode] = useState<'dashboard' | 'leads' | 'settings'>('dashboard');
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  // Interaction Dialog
  const [interactionVisible, setInteractionVisible] = useState(false);
  const [activeLead, setActiveLead] = useState<any | null>(null);
  const [pendingStatus, setPendingStatus] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Add Lead Dialog
  const [addLeadVisible, setAddLeadVisible] = useState(false);
  const [newLead, setNewLead] = useState({ name: "", phone: "", email: "", source: "Employee Added", query: "" });

  const fetchData = async () => {
    const userId = user?.id || user?.userId;
    if (!userId) return;
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

  const handleAddLead = async () => {
    if (!newLead.name || !newLead.phone) return alert("Name and phone are required.");
    try {
      // In a real scenario, the backend /leads endpoint needs to handle employee-assigned creation automatically or explicitly.
      // But we will use the existing /leads endpoint since it just inserts it. 
      // If we want it auto-assigned to this employee, we should pass assigned_to: user?.id || user?.userId. Let's do that.
      await API.post("/leads", { ...newLead, assigned_to: user?.id || user?.userId });
      alert("Lead added successfully!");
      setAddLeadVisible(false);
      setNewLead({ name: "", phone: "", email: "", source: "Employee Added", query: "" });
      fetchData();
    } catch(err) {
      alert("Failed to add lead.");
    }
  };

  const openInteractionDialog = (lead: any, status: string) => {
    setActiveLead(lead);
    setPendingStatus(status);
    setNote("");
    setInteractionVisible(true);
  };

  const handleLogInteraction = async () => {
    if (!activeLead || note.length < 5) return;
    setSubmitting(true);
    try {
      await API.put(`/leads/${activeLead.id}/status`, {
        employeeId: user?.id || user?.userId,
        status: pendingStatus,
        note: note
      });
      setInteractionVisible(false);
      fetchData();
    } catch (err) {
      alert("Failed to save interaction. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Initializing Workspace...</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      {!isDesktop && (
        <Appbar.Header style={styles.appbar} elevated>
          <Menu
            visible={mobileMenuVisible}
            onDismiss={() => setMobileMenuVisible(false)}
            anchor={<Appbar.Action icon="menu" onPress={() => setMobileMenuVisible(true)} color="#3B82F6" />}
          >
            <Menu.Item onPress={() => { setViewMode('dashboard'); setMobileMenuVisible(false); }} title="Dashboard" leadingIcon="view-dashboard-outline" />
            <Menu.Item onPress={() => { setViewMode('leads'); setMobileMenuVisible(false); }} title="My Leads" leadingIcon="account-multiple-outline" />
            <Divider />
            <Menu.Item onPress={() => { setViewMode('settings'); setMobileMenuVisible(false); }} title="Settings" leadingIcon="cog-outline" />
            <Menu.Item onPress={logout} title="Sign Out" leadingIcon="logout" />
          </Menu>
          <Appbar.Content title="Agent Portal" titleStyle={styles.appbarTitle} />
        </Appbar.Header>
      )}

      <View style={styles.layoutContainer}>
        {isDesktop && (
          <View style={styles.sidebar}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingHorizontal: 8}}>
              <Avatar.Icon size={40} icon="earth" style={{backgroundColor: '#3B82F6', marginRight: 12}} color="#FFF" />
              <View>
                <Text style={{color: '#0F172A', fontSize: 20, fontWeight: '900', letterSpacing: 0.5}}>CRM</Text>
                <Text style={{color: '#64748B', fontSize: 10, fontWeight: '600'}}>Agent Portal</Text>
              </View>
            </View>

            <TouchableOpacity style={viewMode === 'dashboard' ? styles.sidebarItemActive : styles.sidebarItem} onPress={() => setViewMode('dashboard')}>
              <List.Icon icon="view-dashboard-outline" color={viewMode === 'dashboard' ? "#FFF" : "#64748B"} style={{margin: 0, marginRight: 12}} />
              <Text style={viewMode === 'dashboard' ? styles.sidebarItemTextActive : styles.sidebarItemText}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity style={viewMode === 'leads' ? styles.sidebarItemActive : styles.sidebarItem} onPress={() => setViewMode('leads')}>
              <List.Icon icon="account-multiple-outline" color={viewMode === 'leads' ? "#FFF" : "#64748B"} style={{margin: 0, marginRight: 12}} />
              <Text style={viewMode === 'leads' ? styles.sidebarItemTextActive : styles.sidebarItemText}>My Leads</Text>
            </TouchableOpacity>

            <TouchableOpacity style={viewMode === 'settings' ? styles.sidebarItemActive : styles.sidebarItem} onPress={() => setViewMode('settings')}>
              <List.Icon icon="cog" color={viewMode === 'settings' ? "#FFF" : "#64748B"} style={{margin: 0, marginRight: 12}} />
              <Text style={viewMode === 'settings' ? styles.sidebarItemTextActive : styles.sidebarItemText}>Settings</Text>
            </TouchableOpacity>

            <View style={{ flex: 1 }} />
            
            <TouchableOpacity style={styles.sidebarItem} onPress={logout}>
              <List.Icon icon="logout" color="#EF4444" style={{margin: 0, marginRight: 12}} />
              <Text style={[styles.sidebarItemText, {color: '#EF4444'}]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.contentArea}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {viewMode === 'dashboard' && <EmployeeDashboardOverview leads={leads} user={user} />}
            {viewMode === 'leads' && <EmployeeLeadsView leads={leads} openInteractionDialog={openInteractionDialog} setAddLeadVisible={setAddLeadVisible} />}
            {viewMode === 'settings' && <EmployeeSettingsView />}
          </ScrollView>
        </View>
      </View>

      <Portal>
        <Dialog 
          visible={interactionVisible} 
          onDismiss={() => !submitting && setInteractionVisible(false)} 
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Activity Journal</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Interaction Evidence"
              placeholder="Provide a brief summary of the conversation..."
              value={note}
              onChangeText={setNote}
              mode="outlined"
              multiline
              numberOfLines={4}
              outlineColor="#CBD5E1"
              activeOutlineColor="#3B82F6"
              textColor="#0F172A"
              style={{ backgroundColor: '#FFF' }}
            />
            <Text style={{fontSize: 10, color: note.length < 5 ? '#EF4444' : '#64748B', marginTop: 8}}>
              {note.length} / 5 characters minimum
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setInteractionVisible(false)} disabled={submitting}>Cancel</Button>
            <Button mode="contained" buttonColor="#3B82F6" onPress={handleLogInteraction} loading={submitting} disabled={submitting || note.length < 5}>Save Progress</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={addLeadVisible} onDismiss={() => setAddLeadVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Add New Lead</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Full Name *" value={newLead.name} onChangeText={(t) => setNewLead({...newLead, name: t})} mode="outlined" style={{marginBottom: 12, backgroundColor: '#FFF'}} outlineColor="#E2E8F0" activeOutlineColor="#3B82F6" textColor="#0F172A" />
            <TextInput label="Phone Number *" value={newLead.phone} onChangeText={(t) => setNewLead({...newLead, phone: t})} keyboardType="phone-pad" mode="outlined" style={{marginBottom: 12, backgroundColor: '#FFF'}} outlineColor="#E2E8F0" activeOutlineColor="#3B82F6" textColor="#0F172A" />
            <TextInput label="Email Address" value={newLead.email} onChangeText={(t) => setNewLead({...newLead, email: t})} keyboardType="email-address" mode="outlined" style={{marginBottom: 12, backgroundColor: '#FFF'}} outlineColor="#E2E8F0" activeOutlineColor="#3B82F6" textColor="#0F172A" />
            <TextInput label="Purpose / Query" value={newLead.query} onChangeText={(t) => setNewLead({...newLead, query: t})} mode="outlined" multiline numberOfLines={3} style={{backgroundColor: '#FFF'}} outlineColor="#E2E8F0" activeOutlineColor="#3B82F6" textColor="#0F172A" />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddLeadVisible(false)} textColor="#64748B">Cancel</Button>
            <Button mode="contained" onPress={handleAddLead} buttonColor="#3B82F6" style={{borderRadius: 8}}>Add Lead</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#64748B', fontWeight: '600' },
  outerContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  appbar: { backgroundColor: '#FFF', elevation: 2 },
  appbarTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  layoutContainer: { flex: 1, flexDirection: 'row' },
  sidebar: { width: 260, backgroundColor: '#FFF', borderRightWidth: 1, borderRightColor: '#E2E8F0', paddingVertical: 24, paddingHorizontal: 16 },
  sidebarItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8 },
  sidebarItemActive: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, backgroundColor: '#3B82F6' },
  sidebarItemText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  sidebarItemTextActive: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  contentArea: { flex: 1 },
  scrollContent: { padding: 24 },
  dialog: { backgroundColor: '#FFF', borderRadius: 16, width: '90%', maxWidth: 500, alignSelf: 'center' },
  dialogTitle: { color: '#0F172A', fontWeight: '800' }
});