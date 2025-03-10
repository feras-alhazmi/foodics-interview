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

      <!-- Chevron Icon -->
      <svg :class="['ml-auto h-4 w-4 transition-transform', { 'rotate-180': isOpen }]" fill="none" stroke="currentColor"
        stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
      </svg>
    </div>

    <!-- Dropdown Options -->
    <transition name="fade">
      <ul v-if="isOpen"
        class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md max-h-60 overflow-y-auto custom-scrollbar">
        <li v-for="(option, index) in options" :key="option[valueKey] || index" :class="[
          'm-1 px-2 py-1 flex  items-center rounded-lg justify-between hover:bg-blue-300  hover:text-white cursor-pointer'

        ]" @click.stop="toggleOption(option)">
          <span>{{ option[labelKey] }}</span>
          <!-- Show a checkmark icon if the option is selected -->
          <svg v-if="isSelected(option)" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"
            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
          </svg>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script>
export default {
  name: "FoodicsSelect",
  props: {
    options: {
      type: Array,
      default: () => [],
    },
    // For a single item, we can pass an object or null.
    // For multiple items, we can pass an array.
    value: {
      type: [Object, Array, null],
      default: null,
    },
    // Whether multiple selection is allowed.
    multiple: {
      type: Boolean,
      default: false,
    },
    // The key used for displaying the label.
    labelKey: {
      type: String,
      default: "label",
    },
    // The key used for the underlying value.
    valueKey: {
      type: String,
      default: "value",
    },
    // Placeholder text when nothing is selected.
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
    // Convert the 'value' prop into an array for multiple selection.
    selectedItems() {
      if (this.multiple) {
        return Array.isArray(this.value) ? this.value : [];
      } else {
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
    isSelected(option) {
      return this.selectedItems.some(
        (item) => item[this.valueKey] === option[this.valueKey]
      );
    },
    toggleOption(option) {
      if (this.multiple) {
        const alreadySelected = this.selectedItems.find(
          (item) => item[this.valueKey] === option[this.valueKey]
        );
        if (alreadySelected) {
          // Unselect option.
          const newValue = this.selectedItems.filter(
            (item) => item[this.valueKey] !== option[this.valueKey]
          );
          this.$emit("input", newValue);
        } else {
          // Select option.
          const newValue = [...this.selectedItems, option];
          this.$emit("input", newValue);
        }
      } else {
        // Single selection: select the option and close the dropdown.
        this.$emit("input", option);
        this.closeDropdown();
      }
    },
    onClickOutside(e) {
      if (!this.$refs.selectRoot.contains(e.target)) {
        this.closeDropdown();
      }
    },
  },
  mounted() {
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
