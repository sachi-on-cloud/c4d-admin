import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Button, Alert, Spinner } from '@material-tailwind/react';
import * as Yup from 'yup';
import { ColorStyles, API_ROUTES } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { DISCOUNT_EDIT_SCHEMA } from '@/utils/validations';
import Select from 'react-select';

const DiscountEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [initialValues, setInitialValues] = useState(null);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [premiumServicesMap, setPremiumServicesMap] = useState({});
  const [alert, setAlert] = useState(null);

  const formatDateOnly = (isoString) => {
    return isoString ? isoString.slice(0, 10) : '';
  };

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GEO_MARKINGS_LIST,{
          type: 'Service Area',
        });
        if (response.premiumServices) {
          setPremiumServicesMap(response.premiumServices);
        }
        setServiceAreas(response.data);
      } catch (error) {
        console.error('Error fetching GEO_MARKINGS_LIST:', error);
      }
    };
    fetchGeoData();
  }, []);

  const ZONE_OPTIONS = [
    { value: 'All', label: 'All' },
    ...serviceAreas.map((area) => ({
      value: area.name,
      label: area.name,
    })),
  ];

    const handleImageUpload = (file,setFieldValue) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];

      if(!file || !validTypes.includes(file.type)) {
        alert('Only JPEG and PNG images are allowed.');
        return;
      }

    setFieldValue('image', file);
    setFieldValue('imageUrl', '');
    setImagePreview(URL.createObjectURL(file));
  }
  const getCurrentPremiumOptions = (serviceType) => {
    return premiumServicesMap[serviceType] || [];
  };

  useEffect(() => {
    const discountFromState = location.state?.discount;

    const fetchDiscount = async () => {
      try {
        if (discountFromState) {
          setInitialValues({
            discountId: discountFromState.discountId || discountFromState.id,
            percentage: discountFromState.percentage || '',
            startDate: formatDateOnly(discountFromState.startDate),
            endDate: formatDateOnly(discountFromState.endDate),
            serviceType: discountFromState.serviceType || '',
            title: discountFromState.title || '',
            description: discountFromState.description || '',
            isActive: discountFromState.isActive ? 'true' : 'false',
            cabType: discountFromState.cabType || '',
            image: null,
            imageUrl: discountFromState.imageUrl || '',
            serviceArea: discountFromState.serviceArea ? (discountFromState.serviceArea === 'All' ? ['All'] : Array.isArray(discountFromState.serviceArea) ? discountFromState.serviceArea : [discountFromState.serviceArea]) : [],
            cabType: discountFromState.isPremium ? discountFromState.cabType : discountFromState.cabType,           
            premiumCabType: discountFromState.isPremium ? discountFromState.cabType : '',    
            isPremium: discountFromState.isPremium,
          });
          setImagePreview(discountFromState.imageUrl || null)
        } else {
          const res = await ApiRequestUtils.get(`${API_ROUTES.GET_DISCOUNT}/${id}`);
          const data = res?.data;
          setInitialValues({
            discountId: data.discountId || data.id,
            percentage: data.percentage || '',
            startDate: formatDateOnly(data.startDate),
            endDate: formatDateOnly(data.endDate),
            serviceType: data.serviceType || '',
            isActive: data.isActive ? 'true' : 'false',
            title: data.title || '',
            description: data.description || '',
            cabType: data.cabType || '',
            image: null,
            imageUrl: data.imageUrl || '',
            serviceArea: data.serviceArea ? (data.serviceArea === 'All' ? ['All'] : Array.isArray(data.serviceArea) ? data.serviceArea : [data.serviceArea]) : [],
            cabType: data.isPremium ? '' : data.cabType,           
            premiumCabType: data.isPremium ? data.cabType : '',    
            isPremium: data.isPremium,
          });
          setImagePreview(data.imageUrl || null);
        }
      } catch (err) {
        console.error('Failed to load discount:', err);
        alert('Discount not found');
        navigate('/dashboard/user/discountModuleList');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscount();
  }, [id, location.state, navigate, premiumServicesMap]);

  const safeDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  };


  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();
      formData.append('discountId', Number(values.discountId));
      formData.append('serviceType', values.serviceType);
      formData.append('percentage', values.percentage);
      formData.append('startDate', safeDate(values.startDate));
      formData.append('endDate', safeDate(values.endDate));
      formData.append('isActive', values.isActive);
      formData.append('title', values.title);
      formData.append('description', values.description);

      formData.append('serviceArea', values.serviceArea.includes('All') ? ['All'] : values.serviceArea);
      if (values.image) {
        formData.append('image', values.image);
        formData.append('fileType', values.image?.type || '');
        formData.append('extImage', values.image?.name?.split('.').pop()?.toLowerCase() || '');
      } else {
        formData.append('fileType', '');
        formData.append('extImage', '');
      }
      const finalCabType = values.isPremium
        ? (values.premiumCabType || '')
        : (values.cabType || '');
      formData.append('cabType', finalCabType);
      formData.append('isPremium', values.isPremium);
    const response = await ApiRequestUtils.updateDocs(API_ROUTES.PUT_DISCOUNT, formData);

      if (response?.success) {
        
        navigate('/dashboard/user/discountModuleList', {
          state: { updatedDiscount: response.data },
        });
      } else {
        setAlert({ color: 'red', message: 'Failed to update discount' });
        setTimeout(() => setAlert(null), 3000);
      }
    } catch (error) {
      console.error('Update failed:', error);
      setAlert({ color: 'red', message: 'Update failed!' });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !initialValues) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto">
      {alert && (
        <div className="mb-2">
          <Alert color={alert.color}>{alert.message}</Alert>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4">Edit Discount</h2>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={DISCOUNT_EDIT_SCHEMA}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, isValid, setFieldValue, values }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field type="hidden" name="discountId" />

              <div>
                <label className="text-sm font-medium text-gray-700">Service Type</label>
                <Field
                  as="select"
                  name="serviceType"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                >
                  <option value="">Select Service Type</option>
                  <option value="DRIVER">DRIVER</option>
                  <option value="RIDES">RIDES</option>
                  <option value="RENTAL_HOURLY_PACKAGE">HOURLY PACKAGE</option>
                  <option value="RENTAL_DROP_TAXI">DROP TAXI</option>
                  <option value="RENTAL">OUTSTATION</option>
                  <option value="AUTO">AUTO</option>
                  <option value="ALL">ALL</option>
                </Field>
                <ErrorMessage name="serviceType" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Image</label>
                {imagePreview && !values.image && values.imageUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Current Image:</p>
                    <img
                      src={imagePreview}
                      alt="Current"
                      className="w-32 h-32 object-cover border rounded-md"
                    />
                  </div>
                )}
                {values.image && (
                  <div className="mt-2">
                    <p className="text-xs text-green-600 font-medium mb-1">New Image Preview:</p>
                    <img
                      src={imagePreview}
                      alt="New preview"
                      className="w-32 h-32 object-cover border-2 border-green-500 rounded-md"
                    />
                    <p className="text-xs text-gray-500 mt-1">Will replace current image</p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="mt-3 p-2 w-full rounded-md border border-gray-300 shadow-sm text-sm"
                  onChange={(e) => handleImageUpload(e.currentTarget.files[0], setFieldValue)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to keep current image
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center space-x-3 cursor-pointer text-lg font-medium">
                <Field
                    type="checkbox"
                    name="isPremium"
                    className="w-5 h-5 text-blue-600 rounded"
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFieldValue('isPremium', checked);
                      if (checked) setFieldValue('cabType', '');
                      else setFieldValue('premiumCabType', '');
                    }}
                  />
                  <span>Enable Premium</span>
                </label>
                {values.isPremium && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <p className="text-lg font-semibold text-blue-900 mb-4">Select Premium Car Type:</p>
                    {getCurrentPremiumOptions(values.serviceType).length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {getCurrentPremiumOptions(values.serviceType).map((premium) => {
                          const carType = premium.carType;
                          return (
                            <label
                              key={carType}
                              className={`flex items-center space-x-3 p-4 bg-white rounded-lg border-2 cursor-pointer transition
                                ${values.premiumCabType === carType ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-300 hover:border-blue-400'}`}
                            >
                              <input
                                type="radio"
                                name="premiumCabType"
                                value={carType}
                                checked={values.premiumCabType === carType}
                                onChange={() => setFieldValue('premiumCabType', carType)}
                                className="w-5 h-5 text-blue-600"
                              />
                              <span className="font-medium">{premium.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-600 italic">No premium options for {values.serviceType}</p>
                    )}
                    <ErrorMessage name="premiumCabType" component="div" className="text-red-500 text-sm mt-3" />
                  </div>
                )}
              </div>
              {!values.isPremium && (
              <div>
                <label className="text-sm font-medium text-gray-700">Car Type</label>
                <Field
                  as="select"
                  name="cabType"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                >
                  <option value="">Select Car Type</option>
                  <option value="Mini">Mini</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">Suv</option>
                  <option value="MUV">Muv</option>
                </Field>
                <ErrorMessage name="cabType" component="div" className="text-red-500 text-sm" />
              </div>
              )}
              <div>
                <label htmlFor="title" className="text-sm font-medium text-gray-700">Title</label>
                <Field type="text" name="title" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" />
                <ErrorMessage name="title" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Discount Percentage (%)</label>
                <Field
                  name="percentage"
                  type="number"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                />
                <ErrorMessage name="percentage" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <Field
                  name="startDate"
                  type="date"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                />
                <ErrorMessage name="startDate" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">End Date</label>
                <Field
                  name="endDate"
                  type="date"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                />
                <ErrorMessage name="endDate" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
              <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
              <Field as="textarea" name="description" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" rows="4" />
              <ErrorMessage name="description" component="div" className="text-red-500 text-sm my-1" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Field
                  as="select"
                  name="isActive"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Field>
                <ErrorMessage name="isActive" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label htmlFor="serviceArea" className="text-sm font-medium text-gray-700">Select Service Area</label>
                <Select
                  name="serviceArea"
                  options={ZONE_OPTIONS}
                  isMulti
                  value={values.serviceArea.map((val) => ({ value: val, label: val }))}
                  onChange={(selectedOptions) => {
                    const selectedValues = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                    if (selectedValues.includes('All') && selectedValues.length > 1) {
                      setFieldValue('serviceArea', ['All']); // Only keep 'All' if selected with other cities
                    } else if (selectedValues.includes('All')) {
                      setFieldValue('serviceArea', ['All']); // Keep only 'All'
                    } else {
                      setFieldValue('serviceArea', selectedValues); // Allow multiple serviceArea selections
                    }
                  }}
                  placeholder="Select Service Area"
                  className="mt-1"
                />
                <ErrorMessage name="serviceArea" component="div" className="text-red-500 text-sm mt-1" />
              </div>
            </div>

            <div className="flex flex-row">
              <Button
                fullWidth
                type="button"
                className={`my-6 mx-2 rounded-xl ${ColorStyles.backButton}`}
                onClick={() => navigate('/dashboard/user/discountModuleList')}
              >
                Back
              </Button>
              <Button
                fullWidth
                type="submit"
                disabled={isSubmitting || !isValid}
                className={`my-6 px-8 border-2 rounded-xl ${ColorStyles.continueButtonColor}`}
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

export default DiscountEdit;
