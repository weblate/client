export const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const parts = [
        hours ? `${hours}hr` : null,
        minutes ? `${minutes}min` : null,
        seconds ? `${seconds}sec` : null,
    ].filter(Boolean);
    return parts.join(' ');
};
