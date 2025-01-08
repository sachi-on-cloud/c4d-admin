import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, DISTRICT_LIST, STATE_LIST, THALUK_LIST } from '@/utils/constants';
import { Button, Input, List, ListItem } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import { ACCOUNT_EDIT_SCHEMA } from '@/utils/validations';

const AccountEdit = () => {
    const [accountVal, setAccountVal] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchItem(id);
    }, [id]);

    const fetchItem = async (itemId) => {
        const data = await ApiRequestUtils.get(`${API_ROUTES.GET_ACCOUNT_BY_ID}/${itemId}`);
        console.log(' data - Fetch Item :', data?.data);
        setAccountVal(data.data);
    };

    const initialValues = {
        name: accountVal?.name || "",
        phoneNumber: accountVal?.phoneNumber ? accountVal?.phoneNumber.replace(/^(\+91)/, '') : "",
        type: accountVal?.type || "",
        email: accountVal?.email || "",
        street: accountVal?.street || "",
        thaluk: accountVal?.thaluk || "",
        district: accountVal?.district || "",
        state: accountVal?.state || "",
        pincode: accountVal?.pincode || "",
        image1: accountVal?.Proofs ? accountVal?.Proofs[0]?.image1 : ''
    };

    const onSubmit = async (values, { setSubmitting, resetForm }) => {
        console.log('onSubmit :', values)
        try {
            const formData = new FormData();

            formData.append('accountId', accountVal.id);
            formData.append('name', values.name);
            formData.append('phoneNumber', values.phoneNumber);
            formData.append('email', values.email);
            formData.append('street', values.street);
            formData.append('thaluk',values.thaluk);
            formData.append('district', values.district);
            formData.append('state', values.state);
            formData.append('pincode', values.pincode);
            formData.append('documentId', accountVal?.Proofs[0]?.id );
            if (imagePreview) {
                formData.append('image1', values.image1);
                formData.append('extImage1', values.image1.name.split('.')[1]);
                formData.append('fileTypeImage1', values.image1.type);
            }
            formData.append('type', values.type);
            
            const data = await ApiRequestUtils.updateDocs(API_ROUTES.UPDATE_ACCOUNT, formData);
            console.log('data in driver UPDATE :', data);
            navigate('/dashboard/vendors/account', {
                state: {
                    accountUpdated: true,
                    accountName: data?.data?.name
                }
            });

        } catch (error) {
            console.error('Error creating driver and car:', error);
        }
        setSubmitting(false);
    };

    const districtOptions = DISTRICT_LIST.map(district => ({
        id: district.value,
        name: district.label
    }));

    const thalukOptions = THALUK_LIST.map(thaluk => ({
        id: thaluk.value,
        name: thaluk.label
    }));

    const stateOptions = STATE_LIST.map(state => ({
        id: state.value,
        name: state.label
    }));

    return (
        <div className="p-4 mx-auto">
            <h2 className="text-2xl font-bold mb-4">Update Account</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={ACCOUNT_EDIT_SCHEMA}
                onSubmit={onSubmit}
                enableReinitialize={true}
            >
                {({ handleSubmit, values, errors, dirty, isValid, handleChange, setFieldValue }) => (                    
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
                                <label htmlFor="type" className="text-sm font-medium text-gray-700">Type</label>
                                <Field as="select" name="type" className="p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                    <option value="">Select Type</option>
                                    <option value="Individual">Individual</option>
                                    <option value="Company">Company</option>
                                </Field>
                                <ErrorMessage name="type" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                                <Field type="text" name="email" className="p-2 w-full rounded-md shadow-sm border-gray-300" />
                                <ErrorMessage name="email" component="div" className="text-red-500 text-sm my-1" />
                            </div>

                            <div>
                                <label htmlFor="street" className="text-sm font-medium text-gray-700">Street Name</label>
                                <Field type="text" name="street" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="street" component="div" className="text-red-500 text-sm my-1" />
                            </div>

                            
                            <div>
                                <label htmlFor="thaluk" className="text-sm font-medium text-gray-700">
                                    Thaluk
                                </label>
                                <select
                                    id="thaluk"
                                    name="thaluk"
                                    value={values.thaluk}
                                    onChange={(e) => setFieldValue('thaluk', e.target.value)}
                                    className="p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                                >
                                    <option value="" disabled>Select Thaluk</option>
                                    {thalukOptions.map((thaluk) => (
                                        <option key={thaluk.id} value={thaluk.id}>
                                            {thaluk.name}
                                        </option>
                                    ))}
                                </select>
                                <ErrorMessage name="thaluk" component="div" className="text-red-500 text-sm mt-1" />
                            </div>
                            <div>
                                <label htmlFor="district" className="text-sm font-medium text-gray-700">
                                    District
                                </label>
                                <select
                                    id="district"
                                    name="district"
                                    value={values.district}
                                    onChange={(e) => setFieldValue('district', e.target.value)}
                                    className="p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                                >
                                    <option value="" disabled>Select District</option>
                                    {districtOptions.map((district) => (
                                        <option key={district.id} value={district.id}>
                                            {district.name}
                                        </option>
                                    ))}
                                </select>
                                <ErrorMessage name="district" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div>
                                <label htmlFor="state" className="text-sm font-medium text-gray-700">
                                    State
                                </label>
                                <select
                                    id="state"
                                    name="state"
                                    value={values.state}
                                    onChange={(e) => setFieldValue('state', e.target.value)}
                                    className="p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                                >
                                    <option value="" disabled>Select State</option>
                                    {stateOptions.map((state) => (
                                        <option key={state.id} value={state.id}>
                                            {state.name}
                                        </option>
                                    ))}
                                </select>
                                <ErrorMessage name="state" component="div" className="text-red-500 text-sm mt-1" />
                            </div>


                            <div>
                                <label htmlFor="pincode" className="text-sm font-medium text-gray-700">Pincode</label>
                                <Field type="text" name="pincode" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="pincode" component="div" className="text-red-500 text-sm my-1" />
                            </div>
                            <div>
                                <label htmlFor="image1" className="text-sm font-medium text-gray-700">
                                    Aadhaar Image
                                </label>
                                <div className="mt-1">
                                    <div className="relative w-40 h-40 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
                                        {values?.image1 ? (
                                            <img
                                                src={imagePreview ? imagePreview : values?.image1}
                                                alt="Preview"
                                                className="w-full h-full object-contain rounded-md"
                                            />
                                        ) : (
                                            <div className="text-gray-500 font-medium p-2">No image selected. Click below to upload.</div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="image1"
                                        name='image1'
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setFieldValue("image1", file);

                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setImagePreview(reader.result);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="hidden" // Hide the native input
                                    />
                                    <label
                                        htmlFor="image1"
                                        className="p-2 mt-2 inline-block text-center text-white border border-gray-400 bg-black rounded-xl cursor-pointer"
                                    >
                                        Upload Image
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-row'>
                            <Button
                                fullWidth
                                onClick={() => { navigate('/dashboard/vendors/account'); }}
                                className='my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl'
                            >
                                Back
                            </Button>
                            <Button
                                fullWidth
                                color="black"
                                onClick={handleSubmit}
                                disabled={!dirty || !isValid}
                                className='my-6 mx-2'
                            >
                               Update
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AccountEdit;