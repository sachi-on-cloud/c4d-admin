import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, DISTRICT_LIST, THALUK_LIST, STATE_LIST, KYC_PROCESS } from '@/utils/constants';
import { Alert, Button, Card, CardBody, Typography, Input, List, ListItem,Dialog, DialogHeader, DialogBody} from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import Multiselect from 'multiselect-react-dropdown';
import { DRIVER_ADD_SCHEMA } from '@/utils/validations';
import Select from 'react-select'

const LocationInput = ({ field, form, suggestions, onSearch, disabled}) => {
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
                disabled={disabled}
            />
            {suggestions.length > 0 && isFocused && (
                <List className="w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
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
    const [thalukSearchText, setThalukSearchText] = useState("");
    const [stateSearchText, setStateSearchText] = useState("");
    const [owner , setOwners] = useState([]);
    const [isEditable, setIsEditable] = useState(true);
    const [imagePreviews, setImagePreviews] = useState({
        aadhaarImage: null,
        policeClearance: null,
        livePhoto: null,
        drivingLicenseImage: null,
        consentForm: null
    });      
    const [modalData, setModalData] = useState(null);
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

    const getOwnersList = async () => {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_ACCOUNTS);
        setOwners(data?.data);
    }

    useEffect(() => {
        getPackageListDetails();
        getOwnersList();
    }, []);

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
        //wallet: driverVal?.wallet || "",
        prices: [],
        aadhaarImage: '',
        policeClearance: '',
        livePhoto: '',
        drivingLicenseImage: '',
        consentForm: '',
        jobType: "",
        accountId: null,
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
                                                    type="number"
                                                    className="w-full p-1 text-xs border rounded"
                                                    disabled={!isEditable} 
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
                //wallet: values.wallet,
                accountId : values.accountId,
                withOwner: values.withOwner,
                jobType: values.jobType,
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
                setIsEditable(false);
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
    
    const thalukOptions = THALUK_LIST.map(thaluk => ({
        id: thaluk.value,
        name: thaluk.label
    }));

    const filteredThaluk = thalukOptions.filter(thaluk => 
        thaluk.name.toLowerCase().includes(thalukSearchText.toLowerCase()) 
    );

    const stateOptions = STATE_LIST.map(state => ({
        id: state.value,
        name: state.label
    }));

    const filteredState = stateOptions.filter(state => 
        state.name.toLowerCase().includes(stateSearchText.toLowerCase()) 
    );

    const DocumentUpload = ({ label, value, name, onChange, setModalData }) => {
        return (
            <tr>
            <td className="py-3 px-5 border-b border-blue-gray-50">
                <Typography className="text-xs font-semibold text-blue-gray-600">{label}</Typography>
            </td>
            <td className="py-3 px-5 border-b border-blue-gray-50">
                <Typography
                    className={`text-xs font-semibold ${value ? 'text-green-500' : 'text-blue-500'}`}
                >
                    {value ? "UPLOADED" : "NO DOCUMENTS"}
                </Typography>
            </td>
            <td className="py-3 px-5 border-b border-blue-gray-50">
                <div className="flex items-center gap-2">
                    <label
                        htmlFor={name}
                        className="inline-block text-center text-white border border-gray-400 bg-black rounded-lg px-4 py-1 cursor-pointer"
                    >
                        Upload
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        id={name}
                        name={name}
                        onChange={onChange}
                        className="hidden"
                    />
                </div>
            </td>
            <td className="py-3 px-5 border-b border-blue-gray-50">
                {value && (
                    <Typography
                        variant="small"
                        className="font-semibold underline cursor-pointer text-blue-900"
                        onClick={() =>
                            setModalData({
                                image: URL.createObjectURL(value),
                            })
                        }
                    >
                        View Details
                    </Typography>
                )}
            </td>
        </tr>
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

            const type = label === 'aadhaarImage' ? KYC_PROCESS.AADHAAR : label === 'policeClearance' ? KYC_PROCESS.POLICE_CLEARANCE : label === 'drivingLicenseImage' ? KYC_PROCESS.DRIVING_LICENSE : label === 'consentForm' ? KYC_PROCESS.CONSENT_FORM : KYC_PROCESS.LIVE_PHOTO;
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
                        <div className={`grid grid-cols-1 gap-7`}>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="salutation" className="text-sm font-medium text-gray-700">Salutation</label>
                                        <Field as="select" name="salutation" disabled={!isEditable} className={`p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${!isEditable ? "bg-gray-100" : ""}`}>
                                            <option value="">Select salutation</option>
                                            <option value="Mr">Mr</option>
                                            <option value="Mrs">Mrs</option>
                                            <option value="Others">Others</option>
                                        </Field>
                                        <ErrorMessage name="salutation" component="div" className="text-red-500 text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="firstName" className="text-sm font-medium text-gray-700">Name</label>
                                        <Field type="text" name="firstName" disabled={!isEditable} className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                        <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm my-1" />
                                    </div>
                                    <div>
                                        <label htmlFor="fatherName" className="text-sm font-medium text-gray-700"> Father Name</label>
                                        <Field type="text" name="fatherName" disabled={!isEditable} className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                        <ErrorMessage name="fatherName" component="div" className="text-red-500 text-sm my-1" />
                                    </div>
                                    <div>
                                        <label htmlFor="motherName" className="text-sm font-medium text-gray-700">Mother Name</label>
                                        <Field type="text" name="motherName" disabled={!isEditable} className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                        <ErrorMessage name="motherName" component="div" className="text-red-500 text-sm my-1" />
                                    </div>
                                    <div>
                                        <label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">Date of Birth</label>
                                        <Field type="date" disabled={!isEditable}  name="dateOfBirth" className="p-2 w-full rounded-xl border-2 border-gray-300" value={values.dateOfBirth} max={currentDate()} 
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
                                        <p className="text-sm font-medium text-gray-700 mb-2">Job Type</p>
                                        <div className="space-x-4">
                                            <label className="inline-flex items-center">
                                                <Field
                                                    type="radio"
                                                    name="jobType"
                                                    value="CAB"
                                                    className="form-radio"
                                                    disabled={!isEditable}
                                                />
                                                <span className="ml-2">Cab Driver</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <Field
                                                    type="radio"
                                                    name="jobType"
                                                    value="ACTING_DRIVER"
                                                    className="form-radio"
                                                    disabled={!isEditable}
                                                />
                                                <span className="ml-2">Acting Driver</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <Field
                                                    type="radio"
                                                    name="jobType"
                                                    value="BOTH"
                                                    className="form-radio"
                                                    disabled={!isEditable}
                                                />
                                                <span className="ml-2">Both</span>
                                            </label>
                                        </div>
                                        <ErrorMessage
                                            name="jobType"
                                            component="div"
                                            className="text-red-500 text-sm"
                                        />
                                    </div>

                                    <Field name="jobType">
                                        {({ field }) =>
                                            field.value === "CAB" && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-2">With Owner</p>
                                                    <div className="space-x-4">
                                                        <label className="inline-flex items-center">
                                                            <Field
                                                                type="radio"
                                                                name="withOwner"
                                                                value="Yes"
                                                                className="form-radio"
                                                                disabled={!isEditable}
                                                            />
                                                            <span className="ml-2">Yes</span>
                                                        </label>
                                                        <label className="inline-flex items-center">
                                                            <Field
                                                                type="radio"
                                                                name="withOwner"
                                                                value="No"
                                                                className="form-radio"
                                                                disabled={!isEditable}
                                                            />
                                                            <span className="ml-2">No</span>
                                                        </label>
                                                    </div>
                                                    <ErrorMessage
                                                        name="withOwner"
                                                        component="div"
                                                        className="text-red-500 text-sm"
                                                    />
                                                </div>
                                            )
                                        }
                                    </Field>

                                    <Field name="jobType">
                                        {({field}) => field.value ==="CAB" && (
                                            <Field name="withOwner">
                                            {({ field }) =>
                                                field.value === "Yes" && (
                                                    <div className="mb-4">
                                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                                            Select Owner
                                                        </label>
                                                        <Field
                                                            as="select"
                                                            name="accountId"
                                                            disabled={!isEditable}
                                                            className="p-2 w-full rounded-md border-gray-300 shadow-sm"
                                                        >
                                                            <option value="">Select Owner</option>
                                                            {owner.map((owner, index) => (
                                                                <option key={index} value={owner.id}>
                                                                    {owner.name}
                                                                </option>
                                                            ))}
                                                        </Field>
                                                        <ErrorMessage
                                                            name="accountId"
                                                            component="div"
                                                            className="text-red-500 text-sm mt-1"
                                                        />
                                                    </div>
                                                )
                                            }
                                        </Field>
                                        ) }
                                    </Field>
                                    
                                    <div>
                                        <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</label>
                                        <Field type="tel" name="phoneNumber" disabled={!isEditable}  className="p-2 w-full rounded-md border-gray-300" maxLength={10} />
                                        <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="license" className="text-sm font-medium text-gray-700">License Number</label>
                                        <Field type="text" name="license" disabled={!isEditable}  className="p-2 w-full rounded-md border-gray-300" maxLength={15} />
                                        <ErrorMessage name="license" component="div" className="text-red-500 text-sm" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">License Type</p>
                                        <div className="space-x-4">
                                            <label className="inline-flex items-center">
                                                <Field type="radio" name="licenseType" disabled={!isEditable}  value="type1" className="form-radio" />
                                                <span className="ml-2">Type 1</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <Field type="radio" name="licenseType" disabled={!isEditable}  value="type2" className="form-radio" />
                                                <span className="ml-2">Type 2</span>
                                            </label>
                                        </div>
                                        <ErrorMessage name="mode" component="div" className="text-red-500 text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="licenseExpiryDate" className="text-sm font-medium text-gray-700">License Expiry Date</label>
                                        <Field type="date" name="licenseExpiryDate" disabled={!isEditable}  className="p-2 w-full rounded-xl border-2 border-gray-300" value={values.licenseExpiryDate} min={currentDate()} ></Field>
                                        <ErrorMessage name="licenseExpiryDate" component="div" className="text-red-500 text-sm" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Professional License</p>
                                        <div className="space-x-4">
                                            <label className="inline-flex items-center">
                                                <Field type="radio" name="professionalLicense" disabled={!isEditable}  value="Yes" className="form-radio" />
                                                <span className="ml-2">Yes</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <Field type="radio" name="professionalLicense" disabled={!isEditable}  value="No" className="form-radio" />
                                                <span className="ml-2">No</span>
                                            </label>
                                        </div>
                                        <ErrorMessage name="professionalLicense" component="div" className="text-red-500 text-sm" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Police Clearance Certificate</p>
                                        <div className="space-x-4">
                                            <label className="inline-flex items-center">
                                                <Field type="radio" name="policeClearanceCertificate" disabled={!isEditable}  value="Yes" className="form-radio" />
                                                <span className="ml-2">Yes</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <Field type="radio" name="policeClearanceCertificate"  disabled={!isEditable} value="No" className="form-radio" />
                                                <span className="ml-2">No</span>
                                            </label>
                                        </div>
                                        <ErrorMessage name="policeClearanceCertificate" component="div" className="text-red-500 text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="address" className="text-sm font-medium text-gray-700">Current Address</label>
                                        <Field name="address">
                                            {({ field, form }) => (
                                                <LocationInput
                                                    field={field}
                                                    form={form}
                                                    suggestions={addressSuggestions}
                                                    onSearch={searchLocations}
                                                    disabled={!isEditable} 
                                                />
                                            )}
                                        </Field>
                                        <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 mb-5">Permanent Address</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="streetName" className="text-sm font-medium text-gray-700">Street Name</label>
                                            <Field type="text" name="streetName" disabled={!isEditable}  className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                            <ErrorMessage name="streetName" component="div" className="text-red-500 text-sm my-1" />
                                        </div>
                                        <div>
                                            <label htmlFor="thaluk" className="text-sm font-medium text-gray-700">
                                                Thaluk
                                            </label>
                                            <Select
                                                id="thaluk"
                                                options={filteredThaluk.map((thaluk) => ({
                                                    value: thaluk.id,
                                                    label: thaluk.name,
                                                }))}
                                                onChange={(selectedOption) =>
                                                    setFieldValue("thaluk", selectedOption?.value || "")
                                                }
                                                placeholder="Search Thaluk"
                                                isSearchable
                                                className="w-full"
                                                classNamePrefix="react-select"
                                                isDisabled={!isEditable}
                                            />
                                            <ErrorMessage
                                                name="thaluk"
                                                component="div"
                                                className="text-red-500 text-sm mt-1"
                                            />
                                        </div>     
                                        <div>
                                            <label htmlFor="district" className="text-sm font-medium text-gray-700">
                                                District
                                            </label>
                                            <Select
                                                id="district"
                                                options={filteredDistricts.map((district) => ({
                                                    value: district.id,
                                                    label: district.name,
                                                }))}
                                                onChange={(selectedOption) =>
                                                    setFieldValue("district", selectedOption?.value || "")
                                                }
                                                placeholder="Select District"
                                                isSearchable
                                                className="w-full"
                                                classNamePrefix="react-select"
                                                isDisabled={!isEditable}
                                            />
                                            <ErrorMessage
                                                name="district"
                                                component="div"
                                                className="text-red-500 text-sm mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="state" className="text-sm font-medium text-gray-700">
                                                State
                                            </label>
                                            <Select
                                                id="state"
                                                options={filteredState.map((state) => ({
                                                    value: state.id,
                                                    label: state.name,
                                                }))}
                                                onChange={(selectedOption) =>
                                                    setFieldValue("state", selectedOption?.value || "")
                                                }
                                                placeholder="Select State"
                                                isSearchable
                                                className="w-full"
                                                classNamePrefix="react-select"
                                                isDisabled={!isEditable}
                                            />
                                            <ErrorMessage
                                                name="state"
                                                component="div"
                                                className="text-red-500 text-sm mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="pinCode" className="text-sm font-medium text-gray-700">Pincode</label>
                                            <Field type="text" name="pinCode" disabled={!isEditable}  className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                            <ErrorMessage name="pinCode" component="div" className="text-red-500 text-sm my-1" />
                                        </div>
                                        <div>
                                            <label htmlFor="reference1" className="text-sm font-medium text-gray-700">Reference 1</label>
                                            <Field type="text" name="reference1" disabled={!isEditable}  className="p-2 w-full rounded-md border-gray-300" />
                                            <ErrorMessage name="reference1" component="div" className="text-red-500 text-sm" />
                                        </div>
                                        <div>
                                            <label htmlFor="phoneNumber1" className="text-sm font-medium text-gray-700">Phone Number</label>
                                            <Field type="tel" name="phoneNumber1" disabled={!isEditable}  className="p-2 w-full rounded-md border-gray-300" maxLength={10} />
                                            <ErrorMessage name="phoneNumber1" component="div" className="text-red-500 text-sm" />
                                        </div>
                                        <div>
                                            <label htmlFor="reference2" className="text-sm font-medium text-gray-700">Reference 2</label>
                                            <Field type="text" name="reference2" disabled={!isEditable}  className="p-2 w-full rounded-md border-gray-300" />
                                            <ErrorMessage name="reference2" component="div" className="text-red-500 text-sm" />
                                        </div>
                                        <div>
                                            <label htmlFor="phoneNumber2" className="text-sm font-medium text-gray-700">Phone Number</label>
                                            <Field type="tel" name="phoneNumber2" disabled={!isEditable}  className="p-2 w-full rounded-md border-gray-300" maxLength={10} />
                                            <ErrorMessage name="phoneNumber2" component="div" className="text-red-500 text-sm" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">Car Type</p>
                                            <div className="space-x-4">
                                                <label className="inline-flex items-center">
                                                    <Field type="radio" name="carType" disabled={!isEditable}  value="Sedan" className="form-radio" />
                                                    <span className="ml-2">Sedan</span>
                                                </label>
                                                <label className="inline-flex items-center">
                                                    <Field type="radio" name="carType" disabled={!isEditable}  value="SUV" className="form-radio" />
                                                    <span className="ml-2">SUV</span>
                                                </label>
                                                <label className="inline-flex items-center">
                                                    <Field type="radio" name="carType" disabled={!isEditable}  value="Hatchback" className="form-radio" />
                                                    <span className="ml-2">Hatchback</span>
                                                </label>
                                            </div>
                                            <ErrorMessage name="carType" component="div" className="text-red-500 text-sm" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">Preference</p>
                                            <div className="space-x-4">
                                                <label className="inline-flex items-center">
                                                    <Field type="radio" disabled={!isEditable}  name="preference" value="Automatic" className="form-radio" />
                                                    <span className="ml-2">Automatic</span>
                                                </label>
                                                <label className="inline-flex items-center">
                                                    <Field type="radio" disabled={!isEditable}  name="preference" value="Manual" className="form-radio" />
                                                    <span className="ml-2">Manual</span>
                                                </label>
                                            </div>
                                            <ErrorMessage name="preference" component="div" className="text-red-500 text-sm" />
                                        </div>
                                        {/* <div>
                                            <label htmlFor="wallet" className="text-sm font-medium text-gray-700">Wallet</label>
                                            <Field type="number" name="wallet" className="p-2 w-full rounded-md border-gray-300" />
                                            <ErrorMessage name="wallet" component="div" className="text-red-500 text-sm" />
                                        </div> */}
                                        {values.jobType !== "CAB" && <div>
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
                                                disable={!isEditable}
                                            />
                                        </div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {values.packages.length > 0 && values.jobType !== "CAB" && (
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
                        {!driverAdded.value &&
                            <div className='flex flex-row'>
                                <Button
                                    fullWidth
                                    onClick={() => navigate('/dashboard/vendors/account/drivers')}
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
                        {driverAdded.value && 
                            <div className="mt-6">
                            <div className="flex flex-row justify-between px-2 mb-2">
                                <Typography variant="h3" className="text-2xl font-bold text-blue-gray-800">
                                    Document Upload
                                </Typography>
                            </div>
                            <Card>
                                <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
                                    <table className="w-full min-w-[640px] table-auto">
                                        <thead>
                                            <tr>
                                                {["Type", "Status", "Action", ""].map((el, index) => (
                                                    <th
                                                        key={index}
                                                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
                                                    >
                                                        <Typography
                                                            variant="small"
                                                            className="text-[11px] font-bold uppercase text-blue-gray-400"
                                                        >
                                                            {el}
                                                        </Typography>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <DocumentUpload
                                                label="Aadhaar Image"
                                                value={values.aadhaarImage}
                                                name="aadhaarImage"
                                                onChange={(e) => handleImageUpload(e, setFieldValue, "aadhaarImage")}
                                                setModalData={setModalData}
                                            />
                                            <DocumentUpload
                                                label="Police Clearance Certificate"
                                                value={values.policeClearance}
                                                name="policeClearance"
                                                onChange={(e) => handleImageUpload(e, setFieldValue, "policeClearance")}
                                                setModalData={setModalData}
                                            />
                                            <DocumentUpload
                                                label="Driving License Image"
                                                value={values.drivingLicenseImage}
                                                name="drivingLicenseImage"
                                                onChange={(e) => handleImageUpload(e, setFieldValue, "drivingLicenseImage")}
                                                setModalData={setModalData}
                                            />
                                            <DocumentUpload
                                                label="Consent Form Image"
                                                value={values.consentForm}
                                                name="consentForm"
                                                onChange={(e) => handleImageUpload(e, setFieldValue, "consentForm")}
                                                setModalData={setModalData}
                                            />
                                            <DocumentUpload
                                                label="Live Photo"
                                                value={values.livePhoto}
                                                name="livePhoto"
                                                onChange={(e) => handleImageUpload(e, setFieldValue, "livePhoto")}
                                                setModalData={setModalData}
                                            />
                                        </tbody>
                                    </table>
                                </CardBody>
                            </Card>
                        </div> 
                        }
                        {driverAdded.value &&
                            <div className='flex flex-row'>
                                <Button
                                    fullWidth
                                    onClick={() => navigate(`/dashboard/vendors/account/drivers/details/${driverAdded.driverId}`)}
                                    className='my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl'
                                >
                                    Back
                                </Button>
                                <Button
                                    fullWidth
                                    color='black'
                                    onClick={() => navigate(`/dashboard/vendors/account/drivers/edit/${driverAdded.driverId}`)}
                                    className='my-6 mx-2'
                                >
                                    Edit
                                </Button>
                            </div>
                        }
                        {/* {driverAdded.value && isEditable && 
                            <div className='flex flex-row'>
                            <Button
                                fullWidth
                                color="black"
                                onClick={handleSubmit}
                                disabled={!dirty || !isValid}
                                className='my-6 mx-2'
                            >
                                Save
                            </Button>
                        </div>  
                        } */}
                    </Form>
                )}
            </Formik>
            {modalData && (
                <Dialog open={Boolean(modalData)} handler={() => setModalData(null)} size="md">
                    <DialogHeader>
                    <div className="flex justify-between items-center w-full">
                        <Typography variant="h6">Document Details</Typography>
                        <button
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => setModalData(null)}
                        >
                        X
                        </button>
                    </div>
                    </DialogHeader>
                    <DialogBody divider>
                    <div className="flex flex-col items-center">
                        <img
                        src={modalData.image}
                        alt="Document"
                        className="max-w-full rounded-lg shadow-md"
                        style={{ height: "45vh", objectFit: "contain" }}
                        />
                    </div>
                    </DialogBody>
                </Dialog>
            )}
        </div>
    );
};

export default DriverAdd;