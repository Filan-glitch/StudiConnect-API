import { initializeApp } from "firebase-admin/app";
import { cert } from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";

let firebaseAuth: Auth | undefined;

export function getFirebaseAuth() {
  if (firebaseAuth === undefined) {
    throw new Error("Firebase not initialized");
  }

  return firebaseAuth;
}

export function firebaseSetup() {
  let instance = initializeApp({
    credential: cert({
      projectId: "studiconnect-32c08",
      privateKey: readFileSync("firebase-private.pem").toString() ?? "",
      clientEmail:
        "firebase-adminsdk-ryq7d@studiconnect-32c08.iam.gserviceaccount.com",
    }),
  });

  firebaseAuth = getAuth(instance);
}
