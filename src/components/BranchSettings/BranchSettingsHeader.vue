<template>
    <div class="border-b flex-shrink-0">
        <h2 class="text-xl p-4">
            Edit {{ branch.name }}
            <span v-if="branch.reference">({{ branch.reference }})</span>
            branch Reservation Settings
        </h2>
    </div>
</template>

<script>
export default {
    name: "BranchSettingsHeader",
    props: {
        branch: {
            type: Object,
            required: true,
        },
    },
};
</script>

<style scoped></style>