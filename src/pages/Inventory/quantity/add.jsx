import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@material-tailwind/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import moment from 'moment';

const validationSchema = Yup.object({
  productId: Yup.string().required('Product Type is required'),
  entryAt: Yup.string().required('Date is required'),
  totalStock: Yup.number().required('Total Stock is required'),
  premiumStock: Yup.number().required('Premium Stock is required'),
  regularStock: Yup.number().required('Regular Stock is required'),
  wasteStock: Yup.number().required('Waste Stock is required'),
});

const AddQuantity = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [productItems, setProductItems] = useState([]);
  const selectedProductId = location.state?.productId || '';

  const initialValues = {
    productId: selectedProductId,
    entryAt: '',
    totalStock:'',
    premiumStock:'',
    regularStock:'',
    wasteStock:'',
  };

  

  useEffect(() => {
    const fetchCategoryList = async () => {
      try {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_PRODUCTS);
        setProductItems(data.data || []);
      } catch (err) {
        console.error('API error:', err);
      }
    };

    fetchCategoryList();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const selectedCategory = productItems.find(
        (category) => category.id === values.productId
      );
      if (!selectedCategory) {
        throw new Error('Selected product type does not exist.');
      }
const formattedDateTime = moment(values.entryAt).format("YYYY-MM-DD HH:mm:ss.SSSZ");
  console.log("DADADA",formattedDateTime)
      const payload = {
        productId: values.productId,
        entryAt: values.entryAt,
        totalStock: values.totalStock,
        premiumStock: values.premiumStock,
        regularStock: values.regularStock,
        wasteStock: values.wasteStock

      };

      const response = await ApiRequestUtils.post(`${API_ROUTES.POST_STOCK}/${values.productId}/stocks`,payload);

      if (response?.success) {
        navigate('/dashboard/inventory/quantity-list');
      } else {
        throw new Error(response?.error || 'Failed to add stock.');
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Stock</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field type="hidden" name="productId" />
              <div>
                <label className="text-sm font-medium text-gray-700">Date</label>
                <Field type="datetime-local" name="entryAt" className="p-2 w-full rounded-md border border-gray-300 shadow-sm" />
                <ErrorMessage name="entryAt" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Total</label>
                <Field type="number" name="totalStock" className="p-2 w-full rounded-md border border-gray-300 shadow-sm" min={0} />
                <ErrorMessage name="totalStock" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Premium</label>
                <Field type="number" name="premiumStock" className="p-2 w-full rounded-md border border-gray-300 shadow-sm" min={0}/>
                <ErrorMessage name="premiumStock" component="div" className="text-red-500 text-sm"
                />
              </div>
               <div>
                <label className="text-sm font-medium text-gray-700">Regular</label>
                <Field type="number" name="regularStock" className="p-2 w-full rounded-md border border-gray-300 shadow-sm" min={0}/>
                <ErrorMessage name="regularStock" component="div" className="text-red-500 text-sm" />
              </div>
               <div>
                <label className="text-sm font-medium text-gray-700">Waste</label>
                <Field type="number" name="wasteStock" className="p-2 w-full rounded-md border border-gray-300 shadow-sm" min={0}/>
                <ErrorMessage name="wasteStock" component="div" className="text-red-500 text-sm" />
              </div>
            </div>
            <div className="flex flex-row">
              <Button
                type="button"
                onClick={() => navigate('/dashboard/inventory/quantity-list')}
                className={`my-6 mx-2 border-2 rounded-xl ${ColorStyles.backButton}`}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !selectedProductId}
                color="black"
                className={`my-6 mx-2 border-2 rounded-xl ${ColorStyles.continueButtonColor}`}
              >
                Add
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddQuantity;