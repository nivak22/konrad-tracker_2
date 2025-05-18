import React from "react";
import { AuthProvider } from "./src/contexts/AuthContext";
import AppNavigator from "./screens/AppNavigator";
import Toast from "react-native-toast-message";

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
      <Toast />
    </AuthProvider>
  );
}
