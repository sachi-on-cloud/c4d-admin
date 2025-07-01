import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Button } from '@material-tailwind/react';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import { VERSION_CONTROL_EDIT } from '@/utils/validations';

const VersionControlEdit = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const initialValues = {
    name: state?.name || '',
    applicationFor: state?.applicationFor || '',
    latestVersion: state?.latestVersion || '',
  };

  

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const requestBody = {
        name: values.name,
        applicationFor: values.applicationFor,
        latestVersion: values.latestVersion,
      };

      // console.log('Sending POST request:', requestBody);

      await ApiRequestUtils.update(API_ROUTES.PUT_VERSIONCONTROL, requestBody);

      // console.log('Update successful');
      navigate('/dashboard/user/versionControlList');
    } catch (error) {
      console.error('POST update failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 mx-auto">
      <div className="max-w-8xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Edit Version</h2>

        <Formik
          initialValues={initialValues}
          validationSchema={VERSION_CONTROL_EDIT}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, isValid }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <Field
                    name="name"
                    type="text"
                    className="p-2 w-full rounded-md border-gray-300 shadow-sm"
                  />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Application For</label>
                  <Field
                    name="applicationFor"
                    as="select"
                    className="p-2 w-full rounded-md border border-gray-300"
                  >
                    <option value="">-- Select --</option>
                    <option value="DRIVER">DRIVER</option>
                    <option value="CUSTOMER">CUSTOMER</option>
                  </Field>
                  <ErrorMessage name="applicationFor" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Latest Version</label>
                  <Field
                    name="latestVersion"
                    type="text"
                    placeholder="Eg: 2.0.0"
                    className="p-2 w-full rounded-md border border-gray-300 shadow-sm"
                  />
                  <ErrorMessage name="latestVersion" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              <div className="flex flex-row">
                <Button
                  fullWidth
                  type="button"
                  onClick={() => navigate('/dashboard/user/versionControlList')}
                  className="my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  color="black"
                  className="my-6 mx-2"
                >
                  Update
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default VersionControlEdit;
