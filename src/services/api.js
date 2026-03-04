import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Configure axios instance
const api = axios.create({
  baseURL: 'https://your-api-endpoint.com', // Replace with your actual API base URL
  timeout: 10000,
});

// Development mock mode: set to false to use real API
const DEV_MODE = true;

// AsyncStorage keys for persistence
const STORAGE_KEYS = {
  CLASSES: '@schoolapp_classes',
  SCHEDULES: '@schoolapp_schedules',
  STUDENTS: '@schoolapp_students',
  ATTENDANCE: '@schoolapp_attendance',
  GRADES: '@schoolapp_grades',
};

// Load persisted data from AsyncStorage or use defaults
const loadPersistedData = async () => {
  try {
    const [classesStr, schedulesStr, studentsStr, attendanceStr, gradesStr] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.CLASSES),
      AsyncStorage.getItem(STORAGE_KEYS.SCHEDULES),
      AsyncStorage.getItem(STORAGE_KEYS.STUDENTS),
      AsyncStorage.getItem(STORAGE_KEYS.ATTENDANCE),
      AsyncStorage.getItem(STORAGE_KEYS.GRADES),
    ]);

    return {
      classes: classesStr ? JSON.parse(classesStr) : defaultClasses(),
      schedules: schedulesStr ? JSON.parse(schedulesStr) : defaultSchedules(),
      students: studentsStr ? JSON.parse(studentsStr) : defaultStudents(),
      attendance: attendanceStr ? JSON.parse(attendanceStr) : defaultAttendance(),
      grades: gradesStr ? JSON.parse(gradesStr) : defaultGrades(),
    };
  } catch (err) {
    console.error('Error loading persisted data:', err);
    return {
      classes: defaultClasses(),
      schedules: defaultSchedules(),
      students: defaultStudents(),
      attendance: {},
      grades: {},
    };
  }
};

const defaultClasses = () => [
  { id: 'c1', name: 'Classe 1A', level: '1ère', subjects: ['React', 'DotNet'] },
  { id: 'c2', name: 'Classe 2B', level: '2ème', subjects: ['Français', 'Anglais'] },
];

const defaultSchedules = () => [
  {
    classId: 'c1',
    schedule: {
      periods: ['08:00-09:00', '09:00-10:00', '10:30-11:30', '11:30-12:30', '14:00-15:00', '15:00-16:00'],
      days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
      slots: {
        'Lundi|08:00-09:00': { subject: 'Maths', teacher: 'M. Dupont' },
        'Lundi|09:00-10:00': { subject: 'Français', teacher: 'Mme Martin' },
        'Lundi|10:30-11:30': { subject: 'Histoire', teacher: 'M. Leroy' },
        'Lundi|11:30-12:30': { subject: 'Géographie', teacher: 'Mme Petit' },
        'Lundi|14:00-15:00': { subject: 'Anglais', teacher: 'Mme Brown' },
        'Lundi|15:00-16:00': { subject: 'Sport', teacher: 'M. Durand' },
        
        'Mardi|08:00-09:00': { subject: 'Français', teacher: 'Mme Martin' },
        'Mardi|09:00-10:00': { subject: 'Maths', teacher: 'M. Dupont' },
        'Mardi|10:30-11:30': { subject: 'Physique', teacher: 'M. Moreau' },
        'Mardi|11:30-12:30': { subject: 'Chimie', teacher: 'Mme Roux' },
        'Mardi|14:00-15:00': { subject: 'Arts', teacher: 'Mme Blanc' },
        'Mardi|15:00-16:00': { subject: 'Musique', teacher: 'M. Noir' },
        
        'Mercredi|08:00-09:00': { subject: 'Maths', teacher: 'M. Dupont' },
        'Mercredi|09:00-10:00': { subject: 'Physique', teacher: 'M. Moreau' },
        'Mercredi|10:30-11:30': { subject: 'Français', teacher: 'Mme Martin' },
        'Mercredi|11:30-12:30': { subject: 'Histoire', teacher: 'M. Leroy' },
        
        'Jeudi|08:00-09:00': { subject: 'Anglais', teacher: 'Mme Brown' },
        'Jeudi|09:00-10:00': { subject: 'Géographie', teacher: 'Mme Petit' },
        'Jeudi|10:30-11:30': { subject: 'Maths', teacher: 'M. Dupont' },
        'Jeudi|11:30-12:30': { subject: 'Sport', teacher: 'M. Durand' },
        'Jeudi|14:00-15:00': { subject: 'Français', teacher: 'Mme Martin' },
        'Jeudi|15:00-16:00': { subject: 'Informatique', teacher: 'M. Blanc' },
        
        'Vendredi|08:00-09:00': { subject: 'Histoire', teacher: 'M. Leroy' },
        'Vendredi|09:00-10:00': { subject: 'Arts', teacher: 'Mme Blanc' },
        'Vendredi|10:30-11:30': { subject: 'Musique', teacher: 'M. Noir' },
        'Vendredi|11:30-12:30': { subject: 'Anglais', teacher: 'Mme Brown' },
        'Vendredi|14:00-15:00': { subject: 'Maths', teacher: 'M. Dupont' },
        'Vendredi|15:00-16:00': { subject: 'Français', teacher: 'Mme Martin' },
      },
    },
  },
];

