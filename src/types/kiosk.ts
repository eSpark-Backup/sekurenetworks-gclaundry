import { Customer } from "./customer";
import { onSiteContact } from "./onSiteContact";

interface Location {
    location: string;
    tag:string,
    address: string;
    country: string;
    state: string;
    city: string;
    zip: string;
}

export interface IMachineInfo {
    Resolution: string;
    SBC_Hardware_Version: string;
    SBC_Software_Version: string;
    Motor_Hardware_Version: string;
    Motor_Software_Version: string;
    MCB_Hardware_Version: string;
    MCB_Software_Version: string;
    Wifi_Name: string;
    Version: string;
}

export interface KIOSK {
    macId: string;
    type: string;
    errors: string[];
    name: string;
    sheets_per_transaction: number;
    answer_required: boolean;
    screen_sequence: string[];
    machineInfo: IMachineInfo;
    location: Location;
    scented: number;
    unscented: number;
    temperature: number;
    customerId: string | null;
    isActive: boolean;
    lastSeen: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    customer: Customer | null;
    onSiteContact: onSiteContact | null;
    status: string;
}
