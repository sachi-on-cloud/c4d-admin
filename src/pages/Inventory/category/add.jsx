import React, { useState, useEffect, useMemo } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import { ColorStyles, API_ROUTES } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import Select from 'react-select';

const validationSchema = Yup.object({
  type: Yup.string().required('Type is required'),
  name: Yup.string().required('Name is required'),
  zone: Yup.string().required('Zone is required'),
  imageData: Yup.mixed().test('fileType', 'Only JPEG, PNG, or GIF images are allowed.', (value) =>
    !value || ['image/jpeg', 'image/png', 'image/gif'].includes(value.type)
  ),
});

const AddCategory = () => {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [serviceAreas, setServiceAreas] = useState([]);

  const fetchGeoData = async () => {
    try {
      const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GEO_MARKINGS_LIST, {
        type: 'Service Area',
        id: '',
      });
      if (!response?.data || !Array.isArray(response.data)) {
        throw new Error('Invalid service areas response');
      }
      setServiceAreas(response.data);
    } catch (error) {
      console.error('Error fetching GEO_MARKINGS_LIST:', error);
      setError('Failed to fetch service areas.');
    } 
  };

  useEffect(() => {
    fetchGeoData();
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const ZONE_OPTIONS = useMemo(
    () => [
      { value: 'All', label: 'All' },
      ...serviceAreas.map((area) => ({
        value: area.name,
        label: area.name,
      })),
    ],
    [serviceAreas]
  );

  const initialValues = {
    name: '',
    type: '',
    imageData: null,
    zone: '',
    zoneId: '',
  };

  const handleImageUpload = (file, setFieldValue) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!file || !validTypes.includes(file.type)) {
      setError('Only JPEG, PNG, or GIF images are allowed.');
      return;
    }
    setError(null);
    setFieldValue('imageData', file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();
      formData.append('type', values.type.trim());
      formData.append('name', values.name.trim());
      formData.append('zone', values.zone);
      formData.append('zoneId', values.zone === 'All' ? '' : serviceAreas.find(area => area.name === values.zone)?.id || '');
      if (values.imageData && values.imageData instanceof File) {
        formData.append('imageData', values.imageData);
        formData.append('imageMimeType', values.imageData.type || '');
        formData.append('imageExt', values.imageData.name?.split('.').pop()?.toLowerCase() || '');
      }

      const response = await ApiRequestUtils.postDocs(API_ROUTES.POST_CATEGORY, formData);
      if (response?.success) {
        navigate('/dashboard/inventory/category-list');
      } else {
        setError(response?.error || 'Category upload failed.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 mx-auto max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">Add Category</h2>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="text-sm font-medium text-gray-700">Type</label>
                <Field
                  id="type"
                  type="text"
                  name="type"
                  className="p-2 w-full rounded-md border-gray-300 shadow-sm"
                />
                <ErrorMessage name="type" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                <Field
                  id="name"
                  type="text"
                  name="name"
                  className="p-2 w-full rounded-md border-gray-300 shadow-sm"
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label htmlFor="imageData" className="text-sm font-medium text-gray-700">Image</label>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover mb-2 border" />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 flex items-center justify-center mb-2 border">
                    No Image
                  </div>
                )}
                <input
                  id="imageData"
                  name="imageData"
                  type="file"
                  accept="image/*"
                  className="p-2 w-full rounded-md border border-gray-300 shadow-sm"
                  onChange={(e) => handleImageUpload(e.currentTarget.files[0], setFieldValue)}
                />
                <ErrorMessage name="imageData" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label htmlFor="zone" className="text-sm font-medium text-gray-700">Zone</label>
                <Select
                  inputId="zone"
                  options={ZONE_OPTIONS}
                  onChange={(selectedOption) => setFieldValue('zone', selectedOption?.value || '')}
                  placeholder='Select Zone'
                  className="w-full"
                />
                <ErrorMessage name="zone" component="div" className="text-red-500 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                onClick={() => navigate('/dashboard/inventory/category-list')}
                className={`py-2 px-4 border-2 rounded-xl ${ColorStyles.backButton}`}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                color="black"
                className={`py-2 px-4 border-2 rounded-xl ${ColorStyles.continueButtonColor}`}
              >
                {isSubmitting ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddCategory;