'use client';

import { createContext, ReactNode, useContext } from 'react';
import {
  QueryObserverResult,
  RefetchOptions,
  useQuery,
} from '@tanstack/react-query';
import { getUserProfile } from '@/services/user.service';
import { IUser } from '@repo/types';

interface ProfileContextType {
  user: IUser;
  refetch: (
    options?: RefetchOptions,
  ) => Promise<QueryObserverResult<any, Error>>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({
  initialUser,
  children,
}: {
  initialUser: IUser;
  children: ReactNode;
}) {
  const { data: user = initialUser, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: getUserProfile,
    initialData: initialUser,
  });

  return (
    <ProfileContext.Provider value={{ user, refetch }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const userProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('userProfile must be used within a ProfileProvider');
  }
  return context;
};
