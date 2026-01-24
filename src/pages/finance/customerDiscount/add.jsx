import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button, Card, CardHeader, CardBody, Typography, Spinner } from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES, ColorStyles } from "@/utils/constants";
import { useNavigate, useLocation } from "react-router-dom";

const CustomDiscountSchema = Yup.object({
  discountId: Yup.number().required("Discount is required"),
  customerIdsInput: Yup.string().trim().required("Enter at least one customer ID Separated by comma  eg: 1,234"),
});

const CustomerDiscountAdd = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const discountRes = await ApiRequestUtils.get(API_ROUTES.GET_CUSTOM_ACTIVE_DISCOUNTS);

        if (discountRes?.success) {
          console.log("CUSTOM ACTIVE DISCOUNTS RESPONSE:", discountRes);
          setDiscounts(discountRes.data || []);
        }
      } catch (error) {
        console.error("Error loading custom discount data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const initialValues = {
    discountId: location.state?.discountId || "",
    customerIdsInput: "",
  };

  const handleSubmit = async (values, formikHelpers) => {
    setSubmitting(true);
    try {
      const loggedInUser = localStorage.getItem("loggedInUser");
      const parsedUser = loggedInUser ? JSON.parse(loggedInUser) : null;
      const createdBy = parsedUser?.id || 0;

      const rawIds = (values.customerIdsInput || "")
        .split(/[\n,]+/)
        .map((id) => id.trim())
        .filter((id) => id !== "");

      const customerIds = Array.from(
        new Set(
          rawIds
            .map((id) => Number(id))
            .filter((id) => Number.isInteger(id) && id > 0)
        )
      );

      if (customerIds.length === 0) {
        formikHelpers.setFieldError(
          "customerIdsInput",
          "Enter valid numeric customer IDs."
        );
        return;
      }

      const payload = {
        discountId: Number(values.discountId),
        customerIds,
        createdBy,
      };

      const res = await ApiRequestUtils.post(API_ROUTES.POST_CUSTOM_DISCOUNT_TARGETS, payload);

      if (res?.success) {
        navigate("/dashboard/users/custom-discount/list");
        return;
      } else {
        formikHelpers.setFieldError(
          "customerIdsInput",
          res?.message || "Failed to assign custom discount."
        );
      }
    } catch (error) {
      console.error("Error submitting custom discount targets:", error);
      formikHelpers.setFieldError(
        "customerIdsInput",
        error?.response?.data?.message || "Something went wrong while saving."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="mb-8 flex flex-col gap-6">
      <Card>
        <CardHeader variant="gradient" className={`mb-4 p-6 mt-3 rounded-xl ${ColorStyles.bgColor}`}>
          <Typography variant="h6" color="white">
            Custom Discount Offer
          </Typography>
        </CardHeader>
        <CardBody className="pt-0">
          <Formik initialValues={initialValues} validationSchema={CustomDiscountSchema} onSubmit={handleSubmit}>
            {() => (
              <Form className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Select Discount</label>
                  <Field
                    as="select"
                    name="discountId"
                    className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm bg-white"
                    disabled={Boolean(location.state?.discountId)}
                  >
                    <option value="">Select Discount</option>
                    {discounts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title || d.name || `Discount #${d.id}`}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="discountId" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Customer IDs
                  </label>
                  <Field name="customerIdsInput">
                    {({ field }) => (
                      <textarea
                        {...field}
                        rows={3}
                        className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                        placeholder="Enter one or more customer IDs, separated by comma or new line"
                      />
                    )}
                  </Field>
                  <ErrorMessage name="customerIdsInput" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className="md:col-span-2 flex justify-between mt-4">
                  <Button
                    type="button"
                    className={`px-6 ${ColorStyles.backButton} rounded-xl`}
                    onClick={() => navigate("/dashboard/users/custom-discount/list")}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className={`px-8 border-2 rounded-xl ${ColorStyles.continueButtonColor}`}
                  >
                    {submitting ? "Saving..." : "Add Custom Discount"}
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

export default CustomerDiscountAdd;
