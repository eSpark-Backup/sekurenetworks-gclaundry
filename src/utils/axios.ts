import axios from "axios";
import firebase from "firebase/compat/app";
import { toast } from "react-toastify";

const axiosServices = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});


axiosServices.interceptors.request.use(
  async function (req) {
    const token = await firebase.auth()?.currentUser?.getIdToken();
    req.headers.Authorization = `Bearer ${token}`;
    return req;
  },
  function (error) {
    console.error("interceptor error", error);
  }
);

axiosServices.interceptors.response.use(
  response => response,
  error => {
    if (error?.response?.status == 403) {
      // window.location.href = '/verify/' + storageService.get('credential')?.token;
    } else {
      toast.error(error?.response?.data?.message);
    }
    throw error;
  }
);;

export default axiosServices
