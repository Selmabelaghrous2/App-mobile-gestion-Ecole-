import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import SchoolLogo from '../components/SchoolLogo';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('prof@gmail.com');
  const [password, setPassword] = useState('prof123');
  const [role, setRole] = useState('teacher');
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Entrez email et mot de passe');
      return;
    }
    setLoading(true);
    try {
      await authLogin(email, password, role);
      // Navigation handled by App.js based on role
    } catch (error) {
      Alert.alert('Connexion échouée', error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SchoolLogo size={80} bgColor="#1e58ae" />
        <Text style={styles.appTitle}>SchoolApp</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Connexion</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />
        <Text style={styles.label}>Type d'utilisateur</Text>
        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'admin' && styles.roleSelected]}
            onPress={() => setRole('admin')}
            disabled={loading}
          >
            <Text style={role === 'admin' ? styles.roleTextSelected : styles.roleText}>Admin</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'teacher' && styles.roleSelected]}
            onPress={() => setRole('teacher')}
            disabled={loading}
          >
            <Text style={role === 'teacher' ? styles.roleTextSelected : styles.roleText}>Professeur</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'student' && styles.roleSelected]}
            onPress={() => setRole('student')}
            disabled={loading}
          >
            <Text style={role === 'student' ? styles.roleTextSelected : styles.roleText}>Étudiant</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Connexion</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#12128e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#000000',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  header: { alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  button: {
    backgroundColor: '#1e968e',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    minHeight: 45,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  roleButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  roleSelected: {
    backgroundColor: '#1e968e',
    borderColor: '#1e968e',
  },
  roleText: {
    color: '#1e968e',
  },
  roleTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
});

export default LoginScreen;

