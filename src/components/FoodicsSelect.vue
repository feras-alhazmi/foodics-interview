<template>
  <div class="relative w-full" ref="selectRoot">
    <!-- Selected Area -->
    <div class="border rounded-md p-2 flex flex-wrap items-center gap-2 cursor-pointer" @click="toggleDropdown">
      <!-- Multiple Selection: Show Pills -->
      <template v-if="multiple">
        <!-- If no selections, show placeholder -->
        <span v-if="!selectedItems.length" class="text-gray-400">
          {{ placeholder }}
        </span>
        <!-- Otherwise show selected items as pills -->
        <span v-for="(item, idx) in selectedItems" :key="item[valueKey] || idx"
          class="flex items-center border border-blue-300 px-2 py-1 rounded-lg">
          {{ item[labelKey] }}
          <!-- Remove button for each pill -->

        </span>
      </template>

      <!-- Single Selection: Show a single label or placeholder -->
      <template v-else>
        <span v-if="!selectedItems[0]" class="text-gray-400">
          {{ placeholder }}
        </span>
        <span v-else>
          {{ selectedItems[0][labelKey] }}
        </span>
      </template>

      <!-- Chevron Icon (optional) -->
      <svg :class="['ml-auto h-4 w-4 transition-transform', { 'rotate-180': isOpen }]" fill="none" stroke="currentColor"
        stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
      </svg>
    </div>

    <!-- Dropdown Options -->
    <transition name="fade">
      <ul v-if="isOpen" class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md 
         max-h-60 overflow-y-auto
custom-scrollbar
         ">
        <li v-for="(option, index) in options" :key="option[valueKey] || index"
          class="px-3 py-2 hover:bg-blue-50 cursor-pointer" @click.stop="selectOption(option)">
          {{ option[labelKey] }}
        </li>
      </ul>
    </transition>
  </div>
</template>

<script>
export default {
  name: "FoodicsSelect",

  props: {
    // The array of objects to display
    options: {
      type: Array,
      default: () => [],
    },
    // For a single item, we can pass an object or null
    // For multiple items, we can pass an array
    value: {
      type: [Object, Array, null],
      default: null,
    },
    // Whether multiple selection is allowed
    multiple: {
      type: Boolean,
      default: false,
    },
    // The key used for displaying the label
    labelKey: {
      type: String,
      default: "label",
    },
    // The key used for the underlying value
    valueKey: {
      type: String,
      default: "value",
    },
    // Placeholder text when nothing is selected
    placeholder: {
      type: String,
      default: "Select an option",
    },
  },
  data() {
    return {
      isOpen: false,
    };
  },
  computed: {
    // Turn 'value' prop into an array for multiple selection
    selectedItems() {
      if (this.multiple) {
        // If it's an array, return it directly; else empty array
        return Array.isArray(this.value) ? this.value : [];
      } else {
        // Single item => wrap in array if present
        return this.value ? [this.value] : [];
      }
    },
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen;
    },
    closeDropdown() {
      this.isOpen = false;
    },
    selectOption(option) {
      if (this.multiple) {
        // If already selected, do nothing
        const alreadySelected = this.selectedItems.find(
          (item) => item[this.valueKey] === option[this.valueKey]
        );
        if (!alreadySelected) {
          // Emit new array with the selected item appended
          const newValue = [...this.selectedItems, option];
          this.$emit("input", newValue);
        }
      } else {
        // Single selection => just emit the new object
        this.$emit("input", option);
        this.closeDropdown();
      }
    },
    removeOption(option) {
      // For multiple selection only
      if (this.multiple) {
        const newValue = this.selectedItems.filter(
          (item) => item[this.valueKey] !== option[this.valueKey]
        );
        this.$emit("input", newValue);
      }
    },
    onClickOutside(e) {
      // If click is outside the root element
      if (!this.$refs.selectRoot.contains(e.target)) {
        this.closeDropdown();
      }
    },
  },
  mounted() {
    // Handle clicks outside the dropdown
    document.addEventListener("mousedown", this.onClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener("mousedown", this.onClickOutside);
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>