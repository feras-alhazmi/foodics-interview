<template>
    <div class="mb-4">
        <label class="block text-gray-700 mb-1 font-semibold">
            Reservation Time Slots
        </label>
        <p class="text-sm text-gray-500 mb-2">
            Up to 3 time slots per day. Example: 11:00 - 17:00 &amp; 18:00 - 23:00.
        </p>
        <div v-for="day in daysOfWeek" :key="day" class="mb-4">
            <div class="flex justify-between items-center mb-2">
                <h4 class="font-medium capitalize">{{ day }}</h4>
                <button v-if="day === 'saturday'" class="text-purple-800" @click="$emit('applySaturday')">
                    Apply to All Days
                </button>
            </div>
            <div class="flex border mb-2 rounded p-2 justify-between items-center">
                <div class="flex flex-wrap gap-2 items-center">
                    <div v-if="!reservationTimes[day] || reservationTimes[day].length === 0">
                        <p class="text-sm text-gray-500">Add Available Reservation Times</p>
                    </div>
                    <div v-for="(slot, idx) in reservationTimes[day]" :key="idx">
                        <!-- EDIT MODE -->
                        <div v-if="slot.isEditing" class="relative border-2 border-blue-300 rounded-md px-3 py-1 w-32">
                            <!-- 'Remove' button -->
                            <button
                                class="absolute -top-3 -right-2 px-1 bg-white border border-gray-400 rounded-full text-sm hover:text-gray-600"
                                @click="$emit('removeSlot', { day, index: idx })">
                                X
                            </button>
                            <!-- Single Text Input -->
                            <input type="text" v-model="slot.text" class="w-28 focus:outline-none"
                                @keydown.enter.prevent="onApplySlotText(slot, day, idx)" />
                        </div>
                        <!-- VIEW MODE -->
                        <div v-else
                            class="inline-flex items-center rounded-lg border-2 border-purple-500 px-3 py-1 cursor-pointer"
                            @click="slot.isEditing = true">
                            {{ slot.start }} - {{ slot.end }}
                        </div>
                    </div>
                </div>
                <button class="border border-gray-300 text-gray-300 h-7 w-7 text-md rounded-lg"
                    v-if="reservationTimes[day] && reservationTimes[day].length < 3" @click="$emit('addSlot', day)">
                    +
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "ReservationTimeSlots",
    props: {
        daysOfWeek: {
            type: Array,
            required: true,
        },
        reservationTimes: {
            type: Object,
            required: true,
        },
    },
    methods: {
        onApplySlotText(slot, day, index) {
            // Emit an event to let the parent handle validation and updating
            this.$emit("applySlotText", { slot, day, index });
        },
    },
};
</script>

<style scoped>
/* Styles for the reservation time slots section */
</style>