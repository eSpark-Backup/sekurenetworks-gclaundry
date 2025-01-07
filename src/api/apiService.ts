import { IEnviromentalMessage } from "@/types/IEnviromentalMessage";
import axiosService from "@/utils/axios";
import { encodeQueryData } from "@/utils/commonFunctions";

export class ApiService {
    kisok = {
        getKiosks: (query: Object) => axiosService.get(`/kiosk?${encodeQueryData(query)}`),
        getKiosk: (macId: string) => axiosService.get(`/kiosk/${macId}`),
        update: (macId: string,body:any) => axiosService.patch(`/kiosk/${macId}`,body),
        delete: (macId: string) => axiosService.delete(`/kiosk/${macId}`),
        assignToKiosk: (body:any) => axiosService.post(`/kiosk/assign`,body),
        unassignToKiosk: (body:any) => axiosService.post(`/kiosk/unassign`,body),
        unAssignItem: (id:any) => axiosService.delete(`/kiosk/unassign/${id}`),
    };

    quotes = {
        get: (macId: string) => axiosService.get<IEnviromentalMessage[]>(`/quotes/${macId}`),
        getAll: () => axiosService.get<IEnviromentalMessage[]>(`/quotes/all`),
        create: (body:any) => axiosService.post(`/quotes/`,body),
        createGeneral: (body:any) => axiosService.post(`/quotes/create-general`,body),
        update: (id: string,body:any) => axiosService.patch(`/quotes/${id}`,body),
        delete: (id: string) => axiosService.delete(`/quotes/${id}`),
    };

    customer = {
        create: (body:any) => axiosService.post(`/customers`,body),
        get: (query: Object) => axiosService.get(`/customers?${encodeQueryData(query)}`),
        update: (id: string,body:any) => axiosService.patch(`/customers/${id}`,body),
        getById: (id: string) => axiosService.get(`/customers/${id}`),
        delete: (id: string) => axiosService.delete(`/customers/${id}`),
    };

    user = {
        create: (body:any) => axiosService.post(`/clients`,body),
        get: (query: Object) => axiosService.get(`/clients?${encodeQueryData(query)}`),
        update: (id: string,body:any) => axiosService.patch(`/clients/${id}`,body),
        getById: (id: string) => axiosService.get(`/clients/${id}`),
        delete: (id: string) => axiosService.delete(`/clients/${id}`),
    };

    dashboard = {
        get:()=> axiosService.get('/report'),
        getReports: (query: Object) => axiosService.get(`/report/analytics?${encodeQueryData(query)}`),
        getReportdetails: (query: Object) => axiosService.get(`/report/analytics-detail?${encodeQueryData(query)}`),
    }
}

export default new ApiService();