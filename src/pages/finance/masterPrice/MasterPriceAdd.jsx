import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import Multiselect from 'multiselect-react-dropdown';
import { useNavigate } from 'react-router-dom';
import { Button } from '@material-tailwind/react';
import { MASTERPRICE_ADD_SCHEME } from "@/utils/validations";

export function MasterPriceAdd() {
    const navigate = useNavigate();
    const [packageDetails, setPackageDetails] = useState([]);

    const initialValues = {
        serviceType: '',
        tripType: '',
        package: [],
        freeWaitingTime: '',
        waitingCharges: '',
        dropOnly: '',
        additionalMins: '',
        extraHours: '',
        nightHoursFrom: '',
        nightHoursTo: '',
        nightCharges: '',
        cancellationTime: '',
        cancellationCharges: '',
        active: "",
    };

    const handleSubmit = async (values) => {
        const masterpriceList = {
            serviceType: values.serviceType,
            tripType: values.tripType,
            package: [],
            freeWaitingTime: Number(values.freeWaitingTime),
            waitingCharges: Number(values.waitingCharges),
            dropOnly: Number(values.dropOnly),
            additionalMins: Number(values.additionalMins),
            extraHours: Number(values.extraHours),
            nightHoursFrom: Number(values.nightHoursFrom),
            nightHoursTo: Number(values.nightHoursTo),
            nightCharges: Number(values.nightCharges),
            cancellationTime: Number(values.cancellationTime),
            cancellationCharges: Number(values.cancellationCharges),
            active:values.active,
        };

        console.log("Submitting: ", masterpriceList);
    };

    const getPackageListDetails = async () => {
        try {
            const data = await ApiRequestUtils.get(API_ROUTES.PACKAGES_LIST);
            console.log(data);
            if (data?.success) {
                const packageData = data.data.map(option => {
                    const suffix = option.type === 'Local' ? 'hr' : option.type === 'Outstation' ? 'd' : '';
                    return { ...option, period: `${option.period} ${suffix}` };
                });

                const intercityPackage = packageData.filter(val => val.type === 'Local');
                const outstationPackage = packageData.filter(val => val.type === 'Outstation' && val.period === '1 d');

                setPackageDetails([...intercityPackage, ...outstationPackage]);
            }
        } catch (error) {
            console.error("Error fetching packages:", error);
        }
    };

    useEffect(() => {
        getPackageListDetails();
    }, []);

    // const handleSubmit = async (values) => {
    //     console.log("Form Submitted!", values);
    // };

    return (
        <div className="p-4">

            <h2 className="text-2xl font-bold mb-4">Add Master Price List</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={MASTERPRICE_ADD_SCHEME}
                onSubmit={handleSubmit}

            >

                {({ handleSubmit, values, setFieldValue, errors, isValid, dirty }) => (
                    <Form>
                        {/* <p>Form Errors (Debug):</p><p>{JSON.stringify(errors, null, 2)}</p>
                        <pre>{JSON.stringify(errors, null, 2)}</pre>
                        <p>Package Debug: {JSON.stringify(values.package, null, 2)}</p> */}

                        <div className="p-4 bg-gray-50 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Service Type</label>
                                <Field as="select" name="serviceType" className="p-2 w-full rounded-md border-2 border-gray-300">
                                    <option value="">Select Service Type</option>
                                    <option value="ACTING_DRIVER">Acting Driver</option>
                                    <option value="RIDES">Rides</option>
                                    <option value="RENTAL">Rental</option>
                                </Field>
                                <ErrorMessage name="serviceType" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Trip Type</label>
                                <Field as="select" name="tripType" className="p-2 w-full rounded-md border-2 border-gray-300">
                                    <option value="">Select Trip Type</option>
                                    <option value="Local">Local</option>
                                    <option value="OutStation">OutStation</option>
                                </Field>
                                <ErrorMessage name="tripType" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Package</label>
                                <Multiselect
                                    options={packageDetails}
                                    displayValue="period"
                                    selectedValues={packageDetails.filter(option => values.package.includes(option.period))}
                                    onSelect={(selectedList) => setFieldValue("package", selectedList.map(item => item.period))}
                                    onRemove={(selectedList) => setFieldValue("package", selectedList.map(item => item.period))}
                                    className="w-full rounded-xl border-gray-300 bg-gray-200 border"
                                />

                                <ErrorMessage name="packages" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Free Waiting Time</label>
                                <Field type="text" name="freeWaitingTime" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="freeWaitingTime" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Waiting Charges</label>
                                <Field type="text" name="waitingCharges" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="waitingCharges" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Drop Only</label>
                                <Field type="text" name="dropOnly" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="dropOnly" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Additional Mins</label>
                                <Field type="text" name="additionalMins" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="additionalMins" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Extra Hours</label>
                                <Field type="text" name="extraHours" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="extraHours" component="div" className="text-red-500 text-sm" />
                            </div>
                            {/* <div>
                                <label className="text-sm font-medium text-gray-700">Night Hours</label>
                                <Field type="text" name="nightHours" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="nightHours" component="div" className="text-red-500 text-sm" />
                            </div> */}
                            <div>
                                <label className="text-sm font-medium text-gray-700">Night Hours From (10:00 PM)</label>
                                <Field type="text" name="nightHoursFrom" placeholder="hh:mm AM/PM"
                                    className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="nightHoursFrom" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Night Hours To (06:00 AM)</label>
                                <Field type="text" name="nightHoursTo" placeholder="hh:mm AM/PM"
                                    className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="nightHoursTo" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Night Charges</label>
                                <Field type="text" name="nightCharges" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="nightCharges" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Cancellation Time</label>
                                <Field type="text" name="cancellationTime" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="cancellationTime" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Cancellation Charges</label>
                                <Field type="text" name="cancellationCharges" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="cancellationCharges" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div className="flex items-center space-x-2">

                                <label className="text-sm font-medium text-gray-700">Active</label>
                                <Field
                                    type="checkbox"
                                    name="active"
                                    checked={values.active} // Ensure it reflects Formik's state
                                    onChange={() => setFieldValue("active", !values.active)} // Toggle value manually
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                />
                                <ErrorMessage name="active" component="div" className="text-red-500 text-sm" />

                                <ErrorMessage name="active" component="div" className="text-red-500 text-sm" />
                            </div>
                        </div>
                        <div className='flex flex-row'>
                            <Button
                                fullWidth
                                onClick={() => navigate('/dashboard/finance/master-price')}
                                className='my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl'
                            >
                                Cancel
                            </Button>
                            <Button
                                fullWidth
                                color="black"
                                onClick={handleSubmit}
                                disabled={!dirty || !isValid}
                                className='my-6 mx-2'
                            >
                                Submit
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
