import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import API from "../../services/api";

interface Lead {
  id: string;
  name: string;
  phone: string;
}

export default function EmployeeDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    API.get(`/employee/my-leads/${userId}`)
      .then((res: { data: Lead[] }) => setLeads(res.data));
  }, []);

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>My Leads</Text>

      {leads.map(l => (
        <View key={l.id}>
          <Text>{l.name} - {l.phone}</Text>
        </View>
      ))}
    </ScrollView>
  );
}