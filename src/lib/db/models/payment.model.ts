import { Schema, model, Document, Model, Types } from 'mongoose';
import { IBooking } from './booking.model';
import { ICustomer } from './user.model';
import { IDiscount } from './discount.model';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'wallet';

export interface IPayment extends Document {
  booking: IBooking;
  customer: ICustomer;
  amount: number;
  currency: string;
  status: PaymentStatus;
  transaction?: string;
  paymentMethod: PaymentMethod;
  discount?: IDiscount;
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    transaction: { type: String, unique: true },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'wallet'],
      required: true,
    },
    discount: { type: Schema.Types.ObjectId, ref: 'Discount' },
    createdAt: { type: Date, default: Date.now },
  }
);

const Payment: Model<IPayment> = model<IPayment>('Payment', paymentSchema);
export default Payment;