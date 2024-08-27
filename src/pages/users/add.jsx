import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import { Alert, Button } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import Multiselect from 'multiselect-react-dropdown';

const UserAdd = () => {
    const [userVal, setUserVal] = useState({});
    const [alert, setAlert] = useState(false);
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const options = [
        { id: 'Customers', name: 'Customers' },
        { id: 'Drivers', name: 'Drivers' },
        { id: 'Users', name: 'Users' },
        { id: 'Bookings', name: 'Bookings' },
    ];
    useEffect(() => {
        if (isEditMode) {
            fetchItem(id);
        }
    }, [id, isEditMode]);
    const fetchItem = async (itemId) => {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_USER_BY_ID + `${itemId}`);
        setUserVal(data.data);
    };
    const initialValues = {
        name: userVal?.name || "",
        phoneNumber: userVal?.phoneNumber || "",
        email: userVal?.email || "",
        password: "",
        permission: userVal?.permission || ""
    };

    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required'),
        phoneNumber: Yup.string().matches(/^[0-9]{10}$/, 'Must be a valid 10-digit number').required('Phone number is required'),
        email: Yup.string()
            .email('Invalid email address')
            .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/, 'Invalid email address')
            .required('Email address is required'),
        permission: Yup.array()
            .of(Yup.string().required('Each permission must be selected'))
            .required('At least one permission must be selected')
            .min(1, 'At least one permission must be selected'),
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
                permission: values.permission
            };
            let data;
            if (isEditMode) {
                userData['userId'] = id;
                data = await ApiRequestUtils.update(API_ROUTES.UPDATE_USER, userData);
            } else {
                userData['password'] = values.password;
                data = await ApiRequestUtils.post(API_ROUTES.ADD_USER, userData);
            }
            if (!data?.success && data?.code === 203) {
                setAlert(true);

                setTimeout(() => {
                    setAlert(false);
                }, 2000)
            } else {
                resetForm();
                console.log('User created:', data.data);
                navigate('/dashboard/users');
            }

        } catch (error) {
            console.error('Error creating user and car:', error);
            // Handle error (e.g., show an error message)
        }
        setSubmitting(false);
    };

    return (
        <div className="p-4 mx-auto">
            {alert && <div className='mb-2'>
                <Alert
                    color='red'
                    className='py-3 px-6 rounded-xl'
                >
                    User already exist!
                </Alert>
            </div>}
            <h2 className="text-2xl font-bold mb-4">Add New User</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
                enableReinitialize={true}

            >
                {({ handleSubmit, values, dirty, isValid, setFieldValue }) => (
                    <Form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">

                            <div>
                                <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                                <Field type="text" name="name" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
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
                            <div>
                                <label htmlFor="permission" className="text-sm font-medium text-gray-700">Permission</label>
                                <Multiselect
                                    options={options}
                                    displayValue="name"
                                    selectedValues={options.filter(option => values.permission.includes(option.id))}
                                    onSelect={(selectedList) => {
                                        setFieldValue("permission", selectedList.map(item => item.id));
                                    }}
                                    onRemove={(selectedList) => {
                                        setFieldValue("permission", selectedList.map(item => item.id));
                                    }}
                                    placeholder="Select options"
                                    className="w-full rounded-md border-gray-300"
                                    showCheckbox={true}
                                />
                            </div>


                        </div>
                        <div className='flex flex-row'>
                            <Button
                                fullWidth
                                onClick={() => { navigate('/dashboard/users'); }}
                                className='my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl'
                            >
                                Cancel
                            </Button>
                            <Button
                                fullWidth
                                color="black"
                                onClick={handleSubmit}
                                disabled={isEditMode ? false : !dirty || !isValid}
                                className='my-6 mx-2'
                            >
                                {isEditMode ? 'Update' : 'Continue'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default UserAdd;