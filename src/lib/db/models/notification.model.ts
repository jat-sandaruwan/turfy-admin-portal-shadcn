import { Schema, model, Document, Model, Types } from 'mongoose';
import { IUser } from './user.model';

export type NotificationType = 'booking' | 'payment' | 'discount' | 'support' | 'system';

export interface INotification extends Document {
  user: IUser; // Reference to the User receiving the notification
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // User receiving the notification
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['booking', 'payment', 'discount', 'support', 'system'], required: true },
  read: { type: Boolean, default: false }, // Indicates if the notification has been read
  createdAt: { type: Date, default: Date.now },
});

const Notification: Model<INotification> = model<INotification>('Notification', notificationSchema);
export default Notification;