'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { stat } from 'fs';


const initialForm = {
  companyName: "",
  designation: "",
  firstName: "",
  lastName: "",
  mobile: "+91",
  email: "",
  address: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
  feedback: "",
  visitedDate: "",
};

const formSchema = z.object({
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
  feedback: z.string().max(120, "Feedback must be  120 characters long"),
  visitedDate: z.string().min(1, "Visited Date is required"),
});

export default function VisitorForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Fix: check if field exists in schema shape
    if (Object.prototype.hasOwnProperty.call(formSchema.shape, name)) {
      const result = (formSchema.shape as any)[name].safeParse(value);
      setErrors((prev) => ({
        ...prev,
        [name]: result.success ? "" : result.error.issues[0].message,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      formSchema.parse(form);
      setErrors({});
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.whatsappLink) {
          alert("WhatsApp confirmation could not be sent automatically. Please contact the store if you do not receive a confirmation message.");
          setLoading(false);
          return;
        }
        router.push("/user/ThankYou");
      } else {
        let errorMsg = "Submission failed. Please try again.";
        try {
          const errorData = await res.json();
          if (errorData?.error) {
            errorMsg = `Submission failed. Error: ${errorData.error}`;
          }
        } catch (e) {
          // ignore JSON parse errors
        }
        alert(errorMsg);
      }
    } catch (err: any) {
      // Zod validation errors
      if (err.errors) {
        const fieldErrors: { [key: string]: string } = {};
        err.errors.forEach((error: any) => {
          fieldErrors[error.path[0]] = error.message;
        });
        setErrors(fieldErrors);
      } else {
        alert("An error occurred. " + (err instanceof Error ? err.message : "Please try again."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white bg-opacity-80 rounded-lg p-8 flex flex-col items-center w-full max-w-3xl mx-auto"
    >
      <h2 className="text-3xl font-extrabold text-center mb-2">
        We value your feedback!
      </h2>
      <p className="text-center text-sm mb-6">
         Please fill out the form below
      </p>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company Name */}
        <div>
          <label className="block text-xs mb-1">Company Name</label>
          <input
            name="companyName"
            placeholder="Enter Company Name"
            value={form.companyName}
            onChange={handleChange}
            className="w-full rounded bg-gray-200 p-2"
          />
          {errors.companyName && <span className="text-red-500 text-xs">{errors.companyName}</span>}
        </div>
        {/* Designation */}
        <div>
          <label className="block text-xs mb-1">Designation</label>
          <input
            name="designation"
            placeholder="Enter Designation"
            value={form.designation}
            onChange={handleChange}
            className="w-full rounded bg-gray-200 p-2"
          />
          {errors.designation && <span className="text-red-500 text-xs">{errors.designation}</span>}
        </div>
        {/* First Name */}
        <div>
          <label className="block text-xs mb-1">First Name</label>
          <input
            name="firstName"
            placeholder="Enter first Name"
            value={form.firstName}
            onChange={handleChange}
            className="w-full rounded bg-gray-200 p-2"
          />
          {errors.firstName && <span className="text-red-500 text-xs">{errors.firstName}</span>}
        </div>
        {/* Last Name */}
        <div>
          <label className="block text-xs mb-1">Last Name</label>
          <input
            name="lastName"
            placeholder="Enter last Name"
            value={form.lastName}
            onChange={handleChange}
            className="w-full rounded bg-gray-200 p-2"
          />
          {errors.lastName && <span className="text-red-500 text-xs">{errors.lastName}</span>}
        </div>
        {/* Mobile */}
        <div>
          <label className="block text-xs mb-1">Mobile No.</label>
          <input
            name="mobile"
            placeholder="Enter Mobile No."
            value={form.mobile}
            onChange={handleChange}
            className="w-full rounded bg-gray-200 p-2"
          />
          {errors.mobile && <span className="text-red-500 text-xs">{errors.mobile}</span>}
        </div>
        {/* Email */}
        <div>
          <label className="block text-xs mb-1">Email ID</label>
          <input
            name="email"
            placeholder="Enter Email ID"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded bg-gray-200 p-2"
          />
          {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
        </div>
        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-xs mb-1">Address</label>
          <input
            name="address"
            placeholder="Enter Address"
            value={form.address}
            onChange={handleChange}
            className="w-full rounded bg-gray-200 p-2"
          />
          {errors.address && <span className="text-red-500 text-xs">{errors.address}</span>}
        </div>
        {/* City */}
        <div>
          <label className="block text-xs mb-1">City</label>
          <input
            name="city"
            placeholder="Enter City"
            value={form.city}
            onChange={handleChange}
            className="w-full rounded bg-gray-200 p-2"
          />
          {errors.city && <span className="text-red-500 text-xs">{errors.city}</span>}
        </div>
        {/* State */}
        <div>
          <label className="block text-xs mb-1">State</label>
          <input
            name="state"
            placeholder="Enter State"
            value={form.state}
            onChange={handleChange}
            className="w-full rounded bg-gray-200 p-2"
          />
          {errors.state && <span className="text-red-500 text-xs">{errors.state}</span>}
        </div>
        {/* Country */}
        <div>
          <label className="block text-xs mb-1">Country</label>
          <input
            name="country"
            placeholder="Enter Country"
            value={form.country}
            onChange={handleChange}
            className="w-full rounded bg-gray-200 p-2"
          />
          {errors.country && <span className="text-red-500 text-xs">{errors.country}</span>}
        </div>
        {/* Pincode */}
        <div>
          <label className="block text-xs mb-1">Pincode</label>
          <input
            name="pincode"
            placeholder="Enter Pincode"
            value={form.pincode}
            onChange={handleChange}
            className="w-full rounded bg-gray-200 p-2"
          />
          {errors.pincode && <span className="text-red-500 text-xs">{errors.pincode}</span>}
        </div>
         {/* Visited Date */}
        <div>
          <label className="block text-xs mb-1">Visited Date</label>
          <input
            name="visitedDate"
            type="date"
            value={form.visitedDate}
            onChange={handleChange}
            min={(() => {
      const today = new Date();
      const fifteenDaysAgo = new Date(today.getTime() - (15 * 24 * 60 * 60 * 1000));
      return fifteenDaysAgo.toISOString().split('T')[0];
    })()}
    max={new Date().toISOString().split('T')[0]}
            className="w-full rounded bg-gray-200 p-2"
          />
          {errors.visitedDate && <span className="text-red-500 text-xs">{errors.visitedDate}</span>}
        </div>
        {/* Feedback */}
        <div className="md:col-span-2">
          <label className="block text-xs mb-1">Feedback</label>
          <textarea
            name="feedback"
            placeholder="Enter your feedback here"
            value={form.feedback}
            onChange={handleChange}
            className="w-full rounded bg-gray-200 p-2"
            rows={3}
          />
          {errors.feedback && <span className="text-red-500 text-xs">{errors.feedback}</span>}
        </div>
       
      </div>
      <div className="mt-6 flex flex-col items-center gap-4">
        <button
          type="submit"
          className="w-64 py-3 bg-blue-600 text-white font-bold text-lg rounded-full mt-2 hover:bg-blue-700 transition  items-center "
          disabled={loading}
        >
          {loading ? "Submitting..." : "SUBMIT"}
        </button>
      </div>
    </form>
  );
}
