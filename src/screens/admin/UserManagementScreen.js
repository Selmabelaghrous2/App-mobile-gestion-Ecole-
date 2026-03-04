import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { auth, db } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

const UserManagementScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  // Load users from Firestore
  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      const usersList = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        usersList.push({
          id: docSnapshot.id, // UID
          uid: docSnapshot.id,
          email: data.email || '',
          role: data.role || '',
          name: data.name || data.email || '', // Use name if available, otherwise email
        });
      });
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Erreur', 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openAdd = (presetRole) => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole(presetRole || 'student');
    setModalVisible(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setName(user.name || user.email);
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name || !email) {
      Alert.alert('Erreur', "Le nom et l'email sont requis");
      return;
    }

    if (!password && !editingUser) {
      Alert.alert('Erreur', 'Le mot de passe est requis pour créer un nouvel utilisateur');
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        // Update existing user in Firestore
        const userRef = doc(db, 'users', editingUser.uid);
        await updateDoc(userRef, {
          email: email.trim(),
          role: role,
          name: name.trim(),
        });
        Alert.alert('Succès', 'Utilisateur modifié avec succès');
        await loadUsers();
        setModalVisible(false);
      } else {
        // Create new user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const newUser = userCredential.user;

        // Create document in Firestore with UID as document ID
        const userRef = doc(db, 'users', newUser.uid);
        await setDoc(userRef, {
          email: email.trim(),
          role: role,
          name: name.trim(),
        });

        Alert.alert('Succès', 'Utilisateur créé avec succès');
        await loadUsers();
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Erreur', 'Cet email est déjà utilisé');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Erreur', 'Format d\'email invalide');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      } else {
        Alert.alert('Erreur', error.message || 'Impossible d\'enregistrer l\'utilisateur');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (user) => {
    Alert.alert('Confirmer', 'Supprimer cet utilisateur ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            // Delete from Firestore
            const userRef = doc(db, 'users', user.uid);
            await deleteDoc(userRef);
            Alert.alert('Succès', 'Utilisateur supprimé');
            await loadUsers();
          } catch (error) {
            console.error('Error deleting user:', error);
            Alert.alert('Erreur', 'Impossible de supprimer l\'utilisateur');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2c5aa0" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Gestion des Utilisateurs</Text>
      <Text style={styles.subtitle}>Élèves et Professeurs</Text>

      <TouchableOpacity style={styles.button} onPress={() => openAdd('student')} disabled={saving}>
        <Text style={styles.buttonText}>Ajouter un Élève</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => openAdd('teacher')} disabled={saving}>
        <Text style={styles.buttonText}>Ajouter un Professeur</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Liste des utilisateurs ({users.length})</Text>
      {users.length === 0 ? (
        <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
      ) : (
        users.map((user) => (
          <View key={user.id} style={styles.userRow}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name || user.email}</Text>
              <Text style={styles.userMeta}>{user.email} · {user.role}</Text>
            </View>
            <View style={styles.rowButtons}>
              <TouchableOpacity style={styles.smallButton} onPress={() => openEdit(user)} disabled={saving}>
                <Text style={styles.smallButtonText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallButton, styles.deleteButton]} onPress={() => handleDelete(user)} disabled={saving}>
                <Text style={styles.smallButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Retour</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingUser ? 'Modifier Utilisateur' : 'Ajouter Utilisateur'}</Text>
            <TextInput style={styles.input} placeholder="Nom" value={name} onChangeText={setName} editable={!saving} />
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!saving} />
            <TextInput 
              style={styles.input} 
              placeholder={editingUser ? "Laisser vide pour ne pas changer" : "Mot de passe"} 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry 
              editable={!saving}
            />

            <Text style={styles.label}>Rôle</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity style={[styles.roleButton, role === 'admin' && styles.roleSelected]} onPress={() => setRole('admin')}>
                <Text style={role === 'admin' ? styles.roleTextSelected : styles.roleText}>Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.roleButton, role === 'teacher' && styles.roleSelected]} onPress={() => setRole('teacher')}>
                <Text style={role === 'teacher' ? styles.roleTextSelected : styles.roleText}>Professeur</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.roleButton, role === 'student' && styles.roleSelected]} onPress={() => setRole('student')}>
                <Text style={role === 'student' ? styles.roleTextSelected : styles.roleText}>Étudiant</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.button, { flex: 1, marginRight: 8, opacity: saving ? 0.6 : 1 }]} 
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>{editingUser ? 'Enregistrer' : 'Ajouter'}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.backButton, { flex: 1 }]} 
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.backButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f4fd',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c5aa0',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#4a90e2',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    color: '#2c5aa0',
    textAlign: 'center',
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c5aa0',
    marginTop: 10,
    marginBottom: 10,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  userInfo: {
    flex: 1,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#135181',
  },
  userMeta: {
    fontSize: 12,
    color: '#6b7d8f',
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 6,
    flexShrink: 1,
  },
  smallButton: {
    backgroundColor: '#2c5aa0',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    minWidth: 68,
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#135181',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  roleButton: {
    flex: 1,
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  roleSelected: {
    backgroundColor: '#135181',
    borderColor: '#135181',
  },
  roleText: {
    color: '#333',
  },
  roleTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7d8f',
    marginTop: 20,
    fontSize: 14,
  },
});

export default UserManagementScreen;
