import React, { useEffect, useState } from 'react';
import { Formik, Field, ErrorMessage } from 'formik';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import { useParams } from 'react-router-dom';
import Multiselect from 'multiselect-react-dropdown';
import PriceTable from '@/components/PriceTable';

const DriverDetails = () => {
    const [driver, setDriver] = useState({});
    const [packageDetails, setPackageDetails] = useState([]);
    const { id } = useParams();

    const getPackageListDetails = async () => {
        const data = await ApiRequestUtils.get(API_ROUTES.PACKAGES_LIST);
        if (data?.success) {
            const packageData = data?.data.map(option => {
                const suffix = option.type === 'Intercity' ? 'hr' : 'd';
                return {
                    ...option,
                    period: `${option.period} ${suffix}`, // Append 'hr' or 'd'
                };
            });
            const intercityPackage = packageData.filter(val => val.type === 'Intercity');
            const outstationPackage = packageData.filter(val => { return val.type === 'Outstation' && val.period === '1 d' });
            setPackageDetails([...intercityPackage, ...outstationPackage]);
        }
    };
    useEffect(() => {
        if (id) {
            getPackageListDetails();
            fetchItem(id);
        }
    }, [id]);
    const fetchItem = async (itemId) => {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_DRIVER_BY_ID + `${itemId}`);
        setDriver(data?.data);
    };
    const initialValues = {
        salutation: driver?.salutation || "",
        firstName: driver?.firstName || "",
        phoneNumber: driver?.phoneNumber ? driver?.phoneNumber.replace(/^(\+91)/, '') : "",
        license: driver?.license || "",
        address: driver?.address || "",
        reference: driver?.references || "",
        preference: driver?.preference || "",
        packages: driver?.packages || "",
        carType: driver?.carType || ""
    };
    return (
        <>
            <div className="p-4 mx-auto">
                <h2 className="text-2xl font-bold mb-4">Driver Details</h2>
                <Formik
                    initialValues={initialValues}
                    enableReinitialize={true}
                    onSubmit={() => { }}
                >
                    {({ values }) => (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="salutation" className="text-sm font-medium text-gray-700">Salutation</label>
                                    <Field as="select" name="salutation" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200">
                                        <option value="">Select salutation</option>
                                        <option value="Mr">Mr</option>
                                        <option value="Mrs">Mrs</option>
                                        <option value="Others">Others</option>
                                    </Field>
                                    <ErrorMessage name="salutation" component="div" className="text-red-500 text-sm" />
                                </div>

                                <div>
                                    <label htmlFor="firstName" className="text-sm font-medium text-gray-700">Name</label>
                                    <Field type="text" name="firstName" disabled className="p-2 w-full rounded-md border-gray-300 shadow-sm bg-gray-200" />
                                    <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm my-1" />
                                </div>

                                <div>
                                    <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</label>
                                    <Field type="tel" name="phoneNumber" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" maxLength={10} />
                                    <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm" />
                                </div>

                                <div>
                                    <label htmlFor="license" className="text-sm font-medium text-gray-700">License Number</label>
                                    <Field type="text" name="license" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" maxLength={15} />
                                    <ErrorMessage name="license" component="div" className="text-red-500 text-sm" />
                                </div>

                                <div>
                                    <label htmlFor="address" className="text-sm font-medium text-gray-700">Address</label>
                                    <Field type="text" name="address" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                                    <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
                                </div>

                                <div>
                                    <label htmlFor="reference" className="text-sm font-medium text-gray-700">Reference</label>
                                    <Field type="text" name="reference" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                                    <ErrorMessage name="reference" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Car Type</p>
                                    <div className="space-x-4">
                                        <label className="inline-flex items-center">
                                            <Field type="radio" name="carType" disabled value="Sedan" className="form-radio" />
                                            <span className="ml-2">Sedan</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <Field type="radio" name="carType" disabled value="SUV" className="form-radio" />
                                            <span className="ml-2">SUV</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <Field type="radio" name="carType" disabled value="Hatchback" className="form-radio" />
                                            <span className="ml-2">Hatchback</span>
                                        </label>
                                    </div>
                                    <ErrorMessage name="carType" component="div" className="text-red-500 text-sm" />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Preference</p>
                                    <div className="space-x-4">
                                        <label className="inline-flex items-center">
                                            <Field type="radio" name="preference" disabled value="Sedan" className="form-radio" />
                                            <span className="ml-2">Automatic</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <Field type="radio" name="preference" disabled value="SUV" className="form-radio" />
                                            <span className="ml-2">Petrol</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <Field type="radio" name="preference" disabled value="Hatchback" className="form-radio" />
                                            <span className="ml-2">Diesel</span>
                                        </label>
                                    </div>
                                    <ErrorMessage name="preference" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="packages" className="text-sm font-medium text-gray-700">Package</label>
                                    <Multiselect
                                        options={packageDetails}
                                        displayValue="period"
                                        selectedValues={packageDetails.filter(option => values.packages.includes(option.id))}
                                        placeholder=""
                                        className="w-full rounded-xl border-gray-300 bg-gray-200"
                                        disable={true}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </Formik>
            </div>
            <PriceTable driverId={id} selectedPackages={driver?.packages} packages={packageDetails} />
        </>
    );
};

export default DriverDetails;