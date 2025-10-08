import React, { useState, useEffect, useMemo } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@material-tailwind/react';
import { ColorStyles, API_ROUTES } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';

const validationSchema = Yup.object({
  type: Yup.string().required('Type is required'),
  name: Yup.string().required('Name is required'),
  zone: Yup.string().required('Zone is required'),
  imageData: Yup.mixed().test('fileType', 'Only JPEG or PNG images are allowed.', (value) =>
    !value || ['image/jpeg', 'image/png'].includes(value.type)
  ),
});

const CategoryEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

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

  const fetchItem = async () => {
    if (!id) {
      setError('Invalid category ID.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await ApiRequestUtils.get(`${API_ROUTES.GET_CATEGORY}?categoryId=${id}`);
      if (response?.data && typeof response.data === 'object') {
        setData(response.data);
        setImagePreview(response.data.image || null);
      } else if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        setData(response.data[0]);
        setImagePreview(response.data[0].image || null);
      } else {
        setError('No category found for the provided ID.');
      }
    } catch (err) {
      console.error('Error fetching category:', err);
      setError(err.message || 'Failed to fetch category data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
    fetchGeoData();
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [id, imagePreview]);

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
    type: data?.type || '',
    name: data?.name || '',
    imageData: null,
    zone: data?.zone || '',
    zoneId: data?.zoneId || '',
  };

  const handleImageUpload = (file, setFieldValue, setFieldError) => {
    if (file) {
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setFieldError('imageData', 'Only JPEG or PNG images are allowed.');
        setFieldValue('imageData', null);
        setImagePreview(data?.image || null);
        return;
      }
      setFieldValue('imageData', file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFieldValue('imageData', null);
      setImagePreview(data?.image || null);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();
      formData.append('type', values.type.trim());
      formData.append('name', values.name.trim());
      formData.append('zone', values.zone.trim());
      const selectedZoneId = values.zone === 'All' ? '' : serviceAreas.find((area) => area.name === values.zone)?.id || '';
      if (values.zone !== 'All' && !selectedZoneId) {
        setError('Selected zone is invalid.');
        setSubmitting(false);
        return;
      }
      formData.append('zoneId', selectedZoneId);
      if (values.imageData && values.imageData instanceof File) {
        formData.append('imageData', values.imageData);
        formData.append('imageMimeType', values.imageData.type || '');
        formData.append('imageExt', values.imageData.name?.split('.').pop()?.toLowerCase() || '');
      }

      const response = await ApiRequestUtils.updateDocs(`${API_ROUTES.UPDATE_CATEGORY}/${id}`, formData);
      if (response?.success) {
        navigate('/dashboard/inventory/category-list');
      } else {
        setError(response?.error || 'Category update failed.');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-4 mx-auto">Loading category data...</div>;
  }

  return (
    <div className="p-4 mx-auto max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">Update Category</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, setFieldValue, setFieldError, values }) => (
          <Form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="text-sm font-medium text-gray-700">
                  Type
                </label>
                <Field
                  id="type"
                  type="text"
                  name="type"
                  className="p-2 w-full rounded-md border-gray-300 shadow-sm"
                  disabled
                />
                <ErrorMessage name="type" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Name
                </label>
                <Field
                  id="name"
                  type="text"
                  name="name"
                  className="p-2 w-full rounded-md border-gray-300 shadow-sm"
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label htmlFor="imageData" className="text-sm font-medium text-gray-700">
                  Image
                </label>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Category Image"
                    className="w-32 h-32 object-cover mb-2 border"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 flex items-center justify-center mb-2 border">
                    No Image
                  </div>
                )}
                <input
                  id="imageData"
                  name="imageData"
                  type="file"
                  accept="image/jpeg,image/png"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                  onChange={(event) => handleImageUpload(event.target.files[0], setFieldValue, setFieldError)}
                />
                <ErrorMessage name="imageData" component="div" className="text-red-500 text-sm my-1" />
              </div>
              <div>
                <label htmlFor="zone" className="text-sm font-medium text-gray-700">
                  Zone
                </label>
                <Select
                  inputId="zone"
                  options={ZONE_OPTIONS}
                  onChange={(selectedOption) => setFieldValue('zone', selectedOption?.value || '')}
                  value={ZONE_OPTIONS.find((option) => option.value === values.zone) || null}
                  placeholder="Select Zone"
                  className="w-full"
                />
                <ErrorMessage name="zone" component="div" className="text-red-500 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                className={`py-2 px-4 rounded-xl ${ColorStyles.backButton}`}
                onClick={() => navigate('/dashboard/inventory/category-list')}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                color="black"
                className={`py-2 px-4 rounded-xl ${ColorStyles.continueButtonColor}`}
              >
                {isSubmitting ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CategoryEdit;