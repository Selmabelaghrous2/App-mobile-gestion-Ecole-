import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getClasses, createClass, updateClass, deleteClass } from '../../services/api';

const ClassCreationScreen = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [subjects, setSubjects] = useState(''); // comma-separated
  const [editingId, setEditingId] = useState(null);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (err) {
      console.error('Error loading classes', err);
      Alert.alert('Erreur', err.message || 'Impossible de charger les classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !level.trim()) {
      Alert.alert('Validation', 'Veuillez renseigner le nom et le niveau de la classe');
      return;
    }
    const subjArray = subjects
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setLoading(true);
    try {
      if (editingId) {
        const updated = await updateClass(editingId, { name: name.trim(), level: level.trim(), subjects: subjArray });
        setClasses((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
        setEditingId(null);
        Alert.alert('Succès', 'Classe modifiée avec succès');
      } else {
        const newClass = await createClass({ name: name.trim(), level: level.trim(), subjects: subjArray });
        setClasses((prev) => [newClass, ...prev]);
        Alert.alert('Succès', 'Classe créée avec succès');
      }
      setName('');
      setLevel('');
      setSubjects('');
    } catch (err) {
      console.error('Create class error', err);
      Alert.alert('Erreur', err.message || "Impossible de créer la classe");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name || '');
    setLevel(item.level || '');
    setSubjects((item.subjects || []).join(', '));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setLevel('');
    setSubjects('');
  };

  const handleDelete = (id) => {
    Alert.alert('Confirmer', 'Supprimer cette classe ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await deleteClass(id);
            setClasses((prev) => prev.filter((c) => c.id !== id));
            if (editingId === id) handleCancelEdit();
          } catch (err) {
            console.error('Delete error', err);
            Alert.alert('Erreur', err.message || 'Impossible de supprimer');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.classItem}>
      <Text style={styles.className}>{item.name} — {item.level}</Text>
      {item.subjects && item.subjects.length > 0 && (
        <Text style={styles.classSubjects}>{item.subjects.join(', ')}</Text>
      )}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)}>
          <Text style={styles.actionButtonText}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#e74c3c' }]} onPress={() => handleDelete(item.id)}>
          <Text style={[styles.actionButtonText, { color: '#fff' }]}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ListHeader = () => (
    <View>
      <Text style={styles.title}>Création des Classes</Text>
      <Text style={styles.subtitle}>et Matières</Text>

      <View style={styles.card}>
        <TextInput
          placeholder="Nom de la classe"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Niveau"
          style={styles.input}
          value={level}
          onChangeText={setLevel}
        />
        <TextInput
          placeholder="Matières"
          style={styles.input}
          value={subjects}
          onChangeText={setSubjects}
        />

        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={handleCreate} disabled={loading}>
            <Text style={styles.primaryButtonText}>{loading ? '...' : editingId ? 'Enregistrer' : 'Créer la classe'}</Text>
          </TouchableOpacity>
          {editingId && (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit} disabled={loading}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={[styles.subtitle, { marginTop: 20 }]}>Liste des classes</Text>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      data={classes}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={() => (
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      )}
      nestedScrollEnabled={true}
    />
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
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e6eef8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    height: 44,
    borderColor: '#dfeefb',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    backgroundColor: '#fbfdff',
  },
  primaryButton: {
    backgroundColor: '#2c5aa0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  classItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e6eef8',
  },
  className: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c5aa0',
  },
  classSubjects: {
    marginTop: 6,
    color: '#4a90e2',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#2c5aa0',
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#e6eef8',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#2c5aa0',
    fontWeight: '700',
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
});

export default ClassCreationScreen;
