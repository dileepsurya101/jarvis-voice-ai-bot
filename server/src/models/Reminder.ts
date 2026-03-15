import mongoose, { Document, Schema } from 'mongoose';

export interface IReminder extends Document {
  text: string;
  triggerAt: Date;
  done: boolean;
  createdAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
  {
    text: { type: String, required: true, trim: true },
    triggerAt: { type: Date, required: true },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IReminder>('Reminder', ReminderSchema);
