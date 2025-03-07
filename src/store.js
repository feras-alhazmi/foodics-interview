import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

Vue.use(Vuex);

const API_BASE_URL = "/api"; // Or "/api" if using devServer proxy
const BEARER_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4Zjc4NjY2NC0wMDg4LTRhMDMtYmFkMi0zOTQ5OGRjNTViYjMiLCJqdGkiOiJiMjgzOGY4NmMyMjQ3NGMzMmJlMTJjY2JiZGZkYzU5YjEzODUyNzkxNGQyMWVhNWU4OTVjYjkxODQ0ZWZiM2YwNzQ0NjJlYzU3NGIwZDUxNyIsImlhdCI6MTczNzk3NDIwMC4zMzU0MjYsIm5iZiI6MTczNzk3NDIwMC4zMzU0MjYsImV4cCI6MTg5NTc0MDYwMC4yODM5ODYsInN1YiI6IjllMTE1ZDRkLTQ4YzMtNGM0YS1iYTAzLWMxMTFkNWYwZjAyYSIsInNjb3BlcyI6W10sImJ1c2luZXNzIjoiOTdhNTcxNDYtZTBhZC00ZGQ5LWE1NGUtNDk3YTIyY2I2Yzc1IiwicmVmZXJlbmNlIjoiMjg3NDM1In0.hU5wB_6dwzTf4eo-LBUE9TK6B5cuuMMlJfAI1QTJwCJwz1G67kAGP_E_hfkn7Tl0Hz6qG-Yrdd_esYIg_PkLCe1uL1Ejwptk-1QFzHhE0Dz0Fz-hQGW1MIr2FeKorQZvCSOQpBfnCpr1qEnMw1YYNFusGJc4R8Yh59cRjWCvFCID1tzIfA7ZnkSBBLJKeHvy7SuQUXN37rz6TQQyqNsXV9jVaOt0QTg6KE-rcGGxLK49IoBVzuRohg1NGQD_S01BV7UyFJq_mNCjlthQUxV3rH0c0BEgIPODYgJyIX3tLlaccGNbrLxH_TK-bKKL53YzdXfrze6OCsEvZlKITQlb-NjC0RJD3jlwLpeze3ubNXKETUz3GiR2CeyndIYwANzV5tAdUucmc8mMspYwSGDXwsqbDHpE9VLz9p_XdHnLIQ3IT9hroyAX9Fuhce6b_J3iZtmMvSaEwLJk2ubEZzHRm2KFndQQ6AiacxbX6BncfgaNXqeYM59gk91Q1kn7SA2AEo8ta0fubmA5TZ_rqBmRjj90-xom1fJFAir8vsw3Vp0AZksf8CogGUkb7tchhnK-b1gjpwLG5EUtZvwvy9FA7t16HNScveaSbLWMTT-6cItQnEe1wXAkw9zf4HkicjOCYB6iqdWXNS22qnUweFyNS7iVwOknCcIRBclUWY6kNro"; // Replace with actual token

export default new Vuex.Store({
  state: {
    branches: [],       // Branches that accept reservations
    allBranches: [],    // All branches (including those not accepting reservations)
    loading: false,
    error: null,
  },
  mutations: {
    SET_BRANCHES(state, branches) {
      state.branches = branches;
    },
    SET_ALL_BRANCHES(state, branches) {
      state.allBranches = branches;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    async fetchBranches({ commit }) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const response = await axios.get(`${API_BASE_URL}/branches?include[]=sections&include[]=sections.tables`, {
          headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
            Accept: "application/json",
          },
        });
        const data = response.data.data;
    
        
        // Save all branches
        commit("SET_ALL_BRANCHES", data);
        // Filter only branches that accept reservations
        commit("SET_BRANCHES", data.filter((b) => b.accepts_reservations));
      } catch (error) {
        commit("SET_ERROR", error);
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async updateBranchReservationStatus({ dispatch }, { branchId, status }) {
      // Toggle accepts_reservations on a single branch
      try {
        await axios.put(
          `${API_BASE_URL}/branches/${branchId}`,
          { accepts_reservations: status },
          {
            headers: {
              Authorization: `Bearer ${BEARER_TOKEN}`,
              Accept: "application/json",
            }
          }
        );
        // Re-fetch after updating
        dispatch("fetchBranches");
      } catch (err) {
        console.error("Error updating branch reservation status:", err);
      }
    },

    async disableAllReservations({ state, dispatch }) {
      // Set accepts_reservations = false for all current branches
      try {
        for (const branch of state.branches) {
          await axios.put(
            `${API_BASE_URL}/branches/${branch.id}`,
            { accepts_reservations: false },
            {
              headers: {
                Authorization: `Bearer ${BEARER_TOKEN}`,
                Accept: "application/json",
              }
            }
          );
        }
        // Re-fetch to see changes
        dispatch("fetchBranches");
      } catch (err) {
        console.error("Error disabling all reservations:", err);
      }
    },

    async updateBranchSettings({ dispatch }, { branchId, settings }) {
      // Example: updating reservation_duration, reservation_times, etc.
      try {
        await axios.put(`${API_BASE_URL}/branches/${branchId}`, settings, {
          headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
            Accept: "application/json",
          },
        });
        dispatch("fetchBranches");
      } catch (err) {
        console.error("Error updating branch settings:", err);
      }
    },
  },
  getters: {
    getBranches: (state) => state.branches,
    getAllBranches: (state) => state.allBranches,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
  },
});
