import { z } from "zod";
import { Transaction } from "./transaction";

enum KioskType {
  OPEN = "OPEN",
  CLOSED = "AUTH",
}

enum KioskStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
}

interface Location {
  location: string;
  tag:string,
  address: string;
  country: string;
  state: string;
  city: string;
  zip: string;
}

export interface MachineInfo {
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

export interface Kiosk {
  macId?: string;
  type?: KioskType;
  status?: KioskStatus;
  errors?: string[];
  name?: string;
  sheets_per_transaction?: number;
  answer_required?: boolean;
  screen_sequence?: string[];
  machineInfo?: MachineInfo;
  location?: Location;
  scented?: number;
  unscented?: number;
  isActive?: boolean;
  // customer?: Customer; 
  onSiteContact?: OnSiteContact;
  // Quotes?: Quote[];
  // Questions?: Question[];
  // logs?: Log[];
  // transactions: Transaction[];
}

interface OnSiteContact {
  id: number;
}

export const statusSchema = z.object({
  macId: z.string(),
  temperature: z.number(),
  scented: z.number(),
  unscented: z.number(),
  scented_motor_stuck: z.boolean(),
  unscented_motor_stuck: z.boolean(),
  door: z.enum(['OPEN', 'CLOSED'])
})