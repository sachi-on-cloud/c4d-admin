import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, CITY_LIST, DISTRICT_LIST, THALUK_LIST, STATE_LIST } from '@/utils/constants';
import { Alert, Button, Card, CardBody, Typography, Input, List, ListItem } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import Multiselect from 'multiselect-react-dropdown';

const LocationInput = ({ field, form, suggestions, onSearch }) => {
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        form.validateField(field.name);
    }, []);

    return (
        <div className="relative">
            <Input
                type="text"
                placeholder="Enter address"
                {...field}
                onChange={(e) => {
                    form.setFieldValue(field.name, e.target.value);
                    onSearch(e.target.value);
                    form.setFieldTouched(field.name, true, false);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={(e) => {
                    field.onBlur(e);
                    setTimeout(() => setIsFocused(false), 200);
                    form.validateField(field.name);
                }}
                className="pr-10"
            />
            {suggestions.length > 0 && isFocused && (
                <List className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                        <ListItem
                            key={index}
                            onClick={() => {
                                form.setFieldValue(field.name, suggestion);
                                setIsFocused(false);
                                form.validateField(field.name);
                            }}
                            className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                        >
                            <Typography variant="small">{suggestion}</Typography>
                        </ListItem>
                    ))}
                </List>
            )}
        </div>
    );
};

