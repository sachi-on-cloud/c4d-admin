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
        price: 0,
        packagePrice: '',
        serviceType: '',
        name:'',
        bonusPrice:0,
        totalPrice:0,
        type:'',
        validityDays:'' || 0,
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
                    name: response.result.name || "",
                    bonusPrice: response.result.bonusPrice || "",
                    totalPrice: response.result.totalPrice || "",
                    type: response.result.type || "",
                    validityDays: response.result.validityDays || 0,
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
                price: Number(values.price),
                packagePrice: Number(values.packagePrice),
                serviceType: values.serviceType,
                name:values.name,
                bonusPrice:Number(values.bonusPrice),
                totalPrice: Number(values.totalPrice),
                validityDays:Number(values.validityDays),
                type:values.type,
            };

            const response = await ApiRequestUtils.update(API_ROUTES.MASTER_SUBSCRIPTION_EDIT, reqBody);

            if (response?.success) {
                return navigate("/dashboard/finance/master-subscription");
            }
            
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
                    useEffect(() => {
                        setFieldValue("totalPrice", (Number(values.price) || 0) + (Number(values.bonusPrice) || 0));
                    }, [values.price, values.bonusPrice, setFieldValue]);
                    return (
                        <Form>
                            <div className="p-4 bg-gray-50 grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="source" className="text-sm font-medium text-gray-700">Service Type</label>
                                    <Field as="select" name="serviceType"  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm">
                                        <option value="">Select Service Type</option>
                                        <option value="ACTING_DRIVER">Driver</option>
                                        <option value="RIDES_RENTAL_CABS">Rides/Rental Cabs</option>
                                        
                                    </Field>
                                    <ErrorMessage name="serviceType" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                                    <Field type="string" name="name"  className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm my-1" />
                                </div>
                                <div>
                                    <label htmlFor="type" className="text-sm font-medium text-gray-700">Type</label>
                                    <Field as="select"  name="type" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm">
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

                            <div className="flex flex-row ">
                                <Button fullWidth className="my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl"
                                    onClick={() => navigate(-1)}>Cancel</Button>
                                <Button fullWidth className="my-6 mx-2 text-white border-2 border-gray-400 bg-cyan-500  rounded-xl" onClick={handleSubmit} disabled={!dirty || !isValid}>
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
