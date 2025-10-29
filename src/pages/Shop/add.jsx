import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import { Button, Dialog, DialogHeader, DialogBody, Typography, Card, CardBody, Input, List, ListItem, Spinner } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';

const ShopAdd = () => {
    const [shopLocation, setShopLocation] = useState(null);
    const [shopSuggestions, setShopSuggestions] = useState([]);
    const [zoneOptions, setZoneOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [documentLoading, setDocumentLoading] = useState({
        LICENSE: false,
        GST: false,
        LOGO: false,
    });
    const [uploadError, setUploadError] = useState(null); // State for error messages
    const [imagePreviews, setImagePreviews] = useState({
        LICENSE: { image1: null, id: null, fileType: null },
        GST: { image1: null, id: null, fileType: null },
        LOGO: { image1: null, id: null, fileType: null },
    });
    const [modalData, setModalData] = useState(null);
    const [shopAdded, setShopAdded] = useState({
        shopId: '',
        value: false,
    });
    const navigate = useNavigate();

    const fetchZonesFromGeoMarkings = async () => {
        try {
            const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GEO_MARKINGS_LIST, {});
            if (response?.success && response?.data) {
                const zones = response.data.filter(item => item.type === 'Service Area');
                const zoneOptions = zones.map(zone => ({
                    value: zone.name,
                    label: zone.name
                }));
                setZoneOptions(zoneOptions);
            }
        } catch (error) {
            console.error('Error fetching zones from geo markings:', error);
        }
    };

    useEffect(() => {
        fetchZonesFromGeoMarkings();
    }, []);

    const searchLocations = async (query) => {
        if (query.length > 2) {
            try {
                const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.SEARCH_ADDRESS, { address: query });
                if (data?.success && data?.data) {
                    setShopSuggestions(data.data);
                }
            } catch (error) {
                console.error('Error searching addresses:', error);
                setShopSuggestions([]);
            }
        } else {
            setShopSuggestions([]);
        }
    };

    const handleSelectLocation = async (address, setFieldValue) => {
        try {
            const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_LATLONG, { address });
            if (data?.success) {
                const location = { lat: data.data.lat, lng: data.data.lng };
                setFieldValue('shopAddress', address);
                setFieldValue('shopLocation', location);
                setFieldValue('shopLat', data.data.lat);
                setFieldValue('shopLong', data.data.lng);
                setShopLocation(location);
                setShopSuggestions([]);
            }
        } catch (error) {
            console.error('Error getting location:', error);
        }
    };

    const initialValues = {
        shopName: '',
        shopType: '',
        shopLat: null,
        shopLong: null,
        shopAddress: '',
        shopLandmark: '',
        shopZone: '',
        primaryPhone: '',
        secondaryPhone: '',
        landline: '',
        shopLocation: null,
        documents: {
            LICENSE: null,
            GST: null,
            LOGO: null,
        },
    };

    const validationSchema = Yup.object({
        shopName: Yup.string().required('Shop Name is required'),
        shopType: Yup.string().required('Shop Type is required'),
        shopAddress: Yup.string().required('Shop Address is required'),
        shopZone: Yup.string().required('Shop Zone is required'),
        primaryPhone: Yup.string().required('Primary Phone is required'),
        secondaryPhone: Yup.string().required('Secondary Phone is required'),
    });

    const DocumentUpload = ({ label, name, value, onChange, setModalData, fullDocVal, isLoading }) => {
        return (
            <tr>
                <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Typography className="text-xs font-semibold text-blue-gray-600">{label}</Typography>
                </td>
                <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Typography
                        className={`text-xs font-semibold ${isLoading ? 'text-yellow-500' : value ? 'text-green-500' : 'text-primary-500'}`}
                    >
                        {isLoading ? 'PENDING' : value ? 'UPLOADED' : 'NO DOCUMENTS'}
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
                            className="font-semibold underline cursor-pointer text-primary-900"
                            onClick={() => {
                                setModalData({
                                    image1: fullDocVal?.image1,
                                    fileType: fullDocVal?.fileType,
                                });
                            }}
                        >
                            View/Download
                        </Typography>
                    )}
                </td>
            </tr>
        );
    };

    const handleImageUpload = async (e, setFieldValue, documentType) => {
        try {
            // Validate shopId
            if (!shopAdded.shopId) {
                setUploadError('Cannot upload document: Shop ID is missing.');
                console.error('Shop ID is missing.');
                return;
            }

            setDocumentLoading((prev) => ({ ...prev, [documentType]: true }));
            setUploadError(null); // Clear previous errors

            const files = e.target.files;
            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            const maxSize = 10 * 1024 * 1024; // 10MB
            const maxFiles = 1;

            if (files.length > maxFiles) {
                setUploadError('Only one file can be uploaded at a time.');
                console.error('Too many files selected');
                return;
            }

            const file = files[0];
            if (!allowedTypes.includes(file.type)) {
                setUploadError('Invalid file type. Only JPEG, PNG, or PDF files are allowed.');
                console.error('Invalid file type:', file.type);
                return;
            }
            if (file.size > maxSize) {
                setUploadError('File size exceeds 10MB.');
                console.error('File size exceeds 10MB:', file.size);
                return;
            }

            // Generate temporary preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews((prev) => ({
                    ...prev,
                    [documentType]: { ...prev[documentType], tempPreview: reader.result },
                }));
            };
            reader.readAsDataURL(file);

            // Upload file to API
            const formData = new FormData();
            formData.append('documentType', documentType);
            formData.append('image', file);
            formData.append('extImage', file.name.split('.').pop());
            formData.append('fileType', file.type);

            const data = await ApiRequestUtils.updateDocs(`${API_ROUTES.SHOP_DOCUMENTS_UPDATED}${shopAdded.shopId}`, formData);

            // console.log('API response for document upload:', data);

            if (data?.success) {
                const documentUrl = data.data?.licenseDocument || data.data?.image1;
                if (!documentUrl) {
                    setUploadError('Upload failed: No valid document URL returned from server.');
                    console.error('No document URL in response:', data.data);
                    return;
                }

                setFieldValue(`documents.${documentType}`, file);
                setImagePreviews((prev) => ({
                    ...prev,
                    [documentType]: {
                        image1: documentUrl, // Use licenseDocument or image1
                        id: data.data.id || null,
                        fileType: file.type,
                    },
                }));
            } else {
                setUploadError('Upload failed: Server returned an error.');
                console.error('API response unsuccessful:', data);
            }
        } catch (err) {
            setUploadError('Error uploading document. Please try again.');
            console.error('Error uploading document:', err);
        } finally {
            setDocumentLoading((prev) => ({ ...prev, [documentType]: false }));
        }
    };

    const handleDownload = async (url, fileName) => {
        try {
            const response = await ApiRequestUtils.getFile(url);
            const blob = await response.blob();
            const objectUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = fileName || 'document';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(objectUrl);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    const onSubmit = async (values, { setSubmitting, resetForm }) => {
        setLoading(true);
        try {
            const shopData = {
                shopName: values.shopName,
                shopType: values.shopType,
                shopLat: values.shopLocation?.lat,
                shopLong: values.shopLocation?.lng,
                shopAddress: { name: values.shopAddress },
                shopLandmark: values.shopLandmark,
                shopZone: values.shopZone,
                primaryPhone: values.primaryPhone,
                secondaryPhone: values.secondaryPhone,
                landline: values.landline,
            };

            const data = await ApiRequestUtils.post(API_ROUTES.ADD_SHOP, shopData);
            // console.log('Shop creation response:', data);
            if (data?.success) {
                setShopAdded({
                    shopId: data?.data?.id,
                    value: true,
                });
            } else {
                setUploadError('Shop creation failed. Please try again.');
                console.error('Shop creation failed:', data);
            }
        } catch (error) {
            setUploadError('Error creating shop. Please try again.');
            console.error('Error creating shop:', error);
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/dashboard/vendors/shops');
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Add New Shop</h2>
            {uploadError && (
                <Typography color="red" className="mb-4">
                    {uploadError}
                </Typography>
            )}
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
                enableReinitialize={true}
            >
                {({ handleSubmit, dirty, isValid, setFieldValue, values, errors }) => (
                    <Form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="shopName" className="text-sm font-medium text-gray-700">Shop Name</label>
                                <Field type="text" name="shopName" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" />
                                <ErrorMessage name="shopName" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="shopType" className="text-sm font-medium text-gray-700">Shop Type</label>
                                <Field
                                    as="select"
                                    name="shopType"
                                    className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                >
                                    <option value="">Select Shop Type</option>
                                    <option value="Restaurant">Restaurant</option>
                                    <option value="Grocery">Grocery</option>
                                    <option value="Pharmacy">Pharmacy</option>
                                </Field>
                                <ErrorMessage name="shopType" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div className="col-span-2">
                                <label htmlFor="shopAddress" className="text-sm font-medium text-gray-700">Address</label>
                                <div className="relative">
                                    <Field
                                        type="text"
                                        name="shopAddress"
                                        className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                                        onChange={(e) => {
                                            setFieldValue('shopAddress', e.target.value);
                                            setFieldValue('shopLocation', null);
                                            setFieldValue('shopLat', null);
                                            setFieldValue('shopLong', null);
                                            setShopLocation(null);
                                            searchLocations(e.target.value);
                                        }}
                                    />
                                    {shopSuggestions.length > 0 && (
                                        <ul className="border rounded-lg bg-white mt-2">
                                            {shopSuggestions.map((suggestion, index) => (
                                                <li
                                                    key={index}
                                                    className="p-2 cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSelectLocation(suggestion, setFieldValue)}
                                                >
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <ErrorMessage name="shopAddress" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="shopLandmark" className="text-sm font-medium text-gray-700">Landmark</label>
                                <Field type="text" name="shopLandmark" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" />
                                <ErrorMessage name="shopLandmark" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="shopZone" className="text-sm font-medium text-gray-700">Zone</label>
                                <Field as="select" name="shopZone" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50" >
                                    <option value="">Select Zone</option>
                                    {zoneOptions.map((zone, index) => (
                                        <option key={index} value={zone.value}>
                                            {zone.label}
                                        </option>
                                    ))}
                                </Field>
                                <ErrorMessage name="shopZone" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="primaryPhone" className="text-sm font-medium text-gray-700">Primary Phone</label>
                                <Field type="tel" name="primaryPhone" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" maxLength={10} />
                                <ErrorMessage name="primaryPhone" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="secondaryPhone" className="text-sm font-medium text-gray-700">Secondary Phone</label>
                                <Field type="tel" name="secondaryPhone" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" maxLength={10} />
                                <ErrorMessage name="secondaryPhone" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="landline" className="text-sm font-medium text-gray-700">Landline</label>
                                <Field type="text" name="landline" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" />
                                <ErrorMessage name="landline" component="div" className="text-red-500 text-sm" />
                            </div>
                        </div>

                        {shopAdded.value && (
                            <div className="mt-6">
                                <Typography variant="h3" className="text-2xl font-bold text-blue-gray-800 mb-4">
                                    Document Upload
                                </Typography>
                                {loading ? (
                                    <div className="flex justify-center items-center h-32">
                                        <Spinner className="h-12 w-12" />
                                    </div>
                                ) : (
                                    <Card>
                                        <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
                                            <table className="w-full min-w-[640px] table-auto">
                                                <thead>
                                                    <tr>
                                                        {['Type', 'Status', 'Action', ''].map((el, index) => (
                                                            <th key={index} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                                                <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                                                                    {el}
                                                                </Typography>
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <DocumentUpload
                                                        label="Shop License"
                                                        name="LICENSE"
                                                        value={imagePreviews.LICENSE?.image1}
                                                        onChange={(e) => handleImageUpload(e, setFieldValue, 'LICENSE')}
                                                        setModalData={setModalData}
                                                        fullDocVal={imagePreviews.LICENSE}
                                                        isLoading={documentLoading.LICENSE}
                                                    />
                                                    <DocumentUpload
                                                        label="GST Document"
                                                        name="GST"
                                                        value={imagePreviews.GST?.image1}
                                                        onChange={(e) => handleImageUpload(e, setFieldValue, 'GST')}
                                                        setModalData={setModalData}
                                                        fullDocVal={imagePreviews.GST}
                                                        isLoading={documentLoading.GST}
                                                    />
                                                    <DocumentUpload
                                                        label="Shop Logo"
                                                        name="LOGO"
                                                        value={imagePreviews.LOGO?.image1}
                                                        onChange={(e) => handleImageUpload(e, setFieldValue, 'LOGO')}
                                                        setModalData={setModalData}
                                                        fullDocVal={imagePreviews.LOGO}
                                                        isLoading={documentLoading.LOGO}
                                                    />
                                                </tbody>
                                            </table>
                                        </CardBody>
                                    </Card>
                                )}
                            </div>
                        )}

                        <div className="flex flex-row">
                            <Button
                                fullWidth
                                onClick={handleCancel}
                                className="my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                fullWidth
                                onClick={handleSubmit}
                                disabled={loading || !dirty || !isValid}
                                className={`my-6 mx-2 ${ColorStyles.continueButtonColor || 'bg-blue-500'}`}
                            >
                                {loading ? 'Processing...' : 'Add Shop'}
                            </Button>
                        </div>

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
                                    <div className="flex flex-col items-center space-y-3">
                                        <div className="flex flex-col justify-center">
                                            {modalData.image1 && (
                                                modalData.fileType === 'application/pdf' ? (
                                                    <iframe
                                                        src={modalData.image1}
                                                        className="w-full rounded-lg shadow-md"
                                                        style={{ height: '45vh', width: '100%' }}
                                                    />
                                                ) : (
                                                    <img
                                                        src={modalData.image1}
                                                        alt="Document Preview"
                                                        className="w-full rounded-lg shadow-md"
                                                        style={{ maxHeight: '45vh', objectFit: 'contain' }}
                                                    />
                                                )
                                            )}
                                        </div>
                                        <div className="flex justify-center mt-4">
                                            <button
                                                onClick={() => handleDownload(modalData.image1, `document.${modalData.fileType.split('/')[1]}`)}
                                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700"
                                            >
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                </DialogBody>
                            </Dialog>
                        )}
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default ShopAdd;