const defaultStudents = () => ({
  c1: [
    { id: 's1', name: 'Alice Martin' },
    { id: 's2', name: 'Bastien Leroy' },
    { id: 's3', name: 'Camille Durant' },
  ],
  c2: [
    { id: 's4', name: 'David Petit' },
    { id: 's5', name: 'Elodie Moreau' },
  ],
});

const defaultAttendance = () => ({
  c1: {
    '2026-01-10': { s1: 'present', s2: 'present', s3: 'absent' },
    '2026-01-11': { s1: 'present', s2: 'absent', s3: 'present' },
    '2026-01-12': { s1: 'present', s2: 'present', s3: 'present' },
    '2026-01-13': { s1: 'absent', s2: 'present', s3: 'present' },
    '2026-01-14': { s1: 'present', s2: 'present', s3: 'absent' },
    '2026-01-15': { s1: 'present', s2: 'late', s3: 'present' },
    '2026-01-16': { s1: 'present', s2: 'present', s3: 'present' },
    '2026-01-17': { s1: 'absent', s2: 'present', s3: 'absent' },
    '2026-01-18': { s1: 'present', s2: 'present', s3: 'present' },
    '2026-01-19': { s1: 'present', s2: 'absent', s3: 'present' },
    '2026-01-20': { s1: 'present', s2: 'present', s3: 'late' },
    '2026-01-21': { s1: 'present', s2: 'present', s3: 'present' },
    '2026-01-22': { s1: 'absent', s2: 'present', s3: 'present' },
    '2026-01-23': { s1: 'present', s2: 'late', s3: 'absent' },
    '2026-01-24': { s1: 'present', s2: 'present', s3: 'present' },
    '2026-01-25': { s1: 'present', s2: 'present', s3: 'absent' },
    '2026-01-26': { s1: 'present', s2: 'absent', s3: 'present' },
    '2026-01-27': { s1: 'late', s2: 'present', s3: 'present' },
    '2026-01-28': { s1: 'present', s2: 'present', s3: 'late' },
    '2026-01-29': { s1: 'present', s2: 'present', s3: 'present' },
    '2026-01-30': { s1: 'absent', s2: 'absent', s3: 'present' },
  },
  c2: {
    '2026-01-10': { s4: 'present', s5: 'present' },
    '2026-01-11': { s4: 'absent', s5: 'present' },
  },
});

const defaultGrades = () => ({
  c1: {
    Maths: { s1: 15, s2: 12, s3: 18 },
    Français: { s1: 14, s2: 16, s3: 13 },
  },
  c2: {
    Physique: { s4: 17, s5: 11 },
    Anglais: { s4: 13, s5: 15 },
  },
});

// Initialize data store
let dataStore = {
  classes: defaultClasses(),
  schedules: defaultSchedules(),
  students: defaultStudents(),
  attendance: defaultAttendance(),
  grades: defaultGrades(),
};

// Load data on module init (async)
loadPersistedData().then((data) => {
  dataStore = data;
});

const DEV_USERS = {
  'admin@example.com': { password: 'password123', role: 'admin' },
  'admin@gmail.com': { password: 'admin21?', role: 'admin' },
  'teacher@example.com': { password: 'password123', role: 'teacher' },
  'prof@gmail.com': { password: 'prof123', role: 'teacher' },
  'student@gmail.com': { password: 'student123', role: 'student' },
  'student@example.com': { password: 'password123', role: 'student' },
};

// Login function accepts optional role (used in dev to validate selection)
export const login = async (email, password, role) => {
  if (DEV_MODE) {
    const user = DEV_USERS[email];
    if (user && user.password === password) {
      // If selected role doesn't match, return success but indicate the real role
      if (role && role !== user.role) {
        return { token: `dev-token-${user.role}`, role: user.role, roleMismatch: true };
      }
      return { token: `dev-token-${user.role}`, role: user.role };
    }
    throw new Error('Invalid credentials (dev). Use one of the dev accounts');
  }

  try {
    const response = await api.post('/login', { email, password, role });
    return response.data; // Expected: { token: string, role: string }
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || 'Network error';
    throw new Error(message);
  }
};

// Persist data to AsyncStorage
const persistData = async () => {
  try {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(dataStore.classes)),
      AsyncStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(dataStore.schedules)),
      AsyncStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(dataStore.students)),
      AsyncStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(dataStore.attendance)),
      AsyncStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(dataStore.grades)),
    ]);
  } catch (err) {
    console.error('Error persisting data:', err);
  }
};

