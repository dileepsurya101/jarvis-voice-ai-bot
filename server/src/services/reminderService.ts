import Reminder from '../models/Reminder';
import { ServiceResult } from '../types';

export const reminderService = {
  async setReminder(text: string, timeStr: string): Promise<ServiceResult> {
    try {
      const timeMatch = text.match(/(\d+)\s*(minute|hour|second)/i);
      let triggerAt = new Date();
      if (timeMatch) {
        const amount = parseInt(timeMatch[1]);
        const unit = timeMatch[2].toLowerCase();
        if (unit.startsWith('minute')) triggerAt = new Date(Date.now() + amount * 60000);
        else if (unit.startsWith('hour')) triggerAt = new Date(Date.now() + amount * 3600000);
        else if (unit.startsWith('second')) triggerAt = new Date(Date.now() + amount * 1000);
      } else {
        triggerAt = new Date(Date.now() + 60000);
      }
      const reminder = await Reminder.create({ text, triggerAt, done: false });
      const timeLabel = triggerAt.toLocaleTimeString();
      return {
        reply: `Understood, Sir. I'll remind you to "${text}" at ${timeLabel}.`,
        actions: [{ type: 'REMINDER_SET', data: reminder }],
      };
    } catch {
      return {
        reply: 'Apologies, Sir. Unable to set reminder at this time.',
        actions: [],
      };
    }
  },

  async listReminders(): Promise<ServiceResult> {
    try {
      const reminders = await Reminder.find({ done: false }).sort({ triggerAt: 1 });
      if (!reminders.length) {
        return { reply: 'You have no pending reminders, Sir.', actions: [] };
      }
      const list = reminders
        .map((r, i) => `${i + 1}. "${r.text}" at ${new Date(r.triggerAt).toLocaleTimeString()}`)
        .join('\n');
      return {
        reply: `Here are your pending reminders, Sir:\n${list}`,
        actions: [{ type: 'REMINDERS_LIST', data: reminders }],
      };
    } catch {
      return {
        reply: 'Apologies, Sir. Unable to fetch reminders.',
        actions: [],
      };
    }
  },

  async dismissReminder(id: string): Promise<ServiceResult> {
    try {
      await Reminder.findByIdAndUpdate(id, { done: true });
      return {
        reply: 'Reminder dismissed, Sir.',
        actions: [{ type: 'REMINDER_DISMISSED', data: { id } }],
      };
    } catch {
      return {
        reply: 'Apologies, Sir. Unable to dismiss that reminder.',
        actions: [],
      };
    }
  },
};
