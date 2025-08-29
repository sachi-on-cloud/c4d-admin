import { useState, useEffect } from "react";
import { SUBSCRIPTION_ADD_SCHEME } from "@/utils/validations";
import { Alert } from "@material-tailwind/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { useNavigate } from 'react-router-dom';


const CabSubscriptionAdd = () => {
  const [alert, setAlert] = useState(false);
  const navigate = useNavigate();
  const [owners, setOwners] = useState([]);
  const [cabs, setCabs] = useState([]);
  const [plans, setPlans] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedOption, setSelectedOption] = useState("owner");

  useEffect(() => {
    const fetchData = async () => {

      const [ownerData, driverData, planData] = await Promise.all([
        await ApiRequestUtils.get(API_ROUTES.GET_ACCOUNTS),
        await ApiRequestUtils.get(API_ROUTES.GET_DRIVERS_FOR_SUBSCRIPTION),
        await ApiRequestUtils.get(API_ROUTES.GET_SUBCRIPTION_PLAN)
      ]);

      if (ownerData?.success && ownerData?.data.length > 0) {
        setOwners(ownerData?.data);
      }

      if (driverData?.success && driverData?.data.length > 0) {
        setDrivers(driverData?.data);
      }
      
      if (planData?.success && planData?.result) {
        setPlans(planData?.result)
      }
    };
    fetchData();
  }, []);

  const initialValues = {
    subscriptionType: selectedOption,
    owner: "",
    cab: "",
    driver: "",
    paymentMethod: ""
  };
  
  const onSubmit = async (values) => {
    console.log("Form Values:", values);
    let subscriptionDetails = {};
    try {
      if (values.driver) {
        subscriptionDetails = {
          driverId: values.driver,
          planId: plans?.id,
          paymentMethod: values.paymentMethod,
        };
      } else if (values.owner && values.cab) {
        subscriptionDetails = {
          ownerId: values.owner,
          cabId: values.cab,
          planId: plans?.id,
          paymentMethod: values.paymentMethod,
      };
    }
      const data = await ApiRequestUtils.post(API_ROUTES.CREATE_SUBSCRIPTION, subscriptionDetails);
      // if (!data?.success && data?.code === 203) {
      //   console.error('Driver already exists');
      //   setAlert({
      //     color: 'red',
      //     message: 'Driver already exists'
      //   });
      //   setTimeout(() => setAlert(null), 5000);
      //   resetForm();
      // } else {
      //   console.log('ELSE IN SUBMIT :');
      //   // navigate('/dashboard/drivers', {
      //   //     state: {
      //   //         driverAdded: true,
      //   //         driverName: data?.data?.firstName
      //   //     }
      //   // });
      //   setDriverAdded({
      //     driverId: data?.data?.id,
      //     value: true
      //   });
      // }
      if (data?.success) {
        console.log("Subscription created successfully:", data);
        return navigate("/dashboard/finance/cab-subscription");
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

  const onOwnerChangeHandler = async (val) => {
    const cabData = await ApiRequestUtils.get(API_ROUTES.GET_ACCOUNT_CABS + val);
    setCabs(cabData?.data);
  }
  const date = new Date();

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);

    return `${day}/${month}/${year}`;
  }

  const format30Days = () => {
    const today = new Date();
    today.setDate(today.getDate() + 30);

    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear().toString().slice(-2);

    return `${day}/${month}/${year}`;
  }

  return (
    <div className="p-4">
      {alert && (
        <div className="mb-2">
          <Alert color={alert.color} className="py-3 px-6 rounded-xl">
            {alert.message}
          </Alert>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4">Add Subscription</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={SUBSCRIPTION_ADD_SCHEME}
        onSubmit={onSubmit}
        enableReinitialize={true}
      >
        {({handleSubmit, values ,setFieldValue ,errors}) => (
          <Form>
            {/* <div className="mb-4">
              <label className="mr-4">
                <Field
                  type="radio"
                  name="subscriptionType"
                  value="owner"
                  className="mr-2"
                  onChange={(e) => {
                    setFieldValue("subscriptionType", e.target.value);
                    setSelectedOption(e.target.value);
                  }}
                />
                Owner
              </label>
              <label>
                <Field
                  type="radio"
                  name="subscriptionType"
                  value="driver"
                  className="mr-2"
                  onChange={(e) => {
                    setFieldValue("subscriptionType", e.target.value);
                    setSelectedOption(e.target.value);
                  }}
                />
                Driver
              </label>
            </div> */}
            {/* <div className="p-4 border rounded-md bg-gray-50"> */}
                <div className="p-4 border rounded-md bg-gray-50 grid grid-cols-2 gap-4">
                {selectedOption === "owner" &&
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Select Owner
                    </label>
                    <Field
                      as="select"
                      name="owner"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      onChange={(e) => {
                        const selectedOwner = e.target.value;
                        setFieldValue("owner", selectedOwner)
                        onOwnerChangeHandler(selectedOwner)
                      }
                      }
                    >
                      <option value="" disabled>
                        Choose Owner
                      </option>
                      {owners.map((owner, index) => (
                        <option key={index} value={owner.id}>
                          {owner.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="owner"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                }
                {selectedOption === "owner" &&
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Select Cab
                    </label>
                    <Field
                      as="select"
                      name="cab"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={!values.owner}
                    >
                      <option value="" disabled>
                        {values.owner ? "Choose Cab" : "Select an owner first"}
                      </option>
                      {cabs.map((cab, index) => (
                        <option key={index} value={cab.id}>
                          {cab.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="cab"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                    {values.owner && cabs.length === 0 && (
                      <div className="text-red-500 text-sm mt-1">
                        No cabs for the selected owner. Please add more to subscribe.
                      </div>
                    )}
                  </div>
                }
                {selectedOption === "driver" &&
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Select Driver
                    </label>
                    <Field
                      as="select"
                      name="driver"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="" disabled>
                        Choose Driver
                      </option>
                      {drivers.map((driver, index) => (
                        <option key={index} value={driver.id}>
                          {driver.firstName}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="driver"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                }
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Plan Details
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                    value={`₹ ${plans ? Number(plans.price) : 1000}`}
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                      value={formatDate(date)}
                      readOnly
                    />
                  </div>
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        End Date
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                        value={format30Days(date)}
                        readOnly
                    />
                    </div>
                </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2">Paymnet Method</label>
                    <Field as="select" name="paymentMethod" className="p-2 w-full rounded-md border-2 border-gray-300">
                      <option value="">Select Payment method</option>
                      <option value="CASH">CASH</option>
                      <option value="GPAY">GPAY</option>
                    </Field>
                    <ErrorMessage name="paymentMethod" component="div" className="text-red-500 text-sm" />
                  </div>
                </div>
              <div className="mt-4 flex justify-center">
                <button
                  type='submit'
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 focus:outline-none"
                >
                  Submit
                </button>
              </div>
            {/* </div> */}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CabSubscriptionAdd;
