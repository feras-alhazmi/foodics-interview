<template>
    <div>
        <!-- Header + Add Branches + Disable All Reservations Buttons -->
        <div class="flex bg-white px-10 py-6 mb-6 items-center justify-between  rounded-lg">
            <h2 class="text-2xl font-bold">Reservations</h2>
            <button @click="disableAllReservations" class="bg-purple-800 text-white px-4 py-2 rounded shadow ">
                Disable All Reservations
            </button>
        </div>


        <!-- Loading & Error States -->
        <div v-if="isLoading" class="text-gray-600">Loading branches...</div>
        <div v-if="getError" class="text-red-500 mb-4">Error: {{ getError.message }}</div>
        <div v-else-if="!isLoading && !branches.length" class="text-gray-600">
            No branches found.
        </div>

        <!-- Branches Table -->



        <div class="m-12  bg-white rounded-lg  ">
            <div class="flex justify-end">
                <button @click="showAddBranchesPopup = true"
                    class=" text-gray-600 border border-gray-300 px-4 py-2 rounded-lg shadow m-4">
                    Add Branches
                </button>
            </div>
            <table v-if="!isLoading && branches.length" class=" min-w-full bg-white ">


                <thead class=" border border-y-1 border-x-0 border-gray-200">
                    <tr class="bg-white  text-gray-700">
                        <th class=" p-3 ">Name</th>
                        <th>Reference</th>
                        <th># Reservation Tables</th>
                        <th>Reservation Duration</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="branch in branches" :key="branch.id" class="hover:bg-gray-50 cursor-pointer"
                        @click="openBranchSettings(branch)">
                        <td class="py-2 px-4 border">{{ branch.name }}</td>
                        <td class="py-2 px-4 border">{{ branch.reference }}</td>
                        <td class="py-2 px-4 border">{{ countReservationTables(branch) }}</td>
                        <td class="py-2 px-4 border">
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
import BranchSettingsPopup from "./BranchSettingsPopup.vue";

export default {
    name: "BranchList",
    components: {
        AddBranchesPopup,
        BranchSettingsPopup,
    },
    data() {
        return {
            showAddBranchesPopup: false,
            selectedBranch: null,
        };
    },
    computed: {
        ...mapGetters(["getBranches", "isLoading", "getError"]),
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
        this.fetchBranches();
    },
};
</script>

<style scoped></style>
