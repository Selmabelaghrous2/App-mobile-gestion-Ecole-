// Script pour vérifier les problèmes dans le projet
const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification du projet...\n');

const projectRoot = path.join(__dirname, '..');
let errors = [];
let warnings = [];

// Vérifier les fichiers essentiels
const essentialFiles = [
  'App.js',
  'index.js',
  'package.json',
  'app.json',
  'src/config/firebase.js',
  'src/context/AuthContext.js',
  'src/screens/LoginScreen.js',
  'src/components/SchoolLogo.js',
  'src/screens/AdminDashboard.js',
  'src/screens/TeacherDashboard.js',
  'src/screens/StudentDashboard.js'
];

console.log('1️⃣ Vérification des fichiers essentiels...');
essentialFiles.forEach(file => {
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MANQUANT!`);
    errors.push(`Fichier manquant: ${file}`);
  }
});

// Vérifier les imports dans App.js
console.log('\n2️⃣ Vérification des imports dans App.js...');
try {
  const appJs = fs.readFileSync(path.join(projectRoot, 'App.js'), 'utf8');
  const imports = appJs.match(/import\s+.*\s+from\s+['"](.+?)['"]/g) || [];
  
  imports.forEach(importLine => {
    const match = importLine.match(/from\s+['"](.+?)['"]/);
    if (match) {
      const importPath = match[1];
      let filePath;
      
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        filePath = path.join(projectRoot, path.dirname('App.js'), importPath);
        // Ajouter extension si nécessaire
        if (!fs.existsSync(filePath)) {
          if (fs.existsSync(filePath + '.js')) {
            filePath += '.js';
          } else if (fs.existsSync(filePath + '.jsx')) {
            filePath += '.jsx';
          }
        }
      } else {
        // Module npm, on ne vérifie pas
        return;
      }
      
      if (filePath && !fs.existsSync(filePath) && !importPath.startsWith('@')) {
        console.log(`   ⚠️  Import possiblement manquant: ${importPath}`);
        warnings.push(`Import possiblement manquant: ${importPath}`);
      }
    }
  });
} catch (error) {
  console.log(`   ❌ Erreur lors de la lecture de App.js: ${error.message}`);
  errors.push(`Erreur lecture App.js: ${error.message}`);
}

// Vérifier la configuration Firebase
console.log('\n3️⃣ Vérification de la configuration Firebase...');
try {
  const firebaseJs = fs.readFileSync(path.join(projectRoot, 'src/config/firebase.js'), 'utf8');
  
  if (firebaseJs.includes('YOUR_API_KEY') || firebaseJs.includes('your-project')) {
    console.log('   ❌ Configuration Firebase contient des valeurs placeholder!');
    errors.push('Configuration Firebase non configurée');
  } else {
    console.log('   ✅ Configuration Firebase semble correcte');
  }
  
  // Vérifier que auth et db sont exportés
  if (!firebaseJs.includes('export') || (!firebaseJs.includes('auth') && !firebaseJs.includes('export { auth }'))) {
    console.log('   ⚠️  Export de auth manquant ou incorrect');
    warnings.push('Export auth manquant');
  }
  
  if (!firebaseJs.includes('export const db')) {
    console.log('   ⚠️  Export de db manquant ou incorrect');
    warnings.push('Export db manquant');
  }
} catch (error) {
  console.log(`   ❌ Erreur lors de la lecture de firebase.js: ${error.message}`);
  errors.push(`Erreur lecture firebase.js: ${error.message}`);
}

// Vérifier package.json
console.log('\n4️⃣ Vérification de package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  
  const requiredDeps = [
    'expo',
    'react',
    'react-native',
    'firebase',
    '@react-navigation/native',
    '@react-navigation/stack'
  ];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`   ❌ ${dep} - MANQUANT!`);
      errors.push(`Dépendance manquante: ${dep}`);
    }
  });
} catch (error) {
  console.log(`   ❌ Erreur lors de la lecture de package.json: ${error.message}`);
  errors.push(`Erreur lecture package.json: ${error.message}`);
}

// Résumé
console.log('\n' + '='.repeat(60));
console.log('\n📊 RÉSUMÉ:\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ Aucun problème détecté! Le projet semble correct.');
} else {
  if (errors.length > 0) {
    console.log(`❌ ${errors.length} erreur(s) trouvée(s):`);
    errors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  ${warnings.length} avertissement(s):`);
    warnings.forEach((warn, i) => console.log(`   ${i + 1}. ${warn}`));
  }
}

console.log('\n💡 Suggestions:');
console.log('   1. Vérifiez les erreurs dans le terminal Expo');
console.log('   2. Vérifiez les logs de la console dans l\'app (secouez → Debug)');
console.log('   3. Essayez: npx expo start --clear');
console.log('   4. Vérifiez que node_modules est installé: npm install');

process.exit(errors.length > 0 ? 1 : 0);
