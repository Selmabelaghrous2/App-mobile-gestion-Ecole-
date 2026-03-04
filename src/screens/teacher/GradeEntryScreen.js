import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { getClasses, getStudentsForClass, getGradesForClass, saveGradesForClass } from '../../services/api';

const GradeEntryScreen = ({ route }) => {
  const paramClassId = route?.params?.classId;
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(paramClassId || null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [grades, setGrades] = useState({}); // { studentId: grade }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const cls = await getClasses();
        setClasses(cls);
        if (!paramClassId && cls && cls.length > 0) setSelectedClassId(cls[0].id);
      } catch (err) {
        console.error(err);
        Alert.alert('Erreur', 'Impossible de charger les classes');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadStudentsAndGrades = async () => {
      if (!selectedClassId) return;
      setLoading(true);
      try {
        const s = await getStudentsForClass(selectedClassId);
        setStudents(s);
        // prefill subject if class has subjects
        const cls = classes.find((c) => c.id === selectedClassId);
        if (cls && cls.subjects && cls.subjects.length > 0 && !subject) setSubject(cls.subjects[0]);
        if (subject) {
          const saved = await getGradesForClass(selectedClassId, subject);
          setGrades(saved || {});
        } else {
          setGrades({});
        }
      } catch (err) {
        console.error(err);
        Alert.alert('Erreur', 'Impossible de charger les élèves ou notes');
      } finally {
        setLoading(false);
      }
    };
    loadStudentsAndGrades();
  }, [selectedClassId, subject]);

  const handleGradeChange = (studentId, value) => {
    setGrades((prev) => ({ ...prev, [studentId]: value }));
  };

  const save = async () => {
    if (!selectedClassId || !subject) return Alert.alert('Classe ou matière manquante');
    setLoading(true);
    try {
      // normalize numbers or empty
      const normalized = {};
      students.forEach((s) => {
        const raw = grades[s.id];
        if (raw === undefined || raw === null || raw === '') return;
        const num = Number(raw);
        if (!isNaN(num)) normalized[s.id] = num;
      });
      await saveGradesForClass(selectedClassId, subject, normalized);
      Alert.alert('Succès', 'Notes enregistrées');
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible d\'enregistrer les notes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saisie des notes</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Classe</Text>
        <View style={styles.pickerRow}>
          {classes.map((c) => (
            <TouchableOpacity key={c.id} style={[styles.classChip, c.id === selectedClassId && styles.classChipSelected]} onPress={() => setSelectedClassId(c.id)}>
              <Text style={c.id === selectedClassId ? styles.classChipTextSelected : styles.classChipText}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ padding: 12 }}>
        <Text style={styles.label}>Matière</Text>
        <TextInput value={subject} onChangeText={setSubject} placeholder="Matière (ex: Maths)" style={styles.input} />
      </View>

      <FlatList
        data={students}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.studentRow}>
            <Text style={styles.studentName}>{item.name}</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="—"
              style={styles.gradeInput}
              value={grades[item.id] !== undefined ? String(grades[item.id]) : ''}
              onChangeText={(v) => handleGradeChange(item.id, v)}
            />
          </View>
        )}
      />

      <View style={{ padding: 12 }}>
        <TouchableOpacity style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveText}>Enregistrer les notes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f7fb' },
  title: { textAlign: 'center', marginTop: 12, fontSize: 20, fontWeight: '800', color: '#2c5aa0' },
  row: { padding: 12 },
  label: { color: '#4a90e2', marginBottom: 6 },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap' },
  classChip: { padding: 8, backgroundColor: '#fff', borderRadius: 8, marginRight: 8, marginBottom: 8 },
  classChipSelected: { backgroundColor: '#2c5aa0' },
  classChipText: { color: '#2c5aa0', fontWeight: '700' },
  classChipTextSelected: { color: '#fff', fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#e6eefb', borderRadius: 6, padding: 8, backgroundColor: '#fff' },
  studentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', marginBottom: 8, padding: 12, borderRadius: 8 },
  studentName: { fontWeight: '700', color: '#1f4b8f' },
  gradeInput: { width: 80, borderWidth: 1, borderColor: '#e6eefb', borderRadius: 6, padding: 8, textAlign: 'center' },
  saveBtn: { backgroundColor: '#2c5aa0', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },
});

export default GradeEntryScreen;
