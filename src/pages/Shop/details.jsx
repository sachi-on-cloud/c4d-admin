import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import { Button, Typography, Card, CardBody, Dialog, DialogHeader, DialogBody, Spinner } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';

const ShopDetails = () => {
  const navigate = useNavigate();
  const [shopVal, setShopVal] = useState({});
  const [modalData, setModalData] = useState(null);
  const [imagePreviews, setImagePreviews] = useState({
    LICENSE: null,
    GST: null,
    LOGO: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchItem(id);
    }
  }, [id]);

  const fetchItem = async (itemId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiRequestUtils.get(`${API_ROUTES.GET_SHOP_BY_ID}/${itemId}`);
      if (data?.success) {
        const shopData = data.data;
        console.log("licenseDocument", shopData.licenseDocument);
        console.log("gstDocument", shopData.gstDocument);
        console.log("shopLogo", shopData.shopLogo);
        setShopVal(shopData);
        // Map API response keys to imagePreviews
        setImagePreviews({
          LICENSE: shopData.licenseDocument ? { image1: shopData.licenseDocument } : null,
          GST: shopData.gstDocument ? { image1: shopData.gstDocument } : null,
          LOGO: shopData.shopLogo ? { image1: shopData.shopLogo } : null,
        });
      } else {
        setError('Failed to fetch shop: ' + data?.message);
      }
    } catch (error) {
      console.error('Error fetching shop:', error);
      setError('Error fetching shop.');
    } finally {
      setLoading(false);
    }
  };

  const initialValues = {
    shopName: shopVal?.shopName || '',
    shopType: shopVal?.shopType || '',
    shopAddress: shopVal?.shopAddress?.name || '',
    shopLandmark: shopVal?.shopLandmark || '',
    shopZone: shopVal?.shopZone || '',
    primaryPhone: shopVal?.primaryPhone || '',
    secondaryPhone: shopVal?.secondaryPhone || '',
    landline: shopVal?.landline || '',
    bookingCount: shopVal?.bookingCount || 0,
  };

  const DocumentView = ({ label, name, value, setModalData, fullDocVal }) => {
    console.log("full Data", fullDocVal?.image1);
    return (
      <tr>
        <td className="py-3 px-5 border-b border-blue-gray-50">
          <Typography className="text-xs font-semibold text-blue-gray-600">{label}</Typography>
        </td>
        <td className="py-3 px-5 border-b border-blue-gray-50">
          <Typography
            className={`text-xs font-semibold ${value ? 'text-green-500' : 'text-primary-500'}`}
          >
            {value ? 'UPLOADED' : 'NO DOCUMENTS'}
          </Typography>
        </td>
        <td className="py-3 px-5 border-b border-blue-gray-50">
          {value && value.startsWith('http') && (
            <Typography
              variant="small"
              className="font-semibold underline cursor-pointer text-primary-900"
              onClick={() => setModalData({ image1: fullDocVal?.image1 })}
            >
              View/Download
            </Typography>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Shop Details</h2>
      {error && (
        <div className="text-red-500 text-sm mb-4">{error}</div>
      )}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Spinner className="h-12 w-12" />
        </div>
      ) : (
        <Formik initialValues={initialValues} onSubmit={() => {}} enableReinitialize={true}>
          {({ values }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="shopName" className="text-sm font-medium text-gray-700">Shop Name</label>
                  <Field type="text" disabled name="shopName" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300 shadow-sm" />
                </div>
                <div>
                  <label htmlFor="shopType" className="text-sm font-medium text-gray-700">Shop Type</label>
                  <Field
                    as="select"
                    disabled
                    name="shopType"
                    className="p-2 w-full rounded-md border bg-gray-200 border-gray-300 shadow-sm"
                  >
                    <option value="">Select Shop Type</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Grocery">Grocery</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Others">Others</option>
                  </Field>
                </div>
                <div className="col-span-2">
                  <label htmlFor="shopAddress" className="text-sm font-medium text-gray-700">Address</label>
                  <Field
                    as="textarea"
                    disabled
                    name="shopAddress"
                    className="p-2 w-full rounded-md border bg-gray-200 border-gray-300 shadow-sm"
                    rows="3"
                  />
                </div>
                <div>
                  <label htmlFor="shopLandmark" className="text-sm font-medium text-gray-700">Landmark</label>
                  <Field
                    type="text"
                    disabled
                    name="shopLandmark"
                    className="p-2 w-full rounded-md border bg-gray-200 border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label htmlFor="shopZone" className="text-sm font-medium text-gray-700">Zone</label>
                  <Field
                    type="text"
                    disabled
                    name="shopZone"
                    className="p-2 w-full rounded-md border bg-gray-200 border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label htmlFor="primaryPhone" className="text-sm font-medium text-gray-700">Primary Phone</label>
                  <Field
                    type="tel"
                    disabled
                    name="primaryPhone"
                    className="p-2 w-full rounded-md border bg-gray-200 border-gray-300 shadow-sm"
                    maxLength={10}
                  />
                </div>
                <div>
                  <label htmlFor="secondaryPhone" className="text-sm font-medium text-gray-700">Secondary Phone</label>
                  <Field
                    type="tel"
                    disabled
                    name="secondaryPhone"
                    className="p-2 w-full rounded-md border bg-gray-200 border-gray-300 shadow-sm"
                    maxLength={10}
                  />
                </div>
                <div>
                  <label htmlFor="landline" className="text-sm font-medium text-gray-700">Landline</label>
                  <Field
                    type="text"
                    disabled
                    name="landline"
                    className="p-2 w-full rounded-md border bg-gray-200 border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label htmlFor="bookingCount" className="text-sm font-medium text-gray-700">Booking Count</label>
                  <Field
                    type="number"
                    disabled
                    name="bookingCount"
                    className="p-2 w-full rounded-md border bg-gray-200 border-gray-300 shadow-sm"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Typography variant="h3" className="text-2xl font-bold text-blue-gray-800 mb-4">
                  Document Details
                </Typography>
                <Card>
                  <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
                    <table className="w-full min-w-[640px] table-auto">
                      <thead>
                        <tr>
                          {['Type', 'Status', 'Action'].map((el, index) => (
                            <th key={index} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                              <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                                {el}
                              </Typography>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <DocumentView
                          label="Shop License"
                          name="LICENSE"
                          value={imagePreviews.LICENSE?.image1}
                          setModalData={setModalData}
                          fullDocVal={imagePreviews.LICENSE}
                        />
                        <DocumentView
                          label="GST Document"
                          name="GST"
                          value={imagePreviews.GST?.image1}
                          setModalData={setModalData}
                          fullDocVal={imagePreviews.GST}
                        />
                        <DocumentView
                          label="Shop Logo"
                          name="LOGO"
                          value={imagePreviews.LOGO?.image1}
                          setModalData={setModalData}
                          fullDocVal={imagePreviews.LOGO}
                        />
                      </tbody>
                    </table>
                  </CardBody>
                </Card>
              </div>

              <div className="flex justify-between mt-8">
                <Button
                  onClick={() => navigate('/dashboard/vendors/shops')}
                  className={`px-8 ${ColorStyles.backButton || 'text-black border-2 border-gray-400 bg-white rounded-xl'}`}
                >
                  Back
                </Button>
                <Button
                  onClick={() => navigate(`/dashboard/vendors/shops/edit/${id}`)}
                  className={`px-8 ${ColorStyles.editButton || 'bg-blue-500'}`}
                >
                  Edit
                </Button>
              </div>

              {modalData && (
                <Dialog open={Boolean(modalData)} handler={() => setModalData(null)} size="md">
                  <DialogHeader>
                    <div className="flex justify-between items-center w-full">
                      <Typography variant="h6">Document Details</Typography>
                      <button
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => setModalData(null)}
                        aria-label="Close document modal"
                      >
                        X
                      </button>
                    </div>
                  </DialogHeader>
                  <DialogBody divider>
                    <div className="flex flex-col items-center space-y-3">
                      {modalData.image1 && modalData.image1.startsWith('http') ? (
                        modalData.image1.includes('.pdf') ? (
                          <embed
                            src={modalData.image1}
                            type="application/pdf"
                            className="w-full rounded-lg shadow-md"
                            style={{ height: '45vh' }}
                          />
                        ) : (
                          <img
                            src={modalData.image1}
                            alt="Document"
                            className="w-full rounded-lg shadow-md"
                            style={{ height: '45vh', objectFit: 'contain' }}
                          />
                        )
                      ) : (
                        <Typography color="red">Invalid or missing document URL</Typography>
                      )}
                      <div className="flex justify-center mt-4">
                        {modalData.image1 && modalData.image1.startsWith('http') && (
                          <a
                            href={modalData.image1}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700"
                            aria-label="Download document"
                          >
                            Download Document
                          </a>
                        )}
                      </div>
                    </div>
                  </DialogBody>
                </Dialog>
              )}
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default ShopDetails;