import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Surface, Button, TextInput, Avatar, IconButton } from 'react-native-paper';
import { useAuth } from "../../../context/AuthContext";
import API from "../../../services/api";

export default function EmployeeSettingsView() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.id || user?.userId) {
      API.get(`/employee/profile/${user.id || user.userId}`).then(res => {
        setProfile({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || ''
        });
      }).catch(err => console.error(err));
    }
  }, [user]);

  const handleUpdate = async () => {
    try {
      setSaving(true);
      await API.put(`/employee/profile/${user?.id || user?.userId}`, profile);
      alert("Profile updated successfully");
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{flex: 1}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16}}>
        <View>
          <Text style={{fontSize: 24, fontWeight: '800', color: '#0F172A'}}>Settings</Text>
          <Text style={{fontSize: 14, color: '#64748B', marginTop: 4}}>Manage your employee profile</Text>
        </View>
      </View>

      <Surface style={styles.container} elevation={1}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 32}}>
          <Avatar.Icon size={80} icon="account" style={{backgroundColor: '#E0F2FE'}} color="#0EA5E9" />
          <View style={{marginLeft: 24}}>
            <Text style={{fontSize: 20, fontWeight: '800', color: '#0F172A'}}>{profile.name || 'Agent'}</Text>
            <Text style={{fontSize: 14, color: '#64748B'}}>Employee Account</Text>
          </View>
        </View>

        <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 24}}>
          <View style={{flex: 1, minWidth: 280}}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput mode="outlined" value={profile.name} onChangeText={t => setProfile({...profile, name: t})} style={styles.input} outlineColor="#E2E8F0" activeOutlineColor="#3B82F6" textColor="#0F172A" />
          </View>
          <View style={{flex: 1, minWidth: 280}}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput mode="outlined" value={profile.email} onChangeText={t => setProfile({...profile, email: t})} style={styles.input} outlineColor="#E2E8F0" activeOutlineColor="#3B82F6" disabled textColor="#0F172A" />
          </View>
          <View style={{flex: 1, minWidth: 280}}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput mode="outlined" value={profile.phone} onChangeText={t => setProfile({...profile, phone: t})} style={styles.input} outlineColor="#E2E8F0" activeOutlineColor="#3B82F6" textColor="#0F172A" />
          </View>
        </View>

        <Button mode="contained" buttonColor="#3B82F6" onPress={handleUpdate} loading={saving} style={{marginTop: 32, alignSelf: 'flex-start', borderRadius: 8}}>
          SAVE CHANGES
        </Button>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFF', borderRadius: 24, padding: 32 },
  label: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC' }
});
