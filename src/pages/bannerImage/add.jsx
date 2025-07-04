import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import { ColorStyles, API_ROUTES } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';

const AddBanner = () => {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);

  const initialValues = {
    fromDate: '',
    toDate: '',
    redirectUrl: '',
    status: true,
    type: '',
    image: null,
  };

  // ✅ Yup Validation Schema
  const validationSchema = Yup.object().shape({
    fromDate: Yup.string().required('From date is required'),
    toDate: Yup.string().required('To date is required'),
    redirectUrl: Yup.string().required('Redirect URL is required'),
    status: Yup.boolean().required('Status is required'),
    type: Yup.string().required('Type is required'),
    image: Yup.mixed()
      .required('Image is required')
      .test('fileType', 'Only JPEG or PNG files are allowed', (value) =>
        value ? ['image/jpeg', 'image/png'].includes(value.type) : false
      ),
  });

  const handleImageUpload = (file, setFieldValue) => {
    const validTypes = ['image/jpeg', 'image/png'];
    if (!file || !validTypes.includes(file.type)) {
      alert('Only JPEG and PNG images are allowed.');
      return;
    }

    setFieldValue('image', file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      console.log('Sending image:', values.image?.name, values.image?.type);

      const formData = new FormData();
      formData.append('fromDate', values.fromDate);
      formData.append('toDate', values.toDate);
      formData.append('redirectUrl', values.redirectUrl.trim());
      formData.append('status', values.status === 'true' || values.status === true);
      formData.append('type', values.type.trim());
      formData.append('image', values.image, values.image.name);
      formData.append('fileType', values.image?.type || '');
      formData.append('extImage', values.image?.name?.split('.').pop()?.toLowerCase() || '');

      const response = await ApiRequestUtils.postDocs(API_ROUTES.POST_BANNER, formData);

      if (response?.success) {
        navigate('/dashboard/user/bannerimgView');
      } else {
        setError(response?.error || 'Banner upload failed.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Banner</h2>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">From Date</label>
                <Field name="fromDate" type="date" className="p-2 w-full rounded-md border border-gray-300 shadow-sm" />
                <ErrorMessage name="fromDate" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">To Date</label>
                <Field name="toDate" type="date" className="p-2 w-full rounded-md border border-gray-300 shadow-sm" />
                <ErrorMessage name="toDate" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Redirect URL</label>
                <Field name="redirectUrl" type="text" className="p-2 w-full rounded-md border border-gray-300 shadow-sm" />
                <ErrorMessage name="redirectUrl" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <Field name="type" type="text" className="p-2 w-full rounded-md border border-gray-300 shadow-sm" />
                <ErrorMessage name="type" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Field as="select" name="status" className="p-2 w-full rounded-md border border-gray-300 shadow-sm">
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </Field>
                <ErrorMessage name="status" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Image</label>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover mb-2 border" />
                )}
                <input
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png"
                  className="p-2 w-full rounded-md border border-gray-300 shadow-sm"
                  onChange={(e) => handleImageUpload(e.currentTarget.files[0], setFieldValue)}
                />
                <ErrorMessage name="image" component="div" className="text-red-500 text-sm" />
              </div>
            </div>

            <div className="flex flex-row">
              <Button
                fullWidth
                type="button"
                onClick={() => navigate('/dashboard/user/bannerimgView')}
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

export default AddBanner;
