import { Customer } from "./customer";

export interface User {
    id: string;
    customer: Customer;
    customerId?: string;
    firstName: string;
    lastName: string;
    gender: string;
    email: string;
    personalEmail: string;
    studentId: string;
    accountDate: string;
    accountStatus: string;
    accountType: string;
    DOB: string;
    phone : string;
    classYear: string;
    scented : number;
    unscented : number;
    sheetPreference: string;
    uniquePin: number;

}