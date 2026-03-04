import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { getStudentAttendance, getStudentProfile } from '../../services/api';

const AttendanceViewScreen = ({ navigation }) => {
  const { user, studentProfile } = useContext(AuthContext);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendanceHistory();
  }, [studentProfile]);

  const loadAttendanceHistory = async () => {
    try {
      setLoading(true);
      
      let absenceDates = [];
      
      if (!studentProfile && user) {
        // Try to load student profile if not already loaded
        try {
          const profile = await getStudentProfile(user.uid);
          if (profile) {
            absenceDates = await getStudentAttendance(profile.studentId);
          }
        } catch (error) {
          console.error('Error loading student profile:', error);
          Alert.alert('Erreur', 'Impossible de charger votre profil étudiant');
          return;
        }
      } else if (studentProfile) {
        absenceDates = await getStudentAttendance(studentProfile.studentId);
      } else {
        Alert.alert('Erreur', 'Profil étudiant introuvable');
        return;
      }

      // Convertir les dates d'absences en objets affichables
      const history = absenceDates.map((dateString) => {
        const date = new Date(dateString);
        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' });
        const formattedDate = date.toLocaleDateString('fr-FR');
        
        return {
          date: dateString,
          dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
          formattedDate,
          status: 'absent'
        };
      }).sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setAttendanceHistory(history);
    } catch (error) {
      console.error('Error loading attendance:', error);
      Alert.alert('Erreur', 'Impossible de charger les absences');
    } finally {
      setLoading(false);
    }
  };

  const renderAttendanceItem = ({ item }) => (
    <View style={styles.attendanceItem}>
      <View style={styles.dateContainer}>
        <Text style={styles.dayText}>{item.dayName}</Text>
        <Text style={styles.dateText}>{item.formattedDate}</Text>
      </View>
      <View style={[styles.statusContainer, { backgroundColor: getStatusColor(item.status) }]}>
        <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
      </View>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return '#28a745';
      case 'absent': return '#dc3545';
      case 'late': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present': return 'Présent';
      case 'absent': return 'Absent';
      case 'late': return 'Retard';
      default: return 'Non marqué';
    }
  };

  const calculateStats = () => {
    const present = attendanceHistory.filter(item => item.status === 'present').length;
    const absent = attendanceHistory.filter(item => item.status === 'absent').length;
    const total = attendanceHistory.length;

    return {
      present,
      absent,
      total,
      rate: total > 0 ? ((present / total) * 100).toFixed(1) : 0
    };
  };

  const stats = calculateStats();
  const hasAttendance = attendanceHistory.length > 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c5aa0" />
        <Text style={styles.loadingText}>Chargement des absences...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={attendanceHistory}
        renderItem={renderAttendanceItem}
        keyExtractor={(item) => item.date}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            <Text style={styles.title}>📊 Mes Absences</Text>

            {!hasAttendance ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Pas d'absences enregistrées</Text>
                <Text style={styles.emptyText}>
                  Vous n'avez pas d'absences enregistrées. Les absences seront affichées ici.
                </Text>
              </View>
            ) : (
              <View>
                {/* Statistics Card */}
                <View style={styles.statsContainer}>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.absent}</Text>
                    <Text style={styles.statLabel}>Absences</Text>
                  </View>
                </View>

                {/* Attendance History */}
                <Text style={styles.sectionTitle}>Dates d'absences</Text>
              </View>
            )}
          </View>
        )}
        ListFooterComponent={() => (
          <View>
            <TouchableOpacity style={styles.refreshButton} onPress={loadAttendanceHistory}>
              <Text style={styles.refreshButtonText}>Actualiser</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>Retour</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f4fd',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f4fd',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2c5aa0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c5aa0',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c5aa0',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c5aa0',
  },
  statLabel: {
    fontSize: 14,
    color: '#7b8fa1',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 15,
  },
  list: {
    flex: 1,
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateContainer: {
    flex: 1,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c5aa0',
  },
  dateText: {
    fontSize: 14,
    color: '#7b8fa1',
    marginTop: 2,
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default AttendanceViewScreen;