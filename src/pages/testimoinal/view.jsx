import React, { useEffect, useState } from 'react';
import {
  Card, CardHeader, CardBody, Typography, Button, Spinner,
  Switch,
} from '@material-tailwind/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import moment from "moment";

const TestimonialView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [testimonialList, setTestimonialList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingtestimonialId, setUpdateTestimonialid] = useState(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await ApiRequestUtils.get(API_ROUTES.GET_TESTIMOINAL);
        let list = res?.data || [];

        const updated = location.state?.updatedTestimonial;
        if (updated) {
          list = list.map((item) => (item.id === updated.id ? updated : item));
        }

        setTestimonialList(list);
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
        setTestimonialList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [location.state]);

   const handleStatusToggle = async (testimonialId, newStatus) => {
      try {
        setLoading(true);
        setUpdateTestimonialid(testimonialId);
       
  
        const res = await ApiRequestUtils.update(API_ROUTES.UPDATE_TESTIMONIAL, {
          testimonialId: testimonialId,
          status: newStatus,
        });
       
  
      setTestimonialList((prevList) =>
          prevList.map((item) =>
            item.id === testimonialId ? { ...item, status: newStatus } : item
          )
        );
      } catch (err) {
        console.error('Failed to update banner status:', err);
      } finally {
        setUpdateTestimonialid(null);
        setLoading(false);
      }
    };

  return (
    <div className="mb-8 flex flex-col gap-12">
      <div className="flex items-center justify-end">
        <button
          onClick={() => navigate('/dashboard/user/testimonial/add')}
          className="ml-4 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-700"
        >
          Add New
        </button>
      </div>

      <Card>
  <CardHeader className="mb-8 p-6 flex justify-between items-center bg-primary">
          <Typography variant="h6" color="white">Testimonial List</Typography>
        </CardHeader>

        <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Spinner className="h-10 w-10 mb-2" />
            </div>
          ) : (
            <table className="w-full  table-auto">
              <thead>
                <tr>
                  <th className="py-3 px-5 text-left">Name</th>
                  <th className="py-3 px-5 text-left">Number of Rides</th>
                  <th className="py-3 px-5 text-left">Rating</th>
                  <th className="py-3 px-5 text-left">Message</th>
                  <th className="py-3 px-5 text-left">Status</th>
                  <th className='py-3 px-5 text-left'>Created Date</th>
                
                </tr>
              </thead>
              <tbody>
                {testimonialList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">No Testimonials Found</td>
                  </tr>
                ) : (
                  testimonialList.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-5">{item.name}</td>
                      <td className="py-3 px-5">{item.subname || '-'}</td>
                      <td className="py-3 px-5">{item.rating}</td>
                      <td className="py-3 px-5">{item.message}</td>
                     
                      <td className="py-3 px-5">
                           <Switch
                             color="blue"
                             checked={item.status}
                             onChange={() => handleStatusToggle(item.id, !item.status)}
                             disabled={updatingtestimonialId === item.id}
                             label={item.status ? 'Active' : 'Inactive'}/>
                                              
                      </td>                   
                      <td className="py-3 px-5">{moment(item.created_at).format("DD-MM-YYYY")}</td>              
                     
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default TestimonialView;
