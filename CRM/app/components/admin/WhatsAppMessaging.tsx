import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Surface, Button, TextInput, Avatar, IconButton } from 'react-native-paper';

export default function WhatsAppMessaging({ leads, handleBulkWhatsApp, handleBulkEmail }: any) {
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const filtered = leads.filter((l: any) => l.name.toLowerCase().includes(search.toLowerCase()));

  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((l: any) => l.id));
  };

  const toggleLead = (id: string) => {
    if (selected.includes(id)) setSelected(selected.filter(i => i !== id));
    else setSelected([...selected, id]);
  };

  const executeSend = () => {
    if (channel === 'whatsapp') {
      handleBulkWhatsApp({ message, leadIds: selected });
    } else {
      handleBulkEmail({ subject, message, leadIds: selected });
    }
    setMessage('');
    setSubject('');
    setSelected([]);
  };

  return (
    <View style={{flex: 1}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16}}>
        <View>
          <Text style={{fontSize: 24, fontWeight: '800', color: '#0F172A'}}>Messaging Hub</Text>
          <Text style={{fontSize: 14, color: '#64748B', marginTop: 4}}>Send bulk emails and WhatsApp messages</Text>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <IconButton icon="bell-outline" iconColor="#64748B" style={{backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 16}} />
        </View>
      </View>

      <View style={{flexDirection: 'row', gap: 16, marginBottom: 24}}>
         <Button 
            mode={channel === 'whatsapp' ? "contained" : "outlined"}
            buttonColor={channel === 'whatsapp' ? "#25D366" : "transparent"}
            textColor={channel === 'whatsapp' ? "#FFF" : "#64748B"}
            style={{borderRadius: 24, borderColor: channel === 'whatsapp' ? 'transparent' : '#E2E8F0'}}
            onPress={() => setChannel('whatsapp')}
            icon="whatsapp"
         >
            WhatsApp
         </Button>
         <Button 
            mode={channel === 'email' ? "contained" : "outlined"}
            buttonColor={channel === 'email' ? "#3B82F6" : "transparent"}
            textColor={channel === 'email' ? "#FFF" : "#64748B"}
            style={{borderRadius: 24, borderColor: channel === 'email' ? 'transparent' : '#E2E8F0'}}
            onPress={() => setChannel('email')}
            icon="email"
         >
            Email
         </Button>
      </View>

      <View style={{flexDirection: isDesktop ? 'row' : 'column', gap: 24, flex: 1}}>
        <Surface style={styles.leftPane} elevation={1}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
            <Text style={{fontWeight: '700', color: '#0F172A'}}>Select Leads</Text>
            <Text style={{fontSize: 10, color: '#64748B', fontWeight: '800'}}>{selected.length} SELECTED</Text>
          </View>
          <TextInput 
            mode="outlined" 
            placeholder="Search leads..." 
            value={search}
            onChangeText={setSearch}
            left={<TextInput.Icon icon="magnify" />}
            style={{backgroundColor: '#F8FAFC', marginBottom: 16}}
            outlineColor="#E2E8F0"
          />
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9'}}>
            <IconButton icon={selected.length === filtered.length && filtered.length > 0 ? "checkbox-marked" : "checkbox-blank-outline"} iconColor={selected.length === filtered.length && filtered.length > 0 ? (channel === 'whatsapp' ? "#25D366" : "#3B82F6") : "#CBD5E1"} onPress={toggleAll} style={{margin: 0}} />
            <Text style={{fontWeight: '600', color: '#0F172A', marginLeft: 8}}>Select All</Text>
          </View>
          <ScrollView style={{flex: 1, maxHeight: 400}}>
            {filtered.map((l: any, i: number) => (
              <View key={l.id} style={{flexDirection: 'row', alignItems: 'center', marginVertical: 8}}>
                <IconButton icon={selected.includes(l.id) ? "checkbox-marked" : "checkbox-blank-outline"} iconColor={selected.includes(l.id) ? (channel === 'whatsapp' ? "#25D366" : "#3B82F6") : "#CBD5E1"} onPress={() => toggleLead(l.id)} style={{margin: 0}} />
                <Avatar.Text size={36} label={l.name.substring(0,2).toUpperCase()} style={{backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'][i%4], marginLeft: 8}} />
                <View style={{marginLeft: 12}}>
                  <Text style={{fontWeight: '700', color: '#0F172A'}}>{l.name}</Text>
                  <Text style={{fontSize: 10, color: '#64748B'}}>{channel === 'whatsapp' ? l.phone : (l.email || 'N/A')}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </Surface>

        <View style={{flex: 2, gap: 24}}>
           <Surface style={styles.rightPaneTop} elevation={1}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
                 <IconButton icon="file-document-outline" size={20} style={{margin: 0}} iconColor={channel === 'whatsapp' ? "#25D366" : "#3B82F6"} />
                 <Text style={{fontWeight: '700', color: '#0F172A', marginLeft: 8}}>Message Templates</Text>
              </View>
              <View style={{flexDirection: 'row', gap: 16}}>
                 <TouchableOpacity style={styles.templateCard} onPress={() => setMessage("Hello {name}! Thank you for your inquiry. Our team has received your information and will contact you shortly...")}>
                    <Text style={styles.templateTitle}>WELCOME MESSAGE</Text>
                    <Text style={styles.templateBody}>Hello {'{name}'}! Thank you for your inquiry. Our team has received your information and will contact you shortly...</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.templateCard} onPress={() => setMessage("Hi {name}, this is a gentle reminder regarding your application. Please let us know if you need any assistance...")}>
                    <Text style={styles.templateTitle}>FOLLOW-UP REMINDER</Text>
                    <Text style={styles.templateBody}>Hi {'{name}'}, this is a gentle reminder regarding your application. Please let us know if you need any assistance...</Text>
                 </TouchableOpacity>
              </View>
           </Surface>
           <Surface style={styles.rightPaneBottom} elevation={1}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
                 <IconButton icon={channel === 'email' ? "email-edit-outline" : "message-processing-outline"} size={20} style={{margin: 0}} iconColor={channel === 'whatsapp' ? "#25D366" : "#3B82F6"} />
                 <Text style={{fontWeight: '700', color: '#0F172A', marginLeft: 8}}>Compose {channel === 'whatsapp' ? 'WhatsApp' : 'Email'}</Text>
              </View>
              
              {channel === 'email' && (
                <TextInput 
                   mode="outlined" 
                   label="Subject Line" 
                   value={subject}
                   onChangeText={setSubject}
                   style={{backgroundColor: '#F8FAFC', marginBottom: 12}}
                   outlineColor="#E2E8F0"
                   activeOutlineColor="#3B82F6"
                   textColor="#0F172A"
                />
              )}

              <TextInput 
                 mode="outlined" 
                 label="Message Body"
                 placeholder="Select a template or type your custom message..." 
                 value={message}
                 onChangeText={setMessage}
                 multiline
                 numberOfLines={6}
                 style={{backgroundColor: '#F8FAFC', flex: 1}}
                 outlineColor="#E2E8F0"
                 activeOutlineColor={channel === 'whatsapp' ? "#25D366" : "#3B82F6"}
                 textColor="#0F172A"
              />
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16}}>
                 <Text style={{fontSize: 12, color: '#64748B'}}>{selected.length} recipients targeted</Text>
                 <Button 
                    mode="contained" 
                    buttonColor={selected.length > 0 && message && (channel === 'whatsapp' || subject) ? (channel === 'whatsapp' ? "#25D366" : "#3B82F6") : "#E2E8F0"} 
                    textColor={selected.length > 0 && message && (channel === 'whatsapp' || subject) ? "#FFF" : "#94A3B8"} 
                    onPress={executeSend} 
                    icon="send" 
                    style={{borderRadius: 8}}
                 >
                    SEND {channel === 'whatsapp' ? 'WHATSAPP' : 'EMAIL'}
                 </Button>
              </View>
           </Surface>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  leftPane: { flex: 1, backgroundColor: '#FFF', borderRadius: 24, padding: 24, minWidth: 280 },
  rightPaneTop: { backgroundColor: '#FFF', borderRadius: 24, padding: 24 },
  rightPaneBottom: { flex: 1, backgroundColor: '#FFF', borderRadius: 24, padding: 24 },
  templateCard: { flex: 1, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 16 },
  templateTitle: { fontSize: 10, fontWeight: '800', color: '#64748B', marginBottom: 8, letterSpacing: 0.5 },
  templateBody: { fontSize: 12, color: '#94A3B8', lineHeight: 20 }
});