// Classes management (dev mock + real API wrappers)
export const getClasses = async () => {
  if (DEV_MODE) {
    // simulate network delay
    await new Promise((res) => setTimeout(res, 300));
    return dataStore.classes;
  }

  try {
    const response = await api.get('/classes');
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || 'Network error';
    throw new Error(message);
  }
};

export const createClass = async ({ name, level, subjects = [] }) => {
  if (DEV_MODE) {
    await new Promise((res) => setTimeout(res, 300));
    const id = `c${Date.now()}`;
    const newClass = { id, name, level, subjects };
    dataStore.classes = [newClass, ...dataStore.classes];
    await persistData();
    return newClass;
  }

  try {
    const response = await api.post('/classes', { name, level, subjects });
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || 'Network error';
    throw new Error(message);
  }
};

export const updateClass = async (id, updates) => {
  if (DEV_MODE) {
    await new Promise((res) => setTimeout(res, 200));
    dataStore.classes = dataStore.classes.map((c) => (c.id === id ? { ...c, ...updates } : c));
    await persistData();
    return dataStore.classes.find((c) => c.id === id);
  }

  try {
    const response = await api.put(`/classes/${id}`, updates);
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || 'Network error';
    throw new Error(message);
  }
};

export const deleteClass = async (id) => {
  if (DEV_MODE) {
    await new Promise((res) => setTimeout(res, 150));
    const exists = dataStore.classes.some((c) => c.id === id);
    dataStore.classes = dataStore.classes.filter((c) => c.id !== id);
    await persistData();
    return { success: exists };
  }

  try {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || 'Network error';
    throw new Error(message);
  }
};

// Schedule helpers (dev mock + real API wrappers)
export const getScheduleForClass = async (classId) => {
  if (DEV_MODE) {
    await new Promise((res) => setTimeout(res, 250));
    const found = dataStore.schedules.find((s) => s.classId === classId);
    if (found) return found.schedule;
    // default empty schedule template
    return {
      periods: ['08:00-09:00', '09:00-10:00', '10:30-11:30', '11:30-12:30', '14:00-15:00'],
      days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
      slots: {},
    };
  }

  try {
    const response = await api.get(`/classes/${classId}/schedule`);
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || 'Network error';
    throw new Error(message);
  }
};

export const saveScheduleForClass = async (classId, schedule) => {
  if (DEV_MODE) {
    await new Promise((res) => setTimeout(res, 250));
    const idx = dataStore.schedules.findIndex((s) => s.classId === classId);
    if (idx >= 0) dataStore.schedules[idx].schedule = schedule;
    else dataStore.schedules.push({ classId, schedule });
    await persistData();
    return schedule;
  }

  try {
    const response = await api.post(`/classes/${classId}/schedule`, schedule);
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || 'Network error';
    throw new Error(message);
  }
};

// Students & attendance (dev mocks)
export const getStudentsForClass = async (classId) => {
  if (DEV_MODE) {
    await new Promise((res) => setTimeout(res, 200));
    return dataStore.students[classId] || [];
  }
  try {
    const response = await api.get(`/classes/${classId}/students`);
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || 'Network error';
    throw new Error(message);
  }
};

export const markAttendance = async (classId, date, attendanceMap) => {
  // Sauvegarde les absences localement (AsyncStorage) ET dans Firebase
  await new Promise((res) => setTimeout(res, 150));
  
  // 1. Sauvegarde locale
  dataStore.attendance[classId] = dataStore.attendance[classId] || {};
  dataStore.attendance[classId][date] = attendanceMap;
  await persistData();
  
  console.log('🔄 markAttendance called:', { classId, date, attendanceMap });
  
  // 2. Sauvegarde dans Firebase pour chaque étudiant
  for (const [studentId, status] of Object.entries(attendanceMap)) {
    // Seules les absences (status === 'absent') sont enregistrées dans Firebase
    if (status === 'absent') {
      const studentDocRef = doc(db, 'students', studentId);
      
      try {
        // Récupérer les absences actuelles
        const studentSnapshot = await getDoc(studentDocRef);
        
        if (!studentSnapshot.exists()) {
          console.warn(`⚠️ Student document ${studentId} doesn't exist in Firebase`);
          continue;
        }
        
        const studentData = studentSnapshot.data();
        let currentAbsences = studentData?.absences;
        
        // Si absences n'existe pas, initialiser comme tableau vide
        if (!Array.isArray(currentAbsences)) {
          currentAbsences = [];
        }
        
        // Ajouter la date si elle n'existe pas déjà
        if (!currentAbsences.includes(date)) {
          const newAbsences = [...currentAbsences, date];
          
          await updateDoc(studentDocRef, {
            absences: newAbsences
          });
          console.log(`✅ Absence recorded for ${studentId} on ${date}. Total absences: ${newAbsences.length}`);
        } else {
          console.log(`ℹ️ Absence already recorded for ${studentId} on ${date}`);
        }
      } catch (error) {
        console.error(`❌ Error updating absence for ${studentId}:`, error.code, error.message);
      }
    }
  }
  
  console.log(`✅ Attendance for ${date} saved locally`);
  return { success: true };
};

