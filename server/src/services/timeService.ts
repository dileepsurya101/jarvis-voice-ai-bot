import { ActionPayload, ServiceResult } from '../types';

export const timeService = {
  getTime(): ServiceResult {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const timeStr = `${hours}:${minutes} ${ampm}`;

    return {
      reply: `It is currently ${timeStr}, Sir.`,
      actions: [{ type: 'TIME_RESULT', data: { time: timeStr, timestamp: now.toISOString() } }],
    };
  },

  getDate(): ServiceResult {
    const now = new Date();
    const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    const date = now.getDate();
    const month = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'][now.getMonth()];
    const year = now.getFullYear();

    const suffix = date === 1 || date === 21 || date === 31 ? 'st'
      : date === 2 || date === 22 ? 'nd'
      : date === 3 || date === 23 ? 'rd' : 'th';

    const dateStr = `${day}, ${month} ${date}${suffix}, ${year}`;

    return {
      reply: `Today is ${dateStr}, Sir.`,
      actions: [{ type: 'DATE_RESULT', data: { date: dateStr, timestamp: now.toISOString() } }],
    };
  },
};
