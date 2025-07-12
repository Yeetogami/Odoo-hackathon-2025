"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

interface User {
  id: number
  username: string
  email: string
  is_admin: boolean
  created_at: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  backendAvailable: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [backendAvailable, setBackendAvailable] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
      apiClient.setToken(storedToken)
      fetchCurrentUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const userData = await apiClient.getCurrentUser()
      setUser(userData)
      setBackendAvailable(true)
    } catch (error: any) {
      console.error("Failed to fetch current user:", error)
      if (error.message.includes("Unable to connect to server")) {
        setBackendAvailable(false)
      } else {
        logout()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password)
      setToken(response.access_token)
      setUser(response.user)
      localStorage.setItem("token", response.access_token)
      apiClient.setToken(response.access_token)
      setBackendAvailable(true)
    } catch (error: any) {
      if (error.message.includes("Unable to connect to server")) {
        setBackendAvailable(false)
        throw new Error("Backend server is not running. Please start the server and try again.")
      }
      throw error
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await apiClient.register(username, email, password)
      setToken(response.access_token)
      setUser(response.user)
      localStorage.setItem("token", response.access_token)
      apiClient.setToken(response.access_token)
      setBackendAvailable(true)
    } catch (error: any) {
      if (error.message.includes("Unable to connect to server")) {
        setBackendAvailable(false)
        throw new Error("Backend server is not running. Please start the server and try again.")
      }
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    apiClient.setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, backendAvailable }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
