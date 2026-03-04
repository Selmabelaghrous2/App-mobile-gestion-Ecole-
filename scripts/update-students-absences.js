// Script pour ajouter le champ absences aux étudiants existants
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, getDoc } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAqsTSmQFUtIYA3TqZ9W--YbRUTejhtR9s",
  authDomain: "schoolapp-40d85.firebaseapp.com",
  projectId: "schoolapp-40d85",
  storageBucket: "schoolapp-40d85.firebasestorage.app",
  messagingSenderId: "499904821468",
  appId: "1:499904821468:web:ae613b94e534f26fd2dc19"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Liste des IDs étudiants
const studentIds = ['s1', 's2', 's3', 's4', 's5'];

async function updateStudent(studentId) {
  try {
    const studentDocRef = doc(db, 'students', studentId);
    const studentSnapshot = await getDoc(studentDocRef);
    
    if (!studentSnapshot.exists()) {
      console.log(`⚠️  ${studentId}: Document n'existe pas`);
      return;
    }
    
    const currentData = studentSnapshot.data();
    
    // Si le champ absences existe déjà, ne pas le modifier
    if (currentData.absences !== undefined) {
      console.log(`✅ ${studentId}: Field 'absences' already exists`);
      return;
    }
    
    // Ajouter le champ absences
    await updateDoc(studentDocRef, {
      absences: []
    });
    
    console.log(`✅ ${studentId}: Field 'absences' added`);
  } catch (error) {
    console.error(`❌ ${studentId}:`, error.message);
  }
}

async function updateAllStudents() {
  console.log('🔄 Updating students with absences field...\n');
  
  for (const studentId of studentIds) {
    await updateStudent(studentId);
  }
  
  console.log('\n✅ Update complete!');
  process.exit(0);
}

updateAllStudents();
