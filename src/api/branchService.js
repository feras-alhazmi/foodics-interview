
import axios from "axios";

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;
const BEARER_TOKEN = process.env.VUE_APP_API_TOKEN;



const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${BEARER_TOKEN}`,
    Accept: "application/json",
  },
});

export const fetchBranches = async () => {
    console.log(BEARER_TOKEN)
  const response = await api.get("/branches?include[]=sections&include[]=sections.tables");
  return response.data.data;
};

export const updateBranchReservationStatus = async (branchId, status) => {
  await api.put(`/branches/${branchId}`, { accepts_reservations: status });
};

export const updateTableReservationStatus = async (tableId, status) => {
  await api.put(`/tables/${tableId}`, { accepts_reservations: status });
};

export const updateBranchSettings = async (branchId, settings) => {
  await api.put(`/branches/${branchId}`, settings);
};
