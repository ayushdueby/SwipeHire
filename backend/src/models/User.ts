import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  role: 'candidate' | 'recruiter';
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['candidate', 'recruiter'],
    required: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  avatarUrl: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: (_doc, ret: any) => {
      const { _id, __v, password, ...rest } = ret;
      return { id: _id, ...rest };
    }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Additional indexes (email is already indexed in schema definition)
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 }); // For sorting by creation date

export const User = model<IUser>('User', userSchema);
