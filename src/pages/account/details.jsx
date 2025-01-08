import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES} from '@/utils/constants';
import { useNavigate, useParams } from "react-router-dom";
import DocumentsList from '@/components/DocumentsList';
import { Button } from '@material-tailwind/react';
import OwnersCabList from '@/components/OwnersCabList';

const AccountDetails = ({btnShow = false}) => {
    const navigate = useNavigate();
    const [accountVal, setAccountVal] = useState({});
    const { id } = useParams();
    useEffect(() => {
        if (id) {
            fetchItem(id);
        }
    }, [id]); 
    const fetchItem = async (itemId) => {
        const data = await ApiRequestUtils.get(`${API_ROUTES.GET_ACCOUNT_BY_ID}/${itemId}`);
        setAccountVal(data.data);
    };
    const initialValues = {
        name: accountVal?.name || '',
        phoneNumber: accountVal?.phoneNumber || "",
        type: accountVal?.type || '',
        email: accountVal?.email || '',
        street: accountVal?.street || '',
        thaluk: accountVal?.thaluk || '',
        district: accountVal?.district || '',
        state: accountVal?.state || '',
        pincode: accountVal?.pincode || '',
        image1: accountVal?.Proofs ? accountVal?.Proofs[0]?.image1 : '',
        
    };

    return (
        <>
            <div className="p-4">

                <h2 className="text-2xl font-bold mb-4">Account Details</h2>
                <Formik
                    initialValues={initialValues}
                    onSubmit={() => { }}
                    enableReinitialize={true}
                >
                    {({ values }) => (
                        <Form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                                    <Field type="text" disabled name="name" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300 shadow-sm" />
                                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm my-1" />
                                </div>
                                <div>
                                    <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</label>
                                    <Field type="tel" disabled name="phoneNumber" className="p-2 w-full rounded-md bg-gray-200 border border-gray-300" maxLength={10} />
                                    <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="type" className="text-sm font-medium text-gray-700">Type</label>
                                    <Field as="select" name="type" disabled className="p-2 w-full rounded-md border-2 border-gray-300 bg-gray-200 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                        <option value="">Select Type</option>
                                        <option value="Individual">Individual</option>
                                        <option value="Company">Company</option>
                                    </Field>
                                    <ErrorMessage name="type" component="div" className="text-red-500 text-sm" />
                                </div>
                            <div>
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                                <Field type="text" name="email" disabled className="p-2 w-full rounded-md border-2 bg-gray-200 shadow-sm border-gray-300" />
                                <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="street" className="text-sm font-medium text-gray-700">Street Name</label>
                                <Field type="text" name="street" disabled className="p-2 w-full rounded-md border-2 bg-gray-200 border-gray-300 shadow-sm" />
                                <ErrorMessage name="street" component="div" className="text-red-500 text-sm my-1" />
                            </div>

                            <div>
                                <label htmlFor="thaluk" className="text-sm font-medium text-gray-700">Thaluk</label>
                                <Field type="text" name="thaluk" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200 border-2 shadow-sm" />
                                <ErrorMessage name="thaluk" component="div" className="text-red-500 text-sm my-1" />
                            </div>

                            <div>
                                <label htmlFor="district" className="text-sm font-medium text-gray-700">District</label>
                                <Field type="text" name="district" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200 border-2 shadow-sm" />
                                <ErrorMessage name="district" component="div" className="text-red-500 text-sm my-1" />
                            </div>
                            <div>
                                <label htmlFor="state" className="text-sm font-medium text-gray-700">State</label>
                                <Field type="text" name="state" disabled className="p-2 w-full rounded-md bg-gray-200 border-gray-300 border-2 shadow-sm" />
                                <ErrorMessage name="state" component="div" className="text-red-500 text-sm my-1" />
                            </div>
                            <div>
                                <label htmlFor="pincode" className="text-sm font-medium text-gray-700">Pincode</label>
                                <Field type="text" name="pincode" disabled className="p-2 w-full rounded-md border-2 bg-gray-200 border-gray-300 shadow-sm" />
                                <ErrorMessage name="pincode" component="div" className="text-red-500 text-sm my-1" />
                            </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
            {accountVal && accountVal?.Cabs && <OwnersCabList cabsList={accountVal?.Cabs}/>}
            {accountVal && accountVal?.id && <DocumentsList id={accountVal?.id} type={'account'} buttonShow={false}/>}
            <div className='flex justify-center w-full'>
                {!btnShow && <Button
                    onClick={() => { navigate('/dashboard/vendors/account'); }}
                    className='my-6 px-8 text-white border-2 rounded-xl'
                >
                    Back
                </Button>}
            </div>
        </>
    );
};

export default AccountDetails;