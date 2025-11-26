import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Button } from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES, ColorStyles } from "@/utils/constants";

const MasterSubscriptionDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [initialValues, setInitialValues] = useState({
        price: 0,
        packagePrice: '',
        serviceType: '',
        name: '',
        bonusPrice: 0,
        totalPrice: 0,
        type: '',
        validityDays: ''|| 0,
    });

    useEffect(() => {
        const fetchData = async (id) => {
            try {
                const response = await ApiRequestUtils.get(`${API_ROUTES.GET_MASTER_SUBSCRIPTION_LIST}/${id}`);
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
                console.error("Error fetching subscription data:", error);
            }
        };

        if (id) {
            fetchData(id);
        }
    }, [id]);

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Master Subscription Details</h2>
            <Formik
                enableReinitialize
                initialValues={initialValues}
                onSubmit={(values) => console.log("Form Submitted:", values)}
            >
                {({ handleSubmit, values, setFieldValue, errors, isValid, dirty }) => {
                     
                    return (
                        <Form>
                <div className="p-4 bg-blue-gray-100 grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="source" className="text-sm font-medium text-gray-700">Service Type</label>
                    <Field as="select" name="serviceType" disabled className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50">
                                        <option value="">Select Service Type</option>
                                        <option value="ACTING DRIVER">Driver</option>
                                        <option value="RIDES_RENTAL_CABS">Rides/Rental Cabs</option>
                                        <option value="AUTO">Autos</option>
                                    </Field>
                                   
                                </div>
                                <div>
                                    <label htmlFor="name" className="text-sm font-medium text-gray-700">Plan Name</label>
                                    <Field type="string" name="name" disabled className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm my-1" />
                                </div>
                                <div>
                                    <label htmlFor="type" className="text-sm font-medium text-gray-700">Type</label>
                    <Field as="select" name="type" disabled className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50">
                                        <option value="">Select Type</option>
                                        <option value="FREE">Free</option>
                                        <option value="PAID">Paid</option>
                                    </Field>
                                   
                                </div>
                                <div>
                                    <label htmlFor="packagePrice" disabled className="text-sm font-medium text-gray-700">Price</label>
                                    <Field type="number" name="packagePrice" disabled className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                   
                                </div>
                                <div>
                                    <label htmlFor="price" className="text-sm font-medium text-gray-700">Base Credits</label>
                                    <Field type="number" name="price" disabled className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                   
                                </div>
                                <div>
                                    <label htmlFor="bonusPrice" className="text-sm font-medium text-gray-700">Bonus Credits</label>
                                    <Field type="number" name="bonusPrice" disabled className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                   
                                </div>
                                <div>
                                    <label htmlFor="totalPrice" className="text-sm font-medium text-gray-700">Total Credits</label>
                                    <Field
                                        type="number"
                                        name="totalPrice"
                                        readOnly
                                        className="p-2 w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
                                        />
                                   
                                </div>
                                <div>
                                    <label htmlFor="validityDays" className="text-sm font-medium text-gray-700">Validity (Months)</label>
                                    <Field type="number" name="validityDays" disabled className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                   
                                </div>
                            </div>
                            <div className="flex flex-row">
                                <Button
                                    fullWidth
                                    onClick={() => navigate('/dashboard/finance/master-subscription')}
                                    className="my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button fullWidth className={`my-6 mx-2 border-2 border-gray-400 rounded-xl ${
                                    ColorStyles.editButton
                                }`} onClick={() => navigate(`/dashboard/finance/master-subscription/edit/${id}`)}>
                                    Edit
                                </Button>
                            </div>

                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
};

export default MasterSubscriptionDetails;
