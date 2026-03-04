import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SchoolLogo = ({ size = 72, bgColor = '#1e968e', textColor = '#fff' }) => {
  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: bgColor,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
    },
    text: {
      color: textColor,
      fontSize: Math.round(size * 0.28),
      fontWeight: '900',
      letterSpacing: 1,
    },
  });

  return (
    <View style={styles.container}>
      <Text accessible accessibilityLabel="SchoolApp logo" style={styles.text}>SA</Text>
    </View>
  );
};

export default SchoolLogo;