export const getAttendanceForDate = async (classId, date) => {
  // ATTENTION: Lecture UNIQUEMENT depuis le stockage local
  // Les données ne viennent jamais de Firebase
  await new Promise((res) => setTimeout(res, 150));
  return (dataStore.attendance[classId] && dataStore.attendance[classId][date]) || {};
};

export const getGradesForClass = async (classId, subject) => {
  // Lit les notes depuis AsyncStorage (cache local)
  // et depuis Firebase si disponible
  await new Promise((res) => setTimeout(res, 150));
  const classGrades = dataStore.grades[classId] || {};
  const subjGrades = classGrades[subject] || {};
  return subjGrades; // { studentId: grade }
};

export const saveGradesForClass = async (classId, subject, gradesMap) => {
  // Sauvegarde les notes localement (AsyncStorage) ET dans Firebase
  await new Promise((res) => setTimeout(res, 150));
  
  // 1. Sauvegarde locale
  dataStore.grades[classId] = dataStore.grades[classId] || {};
  dataStore.grades[classId][subject] = gradesMap;
  await persistData();
  
  // 2. Sauvegarde dans Firebase pour chaque étudiant
  try {
    for (const [studentId, grade] of Object.entries(gradesMap)) {
      const studentDocRef = doc(db, 'students', studentId);
      
      // Mise à jour du document étudiant
      await updateDoc(studentDocRef, {
        [`grades.${subject}`]: grade
      });
    }
    console.log(`✅ Grades for ${subject} saved to Firebase`);
  } catch (error) {
    console.warn('Warning: Could not save to Firebase, but saved locally:', error.message);
    // Continue même si Firebase échoue, les données locales sont sauvegardées
  }
  
  return { success: true };
};

// ============================================
// Firestore Student-Specific Functions
// ============================================

/**
 * Get student profile data from Firestore
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<Object>} Student profile with studentId, classId, name, etc.
 */
export const getStudentProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('Profil étudiant introuvable');
    }
    const userData = userDoc.data();
    
    if (userData.role !== 'student') {
      throw new Error('Cet utilisateur n\'est pas un étudiant');
    }
    
    return {
      userId: userId,
      studentId: userData.studentId,
      classId: userData.classId,
      name: userData.name,
      email: userData.email,
    };
  } catch (error) {
    console.error('Error getting student profile:', error);
    throw error;
  }
};

/**
 * Get student-specific grades from Firestore
 * Lit les notes depuis Firebase (synchronisées par le professeur)
 * @param {string} studentId - Student ID (s1, s2, etc.)
 * @returns {Promise<Object>} Grades object { subject: grade }
 */
export const getStudentGrades = async (studentId) => {
  try {
    const studentDoc = await getDoc(doc(db, 'students', studentId));
    if (!studentDoc.exists()) {
      return {};
    }
    const studentData = studentDoc.data();
    return studentData.grades || {};
  } catch (error) {
    console.error('Error getting student grades:', error);
    return {};
  }
};

/**
 * Get student-specific attendance from Firestore
 * Lit les dates d'absences depuis Firebase
 * L'étudiant voit UNIQUEMENT les dates où il a été absent
 * @param {string} studentId - Student ID (s1, s2, etc.)
 * @returns {Promise<Array>} Array of absence dates
 */
export const getStudentAttendance = async (studentId) => {
  try {
    console.log(`📖 Loading attendance for student ${studentId}...`);
    
    const studentDoc = await getDoc(doc(db, 'students', studentId));
    if (!studentDoc.exists()) {
      console.warn(`⚠️ Student document ${studentId} not found in Firebase`);
      return [];
    }
    
    const studentData = studentDoc.data();
    const absences = studentData?.absences || [];
    
    console.log(`✅ Loaded ${absences.length} absence dates for ${studentId}:`, absences);
    return absences;
  } catch (error) {
    console.error('❌ Error getting student attendance:', error.code, error.message);
    return [];
  }
};

/**
 * Get student's class schedule (shared by class)
 * @param {string} classId - Class ID (c1, c2, etc.)
 * @returns {Promise<Object>} Schedule object
 */
export const getStudentSchedule = async (classId) => {
  try {
    // Schedule is shared by class, so we can use the existing function
    return await getScheduleForClass(classId);
  } catch (error) {
    console.error('Error getting student schedule:', error);
    throw error;
  }
};

export default api;
