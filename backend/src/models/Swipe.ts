import { Schema, model, Document, Types } from 'mongoose';

export interface ISwipe extends Document {
  _id: string;
  fromUserId: Types.ObjectId;
  targetType: 'job' | 'candidate';
  targetId: Types.ObjectId;
  dir: 'right' | 'left';
  ts: Date;
}

const swipeSchema = new Schema<ISwipe>({
  fromUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetType: {
    type: String,
    enum: ['job', 'candidate'],
    required: true
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  dir: {
    type: String,
    enum: ['right', 'left'],
    required: true
  },
  ts: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  versionKey: false,
  toJSON: {
    transform: (_doc, ret: any) => {
      const { _id, __v, ...rest } = ret;
      return { id: _id, ...rest };
    }
  }
});

// Unique constraint to prevent duplicate swipes
swipeSchema.index({ fromUserId: 1, targetType: 1, targetId: 1 }, { unique: true });

// Required indexes for matching algorithm
swipeSchema.index({ targetId: 1, targetType: 1, ts: -1 });
swipeSchema.index({ fromUserId: 1, dir: 1, ts: -1 });

export const Swipe = model<ISwipe>('Swipe', swipeSchema);
