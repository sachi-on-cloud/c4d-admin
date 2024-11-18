import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, DISTRICT_LIST, THALUK_LIST, STATE_LIST, KYC_PROCESS } from '@/utils/constants';
import { Alert, Button, Card, CardBody, Typography, Input, List, ListItem } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import Multiselect from 'multiselect-react-dropdown';
import { DRIVER_ADD_SCHEMA } from '@/utils/validations';

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
    const [thalukSearchText, setThalukSearchText] = useState("");
    const [isThalukListVisible, setIsThalukListVisible ] = useState(false);
    const [stateSearchText, setStateSearchText] = useState("");
    const [isStateListVisible, setIsStateListVisible] = useState(false);
    const [imagePreviews, setImagePreviews] = useState({
        aadhaarImage: null,
        panCardImage: null,
        livePhoto: null,
        drivingLicenseImage: null,
        consentForm: null
    });      
    const { id } = useParams();
    const [driverAdded, setDriverAdded] = useState({
        driverId: "",
        value: false
    });
    const isEditMode = !!id;
    const navigate = useNavigate();

    // Format date to YYYY-MM-DD for input's min attribute
    const currentDate = () => {
        return (new Date()).toISOString().split('T')[0];
    };

    const orderPackages = (packages, type) => {
        return packages.sort((a, b) => {
            if (type === 'Intercity') {
                const hoursA = parseInt(a.period);
                const hoursB = parseInt(b.period);
                return hoursA - hoursB;
            } else if (type === 'CarWash') {
                const numberA = parseInt(a.period.match(/\d+/)[0]);
                const numberB = parseInt(b.period.match(/\d+/)[0]);
                return numberA - numberB;
            }
            return 0;
        });
    };

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
            const intercityPackage = orderPackages(packageData.filter(val => val.type === 'Intercity'), 'Intercity');
            const outstationPackage = packageData.filter(val => { return val.type === 'Outstation' && val.period === '1 d' });
            const carWashPackage = orderPackages(packageData.filter(val => val.type === 'CarWash'), 'CarWash');
            setPackageDetails([...intercityPackage, ...outstationPackage, ...carWashPackage]);
        }
    };

    useEffect(() => {
        getPackageListDetails();
        // if (isEditMode) {
        //     fetchItem(id);
        // }
    }, [id]);

    // const fetchItem = async (itemId) => {
    //     const data = await ApiRequestUtils.get(API_ROUTES.GET_DRIVER_BY_ID + `${itemId}`);
    //     setDriverVal(data.data);
    // };

    const initialValues = {
        salutation: driverVal?.salutation || "",
        firstName: driverVal?.firstName || "",
        fatherName: driverVal?.fatherName || "",
        motherName: driverVal?.motherName || "",
        dateOfBirth: driverVal?.dob || "",
        age: driverVal?.age || "",
        phoneNumber: driverVal?.phoneNumber ? driverVal?.phoneNumber.replace(/^(\+91)/, '') : "",
        license: driverVal?.license || "",
        licenseType: driverVal?.licenseType || "",
        licenseExpiryDate: driverVal?.licenseExpiry || "",
        professionalLicense: driverVal?.professionalLicense || "No",
        policeClearanceCertificate: driverVal?.policeCertificate || "No",
        address: driverVal?.address || "",
        streetName: driverVal?.street || "",
        thaluk: driverVal?.thaluk || "",
        district: driverVal?.district || "",
        state: driverVal?.state || "",
        pinCode: driverVal?.pincode || "",
        reference1: driverVal?.reference1 || "",
        phoneNumber1: driverVal?.reference1_phone ? driverVal?.reference1_phone.replace(/^(\+91)/, '') : "",
        reference2: driverVal?.reference2 || "",
        phoneNumber2: driverVal?.reference2_phone ? driverVal?.reference2_phone.replace(/^(\+91)/, '') : "",
        preference: driverVal?.preference || "",
        carType: driverVal?.carType || "",
        packages: driverVal?.packages || [],
        wallet: driverVal?.wallet || "",
        prices: [],
        aadhaarImage: '',
        panCardImage: '',
        livePhoto: '',
        drivingLicenseImage: '',
        consentForm: ''
    };

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

    const renderPriceTable = (title, prices, values) => {
        if (prices.length === 0) return null;
        
        const sortedPrices = [...prices].sort((a, b) => {
            const packageA = packageDetails.find(p => p.id === a.packageId);
            const packageB = packageDetails.find(p => p.id === b.packageId);
            
            if (title === "INTERCITY") {
                const hoursA = parseInt(packageA.period);
                const hoursB = parseInt(packageB.period);
                return hoursA - hoursB;
            } else if (title === "CAR WASH") {
                const numberA = parseInt(packageA.period.match(/\d+/)[0]);
                const numberB = parseInt(packageB.period.match(/\d+/)[0]);
                return numberA - numberB;
            }
            return 0;
        });

        return (
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">{title}</h3>
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
                                {sortedPrices.map((priceItem) => (
                                    <tr key={priceItem.packageId}>
                                        <td className="py-3 px-5 border-b border-blue-gray-50">
                                            <Typography variant="small" color="blue-gray" className="font-semibold">
                                                {priceItem.period}
                                            </Typography>
                                        </td>
                                        {['price', 'extraPrice', 'extraKmPrice', 'nightCharge', 'cancelCharge', 'extraCabType'].map((field) => (
                                            <td key={field} className="py-3 px-5 border-b border-blue-gray-50">
                                                <Field
                                                    name={`prices[${values.prices.indexOf(priceItem)}].${field}`}
                                                    className="w-full p-1 text-xs border rounded"
                                                />
                                                <ErrorMessage 
                                                    name={`prices[${values.prices.indexOf(priceItem)}].${field}`} 
                                                    component="div" 
                                                    className="text-red-500 text-xs" 
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardBody>
                </Card>
            </div>
        );
    }; 

    const onSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const driverDetails = {
                salutation: values.salutation,
                firstName: values.firstName,
                fatherName: values.fatherName || "",
                motherName: values.motherName || "",
                dob: values.dateOfBirth || "",
                age: values.age || "",
                phoneNumber: "+91" + values.phoneNumber,
                license: values.license,
                licenseType: values.licenseType || "",
                licenseExpiry: values.licenseExpiryDate || "",
                professionalLicense: values.professionalLicense || "No",
                policeCertificate: values.policeClearanceCertificate || "No",
                address: values.address,
                street: values.streetName || "",
                thaluk: values.thaluk,
                district: values.district,
                state: values.state,
                country: "India", 
                pincode: values.pinCode || "",
                reference1: values.reference1 || "",
                reference1_phone: values.phoneNumber1 || "",
                reference2: values.reference2 || "",
                reference2_phone: values.phoneNumber2 || "",
                preference: values.preference,
                packages: values.packages,
                carType: values.carType,
                wallet: values.wallet,
            };
            let driverData = { driverDetails, prices: values.prices };
            console.log(driverData);
            //return;
            const data = await ApiRequestUtils.post(API_ROUTES.REGISTER_DRIVER, driverData);
            //console.log('Driver operation:', data.data);
            if (!data?.success && data?.code === 203) {
                console.error('Driver already exists');
                setAlert({
                    color: 'red',
                    message: 'Driver already exists'
                });
                setTimeout(() => setAlert(null), 5000);
                resetForm();
            } else {
                console.log('ELSE IN SUBMIT :');
                // navigate('/dashboard/drivers', {
                //     state: {
                //         driverAdded: true,
                //         driverName: data?.data?.firstName
                //     }
                // });
                setDriverAdded({
                    driverId: data?.data?.id,
                    value: true
                });
            }
        } catch (error) {
            console.error('Error creating driver:', error);
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

    const DocumentUpload = ({ label, value, name, onChange, imagePreview }) => {
        return (
            <div>
                <label htmlFor={name} className="text-sm font-medium text-gray-700">
                    {label}
                </label>
                <div className="mt-1">
                    <div className="relative w-40 h-40 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
                        {value ? (
                            <img
                                src={imagePreview || value}
                                alt="Preview"
                                className="w-full h-full object-contain rounded-md"
                            />
                        ) : (
                            <div className="text-gray-500 font-medium p-2">
                                No image selected. Click below to upload.
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        id={name}
                        name={name}
                        onChange={onChange}
                        className="hidden" // Hide the native input
                    />
                    <label
                        htmlFor={name}
                        className="p-2 mt-2 inline-block text-center text-white border border-gray-400 bg-black rounded-xl cursor-pointer"
                    >
                        Upload Image
                    </label>
                </div>
            </div>
        );
    };

    const handleImageUpload = async (e, setFieldValue, label) => {
        const file = e.target.files[0];
        if (file) {
            setFieldValue(label, file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews((prev) => ({
                    ...prev,
                    [label]: reader.result, // Update the specific preview
                }));
            };
            reader.readAsDataURL(file);

            const type = label === 'aadhaarImage' ? KYC_PROCESS.AADHAAR : label === 'panCardImage' ? KYC_PROCESS.PAN : label === 'drivingLicenseImage' ? KYC_PROCESS.DRIVING_LICENSE : label === 'consentForm' ? KYC_PROCESS.CONSENT_FORM : KYC_PROCESS.LIVE_PHOTO;
            const formData = new FormData();

            formData.append('image1', file);
            formData.append('extImage1', file.name.split('.')[1]);
            formData.append('fileTypeImage1', file.type);
            formData.append('type', type);
            formData.append('driverId', driverAdded.driverId);

            const data = await ApiRequestUtils.postDocs(API_ROUTES.UPLOAD_PHOTO, formData);

            console.log('DATA IN DOC INSERT :', data);
        }
    }
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
                validationSchema={DRIVER_ADD_SCHEMA}
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
                                <Field type="date" name="dateOfBirth" className="p-2 w-full rounded-xl border-2 border-gray-300" value={values.dateOfBirth} max={currentDate()} 
                                    onChange={(e) => {

                                        setFieldValue('dateOfBirth', e.target.value);
                                        
                                        if (e.target.value) {
                                            const today = new Date();
                                            const birthDate = new Date(e.target.value);
                                            let age = today.getFullYear() - birthDate.getFullYear();
                                            const monthDiff = today.getMonth() - birthDate.getMonth();
                                            
                                            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                                                age--;
                                            }
                                            setFieldValue('age', age);
                                        } else {
                                            setFieldValue('age', '');
                                        }
                                    }} />
                                <ErrorMessage name="dateOfBirth" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="age" className="text-sm font-medium text-gray-700">Age</label>
                                <Field type="text" name="age" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled/>
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
                                        <Field type="radio" name="licenseType" value="type1" className="form-radio" />
                                        <span className="ml-2">Type 1</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="licenseType" value="type2" className="form-radio" />
                                        <span className="ml-2">Type 2</span>
                                    </label>
                                </div>
                                <ErrorMessage name="mode" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="licenseExpiryDate" className="text-sm font-medium text-gray-700">License Expiry Date</label>
                                <Field type="date" name="licenseExpiryDate" className="p-2 w-full rounded-xl border-2 border-gray-300" value={values.licenseExpiryDate} min={currentDate()} ></Field>
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
                                        placeholder="Search District"
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
                                {renderPriceTable(
                                    "INTERCITY",
                                    values.prices.filter(price => {
                                        const package_ = packageDetails.find(p => p.id === price.packageId);
                                        return package_?.type === 'Intercity';
                                    }),
                                    values
                                )}

                                {renderPriceTable(
                                    "OUTSTATION",
                                    values.prices.filter(price => {
                                        const package_ = packageDetails.find(p => p.id === price.packageId);
                                        return package_?.type === 'Outstation';
                                    }),
                                    values
                                )}

                                {renderPriceTable(
                                    "CAR WASH",
                                    values.prices.filter(price => {
                                        const package_ = packageDetails.find(p => p.id === price.packageId);
                                        return package_?.type === 'CarWash';
                                    }),
                                    values
                                )}
                            </div>
                        )}
                        {driverAdded.value && 
                            <div className='space-y-4'>
                                <div className="grid grid-cols-2 gap-6">
                                    <DocumentUpload
                                        label="Aadhaar Image"
                                        value={values.aadhaarImage}
                                        name="aadhaarImage"
                                        onChange={(e) => handleImageUpload(e, setFieldValue, 'aadhaarImage')}
                                        imagePreview={imagePreviews.aadhaarImage}
                                    />

                                    {/* PAN Card Image Upload */}
                                    <DocumentUpload
                                        label="PAN Card Image"
                                        value={values.panCardImage}
                                        name="panCardImage"
                                        onChange={(e) => handleImageUpload(e, setFieldValue, 'panCardImage')}
                                        imagePreview={imagePreviews.panCardImage}
                                    />

                                    {/* Driving License Image Upload */}
                                    <DocumentUpload
                                        label="Driving License Image"
                                        value={values.drivingLicenseImage}
                                        name="drivingLicenseImage"
                                        onChange={(e) => handleImageUpload(e, setFieldValue, 'drivingLicenseImage')}
                                        imagePreview={imagePreviews.drivingLicenseImage}
                                    />

                                    {/* Consent Form Image Upload */}
                                    <DocumentUpload
                                        label="Consent Form Image"
                                        value={values.consentForm}
                                        name="consentForm"
                                        onChange={(e) => handleImageUpload(e, setFieldValue, 'consentForm')}
                                        imagePreview={imagePreviews.consentForm}
                                    />

                                    {/* Live Photo Upload */}
                                    <DocumentUpload
                                        label="Live Photo"
                                        value={values.livePhoto}
                                        name="livePhoto"
                                        onChange={(e) => handleImageUpload(e, setFieldValue, 'livePhoto')}
                                        imagePreview={imagePreviews.livePhoto}
                                    />
                                </div>
                            </div>
                        }
                        {!driverAdded.value &&
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
                                    disabled={!dirty || !isValid}
                                    className='my-6 mx-2'
                                >
                                    Continue
                                </Button>
                            </div>
                        }
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default DriverAdd;