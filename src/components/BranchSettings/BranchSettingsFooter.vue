<template>
    <div class="py-2 px-4 border-t flex-shrink-0 flex justify-between items-center">
        <button @click="$emit('disable')" class="text-red-500 px-4 py-2">
            Disable Reservations
        </button>
        <div class="flex space-x-2">
            <button class="border border-gray-300 px-4 py-2 rounded-lg" @click="$emit('close')">
                Close
            </button>


            <button class="bg-purple-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                @click="$emit('save')" :disabled="isSubmitting">
                <span>Save</span>
                <LoadingSpinner v-if="isSubmitting" :size="20" :color="'white'" />
            </button>
        </div>
    </div>
</template>

<script>
import LoadingSpinner from "@/components/LoadingSpinner.vue";
export default {
    name: "BranchSettingsFooter",
    components: {
        LoadingSpinner,
    },
    props: {
        isSubmitting: {
            type: Boolean,
            default: false,

        },
    },
};
</script>

<style scoped>
/* Footer-specific styles */
</style>