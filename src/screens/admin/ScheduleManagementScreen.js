import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { getClasses, getScheduleForClass, saveScheduleForClass } from '../../services/api';

const daysLabels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

const ScheduleManagementScreen = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCell, setEditingCell] = useState(null); // { day, period }
  const [cellSubject, setCellSubject] = useState('');
  const [cellTeacher, setCellTeacher] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const cls = await getClasses();
        setClasses(cls);
        if (cls && cls.length > 0) setSelectedClassId(cls[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;
    const loadSchedule = async () => {
      setLoading(true);
      try {
        const sch = await getScheduleForClass(selectedClassId);
        setSchedule(sch);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSchedule();
  }, [selectedClassId]);

  const handleCellPress = (day, period) => {
    const key = `${day}|${period}`;
    const existing = schedule.slots[key] || { subject: '', teacher: '' };
    setEditingCell({ day, period });
    setCellSubject(existing.subject || '');
    setCellTeacher(existing.teacher || '');
    setEditModalVisible(true);
  };

  const saveCell = async () => {
    const { day, period } = editingCell;
    const key = `${day}|${period}`;
    const newSlots = { ...(schedule.slots || {}) };
    if (cellSubject.trim() === '' && cellTeacher.trim() === '') {
      delete newSlots[key];
    } else {
      newSlots[key] = { subject: cellSubject.trim(), teacher: cellTeacher.trim() };
    }
    const newSchedule = { ...schedule, slots: newSlots };
    setSchedule(newSchedule);
    setEditModalVisible(false);
    setEditingCell(null);
    setCellSubject('');
    setCellTeacher('');
    try {
      await saveScheduleForClass(selectedClassId, newSchedule);
    } catch (err) {
      console.error('Save schedule error', err);
    }
  };

  if (loading || !schedule) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emplois du Temps</Text>
      <Text style={styles.subtitle}>Sélectionnez un niveau / classe</Text>

      <FlatList
        horizontal
        data={classes}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.classChip, item.id === selectedClassId && styles.classChipSelected]}
            onPress={() => setSelectedClassId(item.id)}
          >
            <Text style={item.id === selectedClassId ? styles.classChipTextSelected : styles.classChipText}>{item.name}</Text>
            <Text style={styles.levelText}>{item.level}</Text>
          </TouchableOpacity>
        )}
      />

      <ScrollView horizontal>
        <View>
          <View style={styles.tableHeader}>
            <View style={[styles.cell, styles.headerCell]}>
              <Text style={styles.headerText}>Période</Text>
            </View>
            {schedule.days.map((d) => (
              <View key={d} style={[styles.cell, styles.headerCell]}>
                <Text style={styles.headerText}>{d}</Text>
              </View>
            ))}
          </View>

          {schedule.periods.map((period) => (
            <View key={period} style={styles.row}>
              <View style={[styles.cell, styles.periodCell]}>
                <Text style={styles.periodText}>{period}</Text>
              </View>
              {schedule.days.map((day) => {
                const key = `${day}|${period}`;
                const cell = schedule.slots[key];
                return (
                  <TouchableOpacity key={key} style={styles.cell} onPress={() => handleCellPress(day, period)}>
                    {cell ? (
                      <>
                        <Text style={styles.cellSubject}>{cell.subject}</Text>
                        <Text style={styles.cellTeacher}>{cell.teacher}</Text>
                      </>
                    ) : (
                      <Text style={styles.emptyCell}>—</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Éditer créneau</Text>
            <Text style={styles.modalLabel}>Matière</Text>
            <TextInput style={styles.modalInput} value={cellSubject} onChangeText={setCellSubject} placeholder="Matière" />
            <Text style={styles.modalLabel}>Enseignant</Text>
            <TextInput style={styles.modalInput} value={cellTeacher} onChangeText={setCellTeacher} placeholder="Enseignant" />
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={saveCell}>
                <Text style={styles.primaryButtonText}>Enregistrer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f7fb' },
  title: { fontSize: 22, fontWeight: '800', color: '#2c5aa0', textAlign: 'center', marginTop: 12 },
  subtitle: { textAlign: 'center', color: '#4a90e2', marginBottom: 8 },
  classChip: { padding: 10, backgroundColor: '#fff', borderRadius: 8, marginRight: 8, alignItems: 'center' },
  classChipSelected: { backgroundColor: '#2c5aa0' },
  classChipText: { color: '#2c5aa0', fontWeight: '700' },
  classChipTextSelected: { color: '#fff', fontWeight: '700' },
  levelText: { color: '#7b8fa1', fontSize: 12 },
  tableHeader: { flexDirection: 'row', marginTop: 12 },
  row: { flexDirection: 'row' },
  cell: { width: 140, minHeight: 70, borderWidth: 1, borderColor: '#e2eefb', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  headerCell: { backgroundColor: '#e6f0fb' },
  headerText: { fontWeight: '800', color: '#2c5aa0' },
  periodCell: { backgroundColor: '#f7fbff' },
  periodText: { fontWeight: '700', color: '#2c5aa0' },
  cellSubject: { fontWeight: '700', color: '#1f4b8f' },
  cellTeacher: { color: '#4a90e2', marginTop: 4 },
  emptyCell: { color: '#9fb3d6' },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalCard: { width: '90%', backgroundColor: '#fff', padding: 16, borderRadius: 8 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#2c5aa0', marginBottom: 8 },
  modalLabel: { color: '#4a90e2', marginTop: 8 },
  modalInput: { borderWidth: 1, borderColor: '#e6eef8', borderRadius: 6, padding: 8, marginTop: 6 },
  primaryButton: { backgroundColor: '#2c5aa0', padding: 12, borderRadius: 8, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  cancelButton: { backgroundColor: '#e6eef8', padding: 12, borderRadius: 8, alignItems: 'center', marginLeft: 8 },
  cancelButtonText: { color: '#2c5aa0', fontWeight: '700' },
});

export default ScheduleManagementScreen;
