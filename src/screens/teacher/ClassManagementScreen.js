import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { getClasses, createClass, updateClass, deleteClass } from '../../services/api';

const ClassManagementScreen = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [subjects, setSubjects] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const cls = await getClasses();
      setClasses(cls);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setName('');
    setLevel('');
    setSubjects('');
    setModalVisible(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setName(c.name);
    setLevel(c.level || '');
    setSubjects((c.subjects || []).join(', '));
    setModalVisible(true);
  };

  const save = async () => {
    try {
      if (!name) return Alert.alert('Nom requis');
      const subjectArr = subjects.split(',').map((s) => s.trim()).filter(Boolean);
      if (editing) {
        await updateClass(editing.id, { name, level, subjects: subjectArr });
      } else {
        await createClass({ name, level, subjects: subjectArr });
      }
      setModalVisible(false);
      load();
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible d\'enregistrer la classe');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteClass(id);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion des classes</Text>
      <FlatList
        data={classes}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.level}>{item.level}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                <Text style={styles.editText}>Éditer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteText}>Suppr</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.createBtn} onPress={openCreate}>
        <Text style={styles.createText}>Créer une classe</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? 'Éditer classe' : 'Nouvelle classe'}</Text>
            <TextInput style={styles.input} placeholder="Nom" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Niveau" value={level} onChangeText={setLevel} />
            <TextInput style={styles.input} placeholder="Matières (séparées par ,)" value={subjects} onChangeText={setSubjects} />
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <TouchableOpacity style={[styles.createBtn, { flex: 1 }]} onPress={save}>
                <Text style={styles.createText}>{editing ? 'Enregistrer' : 'Créer'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.deleteBtn, { marginLeft: 8 }]} onPress={() => setModalVisible(false)}>
                <Text style={styles.deleteText}>Annuler</Text>
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
  title: { textAlign: 'center', marginTop: 12, fontSize: 20, fontWeight: '800', color: '#2c5aa0' },
  row: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, alignItems: 'center' },
  name: { fontWeight: '800', color: '#1f4b8f' },
  level: { color: '#4a90e2' },
  editBtn: { backgroundColor: '#2c5aa0', padding: 8, borderRadius: 6, marginRight: 8 },
  editText: { color: '#fff' },
  deleteBtn: { backgroundColor: '#e6eef8', padding: 8, borderRadius: 6 },
  deleteText: { color: '#2c5aa0' },
  createBtn: { backgroundColor: '#2c5aa0', padding: 12, borderRadius: 8, alignItems: 'center', margin: 12 },
  createText: { color: '#fff', fontWeight: '700' },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalCard: { width: '90%', backgroundColor: '#fff', padding: 16, borderRadius: 8 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#2c5aa0', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#e6eefb', borderRadius: 6, padding: 8, backgroundColor: '#fff', marginTop: 8 },
});

export default ClassManagementScreen;
