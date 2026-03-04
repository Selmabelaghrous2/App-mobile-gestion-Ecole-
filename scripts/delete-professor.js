// Script pour supprimer complètement l'utilisateur professeur
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, deleteUser } = require('firebase/auth');
const { getFirestore, doc, deleteDoc, getDoc } = require('firebase/firestore');

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

async function deleteProfessor() {
  console.log('🗑️  Suppression de l\'utilisateur professeur...\n');
  
  const email = 'prof@gmail.com';
  const password = 'prof123';
  
  try {
    // Étape 1: Se connecter pour obtenir l'utilisateur
    console.log('1️⃣ Connexion pour obtenir l\'utilisateur...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const uid = user.uid;
    
    console.log('   ✅ Connexion réussie');
    console.log(`   User UID: ${uid}\n`);
    
    // Étape 2: Vérifier et supprimer le document Firestore
    console.log('2️⃣ Suppression du document Firestore...');
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      await deleteDoc(userDocRef);
      console.log('   ✅ Document Firestore supprimé');
    } else {
      console.log('   ⚠️  Document Firestore introuvable (peut-être déjà supprimé)');
    }
    
    // Étape 3: Supprimer l'utilisateur de Firebase Authentication
    console.log('\n3️⃣ Suppression de l\'utilisateur Firebase Authentication...');
    await deleteUser(user);
    console.log('   ✅ Utilisateur supprimé de Firebase Authentication');
    
    // Déconnexion
    await auth.signOut();
    
    console.log('\n✅✅✅ SUPPRESSION COMPLÈTE RÉUSSIE!');
    console.log('   - Document Firestore supprimé');
    console.log('   - Utilisateur Firebase Authentication supprimé');
    console.log(`   - Email: ${email}`);
    console.log(`   - UID: ${uid}`);
    
  } catch (error) {
    console.log('   ❌ ERREUR lors de la suppression!\n');
    
    if (error.code === 'auth/user-not-found') {
      console.log('   ⚠️  L\'utilisateur n\'existe pas dans Firebase Authentication.');
      console.log('   Vérification du document Firestore...');
      
      // Chercher tous les documents avec cet email
      const { collection, getDocs, query, where } = require('firebase/firestore');
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        console.log('   📋 Documents Firestore trouvés avec cet email:');
        querySnapshot.forEach((docSnapshot) => {
          console.log(`      - Document ID: ${docSnapshot.id}`);
          console.log(`        Email: ${docSnapshot.data().email}`);
          console.log(`        Role: ${docSnapshot.data().role}`);
        });
        console.log('\n   ⚠️  Vous pouvez supprimer ces documents manuellement depuis Firebase Console.');
      } else {
        console.log('   ✅ Aucun document Firestore trouvé avec cet email.');
      }
      
    } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      console.log('   ❌ Mot de passe incorrect ou identifiants invalides.');
      console.log('   Impossible de se connecter pour supprimer l\'utilisateur.');
      console.log('\n   💡 Solution alternative:');
      console.log('   1. Allez dans Firebase Console → Authentication → Users');
      console.log('   2. Trouvez l\'utilisateur prof@gmail.com');
      console.log('   3. Cliquez sur les trois points → Delete user');
      console.log('   4. Allez dans Firestore Database → Collection users');
      console.log('   5. Supprimez le document avec l\'UID de l\'utilisateur');
      
    } else {
      console.log(`   Code d'erreur: ${error.code}`);
      console.log(`   Message: ${error.message}`);
    }
  }
}

// Exécuter la suppression
deleteProfessor()
  .then(() => {
    console.log('\n✅ Opération terminée.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
