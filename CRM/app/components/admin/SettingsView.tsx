import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Surface, Button, TextInput, IconButton } from 'react-native-paper';

export default function SettingsView() {
  const [tab, setTab] = useState('GENERAL');
  
  return (
    <View style={{flex: 1}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
        <View>
          <Text style={{fontSize: 24, fontWeight: '800', color: '#0F172A'}}>Settings</Text>
          <Text style={{fontSize: 14, color: '#64748B', marginTop: 4}}>Manage your CRM settings and team</Text>
        </View>
        <IconButton icon="bell-outline" iconColor="#64748B" style={{backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0'}} />
      </View>

      <View style={{flexDirection: 'row', gap: 16, marginBottom: 32}}>
         {['TEAM', 'INTEGRATIONS', 'NOTIFICATIONS', 'GENERAL'].map(t => (
            <Button 
               key={t}
               mode={tab === t ? "contained" : "outlined"}
               buttonColor={tab === t ? "#3B82F6" : "transparent"}
               textColor={tab === t ? "#FFF" : "#64748B"}
               style={{borderRadius: 24, borderColor: tab === t ? 'transparent' : '#E2E8F0', paddingHorizontal: 12}}
               onPress={() => setTab(t)}
               icon={t === 'TEAM' ? 'account-group' : t === 'INTEGRATIONS' ? 'link' : t === 'NOTIFICATIONS' ? 'bell' : 'earth'}
            >
               {t}
            </Button>
         ))}
      </View>

      {tab === 'GENERAL' && (
         <Surface style={styles.card} elevation={1}>
            <Text style={styles.sectionTitle}>Company Information</Text>
            <Text style={styles.sectionSubtitle}>Update your company details</Text>
            
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 24, marginTop: 24}}>
               <View style={{flex: 1, minWidth: 280}}>
                  <Text style={styles.label}>COMPANY NAME</Text>
                  <TextInput 
                     mode="outlined" 
                     value="Global Visa Consultancy" 
                     style={styles.input}
                     outlineColor="transparent"
                     activeOutlineColor="#3B82F6"
                  />
               </View>
               <View style={{flex: 1, minWidth: 280}}>
                  <Text style={styles.label}>CONTACT EMAIL</Text>
                  <TextInput 
                     mode="outlined" 
                     value="contact@globalvisa.com" 
                     style={styles.input}
                     outlineColor="transparent"
                     activeOutlineColor="#3B82F6"
                  />
               </View>
            </View>

            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 24, marginTop: 24}}>
               <View style={{flex: 1, minWidth: 280}}>
                  <Text style={styles.label}>PHONE NUMBER</Text>
                  <TextInput 
                     mode="outlined" 
                     value="+1 234 567 8900" 
                     style={styles.input}
                     outlineColor="transparent"
                     activeOutlineColor="#3B82F6"
                  />
               </View>
               <View style={{flex: 1, minWidth: 280}}>
                  <Text style={styles.label}>WEBSITE</Text>
                  <TextInput 
                     mode="outlined" 
                     value="https://globalvisa.com" 
                     style={styles.input}
                     outlineColor="transparent"
                     activeOutlineColor="#3B82F6"
                  />
               </View>
            </View>

            <Button mode="contained" icon="check" buttonColor="#0D9488" style={{marginTop: 32, alignSelf: 'flex-start', borderRadius: 8}}>Save Changes</Button>
         </Surface>
      )}

      {tab !== 'GENERAL' && (
         <Surface style={[styles.card, {alignItems: 'center', padding: 48}]} elevation={1}>
            <Text style={{color: '#64748B', fontWeight: '600'}}>This section is currently under development.</Text>
         </Surface>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  sectionSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  label: { fontSize: 10, fontWeight: '800', color: '#64748B', marginBottom: 8, letterSpacing: 1 },
  input: { backgroundColor: '#F8FAFC' }
});
