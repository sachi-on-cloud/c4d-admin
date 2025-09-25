import React, { useEffect, useState,useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import ParcelPeakHourTableEdit from './ParcelPeakHourTableEdit';
import ParcelPricingTableEdit from './ParcelPricingTableEdit';
import Select from 'react-select';


const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
];

const PRICE_SCHEMA = Yup.object().shape({
    type: Yup.string().required('Trip Type is required'),
    baseFare: Yup.number().required('Base Fare is required'),
    kilometerPrice: Yup.number().required('Kilometer Rate is required'),
    extraKmPrice: Yup.number().required('Additional Kilometer Price is required'),
});

const ParcelMasterPriceEdit = () => {
    const [initialValues, setInitialValues] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const [peakParcelHours, setPeakParcelHours] = useState([]);
    const [parcelPrice, setParcelPrice] = useState([]);
    const initialParcelPeakRef = useRef([]);
    const initialParcelPriceData = useRef([]);


    useEffect(() => {
        if (id) fetchPriceDetails(id);
    }, [id]);

    const fetchPriceDetails = async (packageId) => {
        try {
            const data = await ApiRequestUtils.get(`${API_ROUTES.RIDES_PRICE_DETAILS}/${packageId}`);
            if (data?.success) {
                setInitialValues({
                    type: data?.data?.type || '',
                    baseFare: data?.data?.baseFare || 0,
                    kilometerPrice: data?.data?.kilometerPrice || 0,
                    extraKmPrice: data?.data?.extraKmPrice || 0,
                    // status: data?.data?.status == 'ACTIVE' ? 1 : 0,
                });
                setPeakParcelHours(data.data.peakHours || []);
                setParcelPrice(data.data.parcelPricing || []);

                initialParcelPeakRef.current = data.data.peakHours;
                initialParcelPriceData.current = data.data.parcelPricing;
            }
        } catch (error) {
            console.error("Error fetching price details:", error);
        }
    };

    const hasParcelChanged = () => {
        return JSON.stringify(peakParcelHours) !== JSON.stringify(initialParcelPeakRef.current);
    };
     const hasParcelPriceChanged = () => {
        return JSON.stringify(parcelPrice) !== JSON.stringify(initialParcelPriceData.current);
    };

    const onSubmit = async (values) => {
        try {
            const reqBody = {
                packageId: Number(id),
                baseFare: Number(values.baseFare),
                kilometerPrice: Number(values.kilometerPrice),
                extraKmPrice: Number(values.extraKmPrice),
                peakHours: peakParcelHours,
                parcelPricing: parcelPrice,
            };

            const response = await ApiRequestUtils.post(API_ROUTES.PARCEL_PRICE_EDIT, reqBody);

            if (response?.success) {
                navigate('/dashboard/users/master-price');
            } else {
                console.error('Error updating data');
            }
        } catch (error) {
            console.error("Error updating price details:", error);
        }
    };

    return (
        <div className="p-4 mx-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Parcel Pricing Details</h2>
            <Formik initialValues={initialValues} validationSchema={PRICE_SCHEMA} onSubmit={onSubmit} enableReinitialize>
                {({ handleSubmit, setFieldValue, isValid, dirty, values }) => (
                    <Form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Trip Type</label>
                                <Field type="string" name="type" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                <ErrorMessage name="type" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Base Fare</label>
                                <Field type="number" name="baseFare" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="baseFare" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Kilometer Price</label>
                                <Field type="number" name="kilometerPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="kilometerPrice" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Additional KM Price</label>
                                <Field type="number" name="extraKmPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="extraKmPrice" component="div" className="text-red-500 text-sm" />
                            </div>
                            {/* <div>
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <Select
                                    options={STATUS_OPTIONS}
                                    onChange={(selectedOption) => setFieldValue('status', selectedOption.value)}
                                    value={STATUS_OPTIONS.find(option => option.value === values?.status)}
                                    placeholder="Select Status"
                                    className="w-full"
                                />
                                <ErrorMessage name="status" component="div" className="text-red-500 text-sm" />
                            </div> */}
                        </div>
                         <ParcelPeakHourTableEdit initialParcelPeakRef={peakParcelHours} onUpdated={(data)=> setPeakParcelHours(data)}/>
                         <ParcelPricingTableEdit initialParcelPriceData={parcelPrice} onUpdated={(data)=> setParcelPrice(data)}/>
                        <div className="flex flex-row">
                            <Button fullWidth onClick={() => navigate('/dashboard/users/master-price')} className="my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl">
                                Cancel
                            </Button>
                            <Button fullWidth color="blue" type="submit" disabled={!(dirty || hasParcelChanged() || hasParcelPriceChanged) || !isValid}  className="my-6 mx-2">
                                Save Changes
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default ParcelMasterPriceEdit;
