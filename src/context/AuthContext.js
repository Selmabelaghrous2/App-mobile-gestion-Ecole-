import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null); // Student-specific profile data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Initializing...');
    let mounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;
      
      try {
        console.log('AuthContext: Auth state changed, user:', user ? user.email : 'null');
        
        if (user) {
          setUser(user);
          try {
            const token = await user.getIdToken();
            if (mounted) setToken(token);
          } catch (tokenError) {
            console.error('Error getting token:', tokenError);
            if (mounted) setToken(null);
          }
          // Get role and profile from Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (mounted) {
              if (userDoc.exists()) {
                const userData = userDoc.data();
                const roleData = userData.role;
                console.log('AuthContext: Role found:', roleData);
                setRole(roleData);
                
                // If student, load student profile
                if (roleData === 'student' && userData.studentId) {
                  try {
                    const studentDoc = await getDoc(doc(db, 'students', userData.studentId));
                    if (studentDoc.exists()) {
                      const studentData = studentDoc.data();
                      setStudentProfile({
                        studentId: userData.studentId,
                        classId: userData.classId,
                        name: userData.name,
                        email: userData.email,
                        grades: studentData.grades || {},
                        attendance: studentData.attendance || {},
                      });
                      console.log('AuthContext: Student profile loaded:', userData.studentId);
                    } else {
                      // Student document doesn't exist yet, create basic profile
                      setStudentProfile({
                        studentId: userData.studentId,
                        classId: userData.classId,
                        name: userData.name,
                        email: userData.email,
                        grades: {},
                        attendance: {},
                      });
                    }
                  } catch (studentError) {
                    console.error('AuthContext: Error loading student profile:', studentError);
                    // Set basic profile even if student document doesn't exist
                    if (userData.studentId) {
                      setStudentProfile({
                        studentId: userData.studentId,
                        classId: userData.classId,
                        name: userData.name,
                        email: userData.email,
                        grades: {},
                        attendance: {},
                      });
                    }
                  }
                } else {
                  setStudentProfile(null);
                }
              } else {
                console.warn('AuthContext: User document not found in Firestore for UID:', user.uid);
                setRole(null);
                setStudentProfile(null);
              }
              setIsAuthenticated(true);
            }
          } catch (firestoreError) {
            console.error('AuthContext: Error fetching user role from Firestore:', firestoreError);
            if (mounted) {
              setRole(null);
              setStudentProfile(null);
              setIsAuthenticated(true); // Still allow login even if Firestore fails
            }
          }
        } else {
          console.log('AuthContext: No user, setting unauthenticated');
          if (mounted) {
            setUser(null);
            setToken(null);
            setRole(null);
            setStudentProfile(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('AuthContext: Error in auth state change:', error);
        if (mounted) {
          setUser(null);
          setToken(null);
          setRole(null);
          setStudentProfile(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          console.log('AuthContext: Loading complete');
          setLoading(false);
        }
      }
    }, (error) => {
      console.error('AuthContext: onAuthStateChanged error:', error);
      if (mounted) {
        setLoading(false);
        setIsAuthenticated(false);
      }
    });
    
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const login = async (email, password, roleSelection) => {
    try {
      console.log('Attempting login with:', { email, roleSelection });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Authentication successful, user UID:', user.uid);
      
      // Check role in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      console.log('Firestore user document exists:', userDoc.exists());
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const storedRole = userData.role;
        console.log('Stored role:', storedRole, 'Selected role:', roleSelection);
        if (storedRole !== roleSelection) {
          throw new Error('Le rôle sélectionné ne correspond pas à votre compte');
        }
        setRole(storedRole);
        
        // If student, load student profile
        if (storedRole === 'student' && userData.studentId) {
          try {
            const studentDoc = await getDoc(doc(db, 'students', userData.studentId));
            if (studentDoc.exists()) {
              const studentData = studentDoc.data();
              setStudentProfile({
                studentId: userData.studentId,
                classId: userData.classId,
                name: userData.name,
                email: userData.email,
                grades: studentData.grades || {},
                attendance: studentData.attendance || {},
              });
            } else {
              // Basic profile if student document doesn't exist
              setStudentProfile({
                studentId: userData.studentId,
                classId: userData.classId,
                name: userData.name,
                email: userData.email,
                grades: {},
                attendance: {},
              });
            }
          } catch (studentError) {
            console.error('Error loading student profile:', studentError);
            if (userData.studentId) {
              setStudentProfile({
                studentId: userData.studentId,
                classId: userData.classId,
                name: userData.name,
                email: userData.email,
                grades: {},
                attendance: {},
              });
            }
          }
        } else {
          setStudentProfile(null);
        }
      } else {
        console.error('User document not found in Firestore for UID:', user.uid);
        throw new Error('Rôle utilisateur introuvable dans la base de données. Assurez-vous d\'avoir créé le document dans Firestore.');
      }
      return userCredential;
    } catch (error) {
      console.error('Login error:', error.code, error.message);
      // Handle Firebase Auth errors
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Email ou mot de passe incorrect. Vérifiez que l\'utilisateur existe dans Firebase Authentication.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Format d\'email invalide');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Trop de tentatives. Veuillez réessayer plus tard');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Erreur de connexion. Vérifiez votre internet');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('Ce compte a été désactivé');
      }
      // Re-throw custom errors or unknown errors
      throw error;
    }
  };

  const createUser = async (email, password, role) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Set role in Firestore
    await setDoc(doc(db, 'users', user.uid), { email, role });
    return userCredential;
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, role, user, studentProfile, login, logout, createUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
