// Shift times are stored in the database as Pacific wall-clock time shifted
// forward by a fixed 7 hours (see createShift/updateShift in
// actions/admin/event.ts). Formatting stored values with a fixed UTC-7 zone
// ("Etc/GMT+7" is UTC-7 in IANA notation) recovers the original wall-clock
// time regardless of the server or visitor timezone, and is unaffected by
// daylight-saving transitions.
export const SHIFT_DISPLAY_TZ = 'Etc/GMT+7'

const STORED_OFFSET_MS = 7 * 60 * 60 * 1000

export const formatShiftDate = (
    date: Date,
    options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
) => date.toLocaleDateString('en-US', { timeZone: SHIFT_DISPLAY_TZ, ...options })

export const formatShiftTime = (
    date: Date,
    options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', hour12: true }
) => date.toLocaleTimeString('en-US', { timeZone: SHIFT_DISPLAY_TZ, ...options })

export const formatShiftTimeRange = (
    start: Date,
    end: Date,
    options?: Intl.DateTimeFormatOptions
) => formatShiftTime(start, options) + ' - ' + formatShiftTime(end, options)

// Stored shift time -> wall-clock string for an <input type="datetime-local">.
export const shiftTimeToInputValue = (date: Date) =>
    new Date(date.getTime() - STORED_OFFSET_MS).toISOString().slice(0, 19)

// Wall-clock string from a datetime-local input -> stored representation.
export const shiftInputToStoredTime = (value: string) =>
    new Date(new Date(value + 'Z').getTime() + STORED_OFFSET_MS)
