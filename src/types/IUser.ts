import { Customer } from "./customer";

export interface User {
    id: string;
    customer: Customer;
    customerId?: string;
    firstName: string;
    lastName: string;
    email: string;
    studentId: string;
    phone: string;
    gender: string;
    ethnicity: string;
    classYear: string;
    building: string;
    floor: string;
    financialAid: string;
    lowIncome: string;
    scent: string;
    referred: string;
    expectedMajor: string;
}
