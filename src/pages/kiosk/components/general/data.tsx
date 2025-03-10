import { countries } from "@/constants/countries";
import * as yup from "yup";
export const kioskSchema = yup.object({
  type: yup.string().oneOf(["OPEN", "AUTH"]).default("OPEN"),
  name: yup.string().required("Name is required").trim(),
  sheets_per_transaction: yup
    .number()
    .integer('Must be an integer')
    .min(1, 'Must be at least 1')
    .max(10, 'Must be at most 10')
    .required('This field is required'),
  answer_required: yup.boolean(),
  customerId: yup.string().optional().nullable(),
  location: yup.object({
    location: yup.string().optional(),
    tag: yup.string().optional(),
    country: yup.string().optional(),
    state: yup.string().optional(),
    city: yup.string().optional(),
    address: yup.string().optional(),
    zip: yup.string().optional(),
  }),
  onSiteContact: yup.object({
    firstName: yup.string().optional(),
    lastName: yup.string().optional(),
    phone: yup.string().optional(),
    email: yup.string().email().optional(),
  }).nullable()
});
