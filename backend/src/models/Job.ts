import { Schema, model, Document, Types } from 'mongoose';

export interface IJob extends Document {
  _id: string;
  recruiterId: Types.ObjectId;
  title: string;
  stack: string[];
  minYoe: number;
  location: string;
  remote: boolean;
  salaryBand: {
    min: number;
    max: number;
  };
  mustHaves: string[];
  description: string;
  status: 'open' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>({
  recruiterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  stack: [{
    type: String,
    required: true,
    trim: true
  }],
  minYoe: {
    type: Number,
    required: true,
    min: 0,
    max: 50
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  remote: {
    type: Boolean,
    default: false
  },
  salaryBand: {
    min: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function(this: IJob, v: number) {
          return v >= this.salaryBand.min;
        },
        message: 'Max salary must be greater than or equal to min salary'
      }
    }
  },
  mustHaves: [{
    type: String,
    required: true,
    trim: true
  }],
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
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
    transform: (_doc, ret: any) => {
      const { _id, __v, ...rest } = ret;
      return { id: _id, ...rest };
    }
  }
});

// Required indexes for job search and matching
jobSchema.index({ location: 1, stack: 1, minYoe: 1, createdAt: -1 });
jobSchema.index({ recruiterId: 1, status: 1 });
jobSchema.index({ stack: 1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ remote: 1 });

export const Job = model<IJob>('Job', jobSchema);
