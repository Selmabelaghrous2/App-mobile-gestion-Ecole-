import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { getScheduleForClass, getStudentProfile } from '../../services/api';

const ScheduleViewScreen = ({ navigation }) => {
  const { user, studentProfile } = useContext(AuthContext);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, [studentProfile]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      
      let classId = null;
      
      if (!studentProfile && user) {
        // Try to load student profile if not already loaded
        try {
          const profile = await getStudentProfile(user.uid);
          if (profile) {
            classId = profile.classId;
          }
        } catch (error) {
          console.error('Error loading student profile:', error);
          Alert.alert('Erreur', 'Impossible de charger votre profil étudiant');
          return;
        }
      } else if (studentProfile) {
        classId = studentProfile.classId;
      } else {
        Alert.alert('Erreur', 'Profil étudiant introuvable');
        return;
      }
      
      if (!classId) {
        Alert.alert('Erreur', 'Classe introuvable');
        return;
      }
      
      const scheduleData = await getScheduleForClass(classId);
      setSchedule(scheduleData);
    } catch (error) {
      console.error('Error loading schedule:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'emploi du temps');
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (day) => {
    const days = {
      'Lundi': 'Lundi',
      'Mardi': 'Mardi',
      'Mercredi': 'Mercredi',
      'Jeudi': 'Jeudi',
      'Vendredi': 'Vendredi',
      'Samedi': 'Samedi',
      'Dimanche': 'Dimanche'
    };
    return days[day] || day;
  };

  const renderScheduleSlot = (day, period) => {
    const slotKey = `${day}|${period}`;
    const slotData = schedule?.slots?.[slotKey];

    return (
      <View key={slotKey} style={styles.slot}>
        <Text style={styles.periodText}>{period}</Text>
        {slotData ? (
          <View style={styles.classInfo}>
            <Text style={styles.subjectText}>{slotData.subject}</Text>
            <Text style={styles.teacherText}>{slotData.teacher}</Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>-</Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c5aa0" />
        <Text style={styles.loadingText}>Chargement de l'emploi du temps...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📅 Mon Emploi du Temps</Text>

      {schedule?.days?.map((day) => (
        <View key={day} style={styles.dayContainer}>
          <Text style={styles.dayTitle}>{getDayName(day)}</Text>
          <View style={styles.daySchedule}>
            {schedule?.periods?.map((period) => renderScheduleSlot(day, period))}
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.refreshButton} onPress={loadSchedule}>
        <Text style={styles.refreshButtonText}>Actualiser</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Retour</Text>
      </TouchableOpacity>
    </ScrollView>
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
  dayContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 10,
  },
  daySchedule: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  slot: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    marginRight: '2%',
    alignItems: 'center',
  },
  periodText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 5,
  },
  classInfo: {
    alignItems: 'center',
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c5aa0',
  },
  teacherText: {
    fontSize: 12,
    color: '#7b8fa1',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#ccc',
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

export default ScheduleViewScreen;