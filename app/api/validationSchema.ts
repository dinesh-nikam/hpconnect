import { z } from "zod";

export const formSchema = z.object({
  companyName: z.string().min(1, "Company Name is required"),
  designation: z.string().optional(),
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  mobile: z.string().min(10, "Mobile No. must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
  feedback: z.string().max(1000, "Feedback must be at least 10 characters long"),
  visitedDate: z.string().min(1, "Visited Date is required"),
});
