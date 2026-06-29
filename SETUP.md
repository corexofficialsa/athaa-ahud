# Athaa Ahud — Setup Guide

## 1. Create Firebase Project (Free)

1. Go to https://console.firebase.google.com
2. Click **Add Project** → name it "athaa-ahud" → Continue
3. Enable Google Analytics (optional) → Create project

## 2. Enable Firebase Services

### Authentication
- Firebase Console → **Authentication** → Get started
- Sign-in method → Enable **Email/Password**

### Firestore Database
- Firebase Console → **Firestore Database** → Create database
- Choose **Production mode** → Select a region close to your users (e.g. europe-west1 for Middle East)

### Storage
- Firebase Console → **Storage** → Get started → Production mode

## 3. Get Your Firebase Config

- Firebase Console → ⚙️ Project Settings → General
- Scroll to **Your apps** → Click **Web** (</>) → Register app
- Copy the `firebaseConfig` object values

## 4. Fill in .env

Open the `.env` file and replace the placeholder values with your Firebase config:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abc123
```

## 5. Set Firestore Security Rules

Firebase Console → Firestore → Rules → paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 6. Add Firestore Index

Firebase Console → Firestore → Indexes → Add composite index:
- Collection: `users`
- Fields: `rollNumber` (Ascending), `__name__` (Ascending)
- Query scope: Collection

This is needed for parent login (lookup by roll number).

## 7. Run the App

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## 8. Deploy (Free hosting on Firebase)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

---

## Admin Login

URL: yourapp.com/admin
- Username: `ATHAHUD_ADMIN`
- Password: `ATHAHUD3223!`

## Parent Login

URL: yourapp.com/parent
- Enter the student's 5-digit roll number

Students can find their roll number in the Profile tab.
