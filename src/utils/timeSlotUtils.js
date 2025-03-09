// src/utils/timeSlotUtils.js

export function applySlotTextUtil({ slot, index, branch, slots }) {
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
  
    // Check if the time slot is not out of branch opening hours.
    if (branch.opening_from === branch.opening_to && branch.opening_to !== "00:00") {
      const [openH, openM] = branch.opening_from.split(":").map(Number);
      const [closeH, closeM] = branch.opening_to.split(":").map(Number);
      const branchOpenMinutes = toMinutes(openH, openM);
      const branchCloseMinutes = toMinutes(closeH, closeM);
      const startTimeMinutes = toMinutes(sH, sM);
      const endTimeMinutes = toMinutes(eH, eM);
      if (startTimeMinutes < branchOpenMinutes || endTimeMinutes > branchCloseMinutes) {
        alert("Time slot is out of branch opening hours.");
        return;
        
      }
    }
  
    const startTotal = toMinutes(sH, sM);
    const endTotal = toMinutes(eH, eM);
    if (startTotal >= endTotal) {
      alert("Start time must be strictly earlier than end time.");
      return;
     
    }
    
    for (let i = 0; i < slots.length; i++) {
      if (i === index) continue;
      const existingSlot = slots[i];
    
      // Convert existing slot times from "HH:MM" strings into minutes
      const [exH, exM] = existingSlot.start.split(':').map(Number);
      const [exEH, exEM] = existingSlot.end.split(':').map(Number);
      const existingStart = toMinutes(exH, exM);
      const existingEnd = toMinutes(exEH, exEM);
    
      // Check for overlap: new slot overlaps if its start is before an existing slot's end
      // and its end is after an existing slot's start.
      if (startTotal < existingEnd && endTotal > existingStart) {
        alert("Time slot overlaps with another existing slot. Please try again.");
        return; 
      }
    }
    // Update slot if all validations pass
    slot.start = `${pad(sH)}:${pad(sM)}`;
    slot.end = `${pad(eH)}:${pad(eM)}`;
    slot.isEditing = false;
   
  }
  