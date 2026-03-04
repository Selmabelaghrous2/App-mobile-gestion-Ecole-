import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { getClasses } from '../services/api';

const TeacherDashboard = ({ navigation }) => {
  const { logout } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getClasses();
        setClasses(data);
      } catch (err) {
        console.error('Error loading classes', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const renderClass = ({ item }) => (
    <View style={styles.classCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.className}>{item.name}</Text>
        <Text style={styles.classLevel}>{item.level}</Text>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.smallBtn} onPress={() => navigation.navigate('GradeEntry', { classId: item.id, className: item.name })}>
          <Text style={styles.smallBtnText}>Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallBtn} onPress={() => navigation.navigate('ScheduleView', { classId: item.id, className: item.name })}>
          <Text style={styles.smallBtnText}>Emploi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.appHeader}>SchholApp</Text>
      <Text style={styles.title}>Module Enseignant</Text>
      <Text style={styles.welcome}>Bienvenue, Professeur!</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Déconnexion</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Mes classes</Text>
      <View style={styles.topActions}>
        <TouchableOpacity style={styles.primarySmall} onPress={() => navigation.navigate('ClassManagement')}>
          <Text style={styles.primarySmallText}>Gérer les classes</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList data={classes} keyExtractor={(c) => c.id} renderItem={renderClass} ItemSeparatorComponent={() => <View style={{ height: 10 }} />} contentContainerStyle={{ padding: 12 }} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c0c5a', padding: 16 },
  appHeader: { fontSize: 20, fontWeight: '700', color: '#ffffff', textAlign: 'center', marginTop: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#2c5aa0', textAlign: 'center', marginTop: 8 },
  welcome: { textAlign: 'center', color: '#e6eefc', marginBottom: 16 },
  
  sectionTitle: { color: '#fff', fontWeight: '700', marginLeft: 12, marginTop: 10, marginBottom: 8 },
  classCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 0, alignItems: 'center' },
  className: { fontWeight: '800', color: '#2c5aa0' },
  classLevel: { color: '#4a90e2', marginTop: 4 },
  viewLabel: { color: '#2c5aa0', fontWeight: '700' },
  actionRow: { flexDirection: 'row' },
  smallBtn: { backgroundColor: '#e6eef8', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 0, marginLeft: 8 },
  smallBtnText: { color: '#2c5aa0', fontWeight: '700' },
  topActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 8 },
  primarySmall: { backgroundColor: '#2c5aa0', padding: 8, borderRadius: 0 },
  primarySmallText: { color: '#fff', fontWeight: '700' },
  logoutButton: { backgroundColor: '#dc3545', padding: 8, borderRadius: 0, marginTop: 10, marginBottom: 10, alignItems: 'center', alignSelf: 'flex-start' },
  buttonText: { color: '#fff', fontWeight: '700' },
});

export default TeacherDashboard;
