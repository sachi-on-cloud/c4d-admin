import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Typography,
} from "@material-tailwind/react";
import moment from "moment";
import { API_ROUTES } from "@/utils/constants";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";

const DriverWalletLog = ({ driverId }) => {
  const [walletLog, setWalletLog] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!driverId) {
        setWalletLog([]);
        return;
      }

      try {
        const data = await ApiRequestUtils.get(`${API_ROUTES.DRIVER_WALLET}/${driverId}`);
        console.log("API Response:", data);

        if (data?.success) {
          setWalletLog(data?.data?.WalletTransactions || []);
        } else {
          setWalletLog([]);
        }
      } catch (error) {
        console.error("Error fetching wallet log:", error);
        setWalletLog([]);
      }
    };

    fetchData();
  }, [driverId]);

  return (
    <div className="px-2 mb-2 mt-4">
      <h2 className="text-2xl font-bold mb-4">Wallet Details</h2>
      <Card>
        {walletLog.length > 0 ? (
          <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {[
                    "Date",
                    "Transaction Type",
                    "Amount (₹)",
                    "Description",
                    "Trip ID / Reference",
                    "Balance After",
                  ].map((el, index) => (
                    <th
                      key={index}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-black"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {walletLog.map((log, index) => {
                  const className = `py-3 px-5 ${
                    index === walletLog.length - 1 ? "" : "border-b border-blue-gray-50"
                  }`;
                  return (
                    <tr key={log.id || index}>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {moment(log.Date).format("DD-MM-YYYY")}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {log.type}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          ₹{log.amount}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {log.Description}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {log.bookingId}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          ₹{log.balance}
                        </Typography>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        ) : (
          <CardBody>
            <Typography className="text-lg font-medium p-4">No Record Found</Typography>
          </CardBody>
        )}
      </Card>
    </div>
  );
};

export default DriverWalletLog;