import React, { useEffect, useState } from 'react';
import { Formik, Field, ErrorMessage, Form } from 'formik';
import { Button } from '@material-tailwind/react';
import { ColorStyles, API_ROUTES } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  serviceType: Yup.string().required('Service Type is required'),
  serviceArea: Yup.string()
    .required('Service Area is required')
    .test('all-with-others', 'Cannot select "All" with other service areas', (value) => {
      if (value && value.includes('All')) {
        return value === 'All';
      }
      return true;
    }),
  message: Yup.string().required('Message is required'),
});

const CombineAdd = () => {
  const initialValues = {
    serviceType: '',
    serviceArea: '',
    message: '',
  };

  const [serviceAreas, setServiceAreas] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const data = await ApiRequestUtils.post(API_ROUTES.POST_COMBINE_ADD, values);
      console.log('Submitted successfully:', data);
      if (data?.success) {
        navigate('/dashboard/combine-view');
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

  const SERVICE_AREA_OPTIONS = [
    { value: 'All', label: 'All' },
    ...serviceAreas.map((area) => ({
      value: area.name,
      label: area.name,
    })),
  ];

  const SERVICE_TYPE_OPTIONS = [
    { value: '', label: 'Select Type' },
    { value: 'Type1', label: 'Type 1' },
    { value: 'Type2', label: 'Type 2' },
    { value: 'Type3', label: 'Type 3' },
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
                  <label htmlFor="serviceType" className="text-sm font-medium text-gray-700">
                    Service Type
                  </label>
                  <Field
                    as="select"
                    name="serviceType"
                    className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  >
                    {SERVICE_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="serviceType" component="div" className="text-red-500 text-sm my-1" />
                </div>
                <div>
                  <label htmlFor="serviceArea" className="text-sm font-medium text-gray-700">
                    Service Area
                  </label>
                  <Select
                    name="serviceArea"
                    options={SERVICE_AREA_OPTIONS}
                    isMulti
                    value={
                      values.serviceArea
                        ? values.serviceArea.split(',').map((val) => ({
                            value: val,
                            label: val,
                          }))
                        : []
                    }
                    onChange={(selectedOptions) => {
                      const selectedValues = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                      if (selectedValues.includes('All')) {
                        setFieldValue('serviceArea', 'All');
                      } else {
                        setFieldValue('serviceArea', selectedValues.join(','));
                      }
                    }}
                    placeholder="Select Service Area"
                    className="mt-1"
                  />
                  <ErrorMessage name="serviceArea" component="div" className="text-red-500 text-sm my-1" />
                </div>
                <div>
                  <label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <Field
                    as="textarea"
                    name="message"
                    className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                    rows="4"
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
                onClick={() => navigate('/dashboard/vendors/customerNotificationList')}
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

export default CombineAdd;