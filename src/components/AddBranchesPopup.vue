<template>
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div class="bg-white w-96 rounded-lg shadow-lg  relative">


            <h2 class="text-xl font-bold border-b p-4 mb-4">Add Branches</h2>

            <!-- Loading & Error -->
            <div v-if="loading" class="text-gray-600">Loading branches...</div>
            <div v-if="getError" class="text-red-500 mb-4">{{ getError.message }}</div>

            <!-- ProfessionalSelect to pick branches that do NOT accept reservations -->
            <div v-if="!loading && hasBranches" class="mb-4 px-6">
                <label class="block text-gray-700 mb-2">Branches</label>
                <foodics-select v-model="selectedBranches" :options="branchOptions" :multiple="true"
                    labelKey="displayName" valueKey="id" placeholder="Select branches to enable" />
            </div>
            <div v-else-if="!loading && !hasBranches" class="mb-4 text-gray-600">
                No branches available to enable.
            </div>

            <!-- Action Buttons -->
            <div class=" py-4 px-4 border-t flex space-x-2 justify-end ">

                <button class="border border-gray-300 px-4 py-2 rounded-lg " @click="$emit('close')">
                    Close
                </button>
                <button class="bg-purple-800 text-white px-4 py-2 rounded-lg " @click="enableSelectedBranches">
                    Save
                </button>

            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import FoodicsSelect from "@/components/FoodicsSelect.vue";

export default {
    name: "AddBranchesPopup",
    components: {
        FoodicsSelect,
    },
    data() {
        return {
            selectedBranches: [], // holds the user’s selection
        };
    },
    computed: {
        ...mapGetters(["getAllBranches", "isLoading", "getError"]),
        loading() {
            return this.isLoading;
        },
        // Filter out only those branches where accepts_reservations = false
        filteredBranches() {
            return this.getAllBranches.filter((b) => b.accepts_reservations === false);
        },
        // Convert those branches into { id, displayName } for ProfessionalSelect
        branchOptions() {
            return this.filteredBranches.map((b) => ({
                id: b.id,
                // Combine name + reference for a professional display
                displayName: `${b.name} ${b.reference ? `(${b.reference})` : ''}`,
            }));
        },
        hasBranches() {
            return this.branchOptions.length > 0;
        },
    },
    methods: {
        ...mapActions(["fetchBranches", "updateBranchReservationStatus"]),
        async enableSelectedBranches() {
            if (!this.selectedBranches.length) {
                this.$emit("close");
                return;
            }
            try {
                // Enable reservations for each selected branch
                for (const branchObj of this.selectedBranches) {
                    await this.updateBranchReservationStatus({
                        branchId: branchObj.id,
                        status: true,
                    });
                }
                this.$emit("close");
            } catch (error) {
                console.error("Error enabling reservations:", error);
            }
        },
    },
    created() {
        // Fetch all branches so we can filter them
        this.fetchBranches();
    },
};
</script>

<style scoped></style>