import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, DISTRICT_LIST, THALUK_LIST, STATE_LIST, KYC_PROCESS } from '@/utils/constants';
import { Button, Card, CardBody, Typography, Input, List, ListItem ,Dialog, DialogHeader, DialogBody} from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import Multiselect from 'multiselect-react-dropdown';
import { DRIVER_SCHEMA } from '@/utils/validations';
import Select from 'react-select';
import moment from "moment";


const LocationInput = ({ field, form, suggestions, onSearch, onSelect }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="relative">
            <Input
                type="text"
                placeholder="Enter address"
                {...field}
                onChange={(e) => {
                    form.setFieldValue(field.name, e.target.value);
                    onSearch(e.target.value);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                className="pr-10"
            />
            {suggestions.length > 0 && isFocused && (
                <List className="w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    {suggestions.map((suggestion, index) => (
                        <ListItem
                            key={index}
                            onClick={() => {
                                form.setFieldValue(field.name, suggestion);
                                onSelect(suggestion);
                                setIsFocused(false);
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

const DriverEdit = () => {
    const [driverVal, setDriverVal] = useState({});
    const [alert, setAlert] = useState(false);
    const [packageDetails, setPackageDetails] = useState([]);
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreviews, setImagePreviews] = useState({
        aadhaarImage: null,
        policeClearance: null,
        livePhoto: null,
        drivingLicenseImage: null,
        consentForm: null
    }); 
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const [modalData,setModalData] = useState(null);
    const [isSameAddress, setIsSameAddress] = useState(false);


    const currentDate = () => {
        return (new Date()).toISOString().split('T')[0];
    };

    function getNameById(id, obj) {
        for (const key in obj) {
            if (obj[key].id === id) {
                return obj[key].period;
            }
        }
        return null;
    }

    const orderPackages = (packages, type) => {
        return packages.sort((a, b) => {
            if (type === 'Local') {
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
                const suffix = option.type === 'Local' ? 'hr' : option.type === 'Outstation' ? 'd' : '';
                return {
                    ...option,
                    period: `${option.period} ${suffix}`, // Append 'hr' or 'd'
                };
            });
            const intercityPackage = orderPackages(packageData.filter(val => val.type === 'Local'), 'Local');
            const outstationPackage = packageData.filter(val => { return val.type === 'Outstation' && val.period === '1 d' });
            const carWashPackage = orderPackages(packageData.filter(val => val.type === 'CarWash'),'CarWash');
            setPackageDetails([...intercityPackage, ...outstationPackage, ...carWashPackage]);
        }
    };

    useEffect(() => {
        getPackageListDetails();
        fetchItem(id);
    }, [id]);

    const fetchItem = async (itemId) => {
        try{
            const data = await ApiRequestUtils.get(API_ROUTES.GET_DRIVERS_ADMIN + `${itemId}`);
            if(data?.data) {
                setDriverVal(data.data);
                setImagePreviews({
                    aadhaarImage: getDocumentByType(data?.data?.result?.Proofs, KYC_PROCESS.AADHAAR),
                    drivingLicenseImage: getDocumentByType(data?.data?.result?.Proofs,KYC_PROCESS.DRIVING_LICENSE),
                    policeClearance: getDocumentByType(data?.data?.result?.Proofs,KYC_PROCESS.POLICE_CLEARANCE),
                    consentForm: getDocumentByType(data?.data?.result?.Proofs,KYC_PROCESS.CONSENT_FORM),
                    livePhoto: getDocumentByType(data?.data?.result?.Proofs,KYC_PROCESS.LIVE_PHOTO)
                });
            } else {
                console.error('No driver data received');
                navigate('/dashboard/vendors/account/drivers');
         }
        } catch (error) {
            console.error('Error fetching driver:', error);
            navigate('/dashboard/vendors/account/drivers');
        }    
    };

    const initialValues = {
        salutation: driverVal?.result?.salutation || "",
        firstName: driverVal?.result?.firstName || "",
        fatherName: driverVal?.result?.fatherName || "",
        motherName: driverVal?.result?.motherName || "",
        dateOfBirth: driverVal?.result?.dob || "",
        age: driverVal?.result?.age || "",
        phoneNumber: driverVal?.result?.phoneNumber ? driverVal?.result?.phoneNumber.replace(/^(\+91)/, '') : "",
        license: driverVal?.result?.license || "",
        licenseType: driverVal?.result?.licenseType || "",
        licenseExpiryDate: driverVal?.result?.licenseExpiry || "",
        professionalLicense: driverVal?.result?.professionalLicense || "",
        policeClearanceCertificate: driverVal?.result?.policeCertificate || "",
        address: driverVal?.result?.address || "",
        streetName: driverVal?.result?.street || "",
        thaluk: driverVal?.result?.thaluk || "",
        district: driverVal?.result?.district || "",
        state: driverVal?.result?.state || "",
        pinCode: driverVal?.result?.pincode || "",
        reference1: driverVal?.result?.reference1 || "",
        phoneNumber1: driverVal?.result?.reference1_phone ? driverVal?.result?.reference1_phone.replace(/^(\+91)/, '') : "",
        reference2: driverVal?.result?.reference2 || "",
        phoneNumber2: driverVal?.result?.reference2_phone ? driverVal?.result?.reference2_phone.replace(/^(\+91)/, '') : "",
        transmissionType: driverVal?.result?.transmissionType || "",
        carType: driverVal?.result?.carType || "",
        packages: driverVal?.result?.packages || "",
        //wallet: driverVal?.result?.wallet || "",
        prices: driverVal?.price ? driverVal?.price.filter((el) => driverVal?.result?.packages?.includes(el.packageId)) : [],
        withOwner: driverVal?.result?.Account? "Yes":"No",
        ownerName:driverVal?.result?.Account?.name || "",
        jobType: driverVal?.result?.jobType || "",
        source : driverVal?.result?.source || "",
        serviceType: driverVal?.result?.serviceType || "",
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
            
            if (title === "LOCAL") {
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
                                                {getNameById(priceItem.packageId, packageDetails)}
                                            </Typography>
                                        </td>
                                        {['price', 'extraPrice', 'extraKmPrice', 'nightCharge', 'cancelCharge', 'extraCabType'].map((field) => (
                                            <td key={field} className="py-3 px-5 border-b border-blue-gray-50">
                                                <Field
                                                    name={`prices[${values.prices.indexOf(priceItem)}].${field}`}
                                                    type="number"
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
        if (isSubmitting) return; 
        console.log('onSubmit :', values)
        setIsSubmitting(true);
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
                transmissionType: values.transmissionType,
                packages: values.packages,
                carType: values.carType,
                //wallet: values.wallet,
                driverId: id,
                source: values.source,
                serviceType: values.serviceType,
            };
            let driverData = { driverDetails, prices: values.prices }
            //return;
            const data = await ApiRequestUtils.update(API_ROUTES.UPDATE_DRIVER, driverData);
            console.log('data in driver add :', data);
            if (data?.success) {
                navigate('/dashboard/vendors/account/drivers', {
                    state: {
                        driverUpdated: true,
                        driverName: data?.data?.firstName || values.firstName
                    }
                });
            } else {
                throw new Error(data?.message || 'Update failed');
            }
        } catch (error) {
            console.error('Error updating driver:', error);
            alert(error.message || 'Failed to update driver. Please try again.');
        } finally {
            setIsSubmitting(false);
            setSubmitting(false);
        }
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

    const getDocumentByType = (value, type) => {
        return value.find(proof => proof.type === type) || "";
    };

    
    const handleOpenDocument = (documentUrl) => {
        window.open(documentUrl, "_blank", "noopener,noreferrer");
    };

    const DocumentUpload = ({ label, value, name, onChange, setModalData, fullDocVal}) => {
        return (
            <tr>
                <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Typography className="text-xs font-semibold text-blue-gray-600">{label}</Typography>
                </td>
                    <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Typography
                        className={`text-xs font-semibold ${value ? "text-green-500" : "text-blue-500"}`}
                    >
                        {value ? "UPLOADED" : "NO DOCUMENTS"}
                    </Typography>
                </td>
                <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Typography className="text-xs font-semibold text-blue-gray-600">
                        {moment(fullDocVal?.created_at).format("DD-MM-YYYY")}
                    </Typography>
                </td>
                <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Typography className="text-xs font-semibold text-blue-gray-600">{fullDocVal?.User?.name}</Typography>
                </td>
                <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Typography className="text-xs font-semibold text-blue-gray-600">
                        {value ? moment(fullDocVal?.updated_at).format("DD-MM-YYYY"):""}
                    </Typography>
                </td>
                <td className="py-3 px-5 border-b border-blue-gray-50">
                    <div className="flex items-center gap-2">
                        <label
                            htmlFor={name}
                            className="inline-block text-center text-white border border-gray-400 bg-black rounded-lg px-4 py-1 cursor-pointer"
                        >
                            Update
                        </label>
                        <input
                            type="file"
                            accept="image/*, application/pdf" 
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
                            onClick={() =>{
                                console.log("MODAL URL",value);
                                setModalData({
                                    image: typeof value === "string" ? value : URL.createObjectURL(value)
                                })}
                            }
                        >
                            View/Download
                        </Typography>
                    )}
                </td>
            </tr>
        );
    };
    

    const handleImageUpload = async (e, setFieldValue, label, docId) => {
        const file = e.target.files[0];
        if (file) {
            setFieldValue(label, file);

            // const reader = new FileReader();
            // reader.onloadend = () => {
            //     // setImagePreviews((prev) => ({
            //     //     ...prev,
            //     //     [label]: {
            //     //         image1: reader.result,
            //     //         id: docId
            //     //     },
            //     // }));
            // };
            // reader.readAsDataURL(file);

            const type = label === 'aadhaarImage' ? KYC_PROCESS.AADHAAR : label === 'policeClearance' ? KYC_PROCESS.POLICE_CLEARANCE : label === 'drivingLicenseImage' ? KYC_PROCESS.DRIVING_LICENSE : label === 'consentForm' ? KYC_PROCESS.CONSENT_FORM : KYC_PROCESS.LIVE_PHOTO;
            const formData = new FormData();

            formData.append('image1', file);
            formData.append('extImage1', file.name.split('.')[1]);
            formData.append('fileTypeImage1', file.type);
            formData.append('type', type);
            formData.append('driverId', driverVal?.result?.id);

            let data;
            if (!docId) {
                data = await ApiRequestUtils.postDocs(API_ROUTES.UPLOAD_PHOTO, formData);
            } else {
                formData.append('documentId', docId);
                data = await ApiRequestUtils.updateDocs(API_ROUTES.UPDATE_PHOTO, formData);
            }
            if(data?.success){
                setImagePreviews((prev) => ({
                    ...prev,
                    [label]: {
                        image1: data?.data?.image1,
                        id: data?.data?.id,
                    },
                }));
            }

            console.log('DATA IN DOC UPDATE :', data);
        }
    }

    const parseAddress = (address) => {
        if (!address || typeof address !== "string") {
            console.error("parseAddress received an undefined or invalid address");
            return {
                street: "",
                taluk: "",
                district: "",
                state: "",
                country: "",
                pincode: "",
            };
        }
    
        const parts = address.split(", ").reverse();
        return {
            street: parts[4] || "",
            taluk: parts[3] || "",
            district: parts[2] || "",
            state: parts[1] || "",
            country: parts[0] || "",
            pincode: "",
        };
    };

    const extractPincode = (addressComponents) => {
        const pincodeObj = addressComponents.find((comp) =>
            comp.types.includes("postal_code")
        );
        return pincodeObj ? pincodeObj.long_name : "";
    };

    const handleGoogleAddressSelect = (place) => {
        if (!place || !place.formatted_address) {
            console.error("Google Address selection is invalid", place);
            return;
        }
    
        const parsedAddress = parseAddress(place.formatted_address);
        parsedAddress.pincode = extractPincode(place.address_components);
    
        setFieldValue("address", place.formatted_address);
    
        if (isSameAddress) {
            setFieldValue("streetName", parsedAddress.street);
            setFieldValue("thaluk", parsedAddress.taluk);
            setFieldValue("district", parsedAddress.district);
            setFieldValue("state", parsedAddress.state);
            setFieldValue("pinCode", parsedAddress.pincode);
        }
    };

    return (
        <div className="p-4 mx-auto">
            <h2 className="text-2xl font-bold mb-4">Update Driver</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={DRIVER_SCHEMA}
                onSubmit={onSubmit}
                enableReinitialize={true}
            >
                {({ handleSubmit, values, errors, dirty, isValid, handleChange, setFieldValue }) => (
                    <Form className="space-y-4">
                        <div className='grid grid-cols-2 gap-7'>
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
                                        <label htmlFor="firstName" className="text-sm font-medium text-gray-700">Full Name</label>
                                        <Field type="text" name="firstName" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                        <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm my-1" />
                                    </div>

                                    <div>
                                        <label htmlFor="fatherName" className="text-sm font-medium text-gray-700">Father / Guardian Name</label>
                                        <Field type="text" name="fatherName" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                        <ErrorMessage name="fatherName" component="div" className="text-red-500 text-sm my-1" />
                                    </div>

                                    <div>
                                        <label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">Date of Birth</label>
                                        <Field type="date" name="dateOfBirth" className="p-2 w-full rounded-xl border-2 border-gray-300" value={values.dateOfBirth} max={currentDate()}
                                            onChange={(e) => {
                                                setFieldValue('dateOfBirth', e.target.value);

                                                if(e.target.value) {
                                                    const today = new Date();
                                                    const birthDate = new Date(e.target.value);
                                                    let age = today.getFullYear() - birthDate.getFullYear();
                                                    const monthDiff = today.getMonth() - birthDate.getMonth();

                                                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                                                        age--;
                                                    }
                                                    setFieldValue('age',age);
                                                }else {
                                                    setFieldValue('age','');
                                                }
                                            }}
                                        />
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
                                                <span className="ml-2">White Board</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <Field type="radio" name="licenseType" value="type2" className="form-radio" />
                                                <span className="ml-2">Yellow Board</span>
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
                                        <p className="text-sm font-medium text-gray-700 mb-2">Preference</p>
                                        <div className="space-x-4">
                                            <label className="inline-flex items-center">
                                                <Field type="radio" name="transmissionType" value="Automatic" className="form-radio" />
                                                <span className="ml-2">Automatic</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <Field type="radio" name="transmissionType" value="Manual" className="form-radio" />
                                                <span className="ml-2">Manual</span>
                                            </label>
                                        </div>
                                        <ErrorMessage name="transmissionType" component="div" className="text-red-500 text-sm" />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="source" className="text-sm font-medium text-gray-700">Source</label>
                                        <Field as="select" name="source" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                            <option value="">Select Source</option>
                                            <option value="Walk In">Walk In</option>
                                            <option value="Mobile App">Mobile App</option>
                                            <option value="Website">Website</option>
                                            <option value="Call">Call</option>
                                        </Field>
                                        <ErrorMessage name="source" component="div" className="text-red-500 text-sm" />
                                    </div>

                                     <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Service Type</p>
                                        <div className="space-x-4">
                                            <label className="inline-flex items-center">
                                                <Field
                                                    type="radio"
                                                    name="serviceType"
                                                    value="DRIVER"
                                                    className="form-radio"
                                                />
                                                <span className="ml-2">Driver Only</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <Field
                                                    type="radio"
                                                    name="serviceType"
                                                    value="DRIVER_WITH_CAB"
                                                    className="form-radio"
                                                />
                                                <span className="ml-2">Driver With Vehicle</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <Field
                                                    type="radio"
                                                    name="serviceType"
                                                    value="OWNER"
                                                    className="form-radio"
                                                />
                                                <span className="ml-2">OWNER</span>
                                            </label>
                                        </div>
                                        <ErrorMessage
                                            name="serviceType"
                                            component="div"
                                            className="text-red-500 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="address" className="text-sm font-medium text-gray-700">Current address</label>
                                        <Field name="address">
                                            {({ field, form }) => (
                                                <LocationInput
                                                    field={field}
                                                    form={form}
                                                    suggestions={addressSuggestions}
                                                    onSearch={searchLocations}
                                                    onSelect={handleGoogleAddressSelect}
                                                />
                                            )}
                                        </Field>
                                        <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
                                    </div>
                                </div>

                                <div className="flex items-center mt-2">
                                    <input
                                        type="checkbox"
                                        id="sameAddress"
                                        checked={isSameAddress}
                                        onChange={(e) => {
                                            setIsSameAddress(e.target.checked);
                                            if (e.target.checked) {
                                                const currentAddress = parseAddress(values.address);
                                        
                                                setFieldValue("streetName", currentAddress.street);
                                                setFieldValue("thaluk", currentAddress.taluk);
                                                setFieldValue("district", currentAddress.district);
                                                setFieldValue("state", currentAddress.state);
                                                setFieldValue("pinCode", currentAddress.pincode);
                                            } else {
                                                setFieldValue("streetName", "");
                                                setFieldValue("thaluk", "");
                                                setFieldValue("district", "");
                                                setFieldValue("state", "");
                                                setFieldValue("pinCode", "");
                                            }
                                        }}                                        
                                        className="mr-2"
                                    />
                                    <label htmlFor="sameAddress" className="text-sm text-gray-700">
                                        Same as Current Address
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 mb-5">Permanent Address</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="streetName" className="text-sm font-medium text-gray-700">Street Name</label>
                                    <Field type="text" name="streetName" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="streetName" component="div" className="text-red-500 text-sm my-1" />
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
                                    <label htmlFor="packages" className="text-sm font-medium text-gray-700">Package</label>
                                    <Multiselect
                                        options={packageDetails}
                                        displayValue="period"
                                        selectedValues={packageDetails.filter(option => values.packages.includes(option.id))}
                                        onSelect={(selectedList) => {
                                            setFieldValue("packages", selectedList.map(item => item.id));
                                            const newPrices = selectedList.filter((el) => !values.packages.includes(el.id)).map(item => ({
                                                packageId: item.id,
                                                period: item.period,
                                                price: item.price,
                                                extraPrice: item.extra_price,
                                                extraKmPrice: item.extraKmPrice,
                                                nightCharge: item.nightCharge,
                                                cancelCharge: item.cancelCharge,
                                                extraCabType: item.extraCabType
                                            }));
                                            setFieldValue("prices", [...values.prices, ...newPrices]);
                                        }}
                                        onRemove={(selectedList) => {
                                            setFieldValue("packages", selectedList.map(item => item.id));
                                            setFieldValue("prices", values.prices.filter(price =>
                                                selectedList.some(item => item.id === price.packageId)
                                            ));
                                        }}
                                        placeholder="Select options"
                                        className="w-full rounded-md border-gray-300"
                                        showCheckbox={true}
                                    />
                                </div>
                            </div>    
                            <div className="mt-6">
                            <div className="flex flex-row justify-between px-2 mb-2">
                                <Typography variant="h3" className="text-2xl font-bold text-blue-gray-800">
                                    Documents
                                </Typography>
                            </div>
                            <Card>
                                <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
                                    <table className="w-full min-w-[640px] table-auto">
                                        <thead>
                                            <tr>
                                                {["Type", "KYC Status", "Created At", "Verfied By", "Verified At", "Action", "View Details"].map((el, index) => (
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
                                                value={imagePreviews.aadhaarImage?.image1}
                                                name="aadhaarImage"
                                                onChange={(e) => handleImageUpload(e, setFieldValue, "aadhaarImage",imagePreviews?.aadhaarImage?.id)}
                                                setModalData={setModalData}
                                                fullDocVal={imagePreviews.aadhaarImage}
                                            />
                                            <DocumentUpload
                                                label="Police Clearance Certificate"
                                                value={imagePreviews.policeClearance?.image1}
                                                name="policeClearance"
                                                onChange={(e) => handleImageUpload(e, setFieldValue, "policeClearance",imagePreviews?.policeClearance?.id)}
                                                setModalData={setModalData}
                                                fullDocVal={imagePreviews.policeClearance}
                                            />
                                            <DocumentUpload
                                                label="Driving License Image"
                                                value={imagePreviews.drivingLicenseImage?.image1}
                                                name="drivingLicenseImage"
                                                onChange={(e) => handleImageUpload(e, setFieldValue, "drivingLicenseImage",imagePreviews?.drivingLicenseImage?.id)}
                                                setModalData={setModalData}
                                                fullDocVal={imagePreviews.drivingLicenseImage}
                                            />
                                            <DocumentUpload
                                                label="Consent Form Image"
                                                value={imagePreviews.consentForm?.image1}
                                                name="consentForm"
                                                onChange={(e) => handleImageUpload(e, setFieldValue, "consentForm",imagePreviews?.consentForm?.id)}
                                                setModalData={setModalData}
                                                fullDocVal={imagePreviews.consentForm}
                                            />
                                            <DocumentUpload
                                                label="Live Photo"
                                                value={imagePreviews.livePhoto?.image1}
                                                name="livePhoto"
                                                onChange={(e) => handleImageUpload(e, setFieldValue, "livePhoto",imagePreviews?.livePhoto?.id)}
                                                setModalData={setModalData}
                                                fullDocVal={imagePreviews.livePhoto}
                                            />
                                        </tbody>
                                    </table>
                                </CardBody>
                            </Card>
                        </div>
                        </div>
                        {values.packages.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Price Details</h2>
                                {renderPriceTable(
                                    "LOCAL",
                                    values.prices.filter(price => {
                                        const package_ = packageDetails.find(p => p.id === price.packageId);
                                        return package_?.type === 'Local';
                                    }),
                                    values,
                                    packageDetails
                                )}

                                {renderPriceTable(
                                    "OUTSTATION",
                                    values.prices.filter(price => {
                                        const package_ = packageDetails.find(p => p.id === price.packageId);
                                        return package_?.type === 'Outstation';
                                    }),
                                    values,
                                    packageDetails
                                )}

                                {renderPriceTable(
                                    "CAR WASH",
                                    values.prices.filter(price => {
                                        const package_ = packageDetails.find(p => p.id === price.packageId);
                                        return package_?.type === 'CarWash';
                                    }),
                                    values,
                                    packageDetails
                                )}
                            </div>
                        )}
                        <div className='flex flex-row'>
                            <Button
                                fullWidth
                                onClick={() => navigate(`/dashboard/vendors/account/drivers`)}
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
                        {modalData.image.endsWith(".pdf") ? (
                            <iframe
                                src={modalData.image}
                                className="w-full rounded-lg shadow-md"
                                style={{ height: "45vh" }}
                            />
                        ) : (
                            <img
                                src={modalData.image}
                                alt="Document"
                                className="max-w-full rounded-lg shadow-md"
                                style={{ height: "45vh", objectFit: "contain" }}
                            />
                        )}
                    </div>
                    <div className="flex justify-center mt-4">
                        <a
                            href={modalData.image}
                            download = "doucument.pdf"
                            target='_blank'
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Download
                        </a>
                    </div>
                    </DialogBody>
                </Dialog>
            )}
        </div>
    );
};

export default DriverEdit;