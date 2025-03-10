// Versão simplificada do AuthContext.tsx sem dependência de getState
import React, {createContext, useState, useEffect, ReactNode} from "react";
import {onAuthStateChanged, updateEmail, updateProfile} from "firebase/auth";
import {router} from "expo-router";

import {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
} from "../services/authService";
import {auth, firestore} from "../firebaseConfig"; // ajuste o caminho conforme necessário
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";

export interface User {
  id: string;
  uid: string;
  name: string;
  email: string | null;
  photoUrl?: string;
  phone?: string;
  license?: string;
  licenseExpiry?: string;
  vehicle?: string;
  plate?: string;
  profileImage?: string;
}

export interface AuthContextData {
  user: User | null;
  loading: boolean;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  resetPassword: (
    email: string
  ) => Promise<{success: boolean; error: string | null}>;
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Configurando listener de autenticação");

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("Estado de autenticação alterado:", !!firebaseUser);

      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          photoUrl: firebaseUser.photoURL || "",
        };
        console.log("Definindo usuário no estado:", userData);
        setUser(userData);
      } else {
        console.log("Nenhum usuário autenticado");
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      console.log("Desvinculando listener de autenticação");
      unsubscribe();
    };
  }, []);

  const signup = async (name: string, email: string, password: string) => {
    console.log("Iniciando cadastro:", {name, email});
    setLoading(true);

    try {
      const {user: newUser, error} = await registerUser(name, email, password);

      if (error) {
        console.error("Erro retornado pelo registerUser:", error);
        throw new Error(error);
      }

      console.log("Cadastro bem-sucedido:", !!newUser);

      // Forçamos o redirecionamento explícito após cadastro
      // Pequeno delay para garantir que o Firebase tenha tempo de processar
      // e o listener onAuthStateChanged seja chamado antes
      setTimeout(() => {
        router.replace("/(auth)/home");
      }, 500);
    } catch (error) {
      console.error("Erro no cadastro:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log("Iniciando login:", {email});
    setLoading(true);

    try {
      const {user: loggedUser, error} = await loginUser(email, password);

      if (error) {
        console.error("Erro retornado pelo loginUser:", error);
        throw new Error(error);
      }

      console.log("Login bem-sucedido:", !!loggedUser);

      // Forçamos o redirecionamento explícito após login
      // Pequeno delay para garantir que o Firebase tenha tempo de processar
      // e o listener onAuthStateChanged seja chamado antes
      setTimeout(() => {
        router.replace("/(auth)/home");
      }, 500);
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log("Iniciando logout");
    setLoading(true);

    try {
      const {success, error} = await logoutUser();

      if (!success && error) {
        console.error("Erro retornado pelo logoutUser:", error);
        throw new Error(error);
      }

      console.log("Logout bem-sucedido");

      // Redirecionamento explícito após logout
      router.replace("/(public)/login");
    } catch (error) {
      console.error("Erro no logout:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    console.log("Solicitando reset de senha para:", email);
    setLoading(true);

    try {
      const result = await resetPassword(email);
      console.log("Resultado do reset de senha:", result);
      return result;
    } catch (error) {
      console.error("Erro ao solicitar reset de senha:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    } finally {
      setLoading(false);
    }
  };
  
  const updateUserProfile = async (userData: Partial<User>) => {
    if (!user || !auth.currentUser) {
      throw new Error("Usuário não autenticado");
    }

    setLoading(true);

    try {
      const currentUser = auth.currentUser;
      const updates: Partial<User> = {};

      if (userData.name && userData.name !== user.name) {
        await updateProfile(currentUser, {displayName: userData.name});
        updates.name = userData.name;
      }

      if (userData.email && userData.email !== user.email) {
        await updateEmail(currentUser, userData.email);
        updates.email = userData.email;
      }

      if (
        userData.profileImage &&
        userData.profileImage !== user.profileImage
      ) {
        await updateProfile(currentUser, {photoURL: userData.profileImage});
        updates.photoUrl = userData.profileImage;
        updates.profileImage = userData.profileImage;
      }

      const userDocRef = doc(firestore, "users", user.id);

      const firestoreUpdates: Record<string, any> = {
        updatedAt: serverTimestamp(),
      };

      Object.keys(userData).forEach((key) => {
        if (key !== "id" && userData[key as keyof User] !== undefined) {
          firestoreUpdates[key as keyof User] = userData[key as keyof User]!;
        }
      });

      await updateDoc(userDocRef, firestoreUpdates);

      setUser((prev) => (prev ? {...prev, ...updates, ...userData} : null));
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        updateUserProfile,
        login,
        logout,
        resetPassword: requestPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
