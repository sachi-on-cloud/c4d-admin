import { useState } from "react";
import { SUBSCRIPTION_ADD_SCHEME } from "@/utils/validations";
import { Alert } from "@material-tailwind/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { useNavigate } from 'react-router-dom';
import {Button} from '@material-tailwind/react'


const MasterSubscriptionAdd = () => {
  const [alert, setAlert] = useState(false);
  const navigate = useNavigate();

  const currentDate = () => {
    return (new Date()).toISOString().split('T')[0];
  };

  const initialValues = {
    price: '',
    packagePrice: '',
    serviceType: '',
    discount: 0,
    discountPrice: 0,
    discountStartDate: '',
    discountEndDate: ''
  };

  const onSubmit = async (values) => {
    let subscriptionDetails = {
      price: values.price,
      packagePrice: values.packagePrice,
      serviceType: values.serviceType,
      discount: values.discount,
      discountPrice: values.discountPrice,
      discountStartDate: values.discountStartDate,
      discountEndDate: values.discountEndDate,
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
          const calculateDiscountPrice = () => {
            if(values.discount){
              const amount = parseFloat(values.packagePrice) || 0;
              const discount = parseFloat(values.discount) || 0;
              return amount - (amount * (discount / 100));
            }
            return 0;
          };

          return(
          <Form>
            <div className="p-4 bg-gray-50 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="source" className="text-sm font-medium text-gray-700">Service Type</label>
                <Field as="select" name="serviceType" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                  <option value="">Select Service Type</option>
                  <option value="ACTING_DRIVER">Acting Driver</option>
                  <option value="RIDES_RENTAL_CABS">Rides/Rental Cabs</option>
                </Field>
                <ErrorMessage name="serviceType" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label htmlFor="packagePrice" className="text-sm font-medium text-gray-700">Subscription Amount (INR)</label>
                <Field type="number" name="packagePrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" 
                  onChange={(e)=>{
                    setFieldValue('packagePrice',e.target.value);
                    setFieldValue('discountPrice',calculateDiscountPrice())
                    }
                  }
                />
                <ErrorMessage name="packagePrice" component="div" className="text-red-500 text-sm my-1" />
              </div>
              <div>
                <label htmlFor="price" className="text-sm font-medium text-gray-700">Earnings Threshold (INR)</label>
                <Field type="number" name="price" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                <ErrorMessage name="price" component="div" className="text-red-500 text-sm my-1" />
              </div>
              <div>
                <label htmlFor="discount" className="text-sm font-medium text-gray-700">Discount</label>
                <Field type="number" name="discount" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                <ErrorMessage name="discount" component="div" className="text-red-500 text-sm my-1" />
              </div>
              <div>
                <label htmlFor="discountPrice" className="text-sm font-medium text-gray-700">Discount Price</label>
                <Field type="number" name="discountPrice" disabled value={calculateDiscountPrice()} className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                <ErrorMessage name="discountPrice" component="div" className="text-red-500 text-sm my-1" />
              </div>
              <div>
                <label htmlFor="discountStartDate" className="text-sm font-medium text-gray-700">Discount Start Date</label>
                <Field type="date" name="discountStartDate" className="p-2 w-full rounded-xl border-2 border-gray-300" value={values.discountStartDate} min={currentDate()}
                  onChange={(e) => {
                    setFieldValue('discountStartDate', e.target.value);
                  }} />
                <ErrorMessage name="discountStartDate" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label htmlFor="discountEndDate" className="text-sm font-medium text-gray-700">Discount End Date</label>
                <Field type="date" name="dateOfBirth" className="p-2 w-full rounded-xl border-2 border-gray-300" value={values.discountEndDate} min={currentDate()}
                  onChange={(e) => {
                    setFieldValue('discountEndDate', e.target.value);
                  }} />
                <ErrorMessage name="discountEndDate" component="div" className="text-red-500 text-sm" />
              </div>
            </div>
            <div className='flex flex-row'>
              <Button
                  fullWidth
                  onClick={()=>navigate('/dashboard/finance/master-subscription')}
                  className='my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl'
              >
                  Cancel
              </Button>
              <Button
                  fullWidth
                  color="black"
                  onClick={handleSubmit}
                  disabled={!dirty || !isValid}
                  className='my-6 mx-2'
              >
                  Submit
              </Button>
            </div>
          </Form>
        )}}
      </Formik>
    </div>
  );
};

export default MasterSubscriptionAdd;
