export interface User {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  license: string;
  licenseExpiry: string;
  vehicle: string;
  plate: string;
  profileImage?: string;
  photoURL?: string;
}