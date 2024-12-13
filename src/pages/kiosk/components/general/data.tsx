import {countries} from "@/constants/countries";
import * as yup from "yup";
export const kioskSchema = yup.object({
  type: yup.string().oneOf(["OPEN", "AUTH"]).default("OPEN"),
  name: yup.string().required("Name is required").trim(),
  sheets_per_transaction: yup.number().integer(),
  answer_required: yup.boolean(),
  customerId: yup.number().integer().optional(),
  location: yup.object({
    location: yup.string().required("Location is required"),
    tag: yup.string().required("Tag is required"),
    country: yup.string().required("Country is required"),
    state: yup.string().required("State is required"),
    city: yup.string().required("City is required"),
    address: yup.string().required("Address is required"),
    zip: yup.string().required("Zip code is required"),
  }),
  onSiteContact: yup.object({
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    phone: yup.string().required("Phone is required"),
    email: yup.string().email().required("Email is required"),
  })
});
