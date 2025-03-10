<template>
    <div class="flex items-center justify-center ">

        <div :class="[
            'loader ease-linear rounded-full border-2 border-t-2 border-gray-200',
            `border-${color}-800`,
        ]" :style="{ width: size + 'px', height: size + 'px' }"></div>
    </div>
</template>

<script>
export default {
    name: "LoadingSpinner",
    props: {
        size: {
            type: Number,
            default: 50,
        },
        color: {
            type: String,
            default: "purple",
        }
    },
};
</script>

<style scoped>
.loader {
    border-top-color: transparent;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>