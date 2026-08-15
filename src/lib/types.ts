export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface MeResponse {
  user: User | null;
}

export interface CarService {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  basePrice: number;
  duration: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddOn {
  _id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type VehicleType = 'SEDAN' | 'SUV' | 'PICKUP' | 'LUXURY';

export interface Vehicle {
  _id: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  vehicleType: VehicleType;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingLocation {
  country: string;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID';

export interface BookingServiceItem {
  serviceId: string | CarService;
  addOnIds: string[] | AddOn[];
  duration?: number;
  subtotal?: number;
}

export interface Booking {
  _id: string;
  customerId: string;
  vehicleId: string | Vehicle;
  serviceId: string | CarService;
  addOnIds: string[] | AddOn[];
  services?: BookingServiceItem[];
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  subtotal: number;
  total: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  location: BookingLocation;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface NotificationData {
  bookingId?: string;
  status?: BookingStatus;
  date?: string;
  startTime?: string;
  endTime?: string;
  serviceName?: string;
  vehicleName?: string;
  total?: number;
  contactId?: string;
  name?: string;
  email?: string;
}

export interface Notification {
  _id: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  data?: NotificationData;
  read: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminDashboard {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  customers: number;
  revenue: number;
}

export interface AdminCustomer {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  bookingCount: number;
  createdAt?: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt?: string;
}

export interface ApiErrorShape {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}