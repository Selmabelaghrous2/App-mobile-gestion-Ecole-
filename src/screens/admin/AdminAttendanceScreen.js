import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { getClasses, getStudentsForClass, markAttendance, getAttendanceForDate } from '../../services/api';

const todayIso = () => new Date().toISOString().slice(0, 10);

const AdminAttendanceScreen = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedClassName, setSelectedClassName] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState({}); // { studentId: true/false }
  const [selectedDate, setSelectedDate] = useState(todayIso());

  // Charger les classes au démarrage
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const cls = await getClasses();
        setClasses(cls);
        if (cls && cls.length > 0) {
          setSelectedClassId(cls[0].id);
          setSelectedClassName(cls[0].name);
        }
      } catch (err) {
        console.error(err);
        Alert.alert('Erreur', 'Impossible de charger les classes');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Charger les étudiants et les absences quand la classe ou la date change
  useEffect(() => {
    const loadStudentsAndAttendance = async () => {
      if (!selectedClassId) return;
      setLoading(true);
      try {
        const s = await getStudentsForClass(selectedClassId);
        setStudents(s);
        const existing = await getAttendanceForDate(selectedClassId, selectedDate);
        setAttendance(existing || {});
      } catch (err) {
        console.error(err);
        Alert.alert('Erreur', 'Impossible de charger les élèves ou absences');
      } finally {
        setLoading(false);
      }
    };
    loadStudentsAndAttendance();
  }, [selectedClassId, selectedDate]);

  const toggle = (id) => {
    setAttendance((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const save = async () => {
    if (!selectedClassId) return Alert.alert('Classe non sélectionnée');
    setLoading(true);
    try {
      // Convertir les booléens en statuts ('present' ou 'absent')
      const attendanceStatuses = {};
      for (const [studentId, isPresent] of Object.entries(attendance)) {
        attendanceStatuses[studentId] = isPresent ? 'present' : 'absent';
      }
      
      await markAttendance(selectedClassId, selectedDate, attendanceStatuses);
      Alert.alert('Succès', 'Absences enregistrées');
      return true;
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible d\'enregistrer');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changeDate = async (newDate) => {
    // Sauvegarder la date actuelle avant de changer
    if (selectedClassId && Object.keys(attendance).length > 0) {
      const saved = await save();
      if (!saved) {
        Alert.alert('Attention', 'Les absences de cette date n\'ont pas pu être sauvegardées');
        return;
      }
    }
    setSelectedDate(newDate);
  };

  const renderClassChip = (classItem) => (
    <TouchableOpacity
      key={classItem.id}
      style={[styles.classChip, classItem.id === selectedClassId && styles.classChipSelected]}
      onPress={() => {
        setSelectedClassId(classItem.id);
        setSelectedClassName(classItem.name);
      }}
    >
      <Text style={classItem.id === selectedClassId ? styles.classChipTextSelected : styles.classChipText}>
        {classItem.name}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.studentName}>{item.name}</Text>
      <TouchableOpacity
        style={[styles.presenceBtn, attendance[item.id] ? styles.presenceOn : styles.presenceOff]}
        onPress={() => toggle(item.id)}
      >
        <Text style={{ color: attendance[item.id] ? '#fff' : '#2c5aa0' }}>
          {attendance[item.id] ? 'Présent' : 'Absent'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && classes.length === 0) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Gestion des Absences (Admin)</Text>
      
      {/* Sélection de la classe */}
      <View style={styles.row}>
        <Text style={styles.label}>Classe</Text>
        <View style={styles.pickerRow}>
          {classes.map((c) => renderClassChip(c))}
        </View>
      </View>

      {/* Sélection de la date */}
      <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
        <Text style={styles.label}>Date: {selectedDate}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - 1);
              changeDate(newDate.toISOString().slice(0, 10));
            }}
          >
            <Text style={styles.dateBtnText}>← Jour précédent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + 1);
              changeDate(newDate.toISOString().slice(0, 10));
            }}
          >
            <Text style={styles.dateBtnText}>Jour suivant →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Liste des étudiants */}
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(s) => s.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ padding: 12 }}
        />
      )}

      {/* Bouton d'enregistrement */}
      <View style={{ padding: 12 }}>
        <TouchableOpacity style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveText}>✅ Enregistrer les absences</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e8f4fd' },
  title: { fontSize: 20, fontWeight: '800', color: '#2c5aa0', textAlign: 'center', marginTop: 12 },
  label: { fontWeight: '600', color: '#2c5aa0', marginBottom: 8 },
  row: { backgroundColor: '#fff', marginHorizontal: 12, padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  studentName: { fontWeight: '700', color: '#2c5aa0' },
  presenceBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#2c5aa0' },
  presenceOn: { backgroundColor: '#2c5aa0', borderColor: '#2c5aa0' },
  presenceOff: { backgroundColor: '#fff' },
  saveBtn: { backgroundColor: '#28a745', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  pickerRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  classChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#2c5aa0' },
  classChipSelected: { backgroundColor: '#2c5aa0' },
  classChipText: { color: '#2c5aa0', fontWeight: '600' },
  classChipTextSelected: { color: '#fff', fontWeight: '600' },
  dateBtn: { flex: 1, backgroundColor: '#4a90e2', padding: 8, borderRadius: 6, alignItems: 'center' },
  dateBtnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
});

export default AdminAttendanceScreen;
