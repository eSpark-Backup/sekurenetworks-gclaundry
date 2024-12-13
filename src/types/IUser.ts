import { Customer } from "./customer";

export interface User {
    id: string;
    customer: Customer;
    customerId?: string;
    firstName: string;
    lastName: string;
    email: string;
}