<template>
    <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-5">
        <!-- Modal Container as Flex Column -->
        <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl  h-[90%] flex flex-col">
            <!-- Fixed Header -->
            <div class=" border-b flex-shrink-0 ">
                <h2 class="text-xl  p-4 ">Edit {{ branch.name + ` ${branch.reference ? `(${branch.reference})` : ''}` }}
                    branch Reservation
                    Settings
                </h2>
            </div>

            <!-- Scrollable Content -->
            <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <!-- Reservation Duration -->
                <div class="mb-4">
                    <label class="block text-gray-700 mb-1">Reservation Duration (minutes)</label>
                    <input type="number" v-model="localDuration" min="1" class="border rounded w-full p-2" required />
                </div>

                <!-- Select for Tables -->
                <div class="mb-4">
                    <label class="block text-gray-700 mb-1 font-semibold">Tables</label>
                    <p class="text-sm text-gray-500 mb-2">
                        Select which tables can be reserved in this branch.
                    </p>
                    <foodics-select v-model="selectedTables" :options="tableOptions" :multiple="true"
                        labelKey="displayName" valueKey="id" placeholder="Select tables" />
                </div>

                <!-- Reservation Time Slots -->
                <div class="mb-4">
                    <label class="block text-gray-700 mb-1 font-semibold">Reservation Time Slots</label>
                    <p class="text-sm text-gray-500 mb-2">
                        Up to 3 time slots per day. Example: 11:00 - 17:00 &amp; 18:00 - 23:00.
                    </p>


                    <!-- Loop over each day -->
                    <div v-for="day in daysOfWeek" :key="day" class="mb-4">
                        <div class="flex justify-between items-center mb-2">

                            <h4 class="font-medium capitalize">{{ day }}</h4>
                            <button v-if="day === 'saturday'" class=" text-purple-800 " @click="applySaturdayToAll">
                                Apply to All Days
                            </button>

                        </div>

                        <!-- Display each slot -->
                        <div class="flex border mb-2 rounded p-2 justify-between items-center">
                            <div class="flex flex-wrap gap-2 items-center">
                                <div v-if="reservationTimes[day].length === 0">
                                    <p class="text-sm text-gray-500">
                                        Add Available Reservation Times
                                    </p>
                                </div>
                                <div v-for="(slot, idx) in reservationTimes[day]" :key="idx">
                                    <!-- EDIT MODE -->
                                    <div v-if="slot.isEditing"
                                        class="relative border-2 border-blue-300 rounded-md px-3 py-1 w-32">
                                        <!-- 'Remove' button in top-right corner -->
                                        <button
                                            class="absolute -top-3 -right-2 px-1 bg-white border border-gray-400 rounded-full text-sm hover:text-gray-600"
                                            @click="removeTimeSlot(day, idx)">
                                            X
                                        </button>
                                        <!-- Single Time Input -->
                                        <input type="text" v-model="slot.text" class="w-28 focus:outline-none"
                                            @keydown.enter.prevent="applySlotText(slot, reservationTimes[day])" />
                                    </div>

                                    <!-- VIEW MODE (pill style) -->
                                    <div v-else
                                        class="inline-flex items-center rounded-lg border-2 border-purple-500 px-3 py-1 cursor-pointer"
                                        @click="slot.isEditing = true">
                                        {{ slot.start }} - {{ slot.end }}
                                    </div>
                                </div>
                            </div>

                            <button class="border border-gray-300 text-gray-300 h-7 w-7 text-md rounded-lg"
                                v-if="reservationTimes[day].length < 3" @click="addTimeSlot(day)">
                                +
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Fixed Footer -->
            <div class="py-2 px-4 border-t flex-shrink-0 flex justify-between items-center">

                <button @click="disableReservations" class=" text-red-500 px-4 py-2">Disable Reservations</button>

                <div class="flex space-x-2">

                    <button class="border border-gray-300 px-4 py-2 rounded-lg " @click="$emit('close')">
                        Close
                    </button>
                    <button class="bg-purple-800 text-white px-4 py-2 rounded-lg " @click="saveSettings">
                        Save
                    </button>

                </div>
            </div>
        </div>
    </div>
</template>


<script>
import { mapActions } from "vuex";
import FoodicsSelect from "@/components/FoodicsSelect.vue";

