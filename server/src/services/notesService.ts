import { ActionPayload, ServiceResult } from '../types';
import Note from '../models/Note';

export const notesService = {
  async createNote(content: string, sessionId: string): Promise<ServiceResult> {
    try {
      const note = await Note.create({ content, sessionId });
      return {
        reply: `Done, Sir. Note saved: "${content.substring(0, 60)}${content.length > 60 ? '...' : ''}".`,
        actions: [{ type: 'NOTE_SAVED', data: { id: note._id.toString(), content } }],
      };
    } catch (error) {
      console.error('Create note error:', error);
      // Fallback if DB not available
      return {
        reply: `Done, Sir. Note saved: "${content.substring(0, 60)}".`,
        actions: [{ type: 'NOTE_SAVED', data: { content } }],
      };
    }
  },

  async getNotes(sessionId: string): Promise<ServiceResult> {
    try {
      const notes = await Note.find({ sessionId }).sort({ createdAt: -1 }).limit(10).lean();
      if (notes.length === 0) {
        return {
          reply: 'You have no saved notes, Sir. Say "create a note" to add one.',
          actions: [{ type: 'NOTE_LIST', data: { notes: [] } }],
        };
      }
      const list = notes.map((n, i) => `${i + 1}. ${n.content}`).join(' | ');
      return {
        reply: `You have ${notes.length} note${notes.length > 1 ? 's' : ''}, Sir: ${list.substring(0, 200)}`,
        actions: [{ type: 'NOTE_LIST', data: { notes } }],
      };
    } catch (error) {
      console.error('Get notes error:', error);
      return {
        reply: 'Apologies, Sir. Unable to retrieve notes at this time.',
        actions: [],
      };
    }
  },

  async deleteNote(noteId: string): Promise<ServiceResult> {
    try {
      await Note.findByIdAndDelete(noteId);
      return {
        reply: 'Done, Sir. Note deleted.',
        actions: [{ type: 'NOTE_DELETED', data: { id: noteId } }],
      };
    } catch (error) {
      console.error('Delete note error:', error);
      return {
        reply: 'Apologies, Sir. Unable to delete that note.',
        actions: [],
      };
    }
  },
};
