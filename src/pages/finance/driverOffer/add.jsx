import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button, Card, CardHeader, CardBody, Typography } from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES, ColorStyles } from "@/utils/constants";
import { useNavigate } from "react-router-dom";
import { DriverOfferSchema } from "@/utils/validations";

const DriverOfferAdd = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  // const [serviceAreas, setServiceAreas] = useState([]);

  const initialValues = {
    title: "",
    // serviceType: "",
    // serviceArea: "",
    startDate: "",
    endDate: "",
    tripTarget: "",
    amount: "",
    startMsg: "",
    midMsg: "",
    endMsg: "",
    status: "IN_ACTIVE",
  };

  // const fetchGeoData = async () => {
  //   try {
  //     const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GEO_MARKINGS_LIST,
  //       { type: "Service Area" }
  //     );
  //     const filteredAreas = response?.data?.filter((area) => area.type === "Service Area") || [];
  //     setServiceAreas(filteredAreas);
  //   } catch (error) {
  //     console.error("Error fetching GEO_MARKINGS_LIST:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchGeoData();
  // }, []);

  const handleSubmit = async (values) => {
    setSubmitting(true);

    try {
      const loggedInUser = localStorage.getItem("loggedInUser");
      const parsedUser = loggedInUser ? JSON.parse(loggedInUser) : null;
      const userId = parsedUser?.id || 0;

      const payload = {
        title: values.title.trim(),
        // serviceType: values.serviceType.trim(),
        // serviceArea: values.serviceArea.trim(),
        startDate: values.startDate,
        endDate: values.endDate,
        tripTarget: Number(values.tripTarget),
        amount: Number(values.amount),
        startMsg: values.startMsg.trim(),
        midMsg: values.midMsg.trim(),
        endMsg: values.endMsg.trim(),
        status: values.status,
        createdBy: userId,
        updatedBy: userId,
      };

      const res = await ApiRequestUtils.post(API_ROUTES.POST_DRIVER_OFFER, payload);

      if (res?.success) {
        navigate("/dashboard/users/driver-offer/list");
      } else {
        console.error("Failed to create driver Bonus:", res?.message);
      }
    } catch (error) {
      console.error("Error creating driver Bonus :", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-8 flex flex-col gap-6">
      <Card>
        <CardHeader
          variant="gradient"
          className={`mb-4 p-6 mt-3 rounded-xl ${ColorStyles.bgColor}`}
        >
          <Typography variant="h6" color="white">
            Add Driver Bonus
          </Typography>
        </CardHeader>
        <CardBody className="pt-0">
          <Formik
            initialValues={initialValues}
            validationSchema={DriverOfferSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <Field
                    name="title"
                    type="text"
                    className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                    placeholder="Enter offer title"
                  />
                  <ErrorMessage
                    name="title"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* <div>
                    <label className="text-sm font-medium text-gray-700">Service Type</label>
                    <Field
                        as="select"
                        name="serviceType"
                        className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                    >
                        <option value="">Select Service Type</option>
                        <option value="DRIVER">DRIVER</option>
                        <option value="RIDES">RIDES</option>
                        <option value="RENTAL_HOURLY_PACKAGE">HOURLY PACKAGE</option>
                        <option value="RENTAL_DROP_TAXI">DROP TAXI</option>
                        <option value="RENTAL">OUTSTATION</option>
                        <option value="AUTO">AUTO</option>
                        <option value="ALL">ALL</option>
                    </Field>
                    <ErrorMessage name="serviceType" className="text-red-500 text-sm" component="div" />
                </div> */}

                {/* <div>
                  <label className="text-sm font-medium text-gray-700">Service Area</label>
                  <Field
                    as="select"
                    name="serviceArea"
                    className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm bg-white"
                  >
                    <option value="">Select Service Area</option>
                    {serviceAreas.map((area) => (
                      <option key={area.id || area.name} value={area.name}>
                        {area.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="serviceArea"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div> */}

                <div>
                  <label className="text-sm font-medium text-gray-700">Start Date</label>
                  <Field
                    name="startDate"
                    type="date"
                    className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                  />
                  <ErrorMessage
                    name="startDate"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">End Date</label>
                  <Field
                    name="endDate"
                    type="date"
                    className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                  />
                  <ErrorMessage
                    name="endDate"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Trip Target</label>
                  <Field
                    name="tripTarget"
                    type="number"
                    className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                    placeholder="Enter target trips"
                  />
                  <ErrorMessage
                    name="tripTarget"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Amount</label>
                  <Field
                    name="amount"
                    type="number"
                    step="0.01"
                    className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                    placeholder="Enter amount"
                  />
                  <ErrorMessage
                    name="amount"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Start Message</label>
                    <Field name="startMsg">
                      {({ field }) => (
                        <textarea
                          {...field}
                          rows={2}
                          className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                          placeholder="complete #target# rides get #amount#"
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name="startMsg"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Mid Message</label>
                    <Field name="midMsg">
                      {({ field }) => (
                        <textarea
                          {...field}
                          rows={2}
                          className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                          placeholder="completed #target# rides get #amount#"
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name="midMsg"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">End Message</label>
                    <Field name="endMsg">
                      {({ field }) => (
                        <textarea
                          {...field}
                          rows={2}
                          className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                          placeholder="completed #target# rides get #amount#"
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name="endMsg"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Field
                    as="select"
                    name="status"
                    className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm bg-white"
                  >
                    <option value="IN_ACTIVE">In Active</option>
                    <option value="ACTIVE">Active</option>
                    {/* <option value="ENDED">ENDED</option>
                    <option value="ARCHIVED">ARCHIVED</option> */}
                  </Field>
                  <ErrorMessage
                    name="status"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="md:col-span-2 flex justify-between mt-4">
                  <Button
                    type="button"
                    className={`px-6 ${ColorStyles.backButton} rounded-xl`}
                    onClick={() => navigate("/dashboard/users/driver-offer/list")}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className={`px-8 border-2 rounded-xl ${ColorStyles.continueButtonColor}`}
                  >
                    {submitting ? "Saving..." : "Add Driver Bonus"}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
    </div>
  );
};

export default DriverOfferAdd;
