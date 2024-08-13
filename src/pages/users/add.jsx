import React, {useEffect, useState} from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import { Button } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';

const UserAdd = () => {
    const [userVal, setUserVal] = useState({});
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    useEffect(() => {
        if (isEditMode) {
          fetchItem(id);
        }
      }, [id, isEditMode]);
      const fetchItem = async (itemId) => {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_USER_BY_ID+`${itemId}`);
        setUserVal(data.data);
      };
    const initialValues = {
        name: userVal?.name || "",
        phoneNumber: userVal?.phoneNumber || "",
        email: userVal?.email || "",
        password: "",
    };

    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required'),
        phoneNumber: Yup.string().matches(/^[0-9]{10}$/, 'Must be a valid 10-digit number').required('Phone number is required'),
        email: Yup.string()
        .email('Invalid email address')
        .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/, 'Invalid email address')
        .required('Email address is required'),
        ...(isEditMode
            ? {}
            : {
                password: Yup.string().required('Password is required'),
              }),
    });

    const onSubmit = async (values, { setSubmitting }) => {
        try {
            const userData = {
                name: values.name,
                phoneNumber: values.phoneNumber,
                email: values.email,
            };
            let data;
            if (isEditMode) {
                userData['userId'] = id;
                data = await ApiRequestUtils.update(API_ROUTES.UPDATE_USER, userData);
            } else {
                userData['password'] = values.password;
                data = await ApiRequestUtils.post(API_ROUTES.ADD_USER, userData);
            }
            console.log('User created:', data.data);
            navigate('/dashboard/users');
            
        } catch (error) {
            console.error('Error creating user and car:', error);
            // Handle error (e.g., show an error message)
        }
        setSubmitting(false);
    };

    return (
        <div className="p-4 mx-auto">
            <h2 className="text-2xl font-bold mb-4">Add New User</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
                enableReinitialize={true}

            >
                {({ handleSubmit, values, dirty, isValid }) => (
                    <Form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            
                            <div>
                                <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                                <Field type="text" name="name"  className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="name" component="div" className="text-red-500 text-sm my-1" />
                            </div>

                            <div>
                                <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</label>
                                <Field type="tel" name="phoneNumber" className="p-2 w-full rounded-md border-gray-300" maxLength={10} />
                                <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                                <Field type="text" name="email" className="p-2 w-full rounded-md border-gray-300" />
                                <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                            </div>
                            {!isEditMode && (
                                <div>
                                    <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                                    <Field type="text" name="password" className="p-2 w-full rounded-md border-gray-300" />
                                    <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
                                </div>
                            )}

                            
                        </div>

                        <Button
                            fullWidth
                            color="black"
                            onClick={handleSubmit}
                            disabled={!dirty || !isValid}
                            className='my-6 mx-2'
                        >
                            Continue
                        </Button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default UserAdd;