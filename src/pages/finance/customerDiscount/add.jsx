import React, { useEffect, useState } from 'react';
import { Formik, Field, ErrorMessage, Form } from 'formik';
import { Button } from '@material-tailwind/react';
import { ColorStyles, API_ROUTES } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { CUSTOMER_DISCOUNT_ADD_SCHEMA } from '@/utils/validations';

const CustomerDiscountAdd = () => {
  const navigate = useNavigate();
  const [serviceAreas, setServiceAreas] = useState([]);

  const initialValues = {
    serviceType: '',
    title: '',
    description: '',
    offerType: '',
    couponCode: '',
    discountType: '',
    percentage: '',
    amount: '',
    startDate: '',
    endDate: '',
    isActive: 'true',
    serviceArea: [],
  };

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GEO_MARKINGS_LIST, {
          type: 'Service Area',
        });
        setServiceAreas(response?.data || []);
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

  const safeDate = (dateStr) => {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
};
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const hasAmount = Number(values.amount) > 0;
      const hasPercentage = Number(values.percentage) > 0;
      let discountType = values.discountType;

      if (hasAmount && !hasPercentage) {
        discountType = 'IsAmount';
      } else if (hasPercentage && !hasAmount) {
        discountType = 'percentage';
      }

      const serviceAreaPayload =
        values.offerType === 'GENERAL'
          ? (values.serviceArea && values.serviceArea.length ? values.serviceArea : ['All'])
          : [];

      const payload = {
        serviceType: values.serviceType,
        title: values.title,
        description: values.description,
        offerType: values.offerType,
        couponCode: values.couponCode,
        discountType,
        percentage: (discountType || '').toLowerCase() === 'percentage' ? Number(values.percentage) || 0 : 0,
        amount: (discountType || '').toLowerCase() === 'isamount' ? Number(values.amount) || 0 : 0,
        startDate: safeDate(values.startDate),
        endDate: safeDate(values.endDate),
        isActive: values.isActive,
        serviceArea: serviceAreaPayload,
      };

      // await ApiRequestUtils.post(API_ROUTES.POST_DISCOUNT, payload);
      console.log('DISCOUNT RESPONSE:', payload);
      navigate('/dashboard/users/customer-discount');
    } catch (err) {
      console.error('API Error:', err.response?.data || err.message);
      
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Customer Discount</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={CUSTOMER_DISCOUNT_ADD_SCHEMA}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue }) => (
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
                <label htmlFor="title" className="text-sm font-medium text-gray-700">Title</label>
                <Field type="text" name="title" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" />
                <ErrorMessage name="title" className="text-red-500 text-sm" component="div" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Offer Type</label>
                <Field
                  as="select"
                  name="offerType"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                >
                  <option value="">Select Offer Type</option>
                  <option value="GENERAL">General</option>
                  <option value="CUSTOM">Custom</option>
                </Field>
                <ErrorMessage name="offerType" className="text-red-500 text-sm" component="div" />
              </div>
              <div>
                <label htmlFor="couponCode" className="text-sm font-medium text-gray-700">Coupon Code</label>
                <Field
                  type="text"
                  name="couponCode"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                />
                <ErrorMessage name="couponCode" className="text-red-500 text-sm" component="div" />
              </div>

              {values.offerType === 'GENERAL' && (
                <div>
                  <label htmlFor="serviceArea" className="text-sm font-medium text-gray-700">Select service Area</label>
                  <Select
                    name="serviceArea"
                    options={ZONE_OPTIONS}
                    isMulti
                    value={values.serviceArea.map((val) => ({ value: val, label: val }))}
                    onChange={(selectedOptions) => {
                      const selectedValues = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                      if (selectedValues.includes('All') && selectedValues.length > 1) {
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
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">Discount Type</label>
                <select
                  name="discountType"
                  value={values.discountType}
                  onChange={(e) => {
                    const selectedType = e.target.value;
                    setFieldValue('discountType', selectedType);
                    if ((selectedType || '').toLowerCase() === 'percentage') {
                      setFieldValue('amount', '');
                    } else if ((selectedType || '').toLowerCase() === 'isamount') {
                      setFieldValue('percentage', '');
                    } else {
                      setFieldValue('percentage', '');
                      setFieldValue('amount', '');
                    }
                  }}
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm bg-white"
                >
                  <option value="">Select Discount Type</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="IsAmount">Amount (₹)</option>
                </select>
                <ErrorMessage name="discountType" className="text-red-500 text-sm" component="div" />
              </div>
              {(values.discountType || '').toLowerCase() === 'percentage' ? (
              <div>
                <label className="text-sm font-medium text-gray-700">Discount Percentage (%)</label>
                <Field
                  type="number"
                  name="percentage"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                />
                <ErrorMessage name="percentage" className="text-red-500 text-sm" component="div" />
              </div>
              ) : (values.discountType || '').toLowerCase() === 'isamount' ? (
                <div>
                  <label className="text-sm font-medium text-gray-700">Discount Amount (₹)</label>
                  <Field
                    type="number"
                    name="amount"
                    className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                  />
                  <ErrorMessage name="amount" className="text-red-500 text-sm" component="div" />
                </div>
              ) : null}

              <div>
                <label className="text-sm font-medium text-gray-700">Start Date & Time</label>
                <Field
                  type="date"
                  name="startDate"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                />
                <ErrorMessage name="startDate" className="text-red-500 text-sm" component="div" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">End Date & Time</label>
                <Field
                  type="date"
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
            </div>

            <div className="flex flex-row">
              <Button
                fullWidth
                type="button"
                className={`my-6 mx-2 rounded-xl ${ColorStyles.backButton}`}
                onClick={() => navigate('/dashboard/users/customer-discount')}
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

export default CustomerDiscountAdd;
