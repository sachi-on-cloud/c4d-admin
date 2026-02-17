import React, { useEffect, useState } from 'react';
import { Formik, Field, ErrorMessage, Form } from 'formik';
import { Button } from '@material-tailwind/react';
import { ColorStyles, API_ROUTES } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { useLocation, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  message: Yup.string().required('Message is required'),
  type: Yup.string().required('Type is required'),
  app: Yup.string().required('App is required'),
  timing: Yup.string().required('Timing is required'),
  city: Yup.string()
    .required('City is required')
    .test('all-with-others', 'Cannot select "All" with other cities', (value) => {
      if (value && value.includes('All')) {
        return value === 'All';
      }
      return true;
    }),
});

const NotificationListApp = () => {
  const initialValues = {
    title: '',
    message: '',
    type: '',
    app: '',
    timing: '',
    city:'',
  };

  const [serviceAreas, setServiceAreas] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const data = await ApiRequestUtils.post(API_ROUTES.POST_NOTIFICATION_ADD, values);
      console.log('Submitted successfully:', data);
      // resetForm();
      if(data?.success)
      {
        navigate('/dashboard/vendors/notificationList')
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GEO_MARKINGS_LIST, {
          type: 'Service Area',
        });
        console.log('GEO MARKINGS RESPONSE:', response);
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

  return (
    <div className="p-4 mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add New</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="type" className="text-sm font-medium text-gray-700">Type</label>
                  <Field
                    type="text"
                    name="type"
                    className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                  />
                  <ErrorMessage name="type" component="div" className="text-red-500 text-sm" />
                </div>
                <div>
                  <label htmlFor="title" className="text-sm font-medium text-gray-700">Title</label>
                  <Field type="text" name="title" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" />
                  <ErrorMessage name="title" component="div" className="text-red-500 text-sm my-1" />
                </div>
                <div>
                  <label htmlFor="app" className="text-sm font-medium text-gray-700">App</label>
                      <Field
                      as="select"
                      name="app"
                      className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      >
                      <option value="">Select Type</option>
                      <option value="CUSTOMER">Customer App</option>
                      <option value="DRIVER">Driver App</option>
                      </Field>
                  <ErrorMessage name="app" component="div" className="text-red-500 text-sm my-1" />
                </div>
                 <div>
                  <label htmlFor="app" className="text-sm font-medium text-gray-700">Select Time Zone</label>
                      <Field
                      as="select"
                      name="timing"
                      className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      >
                      <option value="">Select Timing</option>
                      <option value="MORNING">Morning</option>
                      <option value="AFTERNOON">Afternoon</option>
                      <option value="EVENING">Evening</option>
                      </Field>
                  <ErrorMessage name="timing" component="div" className="text-red-500 text-sm my-1" />
                </div>
                <div>
                  <label htmlFor="city" className="text-sm font-medium text-gray-700">Select City</label>
                  <Select name="city" options={ZONE_OPTIONS} isMulti
                    value={ values.city ? values.city.split(',').map((val) => ({
                            value: val,
                            label: val,
                          })) : [] }
                    onChange={(selectedOptions) => {
                      const selectedValues = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                      if (selectedValues.includes('All')) {
                        setFieldValue('city', 'All');
                      } else {
                        setFieldValue('city', selectedValues.join(','));
                      }
                    }}
                    placeholder="Select City"
                    className="mt-1"
                    styles={{
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: '#3b82f6',
                      }),
                      multiValueLabel: (base) => ({
                        ...base,
                        color: '#fff',
                      }),
                      multiValueRemove: (base) => ({
                        ...base,
                        color: '#fff',
                        ':hover': {
                          backgroundColor: '#2563eb',
                          color: '#fff',
                        },
                      }),
                    }}
                  />
                  <ErrorMessage name="city" component="div" className="text-red-500 text-sm my-1" />
                </div>
                <div>
                  <label htmlFor="message" className="text-sm font-medium text-gray-700">Message</label>
                  <Field as="textarea" name="message" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" rows="4"
                  />
                  <ErrorMessage name="message" component="div" className="text-red-500 text-sm my-1" />
                </div>
              </div>
            </div>
            <div className="flex flex-row">
              <Button
                fullWidth
                className={`my-6 mx-2 rounded-xl ${ColorStyles.backButton}`}
                type="button"
                onClick={() => navigate(`/dashboard/vendors/notificationList`)}
              >
                Back
              </Button>
              <Button
                fullWidth
                color="black"
                className={`my-6 px-8 border-2 rounded-xl ${ColorStyles.continueButtonColor}`}
                type="submit"
                disabled={isSubmitting}
              >
                Send
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default NotificationListApp;