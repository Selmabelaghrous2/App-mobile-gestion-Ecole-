// Script pour créer l'utilisateur étudiant dans Firebase
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

async function createStudent() {
  console.log('🚀 Création de l\'utilisateur étudiant...\n');
  
  const email = 'student@gmail.com';
  const password = 'student123';
  const role = 'student';
  const name = 'Étudiant';
  
  try {
    console.log('1️⃣ Création dans Firebase Authentication...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('   ✅ Utilisateur créé dans Firebase Authentication');
    console.log(`   User UID: ${user.uid}\n`);
    
    console.log('2️⃣ Création du document Firestore...');
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      email: email,
      role: role,
      name: name
    });
    
    console.log('   ✅ Document créé dans Firestore');
    console.log(`   Collection: users`);
    console.log(`   Document ID: ${user.uid}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: ${role}`);
    console.log(`   Name: ${name}`);
    
    console.log('\n✅✅✅ UTILISATEUR ÉTUDIANT CRÉÉ AVEC SUCCÈS!');
    console.log('\n📋 Identifiants de connexion:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Rôle: Étudiant`);
    
  } catch (error) {
    console.log('   ❌ ERREUR lors de la création!\n');
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('   ⚠️  L\'utilisateur existe déjà dans Firebase Authentication.');
      console.log('   L\'utilisateur étudiant est déjà créé.');
    } else if (error.code === 'permission-denied') {
      console.log('   ❌ Erreur de permissions Firestore.');
      console.log('   Vérifiez les règles de sécurité Firestore dans Firebase Console.');
      console.log('   Les règles doivent permettre l\'écriture pour le développement.');
    } else {
      console.log(`   Code d'erreur: ${error.code}`);
      console.log(`   Message: ${error.message}`);
    }
  }
}

createStudent()
  .then(() => {
    console.log('\n✅ Opération terminée.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
