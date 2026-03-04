// Script pour créer tous les étudiants par défaut dans Firebase
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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
const auth = getAuth(app);
const db = getFirestore(app);

// Liste des étudiants par défaut
const defaultStudents = [
  { studentId: 's1', name: 'Alice Martin', email: 'alice.martin@student.com', password: 'alice123', classId: 'c1' },
  { studentId: 's2', name: 'Bastien Leroy', email: 'bastien.leroy@student.com', password: 'bastien123', classId: 'c1' },
  { studentId: 's3', name: 'Camille Durant', email: 'camille.durant@student.com', password: 'camille123', classId: 'c1' },
  { studentId: 's4', name: 'David Petit', email: 'david.petit@student.com', password: 'david123', classId: 'c2' },
  { studentId: 's5', name: 'Elodie Moreau', email: 'elodie.moreau@student.com', password: 'elodie123', classId: 'c2' },
];

// Données par défaut pour chaque étudiant
// Les matières sont maintenant stockées avec une valeur 0 (à mettre à jour par le professeur)
// Les absences sont maintenant synchronisées avec Firebase
const defaultStudentData = {
  s1: {
    grades: { React: 0, DotNet: 0 },
    absences: []
  },
  s2: {
    grades: { React: 0, DotNet: 0 },
    absences: []
  },
  s3: {
    grades: { React: 0, DotNet: 0 },
    absences: []
  },
  s4: {
    grades: { Français: 0, Anglais: 0 },
    absences: []
  },
  s5: {
    grades: { Français: 0, Anglais: 0 },
    absences: []
  },
};

async function createStudent(studentConfig) {
  const { studentId, name, email, password, classId } = studentConfig;
  
  try {
    console.log(`\n📚 Création de ${name} (${studentId})...`);
    
    // 1. Créer l'utilisateur dans Firebase Authentication
    console.log('   1️⃣ Création dans Firebase Authentication...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log(`   ✅ Utilisateur créé - UID: ${user.uid}`);
    
    // 2. Créer le document utilisateur dans Firestore
    console.log('   2️⃣ Création du document Firestore (users)...');
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      email: email,
      role: 'student',
      name: name,
      studentId: studentId,
      classId: classId,
    });
    console.log(`   ✅ Document utilisateur créé`);
    
    // Créer le document étudiant avec matières et absences
    const studentData = defaultStudentData[studentId];
    
    // Créer le document étudiant avec les matières ET les absences
    const studentDocRef = doc(db, 'students', studentId);
    await setDoc(studentDocRef, {
      studentId: studentId,
      name: name,
      classId: classId,
      userId: user.uid, // Lien vers l'utilisateur Firebase Auth
      email: email,
      grades: studentData.grades, // Matières avec notes = 0
      absences: studentData.absences // Tableau vide des absences
    });
    console.log(`   ✅ Document étudiant créé (notes et absences)`);
    
    console.log(`\n   ✅✅✅ ${name} créé avec succès!`);
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔑 Password: ${password}`);
    
    return { success: true, studentId, userId: user.uid };
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`   ⚠️  ${name} existe déjà dans Firebase Authentication`);
      return { success: false, reason: 'exists', studentId };
    } else {
      console.log(`   ❌ Erreur: ${error.code} - ${error.message}`);
      return { success: false, reason: 'error', studentId, error: error.message };
    }
  }
}

async function createAllStudents() {
  console.log('🚀 Création de tous les étudiants par défaut...\n');
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const student of defaultStudents) {
    const result = await createStudent(student);
    results.push(result);
    // Petite pause entre chaque création
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RÉSUMÉ DE LA CRÉATION:\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Créés avec succès: ${successful.length}/${defaultStudents.length}`);
  successful.forEach(r => {
    const student = defaultStudents.find(s => s.studentId === r.studentId);
    console.log(`   - ${student.name} (${student.email})`);
  });
  
  if (failed.length > 0) {
    console.log(`\n⚠️  Échecs ou déjà existants: ${failed.length}`);
    failed.forEach(r => {
      const student = defaultStudents.find(s => s.studentId === r.studentId);
      if (r.reason === 'exists') {
        console.log(`   - ${student.name} (déjà existant)`);
      } else {
        console.log(`   - ${student.name} (erreur: ${r.error})`);
      }
    });
  }
  
  console.log('\n📋 IDENTIFIANTS DE CONNEXION:');
  console.log('='.repeat(60));
  defaultStudents.forEach(student => {
    console.log(`\n${student.name}:`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Password: ${student.password}`);
    console.log(`   Classe: ${student.classId}`);
  });
  
  console.log('\n' + '='.repeat(60));
}

createAllStudents()
  .then(() => {
    console.log('\n✅ Opération terminée.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