const DriverAdd = () => {
    const [driverVal, setDriverVal] = useState({});
    const [alert, setAlert] = useState(false);
    const [packageDetails, setPackageDetails] = useState([]);
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [districtSearchText, setDistrictSearchText] = useState("");
    const [isDistrictListVisible, setIsDistrictListVisible] = useState(false);
    const [citySearchText, setCitySearchText] = useState("");
    const [isCityListVisible, setIsCityListVisible] = useState(false);
    const [thalukSearchText, setThalukSearchText] = useState("");
    const [isThalukListVisible, setIsThalukListVisible ] = useState(false);
    const [stateSearchText, setStateSearchText] = useState("");
    const [isStateListVisible, setIsStateListVisible] = useState(false);
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
        packages: driverVal?.packages || [],
        wallet: driverVal?.wallet || "",
        city: driverVal?.city || "",
        thaluk: driverVal?.thaluk || "",
        district: driverVal?.district || "",
        state: driverVal?.state || "",
        mode: driverVal?.mode || "PREPAID",
        prices: []
    };

    const validationSchema = Yup.object({
        salutation: Yup.string().required('Salutation is required'),
        firstName: Yup.string().required('Name is required'),
        phoneNumber: Yup.string().matches(/^[6-9]{1}[0-9]{9}/, 'Must be a valid mobile number').required('Phone number is required'),
        license: Yup.string().matches('^[a-zA-Z]{2}[0-9]{13}$', 'Invalid Driver\'s License').required('Driving License is required'),
        address: Yup.string()
            .required('Address is required')
            .min(5, 'Address must be at least 5 characters')
            // .matches(
            //     /^[a-zA-Z0-9\s,.-/#]+$/,
            //     'Address can only contain letters, numbers, spaces, and common symbols (,./#-)'
            // )
            .test(
                'no-multiple-spaces',
                'Address should not contain multiple consecutive spaces',
                value => !value || !/\s\s+/.test(value)
            )
            .test(
                'not-only-numbers',
                'Address cannot contain only numbers',
                value => !value || !/^\d+$/.test(value.replace(/[\s,.-/#]/g, ''))
            )
            .trim(),
        reference: Yup.string().required('Reference is required'),
        preference: Yup.string().required('Preference is required'),
        mode: Yup.string().required('Mode is required'),
        packages: Yup.array()
            .of(Yup.string().required('Each package must be selected'))
            .required('At least one package must be selected'),
        // .min(1, 'At least one package must be selected'),
        wallet: Yup.string().required('Wallet is required'),
        city: Yup.string().required('City is required'),
        thaluk: Yup.string().required('Thaluk is required'),
        district: Yup.string().required('District is required'),
        state: Yup.string().required('State is required'),
        prices: Yup.array().of(
            Yup.object().shape({
                price: Yup.number().required('Price is required'),
                extraPrice: Yup.number().required('Extra price is required'),
                extraKmPrice: Yup.number().required('Extra KM price is required'),
                nightCharge: Yup.number().required('Night charge is required'),
                cancelCharge: Yup.number().required('Cancel charge is required'),
                extraCabType: Yup.string().required('Cab type is required'),
            })
        ).test('at-least-one-price', 'At least one price must be added', function (prices) {
            return prices.some(price =>
                price.price || price.extraPrice || price.extraKmPrice ||
                price.nightCharge || price.cancelCharge || price.extraCabType
            );
        })
    });

    const searchLocations = async (query) => {
        if (query.length > 2) {
            const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.SEARCH_ADDRESS, {
                address: query
            });
            if (data?.success && data?.data) {
                setAddressSuggestions(data?.data)
            }
        } else {
            setAddressSuggestions([]);
        }
    };

    const onSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const driverDetails = {
                salutation: values.salutation,
                firstName: values.firstName,
                phoneNumber: "+91" + values.phoneNumber,
                license: values.license,
                curAddress: values.address,
                references: values.reference,
                preference: values.preference,
                packages: values.packages,
                carType: values.carType,
                wallet: values.wallet,
                mode: values.mode,
            };
            let driverData = { driverDetails, prices: values.prices };
            console.log(driverData);
            //return;
            let data;
            if (isEditMode) {
                driverData['driverId'] = id;
                data = await ApiRequestUtils.update(API_ROUTES.UPDATE_DRIVER, driverData);
            } else {
                data = await ApiRequestUtils.post(API_ROUTES.REGISTER_DRIVER, driverData);
            }
            if (!data?.success && data?.code === 203) {
                console.error('Driver already exists');
                setAlert({
                    color: 'red',
                    message: 'Driver already exists'
                });
                setTimeout(() => setAlert(null), 5000);
                resetForm();
            } else {
                navigate('/dashboard/drivers', {
                    state: {
                        driverAdded: isEditMode ? false : true,
                        driverUpdated: isEditMode ? true : false,
                        driverName: data?.data?.firstName
                    }
                });
            }
            console.log('Driver operation:', data.data);
        } catch (error) {
            console.error('Error creating/updating driver:', error);
        }
        setSubmitting(false);
    };

    const districtOptions = DISTRICT_LIST.map(district => ({
        id: district.value,
        name: district.label
    }));

    const filteredDistricts = districtOptions.filter(district =>
        district.name.toLowerCase().includes(districtSearchText.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.district-search-container')) {
                setIsDistrictListVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const cityOptions = CITY_LIST.map(city => ({
        id: city.value,
        name: city.label
    }));

    const filteredCity = cityOptions.filter(city => 
        city.name.toLowerCase().includes(citySearchText.toLowerCase()) 
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.city-search-container')) {
                setIsCityListVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const thalukOptions = THALUK_LIST.map(thaluk => ({
        id: thaluk.value,
        name: thaluk.label
    }));

    const filteredThaluk = thalukOptions.filter(thaluk => 
        thaluk.name.toLowerCase().includes(thalukSearchText.toLowerCase()) 
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.thaluk-search-container')) {
                setIsThalukListVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const stateOptions = STATE_LIST.map(state => ({
        id: state.value,
        name: state.label
    }));

    const filteredState = stateOptions.filter(state => 
        state.name.toLowerCase().includes(stateSearchText.toLowerCase()) 
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.state-search-container')) {
                setIsStateListVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    // const isFormValid = (values, errors) => {
    //     const requiredFields = ['salutation', 'firstName', 'phoneNumber', 'license', 'address', 'reference', 'preference', 'mode', 'packages', 'wallet'];
    //     const areRequiredFieldsFilled = requiredFields.every(field => {
    //         if (field === 'packages') {
    //             return Array.isArray(values[field]) && values[field].length > 0;
    //         }
    //         if (field === 'wallet') {
    //             return values[field] !== undefined && values[field] !== '';
    //         }
    //         return values[field] && values[field].length > 0;
    //     });

    //     const isPricesFilled = values.prices.some(price =>
    //         price.price || price.extraPrice || price.extraKmPrice ||
    //         price.nightCharge || price.cancelCharge || price.extraCabType
    //     );

    //     const hasErrors = Object.keys(errors).length > 0;

    //     return areRequiredFieldsFilled && isPricesFilled && !hasErrors;
    // }
    return (
        <div className="p-4 mx-auto">
            {alert && (
                <div className='mb-2'>
                    <Alert
                        color={alert.color}
                        className='py-3 px-6 rounded-xl'
                    >
                        {alert.message}
                    </Alert>
                </div>
            )}
            <h2 className="text-2xl font-bold mb-4">Add New Driver</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
                enableReinitialize={true}
            >
                {({ handleSubmit, values, errors, dirty, isValid, handleChange, setFieldValue }) => (
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
                                <label htmlFor="fatherName" className="text-sm font-medium text-gray-700"> Father Name</label>
                                <Field type="text" name="fatherName" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="fatherName" component="div" className="text-red-500 text-sm my-1" />
                            </div>

                            <div>
                                <label htmlFor="motherName" className="text-sm font-medium text-gray-700">Mother Name</label>
                                <Field type="text" name="motherName" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="motherName" component="div" className="text-red-500 text-sm my-1" />
                            </div>

                            <div>
                                <label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">Date of Birth</label>
                                <Field type="date" name="dateOfBirth" className="p-2 w-full rounded-xl border-2 border-gray-300" ></Field>
                                <ErrorMessage name="dateOfBirth" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="age" className="text-sm font-medium text-gray-700">Age</label>
                                <Field type="text" name="age" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="age" component="div" className="text-red-500 text-sm my-1" />
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
                                <p className="text-sm font-medium text-gray-700 mb-2">License Type</p>
                                <div className="space-x-4">
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="licenseType" value="" className="form-radio" />
                                        <span className="ml-2">Type 1</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="licenseType" value="" className="form-radio" />
                                        <span className="ml-2">Type 2</span>
                                    </label>
                                </div>
                                <ErrorMessage name="mode" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="licenseExpiryDate" className="text-sm font-medium text-gray-700">License Expiry Date</label>
                                <Field type="date" name="licenseExpiryDate" className="p-2 w-full rounded-xl border-2 border-gray-300"  ></Field>
                                <ErrorMessage name="licenseExpiryDate" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Professional License</p>
                                <div className="space-x-4">
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="professionalLicense" value="Yes" className="form-radio" />
                                        <span className="ml-2">Yes</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="professionalLicense" value="No" className="form-radio" />
                                        <span className="ml-2">No</span>
                                    </label>
                                </div>
                                <ErrorMessage name="professionalLicense" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Police Clearance Certificate</p>
                                <div className="space-x-4">
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="policeClearanceCertificate" value="Yes" className="form-radio" />
                                        <span className="ml-2">Yes</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="policeClearanceCertificate" value="No" className="form-radio" />
                                        <span className="ml-2">No</span>
                                    </label>
                                </div>
                                <ErrorMessage name="policeClearanceCertificate" component="div" className="text-red-500 text-sm" />
                            </div>

                            {/* <div>
                                <label htmlFor="address" className="text-sm font-medium text-gray-700">Address</label>
                                <Field type="text" name="address" className="p-2 w-full rounded-md border-gray-300" />
                                <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
                            </div> */}

                            <div>
                                <label htmlFor="address" className="text-sm font-medium text-gray-700">Live Address</label>
                                <Field name="address">
                                    {({ field, form }) => (
                                        <LocationInput
                                            field={field}
                                            form={form}
                                            suggestions={addressSuggestions}
                                            onSearch={searchLocations}
                                        />
                                    )}
                                </Field>
                                <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="streetName" className="text-sm font-medium text-gray-700">Street Name</label>
                                <Field type="text" name="streetName" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="streetName" component="div" className="text-red-500 text-sm my-1" />
                            </div>
                            <div>
                                <label htmlFor="city" className="text-sm font-medium text-gray-700">City</label>
                                <div className="relative city-search-container">
                                    <Input
                                        type="text"
                                        placeholder="Search City"
                                        value={citySearchText}
                                        onChange={(e) => {
                                            setCitySearchText(e.target.value);
                                            setIsCityListVisible(true);
                                        }}
                                        onFocus={() => setIsCityListVisible(true)}
                                        className="p-2 w-full rounded-md border-gray-300"
                                    />
                                    {isCityListVisible && citySearchText && filteredCity.length > 0 && (
                                        <List className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                            {filteredCity.map((city) => (
                                                <ListItem
                                                    key={city.id}
                                                    onClick={() => {
                                                        setFieldValue("city", city.id);
                                                        setCitySearchText(city.name);
                                                        setIsCityListVisible(false);
                                                    }}
                                                    className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    {city.name}
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </div>
                                <ErrorMessage name="city" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="thaluk" className="text-sm font-medium text-gray-700">Thaluk</label>
                                <div className="relative thaluk-search-container">
                                    <Input
                                        type="text"
                                        placeholder="Search Thaluk"
                                        value={thalukSearchText}
                                        onChange={(e) => {
                                            setThalukSearchText(e.target.value);
                                            setIsThalukListVisible(true);
                                        }}
                                        onFocus={() => setIsThalukListVisible(true)}
                                        className="p-2 w-full rounded-md border-gray-300"
                                    />
                                    {isThalukListVisible && thalukSearchText && filteredThaluk.length > 0 && (
                                        <List className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                            {filteredThaluk.map((thaluk) => (
                                                <ListItem
                                                    key={thaluk.id}
                                                    onClick={() => {
                                                        setFieldValue("thaluk", thaluk.id);
                                                        setThalukSearchText(thaluk.name);
                                                        setIsThalukListVisible(false);
                                                    }}
                                                    className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    {thaluk.name}
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </div>
                                <ErrorMessage name="thaluk" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="district" className="text-sm font-medium text-gray-700">District</label>
                                <div className="relative district-search-container">
                                    <Input
                                        type="text"
                                        placeholder="Search district"
                                        value={districtSearchText}
                                        onChange={(e) => {
                                            setDistrictSearchText(e.target.value);
                                            setIsDistrictListVisible(true);
                                        }}
                                        onFocus={() => setIsDistrictListVisible(true)}
                                        className="p-2 w-full rounded-md border-gray-300"
                                    />
                                    {isDistrictListVisible && districtSearchText && filteredDistricts.length > 0 && (
                                        <List className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                            {filteredDistricts.map((district) => (
                                                <ListItem
                                                    key={district.id}
                                                    onClick={() => {
                                                        setFieldValue("district", district.id);
                                                        setDistrictSearchText(district.name);
                                                        setIsDistrictListVisible(false);
                                                    }}
                                                    className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    {district.name}
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </div>
                                <ErrorMessage name="district" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="state" className="text-sm font-medium text-gray-700">State</label>
                                <div className="relative state-search-container">
                                    <Input
                                        type="text"
                                        placeholder="Search State"
                                        value={stateSearchText}
                                        onChange={(e) => {
                                            setStateSearchText(e.target.value);
                                            setIsStateListVisible(true);
                                        }}
                                        onFocus={() => setIsStateListVisible(true)}
                                        className="p-2 w-full rounded-md border-gray-300"
                                    />
                                    {isStateListVisible && stateSearchText && filteredState.length > 0 && (
                                        <List className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                            {filteredState.map((state) => (
                                                <ListItem
                                                    key={state.id}
                                                    onClick={() => {
                                                        setFieldValue("state", state.id);
                                                        setStateSearchText(state.name);
                                                        setIsStateListVisible(false);
                                                    }}
                                                    className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    {state.name}
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </div>
                                <ErrorMessage name="state" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="pinCode" className="text-sm font-medium text-gray-700">Pincode</label>
                                <Field type="text" name="pinCode" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="pinCode" component="div" className="text-red-500 text-sm my-1" />
                            </div>
                            <div>
                                <label htmlFor="reference1" className="text-sm font-medium text-gray-700">Reference 1</label>
                                <Field type="text" name="reference1" className="p-2 w-full rounded-md border-gray-300" />
                                <ErrorMessage name="reference1" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="phoneNumber1" className="text-sm font-medium text-gray-700">Phone Number</label>
                                <Field type="tel" name="phoneNumber1" className="p-2 w-full rounded-md border-gray-300" maxLength={10} />
                                <ErrorMessage name="phoneNumber1" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="reference2" className="text-sm font-medium text-gray-700">Reference 2</label>
                                <Field type="text" name="reference2" className="p-2 w-full rounded-md border-gray-300" />
                                <ErrorMessage name="reference2" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="phoneNumber2" className="text-sm font-medium text-gray-700">Phone Number</label>
                                <Field type="tel" name="phoneNumber2" className="p-2 w-full rounded-md border-gray-300" maxLength={10} />
                                <ErrorMessage name="phoneNumber2" component="div" className="text-red-500 text-sm" />
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
                                        <Field type="radio" name="preference" value="Automatic" className="form-radio" />
                                        <span className="ml-2">Automatic</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="preference" value="Petrol" className="form-radio" />
                                        <span className="ml-2">Petrol</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="preference" value="Diesel" className="form-radio" />
                                        <span className="ml-2">Diesel</span>
                                    </label>
                                </div>
                                <ErrorMessage name="preference" component="div" className="text-red-500 text-sm" />
                            </div>
                            {/* <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Mode</p>
                                <div className="space-x-4">
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="mode" value="PREPAID" className="form-radio" />
                                        <span className="ml-2">Prepaid</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="mode" value="COMMISSION" className="form-radio" />
                                        <span className="ml-2">Commission</span>
                                    </label>
                                </div>
                                <ErrorMessage name="mode" component="div" className="text-red-500 text-sm" />
                            </div> */}
                            <div>
                                <label htmlFor="wallet" className="text-sm font-medium text-gray-700">Wallet</label>
                                <Field type="number" name="wallet" className="p-2 w-full rounded-md border-gray-300" />
                                <ErrorMessage name="wallet" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="packages" className="text-sm font-medium text-gray-700">Package</label>
                                <Multiselect
                                    options={packageDetails}
                                    displayValue="period"
                                    selectedValues={packageDetails.filter(option => values.packages.includes(option.id))}
                                    onSelect={(selectedList) => {
                                        setFieldValue("packages", selectedList.map(item => item.id));
                                        const newPrices = selectedList.map(item => ({
                                            packageId: item.id,
                                            period: item.period,
                                            price: item.price,
                                            extraPrice: item.extra_price,
                                            extraKmPrice: item.extraKmPrice,
                                            nightCharge: item.nightCharge,
                                            cancelCharge: item.cancelCharge,
                                            extraCabType: item.extraCabType
                                        }));
                                        setFieldValue("prices", newPrices);
                                    }}
                                    onRemove={(selectedList, removedItem) => {
                                        setFieldValue("packages", selectedList.map(item => item.id));
                                        setFieldValue("prices", values.prices.filter(price => price.packageId !== removedItem.id));
                                    }}
                                    placeholder="Select options"
                                    className="w-full rounded-md border-gray-300"
                                    showCheckbox={true}
                                />
                            </div>
                        </div>
                        {values.packages.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Price Details</h2>
                                <Card>
                                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                                        <table className="w-full min-w-[640px] table-auto">
                                            <thead>
                                                <tr>
                                                    {["Package", "Price", "Extra Price", "Extra KM Price", "Night Charge", "Cancel Charge", "Cab Type"].map((el) => (
                                                        <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                                            <Typography variant="h6" className="text-[12px] font-bold uppercase text-black">
                                                                {el}
                                                            </Typography>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {values.prices.map((priceItem, index) => (
                                                    <tr key={priceItem.id}>
                                                        <td className="py-3 px-5 border-b border-blue-gray-50">
                                                            <Typography variant="small" color="blue-gray" className="font-semibold">
                                                                {priceItem.period}
                                                            </Typography>
                                                        </td>
                                                        {['price', 'extraPrice', 'extraKmPrice', 'nightCharge', 'cancelCharge', 'extraCabType'].map((field) => (
                                                            <td key={field} className="py-3 px-5 border-b border-blue-gray-50">
                                                                <Field
                                                                    name={`prices[${index}].${field}`}
                                                                    className="w-full p-1 text-xs border rounded"
                                                                />
                                                                <ErrorMessage name={`prices[${index}].${field}`} component="div" className="text-red-500 text-xs" />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </CardBody>
                                </Card>
                            </div>
                        )}
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
                                // disabled={!isFormValid(values, errors)}
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