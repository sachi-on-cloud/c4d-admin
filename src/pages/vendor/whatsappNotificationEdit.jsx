import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Button, Alert, Spinner } from '@material-tailwind/react';
import Select from 'react-select';
import { ColorStyles, API_ROUTES } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';


const WhatsappNotificationEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [initialValues, setInitialValues] = useState(null);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  const [areasError, setAreasError] = useState(null);

  const formatDateOnly = (isoString) => {
    return isoString ? new Date(isoString).toISOString().slice(0, 10) : '';
  };

  // Fetch service areas
  useEffect(() => {
    const fetchGeoData = async () => {
      setIsLoadingAreas(true);
      try {
        const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GEO_MARKINGS_LIST, {
          type: 'Service Area',
        });
        console.log('GEO_MARKINGS_RESPONSE:', response);
        setServiceAreas(response);
      } catch (error) {
        console.error('Error fetching GEO_MARKINGS_LIST:', error);
        setAreasError('Failed to load service areas. Please try again.');
        setServiceAreas([]);
      } finally {
        setIsLoadingAreas(false);
      }
    };
    fetchGeoData();
  }, []);

  // Fetch discount data
  useEffect(() => {
    const discountFromState = location.state?.discount;

    const fetchDiscount = async () => {
      try {
        if (discountFromState) {
          setInitialValues({
            discountId: discountFromState.discountId || discountFromState.id,
            percentage: discountFromState.percentage || '',
            startDate: formatDateOnly(discountFromState.startDate),
            endDate: formatDateOnly(discountFromState.endDate),
            serviceType: discountFromState.serviceType || '',
            title: discountFromState.title || '',
            description: discountFromState.description || '',
            isActive: discountFromState.isActive ? 'true' : 'false',
            serviceArea: discountFromState.serviceArea || '',
          });
        } else {
          // const res = await ApiRequestUtils.get(`${API_ROUTES.GET_DISCOUNT}/${id}`);
          console.log('DISCOUNT_RESPONSE:', res);
          const data = res?.data;
          setInitialValues({
            discountId: data.discountId || data.id,
            percentage: data.percentage || '',
            startDate: formatDateOnly(data.startDate),
            endDate: formatDateOnly(data.endDate),
            serviceType: data.serviceType || '',
            title: data.title || '',
            description: data.description || '',
            isActive: data.isActive ? 'true' : 'false',
            serviceArea: data.serviceArea || '',
          });
        }
      } catch (err) {
        console.error('Failed to load discount:', err);
        setAlert({ color: 'red', message: 'Discount not found' });
        setTimeout(() => {
          navigate('/dashboard/vendors/whatsappNotificationList');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscount();
  }, [id, location.state, navigate]);

  // Map service areas to options for react-select
  const ZONE_OPTIONS = serviceAreas.map((area) => ({
    value: area.name,
    label: area.name,
  }));

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    const serviceTypeMap = {
      RENTAL_DROP_TAXI: 'RENTAL',
      RENTAL_HOURLY_PACKAGE: 'RENTAL',
    };
    try {
      const payload = {
        discountId: Number(values.discountId),
        serviceType: serviceTypeMap[values.serviceType] || values.serviceType?.trim(),
        percentage: values.percentage ? Number(values.percentage) : 0,
        startDate: values.startDate,
        endDate: values.endDate,
        isActive: values.isActive === 'true',
        title: values.title?.trim(),
        description: values.description?.trim(),
        serviceArea: values.serviceArea || undefined,
      };

      const response = await ApiRequestUtils.update(API_ROUTES.PUT_DISCOUNT, payload);

      if (response?.success) {
        navigate('/dashboard/vendors/whatsappNotificationList', {
          state: { updatedDiscount: { ...response.data, id: values.discountId } },
        });
      } else {
        setAlert({ color: 'red', message: 'Failed to update discount' });
        setTimeout(() => setAlert(null), 3000);
      }
    } catch (error) {
      console.error('Update failed:', error);
      setStatus({ error: 'Update failed! Please try again.' });
      setTimeout(() => setStatus({}), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !initialValues) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto">
      {alert && (
        <div className="mb-4">
          <Alert color={alert.color}>{alert.message}</Alert>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4">Edit WhatsApp Notification</h2>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, isValid, setFieldValue, values, status }) => (
          <Form className="space-y-6">
            {status?.error && <Alert color="red">{status.error}</Alert>}
            <Field type="hidden" name="discountId" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="serviceType" className="text-sm font-medium text-gray-700">
                  Service Type
                </label>
                <Field
                  as="select"
                  id="serviceType"
                  name="serviceType"
                  className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Service Type</option>
                  <option value="DRIVER">Driver</option>
                  <option value="RIDES">Rides</option>
                  <option value="RENTAL_HOURLY_PACKAGE">Hourly Package</option>
                  <option value="RENTAL_DROP_TAXI">Drop Taxi</option>
                  <option value="RENTAL">Outstation</option>
                  <option value="AUTO">Auto</option>
                  <option value="ALL">All</option>
                </Field>
                <ErrorMessage
                  name="serviceType"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div>
                <label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Title
                </label>
                <Field
                  type="text"
                  id="title"
                  name="title"
                  className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <ErrorMessage
                  name="title"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div>
                <label htmlFor="percentage" className="text-sm font-medium text-gray-700">
                  Discount Percentage (%)
                </label>
                <Field
                  name="percentage"
                  type="number"
                  id="percentage"
                  className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <ErrorMessage
                  name="percentage"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div>
                <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <Field
                  name="startDate"
                  type="date"
                  id="startDate"
                  className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <ErrorMessage
                  name="startDate"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                  End Date
                </label>
                <Field
                  name="endDate"
                  type="date"
                  id="endDate"
                  className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <ErrorMessage
                  name="endDate"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div>
                <label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  rows="4"
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div>
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <Field
                  as="select"
                  id="isActive"
                  name="isActive"
                  className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Field>
                <ErrorMessage
                  name="isActive"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div>
                <label htmlFor="serviceArea" className="text-sm font-medium text-gray-700">
                  Select Service Area (Optional)
                </label>
                <Select
                  id="serviceArea"
                  options={ZONE_OPTIONS}
                  isLoading={isLoadingAreas}
                  value={values.serviceArea ? { value: values.serviceArea, label: values.serviceArea } : null}
                  onChange={(selectedOption) => {
                    setFieldValue('serviceArea', selectedOption ? selectedOption.value : '');
                  }}
                  placeholder="Select Service Area"
                  className="mt-1"
                  isDisabled={isLoadingAreas || areasError}
                  isClearable
                />
                {areasError && <div className="text-red-500 text-sm mt-1">{areasError}</div>}
                <ErrorMessage
                  name="serviceArea"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                className={`px-8 rounded-xl ${ColorStyles.backButton}`}
                onClick={() => navigate('/dashboard/vendors/whatsappNotificationList')}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !isValid}
                className={`px-8 rounded-xl ${ColorStyles.continueButtonColor}`}
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

export default WhatsappNotificationEdit;