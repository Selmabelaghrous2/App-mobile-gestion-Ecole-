import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getScheduleForClass } from '../../services/api';

const ScheduleViewScreen = ({ route }) => {
  const classId = route?.params?.classId;
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!classId) return;
      setLoading(true);
      try {
        const sch = await getScheduleForClass(classId);
        setSchedule(sch);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [classId]);

  if (!classId) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Sélectionnez une classe pour voir l'emploi du temps</Text>
      </View>
    );
  }

  if (loading || !schedule) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <ScrollView style={styles.container} horizontal>
      <View>
        <View style={styles.headerRow}>
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
                <View key={key} style={styles.cell}>
                  {cell ? (
                    <>
                      <Text style={styles.cellSubject}>{cell.subject}</Text>
                      <Text style={styles.cellTeacher}>{cell.teacher}</Text>
                    </>
                  ) : (
                    <Text style={styles.emptyCell}>—</Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f7fb' },
  title: { fontSize: 20, fontWeight: '700', color: '#2c5aa0', textAlign: 'center', marginTop: 12 },
  headerRow: { flexDirection: 'row', marginTop: 12 },
  row: { flexDirection: 'row' },
  cell: { width: 140, minHeight: 70, borderWidth: 1, borderColor: '#e2eefb', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  headerCell: { backgroundColor: '#e6f0fb' },
  headerText: { fontWeight: '800', color: '#2c5aa0' },
  periodCell: { backgroundColor: '#f7fbff' },
  periodText: { fontWeight: '700', color: '#2c5aa0' },
  cellSubject: { fontWeight: '700', color: '#1f4b8f' },
  cellTeacher: { color: '#4a90e2', marginTop: 4 },
  emptyCell: { color: '#9fb3d6' },
});

export default ScheduleViewScreen;
