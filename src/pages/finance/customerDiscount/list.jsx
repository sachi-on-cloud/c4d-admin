import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Typography, Spinner, Button } from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES, ColorStyles } from "@/utils/constants";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const CustomerDiscountList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        setLoading(true);
        const res = await ApiRequestUtils.get(API_ROUTES.GET_CUSTOM_DISCOUNT_TARGETS);
        if (res?.success && Array.isArray(res.data)) {
          const sorted = [...res.data].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          setItems(sorted);
        } else {
          setItems([]);
        }
      } catch (error) {
        console.error("Failed to fetch custom discount targets:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTargets();
  }, []);

  return (
    <div className="mb-8 flex flex-col gap-6 mt-8">
      <div className="flex items-center justify-end mb-2">
        <Button
          size="sm"
          className={`rounded-xl p-4 ${ColorStyles.continueButtonColor}`}
          onClick={() => navigate("/dashboard/users/custom-discount/add")}
        >
          Add Custom Discount
        </Button>
      </div>
      <Card>
        <CardHeader
          variant="gradient"
          className={`mb-4 p-6 rounded-xl ${ColorStyles.bgColor}`}
        >
          <Typography variant="h6" color="white">
            Customer Discount List
          </Typography>
        </CardHeader>
        <CardBody className="pt-0 px-0">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Spinner className="h-12 w-12" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] table-auto">
                <thead>
                  <tr>
                    <th className="py-3 px-5 text-left">Customer ID</th>
                    <th className="py-3 px-5 text-left">Customer Name</th>
                    <th className="py-3 px-5 text-left">Phone Number</th>
                    <th className="py-3 px-5 text-left">Coupon Code</th>
                    <th className="py-3 px-5 text-left">Start Date</th>
                    <th className="py-3 px-5 text-left">End Date</th>
                    <th className="py-3 px-5 text-left">Allowed Count</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-4 px-5 text-center text-gray-600"
                      >
                        No records found
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const customerId =
                        item.customer?.id || item.customerId || "-";
                      const customerName =
                        item.customer?.firstName ||
                        item.customer?.name ||
                        "Customer";
                      const phone =
                        item.customer?.phoneNumber || "";
                      const discount = item.discount || {};
                      return (
                        <tr key={`${item.discountId}-${item.customerId}-${item.created_at}`} className="border-b">
                          <td className="py-3 px-5">{customerId}</td>
                          <td className="py-3 px-5">{customerName}</td>
                          <td className="py-3 px-5">{phone}</td>
                          <td className="py-3 px-5">
                            {discount.couponCode || "-"}
                          </td>
                          <td className="py-3 px-5">
                            {discount.startDate
                              ? moment(discount.startDate).format("DD-MM-YYYY")
                              : "-"}
                          </td>
                          <td className="py-3 px-5">
                            {discount.endDate
                              ? moment(discount.endDate).format("DD-MM-YYYY")
                              : "-"}
                          </td>
                          <td className="py-3 px-5">
                            {discount.allowedCount || "-"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default CustomerDiscountList;
