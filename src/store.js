import Vue from "vue";
import Vuex from "vuex";
import {
  fetchBranches,
  updateBranchReservationStatus,
  updateTableReservationStatus,
  updateBranchSettings,
} from "@/api/branchService";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    branches: [],
    allBranches: [],
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
        const data = await fetchBranches();
        commit("SET_ALL_BRANCHES", data);
        commit("SET_BRANCHES", data.filter((b) => b.accepts_reservations));
      } catch (error) {
        commit("SET_ERROR", error);
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async updateBranchReservationStatus({ dispatch }, { branchId, status }) {
      try {
        await updateBranchReservationStatus(branchId, status);
        dispatch("fetchBranches");
      } catch (err) {
        console.error("Error updating branch reservation status:", err);
      }
    },

    async updateTableReservationStatus({ dispatch }, { tableId, status }) {
      try {
        await updateTableReservationStatus(tableId, status);
        dispatch("fetchBranches");
      } catch (err) {
        console.error("Error updating table reservation status:", err);
      }
    },

    async disableAllReservations({ state, dispatch }) {
      try {
        for (const branch of state.branches) {
          await updateBranchReservationStatus(branch.id, false);
        }
        dispatch("fetchBranches");
      } catch (err) {
        console.error("Error disabling all reservations:", err);
      }
    },

    async updateBranchSettings({ dispatch }, { branchId, settings }) {
      try {
        await updateBranchSettings(branchId, settings);
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
