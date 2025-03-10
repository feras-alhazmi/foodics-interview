<template>
    <div>
        <!-- Header + Add Branches + Disable All Reservations Buttons -->
        <div class="flex bg-white px-10 py-6 mb-6 items-center justify-between rounded-lg">
            <h2 class="text-2xl font-bold">Reservations</h2>
            <button @click="disableAllReservations" class="bg-purple-800 text-white px-4 py-2 rounded shadow">
                Disable All Reservations
            </button>
        </div>

        <!-- Local Loading & Error States -->


        <div v-if="getError" class="text-red-500 mb-4">Error: {{ getError.message }}</div>
        <div v-else-if="!isLocalLoading && !branches.length" class="text-gray-600">
            No branches found.
        </div>

        <!-- Branches Table -->
        <div class="m-12 pb-6 rounded-lg  bg-white min-h-[70vh] ">
            <div class="flex justify-end">
                <button @click="showAddBranchesPopup = true"
                    class="text-gray-600 border border-gray-300 px-4 py-2 rounded-lg shadow m-4">
                    Add Branches
                </button>
            </div>
            <div v-if="isLocalLoading" class="m-28">
                <LoadingSpinner :size="60" />
            </div>
            <table v-if="!isLocalLoading && branches.length" class="min-w-full bg-white border-collapse">
                <thead class="border-y">
                    <tr class="text-left text-gray-700">
                        <th class="p-3 font-semibold">Branch</th>
                        <th class="p-3 font-semibold">Reference</th>
                        <th class="p-3 font-semibold">Number of Tables</th>
                        <th class="p-3 font-semibold">Reservation Duration</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="branch in branches" :key="branch.id" class="hover:bg-gray-50 cursor-pointer"
                        @click="openBranchSettings(branch)">
                        <td class="py-3 px-4 border-t">{{ branch.name }}</td>
                        <td class="py-3 px-4 border-t">{{ branch.reference }}</td>
                        <td class="py-3 px-4 border-t">{{ countReservationTables(branch) }}</td>
                        <td class="py-3 px-4 border-t">
                            {{ branch.reservation_duration || 'Not Set' }} min
                        </td>
                    </tr>
                </tbody>
            </table>

        </div>

        <!-- Add Branches Popup -->
        <add-branches-popup v-if="showAddBranchesPopup" @close="showAddBranchesPopup = false" />

        <!-- Branch Settings Popup -->
        <branch-settings-popup v-if="selectedBranch" :branch="selectedBranch" @close="selectedBranch = null" />
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AddBranchesPopup from "./AddBranchesPopup.vue";
import BranchSettingsPopup from "./BranchSettings/BranchSettingsPopup.vue";
import LoadingSpinner from "./LoadingSpinner.vue";

export default {
    name: "BranchList",
    components: {
        AddBranchesPopup,
        BranchSettingsPopup,
        LoadingSpinner
    },
    data() {
        return {
            showAddBranchesPopup: false,
            selectedBranch: null,
            isLocalLoading: true,
        };
    },
    computed: {
        ...mapGetters(["getBranches", "getError"]),
        branches() {
            return this.getBranches;
        },
    },
    methods: {
        ...mapActions(["fetchBranches", "disableAllReservations"]),
        openBranchSettings(branch) {
            this.selectedBranch = branch;
        },
        countReservationTables(branch) {
            let count = 0;
            if (branch.sections) {
                branch.sections.forEach((section) => {
                    if (section.tables) {
                        section.tables.forEach((table) => {
                            if (table.accepts_reservations) {
                                count++;
                            }
                        });
                    }
                });
            }
            return count;
        },
    },
    created() {
        this.fetchBranches()
            .then(() => {
                this.isLocalLoading = false;
            })
            .catch(() => {
                this.isLocalLoading = false;
            });
    },
};
</script>

<style scoped></style>