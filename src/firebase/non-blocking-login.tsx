
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
} from 'firebase/auth';

/**
 * Initiates anonymous sign-in (non-blocking) with callbacks.
 * @param authInstance The Firebase Auth instance.
 * @param onSuccess Callback function on successful sign-in, receives the User object.
 * @param onError Callback function on sign-in failure, receives the Error object.
 */
export function initiateAnonymousSignIn(
  authInstance: Auth,
  onSuccess: (user: User | null) => void,
  onError: (error: Error) => void
): void {
  signInAnonymously(authInstance)
    .then(userCredential => {
      onSuccess(userCredential.user);
    })
    .catch(error => {
      onError(error);
    });
}


/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await createUserWithEmailAndPassword(...)'.
  createUserWithEmailAndPassword(authInstance, email, password);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
