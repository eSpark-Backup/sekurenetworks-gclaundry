import { KIOSK } from "./kiosk";

export interface Customer {
    id: string;
    schoolName: string;
    firstName: string;
    lastName: string;
    city: string;
    address: string;
    state: string;
    zip: string;
    email: string;
    country: string;
    phone: string;
    createdAt: string;
    updatedAt: string;
    kiosks: KIOSK[];
}