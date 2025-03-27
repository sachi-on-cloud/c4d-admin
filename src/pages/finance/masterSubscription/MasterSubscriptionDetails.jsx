import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Button } from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";

const MasterSubscriptionDetails = () => {
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
        const fetchData = async (id) => {
            try {
                const response = await ApiRequestUtils.get(`${API_ROUTES.GET_MASTER_SUBSCRIPTION_LIST}/${id}`);
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
                                <label className="text-sm font-medium text-gray-700">Service Type</label>
                                <Field as="select" name="serviceType" className="p-2 w-full rounded-md border-2 border-gray-300" disabled>
                                    <option value="">Select Service Type</option>
                                    <option value="ACTING_DRIVER">Acting Driver</option>
                                    <option value="RIDES_RENTAL_CABS">Rides/Rental Cabs</option>
                                </Field>
                                
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Subscription Amount (INR)</label>
                                <Field type="number" name="packagePrice" className="p-2 w-full rounded-md border-gray-300" disabled />
                                
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Earnings Threshold (INR)</label>
                                <Field type="number" name="price" className="p-2 w-full rounded-md border-gray-300" disabled />
                                
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Discount</label>
                                <Field type="number" name="discount" className="p-2 w-full rounded-md border-gray-300" disabled />
                                
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Discount Price</label>
                                <Field type="number" name="discountPrice" value={calculateDiscountPrice()} className="p-2 w-full rounded-md border-gray-300" disabled />
                                
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Discount Start Date</label>
                                <Field type="date" name="discountStartDate" className="p-2 w-full rounded-xl border-2 border-gray-300" disabled />
                                
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Discount End Date</label>
                                <Field type="date" name="discountEndDate" className="p-2 w-full rounded-xl border-2 border-gray-300" disabled />
                                
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
                            <Button fullWidth className="my-6 mx-2 text-white border-2 border-gray-400 bg-black rounded-xl" onClick={() => navigate(`/dashboard/finance/master-subscription/edit/${id}`)}>
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
