import { Schema, model, Document, Model, Types } from 'mongoose';
import { IBooking } from './booking.model';
import { IPayment } from './payment.model';

export type RefundStatus = 'initiated' | 'processed' | 'failed';

export interface IRefund extends Document {
  booking: IBooking;
  payment: IPayment;
  amount: number;
  status: RefundStatus;
  reason?: string;
  createdAt: Date;
}

const refundSchema = new Schema<IRefund>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['initiated', 'processed', 'failed'],
      default: 'initiated',
    },
    reason: { type: String, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
  }
);

const Refund: Model<IRefund> = model<IRefund>('Refund', refundSchema);
export default Refund;