import { ActionItem } from './intentRouter';

interface TimeResult {
  reply: string;
  actions: ActionItem[];
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export const timeService = {
  getTime(): TimeResult {
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

  getDate(): TimeResult {
    const now = new Date();
    const day = DAYS[now.getDay()];
    const date = now.getDate();
    const month = MONTHS[now.getMonth()];
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
