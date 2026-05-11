import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Surface, Button, TextInput, IconButton, Portal, Dialog, Divider, Chip, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../services/api';

interface AdminProfile {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  createdAt?: string;
}

export default function SettingsView() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('GENERAL');
  
  const [profile, setProfile] = useState<AdminProfile>({ name: "", email: user?.email || "", phone: "", company: "" });
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
    try {
      const res = await API.get("/admin/profile");
      setProfile(res.data);
    } catch {
      setProfile({ name: user?.name || "Admin", email: user?.email || "" });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async () => {
    if (!profile.name) { showDialog("Name is required."); return; }
    setSaving(true);
    try {
      await API.put("/admin/profile", { name: profile.name, phone: profile.phone, company: profile.company });
      showDialog("Profile updated successfully!", true);
    } catch (err: any) { showDialog(err.response?.data?.message || "Failed to update profile."); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) { showDialog("All fields are required."); return; }
    if (newPw.length < 6) { showDialog("New password must be at least 6 characters."); return; }
    if (newPw !== confirmPw) { showDialog("Passwords do not match."); return; }
    setPwLoading(true);
    try {
      await API.put("/admin/change-password", { currentPassword: currentPw, newPassword: newPw });
      showDialog("Password changed successfully!", true);
      setChangePwVisible(false); setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: any) { showDialog(err.response?.data?.message || "Failed to change password."); }
    finally { setPwLoading(false); }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, fontWeight: "600", color: "#64748B" }}>Loading Settings...</Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16}}>
        <View>
          <Text style={{fontSize: 24, fontWeight: '800', color: '#0F172A'}}>Settings</Text>
          <Text style={{fontSize: 14, color: '#64748B', marginTop: 4}}>Manage your CRM settings and profile</Text>
        </View>
        <IconButton icon="bell-outline" iconColor="#64748B" style={{backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0'}} />
      </View>

      <View style={{flexDirection: 'row', gap: 16, marginBottom: 32}}>
         {['GENERAL', 'SECURITY', 'NOTIFICATIONS'].map(t => (
            <Button 
               key={t}
               mode={tab === t ? "contained" : "outlined"}
               buttonColor={tab === t ? "#3B82F6" : "transparent"}
               textColor={tab === t ? "#FFF" : "#64748B"}
               style={{borderRadius: 24, borderColor: tab === t ? 'transparent' : '#E2E8F0', paddingHorizontal: 12}}
               onPress={() => setTab(t)}
               icon={t === 'SECURITY' ? 'shield-lock' : t === 'NOTIFICATIONS' ? 'bell' : 'account-cog'}
            >
               {t}
            </Button>
         ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {tab === 'GENERAL' && (
           <Surface style={styles.card} elevation={1}>
              <Text style={styles.sectionTitle}>Profile Information</Text>
              <Text style={styles.sectionSubtitle}>Update your personal and company details</Text>
              
              <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 24, marginTop: 24}}>
                 <View style={{flex: 1, minWidth: 280}}>
                    <TextInput 
                       label="Full Name"
                       mode="outlined" 
                       value={profile.name} 
                       onChangeText={t => setProfile({...profile, name: t})}
                       style={styles.input}
                       outlineColor="#E2E8F0"
                       activeOutlineColor="#3B82F6"
                       left={<TextInput.Icon icon="account-outline" />}
                       textColor="#0F172A"
                    />
                 </View>
                 <View style={{flex: 1, minWidth: 280}}>
                    <TextInput 
                       label="Email Address"
                       mode="outlined" 
                       value={profile.email} 
                       editable={false}
                       style={[styles.input, {backgroundColor: '#F1F5F9'}]}
                       outlineColor="#E2E8F0"
                       activeOutlineColor="#3B82F6"
                       left={<TextInput.Icon icon="email-outline" />}
                       textColor="#94A3B8"
                    />
                 </View>
              </View>

              <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 24, marginTop: 24}}>
                 <View style={{flex: 1, minWidth: 280}}>
                    <TextInput 
                       label="Phone Number"
                       mode="outlined" 
                       value={profile.phone || ""} 
                       onChangeText={t => setProfile({...profile, phone: t})}
                       style={styles.input}
                       keyboardType="phone-pad"
                       outlineColor="#E2E8F0"
                       activeOutlineColor="#3B82F6"
                       left={<TextInput.Icon icon="phone-outline" />}
                       textColor="#0F172A"
                    />
                 </View>
                 <View style={{flex: 1, minWidth: 280}}>
                    <TextInput 
                       label="Company / Organization"
                       mode="outlined" 
                       value={profile.company || ""} 
                       onChangeText={t => setProfile({...profile, company: t})}
                       style={styles.input}
                       outlineColor="#E2E8F0"
                       activeOutlineColor="#3B82F6"
                       left={<TextInput.Icon icon="office-building-outline" />}
                       textColor="#0F172A"
                    />
                 </View>
              </View>

              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32}}>
                <Button mode="outlined" icon="logout" textColor="#EF4444" style={{borderColor: '#EF4444', borderRadius: 8}} onPress={logout}>Sign Out</Button>
                <Button mode="contained" icon="content-save" buttonColor="#10B981" style={{borderRadius: 8}} onPress={handleSave} loading={saving} disabled={saving}>Save Changes</Button>
              </View>
           </Surface>
        )}

        {tab === 'SECURITY' && (
           <Surface style={styles.card} elevation={1}>
              <Text style={styles.sectionTitle}>Account Security</Text>
              <Text style={styles.sectionSubtitle}>Manage your passwords and access</Text>
              
              <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', marginTop: 16}} onPress={() => setChangePwVisible(true)}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                  <IconButton icon="lock-reset" iconColor="#3B82F6" style={{backgroundColor: '#EFF6FF', margin: 0}} />
                  <View>
                    <Text style={{fontWeight: '700', color: '#0F172A'}}>Change Password</Text>
                    <Text style={{color: '#64748B', fontSize: 12}}>Update your account password</Text>
                  </View>
                </View>
                <IconButton icon="chevron-right" iconColor="#94A3B8" />
              </TouchableOpacity>
           </Surface>
        )}

        {tab === 'NOTIFICATIONS' && (
           <Surface style={[styles.card, {alignItems: 'center', padding: 48}]} elevation={1}>
              <Text style={{color: '#64748B', fontWeight: '600'}}>Notification preferences are under development.</Text>
           </Surface>
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={changePwVisible} onDismiss={() => setChangePwVisible(false)} style={styles.dialog}>
          <Dialog.Title style={{fontWeight: '800', color: '#0F172A', textAlign: 'center'}}>Change Password</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Current Password" value={currentPw} onChangeText={setCurrentPw} secureTextEntry mode="outlined" style={styles.dialogInput} left={<TextInput.Icon icon="lock-outline" />} outlineColor="#E2E8F0" activeOutlineColor="#3B82F6" textColor="#0F172A" />
            <TextInput label="New Password" value={newPw} onChangeText={setNewPw} secureTextEntry mode="outlined" style={styles.dialogInput} left={<TextInput.Icon icon="lock-plus-outline" />} outlineColor="#E2E8F0" activeOutlineColor="#3B82F6" textColor="#0F172A" />
            <TextInput label="Confirm New Password" value={confirmPw} onChangeText={setConfirmPw} secureTextEntry mode="outlined" style={styles.dialogInput} left={<TextInput.Icon icon="lock-check-outline" />} outlineColor="#E2E8F0" activeOutlineColor="#3B82F6" textColor="#0F172A" />
          </Dialog.Content>
          <Dialog.Actions style={{paddingHorizontal: 20, paddingBottom: 16, gap: 12}}>
            <Button onPress={() => setChangePwVisible(false)} textColor="#64748B">Cancel</Button>
            <Button mode="contained" onPress={handleChangePassword} loading={pwLoading} disabled={pwLoading} buttonColor="#3B82F6" style={{borderRadius: 8}}>Update</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title style={{color: dialogSuccess ? "#10B981" : "#EF4444", fontWeight: "800", textAlign: 'center'}}>{dialogSuccess ? "Success" : "Notice"}</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: "#334155", textAlign: 'center' }}>{dialogMsg}</Text>
          </Dialog.Content>
          <Dialog.Actions style={{justifyContent: 'center'}}>
            <Button onPress={() => setDialogVisible(false)} mode="contained" buttonColor={dialogSuccess ? "#10B981" : "#3B82F6"} style={{borderRadius: 8, paddingHorizontal: 16}}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  sectionSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  input: { backgroundColor: '#F8FAFC' },
  dialog: { borderRadius: 24, backgroundColor: '#FFF' },
  dialogInput: { marginBottom: 16, backgroundColor: '#F8FAFC' }
});
