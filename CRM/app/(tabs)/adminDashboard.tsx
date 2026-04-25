import { useEffect, useState } from "react";
import { View, Text, Button, ScrollView } from "react-native";
import API from "../../services/api";

interface Employee {
  id: string;
  name: string;
  status: string;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
}

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    API.get("/admin/employees").then((res: { data: Employee[] }) => setEmployees(res.data));
    API.get("/leads").then((res: { data: Lead[] }) => setLeads(res.data));
  }, []);

  const approve = async (id: string) => {
    await API.put(`/admin/approve/${id}`);
    alert("Approved");
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Admin Dashboard</Text>

      <Text>Employees</Text>
      {employees.map(e => (
        <View key={e.id} style={{ marginBottom: 10 }}>
          <Text>{e.name} - {e.status}</Text>
          {e.status === "pending" && (
            <Button title="Approve" onPress={() => approve(e.id)} />
          )}
        </View>
      ))}

      <Text>Leads</Text>
      {leads.map(l => (
        <View key={l.id}>
          <Text>{l.name} - {l.phone}</Text>
        </View>
      ))}
    </ScrollView>
  );
}