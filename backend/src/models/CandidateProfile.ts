import { Schema, model, Document, Types } from 'mongoose';

export interface ICandidateProfile extends Document {
  _id: string;
  userId: Types.ObjectId;
  title: string; // Headline including open-to work
  skills: string[];
  yoe: number;
  location: string;
  expectedCTC: number;
  about?: string;
  experiences?: Array<{
    company: string;
    role: string;
    startDate: Date;
    endDate?: Date;
    description?: string;
  }>;
  achievements?: string[];
  avatarUrl?: string;
  resumeUrl?: string;
  links?: {
    github?: string;
    linkedin?: string;
  };
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const candidateProfileSchema = new Schema<ICandidateProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  experiences: [
    {
      company: { type: String, trim: true, required: true },
      role: { type: String, trim: true, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date },
      description: { type: String, trim: true, maxlength: 1000 }
    }
  ],
  achievements: [{ type: String, trim: true, maxlength: 200 }],
  avatarUrl: { type: String, trim: true },
  resumeUrl: { type: String, trim: true },
  skills: [{
    type: String,
    required: true,
    trim: true
  }],
  yoe: {
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
  expectedCTC: {
    type: Number,
    required: true,
    min: 0
  },
  about: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
  links: {
    github: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^https:\/\/(www\.)?github\.com\/[\w\-\.]+$/.test(v);
        },
        message: 'Invalid GitHub URL format'
      }
    },
    linkedin: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^https:\/\/(www\.)?linkedin\.com\/in\/[\w\-\.]+$/.test(v);
        },
        message: 'Invalid LinkedIn URL format'
      }
    }
  },
  lastActive: {
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

// Required indexes for matching algorithm
candidateProfileSchema.index({ location: 1, skills: 1, yoe: 1, lastActive: -1 });
candidateProfileSchema.index({ skills: 1 });
candidateProfileSchema.index({ yoe: 1 });
candidateProfileSchema.index({ lastActive: -1 });

export const CandidateProfile = model<ICandidateProfile>('CandidateProfile', candidateProfileSchema);
