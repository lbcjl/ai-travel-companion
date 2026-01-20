import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { User } from '../types'

// Ensure this matches backend User entity

interface AuthContextType {
	user: User | null
	login: (token: string, user: User) => void
	logout: () => void
	isAuthenticated: boolean
	isLoading: boolean
	updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const token = localStorage.getItem('token')
		const savedUser = localStorage.getItem('user')
		if (token && savedUser) {
			try {
				setUser(JSON.parse(savedUser))
				// Detect browser timezone
				const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
				axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
				axios.defaults.headers.common['X-Timezone'] = timezone
			} catch (e) {
				console.error('Failed to parse user from local storage', e)
				localStorage.removeItem('token')
				localStorage.removeItem('user')
			}
		} else {
			// Even if not logged in, set timezone for guest users (if we had guest mode)
			// But here we just set it generally
			const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
			axios.defaults.headers.common['X-Timezone'] = timezone
		}
		setLoading(false)
	}, [])

	const login = (token: string, userData: User) => {
		localStorage.setItem('token', token)
		localStorage.setItem('user', JSON.stringify(userData))
		axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
		axios.defaults.headers.common['X-Timezone'] =
			Intl.DateTimeFormat().resolvedOptions().timeZone
		setUser(userData)
	}

	const logout = () => {
		localStorage.removeItem('token')
		localStorage.removeItem('user')
		delete axios.defaults.headers.common['Authorization']
		setUser(null)
	}

	const updateUser = (userData: User) => {
		setUser(userData)
		localStorage.setItem('user', JSON.stringify(userData))
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				login,
				logout,
				isAuthenticated: !!user,
				isLoading: loading,
				updateUser,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) throw new Error('useAuth must be used within an AuthProvider')
	return context
}
