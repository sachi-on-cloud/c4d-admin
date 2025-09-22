import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import { Button, List, ListItem, Card, CardBody, Spinner, Dialog, DialogHeader, DialogBody, Typography } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import { debounce } from 'lodash';

const ShopEdit = () => {
  const [shopVal, setShopVal] = useState({});
  const [zoneOptions, setZoneOptions] = useState([]);
  const [shopLocation, setShopLocation] = useState(null);
  const [shopSuggestions, setShopSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreviews, setImagePreviews] = useState({
    LICENSE: null,
    GST: null,
    LOGO: null,
  });
  const [uploadStatus, setUploadStatus] = useState({
    LICENSE: 'idle',
    GST: 'idle',
    LOGO: 'idle',
  });
  const [documentErrors, setDocumentErrors] = useState({
    LICENSE: null,
    GST: null,
    LOGO: null,
  });
  const [modalData, setModalData] = useState(null);
  const [pendingDocuments, setPendingDocuments] = useState({});
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const fetchZonesFromGeoMarkings = async () => {
    try {
      const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GEO_MARKINGS_LIST, {});
      if (response?.success && response?.data) {
        const zones = response.data.filter(item => item.type === 'Service Area');
        setZoneOptions(zones.map(zone => ({
          value: zone.name,
          label: zone.name,
        })));
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
      setError('Failed to fetch zones.');
    }
  };

  useEffect(() => {
    fetchZonesFromGeoMarkings();
    if (isEditMode) {
      fetchItem(id);
    }
  }, [id, isEditMode]);

  const fetchItem = async (itemId) => {
    try {
      const data = await ApiRequestUtils.get(`${API_ROUTES.GET_SHOP_BY_ID}/${itemId}`);
      if (data?.success) {
        setShopVal(data.data);
        setShopLocation(data.data.shopLocation || null);
        if (data.data.documents) {
          setImagePreviews({
            LICENSE: data.data.documents.LICENSE || null,
            GST: data.data.documents.GST || null,
            LOGO: data.data.documents.LOGO || null,
          });
        }
      } else {
        setError('Failed to fetch shop: ' + data?.message);
      }
    } catch (error) {
      console.error('Error fetching shop:', error);
      setError('Error fetching shop.');
    }
  };

  const debouncedSearchLocations = debounce(async (query) => {
    if (query.length > 2) {
      try {
        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.SEARCH_ADDRESS, { address: query });
        if (data?.success && data?.data) {
          setShopSuggestions(data.data);
        }
      } catch (error) {
        console.error('Error searching addresses:', error);
        setShopSuggestions([]);
        setError('Error searching addresses.');
      }
    } else {
      setShopSuggestions([]);
    }
  }, 300);

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
      setError('Error getting location.');
    }
  };

  const handleImageUpload = async (e, setFieldValue, documentType, shopId) => {
    try {
      setLoading(true);
      setUploadStatus((prev) => ({ ...prev, [documentType]: 'loading' }));
      setDocumentErrors((prev) => ({ ...prev, [documentType]: null }));
      const files = e.target.files;
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024;
      const maxFiles = 1;

      if (files.length > maxFiles) {
        throw new Error('Only one file can be uploaded.');
      }
      if (!shopId && isEditMode) {
        throw new Error('Shop ID is required for editing.');
      }
      if (!allowedTypes.includes(files[0].type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, or PDF are allowed.');
      }
      if (files[0].size > maxSize) {
        throw new Error('File size exceeds 10MB limit.');
      }

      const uploadedFiles = [files[0]];
      const previews = {};

      const reader = new FileReader();
      reader.onloadend = () => {
        previews[documentType] = { image1: reader.result };
        setImagePreviews((prev) => ({ ...prev, ...previews }));
      };
      reader.readAsDataURL(files[0]);

      if (!isEditMode) {
        setPendingDocuments((prev) => ({ ...prev, [documentType]: files[0] }));
        setFieldValue(`documents.${documentType}`, uploadedFiles);
        setUploadStatus((prev) => ({ ...prev, [documentType]: 'success' }));
        return;
      }

      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('image', files[0]);
      formData.append('extImage', files[0].name.split('.').pop());
      formData.append('fileType', files[0].type);
      formData.append('shopId', shopId);

      const data = await ApiRequestUtils.updateDocs(`${API_ROUTES.SHOP_DOCUMENTS_UPDATED}/${shopId}`, formData);

      if (data?.success) {
        setFieldValue(`documents.${documentType}`, uploadedFiles);
        setImagePreviews((prev) => ({
          ...prev,
          [documentType]: {
            image1: data?.data?.image1,
            id: data?.data?.id,
          },
        }));
        setUploadStatus((prev) => ({ ...prev, [documentType]: 'success' }));
      } else {
        throw new Error(data?.message || 'Failed to upload document.');
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setDocumentErrors((prev) => ({ ...prev, [documentType]: err.message }));
      setUploadStatus((prev) => ({ ...prev, [documentType]: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const uploadPendingDocuments = async (shopId, setFieldValue) => {
    try {
      for (const [documentType, file] of Object.entries(pendingDocuments)) {
        const formData = new FormData();
        formData.append('documentType', documentType);
        formData.append('image', file);
        formData.append('extImage', file.name.split('.').pop());
        formData.append('fileType', file.type);
        formData.append('shopId', shopId);

        const data = await ApiRequestUtils.postDocs(`${API_ROUTES.SHOP_DOCUMENTS_UPDATED}/${shopId}`, formData);
        if (data?.success) {
          setFieldValue(`documents.${documentType}`, [file]);
          setImagePreviews((prev) => ({
            ...prev,
            [documentType]: {
              image1: data?.data?.image1,
              id: data?.data?.id,
            },
          }));
          setUploadStatus((prev) => ({ ...prev, [documentType]: 'success' }));
        } else {
          throw new Error(`Failed to upload ${documentType} document: ${data?.message}`);
        }
      }
      setPendingDocuments({});
    } catch (err) {
      console.error('Error uploading pending documents:', err);
      setDocumentErrors((prev) => ({ ...prev, [documentType]: err.message }));
      setUploadStatus((prev) => ({ ...prev, [documentType]: 'error' }));
    }
  };

  const initialValues = {
    shopName: shopVal?.shopName || '',
    shopType: shopVal?.shopType || '',
    shopLat: shopVal?.shopLocation?.lat || null,
    shopLong: shopVal?.shopLocation?.lng || null,
    shopAddress: shopVal?.shopAddress?.name || shopVal?.shopAddress || '',
    shopLandmark: shopVal?.shopLandmark || '',
    shopZone: shopVal?.shopZone || '',
    primaryPhone: shopVal?.primaryPhone || '',
    secondaryPhone: shopVal?.secondaryPhone || '',
    landline: shopVal?.landline || '',
    documents: {
      LICENSE: shopVal?.documents?.LICENSE || null,
      GST: shopVal?.documents?.GST || null,
      LOGO: shopVal?.documents?.LOGO || null,
    },
  };

  const validationSchema = Yup.object({
    shopName: Yup.string().required('Shop Name is required'),
    shopType: Yup.string().required('Shop Type is required'),
    shopAddress: Yup.string().required('Shop Address is required'),
    shopZone: Yup.string().required('Shop Zone is required'),
    primaryPhone: Yup.string()
      .required('Primary Phone is required')
      .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
    secondaryPhone: Yup.string()
      .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits')
      .optional(),
  });

  const DocumentUpload = ({ label, name, value, onChange, setModalData, fullDocVal }) => {
    return (
      <tr>
        <td className="py-3 px-5 border-b border-blue-gray-50">
          <Typography className="text-xs font-semibold text-blue-gray-600">{label}</Typography>
        </td>
        <td className="py-3 px-5 border-b border-blue-gray-50">
          <Typography
            className={`text-xs font-semibold ${
              uploadStatus[name] === 'loading' ? 'text-yellow-500' :
              uploadStatus[name] === 'error' ? 'text-red-500' :
              value ? 'text-green-500' : 'text-primary-500'
            }`}
          >
            {uploadStatus[name] === 'loading' ? 'UPLOADING...' :
             uploadStatus[name] === 'error' ? 'UPLOAD FAILED' :
             value ? 'UPLOADED' : 'NO DOCUMENTS'}
          </Typography>
          {documentErrors[name] && (
            <Typography className="text-red-500 text-xs">{documentErrors[name]}</Typography>
          )}
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
              accept="image/jpeg,image/png,application/pdf"
              id={name}
              name={name}
              onChange={onChange}
              className="hidden"
              aria-label={`Upload ${label} document`}
            />
          </div>
        </td>
        <td className="py-3 px-5 border-b border-blue-gray-50">
          {value && value.startsWith('http') && (
            <Typography
              variant="small"
              className="font-semibold underline cursor-pointer text-primary-900"
              onClick={() => setModalData({ image1: fullDocVal?.image1 })}
            >
              View/Download
            </Typography>
          )}
        </td>
      </tr>
    );
  };

  const onSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      setError(null);
      const shopData = {
        shopName: values.shopName,
        shopType: values.shopType,
        shopLat: values.shopLocation?.lat || values.shopLat,
        shopLong: values.shopLocation?.lng || values.shopLong,
        shopAddress: { name: values.shopAddress },
        shopLandmark: values.shopLandmark,
        shopZone: values.shopZone,
        primaryPhone: values.primaryPhone,
        secondaryPhone: values.secondaryPhone,
        landline: values.landline,
      };

      let data;
      let shopId = id;
      if (isEditMode) {
        shopData.id = id;
        data = await ApiRequestUtils.update(API_ROUTES.UPDATE_SHOP, shopData);
      } else {
        data = await ApiRequestUtils.post(API_ROUTES.ADD_SHOP, shopData);
        shopId = data?.data?.id;
        if (!shopId) {
          throw new Error('Shop ID not returned from server.');
        }
      }

      if (data?.success) {
        if (!isEditMode && Object.keys(pendingDocuments).length > 0) {
          await uploadPendingDocuments(shopId, setFieldValue);
        }
        navigate('/dashboard/vendors/shops', {
          state: {
            shopUpdated: isEditMode,
            shopAdded: !isEditMode,
            shopName: values.shopName,
            shopId,
          },
        });
      } else {
        setError('Failed to save shop: ' + data?.message);
      }
    } catch (error) {
      console.error('Error saving shop:', error);
      setError(error.response?.data?.message || 'Error saving shop.');
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
      <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Edit Shop' : 'Add Shop'}</h2>
      {error && (
        <div className="text-red-500 text-sm mb-4">{error}</div>
      )}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize={true}
      >
        {({ handleSubmit, dirty, isValid, setFieldValue, values }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="shopName" className="text-sm font-medium text-gray-700">Shop Name <span className="text-red-500">*</span></label>
                <Field type="text" name="shopName" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" />
                <ErrorMessage name="shopName" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label htmlFor="shopType" className="text-sm font-medium text-gray-700">Shop Type <span className="text-red-500">*</span></label>
                <Field as="select" name="shopType" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50">
                  <option value="">Select Shop Type</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Grocery">Grocery</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Others">Others</option>
                </Field>
                <ErrorMessage name="shopType" component="div" className="text-red-500 text-sm" />
              </div>
              <div className="col-span-2">
                <label htmlFor="shopAddress" className="text-sm font-medium text-gray-700">Address <span className="text-red-500">*</span></label>
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
                      debouncedSearchLocations(e.target.value);
                    }}
                  />
                  {shopSuggestions.length > 0 && (
                    <List className="border rounded-lg bg-white mt-2">
                      {shopSuggestions.map((suggestion, index) => (
                        <ListItem
                          key={index}
                          className="p-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSelectLocation(suggestion, setFieldValue)}
                        >
                          {suggestion}
                        </ListItem>
                      ))}
                    </List>
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
                <label htmlFor="shopZone" className="text-sm font-medium text-gray-700">Zone <span className="text-red-500">*</span></label>
                <Field as="select" name="shopZone" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50">
                  <option value="">Select Zone</option>
                  {zoneOptions.map((zone, index) => (
                    <option key={index} value={zone.value}>{zone.label}</option>
                  ))}
                </Field>
                <ErrorMessage name="shopZone" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label htmlFor="primaryPhone" className="text-sm font-medium text-gray-700">Primary Phone <span className="text-red-500">*</span></label>
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
                          onChange={(e) => handleImageUpload(e, setFieldValue, 'LICENSE', id)}
                          setModalData={setModalData}
                          fullDocVal={imagePreviews.LICENSE}
                        />
                        <DocumentUpload
                          label="GST Document"
                          name="GST"
                          value={imagePreviews.GST?.image1}
                          onChange={(e) => handleImageUpload(e, setFieldValue, 'GST', id)}
                          setModalData={setModalData}
                          fullDocVal={imagePreviews.GST}
                        />
                        <DocumentUpload
                          label="Shop Logo"
                          name="LOGO"
                          value={imagePreviews.LOGO?.image1}
                          onChange={(e) => handleImageUpload(e, setFieldValue, 'LOGO', id)}
                          setModalData={setModalData}
                          fullDocVal={imagePreviews.LOGO}
                        />
                      </tbody>
                    </table>
                  </CardBody>
                </Card>
              )}
            </div>

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
                {loading ? 'Processing...' : isEditMode ? 'Update Shop' : 'Add Shop'}
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
                      aria-label="Close document modal"
                    >
                      X
                    </button>
                  </div>
                </DialogHeader>
                <DialogBody divider>
                  <div className="flex flex-col items-center space-y-3">
                    {modalData.image1 && modalData.image1.startsWith('http') ? (
                      modalData.image1.includes('.pdf') ? (
                        <embed
                          src={modalData.image1}
                          type="application/pdf"
                          className="w-full rounded-lg shadow-md"
                          style={{ height: '45vh' }}
                        />
                      ) : (
                        <img
                          src={modalData.image1}
                          alt="Document"
                          className="w-full rounded-lg shadow-md"
                          style={{ height: '45vh', objectFit: 'contain' }}
                        />
                      )
                    ) : (
                      <Typography color="red">Invalid or missing document URL</Typography>
                    )}
                    <div className="flex justify-center mt-4">
                      {modalData.image1 && modalData.image1.startsWith('http') && (
                        <a
                          href={modalData.image1}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700"
                        >
                          Download Document
                        </a>
                      )}
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

export default ShopEdit;