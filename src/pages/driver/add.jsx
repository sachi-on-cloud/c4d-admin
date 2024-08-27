import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import { Alert, Button } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import Multiselect from 'multiselect-react-dropdown';

const DriverAdd = () => {
    const [driverVal, setDriverVal] = useState({});
    const [alert, setAlert] = useState(false);
    const [packageDetails, setPackageDetails] = useState([]);
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const getPackageListDetails = async () => {
        const data = await ApiRequestUtils.get(API_ROUTES.PACKAGES_LIST);
        if (data?.success) {
            const packageData = data?.data.map(option => {
                const suffix = option.type === 'Intercity' ? 'hr' : option.type === 'Outstation' ? 'd' : '';
                return {
                    ...option,
                    period: `${option.period} ${suffix}`, // Append 'hr' or 'd'
                };
            });
            const intercityPackage = packageData.filter(val => val.type === 'Intercity');
            const outstationPackage = packageData.filter(val => { return val.type === 'Outstation' && val.period === '1 d' });
            const carWashPackage = packageData.filter(val => val.type === 'CarWash');
            setPackageDetails([...intercityPackage, ...outstationPackage, ...carWashPackage]);
        }
    };
    useEffect(() => {
        getPackageListDetails();
        if (isEditMode) {
            fetchItem(id);
        }
    }, [id, isEditMode]);
    const fetchItem = async (itemId) => {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_DRIVER_BY_ID + `${itemId}`);
        setDriverVal(data.data);
    };
    const initialValues = {
        salutation: driverVal?.salutation || "",
        firstName: driverVal?.firstName || "",
        phoneNumber: driverVal?.phoneNumber ? driverVal?.phoneNumber.replace(/^(\+91)/, '') : "",
        license: driverVal?.license || "",
        address: driverVal?.address || "",
        reference: driverVal?.references || "",
        preference: driverVal?.preference || "",
        carType: driverVal?.carType || "",
        packages: driverVal?.packages || "",
        wallet: driverVal?.wallet || ""
    };
    const validationSchema = Yup.object({
        salutation: Yup.string().required('Salutation is required'),
        firstName: Yup.string().required('Name is required'),
        phoneNumber: Yup.string().matches(/^[6-9]{1}[0-9]{9}/, 'Must be a valid mobile number').required('Phone number is required'),
        license: Yup.string().matches('^[a-zA-Z]{2}[0-9]{13}$', 'Invalid Driver\'s License').required('Driving License is required'),
        address: Yup.string().required('Address is required'),
        reference: Yup.string().required('Reference is required'),
        preference: Yup.string().required('Preference is required'),
        packages: Yup.array()
            .of(Yup.string().required('Each package must be selected'))
            .required('At least one package must be selected')
            .min(1, 'At least one package must be selected'),

        wallet: Yup.string().required('Wallet is required'),
    });

    const onSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const driverData = {
                salutation: values.salutation,
                firstName: values.firstName,
                phoneNumber: "+91" + values.phoneNumber,
                license: values.license,
                address: values.address,
                references: values.reference,
                preference: values.preference,
                packages: values.packages,
                carType: values.carType,
                wallet: values.wallet
            };
            let data;
            if (isEditMode) {
                driverData['driverId'] = id;
                data = await ApiRequestUtils.update(API_ROUTES.UPDATE_DRIVER, driverData);
            } else {
                data = await ApiRequestUtils.post(API_ROUTES.REGISTER_DRIVER, driverData);
            }
            if (!data?.success && data?.code === 203) {
                setAlert(true);

                setTimeout(() => {
                    setAlert(false);
                    resetForm();
                }, 2000)
            }
            console.log('Driver created:', data.data);
            navigate('/dashboard/drivers', {
                state: {
                    driverAdded: true,
                    driverName: data?.data?.firstName
                }
            });

        } catch (error) {
            console.error('Error creating driver and car:', error);
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
                    Driver already exist!
                </Alert>
            </div>}
            <h2 className="text-2xl font-bold mb-4">Add New Driver</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
                enableReinitialize={true}

            >
                {({ handleSubmit, values, dirty, isValid, handleChange, setFieldValue }) => (
                    <Form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="salutation" className="text-sm font-medium text-gray-700">Salutation</label>
                                <Field as="select" name="salutation" className="p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                    <option value="">Select salutation</option>
                                    <option value="Mr">Mr</option>
                                    <option value="Mrs">Mrs</option>
                                    <option value="Others">Others</option>
                                </Field>
                                <ErrorMessage name="salutation" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="firstName" className="text-sm font-medium text-gray-700">Name</label>
                                <Field type="text" name="firstName" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm my-1" />
                            </div>

                            <div>
                                <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</label>
                                <Field type="tel" name="phoneNumber" className="p-2 w-full rounded-md border-gray-300" maxLength={10} />
                                <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="license" className="text-sm font-medium text-gray-700">License Number</label>
                                <Field type="text" name="license" className="p-2 w-full rounded-md border-gray-300" maxLength={15} />
                                <ErrorMessage name="license" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="address" className="text-sm font-medium text-gray-700">Address</label>
                                <Field type="text" name="address" className="p-2 w-full rounded-md border-gray-300" />
                                <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="reference" className="text-sm font-medium text-gray-700">Reference</label>
                                <Field type="text" name="reference" className="p-2 w-full rounded-md border-gray-300" />
                                <ErrorMessage name="reference" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Car Type</p>
                                <div className="space-x-4">
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="carType" value="Sedan" className="form-radio" />
                                        <span className="ml-2">Sedan</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="carType" value="SUV" className="form-radio" />
                                        <span className="ml-2">SUV</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="carType" value="Hatchback" className="form-radio" />
                                        <span className="ml-2">Hatchback</span>
                                    </label>
                                </div>
                                <ErrorMessage name="carType" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Preference</p>
                                <div className="space-x-4">
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="preference" value="Sedan" className="form-radio" />
                                        <span className="ml-2">Automatic</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="preference" value="SUV" className="form-radio" />
                                        <span className="ml-2">Petrol</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="preference" value="Hatchback" className="form-radio" />
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
                                    onSelect={(selectedList) => {
                                        setFieldValue("packages", selectedList.map(item => item.id));
                                    }}
                                    onRemove={(selectedList) => {
                                        setFieldValue("packages", selectedList.map(item => item.id));
                                    }}
                                    placeholder="Select options"
                                    className="w-full rounded-md border-gray-300"
                                    showCheckbox={true}
                                />
                            </div>
                            <div>
                                <label htmlFor="wallet" className="text-sm font-medium text-gray-700">Wallet</label>
                                <Field type="text" name="wallet" className="p-2 w-full rounded-md border-gray-300" />
                                <ErrorMessage name="wallet" component="div" className="text-red-500 text-sm" />
                            </div>
                        </div>
                        <div className='flex flex-row'>
                            <Button
                                fullWidth
                                onClick={() => { navigate('/dashboard/drivers'); }}
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

export default DriverAdd;