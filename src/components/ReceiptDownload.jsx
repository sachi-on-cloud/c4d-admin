import moment from 'moment';
import React from 'react';

const ReceiptPDFLayout = ({
  receipt,
  bookingDetails,
  additionalCharges,
  finalAmountAfterExtras,
  payment = {},
  formatDate,
  minsToHHMM,
}) => {
  return (
    <div className="w-[794px] bg-white font-sans">
      {/* Header */}
      <div className="border-b-4 border-blue-800 py-6 text-center">
        <div className="inline-flex items-center gap-2 pb-6 bg-blue-800 px-8 py-2 rounded-full text-white font-bold tracking-wide">
          ROOT
          {/* <span className="text-yellow-400 text-xl">•</span> */}
          {bookingDetails?.serviceType === "AUTO" ? " • AUTO" : " • CABS"}
        </div>

        {!(
          bookingDetails?.serviceType === "RENTAL" &&
          bookingDetails?.bookingType === "ROUND TRIP"
        ) && (
          <h2 className="mt-4 mb-3 text-2xl font-bold text-gray-800">
            {bookingDetails?.serviceType === "RIDES"
              ? "CITY RIDE RECEIPT"
              : bookingDetails?.serviceType === "AUTO"
              ? "AUTO RIDE RECEIPT"
              : bookingDetails?.serviceType === "DRIVER"
              ? "HERE'S YOUR RECEIPT FOR THE ACTING DRIVER"
              : "ONE WAY DROP RECEIPT"}
          </h2>
        )}

        <p className="text-sm text-gray-700 mt-1">
          Receipt: {receipt.receiptNumber} · {formatDate(receipt.created_at)}
        </p>

        {bookingDetails?.bookingType === "ROUND TRIP" &&
          bookingDetails?.serviceType === "RENTAL" && (
            <>
              <h2 className="mt-2 mb-3 text-3xl font-bold text-blue-900">
                Rs. {finalAmountAfterExtras}
              </h2>
              <div className="inline-flex items-center gap-2 pb-6 mt-4 bg-green-100 px-8 py-2 rounded-full text-green-700 font-bold tracking-wide">
                PAID BY {receipt.paymentType}
              </div>

              <div className="text-left mt-4">
                <p className="text-lg font-bold text-gray-700">
                  TRIP DETAILS (OUTSTATION ROUND TRIP)
                </p>
              </div>
            </>
          )}
      </div>

      {/* Route */}
      <div className="p-8 bg-gray-100">
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="flex-1 w-px bg-gray-300"></span>
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500">
                {moment(bookingDetails.startTime).format("hh:mm A")}
              </p>
              <p className="font-semibold">
                {bookingDetails?.pickupFormatAddress?.name || "Not Added"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                {moment(bookingDetails.endedTime).format("hh:mm A")}
              </p>
              <p className="font-semibold">
                {bookingDetails?.dropFormatAddress?.name || "Not Added"}
              </p>
            </div>
          </div>
        </div>

        {!(
          bookingDetails?.serviceType === "RENTAL" &&
          bookingDetails?.bookingType === "ROUND TRIP"
        ) && (
          <div className="mt-6 bg-white rounded-xl p-4 flex justify-evenly text-center shadow">
            {bookingDetails?.serviceType === "RENTAL" && (
              <div>
                <p className="text-xs text-gray-700">TYPE</p>
                <p className="font-bold">{bookingDetails?.bookingType || "-"}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-700">DISTANCE</p>
              <p className="font-bold">
                {bookingDetails?.totalDistanceKilometer || "-"} km
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-700">DURATION</p>
              <p className="font-bold">
                {(bookingDetails?.totalHours || "-")} hrs
              </p>
            </div>
            {bookingDetails?.serviceType !== "RENTAL" && (
              <div>
                <p className="text-xs text-gray-700">VEHICLE</p>
                <p className="font-bold">{bookingDetails?.carType || "-"}</p>
              </div>
            )}
          </div>
        )}

        {bookingDetails?.bookingType === "ROUND TRIP" &&
          bookingDetails?.serviceType === "RENTAL" && (
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {bookingDetails?.carType || "Mini"}
              </p>
              <p className="text-sm text-gray-600">
                {bookingDetails?.Cab?.car_number || "—"} •{" "}
                {bookingDetails?.totalDistanceKilometer || "-"} km •{" "}
                {bookingDetails?.totalHours || "-"} hrs
              </p>
            </div>
          )}
      </div>

      {/* Fare Breakdown */}
      <div className="p-8">
        <h3 className="font-bold text-gray-700 mb-4">
          {bookingDetails?.serviceType === "RENTAL" ? "FARE BREAKDOWN" : "BILL DETAILS"}
        </h3>

        <div className="flex justify-between mb-2">
          <div>
            <p className="font-bold">Ride Fare</p>
            <span>Base + distance Charge</span>
          </div>
          <span className="font-bold">Rs. {bookingDetails?.totalPrice}</span>
        </div>

        {payment.discountAmount > 0 && (
          <div className="flex justify-between text-green-600 mb-2">
            <p className="font-bold">Discount Applied</p>
            <span className="font-bold">- Rs. {payment.discountAmount.toFixed(2)}</span>
          </div>
        )}

        {additionalCharges?.toll > 0 && (
          <div className="flex justify-between mb-2">
            <span>Toll Charge</span>
            <span>Rs. {additionalCharges.toll}</span>
          </div>
        )}
        {additionalCharges?.permit > 0 && (
          <div className="flex justify-between mb-2">
            <span>Permit Charge</span>
            <span>Rs. {additionalCharges.permit}</span>
          </div>
        )}
        {additionalCharges?.parking > 0 && (
          <div className="flex justify-between mb-2">
            <span>Parking Charge</span>
            <span>Rs. {additionalCharges.parking}</span>
          </div>
        )}
        {additionalCharges?.hill > 0 && (
          <div className="flex justify-between mb-2">
            <span>Hill Station Charge</span>
            <span>Rs. {additionalCharges.hill}</span>
          </div>
        )}

        {bookingDetails?.finalFareBreakdown?.extraKm?.kilometers !== 0 && (
          <div className="flex justify-between mb-2">
            <div>
              <p className="font-bold">Extra distance Fee</p>
              <span>{bookingDetails?.finalFareBreakdown?.extraKm?.kilometers || 0} km extra distance</span>
            </div>
            <span className="font-bold">Rs. {bookingDetails?.finalFareBreakdown?.extraKm?.charge || 0}</span>
          </div>
        )}
        {bookingDetails?.paymentDetails?.details?.gstAmount > 0 && (
        <div className="flex justify-between mb-2">
          <div>
            <p className="font-bold">
              Taxes {bookingDetails?.paymentDetails?.details?.gstPercentage ? `(${bookingDetails?.paymentDetails?.details?.gstPercentage}% GST)` : "(GST)"}
            </p>
            <span>Government Taxes</span>
          </div>
          <span className="font-bold">Rs. {(payment.gstAmount || 0).toFixed(2)}</span>
        </div>
        )}

        <hr className="my-4" />

        <div className="flex justify-between text-xl font-bold text-blue-800">
          <span>Total Paid</span>
          <span>Rs. {finalAmountAfterExtras}</span>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Thank you for riding with us!
        </p>
      </div>
    </div>
  );
};

export default ReceiptPDFLayout;
