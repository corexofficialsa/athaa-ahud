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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth, db, storage } from '../firebase'
import { generateRollNumber } from '../utils/scheduleCalculator'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userData, setUserData]       = useState(null)
  const [loading, setLoading]         = useState(true)

  async function register({ email, password, username, displayName, photoFile, onboardingData, plan }) {
    console.log('[1] Creating auth user...')
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const uid  = cred.user.uid
    console.log('[2] Auth user created:', uid)

    // Photo upload is optional — skip silently if Storage isn't enabled
    let photoURL = ''
    if (photoFile) {
      try {
        console.log('[3] Uploading photo...')
        const storageRef = ref(storage, `profiles/${uid}/${photoFile.name}`)
        await uploadBytes(storageRef, photoFile)
        photoURL = await getDownloadURL(storageRef)
        console.log('[3] Photo uploaded.')
      } catch (e) {
        console.warn('[3] Photo upload skipped:', e.message)
      }
    }

    console.log('[4] Generating roll number...')
    const rollNumber = await generateUniqueRoll()
    console.log('[5] Roll number:', rollNumber)

    const data = {
      uid,
      email,
      username,
      displayName,
      photoURL,
      rollNumber,
      onboardingData,
      plan,
      createdAt: new Date().toISOString(),
      completedDays: [],
      leaves: [],
    }

    console.log('[6] Writing to Firestore...')
    await setDoc(doc(db, 'users', uid), data)
    console.log('[7] Done! Navigating...')
    setUserData(data)
    return data
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const snap = await getDoc(doc(db, 'users', cred.user.uid))
    if (snap.exists()) setUserData(snap.data())
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
    setUserData(null)
  }

  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email)
  }

  async function updateUserData(updates) {
    if (!currentUser) return
    await updateDoc(doc(db, 'users', currentUser.uid), updates)
    setUserData(prev => ({ ...prev, ...updates }))
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

  async function uploadProfilePhoto(file) {
    if (!currentUser) return
    const storageRef = ref(storage, `profiles/${currentUser.uid}/${file.name}`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    await updateUserData({ photoURL: url })
    return url
  }

  async function refreshUserData() {
    if (!currentUser) return
    const snap = await getDoc(doc(db, 'users', currentUser.uid))
    if (snap.exists()) setUserData(snap.data())
  }

  async function generateUniqueRoll() {
    try {
      for (let i = 0; i < 10; i++) {
        const roll = generateRollNumber()
        const q    = query(collection(db, 'users'), where('rollNumber', '==', roll))
        const snap = await getDocs(q)
        if (snap.empty) return roll
      }
    } catch (e) {
      console.warn('Roll number check skipped:', e.message)
    }
    // Fallback: just return a random number if Firestore query fails
    return generateRollNumber()
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      setCurrentUser(user)
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (snap.exists()) setUserData(snap.data())
      } else {
        setUserData(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const value = {
    currentUser,
    userData,
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
    uploadProfilePhoto,
    refreshUserData,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
