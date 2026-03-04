import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Alert, Share } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { getStudentGrades, getStudentProfile, getClasses } from '../../services/api';

const GradeViewScreen = ({ navigation }) => {
  const { user, studentProfile } = useContext(AuthContext);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('Étudiant');
  const [className, setClassName] = useState('');

  useEffect(() => {
    loadData();
  }, [studentProfile]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (!studentProfile && user) {
        // Try to load student profile if not already loaded
        try {
          const profile = await getStudentProfile(user.uid);
          if (profile) {
            const studentGrades = await getStudentGrades(profile.studentId);
            setGrades(studentGrades);
            setStudentName(profile.name);
            
            // Get class name
            const classes = await getClasses();
            const classData = classes.find(c => c.id === profile.classId);
            setClassName(classData ? classData.name : '');
            return;
          }
        } catch (error) {
          console.error('Error loading student profile:', error);
          Alert.alert('Erreur', 'Impossible de charger votre profil étudiant');
          return;
        }
      }
      
      if (studentProfile) {
        // Use student profile data
        setGrades(studentProfile.grades || {});
        setStudentName(studentProfile.name || 'Étudiant');
        
        // Get class name
        const classes = await getClasses();
        const classData = classes.find(c => c.id === studentProfile.classId);
        setClassName(classData ? classData.name : '');
      } else {
        Alert.alert('Erreur', 'Profil étudiant introuvable');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erreur', 'Impossible de charger les notes');
    } finally {
      setLoading(false);
    }
  };

  const renderGradeItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.subjectColumn]}>{item.subject}</Text>
      <Text style={[styles.tableCell, styles.gradeColumn]}>
        {item.grade}/20
      </Text>
      <Text style={[styles.tableCell, styles.statusColumn]}>
        {typeof item.grade === 'number' && item.grade >= 10 ? 'Validé' : 'À rattraper'}
      </Text>
    </View>
  );

  const getGradesList = () => {
    return Object.entries(grades).map(([subject, grade]) => ({
      subject,
      grade
    }));
  };

  const calculateAverage = () => {
    // Calcule la moyenne UNIQUEMENT pour les notes > 0 (saisies par le professeur)
    const validGrades = Object.values(grades).filter(g => typeof g === 'number' && g > 0);
    if (validGrades.length === 0) return 0;
    return (validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length).toFixed(2);
  };

  const getGradesWithValues = () => {
    // Retourne UNIQUEMENT les matières avec une note > 0
    return Object.entries(grades)
      .filter(([subject, grade]) => grade > 0)
      .map(([subject, grade]) => ({ subject, grade }));
  };

  const exportToPDF = async () => {
    const average = calculateAverage();

    const pdfContent = `
BULLETIN DE NOTES
=================

Élève: ${studentName}
Classe: ${className}
Date: ${new Date().toLocaleDateString('fr-FR')}

MOYENNE GÉNÉRALE: ${average}/20

DÉTAIL DES NOTES:
${Object.entries(grades).map(([subject, grade]) => 
  `${subject.padEnd(15)} | ${String(grade).padStart(3)}/20 | ${typeof grade === 'number' && grade >= 10 ? 'Validé' : 'À rattraper'}`
).join('\n')}

Généré par SchoolApp le ${new Date().toLocaleString('fr-FR')}
    `.trim();

    try {
      await Share.share({
        message: pdfContent,
        title: 'Bulletin de Notes',
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager le bulletin');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c5aa0" />
        <Text style={styles.loadingText}>Chargement des données...</Text>
      </View>
    );
  }

  const gradesList = getGradesWithValues(); // Filtre les notes > 0
  const hasGrades = gradesList.length > 0;

  return (
    <View style={styles.container}>
      <FlatList
        data={gradesList}
        renderItem={renderGradeItem}
        keyExtractor={(item) => item.subject}
        style={styles.list}
        scrollEnabled={true}
        ListHeaderComponent={() => (
          <View>
            <Text style={styles.title}>📚 Mes Notes</Text>
            
            {!hasGrades ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Pas de notes disponibles</Text>
                <Text style={styles.emptyText}>
                  Les notes sont gérées manuellement par vos professeurs. 
                  Vos notes apparaîtront ici lorsque le professeur les aura saisies.
                </Text>
              </View>
            ) : (
              <View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryText}>Moyenne générale: {calculateAverage()}/20</Text>
                </View>
                
                {/* En-tête du tableau */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.subjectColumn]}>Matière</Text>
                  <Text style={[styles.tableHeaderText, styles.gradeColumn]}>Note</Text>
                  <Text style={[styles.tableHeaderText, styles.statusColumn]}>Statut</Text>
                </View>
              </View>
            )}
          </View>
        )}
        ListFooterComponent={() => (
          <View>
            {hasGrades && (
              <TouchableOpacity style={styles.exportButton} onPress={exportToPDF}>
                <Text style={styles.exportButtonText}>📄 Exporter en PDF</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>Retour</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f4fd',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f4fd',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2c5aa0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c5aa0',
    textAlign: 'center',
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c5aa0',
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c5aa0',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  tableHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 2,
  },
  tableCell: {
    fontSize: 14,
    textAlign: 'center',
  },
  subjectColumn: {
    flex: 2,
    textAlign: 'left',
    fontWeight: '600',
  },
  gradeColumn: {
    flex: 1,
  },
  statusColumn: {
    flex: 1.5,
  },
  exportButton: {
    backgroundColor: '#007bff',
    padding: 15,
    marginBottom: 15,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    marginTop: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default GradeViewScreen;
