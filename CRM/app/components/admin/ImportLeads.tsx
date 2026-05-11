import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Surface, Button, IconButton } from 'react-native-paper';

export default function ImportLeads({ handleFileUpload }: any) {
  return (
    <View style={{flex: 1}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16}}>
        <View>
          <Text style={{fontSize: 24, fontWeight: '800', color: '#0F172A'}}>Import Leads</Text>
          <Text style={{fontSize: 14, color: '#64748B', marginTop: 4}}>Choose your data source to begin</Text>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <IconButton icon="bell-outline" iconColor="#64748B" style={{backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 16}} />
          <Button mode="contained" buttonColor="#3B82F6" icon="plus" onPress={() => {}} style={{borderRadius: 8}}>NEW IMPORT</Button>
        </View>
      </View>

      <View style={{flexDirection: 'row', gap: 24, flexWrap: 'wrap'}}>
        {/* Spreadsheet */}
        <Surface style={styles.card} elevation={1}>
          <View style={[styles.iconWrapper, {backgroundColor: '#ECFDF5'}]}>
             <IconButton icon="google-spreadsheet" iconColor="#10B981" size={32} />
          </View>
          <Text style={styles.cardTitle}>Spreadsheet</Text>
          <Text style={styles.cardDesc}>Import bulk leads from your local CSV or XLSX files.</Text>
          <Button mode="outlined" style={styles.outlineBtn} textColor="#0F172A" onPress={() => { (document.getElementById('csv-upload') as any)?.click(); }}>UPLOAD DATA</Button>
          <Button mode="contained" buttonColor="#3B82F6" style={styles.containedBtn}>CONNECT NOW</Button>
        </Surface>

        {/* Facebook Ads */}
        <Surface style={styles.card} elevation={1}>
          <View style={[styles.iconWrapper, {backgroundColor: '#EFF6FF'}]}>
             <IconButton icon="facebook" iconColor="#3B82F6" size={32} />
          </View>
          <Text style={styles.cardTitle}>Facebook Ads</Text>
          <Text style={styles.cardDesc}>Automate lead capture directly from Meta Lead Forms.</Text>
          <Button mode="outlined" style={styles.outlineBtn} textColor="#0F172A">UPLOAD DATA</Button>
          <Button mode="contained" buttonColor="#3B82F6" style={styles.containedBtn}>CONNECT NOW</Button>
        </Surface>

        {/* Instagram */}
        <Surface style={styles.card} elevation={1}>
          <View style={[styles.iconWrapper, {backgroundColor: '#FDF2F8'}]}>
             <IconButton icon="instagram" iconColor="#EC4899" size={32} />
          </View>
          <Text style={styles.cardTitle}>Instagram</Text>
          <Text style={styles.cardDesc}>Connect your business profile to sync IG Story leads.</Text>
          <Button mode="outlined" style={styles.outlineBtn} textColor="#0F172A">UPLOAD DATA</Button>
          <Button mode="contained" buttonColor="#3B82F6" style={styles.containedBtn}>CONNECT NOW</Button>
        </Surface>
      </View>
      {typeof document !== 'undefined' && <input type="file" id="csv-upload" style={{ display: 'none' }} accept=".csv" onChange={handleFileUpload} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 280, backgroundColor: '#FFF', borderRadius: 24, padding: 32, alignItems: 'center' },
  iconWrapper: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  cardDesc: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 24, paddingHorizontal: 16 },
  outlineBtn: { width: '100%', borderColor: '#E2E8F0', borderRadius: 8, marginBottom: 12 },
  containedBtn: { width: '100%', borderRadius: 8 }
});
