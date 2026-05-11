import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Surface, Button, TextInput, Avatar, IconButton, Chip } from 'react-native-paper';

export default function LeadsView({ leads, filters, setFilters, setAddLeadVisible, setSelectedLead, setAssignVisible }: any) {
  return (
    <View style={{flex: 1}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
        <View>
          <Text style={{fontSize: 24, fontWeight: '800', color: '#0F172A'}}>Leads</Text>
          <Text style={{fontSize: 14, color: '#64748B', marginTop: 4}}>Efficiently manage and track all applicant records.</Text>
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
            placeholder="Search applicant, country or visa type..." 
            value={filters.name}
            onChangeText={(t: string) => setFilters({...filters, name: t})}
            left={<TextInput.Icon icon="magnify" />}
            style={{flex: 1, backgroundColor: '#F8FAFC'}}
            outlineColor="#E2E8F0"
          />
          <Button mode="outlined" style={{marginLeft: 16, borderColor: '#E2E8F0', justifyContent: 'center', borderRadius: 8}} textColor="#0F172A">ALL STATUS ▼</Button>
        </View>

        <View style={styles.tableHeader}>
           <Text style={[styles.th, {flex: 2}]}>APPLICANT</Text>
           <Text style={[styles.th, {flex: 2}]}>CONTACT CHANNELS</Text>
           <Text style={[styles.th, {flex: 2}]}>PURPOSE / QUERY</Text>
           <Text style={[styles.th, {flex: 1.5}]}>PIPELINE STATUS</Text>
           <Text style={[styles.th, {flex: 0.5, textAlign: 'center'}]}>OPTIONS</Text>
        </View>

        <ScrollView style={{maxHeight: 500}}>
          {leads.map((l: any, i: number) => (
            <View key={l.id} style={[styles.tableRow, i !== leads.length - 1 && {borderBottomWidth: 1, borderBottomColor: '#F1F5F9'}]}>
              <View style={{flex: 2, flexDirection: 'row', alignItems: 'center'}}>
                 <Avatar.Text size={40} label={l.name.substring(0, 2).toUpperCase()} style={{backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'][i%4]}} />
                 <View style={{marginLeft: 12}}>
                    <Text style={{fontWeight: '700', color: '#0F172A'}}>{l.name}</Text>
                    <Text style={{fontSize: 10, color: '#3B82F6', fontWeight: '700', marginTop: 2}}>{l.source?.toUpperCase() || 'DIRECT'}</Text>
                 </View>
              </View>
              <View style={{flex: 2}}>
                 <Text style={{fontWeight: '600', color: '#0F172A'}}>{l.phone}</Text>
                 <Text style={{fontSize: 12, color: '#64748B', marginTop: 2}}>{l.email || 'N/A'}</Text>
              </View>
              <View style={{flex: 2}}>
                 <Text style={{fontWeight: '600', color: '#0F172A'}}>{l.query || 'General Query'}</Text>
                 <Text style={{fontSize: 12, color: '#64748B', marginTop: 2}}>Not specified</Text>
              </View>
              <View style={{flex: 1.5}}>
                 <Chip 
                    style={{backgroundColor: '#F0F9FF', alignSelf: 'flex-start'}}
                    textStyle={{color: '#3B82F6', fontSize: 10, fontWeight: '800'}}
                 >{l.status?.toUpperCase() || 'NEW'}</Chip>
              </View>
              <View style={{flex: 0.5, alignItems: 'center'}}>
                 <IconButton icon="dots-horizontal" iconColor="#CBD5E1" onPress={() => { setSelectedLead(l.id); setAssignVisible(true); }} />
              </View>
            </View>
          ))}
        </ScrollView>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: { backgroundColor: '#FFF', borderRadius: 16, padding: 24 },
  filterRow: { flexDirection: 'row', marginBottom: 24 },
  tableHeader: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 8 },
  th: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }
});
