import { Schema, model, Document, Types } from 'mongoose';

export interface IReport extends Document {
  _id: string;
  reportedId: Types.ObjectId;
  reporterId: Types.ObjectId;
  reason: string;
  ts: Date;
  status: 'open' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>({
  reportedId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  reporterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  ts: {
    type: Date,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: (doc, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

// Indexes for report management
reportSchema.index({ status: 1, ts: -1 });
reportSchema.index({ reportedId: 1, status: 1 });
reportSchema.index({ reporterId: 1, ts: -1 });

export const Report = model<IReport>('Report', reportSchema);
