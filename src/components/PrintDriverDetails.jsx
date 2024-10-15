import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
  CardBody,
  Typography
} from "@material-tailwind/react";
import ReactDOMServer from 'react-dom/server';
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";

const PrintDriverDetails = forwardRef((props, ref) => {
  const [driver, setDriver] = useState();
  function getNameById(id, obj) {
    for (const key in obj) {
      if (obj[key].id === id) {
        return obj[key].period;
      }
    }
    return null;
  }

  const fetchItem = async (itemId) => {
    const data = await ApiRequestUtils.get(API_ROUTES.GET_DRIVER_BY_ID + `${itemId}`);  
    setDriver(data?.data);
    print(data?.data);

  };

  useEffect(() => {
    fetchItem(props?.driverId);
  },[])
  const driverDetails = (driver) => {
    return (
      <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
        <table className="w-full min-w-[640px] table-auto">
          <thead>
            <tr>
              {["Name", "PhoneNumber", "Car Type", "Preference", "Mode"].map((el) => (
                <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                  <Typography variant="h6" className="font-bold uppercase text-black">
                    {el}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr key={driver?.result?.id}>
              <td className="py-3 px-5 border-b border-blue-gray-50">
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  {driver?.result?.firstName}
                </Typography>
              </td>
              <td className="py-3 px-5 border-b border-blue-gray-50">
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  {driver?.result?.phoneNumber}
                </Typography>
              </td>
              <td className="py-3 px-5 border-b border-blue-gray-50">
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  {driver?.result?.carType}
                </Typography>
              </td>
              <td className="py-3 px-5 border-b border-blue-gray-50">
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  {driver?.result?.preference}
                </Typography>
              </td>
              <td className="py-3 px-5 border-b border-blue-gray-50">
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  {driver?.result?.mode}
                </Typography>
              </td>
            </tr>
          </tbody>
        </table>
      </CardBody>
    )
  }

  const priceDetails = (driver) => {
    return (
      <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
        <table className="w-full min-w-[640px] table-auto">
          <thead>
            <tr>
              {["Package", "Price", "Extra Price", "Extra KM Price", "Night Charge", "Cancel Charge", "Cab Type"].map((el) => (
                <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                  <Typography variant="h6" className="text-[12px] font-bold uppercase text-black">
                    {el}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {driver?.price?.map((priceItem, index) => (
              <tr key={priceItem.id}>
                <td className="py-3 px-5 border-b border-blue-gray-50">
                  <Typography variant="small" color="blue-gray" className="font-semibold">
                    {getNameById(priceItem.packageId, props?.packages)}
                  </Typography>
                </td>
                {['price', 'extraPrice', 'extraKmPrice', 'nightCharge', 'cancelCharge', 'extraCabType'].map((field) => (
                  <td key={field} className="py-3 px-5 border-b border-blue-gray-50">

                    <Typography className="text-xs font-semibold text-blue-gray-600">
                      {priceItem[field]}
                    </Typography>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    )
  }
  // useImperativeHandle(ref, () => ({
   const print = (driver) => {
      const driverContent = ReactDOMServer.renderToStaticMarkup(driverDetails(driver));
      const priceContent = ReactDOMServer.renderToStaticMarkup(priceDetails(driver));
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Driver Consent Form</title>
            <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;  /* Fully bordered table */
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;  /* Optional: Add a background color to table header */
            }
          </style>
          </head>
          <body>
            <div className='flex flex-row justify-between px-2 mb-2'>
                <h2 className="text-2xl font-bold mb-4">Driver Details</h2>
            </div>
            ${driverContent}
            <br></br>
            <div className='flex flex-row justify-between px-2 mb-2'>
                <h2 className="text-2xl font-bold mb-4">Price Details</h2>
            </div>
            ${priceContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  // }));

  return (
    null
  );
});

export default PrintDriverDetails;
