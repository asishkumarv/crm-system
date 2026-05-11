import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Surface, Button, Avatar, Chip, Card, IconButton } from 'react-native-paper';

export default function EmployeeMatrix({ employees, approve, fetchEmployeeDetails }: any) {
  return (
    <View style={{flex: 1}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
        <View>
          <Text style={{fontSize: 24, fontWeight: '800', color: '#0F172A'}}>Staff Matrix</Text>
          <Text style={{fontSize: 14, color: '#64748B', marginTop: 4}}>Manage team members and performance</Text>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <IconButton icon="bell-outline" iconColor="#64748B" style={{backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 16}} />
          <Chip icon="check-circle" style={styles.countChip} textStyle={{color: '#0EA5E9'}}>{employees.length} Active</Chip>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.itemGrid}>
        {employees.map((e: any, i: number) => (
          <TouchableOpacity key={e.id} onPress={() => fetchEmployeeDetails(e)} style={styles.employeeCardWrapper}>
            <Card style={styles.modernCard} mode="elevated">
              <Card.Content style={styles.modernCardContent}>
                <Avatar.Text size={48} label={e.name ? e.name.substring(0, 2).toUpperCase() : 'A'} style={{backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'][i%4]}} />
                <View style={styles.cardInfo}>
                  <Text style={styles.userName}>{e.name}</Text>
                  <Text style={{fontSize: 10, color: '#64748B'}}>{e.email}</Text>
                  <View style={styles.empStatsRow}>
                    <Text style={{fontSize: 10, color: '#b537f2', fontWeight: '700'}}>Contacted: {e.contacted_count || 0}</Text>
                    <Text style={{fontSize: 10, color: '#00E676', fontWeight: '700'}}>  •  Converted: {e.converted_count || 0}</Text>
                  </View>
                </View>
                <View style={styles.cardAction}>
                  {e.status === "pending" ? (
                    <Button mode="contained" onPress={(evt) => { evt.stopPropagation(); approve(e.id); }} buttonColor="#3B82F6" textColor="#FFFFFF" style={styles.actionButton}>Authorize</Button>
                  ) : (
                    <Chip textStyle={{ color: '#00E676', fontSize: 10, fontWeight: '800' }} style={styles.statusChip}>ONLINE</Chip>
                  )}
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
        {employees.length === 0 && <Text style={{color: '#64748B'}}>No staff members found.</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  countChip: { backgroundColor: 'rgba(14, 165, 233, 0.1)', borderWidth: 1, borderColor: 'rgba(14, 165, 233, 0.3)' },
  itemGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  employeeCardWrapper: { flex: 1, minWidth: 320, maxWidth: 450 },
  modernCard: { borderRadius: 24, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  modernCardContent: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  cardInfo: { flex: 1, marginLeft: 16 },
  userName: { fontWeight: '700', color: '#0F172A', fontSize: 16 },
  empStatsRow: { flexDirection: 'row', marginTop: 8 },
  cardAction: { marginLeft: 12 },
  statusChip: { backgroundColor: '#F0FDF4', borderColor: '#00E676', borderWidth: 1 },
  actionButton: { borderRadius: 8 }
});
