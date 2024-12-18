import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, DISTRICT_LIST, THALUK_LIST, STATE_LIST, KYC_PROCESS } from '@/utils/constants';
import { Button, Card, CardBody, Typography, Input, List, ListItem } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import Multiselect from 'multiselect-react-dropdown';
import { DRIVER_SCHEMA } from '@/utils/validations';
import Select from 'react-select';

const LocationInput = ({ field, form, suggestions, onSearch }) => {
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
                navigate('/dashboard/drivers');
         }
        } catch (error) {
            console.error('Error fetching driver:', error);
            navigate('/dashboard/drivers');
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
        preference: driverVal?.result?.preference || "",
        carType: driverVal?.result?.carType || "",
        packages: driverVal?.result?.packages || "",
        //wallet: driverVal?.result?.wallet || "",
        prices: driverVal?.price ? driverVal?.price.filter((el) => driverVal?.result?.packages.includes(el.packageId)) : [],
        withOwner: driverVal?.result?.Account? "Yes":"No",
        ownerName:driverVal?.result?.Account?.name || "",
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
                preference: values.preference,
                packages: values.packages,
                carType: values.carType,
                //wallet: values.wallet,
                driverId: id
            };
            let driverData = { driverDetails, prices: values.prices }
            //return;
            const data = await ApiRequestUtils.update(API_ROUTES.UPDATE_DRIVER, driverData);
            console.log('data in driver add :', data);
            if (data?.success) {
                navigate('/dashboard/drivers', {
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

    const DocumentUpload = ({ label, name, onChange, imagePreview, onView }) => {
        return (
            <div>
                <label htmlFor={name} className="text-sm font-medium text-gray-700">
                    {label}
                </label>
                <div className="mt-1">
                    <div className="relative w-40 h-40 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
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
                        className="hidden"
                    />
                    <div className="flex space-x-2 mt-2">
                        {imagePreview && <button
                            type="button"
                            onClick={() => onView(imagePreview)}
                            className="p-2 text-center text-white border border-gray-400 bg-black rounded-xl cursor-pointer"
                        >
                            View
                        </button>}
                        <label
                            htmlFor={name}
                            className="p-2 text-center text-white border border-gray-400 bg-black rounded-xl cursor-pointer"
                        >
                            Upload Image
                        </label>
                    </div>
                </div>
            </div>
        );
    };    

    const handleImageUpload = async (e, setFieldValue, label, docId) => {
        const file = e.target.files[0];
        if (file) {
            setFieldValue(label, file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews((prev) => ({
                    ...prev,
                    [label]: {
                        image1: reader.result,
                        id: docId
                    },
                }));
            };
            reader.readAsDataURL(file);

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

            console.log('DATA IN DOC UPDATE :', data);
        }
    }

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
                                    <p className="text-sm font-medium text-gray-700 mb-2">With Owner</p>
                                    <div className="space-x-4">
                                    <label className="inline-flex items-center">
                                        <Field
                                            type="radio"
                                            name="withOwner"
                                            value="Yes"
                                            className="form-radio"
                                            disabled
                                        />
                                        <span className="ml-2">Yes</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <Field
                                            type="radio"
                                            name="withOwner"
                                            value="No"
                                            className="form-radio"
                                            disabled
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

                                {values.withOwner == "Yes" && 
                                <div>
                                    <label htmlFor='ownerName' className='text-sm font-medium text-gray-700'>Owner Name</label>
                                    <Field type="text" name="ownerName" disabled className="p-2 w-full rounded-md border border-gray-300 shadow-sm bg-gray-200" />
                                    <ErrorMessage name="ownerName" component="div" className="text-red-500 text-sm" />
                                </div>  
                                }

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
                                    <label htmlFor="wallet" className="text-sm font-medium text-gray-700">Wallet</label>
                                    <Field type="number" name="wallet" className="p-2 w-full rounded-md border-gray-300" />
                                    <ErrorMessage name="wallet" component="div" className="text-red-500 text-sm" />
                                </div> */}
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
                            <div className='grid grid-cols-2'>
                                <DocumentUpload
                                    label="Consent Form Image"
                                    name="consentForm"
                                    onChange={(e) => handleImageUpload(e, setFieldValue, 'consentForm', imagePreviews?.consentForm?.id)}
                                    imagePreview={imagePreviews.consentForm?.image1}
                                    onView={(documentUrl) => handleOpenDocument(documentUrl)}
                                />
                                <DocumentUpload
                                    label="Aadhaar Image"
                                    name="aadhaarImage"
                                    onChange={(e) => handleImageUpload(e, setFieldValue, 'aadhaarImage', imagePreviews?.aadhaarImage?.id)}
                                    imagePreview={imagePreviews.aadhaarImage?.image1}
                                    onView={(documentUrl) => handleOpenDocument(documentUrl)}
                                />
                                <DocumentUpload
                                    label="Police Clearance Certificate"
                                    name="policeClearance"
                                    onChange={(e) => handleImageUpload(e, setFieldValue, 'policeClearance',imagePreviews?.policeClearance?.id)}
                                    imagePreview={imagePreviews.policeClearance?.image1}
                                    onView={(documentUrl) => handleOpenDocument(documentUrl)}
                                />

                                {/* Driving License Image Upload */}
                                <DocumentUpload
                                    label="Driving License Image"
                                    name="drivingLicenseImage"
                                    onChange={(e) => handleImageUpload(e, setFieldValue, 'drivingLicenseImage', imagePreviews?.drivingLicenseImage?.id)}
                                    imagePreview={imagePreviews.drivingLicenseImage?.image1}
                                    onView={(documentUrl) => handleOpenDocument(documentUrl)}
                                />

                                {/* Live Photo Upload */}
                                <DocumentUpload
                                    label="Live Photo"
                                    name="livePhoto"
                                    onChange={(e) => handleImageUpload(e, setFieldValue, 'livePhoto', imagePreviews?.livePhoto?.id)}
                                    imagePreview={imagePreviews.livePhoto?.image1}
                                    onView={(documentUrl) => handleOpenDocument(documentUrl)}
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
                                Update
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default DriverEdit;