import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth'
import {
  doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc,
} from 'firebase/firestore'
import { auth, db } from '../firebase'
import { generateRollNumber, buildSchedule } from '../utils/scheduleCalculator'

function computeSchedule(userData) {
  if (!userData?.onboardingData || !userData?.plan) return null
  const { startSurah, startDate, weekendDays, juzRatings, score } = userData.onboardingData
  try {
    return buildSchedule({
      startPage: userData.onboardingData.startPage || 1,
      startDate,
      weekendDays: weekendDays || [],
      juzRatings:  juzRatings  || [],
      performanceScore: score || userData.plan.performanceScore || 0,
    })
  } catch {
    return null
  }
}

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userData, setUserData]       = useState(null)
  const [schedule,  setSchedule]      = useState(null)
  const [loading, setLoading]         = useState(true)

  function applyUserData(data) {
    setUserData(data)
    if (data) setSchedule(computeSchedule(data))
    else      setSchedule(null)
  }

  async function register({ email, password, username, displayName, photoFile, onboardingData, plan }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const uid  = cred.user.uid

    // Force auth token so Firestore rules see request.auth immediately
    await cred.user.getIdToken(true)

    // Skip photo upload during registration — upload after from Profile to avoid hangs
    const photoURL = ''

    const rollNumber = await generateUniqueRoll()

    // Store plan WITHOUT the full schedule (too large) — recompute on client
    const planMeta = {
      totalDays:               plan.totalDays,
      totalNewPages:           plan.totalNewPages,
      estimatedCompletionDate: plan.estimatedCompletionDate,
      performanceScore:        plan.performanceScore,
    }

    const data = {
      uid,
      email,
      username,
      displayName,
      photoURL,
      rollNumber,
      onboardingData,
      plan: planMeta,
      createdAt: new Date().toISOString(),
      completedDays: [],
      leaves: [],
    }

    // 15-second timeout so it never hangs silently
    await Promise.race([
      setDoc(doc(db, 'users', uid), data),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Registration timed out. Please check your internet and try again.')), 15000)),
    ])

    applyUserData(data)
    return data
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const snap = await getDoc(doc(db, 'users', cred.user.uid))
    if (snap.exists()) applyUserData(snap.data())
    return cred
  }

  async function loginByUsername(username, password) {
    const q    = query(collection(db, 'users'), where('username', '==', username.trim()))
    const snap = await getDocs(q)
    if (snap.empty) throw new Error('Username not found')
    const email = snap.docs[0].data().email
    return login(email, password)
  }

  async function loginByRoll(rollNumber) {
    const q    = query(collection(db, 'users'), where('rollNumber', '==', rollNumber))
    const snap = await getDocs(q)
    if (snap.empty) throw new Error('Student not found')
    return snap.docs[0].data()
  }

  async function logout() {
    await signOut(auth)
    applyUserData(null)
  }

  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email)
  }

  async function updateUserData(updates) {
    if (!currentUser) return
    await updateDoc(doc(db, 'users', currentUser.uid), updates)
    applyUserData({ ...userData, ...updates })
  }

  async function markDayComplete(dayKey, isLeave, leaveReason) {
    if (!currentUser) return
    const entry = {
      date: dayKey,
      completedAt: new Date().toISOString(),
      isLeave: isLeave || false,
      leaveReason: leaveReason || '',
    }
    const current = userData?.completedDays || []
    const updated = [...current.filter(d => d.date !== dayKey), entry]
    await updateUserData({ completedDays: updated })
  }

  async function addLeave(date, reason) {
    if (!currentUser) return
    const leaves = userData?.leaves || []
    const updated = [...leaves.filter(l => l.date !== date), { date, reason, addedAt: new Date().toISOString() }]
    await updateUserData({ leaves: updated })
  }


  async function refreshUserData() {
    if (!currentUser) return
    const snap = await getDoc(doc(db, 'users', currentUser.uid))
    if (snap.exists()) applyUserData(snap.data())
  }

  async function generateUniqueRoll() {
    try {
      const roll = generateRollNumber()
      const q    = query(collection(db, 'users'), where('rollNumber', '==', roll))
      await Promise.race([
        getDocs(q),
        new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 4000)),
      ])
      return roll
    } catch {
      return generateRollNumber()
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      setCurrentUser(user)
      if (user) {
        try {
          const snap = await Promise.race([
            getDoc(doc(db, 'users', user.uid)),
            new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 6000)),
          ])
          if (snap.exists()) applyUserData(snap.data())
          else applyUserData(null)
        } catch {
          applyUserData(null)
        }
      } else {
        applyUserData(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const value = {
    currentUser,
    userData,
    schedule,
    loading,
    register,
    login,
    loginByUsername,
    loginByRoll,
    logout,
    resetPassword,
    updateUserData,
    markDayComplete,
    addLeave,
    refreshUserData,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
