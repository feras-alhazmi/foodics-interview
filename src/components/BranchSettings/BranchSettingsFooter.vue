<template>
    <div class="py-2 px-4 border-t flex-shrink-0 flex justify-between items-center">
        <button @click="$emit('disable')" class="text-red-500 px-4 py-2">
            Disable Reservations
        </button>
        <div class="flex space-x-2">
            <button class="border border-gray-300 px-4 py-2 rounded-lg" @click="$emit('close')">
                Close
            </button>
            <button class="bg-purple-800 text-white px-4 py-2 rounded-lg" @click="$emit('save')">
                Save
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: "BranchSettingsFooter",
};
</script>

<style scoped>
/* Footer-specific styles */
</style>