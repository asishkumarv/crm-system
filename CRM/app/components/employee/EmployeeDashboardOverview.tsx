import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Surface, IconButton } from 'react-native-paper';

export default function EmployeeDashboardOverview({ leads, user }: any) {
  const totalAssigned = leads.length;
  const contacted = leads.filter((l: any) => l.status === 'contacted').length;
  const converted = leads.filter((l: any) => l.status === 'converted').length;

  return (
    <View style={{flex: 1}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16}}>
        <View>
          <Text style={{fontSize: 24, fontWeight: '800', color: '#0F172A'}}>My Dashboard</Text>
          <Text style={{fontSize: 14, color: '#64748B', marginTop: 4}}>Welcome back, {user?.name || 'Agent'}! Here's your pipeline.</Text>
        </View>
        <IconButton icon="bell-outline" iconColor="#64748B" style={{backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0'}} />
      </View>
      
      <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24}}>
        <Surface style={[styles.card, {backgroundColor: '#3B82F6'}]} elevation={2}>
          <View style={styles.cardHeader}>
             <Text style={styles.cardTitle}>TOTAL ASSIGNED</Text>
             <IconButton icon="account-group" size={20} iconColor="#FFF" style={{backgroundColor: 'rgba(255,255,255,0.2)', margin: 0}} />
          </View>
          <Text style={styles.cardValue}>{totalAssigned}</Text>
          <Text style={styles.cardFooter}>In your pipeline</Text>
        </Surface>

        <Surface style={[styles.card, {backgroundColor: '#8B5CF6'}]} elevation={2}>
          <View style={styles.cardHeader}>
             <Text style={styles.cardTitle}>CONTACTED</Text>
             <IconButton icon="phone-in-talk" size={20} iconColor="#FFF" style={{backgroundColor: 'rgba(255,255,255,0.2)', margin: 0}} />
          </View>
          <Text style={styles.cardValue}>{contacted}</Text>
          <Text style={styles.cardFooter}>Actively engaged</Text>
        </Surface>

        <Surface style={[styles.card, {backgroundColor: '#10B981'}]} elevation={2}>
          <View style={styles.cardHeader}>
             <Text style={styles.cardTitle}>CONVERTED</Text>
             <IconButton icon="check-circle-outline" size={20} iconColor="#FFF" style={{backgroundColor: 'rgba(255,255,255,0.2)', margin: 0}} />
          </View>
          <Text style={styles.cardValue}>{converted}</Text>
          <Text style={styles.cardFooter}>{totalAssigned > 0 ? ((converted / totalAssigned) * 100).toFixed(1) : '0'}% success rate</Text>
        </Surface>
      </View>

      <Surface style={styles.chartCard} elevation={1}>
         <Text style={styles.chartTitle}>Recent Activity</Text>
         {leads.slice(0, 5).map((l: any, i: number) => (
           <View key={l.id} style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: i === 4 ? 0 : 1, borderBottomColor: '#F1F5F9'}}>
             <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: l.status === 'converted' ? '#10B981' : l.status === 'contacted' ? '#8B5CF6' : '#3B82F6', marginRight: 16}} />
             <View style={{flex: 1}}>
               <Text style={{fontWeight: '700', color: '#0F172A'}}>{l.name}</Text>
               <Text style={{fontSize: 12, color: '#64748B'}}>Current Status: {(l.status || 'New').toUpperCase()}</Text>
             </View>
             <Text style={{fontSize: 10, color: '#94A3B8', fontWeight: '800'}}>{l.source || 'Direct'}</Text>
           </View>
         ))}
         {leads.length === 0 && <Text style={{color: '#64748B', marginTop: 16}}>No recent activity found.</Text>}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 200, borderRadius: 16, padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: '#FFF', fontWeight: '700', fontSize: 12, opacity: 0.9 },
  cardValue: { color: '#FFF', fontSize: 36, fontWeight: '900', marginVertical: 8 },
  cardFooter: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  chartCard: { minWidth: 280, borderRadius: 16, backgroundColor: '#FFF', padding: 20 },
  chartTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 16 }
});
