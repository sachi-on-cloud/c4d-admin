import { useState,useEffect } from "react";
import { SUBSCRIPTION_ADD_SCHEME } from "@/utils/validations";
import { Alert } from "@material-tailwind/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { useNavigate } from 'react-router-dom';
import { Button } from '@material-tailwind/react'


const MasterSubscriptionAdd = () => {
  const [alert, setAlert] = useState(false);
  const navigate = useNavigate();

  const currentDate = () => {
    return (new Date()).toISOString().split('T')[0];
  };

  const initialValues = {
    price: 0,
    packagePrice: '',
    serviceType: '',
    name: '',
    bonusPrice: 0,
    totalPrice: 0,
    type: '',
    validityDays: '' || 0,

  };

  const onSubmit = async (values) => {
    let subscriptionDetails = {
      price: Number(values.price),
      packagePrice: Number(values.packagePrice),
      serviceType: values.serviceType,
      name: values.name,
      bonusPrice: Number(values.bonusPrice),
      totalPrice: Number(values.totalPrice),
      validityDays: Number(values.validityDays),
      type: values.type,
    };

    try {
      const data = await ApiRequestUtils.post(API_ROUTES.ADD_MASTER_SUBSCRIPTION_ADD, subscriptionDetails);
      if (data?.success) {
        return navigate("/dashboard/finance/master-subscription");
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error === "Driver has an overlapping subscription") {
        setAlert({
          color: "black",
          message: "This account is already subscribed. Please check the subscription details.",
        });
        setTimeout(() => setAlert(null), 5000);
      }
    }
  };

  return (
    <div className="p-4">
      {alert && (
        <div className="mb-2">
          <Alert color={alert.color} className="py-3 px-6 rounded-xl">
            {alert.message}
          </Alert>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4">Add Master Subscription</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={SUBSCRIPTION_ADD_SCHEME}
        onSubmit={onSubmit}
        enableReinitialize={true}
      >
        {({ handleSubmit, values, setFieldValue, errors, isValid, dirty }) => {
            
            useEffect(() => {
              setFieldValue("totalPrice", (Number(values.price) || 0) + (Number(values.bonusPrice) || 0));
          }, [values.price, values.bonusPrice, setFieldValue]);

          return (
            <Form>
        <div className="p-4 bg-blue-gray-100 grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="source" className="text-sm font-medium text-gray-700">Service Type</label>
          <Field as="select" name="serviceType" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50">
                    <option value="">Select Service Type</option>
                    <option value="ACTING_DRIVER">Driver</option>
                    <option value="RIDES_RENTAL_CABS">Rides/Rental Cabs</option>
                  </Field>
                  <ErrorMessage name="serviceType" component="div" className="text-red-500 text-sm" />
                </div>
                <div>
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">Plan Name</label>
                  <Field type="string" name="name" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-sm my-1" />
                </div>
                <div>
                  <label htmlFor="type" className="text-sm font-medium text-gray-700">Type</label>
                  <Field as="select" name="type" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50">
                    <option value="">Select Type</option>
                    <option value="FREE">Free</option>
                    <option value="PAID">Paid</option>
                  </Field>
                  <ErrorMessage name="type" component="div" className="text-red-500 text-sm my-1" />
                </div>
                <div>
                  <label htmlFor="packagePrice" className="text-sm font-medium text-gray-700">Price</label>
                  <Field type="number" name="packagePrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                  <ErrorMessage name="packagePrice" component="div" className="text-red-500 text-sm my-1" />
                </div>
                <div>
                  <label htmlFor="price" className="text-sm font-medium text-gray-700">Base Credits</label>
                  <Field type="number" name="price" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                  <ErrorMessage name="price" component="div" className="text-red-500 text-sm my-1" />
                </div>
                <div>
                  <label htmlFor="bonusPrice" className="text-sm font-medium text-gray-700">Bonus Credits</label>
                  <Field type="number" name="bonusPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                  <ErrorMessage name="bonusPrice" component="div" className="text-red-500 text-sm my-1" />
                </div>
                <div>
                  <label htmlFor="totalPrice" className="text-sm font-medium text-gray-700">Total Credits</label>
                        <Field
                  type="number"
                  name="totalPrice"
                  readOnly
                  className="p-2 w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
                />
                  <ErrorMessage name="totalPrice" component="div" className="text-red-500 text-sm my-1" />
                </div>
                <div>
                  <label htmlFor="validityDays" className="text-sm font-medium text-gray-700">Validity (Months)</label>
                  <Field type="number" name="validityDays" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                  <ErrorMessage name="validityDays" component="div" className="text-red-500 text-sm my-1" />
                </div>
              </div>
              <div className='flex flex-row'>
                <Button
                  fullWidth
                  onClick={() => navigate('/dashboard/finance/master-subscription')}
                  className='my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl'
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  color="blue"
                  onClick={handleSubmit}
                  disabled={!dirty || !isValid}
                  className='my-6 mx-2'
                >
                  Submit
                </Button>
              </div>
            </Form>
          )
        }}
      </Formik>
    </div>
  );
};

export default MasterSubscriptionAdd;
