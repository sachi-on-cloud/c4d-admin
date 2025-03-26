import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { SUBSCRIPTION_EDIT_SCHEME } from "@/utils/validations";
import { Button } from "@material-tailwind/react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";

const MasterSubscriptionEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [initialValues, setInitialValues] = useState({
        serviceType: "",
        packagePrice: "",
        price: "",
        discount: "",
        discountPrice: "",
        discountStartDate: "",
        discountEndDate: "",
    });

    useEffect(() => {
        if (id) {
            fetchSubscriptionDetails(id);
        }
    }, [id]);

    const fetchSubscriptionDetails = async (id) => {
        try {
            const response = await ApiRequestUtils.get(`${API_ROUTES.GET_MASTER_SUBSCRIPTION_LIST}/${id}`
            );
            if (response?.result) {
                setInitialValues({
                    serviceType: response.result.serviceType || "",
                    packagePrice: response.result.packagePrice || "",
                    price: response.result.price || "",
                    discount: response.result.discount || "",
                    discountPrice: response.result.discountPrice || "",
                    discountStartDate: response.result.discountStartDate || "",
                    discountEndDate: response.result.discountEndDate || "",
                });
            }
        } catch (error) {
            console.error("Error fetching subscription details:", error);
        }
    };

    const currentDate = () => new Date().toISOString().split("T")[0];



    const onSubmit = async (values) => {
        try {
            const reqBody = {
                planId: id,
                price: values.price,
                packagePrice: values.packagePrice,
                serviceType: values.serviceType,
                discount: values.discount,
                discountPrice: values.discountPrice,
                discountStartDate: values.discountStartDate,
                discountEndDate: values.discountEndDate,
            };

            const response = await ApiRequestUtils.update(API_ROUTES.MASTER_SUBSCRIPTION_EDIT, reqBody);

            if (response?.success) {
                return navigate("/dashboard/finance/master-subscription");
            }
            
            console.log("RESPONSE", response);
        } catch (error) {
            console.error("Error updating price details:", error);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Master Subscription Edit</h2>

            <Formik
                initialValues={initialValues}
                validationSchema={SUBSCRIPTION_EDIT_SCHEME}
                onSubmit={onSubmit}
                enableReinitialize={true}
            >
                {({ handleSubmit, values, setFieldValue, errors, isValid, dirty }) => {
                        const calculateDiscountPrice = () => {
                            if (values.discount) {
                                const amount = parseFloat(values.packagePrice) || 0;
                                const discount = parseFloat(values.discount) || 0;
                                return amount - amount * (discount / 100);
                            }
                            return 0;
                        };
                    return (
                        <Form>
                            <div className="p-4 bg-gray-50 grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="serviceType" className="text-sm font-medium text-gray-700">
                                        Service Type
                                    </label>
                                    <Field as="select" name="serviceType" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" disabled
                                    >
                                        <option value="">Select Service Type</option>
                                        <option value="ACTING_DRIVER">Acting Driver</option>
                                        <option value="RIDES_RENTAL_CABS">Rides/Rental Cabs</option>
                                    </Field>
                                    <ErrorMessage name="serviceType" component="div" className="text-red-500 text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="packagePrice" className="text-sm font-medium text-gray-700">
                                        Subscription Amount (INR)
                                    </label>
                                    <Field type="number" name="packagePrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled
                                        onChange={(e) => {
                                            setFieldValue("packagePrice", e.target.value);
                                            setFieldValue("discountPrice", calculateDiscountPrice());
                                        }}
                                    />
                                    <ErrorMessage name="packagePrice" component="div" className="text-red-500 text-sm my-1" />
                                </div>

                                <div>
                                    <label htmlFor="price" className="text-sm font-medium text-gray-700">
                                        Earnings Threshold (INR)
                                    </label>
                                    <Field type="number" name="price" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="price" component="div" className="text-red-500 text-sm my-1"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="discount" className="text-sm font-medium text-gray-700" >
                                        Discount
                                    </label>
                                    <Field type="number" name="discount" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="discount" component="div" className="text-red-500 text-sm my-1" />
                                </div>

                                <div>
                                    <label htmlFor="discountPrice" className="text-sm font-medium text-gray-700">
                                        Discount Price
                                    </label>
                                    <Field type="number" name="discountPrice" disabled value={calculateDiscountPrice()} className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="discountPrice" component="div" className="text-red-500 text-sm my-1" />
                                </div>

                                <div>
                                    <label htmlFor="discountStartDate" className="text-sm font-medium text-gray-700">
                                        Discount Start Date
                                    </label>
                                    <Field type="date" name="discountStartDate" className="p-2 w-full rounded-xl border-2 border-gray-300" min={currentDate()} />
                                    <ErrorMessage name="discountStartDate" component="div" className="text-red-500 text-sm my-1" />
                                </div>

                                <div>
                                    <label htmlFor="discountEndDate" className="text-sm font-medium text-gray-700">
                                        Discount End Date
                                    </label>
                                    <Field type="date" name="discountEndDate" className="p-2 w-full rounded-xl border-2 border-gray-300" min={currentDate()} />
                                   <ErrorMessage name="discountEndDate" component="div" className="text-red-500 text-sm my-1" />
                                </div>
                            </div>

                            <div className="flex flex-row ">
                                <Button fullWidth className="my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl"
                                    onClick={() => navigate(-1)}>Cancel</Button>
                                <Button fullWidth className="my-6 mx-2 text-white border-2 border-gray-400 bg-black rounded-xl" onClick={handleSubmit} disabled={!dirty || !isValid}>
                                    Submit
                                </Button>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
};

export default MasterSubscriptionEdit;
