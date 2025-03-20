export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'author' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
}