import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { Surface, Button, TextInput, Avatar, IconButton, Chip, Divider } from 'react-native-paper';

export default function EmployeeLeadsView({ leads, filters, setFilters, openInteractionDialog, setAddLeadVisible }: any) {
  const [search, setSearch] = useState("");

  const filtered = leads.filter((l: any) => l.name.toLowerCase().includes(search.toLowerCase()));

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={{flex: 1}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16}}>
        <View>
          <Text style={{fontSize: 24, fontWeight: '800', color: '#0F172A'}}>My Leads</Text>
          <Text style={{fontSize: 14, color: '#64748B', marginTop: 4}}>Manage your assigned applicants</Text>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <IconButton icon="bell-outline" iconColor="#64748B" style={{backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 16}} />
          <Button mode="contained" buttonColor="#3B82F6" icon="plus" onPress={() => setAddLeadVisible(true)} style={{borderRadius: 8}}>ADD NEW LEAD</Button>
        </View>
      </View>

      <Surface style={styles.listContainer} elevation={1}>
        <View style={styles.filterRow}>
          <TextInput 
            mode="outlined" 
            placeholder="Search your leads..." 
            value={search}
            onChangeText={setSearch}
            left={<TextInput.Icon icon="magnify" />}
            style={{flex: 1, backgroundColor: '#F8FAFC'}}
            outlineColor="#E2E8F0"
          />
        </View>

        <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
          {filtered.map((l: any, i: number) => (
            <Surface key={l.id} style={styles.leadCard} elevation={2}>
              <View style={styles.cardHeader}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Avatar.Text size={48} label={l.name.substring(0, 2).toUpperCase()} style={{backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'][i%4]}} />
                  <View style={{marginLeft: 16}}>
                    <Text style={{fontWeight: '800', color: '#0F172A', fontSize: 16}}>{l.name}</Text>
                    <Text style={{fontSize: 12, color: '#64748B', marginTop: 2}}>{l.query || 'General Query'}</Text>
                  </View>
                </View>
                <Chip 
                  style={[
                    styles.statusChip, 
                    l.status === 'contacted' && { backgroundColor: '#F3E8FF' },
                    l.status === 'converted' && { backgroundColor: '#ECFDF5' }
                  ]}
                  textStyle={[
                    styles.statusText,
                    l.status === 'contacted' && { color: '#8B5CF6' },
                    l.status === 'converted' && { color: '#10B981' }
                  ]}
                >
                  {l.status?.toUpperCase() || 'NEW'}
                </Chip>
              </View>
              
              <Divider style={{marginVertical: 16, backgroundColor: '#F1F5F9'}} />
              
              <View style={{flexDirection: 'row', gap: 12}}>
                <Button icon="phone-outline" mode="outlined" onPress={() => handleCall(l.phone)} style={{flex: 1, borderColor: '#E2E8F0'}} textColor="#0F172A">Call</Button>
                <Button icon="email-outline" mode="outlined" onPress={() => l.email && Linking.openURL(`mailto:${l.email}`)} style={{flex: 1, borderColor: '#E2E8F0'}} textColor="#0F172A">Email</Button>
              </View>

              <View style={{flexDirection: 'row', gap: 12, marginTop: 12}}>
                <Button 
                  icon="account-check-outline" 
                  mode={l.status === 'contacted' ? "contained" : "contained-tonal"}
                  onPress={() => openInteractionDialog(l, 'contacted')} 
                  style={{flex: 1}}
                  buttonColor={l.status === 'contacted' ? '#8B5CF6' : '#F3E8FF'}
                  textColor={l.status === 'contacted' ? '#FFF' : '#8B5CF6'}
                >Contacted</Button>
                <Button 
                  icon="currency-usd" 
                  mode={l.status === 'converted' ? "contained" : "contained-tonal"}
                  onPress={() => openInteractionDialog(l, 'converted')} 
                  style={{flex: 1}}
                  buttonColor={l.status === 'converted' ? '#10B981' : '#ECFDF5'}
                  textColor={l.status === 'converted' ? '#FFF' : '#10B981'}
                >Converted</Button>
              </View>
            </Surface>
          ))}
          {filtered.length === 0 && <Text style={{color: '#64748B', textAlign: 'center', marginTop: 32}}>No leads found matching your criteria.</Text>}
        </ScrollView>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 24 },
  filterRow: { flexDirection: 'row', marginBottom: 24 },
  leadCard: { flex: 1, minWidth: 280, maxWidth: 400, borderRadius: 16, padding: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statusChip: { backgroundColor: '#EFF6FF', alignSelf: 'flex-start' },
  statusText: { color: '#3B82F6', fontSize: 10, fontWeight: '800' }
});