export default {
    name: "BranchSettingsPopup",
    components: {
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
            // Convert existing [start, end] arrays to { start, end, isEditing } objects:
            reservationTimes: this.cloneTimes(this.branch.reservation_times || {}),

            // Initialize selectedTables with tables that already accept reservations
            selectedTables: (() => {
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
            })(),
        };
    },
    computed: {
        // Tables that do NOT accept reservations
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
        ...mapActions(["updateBranchSettings", "updateBranchReservationStatus"]),

        // Convert from [start, end] arrays to { start, end, isEditing } objects
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
                    text: `${slot[0]} - ${slot[1]}`,
                }));
            });
            return result;
        },
        applySlotText(slot, slots) {
            // Trim leading/trailing spaces
            const text = slot.text.trim();



            // Regex: exactly "HH:MM - HH:MM" with two digits for HH & MM
            const match = text.match(/^(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})$/);
            if (!match) {
                alert("Please use 'HH:MM - HH:MM' format (e.g. 00:00 - 23:59).");
                return;
            }

            let [, sH, sM, eH, eM] = match;

            [sH, sM, eH, eM] = [sH, sM, eH, eM].map(Number);

            // Helper for zero-padding to "HH:MM"
            const pad = (num) => String(num).padStart(2, "0");
            // Helper to convert hours & minutes to total minutes from 00:00
            const toMinutes = (hours, mins) => hours * 60 + mins;

            // Validate start time range (only 0..23 hours; 0..59 minutes)
            if (sH < 0 || sH > 23 || sM < 0 || sM > 59) {
                alert("Start time must be between 00:00 and 23:59.");
                return;
            }

            // Validate end time range:
            if (eH < 0 || eH > 24 || eM < 0 || eM > 59) {
                alert("End time must be between 00:00 and 24:00 (minutes up to 59 only if < 24h).");
                return;
            }
            if (eH === 24 && eM !== 0) {
                alert("24:00 is only valid if minutes are '00'.");
                return;
            }

            // Ensure start < end (no same-time or reversed times)
            const startTotal = toMinutes(sH, sM);
            const endTotal = toMinutes(eH, eM);


            if (startTotal >= endTotal) {
                alert("Start time must be strictly earlier than end time.");
                return;
            }

            // If everything is valid, update the slot (zero-padded)
            slot.start = `${pad(sH)}:${pad(sM)}`;
            slot.end = `${pad(eH)}:${pad(eM)}`;

            // check the slot does not intersect with any existing slots
            for (let i = 0; i < slots.length; i++) {
                const existingSlot = slots[i];
                if (existingSlot !== slot) {
                    const existingStart = existingSlot.start;
                    const existingEnd = existingSlot.end;
                    if (
                        (existingStart <= slot.start && existingEnd >= slot.start) ||
                        (existingStart <= slot.end && existingEnd >= slot.end)
                    ) {
                        alert("Time slot overlaps with another existing slot. Please try again.");
                        return;
                    }
                }
            }

            slot.isEditing = false;
        },
        async disableReservations() {
            try {

                await this.updateBranchReservationStatus({ branchId: this.branch.id, status: false });
                this.$emit("close");
            } catch (error) {
                console.error("Error disabling reservations:", error);
            }
        }
        ,
        addTimeSlot(day) {
            if (this.reservationTimes[day].length < 3) {
                // Start in edit mode with default times
                this.reservationTimes[day].push({
                    start: "00:00",
                    end: "00:00",
                    isEditing: true,
                    text: "00:00 - 00:00",
                });
            }
        },

        removeTimeSlot(day, index) {
            this.reservationTimes[day].splice(index, 1);
        },

        applySaturdayToAll() {
            // Copy Saturday slots (reset isEditing to false for each)
            const saturdaySlots = this.reservationTimes.saturday.map((slot) => ({
                start: slot.start,
                end: slot.end,
                isEditing: false,
            }));

            this.daysOfWeek.forEach((day) => {
                if (day !== "saturday") {
                    // Deep clone to avoid reference issues
                    this.reservationTimes[day] = JSON.parse(
                        JSON.stringify(saturdaySlots)
                    );
                }
            });
        },

        async saveSettings() {
            try {
                // Convert each day's slots from { start, end, isEditing } back to [start, end]
                const finalTimes = {};
                this.daysOfWeek.forEach((day) => {
                    finalTimes[day] = this.reservationTimes[day].map((slot) => [
                        slot.start,
                        slot.end,
                    ]);
                });
                console.log(finalTimes)
                const payload = {
                    reservation_duration: parseInt(this.localDuration, 10),
                    reservation_times: finalTimes,
                };

                console.log(payload)

                await this.updateBranchSettings({
                    branchId: this.branch.id,
                    settings: payload,
                });

                this.$emit("close");
            } catch (error) {
                console.error("Error saving branch settings:", error);
            }
        },
    },
};
</script>

<style scoped></style>