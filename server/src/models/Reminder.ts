import mongoose, { Document, Schema } from 'mongoose';

export interface IReminder extends Document {
  sessionId: string;
  text: string;
  triggerAt: Date;
  done: boolean;
  createdAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
  {
    sessionId: { type: String, required: true },
    text: { type: String, required: true, trim: true },
    triggerAt: { type: Date, required: true },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IReminder>('Reminder', ReminderSchema);
