import { Schema, model, Document, Types } from 'mongoose';

export interface IRecruiterProfile extends Document {
  _id: string;
  userId: Types.ObjectId;
  company: {
    name: string;
    domain: string;
  };
  seatCount: number;
  bookingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const recruiterProfileSchema = new Schema<IRecruiterProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  company: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    domain: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(v);
        },
        message: 'Invalid domain format'
      }
    }
  },
  seatCount: {
    type: Number,
    required: true,
    min: 1,
    max: 10000
  },
  bookingUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid booking URL format'
    }
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

// Indexes
recruiterProfileSchema.index({ 'company.name': 1 });
recruiterProfileSchema.index({ 'company.domain': 1 });

export const RecruiterProfile = model<IRecruiterProfile>('RecruiterProfile', recruiterProfileSchema);
