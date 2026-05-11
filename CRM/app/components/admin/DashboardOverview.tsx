import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Surface, IconButton } from 'react-native-paper';

export default function DashboardOverview({ leads, employees, openDownloadModal }: any) {
  
  // Calculate stats
  const today = new Date();
  const todayStr = today.toDateString();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const todaysLeads = leads.filter((l: any) => new Date(l.created_at).toDateString() === todayStr).length;
  const thisWeekLeads = leads.filter((l: any) => new Date(l.created_at) >= lastWeek).length;
  const convertedLeads = employees.reduce((acc: any, curr: any) => acc + (Number(curr.converted_count) || 0), 0);

  // Group by Source
  const sourceCount: Record<string, number> = {};
  leads.forEach((l: any) => {
    const s = l.source ? l.source.toLowerCase() : 'direct';
    sourceCount[s] = (sourceCount[s] || 0) + 1;
  });
  const totalSources = leads.length || 1;
  const getSourceWidth = (key: string) => `${Math.max(5, (sourceCount[key] || 0) / totalSources * 100)}%` as any;

  // Group by Status
  const statusCount: Record<string, number> = {};
  leads.forEach((l: any) => {
    const s = l.status ? l.status.toLowerCase() : 'new';
    statusCount[s] = (statusCount[s] || 0) + 1;
  });
  const getStatusWidth = (key: string) => `${Math.max(5, (statusCount[key] || 0) / totalSources * 100)}%` as any;

  // Top Agents
  const sortedEmployees = [...employees].sort((a, b) => (Number(b.converted_count) || 0) - (Number(a.converted_count) || 0)).slice(0, 5);

  return (
    <View style={{flex: 1}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16}}>
        <View>
          <Text style={{fontSize: 24, fontWeight: '800', color: '#0F172A'}}>Dashboard Overview</Text>
          <Text style={{fontSize: 14, color: '#64748B', marginTop: 4}}>Welcome back! Here's what's happening with your leads.</Text>
        </View>
        <IconButton icon="bell-outline" iconColor="#64748B" style={{backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0'}} />
      </View>
      <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24}}>
        <Surface style={[styles.card, {backgroundColor: '#3B82F6'}]} elevation={2}>
          <View style={styles.cardHeader}>
             <Text style={styles.cardTitle}>TOTAL LEADS</Text>
             <IconButton icon="account-group" size={20} iconColor="#FFF" style={{backgroundColor: 'rgba(255,255,255,0.2)', margin: 0}} />
          </View>
          <Text style={styles.cardValue}>{leads.length}</Text>
          <Text style={styles.cardFooter}>In system database</Text>
        </Surface>
        <Surface style={[styles.card, {backgroundColor: '#0D9488'}]} elevation={2}>
          <View style={styles.cardHeader}>
             <Text style={styles.cardTitle}>TODAY'S LEADS</Text>
             <IconButton icon="account-plus" size={20} iconColor="#FFF" style={{backgroundColor: 'rgba(255,255,255,0.2)', margin: 0}} />
          </View>
          <Text style={styles.cardValue}>{todaysLeads}</Text>
          <Text style={styles.cardFooter}>New additions today</Text>
        </Surface>
        <Surface style={[styles.card, {backgroundColor: '#F59E0B'}]} elevation={2}>
          <View style={styles.cardHeader}>
             <Text style={styles.cardTitle}>THIS WEEK</Text>
             <IconButton icon="trending-up" size={20} iconColor="#FFF" style={{backgroundColor: 'rgba(255,255,255,0.2)', margin: 0}} />
          </View>
          <Text style={styles.cardValue}>{thisWeekLeads}</Text>
          <Text style={styles.cardFooter}>Rolling 7 days</Text>
        </Surface>
        <Surface style={[styles.card, {backgroundColor: '#10B981'}]} elevation={2}>
          <View style={styles.cardHeader}>
             <Text style={styles.cardTitle}>CONVERTED</Text>
             <IconButton icon="check-circle-outline" size={20} iconColor="#FFF" style={{backgroundColor: 'rgba(255,255,255,0.2)', margin: 0}} />
          </View>
          <Text style={styles.cardValue}>{convertedLeads}</Text>
          <Text style={styles.cardFooter}>{((convertedLeads / totalSources) * 100).toFixed(1)}% conversion rate</Text>
        </Surface>
      </View>
      
      <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 16}}>
        <Surface style={styles.chartCard} elevation={1}>
           <Text style={styles.chartTitle}>Leads by Source</Text>
           <View style={{height: 200, justifyContent: 'center'}}>
             <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
               <Text style={{fontSize: 10, color:'#64748B', marginBottom:4}}>INSTAGRAM</Text>
               <Text style={{fontSize: 10, color:'#64748B', marginBottom:4}}>{sourceCount['instagram'] || 0}</Text>
             </View>
             <View style={{height: 8, backgroundColor: '#F59E0B', width: getSourceWidth('instagram'), borderRadius: 4, marginBottom: 12}} />
             
             <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
               <Text style={{fontSize: 10, color:'#64748B', marginBottom:4}}>FACEBOOK</Text>
               <Text style={{fontSize: 10, color:'#64748B', marginBottom:4}}>{sourceCount['facebook'] || 0}</Text>
             </View>
             <View style={{height: 8, backgroundColor: '#3B82F6', width: getSourceWidth('facebook'), borderRadius: 4, marginBottom: 12}} />
             
             <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
               <Text style={{fontSize: 10, color:'#64748B', marginBottom:4}}>LINKEDIN</Text>
               <Text style={{fontSize: 10, color:'#64748B', marginBottom:4}}>{sourceCount['linkedin'] || 0}</Text>
             </View>
             <View style={{height: 8, backgroundColor: '#8B5CF6', width: getSourceWidth('linkedin'), borderRadius: 4, marginBottom: 12}} />
             
             <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
               <Text style={{fontSize: 10, color:'#64748B', marginBottom:4}}>EMPLOYEE ADDED</Text>
               <Text style={{fontSize: 10, color:'#64748B', marginBottom:4}}>{sourceCount['employee added'] || 0}</Text>
             </View>
             <View style={{height: 8, backgroundColor: '#10B981', width: getSourceWidth('employee added'), borderRadius: 4, marginBottom: 12}} />

             <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
               <Text style={{fontSize: 10, color:'#64748B', marginBottom:4}}>ADMIN ADDED</Text>
               <Text style={{fontSize: 10, color:'#64748B', marginBottom:4}}>{sourceCount['admin added'] || 0}</Text>
             </View>
             <View style={{height: 8, backgroundColor: '#0EA5E9', width: getSourceWidth('admin added'), borderRadius: 4, marginBottom: 12}} />
           </View>
        </Surface>
        
        <Surface style={styles.chartCard} elevation={1}>
           <Text style={styles.chartTitle}>Leads by Status</Text>
           <View style={{height: 200, justifyContent: 'center'}}>
             <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
               <Text style={{fontSize: 10, color:'#64748B', marginBottom:4}}>NEW</Text>
               <Text style={{fontSize: 10, color:'#64748B', marginBottom:4}}>{statusCount['new'] || 0}</Text>
             </View>
             <View style={{height: 8, backgroundColor: '#3B82F6', width: getStatusWidth('new'), borderRadius: 4, marginBottom: 16}} />
             
             <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
               <Text style={{fontSize: 10, color:'#64748B', marginBottom:4}}>CONTACTED</Text>
               <Text style={{fontSize: 10, color:'#64748B', marginBottom:4}}>{statusCount['contacted'] || 0}</Text>
             </View>
             <View style={{height: 8, backgroundColor: '#A855F7', width: getStatusWidth('contacted'), borderRadius: 4, marginBottom: 16}} />
             
             <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
               <Text style={{fontSize: 10, color:'#64748B', marginBottom:4}}>INTERESTED</Text>
               <Text style={{fontSize: 10, color:'#64748B', marginBottom:4}}>{statusCount['interested'] || 0}</Text>
             </View>
             <View style={{height: 8, backgroundColor: '#F59E0B', width: getStatusWidth('interested'), borderRadius: 4, marginBottom: 16}} />
             
             <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
               <Text style={{fontSize: 10, color:'#64748B', marginBottom:4}}>CONVERTED</Text>
               <Text style={{fontSize: 10, color:'#64748B', marginBottom:4}}>{statusCount['converted'] || 0}</Text>
             </View>
             <View style={{height: 8, backgroundColor: '#10B981', width: getStatusWidth('converted'), borderRadius: 4, marginBottom: 16}} />
           </View>
        </Surface>
        
        <Surface style={styles.chartCard} elevation={1}>
           <Text style={styles.chartTitle}>Top Agents (Converted)</Text>
           <View style={{height: 200, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: 20}}>
             {sortedEmployees.map((emp, index) => {
               const maxConverted = sortedEmployees[0] ? Number(sortedEmployees[0].converted_count) || 1 : 1;
               const height = Math.max(20, ((Number(emp.converted_count) || 0) / maxConverted) * 140);
               return (
                 <View key={emp.id} style={{alignItems: 'center'}}>
                   <Text style={{fontSize: 10, marginBottom: 4, fontWeight: '700', color: '#0F172A'}}>{emp.converted_count || 0}</Text>
                   <View style={{width: 30, height, backgroundColor: '#2DD4BF', borderRadius: 4}} />
                   <Text style={{fontSize: 10, marginTop: 8}} numberOfLines={1}>{emp.name.substring(0,3).toUpperCase()}</Text>
                 </View>
               );
             })}
             {sortedEmployees.length === 0 && <Text style={{color: '#64748B'}}>No agent data</Text>}
           </View>
        </Surface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 200, borderRadius: 16, padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: '#FFF', fontWeight: '700', fontSize: 12, opacity: 0.9 },
  cardValue: { color: '#FFF', fontSize: 36, fontWeight: '900', marginVertical: 8 },
  cardFooter: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  chartCard: { flex: 1, minWidth: 280, borderRadius: 16, backgroundColor: '#FFF', padding: 20 },
  chartTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 16 }
});
