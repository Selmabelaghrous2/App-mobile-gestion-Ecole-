// Script pour créer l'utilisateur professeur dans Firebase
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

async function createProfessor() {
  console.log('🚀 Création de l\'utilisateur professeur...\n');
  
  const email = 'prof@gmail.com';
  const password = 'prof123';
  const role = 'teacher';
  const name = 'Professeur';
  
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
    
    console.log('\n✅✅✅ UTILISATEUR PROFESSEUR CRÉÉ AVEC SUCCÈS!');
    console.log('\n📋 Identifiants de connexion:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Rôle: Professeur`);
    
  } catch (error) {
    console.log('   ❌ ERREUR lors de la création!\n');
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('   ⚠️  L\'utilisateur existe déjà dans Firebase Authentication.');
      console.log('   Vérification du document Firestore...');
      
      // Essayer de créer quand même le document Firestore
      // On doit d'abord se connecter pour obtenir l'UID
      try {
        const { signInWithEmailAndPassword } = require('firebase/auth');
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDocRef = doc(db, 'users', user.uid);
        
        // Vérifier si le document existe déjà
        const { getDoc } = require('firebase/firestore');
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            email: email,
            role: role,
            name: name
          });
          console.log('   ✅ Document Firestore créé avec succès!');
          console.log(`   UID: ${user.uid}`);
        } else {
          console.log('   ✅ Document Firestore existe déjà');
          console.log(`   UID: ${user.uid}`);
        }
        
        await auth.signOut();
      } catch (firestoreError) {
        console.log('   ⚠️  Impossible de créer/vérifier le document Firestore');
        console.log(`   Erreur: ${firestoreError.message}`);
        console.log('   Vous pouvez créer le document manuellement dans Firebase Console');
      }
    } else if (error.code === 'permission-denied') {
      console.log('   ❌ Erreur de permissions Firestore.');
      console.log('   Vérifiez les règles de sécurité Firestore dans Firebase Console.');
    } else {
      console.log(`   Code d'erreur: ${error.code}`);
      console.log(`   Message: ${error.message}`);
    }
  }
}

createProfessor()
  .then(() => {
    console.log('\n✅ Opération terminée.');
    setTimeout(() => process.exit(0), 1000);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    setTimeout(() => process.exit(1), 1000);
  });
