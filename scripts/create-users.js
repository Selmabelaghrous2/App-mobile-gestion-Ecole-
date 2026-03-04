// Script pour créer les utilisateurs professeur et étudiant dans Firebase
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

// Configuration des utilisateurs à créer
const usersToCreate = [
  {
    email: 'prof@gmail.com',
    password: 'prof123',
    role: 'teacher',
    name: 'Professeur'
  },
  {
    email: 'student@gmail.com',
    password: 'student123',
    role: 'student',
    name: 'Étudiant'
  }
];

async function createUser(userConfig) {
  try {
    console.log(`\n📝 Création de l'utilisateur: ${userConfig.email} (${userConfig.role})...`);
    
    // Créer l'utilisateur dans Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userConfig.email,
      userConfig.password
    );
    const user = userCredential.user;
    
    console.log(`   ✅ Utilisateur créé dans Firebase Authentication`);
    console.log(`   User UID: ${user.uid}`);
    
    // Créer le document dans Firestore avec l'UID comme Document ID
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      email: userConfig.email,
      role: userConfig.role,
      name: userConfig.name
    });
    
    console.log(`   ✅ Document créé dans Firestore`);
    console.log(`   Collection: users`);
    console.log(`   Document ID: ${user.uid}`);
    console.log(`   Champs: email="${userConfig.email}", role="${userConfig.role}", name="${userConfig.name}"`);
    
    return { success: true, uid: user.uid, email: userConfig.email };
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`   ⚠️  L'utilisateur ${userConfig.email} existe déjà dans Firebase Authentication`);
      console.log(`   ⚠️  Si vous voulez le recréer, supprimez-le d'abord avec: npm run delete:professor`);
      return { success: false, alreadyExists: true, error: 'User already exists', email: userConfig.email };
    } else if (error.code === 'permission-denied') {
      console.log(`   ❌ Erreur de permissions Firestore`);
      console.log(`   Vérifiez les règles de sécurité Firestore dans Firebase Console`);
      return { success: false, error: 'Permission denied', email: userConfig.email };
    } else {
      console.log(`   ❌ Erreur: ${error.code} - ${error.message}`);
      return { success: false, error: error.message, email: userConfig.email };
    }
  }
}

async function createAllUsers() {
  console.log('🚀 Création des utilisateurs Firebase (Professeur et Étudiant)...\n');
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const userConfig of usersToCreate) {
    const result = await createUser(userConfig);
    results.push(result);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RÉSUMÉ DE LA CRÉATION:\n');
  
  results.forEach((result, index) => {
    const user = usersToCreate[index];
    if (result.success) {
      if (result.alreadyExists) {
        console.log(`✅ ${user.email} (${user.role}): Existe déjà`);
      } else {
        console.log(`✅ ${user.email} (${user.role}): Créé avec succès`);
        console.log(`   UID: ${result.uid}`);
      }
    } else {
      console.log(`❌ ${user.email} (${user.role}): Échec - ${result.error}`);
    }
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`\n✅ ${successCount}/${totalCount} utilisateurs créés avec succès\n`);
  
  if (successCount === totalCount) {
    console.log('🎉 TOUS LES UTILISATEURS SONT PRÊTS!');
    console.log('\n📋 Identifiants de connexion:');
    console.log('   Professeur:');
    console.log('     Email: prof@gmail.com');
    console.log('     Password: prof123');
    console.log('     Rôle: Professeur');
    console.log('\n   Étudiant:');
    console.log('     Email: student@gmail.com');
    console.log('     Password: student123');
    console.log('     Rôle: Étudiant');
  }
}

// Exécuter la création
createAllUsers()
  .then(() => {
    console.log('\n✅ Opération terminée.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
