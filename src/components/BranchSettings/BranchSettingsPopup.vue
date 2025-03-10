<template>
    <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-5">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl h-[90%] flex flex-col">
            <!-- Fixed Header -->
            <BranchSettingsHeader :branch="branch" />

            <!-- Scrollable Content -->
            <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">

                <div class="mb-4 text-blue-500 border-y border-blue-400 bg-blue-100 p-3">

                    Branch working hours are {{ branch.opening_from }} to {{ branch.opening_to }}


                </div>
                <!-- Reservation Duration -->

                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">
                        Reservation Duration (minutes)
                    </label>
                    <input type="number" v-model="localDuration" min="30" class="border rounded w-full p-2" required />
                </div>

                <!-- Select for Tables -->
                <div v-if="tableOptions.length > 0" class="mb-4">
                    <label class="block text-gray-700 mb-2 font-semibold">
                        Tables
                    </label>

                    <foodics-select v-model="selectedTables" :options="tableOptions" :multiple="true"
                        labelKey="displayName" valueKey="id" placeholder="Select tables" />
                </div>

                <!-- Reservation Time Slots -->
                <ReservationTimeSlots :daysOfWeek="daysOfWeek" :reservationTimes="reservationTimes"
                    @applySaturday="applySaturdayToAll" @addSlot="addTimeSlot" @removeSlot="removeTimeSlot"
                    @applySlotText="applySlotText" />
            </div>

            <!-- Fixed Footer -->
            <BranchSettingsFooter :isSubmitting="isSaving" @close="closePopup" @save="saveSettings"
                @disable="disableReservations" />
        </div>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import BranchSettingsHeader from "./BranchSettingsHeader.vue";
import ReservationTimeSlots from "./ReservationTimeSlots.vue";
import BranchSettingsFooter from "./BranchSettingsFooter.vue";
import FoodicsSelect from "@/components/FoodicsSelect.vue";
import { applySlotTextUtil } from "@/utils/timeSlotUtils";

export default {
    name: "BranchSettingsPopup",
    components: {
        BranchSettingsHeader,
        ReservationTimeSlots,
        BranchSettingsFooter,
        FoodicsSelect,
    },
    props: {
        branch: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            localDuration: this.branch.reservation_duration || 120,
            daysOfWeek: [
                "saturday",
                "sunday",
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
            ],
            reservationTimes: this.cloneTimes(this.branch.reservation_times || {}),
            selectedTables: this.getSelectedTables(),
            isSaving: false
        };
    },
    computed: {
        tableOptions() {
            if (!this.branch.sections) return [];
            const result = [];
            this.branch.sections.forEach((sec) => {
                if (sec.tables) {
                    sec.tables.forEach((tbl) => {
                        result.push({
                            id: tbl.id,
                            displayName: `${sec.name} - ${tbl.name}`,
                            accepts_reservations: tbl.accepts_reservations,
                        });
                    });
                }
            });
            return result;
        },
    },
    methods: {
        ...mapActions([
            "updateBranchSettings",
            "updateBranchReservationStatus",
            "updateTableReservationStatus"
        ]),
        cloneTimes(times) {
            const days = [
                "saturday",
                "sunday",
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
            ];
            const result = {};
            days.forEach((day) => {
                const slots = times[day] || [];
                result[day] = slots.map((slot) => ({
                    start: slot[0] || "00:00",
                    end: slot[1] || "00:00",
                    isEditing: false,
                    text: `${slot[0] || "00:00"} - ${slot[1] || "00:00"}`,
                }));
            });
            return result;
        },
        getSelectedTables() {
            if (!this.branch.sections) return [];
            const selected = [];
            this.branch.sections.forEach((sec) => {
                if (sec.tables) {
                    sec.tables.forEach((tbl) => {
                        if (tbl.accepts_reservations === true) {
                            selected.push({
                                id: tbl.id,
                                displayName: `${sec.name} - ${tbl.name}`,
                                accepts_reservations: tbl.accepts_reservations,
                            });
                        }
                    });
                }
            });
            return selected;
        },
        addTimeSlot(day) {
            if (this.reservationTimes[day].length < 3) {
                this.reservationTimes[day].push({
                    start: "00:00",
                    end: "00:00",
                    isEditing: true,
                    text: "00:00 - 00:00",
                });
            }
        },
        removeTimeSlot({ day, index }) {
            this.reservationTimes[day].splice(index, 1);
        },
        applySlotText({ slot, day, index }) {

            // Pass necessary parameters from the component state.
            const slots = this.reservationTimes[day];
            const success = applySlotTextUtil({
                slot,
                day,
                index,
                branch: this.branch,
                slots,
            });

            return success;

        },
        applySaturdayToAll() {
            const saturdaySlots = this.reservationTimes.saturday.map((slot) => ({
                start: slot.start,
                end: slot.end,
                isEditing: false,
                text: slot.text,
            }));
            this.daysOfWeek.forEach((day) => {
                if (day !== "saturday") {
                    // Deep clone to avoid reference issues
                    this.reservationTimes[day] = JSON.parse(JSON.stringify(saturdaySlots));
                }
            });
        },
        async disableReservations() {
            try {
                await this.updateBranchReservationStatus({ branchId: this.branch.id, status: false });
                this.closePopup();
            } catch (error) {
                console.error("Error disabling reservations:", error);
            }
        },
        async saveSettings() {
            try {

                // Check if any slots are still in edit mode
                const hasEditingSlots = this.daysOfWeek.some((day) =>
                    this.reservationTimes[day].some((slot) => slot.isEditing)
                );

                if (hasEditingSlots) {
                    alert("Please complete or remove all time slots before saving.");
                    return;
                }
                this.isSaving = true;
                const finalTimes = {};
                this.daysOfWeek.forEach((day) => {
                    finalTimes[day] = this.reservationTimes[day].map((slot) => [slot.start, slot.end]);
                });
                const payload = {
                    reservation_duration: parseInt(this.localDuration, 10),
                    reservation_times: finalTimes,
                };
                this.selectedTables.forEach(async (tbl) => {
                    if (tbl.accepts_reservations === false) {

                        await this.updateTableReservationStatus({ tableId: tbl.id, status: true });
                    }
                })
                for (const tbl of this.tableOptions) {
                    if (tbl.accepts_reservations === true && !this.selectedTables.some(item => item.id === tbl.id)) {
                        await this.updateTableReservationStatus({ tableId: tbl.id, status: false });
                    }
                }

                await this.updateBranchSettings({
                    branchId: this.branch.id,
                    settings: payload,
                });
                this.isSaving = false;
                this.closePopup();
            } catch (error) {
                console.error("Error saving branch settings:", error);
            }
        },
        closePopup() {
            this.$emit("close");
        },
    },
};
</script>

<style scoped></style>