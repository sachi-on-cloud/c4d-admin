import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import { Button, Card, CardBody, Typography, Input, List, ListItem } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import Multiselect from 'multiselect-react-dropdown';
import { CAB_SCHEMA } from '@/utils/validations';

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
                <List className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
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

const CabEdit = () => {
    const [cabVal, setCabVal] = useState({});
    const [alert, setAlert] = useState(false);
    const [packageDetails, setPackageDetails] = useState([]);
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    function getNameById(id, obj) {
        for (const key in obj) {
            if (obj[key].id === id) {
                return obj[key].period;
            }
        }
        return null;
    }
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
        fetchItem(id);
    }, [id]);

    const fetchItem = async (itemId) => {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_CAB_BY_ID + `${itemId}`);
        setCabVal(data.data);
    };

    const initialValues = {
        name: cabVal?.result?.name || "",
        phoneNumber: cabVal?.result?.phoneNumber ? cabVal?.result?.phoneNumber.replace(/^(\+91)/, '') : "",
        carNumber: cabVal?.result?.carNumber || "",
        address: cabVal?.result?.curAddress || "",
        company: cabVal?.result?.company || "",
        insurance: cabVal?.result?.insurance || "",
        preference: cabVal?.result?.preference || "",
        packages: cabVal?.result?.packages || "",
        carType: cabVal?.result?.carType || "",
        wallet: cabVal?.result?.wallet || "",
        mode: cabVal?.result?.mode ? cabVal?.result?.mode === 'PREPAID' ? 'PREPAID' : 'COMMISSION' : "",
        withDriver: cabVal?.result?.withDriver || "",
        driverName: cabVal?.result?.driverName || "",
        prices: cabVal?.price ? cabVal?.price.filter((el) => cabVal?.result?.packages.includes(el.packageId)) : []
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

    const onSubmit = async (values, { setSubmitting, resetForm }) => {
        //console.log('onSubmit :', values)
        try {
            const cabDetails = {
                name: values.name,
                phoneNumber: "+91" + values.phoneNumber,
                carNumber: values.carNumber,
                curAddress: values.address,
                company: values.company,
                withDriver: values.withDriver,
                driverName: values.driverName,
                insurance: values.insurance,
                packages: values.packages,
                carType: values.carType,
                wallet: values.wallet,
                mode: values.mode,
                cabId: id
            };
            let cabData = { cabDetails, prices: values.prices }
            //return;
            const data = await ApiRequestUtils.update(API_ROUTES.UPDATE_CAB, cabData);
            console.log('data in cab add :', data);
            navigate('/dashboard/cab', {
                state: {
                    cabAdded: true,
                    cabName: data?.data?.name
                }
            });

        } catch (error) {
            console.error('Error creating driver and car:', error);
        }
        setSubmitting(false);
    };

    const isFormValid = (values, errors) => {
        const requiredFields = ['salutation', 'firstName', 'phoneNumber', 'license', 'address', 'reference', 'preference', 'mode', 'packages', 'wallet'];
        const areRequiredFieldsFilled = requiredFields.every(field => values[field] && values[field].length > 0);

        const isPricesFilled = values.prices.some(price =>
            price.price || price.extraPrice || price.extraKmPrice ||
            price.nightCharge || price.cancelCharge || price.extraCabType
        );
        const hasErrors = Object.keys(errors).length > 0;
        return areRequiredFieldsFilled && isPricesFilled && !hasErrors;
    };
    return (
        <div className="p-4 mx-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Cab</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={CAB_SCHEMA}
                onSubmit={onSubmit}
                enableReinitialize={true}
            >
                {({ handleSubmit, values, errors, dirty, isValid, handleChange, setFieldValue }) => (
                    <Form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                                <Field type="text" name="name" className="p-2 w-full rounded-md border border-gray-300 shadow-sm" />
                                <ErrorMessage name="name" component="div" className="text-red-500 text-sm my-1" />
                            </div>

                            <div>
                                <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</label>
                                <Field type="tel" name="phoneNumber" className="p-2 w-full rounded-md border border-gray-300 " maxLength={10} />
                                <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="carNumber" className="text-sm font-medium text-gray-700">Car Number</label>
                                <Field type="text" name="carNumber" className="p-2 w-full rounded-md border-gray-300 border" maxLength={15} />
                                <ErrorMessage name="carNumber" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="company" className="text-sm font-medium text-gray-700">Company</label>
                                <Field type="text" name="company" className="p-2 w-full rounded-md border-gray-300 border" />
                                <ErrorMessage name="company" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="address" className="text-sm font-medium text-gray-700">Address</label>
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
                                <label htmlFor="insurance" className="text-sm font-medium text-gray-700">Insurance</label>
                                <Field type="text" name="insurance" className="p-2 w-full rounded-md border-gray-300 border" />
                                <ErrorMessage name="insurance" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">With Driver</p>
                                <div className="space-x-4">
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="withDriver" value="Yes" className="form-radio" />
                                        <span className="ml-2">Yes</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="withDriver" value="No" className="form-radio" />
                                        <span className="ml-2">No</span>
                                    </label>
                                </div>
                                <ErrorMessage name="preference" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="driverName" className="text-sm font-medium text-gray-700">Driver Name</label>
                                <Field type="text" name="driverName" className="p-2 w-full rounded-md border-gray-300 border" />
                                <ErrorMessage name="driverName" component="div" className="text-red-500 text-sm" />
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
                                                                {getNameById(priceItem.packageId, packageDetails)}
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
                                onClick={() => {
                                    console.log('ON UPDATE');
                                    handleSubmit()
                                }}
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

export default CabEdit;