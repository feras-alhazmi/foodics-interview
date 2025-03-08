<template>
    <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-5">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl h-[90%] flex flex-col">
            <!-- Fixed Header -->
            <BranchSettingsHeader :branch="branch" />

            <!-- Scrollable Content -->
            <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">

                <div class="mb-4 text-blue-500 border-y border-blue-400 bg-blue-100 p-3">

                    Branch working hours are 00:00 - 00:00


                </div>
                <!-- Reservation Duration -->

                <div class="mb-4">
                    <label class="block text-gray-700 mb-1">
                        Reservation Duration (minutes)
                    </label>
                    <input type="number" v-model="localDuration" min="1" class="border rounded w-full p-2" required />
                </div>

                <!-- Select for Tables -->
                <div class="mb-4">
                    <label class="block text-gray-700 mb-1 font-semibold">
                        Tables
                    </label>
                    <p class="text-sm text-gray-500 mb-2">
                        Select which tables can be reserved in this branch.
                    </p>
                    <foodics-select v-model="selectedTables" :options="tableOptions" :multiple="true"
                        labelKey="displayName" valueKey="id" placeholder="Select tables" />
                </div>

                <!-- Reservation Time Slots -->
                <ReservationTimeSlots :daysOfWeek="daysOfWeek" :reservationTimes="reservationTimes"
                    @applySaturday="applySaturdayToAll" @addSlot="addTimeSlot" @removeSlot="removeTimeSlot"
                    @applySlotText="applySlotText" />
            </div>

            <!-- Fixed Footer -->
            <BranchSettingsFooter @close="closePopup" @save="saveSettings" @disable="disableReservations" />
        </div>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import BranchSettingsHeader from "./BranchSettingsHeader.vue";
import ReservationTimeSlots from "./ReservationTimeSlots.vue";
import BranchSettingsFooter from "./BranchSettingsFooter.vue";
import FoodicsSelect from "@/components/FoodicsSelect.vue";

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
        };
    },
    computed: {
        tableOptions() {
            if (!this.branch.sections) return [];
            const result = [];
            this.branch.sections.forEach((sec) => {
                if (sec.tables) {
                    sec.tables.forEach((tbl) => {
                        if (tbl.accepts_reservations === false) {
                            result.push({
                                id: tbl.id,
                                displayName: `${sec.name} - ${tbl.name}`,
                                accepts_reservations: tbl.accepts_reservations,
                            });
                        }
                    });
                }
            });
            return result;
        },
    },
    methods: {
        ...mapActions([
            "updateBranchSettings",
            "updateBranchReservationStatus"
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
            // Trim input and match "HH:MM - HH:MM"
            const text = slot.text.trim();
            const match = text.match(/^(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})$/);
            if (!match) {
                alert("Please use 'HH:MM - HH:MM' format (e.g. 00:00 - 23:59).");
                return;
            }
            let [, sH, sM, eH, eM] = match;
            [sH, sM, eH, eM] = [sH, sM, eH, eM].map(Number);
            const pad = (num) => String(num).padStart(2, "0");
            const toMinutes = (hours, mins) => hours * 60 + mins;
            if (sH < 0 || sH > 23 || sM < 0 || sM > 59) {
                alert("Start time must be between 00:00 and 23:59.");
                return;
            }
            if (eH < 0 || eH > 24 || eM < 0 || eM > 59) {
                alert("End time must be between 00:00 and 24:00 (minutes up to 59 only if < 24h).");
                return;
            }
            if (eH === 24 && eM !== 0) {
                alert("24:00 is only valid if minutes are '00'.");
                return;
            }
            const startTotal = toMinutes(sH, sM);
            const endTotal = toMinutes(eH, eM);
            if (startTotal >= endTotal) {
                alert("Start time must be strictly earlier than end time.");
                return;
            }
            // Check for overlaps in the day's slots
            const slots = this.reservationTimes[day];
            for (let i = 0; i < slots.length; i++) {
                if (i === index) continue;
                const existingSlot = slots[i];
                if (
                    (existingSlot.start <= `${pad(sH)}:${pad(sM)}` &&
                        existingSlot.end >= `${pad(sH)}:${pad(sM)}`) ||
                    (existingSlot.start <= `${pad(eH)}:${pad(eM)}` &&
                        existingSlot.end >= `${pad(eH)}:${pad(eM)}`)
                ) {
                    alert("Time slot overlaps with another existing slot. Please try again.");
                    return;
                }
            }
            slot.start = `${pad(sH)}:${pad(sM)}`;
            slot.end = `${pad(eH)}:${pad(eM)}`;
            slot.isEditing = false;
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
                const finalTimes = {};
                this.daysOfWeek.forEach((day) => {
                    finalTimes[day] = this.reservationTimes[day].map((slot) => [slot.start, slot.end]);
                });
                const payload = {
                    reservation_duration: parseInt(this.localDuration, 10),
                    reservation_times: finalTimes,
                };
                await this.updateBranchSettings({
                    branchId: this.branch.id,
                    settings: payload,
                });
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

<style scoped>
/* Add any shared styles here */
</style>