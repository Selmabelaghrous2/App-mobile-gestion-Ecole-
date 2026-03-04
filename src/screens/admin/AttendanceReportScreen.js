import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AttendanceReportScreen = () => (
  <View style={styles.container}>
    <Text style={styles.message}>La fonctionnalité 'Suivi des présences' côté admin a été supprimée.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  message: { textAlign: 'center', color: '#444', fontSize: 16 },
});

export default AttendanceReportScreen;
