import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useParams } from 'react-router-dom';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import { Button } from '@material-tailwind/react';
import moment from 'moment';
import { UserIcon } from '@heroicons/react/24/solid';

const DriverBookingNotes = ({ cabId }) => {
  const { id } = useParams();
  const [notes, setNotes] = useState([]);
  const [cab, setCab] = useState(null);

  const validationSchema = Yup.object({
    noteType: Yup.string().required('Note type is required'),
    notes: Yup.string().required('Note is required'),
  });

  const initialValues = {
    noteType: '',
    notes: '',
  };

  useEffect(() => {
    if (id) {
      fetchItem(id);
    }
  }, [id]);

  const fetchItem = async (itemId) => {
    try {
      const data = await ApiRequestUtils.get(API_ROUTES.GET_CAB_BY_ID + `${itemId}`);
      setCab(data?.data);
      setNotes(data?.data?.notes || []); 
    } catch (err) {
      console.error('Error fetching cab and notes:', err);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await ApiRequestUtils.post(API_ROUTES.ADD_NOTES_BOOKING, {
        cabId,
        noteType: values.noteType,
        notes: values.notes,
      });
      resetForm();
      fetchItem(cabId);
    } catch (error) {
      console.error('Failed to add note. Please try again.', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h2 className="text-xl font-bold mb-4">Add Notes</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label htmlFor="noteType" className="text-sm font-medium text-gray-700">
                Note Type
              </label>
              <Field
                as="select"
                name="noteType"
                className="p-2 w-full rounded-md border bg-white border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              >
                <option value="">Select Note Type</option>
                <option value="GENERAL">General</option>
                <option value="DOCUMENT">Document</option>
                <option value="TRIP">Trip</option>
                <option value="PAYMENT">Payment</option>
              </Field>
              <ErrorMessage name="noteType" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            {values.noteType && (
              <div>
                <label htmlFor="notes" className="text-sm font-medium text-gray-700">
                  Note
                </label>
                <Field
                  as="textarea"
                  name="notes"
                  rows="4"
                  className="p-2 w-full rounded-md border bg-white border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  placeholder="Enter your note here..."
                />
                <ErrorMessage name="notes" component="div" className="text-red-500 text-sm mt-1" />
              </div>
            )}

            {values.noteType && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 ${ColorStyles.addButtonColor}`}
              >
                {isSubmitting ? 'Adding...' : 'Add Note'}
              </Button>
            )}
          </Form>
        )}
      </Formik>

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Existing Notes</h2>
        <div className="flex-1">
          {notes.length === 0 ? (
            <p className="text-center text-gray-500 text-base mt-5">No notes available.</p>
          ) : (
            <ul className="space-y-3">
              {notes.map((note) => (
                <li
                  key={note?.id}
                  className="bg-white rounded-lg p-3 shadow-sm border"
                >
                  <div className="flex  items-center mb-2">
                     <UserIcon className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">
                      {note.User.name || 'Admin'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="inline-block px-2 py-2 text-xs text-white bg-primary rounded">
                      {note?.noteType || 'Note'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {moment(note?.created_at).format('DD-MM-YYYY / hh:mm A')}
                    </span>
                  </div>
                  <p className="text-base text-gray-700">{note?.notes}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverBookingNotes;
