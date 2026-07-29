import * as yup from "yup";

export const ExpenseSchema = yup.object().shape({
  title: yup
    .string()
    .required("Title is required")
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be less than 100 characters"),

  description: yup
    .string()
    .max(200, "Description must be less than 200 characters")
    .nullable(),

  amount: yup
    .number()
    .typeError("Amount must be a number")
    .required("Amount is required")
    .positive("Amount must be greater than 0")
    .max(999999999, "Amount is too large"),

  category: yup
    .string()
    .required("Category is required"),

  type: yup
    .string()
    .oneOf(["Income", "Expense"], "Type must be Income or Expense")
    .required("Type is required"),
});