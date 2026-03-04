import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const StudentDashboard = ({ navigation }) => {
  const { logout, studentProfile } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const menuItems = [
    { title: 'Mes Notes', subtitle: 'Consulter et exporter mes notes', screen: 'GradeView' },
    { title: 'Emploi du temps', subtitle: 'Voir mon planning hebdomadaire', screen: 'ScheduleView' },
    { title: 'Mes Absences', subtitle: 'Historique de mes absences', screen: 'AttendanceView' },
  ];

  const studentName = studentProfile?.name || 'Élève';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.appHeader}>SchholApp</Text>
      <Text style={styles.title}>🎓 Module Élève</Text>
      <Text style={styles.welcome}>Bienvenue, {studentName}!</Text>

      {menuItems.map((item, index) => (
        <TouchableOpacity key={index} style={styles.menuItem} onPress={() => navigation.navigate(item.screen)}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          {item.subtitle && <Text style={styles.menuSubtitle}>{item.subtitle}</Text>}
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Déconnexion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12128e',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c5aa0',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 50,
  },
  appHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 6,
  },
  welcome: {
    fontSize: 18,
    color: '#4a90e2',
    textAlign: 'center',
    marginBottom: 30,
  },
  menuItem: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 0,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c5aa0',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#7b8fa1',
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 0,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StudentDashboard;
