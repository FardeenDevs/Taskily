
"use client";

import { useAuthState } from 'react-firebase-hooks/auth';
import { useAuth, useFirestore } from '@/firebase';
import { useDoc } from '../firestore/use-doc';
import { doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';

type UserProfile = {
  displayName: string;
  email: string;
  photoURL: string;
};

export type AppUser = FirebaseUser & {
    profile?: UserProfile;
};

export function useUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, loading, error] = useAuthState(auth);
  
  const userDocRef = user ? doc(firestore, 'users', user.uid) : null;
  const { data: profile, loading: profileLoading } = useDoc<UserProfile>(userDocRef);

  const [appUser, setAppUser] = useState<AppUser | null>(null);

  useEffect(() => {
    if (user) {
      const combinedUser: AppUser = {
        ...user,
        profile: profile
      };
      // To ensure displayName is always available, even if profile is loading
      if (!combinedUser.displayName && profile?.displayName) {
        combinedUser.displayName = profile.displayName;
      }
      setAppUser(combinedUser);
    } else {
      setAppUser(null);
    }
  }, [user, profile]);

  return { user: appUser, loading: loading || profileLoading, error };
}
