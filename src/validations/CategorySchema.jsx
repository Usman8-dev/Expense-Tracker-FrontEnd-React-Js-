import * as yup from "yup";

export const CategorySchema = yup.object().shape({
  name: yup
    .string()
    .required("Category name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .trim(),
});