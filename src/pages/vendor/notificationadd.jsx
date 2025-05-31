import React from 'react';
import { Formik, Field, ErrorMessage, Form } from 'formik';
import { Button } from '@material-tailwind/react';
import { ColorStyles, API_ROUTES } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { useLocation, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  message: Yup.string().required('Message is required'),
  type: Yup.string().required('Type is required'),
  app: Yup.string().required('App is required'),
  city: Yup.string().required('city is required')
});

const NotificationListApp = () => {
  const initialValues = {
    title: '',
    message: '',
    type: '',
    app: '',
    city:'',
  };

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

  return (
    <div className="p-4 mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add New</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
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
                      className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      >
                      <option value="">Select Type</option>
                      <option value="CUSTOMER">Customer App</option>
                      <option value="DRIVER">Driver App</option>
                      </Field>
                  <ErrorMessage name="app" component="div" className="text-red-500 text-sm my-1" />
                </div>
                 <div>
                  <label htmlFor="app" className="text-sm font-medium text-gray-700">City</label>
                  <Field type="text" name="city" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" />
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