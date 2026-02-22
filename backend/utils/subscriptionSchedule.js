/**
 * Compute the next Date when a subscription should fire.
 * @param {string} frequency - "DAILY" | "WEEKLY"
 * @param {number} hour      - 0-23
 * @param {number} minute    - 0-59
 * @param {number|null} dayOfWeek - 0 (Sun) – 6 (Sat), only for WEEKLY
 * @param {Date} [from]      - reference point (default: now)
 */
export function computeNextRunAt(frequency, hour, minute, dayOfWeek, from = new Date()) {
    const next = new Date(from);
    next.setSeconds(0, 0); // zero out seconds/ms

    if (frequency === "DAILY") {
        next.setHours(hour, minute, 0, 0);
        // If that time has already passed today, move to tomorrow
        if (next <= from) {
            next.setDate(next.getDate() + 1);
        }
        return next;
    }

    // WEEKLY
    next.setHours(hour, minute, 0, 0);
    const currentDay = next.getDay(); // 0-6
    let daysUntil = (dayOfWeek - currentDay + 7) % 7;
    // If it's the right day but the time has already passed, schedule for next week
    if (daysUntil === 0 && next <= from) {
        daysUntil = 7;
    }
    next.setDate(next.getDate() + daysUntil);
    return next;
}
