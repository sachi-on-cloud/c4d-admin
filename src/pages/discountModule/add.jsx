import React from 'react';
import { Formik, Field, ErrorMessage, Form } from 'formik';
import { Button } from '@material-tailwind/react';
import { ColorStyles, API_ROUTES } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { useNavigate } from 'react-router-dom';
import { DISCOUNT_ADD_SCHEMA } from '@/utils/validations';

const DiscountAdd = () => {
  const navigate = useNavigate();

  const initialValues = {
    serviceType: '',
    title: '',
    description: '',
    percentage: '',
    startDate: '',
    endDate: '',
    isActive: 'true', 
  };

  const handleSubmit = async (values, { setSubmitting }) => {
   const payload = {
  serviceType: values.serviceType?.trim(),
  percentage:
    values.percentage !== '' && !isNaN(values.percentage)
      ? parseFloat(values.percentage)
      : 0,
  startDate: values.startDate
    ? new Date(values.startDate).toISOString().split('T')[0]
    : undefined,
  endDate: values.endDate
    ? new Date(values.endDate).toISOString().split('T')[0]
    : undefined,
  isActive: values.isActive,
  title: values.title,
  description: values.description,

};

    try {
      console.log('POST payload:', payload); 
      const res = await ApiRequestUtils.post(API_ROUTES.POST_DISCOUNT, payload);
      console.log('DISCOUNT RESPONSE:', res);
      navigate('/dashboard/user/discountModuleList');
    } catch (err) {
      console.error('API Error:', err.response?.data || err.message);
      
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Discount</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={DISCOUNT_ADD_SCHEMA}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
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
