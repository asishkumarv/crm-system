import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity } from "react-native";
import { Text, Card, Avatar, Button, TextInput, Appbar, Surface, Divider, IconButton, Portal, Dialog, ActivityIndicator, Chip } from "react-native-paper";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

interface EmpProfile { name: string; email: string; phone?: string; department?: string; createdAt?: string; }

export default function EmployeeProfilePage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<EmpProfile>({ name: "", email: user?.email || "", phone: "", department: "" });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogMsg, setDialogMsg] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogSuccess, setDialogSuccess] = useState(false);
  const [changePwVisible, setChangePwVisible] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const showDialog = (msg: string, success = false) => { setDialogMsg(msg); setDialogSuccess(success); setDialogVisible(true); };

  const fetchProfile = async () => {
    setLoading(true);
    const userId = user?.id || user?.userId;
    try {
      const res = await API.get(`/employee/profile/${userId}`);
      setProfile(res.data);
    } catch {
      setProfile({ name: user?.name || "Employee", email: user?.email || "" });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async () => {
    if (!profile.name) { showDialog("Name is required."); return; }
    const userId = user?.id || user?.userId;
    setSaving(true);
    try {
      await API.put(`/employee/profile/${userId}`, { name: profile.name, phone: profile.phone, department: profile.department });
      showDialog("Profile updated successfully!", true);
      setEditMode(false);
    } catch (err: any) { showDialog(err.response?.data?.message || "Failed to update profile."); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) { showDialog("All fields are required."); return; }
    if (newPw.length < 6) { showDialog("New password must be at least 6 characters."); return; }
    if (newPw !== confirmPw) { showDialog("Passwords do not match."); return; }
    const userId = user?.id || user?.userId;
    setPwLoading(true);
    try {
      await API.put(`/employee/change-password/${userId}`, { currentPassword: currentPw, newPassword: newPw });
      showDialog("Password changed successfully!", true);
      setChangePwVisible(false); setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: any) { showDialog(err.response?.data?.message || "Failed to change password."); }
    finally { setPwLoading(false); }
  };

  const getInitials = (name: string) => name ? name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "EM";

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#00796B" />
      <Text style={styles.loadingText}>Loading Profile...</Text>
    </View>
  );

  return (
    <View style={styles.outerContainer}>
      <Appbar.Header style={styles.appbar} elevated>
        <Appbar.BackAction onPress={() => router.back()} color="#00796B" />
        <Appbar.Content title="My Profile" titleStyle={styles.appbarTitle} />
        {!editMode
          ? <Appbar.Action icon="pencil-outline" onPress={() => setEditMode(true)} color="#00796B" />
          : <Appbar.Action icon="close" onPress={() => { setEditMode(false); fetchProfile(); }} color="#D32F2F" />
        }
      </Appbar.Header>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.wrapper}>

          <Surface style={styles.heroBanner} elevation={2}>
            <View style={styles.bannerBg} />
            <View style={styles.bannerContent}>
              <Avatar.Text size={88} label={getInitials(profile.name)} style={styles.avatar} labelStyle={{ fontWeight: "900", fontSize: 28 }} />
              <View style={styles.heroInfo}>
                <Text variant="headlineSmall" style={styles.heroName}>{profile.name || "Employee"}</Text>
                <Text variant="bodyMedium" style={styles.heroEmail}>{profile.email}</Text>
                <Chip icon="account-tie" style={styles.roleChip} textStyle={styles.roleChipText}>Employee</Chip>
              </View>
            </View>
          </Surface>

          <View style={styles.statsRow}>
            <Surface style={styles.statBox} elevation={1}>
              <Text style={styles.statIcon}>🏷️</Text>
              <Text style={styles.statValue}>{profile.department || "—"}</Text>
              <Text style={styles.statLabel}>Department</Text>
            </Surface>
            <Surface style={styles.statBox} elevation={1}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statValue}>{profile.createdAt ? new Date(profile.createdAt).getFullYear().toString() : "—"}</Text>
              <Text style={styles.statLabel}>Joined</Text>
            </Surface>
          </View>

          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text variant="titleMedium" style={styles.cardTitle}>Personal Information</Text>
                {editMode && <Chip icon="pencil" style={styles.editingChip} textStyle={styles.editingChipText}>Editing</Chip>}
              </View>
              <Divider style={styles.divider} />
              <TextInput label="Full Name" value={profile.name} onChangeText={t => setProfile({ ...profile, name: t })} mode="outlined" editable={editMode} left={<TextInput.Icon icon="account-outline" />} style={styles.fieldInput} outlineColor={editMode ? "#00796B" : "#E2E8F0"} activeOutlineColor="#00796B" textColor="#000" />
              <TextInput label="Email Address" value={profile.email} mode="outlined" editable={false} left={<TextInput.Icon icon="email-outline" />} style={[styles.fieldInput, styles.readOnlyField]} outlineColor="#E2E8F0" textColor="#94A3B8" />
              <TextInput label="Phone Number" value={profile.phone || ""} onChangeText={t => setProfile({ ...profile, phone: t })} mode="outlined" editable={editMode} keyboardType="phone-pad" left={<TextInput.Icon icon="phone-outline" />} style={styles.fieldInput} outlineColor={editMode ? "#00796B" : "#E2E8F0"} activeOutlineColor="#00796B" textColor="#000" />
              <TextInput label="Department" value={profile.department || ""} onChangeText={t => setProfile({ ...profile, department: t })} mode="outlined" editable={editMode} left={<TextInput.Icon icon="briefcase-outline" />} style={styles.fieldInput} outlineColor={editMode ? "#00796B" : "#E2E8F0"} activeOutlineColor="#00796B" textColor="#000" />
              {editMode && (
                <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} style={styles.saveBtn} buttonColor="#00796B" textColor="white" labelStyle={{ fontWeight: "700" }} icon="content-save-outline">Save Changes</Button>
              )}
            </Card.Content>
          </Card>

          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>Security</Text>
              <Divider style={styles.divider} />
              <TouchableOpacity style={styles.securityRow} onPress={() => setChangePwVisible(true)}>
                <View style={styles.securityRowLeft}>
                  <IconButton icon="lock-outline" iconColor="#00796B" size={22} style={styles.secIcon} />
                  <View>
                    <Text style={styles.secTitle}>Change Password</Text>
                    <Text style={styles.secSubtitle}>Update your account password</Text>
                  </View>
                </View>
                <IconButton icon="chevron-right" iconColor="#94A3B8" size={20} />
              </TouchableOpacity>
            </Card.Content>
          </Card>

          <Button mode="outlined" onPress={logout} style={styles.logoutBtn} textColor="#D32F2F" icon="logout">Sign Out</Button>
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={changePwVisible} onDismiss={() => setChangePwVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Change Password</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Current Password" value={currentPw} onChangeText={setCurrentPw} secureTextEntry mode="outlined" style={styles.dialogInput} textColor="#000" left={<TextInput.Icon icon="lock-outline" />} />
            <TextInput label="New Password" value={newPw} onChangeText={setNewPw} secureTextEntry mode="outlined" style={styles.dialogInput} textColor="#000" left={<TextInput.Icon icon="lock-plus-outline" />} />
            <TextInput label="Confirm New Password" value={confirmPw} onChangeText={setConfirmPw} secureTextEntry mode="outlined" style={styles.dialogInput} textColor="#000" left={<TextInput.Icon icon="lock-check-outline" />} />
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={() => setChangePwVisible(false)} mode="outlined" style={styles.dialogBtn}>Cancel</Button>
            <Button mode="contained" onPress={handleChangePassword} loading={pwLoading} disabled={pwLoading} buttonColor="#00796B" textColor="white" style={[styles.dialogBtn, { flex: 1 }]}>Update</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title style={dialogSuccess ? styles.successTitle : styles.errorTitle}>{dialogSuccess ? "✓ Success" : "Notice"}</Dialog.Title>
          <Dialog.Content><Text variant="bodyMedium" style={{ color: "#444" }}>{dialogMsg}</Text></Dialog.Content>
          <Dialog.Actions><Button onPress={() => setDialogVisible(false)} textColor="#00796B">OK</Button></Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: "#F8FAFC" },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  wrapper: { width: "100%", maxWidth: 700, alignSelf: "center", padding: 20, gap: 16 },
  appbar: { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  appbarTitle: { fontWeight: "900", color: "#00796B", letterSpacing: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  loadingText: { marginTop: 16, fontWeight: "600", color: "#00796B" },
  heroBanner: { borderRadius: 24, overflow: "hidden", backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0" },
  bannerBg: { height: 80, backgroundColor: "#00796B", position: "absolute", top: 0, left: 0, right: 0 },
  bannerContent: { flexDirection: "row", alignItems: "flex-end", padding: 20, paddingTop: 44, gap: 16 },
  avatar: { backgroundColor: "#00897B", borderWidth: 4, borderColor: "#fff" },
  heroInfo: { flex: 1, paddingBottom: 4 },
  heroName: { fontWeight: "900", color: "#1E293B" },
  heroEmail: { color: "#64748B", marginTop: 2 },
  roleChip: { alignSelf: "flex-start", marginTop: 8, backgroundColor: "#E0F2F1" },
  roleChipText: { color: "#004D40", fontWeight: "700", fontSize: 12 },
  statsRow: { flexDirection: "row", gap: 12 },
  statBox: { flex: 1, padding: 16, borderRadius: 16, backgroundColor: "#fff", alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statValue: { fontWeight: "800", color: "#1E293B", fontSize: 16, textAlign: "center" },
  statLabel: { color: "#94A3B8", fontSize: 11, fontWeight: "600", marginTop: 2, textAlign: "center" },
  card: { borderRadius: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  cardTitle: { fontWeight: "800", color: "#1E293B" },
  editingChip: { backgroundColor: "#FEF3C7" },
  editingChipText: { color: "#92400E", fontWeight: "700", fontSize: 11 },
  divider: { marginBottom: 20, backgroundColor: "#F1F5F9" },
  fieldInput: { marginBottom: 14, backgroundColor: "#fff" },
  readOnlyField: { backgroundColor: "#F8FAFC" },
  saveBtn: { marginTop: 8, borderRadius: 12, paddingVertical: 4 },
  securityRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, borderRadius: 12 },
  securityRowLeft: { flexDirection: "row", alignItems: "center", gap: 4 },
  secIcon: { backgroundColor: "#E0F2F1", margin: 0 },
  secTitle: { fontWeight: "700", color: "#1E293B", fontSize: 14 },
  secSubtitle: { color: "#94A3B8", fontSize: 12, marginTop: 1 },
  logoutBtn: { borderRadius: 12, borderColor: "#FECACA", borderWidth: 2, paddingVertical: 4, marginTop: 4 },
  dialog: { borderRadius: 20, backgroundColor: "#fff" },
  dialogTitle: { fontWeight: "800", color: "#00796B" },
  dialogInput: { marginBottom: 12, backgroundColor: "#fff" },
  dialogActions: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  dialogBtn: { borderRadius: 12 },
  successTitle: { color: "#1B5E20", fontWeight: "bold" },
  errorTitle: { color: "#D32F2F", fontWeight: "bold" },
});
