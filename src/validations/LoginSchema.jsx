import * as yup from 'yup'

export const LoginSchema = yup.object({
    email: yup.string().email('Invalid Email').required('Email is required'),
    password: yup.string().required('Password is required'),
})