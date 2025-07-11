import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';


const TESTIMONIAL_SCHEMA = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  subname: Yup.string().required('Number of rides is required'),
  rating: Yup.number().required('Rating is required'),
  message: Yup.string().required('Message is required'),
  status: Yup.boolean().required('Status is required'),
});

const TestimonialAdd = () => {
  const navigate = useNavigate();

  const initialValues = {
    name: '',
    subname: '',
    rating: '',
    message: '',
    status: true,
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        ...values,
        rating: Number(values.rating),
        
      };
    
      

      await ApiRequestUtils.post(API_ROUTES.POST_TESTIMOINAL, payload);

      navigate('/dashboard/user/testimonialView');
    } catch (error) {
    //   console.error('Testimonial save failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Testimonial</h2>

      <Formik initialValues={initialValues} validationSchema={TESTIMONIAL_SCHEMA} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <Field name="name" type="text" className="p-2 w-full rounded-md border border-gray-300 shadow-sm" />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Number of Rides</label>
                <Field name="subname" type="text" className="p-2 w-full rounded-md border border-gray-300 shadow-sm" />
                <ErrorMessage name="subname" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Rating (1 to 5)</label>
                <Field name="rating" type="number" className="p-2 w-full rounded-md border border-gray-300 shadow-sm" />
                <ErrorMessage name="rating" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Message</label>
                <Field as="textarea" rows={2} name="message" className="p-2 w-full rounded-md border border-gray-300 shadow-sm" />
                <ErrorMessage name="message" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Field as="select" name="status" className="p-2 w-full rounded-md border border-gray-300 shadow-sm">
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </Field>
                <ErrorMessage name="status" component="div" className="text-red-500 text-sm" />
              </div>
            </div>

            <div className="flex flex-row">
              <Button
                fullWidth
                type="button"
                onClick={() => navigate('/dashboard/user/testimonialView')}
                className={`my-6 mx-2 border-2 rounded-xl ${ColorStyles.backButton}`}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                type="submit"
                disabled={isSubmitting}
                color="black"
                className={`my-6 mx-2 border-2 rounded-xl ${ColorStyles.continueButtonColor}`}
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

export default TestimonialAdd;
