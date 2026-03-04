import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import AdminDashboard from './src/screens/AdminDashboard';
import TeacherDashboard from './src/screens/TeacherDashboard';
import StudentDashboard from './src/screens/StudentDashboard';
import ClassCreationScreen from './src/screens/admin/ClassCreationScreen';
import ScheduleManagementScreen from './src/screens/admin/ScheduleManagementScreen';
import UserManagementScreen from './src/screens/admin/UserManagementScreen';
import AdminAttendanceScreen from './src/screens/admin/AdminAttendanceScreen';
import ScheduleViewScreen from './src/screens/teacher/ScheduleViewScreen';
import GradeEntryScreen from './src/screens/teacher/GradeEntryScreen';
import ClassManagementScreen from './src/screens/teacher/ClassManagementScreen';
import GradeViewScreen from './src/screens/student/GradeViewScreen';
import StudentScheduleViewScreen from './src/screens/student/ScheduleViewScreen';
import AttendanceViewScreen from './src/screens/student/AttendanceViewScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, role, loading } = useContext(AuthContext);

  if (loading) {
    // Still checking authentication
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Render separate navigators depending on auth state to ensure correct initial route
  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Determine initial route based on role
  const getInitialRoute = () => {
    if (role === 'admin') return 'AdminDashboard';
    if (role === 'teacher') return 'TeacherDashboard';
    if (role === 'student') return 'StudentDashboard';
    return 'Login'; // Fallback
  };

  // If authenticated but no role, show login (shouldn't happen, but safety check)
  if (isAuthenticated && !role) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={`${isAuthenticated}-${role}`}
        initialRouteName={getInitialRoute()}
        screenOptions={{ headerShown: false }}
      >
        {role === 'admin' && (
          <>
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="UserManagement" component={UserManagementScreen} />
            <Stack.Screen name="ClassCreation" component={ClassCreationScreen} />
            <Stack.Screen name="ScheduleManagement" component={ScheduleManagementScreen} />
            <Stack.Screen name="AdminAttendance" component={AdminAttendanceScreen} />
          </>
        )}
        {role === 'teacher' && (
          <>
            <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
            <Stack.Screen name="ScheduleView" component={ScheduleViewScreen} />
            <Stack.Screen name="GradeEntry" component={GradeEntryScreen} />
            <Stack.Screen name="ClassManagement" component={ClassManagementScreen} />
            <Stack.Screen name="ScheduleManagement" component={ScheduleManagementScreen} />
          </>
        )}
        {role === 'student' && (
          <>
            <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
            <Stack.Screen name="GradeView" component={GradeViewScreen} />
            <Stack.Screen name="ScheduleView" component={StudentScheduleViewScreen} />
            <Stack.Screen name="AttendanceView" component={AttendanceViewScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
