import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import { Button } from '@material-tailwind/react';
import { useParams } from 'react-router-dom';

const PriceAdd = ({ driverId, packages, selectedPackages }) => {
    const [priceVal, setPriceVal] = useState({});
    const { id } = useParams();
    const isEditMode = !!id;
    useEffect(() => {
        if (isEditMode) {
            fetchItem(id);
        }
    }, [id, isEditMode]);
    console.log(selectedPackages, packages);
    const updatedPackage = selectedPackages ? packages.filter(option => selectedPackages.includes(option.id)) : [];
    console.log("updatedPackage", updatedPackage)
    const fetchItem = async (itemId) => {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_USER_BY_ID + `${itemId}`);
        setPriceVal(data.data);
    };
    const initialValues = {
        packageId: priceVal?.packageId || "",
        price: priceVal?.price || "",
        extra_price: priceVal?.extraPrice || "",
        extraKmPrice: priceVal?.extraKmPrice || "",
        nightCharge: priceVal?.nightCharge || "",
        cancelCharge: priceVal?.cancelCharge || "",
        extraCabType: priceVal?.extraCabType || ""
    };

    const validationSchema = Yup.object({
        packageId: Yup.string().required('Package is required'),
        price: Yup.string().required('Price is required'),
        extra_price: Yup.string().required('Extra Price is required'),
        extraKmPrice: Yup.string().required('Extra KM Price is required'),
        nightCharge: Yup.string().required('Night Charge is required'),
        cancelCharge: Yup.string().required('Cancel Charge is required'),
        extraCabType: Yup.string().required('Extra Cab Price is required'),

    });

    const onSubmit = async (values, { setSubmitting }) => {
        try {
            const priceData = {
                packageId: values.packageId,
                price: values.price,
                extraPrice: values.extra_price,
                extraKmPrice: values.extraKmPrice,
                nightCharge: values.nightCharge,
                cancelCharge: values.cancelCharge,
                extraCabType: values.extraCabType
            };
            let data;
            // if (isEditMode) {
            //     priceData['priceId'] = id;
            //     data = await ApiRequestUtils.update(API_ROUTES.UPDATE_USER, priceData);
            // } else {
            priceData['driverId'] = driverId;
            data = await ApiRequestUtils.post(API_ROUTES.ADD_PRICE, priceData);
            //}
            console.log('User created:', data.data);
            navigate(`/dashboard/drivers/details/${driverId}`);

        } catch (error) {
            console.error('Error creating price:', error);
            // Handle error (e.g., show an error message)
        }
        setSubmitting(false);
    };

    return (
        <div className="p-4 mx-auto">
            <h2 className="text-2xl font-bold mb-4">Add New</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
                enableReinitialize={true}
            >
                {({ handleSubmit, values, dirty, isValid, setFieldValue }) => (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="packageId" className="text-sm font-medium text-gray-700">Packages</label>
                                <Field as="select" name="packageId" className="p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50">
                                    <option value="">Select Packages</option>
                                    {updatedPackage.map((val, index) => (
                                        <option key={index} value={val.id}>{val.period}</option>
                                    ))}
                                </Field>
                                <ErrorMessage name="packageId" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="price" className="text-sm font-medium text-gray-700">Price</label>
                                <Field type="text" name="price" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="price" component="div" className="text-red-500 text-sm my-1" />
                            </div>

                            <div>
                                <label htmlFor="extra_price" className="text-sm font-medium text-gray-700">Extra Price</label>
                                <Field type="text" name="extra_price" className="p-2 w-full rounded-md border-gray-300" maxLength={10} />
                                <ErrorMessage name="extra_price" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="extraKmPrice" className="text-sm font-medium text-gray-700">Extra KM Price</label>
                                <Field type="text" name="extraKmPrice" className="p-2 w-full rounded-md border-gray-300" />
                                <ErrorMessage name="extraKmPrice" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="nightCharge" className="text-sm font-medium text-gray-700">Night Charge</label>
                                <Field type="text" name="nightCharge" className="p-2 w-full rounded-md border-gray-300" />
                                <ErrorMessage name="nightCharge" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="cancelCharge" className="text-sm font-medium text-gray-700">Cancel Charge</label>
                                <Field type="text" name="cancelCharge" className="p-2 w-full rounded-md border-gray-300" />
                                <ErrorMessage name="cancelCharge" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="extraCabType" className="text-sm font-medium text-gray-700">Cab Charge</label>
                                <Field type="text" name="extraCabType" className="p-2 w-full rounded-md border-gray-300" />
                                <ErrorMessage name="extraCabType" component="div" className="text-red-500 text-sm" />
                            </div>
                        </div>

                        <Button
                            fullWidth
                            color="black"
                            onClick={handleSubmit}
                            disabled={!dirty || !isValid}
                            className='my-6 mx-2'
                        >
                            Submit
                        </Button>
                    </>
                )}
            </Formik>
        </div>
    );
};

export default PriceAdd;