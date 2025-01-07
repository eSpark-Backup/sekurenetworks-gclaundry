import { KIOSK } from "@/types/kiosk";
import axios from "@/utils/axios";


export const getKioskData = () =>
  axios
    .get("/kiosk")
    .then((response) => response.data)
    .catch((error) => console.log("error", error));

export const getAllKioskData = () =>
  axios
    .get("/kiosk/kiosk-list")
    .then((response) => response.data)
    .catch((error) => console.log("error", error));
    

export const getKioskDataById = (id) =>
  axios
    .get(`/kiosk/${id}`)
    .then((response) => response.data)
    .catch((error) => {
      throw error.response;
    });

export const updateKioskData = (data, id) =>
  axios[id ? "patch" : "post"]("/kiosk" + (id ? "/" + id : ""), data)
    .then((response) => response.data)
    .catch((error) => console.log("error", error));

export const updateKioskStatus = (data, id) =>
  axios["patch"](`/kiosk/${id}/activate`, data)
    .then((response) => response.data)
    .catch((error) => console.log("error", error));

export const deleteKioskData = (id) =>
  axios.delete(`/kiosk/${id}`).catch((error) => console.log("error", error));

// export const getKioskQuestions = async (id) => {
//   const response = await axios.get("/questions/" + id);
//   return response;
// };


export const getKioskQuestions = async (kisokId) => {
  const response = await axios.get("/questions/" + kisokId);

  return response;
};

export const getGeneralQuestions = async () => {
  const response = await axios.get("/questions/all");

  return response;
};

export const addQuestion = async ({ data }) => {
  const response = await axios.post("/questions", data);
  return response;
};

export const addGeneralQuestion = async ({ data }) => {
  const response = await axios.post("/questions/create-general", data);
  return response;
};

export const updateQuestion = async ({ data, id }) => {
  const response = await axios.patch("/questions/" + id, data);
  return response;
};

export const deleteQuestion = async (id) => {
  const response = await axios.delete("/questions/" + id);
  return response;
};

export const unAssignQuestion = async (id) => {
  const response = await axios.delete("/kiosk/unassign/" + id);
  return response;
};

export const getKioskQuotes = async (kisokId) => {
  const response = await axios.get("/quotes/" + kisokId);

  return response;
};

export const addQuote = async ({ data }) => {
  const response = await axios.post("/quotes", data);
  return response;
};

export const updateQuote = async ({ data, id }) => {
  const response = await axios.patch("/quotes/" + id, data);
  return response;
};

export const deleteQuote = async (id) => {
  const response = await axios.delete("/quotes/" + id);
  return response;
};
