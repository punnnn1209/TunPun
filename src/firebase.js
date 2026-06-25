// src/firebase.js
// Firebase Realtime Database setup + small helper functions used by App.jsx.
// Data layout in the database:
//
//   /couples/{coupleId}/profiles        -> { p1: {...}, p2: {...} }
//   /couples/{coupleId}/dailyData       -> { [dateKey]: { [profileId]: { ...habitEntries } } }
//   /couples/{coupleId}/assignedTasks   -> [ {...} ]
//   /couples/{coupleId}/sharedTasks     -> [ {...} ]
//   /couples/{coupleId}/moods           -> { [dateKey]: { [profileId]: { sang/chieu/toi: {...} } } }
//   /couples/{coupleId}/gifts           -> [ {...} ]
//   /couples/{coupleId}/targets, customHabits, bonusTickets, expenses,
//                        urgencyLevels, dismissedAlerts -> rest of the app's data
//
// "coupleId" doubles as the 6-character room code shown to the user — there is
// no separate mapping table, which keeps this small and easy to reason about.

import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, update, onValue, off } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBrKBST8O8LDZFAaHvT8XKIWWkQOYkoSCU",
  authDomain: "tunpun-8ed13.firebaseapp.com",
  databaseURL: "https://tunpun-8ed13-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tunpun-8ed13",
  storageBucket: "tunpun-8ed13.firebasestorage.app",
  messagingSenderId: "848332589557",
  appId: "1:848332589557:web:2e6946bb06089f9edf38bc",
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

/* ---------------------------------------------------------------------- */
/* Room codes                                                             */
/* ---------------------------------------------------------------------- */

// Excludes visually-confusable characters (0/O, 1/I) so codes are easy to read aloud / retype.
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCoupleCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

function coupleRef(coupleId) {
  return ref(db, `couples/${coupleId}`);
}

/* ---------------------------------------------------------------------- */
/* Couple document CRUD                                                   */
/* ---------------------------------------------------------------------- */

// Returns true if a couple document already exists for this code/id.
export async function coupleExists(coupleId) {
  const snap = await get(coupleRef(coupleId));
  return snap.exists();
}

// Creates a brand new couple document (used when generating a fresh room).
export async function createCouple(coupleId, initialData) {
  await set(coupleRef(coupleId), initialData);
}

// One-off read (used to validate a join code before showing the join form).
export async function getCoupleData(coupleId) {
  const snap = await get(coupleRef(coupleId));
  return snap.exists() ? snap.val() : null;
}

// Overwrites the whole couple document. Simple and good enough for a 2-person
// app — Realtime Database pushes the result back to both devices instantly
// via subscribeCouple() below, which is what makes the UI feel live.
export async function saveCoupleData(coupleId, data) {
  await set(coupleRef(coupleId), data);
}

// Writes a single nested path without touching the rest of the document.
// Used when a partner joins, so we never clobber the other person's data
// mid-write. `path` is relative to /couples/{coupleId}, e.g. "profiles/p2".
export async function setCouplePath(coupleId, path, value) {
  await set(ref(db, `couples/${coupleId}/${path}`), value);
}

// Subscribes to realtime updates for a couple's document. Calls `callback`
// immediately with the current value, then again every time either device
// writes a change. If `onError` is given, it fires on read errors (most often
// a Firebase Realtime Database rules/permission problem) instead of hanging
// silently forever. Returns an unsubscribe function.
export function subscribeCouple(coupleId, callback, onError) {
  const r = coupleRef(coupleId);
  const handler = (snapshot) => callback(snapshot.exists() ? snapshot.val() : null);
  const errorHandler = (err) => {
    console.error("subscribeCouple error:", err);
    if (onError) onError(err);
  };
  onValue(r, handler, errorHandler);
  return () => off(r, "value", handler);
}

/* ---------------------------------------------------------------------- */
/* Local "who am I on this device" session                                */
/* ---------------------------------------------------------------------- */
// This is intentionally just localStorage, not Firebase Auth — there's no
// password, just "this browser belongs to p1 (or p2) of couple XYZ123".

const SESSION_KEY = "our_days_session";

export function saveSession(coupleId, profileId) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ coupleId, profileId }));
  } catch {
    // localStorage unavailable (private mode, etc.) — session just won't persist
  }
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}