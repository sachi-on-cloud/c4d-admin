import React, { useEffect, useState } from 'react';
import { Formik, Field, ErrorMessage, Form } from 'formik';
import { Button } from '@material-tailwind/react';
import { ColorStyles, API_ROUTES } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { useNavigate } from 'react-router-dom';
import { DISCOUNT_ADD_SCHEMA } from '@/utils/validations';
import Select from 'react-select';

const DiscountAdd = () => {
  const navigate = useNavigate();
  const [serviceAreas, setServiceAreas] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [premiumServicesMap, setPremiumServicesMap] = useState({})

  const initialValues = {
    serviceType: '',
    title: '',
    description: '',
    percentage: '',
    startDate: '',
    endDate: '',
    isActive: 'true',
    serviceArea: [],
    image: null,
    cabType: '',
    premiumCabType: '',
    isPremium: false,
  };

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GEO_MARKINGS_LIST,{
          type: 'Service Area',
        });
        if (response.premiumServices) {
          setPremiumServicesMap(response.premiumServices);
          // console.log("Premium Services Map Loaded:", response.premiumServices);
        }
        console.log('GEO MARKINGS RESPONSE:', response);
        setServiceAreas(response?.data);
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
    setImagePreview(URL.createObjectURL(file));
  }

  const safeDate = (dateStr) => {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
};

  const handleSubmit = async (values, { setSubmitting }) => {
//    const payload = {
//   serviceType: values.serviceType?.trim(),
//   percentage:
//     values.percentage !== '' && !isNaN(values.percentage)
//       ? parseFloat(values.percentage)
//       : 0,
//   startDate: values.startDate
//     ? new Date(values.startDate).toISOString().split('T')[0]
//     : undefined,
//   endDate: values.endDate
//     ? new Date(values.endDate).toISOString().split('T')[0]
//     : undefined,
//   isActive: values.isActive,
//   title: values.title,
//   description: values.description,
//   serviceArea: values.serviceArea.includes['All'] ? ['All'] : values.serviceArea,
//   image: values.image,
//   cabType: values.cabType
// };

    try {
      const formData = new FormData();
      formData.append('serviceType', values.serviceType);
      formData.append('percentage', values.percentage);
      formData.append('startDate', safeDate(values.startDate));
      formData.append('endDate', safeDate(values.endDate));
      formData.append('isActive', values.isActive);
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('image', values.image, values.image.name);
      formData.append('fileType', values.image?.type || '');
      formData.append('extImage', values.image?.name?.split('.').pop()?.toLowerCase() || '');
      formData.append('serviceArea', values.serviceArea.includes('All') ? ['All'] : values.serviceArea);
      const finalCabType = values.isPremium
        ? values.premiumCabType
        : values.cabType;
      formData.append('cabType', finalCabType);
      formData.append('isPremium', values.isPremium);
      // console.log('POST payload:', formData); 
      const res = await ApiRequestUtils.postDocs(API_ROUTES.POST_DISCOUNT, formData);
      // console.log('DISCOUNT RESPONSE:', res);
      navigate('/dashboard/user/discountModuleList');
    } catch (err) {
      console.error('API Error:', err.response?.data || err.message);
      
    } finally {
      setSubmitting(false);
    }
  };

const getCurrentPremiumOptions = (currentServiceType) => {
  return premiumServicesMap[currentServiceType] || [];
};

  return (
    <div className="p-4 mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Discount</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={DISCOUNT_ADD_SCHEMA}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                <ErrorMessage name="serviceType" className="text-red-500 text-sm" component="div" />
              </div>
              <div>
                <label htmlFor="image" className="text-sm font-medium text-gray-700">
                  Image
                </label>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover mb-2 border" />
                )}
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  className="p-2 w-full rounded-md border border-gray-300 shadow-sm"
                  onChange={(e) => handleImageUpload(e.currentTarget.files[0], setFieldValue)}
                />
                <ErrorMessage name="image" component="div" className="text-red-500 text-sm" />
              </div>
              <div className="mt-3 flex gap-3">
                <div className="w-full col-span-2">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <Field
                      type="checkbox"
                      name="isPremium"
                      className="h-5 w-5 text-primary-600 rounded"
                      onChange={(e) => {
                        setFieldValue('isPremium', e.target.checked);
                        if (e.target.checked) {
                          setFieldValue('cabType', '');
                        } else {
                          setFieldValue('premiumCabType', '');
                        }
                    }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Enable Premium Service
                    </span>
                  </label>
                  {values.isPremium && (
                    <div className="col-span-2 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-blue-900 mb-3">
                        Select Premium Car Type:
                      </p>
                      {getCurrentPremiumOptions(values.serviceType).length > 0 ? (
                        <div className="w-full  md:grid-cols-4">
                          {getCurrentPremiumOptions(values.serviceType).map((premium, index) => (
                            <label key={index} className="flex items-center space-x-2 cursor-pointer">
                              <Field
                                type="radio"
                                name="premiumCabType"
                                value={premium.carType}
                                className="h-4 w-4 text-primary-600"
                              />
                              <span className="text-gray-800 font-medium">{premium.label}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 italic">
                          No premium options configured for {values.serviceType}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {values.isPremium === false && (
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
              </div>
              )}
              <div>
                <label htmlFor="title" className="text-sm font-medium text-gray-700">Title</label>
                <Field type="text" name="title" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" />
                <ErrorMessage name="title" className="text-red-500 text-sm" component="div" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Discount Percentage (%)</label>
                <Field
                  type="number"
                  name="percentage"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                />
                <ErrorMessage name="percentage" className="text-red-500 text-sm" component="div" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Start Date & Time</label>
                <Field
                  type="datetime-local"
                  name="startDate"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                />
                <ErrorMessage name="startDate" className="text-red-500 text-sm" component="div" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">End Date & Time</label>
                <Field
                  type="datetime-local"
                  name="endDate"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                />
                <ErrorMessage name="endDate" className="text-red-500 text-sm" component="div" />
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
                <ErrorMessage name="isActive" className="text-red-500 text-sm" component="div" />
              </div>
              <div>
                <label htmlFor="serviceArea" className="text-sm font-medium text-gray-700">Select service Area</label>
                <Select
                  name="serviceArea"
                  options={ZONE_OPTIONS}
                  isMulti
                  value={values.serviceArea.map((val) => ({ value: val, label: val }))}
                  onChange={(selectedOptions) => {
                    const selectedValues = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                    if (selectedValues.includes['All'] && selectedValues.length > 1) {
                      setFieldValue('serviceArea', ['All']); 
                    } else if (selectedValues.includes('All')) {
                      setFieldValue('serviceArea', ['All']); 
                    } else {
                      setFieldValue('serviceArea', selectedValues); 
                    }
                  }}
                  placeholder="Select service Area"
                  className="mt-1"
                />
                <ErrorMessage name="serviceArea" className="text-red-500 text-sm mt-1" component="div" />
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
                disabled={isSubmitting}
                className={`my-6 px-8 border-2 rounded-xl ${ColorStyles.continueButtonColor}`}
              >
                Add
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DiscountAdd;
