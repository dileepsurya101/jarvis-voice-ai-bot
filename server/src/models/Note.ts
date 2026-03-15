import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  sessionId: string;
  title?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    sessionId: { type: String, required: true },
    title: { type: String, required: false, trim: true, maxlength: 200 },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<INote>('Note', NoteSchema);
