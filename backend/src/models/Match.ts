import { Schema, model, Document, Types } from 'mongoose';

export interface IMatch extends Document {
  _id: string;
  candidateUserId: Types.ObjectId;
  jobId: Types.ObjectId;
  recruiterUserId: Types.ObjectId;
  ts: Date;
  createdAt: Date;
  updatedAt: Date;
}

const matchSchema = new Schema<IMatch>({
  candidateUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  recruiterUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
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

// Unique constraint to prevent duplicate matches
matchSchema.index({ candidateUserId: 1, jobId: 1 }, { unique: true });

// Indexes for querying matches
matchSchema.index({ candidateUserId: 1, ts: -1 });
matchSchema.index({ recruiterUserId: 1, ts: -1 });

export const Match = model<IMatch>('Match', matchSchema);
