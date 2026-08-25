import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  AuthPayload,
  User,
  UserRole,
} from "../types";

import {
  login as loginRequest,
  register as registerRequest,
} from "../services/auth";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  login: (
    email: string,
    password: string,
    expectedRole: UserRole,
  ) => Promise<void>;

  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;

  logout: () => void;
}

const STORAGE_KEY =
  "burdenoff-auth";

const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined);

function readStoredAuth():
  | AuthPayload
  | null {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY,
      );

    if (!raw) {
      return null;
    }

    return JSON.parse(
      raw,
    ) as AuthPayload;
  } catch {
    return null;
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [auth, setAuth] =
    useState<AuthPayload | null>(
      readStoredAuth,
    );

  function saveAuth(
    payload: AuthPayload,
  ) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(payload),
    );

    setAuth(payload);
  }

  async function login(
    email: string,
    password: string,
    expectedRole: UserRole,
  ) {
    const payload =
      await loginRequest(
        email,
        password,
      );

    if (
      payload.user.role !==
      expectedRole
    ) {
      throw new Error(
        expectedRole === "AGENT"
          ? "Invalid agent email address or password."
          : "This account is not a user account.",
      );
    }

    saveAuth(payload);
  }

  async function register(
    name: string,
    email: string,
    password: string,
  ) {
    const payload =
      await registerRequest(
        name,
        email,
        password,
      );

    if (
      payload.user.role !==
      "REPORTER"
    ) {
      throw new Error(
        "Unable to create user account.",
      );
    }

    saveAuth(payload);
  }

  function logout() {
    localStorage.removeItem(
      STORAGE_KEY,
    );

    setAuth(null);
  }

  const value =
    useMemo<AuthContextValue>(
      () => ({
        user:
          auth?.user ?? null,

        token:
          auth?.token ?? null,

        isAuthenticated:
          Boolean(
            auth?.token &&
              auth.user,
          ),

        login,
        register,
        logout,
      }),
      [auth],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth():
  AuthContextValue {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}