// Script pour nettoyer les données de notes et absences dans Firestore
// ATTENTION: Ce script SUPPRIME les champs 'grades' et 'attendance' de tous les documents étudiants
// Ces données ne doivent être gérées QUE localement dans l'app (AsyncStorage)

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, deleteField } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAqsTSmQFUtIYA3TqZ9W--YbRUTejhtR9s",
  authDomain: "schoolapp-40d85.firebaseapp.com",
  projectId: "schoolapp-40d85",
  storageBucket: "schoolapp-40d85.firebasestorage.app",
  messagingSenderId: "499904821468",
  appId: "1:499904821468:web:ae613b94e534f26fd2dc19"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanFirestoreGradesAndAttendance() {
  console.log('🧹 Nettoyage des données de notes et absences dans Firestore...\n');
  console.log('='.repeat(60));
  
  try {
    // 1. Récupérer tous les documents de la collection 'students'
    console.log('\n1️⃣ Récupération des documents étudiants...');
    const studentsCollection = collection(db, 'students');
    const querySnapshot = await getDocs(studentsCollection);
    
    console.log(`   ✅ ${querySnapshot.size} document(s) trouvé(s)\n`);
    
    // 2. Pour chaque étudiant, supprimer les champs 'grades' et 'attendance'
    let count = 0;
    for (const docSnapshot of querySnapshot.docs) {
      const studentId = docSnapshot.id;
      const data = docSnapshot.data();
      
      const hasGrades = 'grades' in data;
      const hasAttendance = 'attendance' in data;
      
      if (hasGrades || hasAttendance) {
        console.log(`2️⃣ Nettoyage de ${studentId}...`);
        
        const studentDocRef = doc(db, 'students', studentId);
        
        // Utiliser deleteField() pour vraiment supprimer les champs
        const updateData = {};
        
        if (hasGrades) {
          console.log(`   ❌ Suppression du champ 'grades'`);
          updateData.grades = deleteField();
        }
        
        if (hasAttendance) {
          console.log(`   ❌ Suppression du champ 'attendance'`);
          updateData.attendance = deleteField();
        }
        
        await updateDoc(studentDocRef, updateData);
        console.log(`   ✅ ${studentId} nettoyé\n`);
        count++;
      } else {
        console.log(`✅ ${studentId} - Déjà propre (pas de grades/attendance)\n`);
      }
    }
    
    console.log('='.repeat(60));
    console.log(`\n✅ Nettoyage terminé!`);
    console.log(`📊 ${count} document(s) nettoyé(s)\n`);
    console.log('⚠️  Les champs suivants ont été supprimés:');
    console.log('   - grades: Les notes ne sont plus stockées dans Firebase');
    console.log('   - attendance: Les absences ne sont plus stockées dans Firebase\n');
    console.log('💡 Ces données sont maintenant gérées UNIQUEMENT localement');
    console.log('   dans l\'app (AsyncStorage) par le professeur.\n');
    
  } catch (error) {
    console.log('❌ ERREUR lors du nettoyage!\n');
    
    if (error.code === 'permission-denied') {
      console.log('Erreur: Permissions insuffisantes.');
      console.log('Assurez-vous que les règles Firestore permettent la lecture/écriture.\n');
    } else if (error.code === 'failed-precondition') {
      console.log('Erreur: Firestore n\'est pas initialisé correctement.');
      console.log('Vérifiez votre configuration Firebase.\n');
    } else {
      console.log(`Code d'erreur: ${error.code}`);
      console.log(`Message: ${error.message}\n`);
    }
    
    throw error;
  }
}

cleanFirestoreGradesAndAttendance()
  .then(() => {
    console.log('✅ Opération terminée.\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error.message);
    process.exit(1);
  });
