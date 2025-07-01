import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Button, Alert } from '@material-tailwind/react';
import * as Yup from 'yup';
import { ColorStyles, API_ROUTES } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';

const DISCOUNT_EDIT_SCHEMA = Yup.object().shape({
  discountId: Yup.number().required('Discount ID is required'),
  serviceType: Yup.string().required('Service type is required'),
  percentage: Yup.number().required('Percentage is required').min(0).max(100),
  startDate: Yup.string().required('Start Date is required'),
  endDate: Yup.string().required('End Date is required'),
  isActive: Yup.string().required('Status is required'),
});

const DiscountEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const formatDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  useEffect(() => {
    const discountFromState = location.state?.discount;

    const fetchDiscount = async () => {
      try {
        if (discountFromState) {
          setInitialValues({
            discountId: discountFromState.discountId || discountFromState.id,
            percentage: discountFromState.percentage || '',
            startDate: formatDateTimeLocal(discountFromState.startDate),
            endDate: formatDateTimeLocal(discountFromState.endDate),
            serviceType: discountFromState.serviceType || '',
            isActive: discountFromState.isActive ? 'true' : 'false',
          });
        } else {
          const res = await ApiRequestUtils.get(`${API_ROUTES.GET_DISCOUNT}/${id}`);
          const data = res?.data;
          setInitialValues({
            discountId: data.discountId || data.id,
            percentage: data.percentage || '',
            startDate: formatDateTimeLocal(data.startDate),
            endDate: formatDateTimeLocal(data.endDate),
            serviceType: data.serviceType || '',
            isActive: data.isActive ? 'true' : 'false',
          });
        }
      } catch (err) {
        console.error('Failed to load discount:', err);
        alert('Discount not found');
        navigate('/dashboard/user/discountModuleList');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscount();
  }, [id, location.state, navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        discountId: Number(values.discountId),
        serviceType: values.serviceType?.trim(),
        percentage: values.percentage !== '' && !isNaN(values.percentage) ? Number(values.percentage) : 0,
        startDate: values.startDate ? new Date(values.startDate).toISOString().split('T')[0] : undefined,
        endDate: values.endDate ? new Date(values.endDate).toISOString().split('T')[0] : undefined,
        isActive: values.isActive
      };

      const response = await ApiRequestUtils.update(API_ROUTES.PUT_DISCOUNT, payload);

      if (response?.success) {
        navigate('/dashboard/user/discountModuleList', {
          state: { updatedDiscount: response.data },
        });
      } else {
        setAlert({ color: 'red', message: 'Failed to update discount' });
        setTimeout(() => setAlert(null), 3000);
      }
    } catch (error) {
      console.error('Update failed:', error);
      setAlert({ color: 'red', message: 'Update failed!' });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !initialValues) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="p-4 mx-auto">
      {alert && (
        <div className="mb-2">
          <Alert color={alert.color}>{alert.message}</Alert>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4">Edit Discount</h2>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={DISCOUNT_EDIT_SCHEMA}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, isValid }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field type="hidden" name="discountId" />

              <div>
                <label className="text-sm font-medium text-gray-700">Service Type</label>
                <Field
                  as="select"
                  name="serviceType"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                >
                  <option value="">Select</option>
                  <option value="DRIVER">DRIVER</option>
                  <option value="RIDES">RIDES</option>
                  <option value="RENTAL">RENTAL</option>
                  <option value="ALL">ALL</option>
                </Field>
                <ErrorMessage name="serviceType" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Discount Percentage (%)</label>
                <Field
                  name="percentage"
                  type="number"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                />
                <ErrorMessage name="percentage" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Start Date & Time</label>
                <Field
                  name="startDate"
                  type="datetime-local"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                />
                <ErrorMessage name="startDate" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">End Date & Time</label>
                <Field
                  name="endDate"
                  type="datetime-local"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                />
                <ErrorMessage name="endDate" component="div" className="text-red-500 text-sm" />
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
                <ErrorMessage name="isActive" component="div" className="text-red-500 text-sm" />
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
                disabled={isSubmitting || !isValid}
                className={`my-6 px-8 border-2 rounded-xl ${ColorStyles.continueButtonColor}`}
              >
                Update
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DiscountEdit;
