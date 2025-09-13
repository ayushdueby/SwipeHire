import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  _id: string;
  matchId: Types.ObjectId;
  senderId: Types.ObjectId;
  body: string;
  ts: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  matchId: {
    type: Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
    index: true
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  body: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  ts: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: (_doc, ret: any) => {
      const { _id, __v, ...rest } = ret;
      return { id: _id, ...rest };
    }
  }
});

// Required index for chat history retrieval
messageSchema.index({ matchId: 1, ts: -1 });
messageSchema.index({ senderId: 1, ts: -1 });

export const Message = model<IMessage>('Message', messageSchema);
