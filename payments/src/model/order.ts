import mongoose from 'mongoose';
import { OrderStatus } from '@ssvtickets/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export { OrderStatus };

interface orderAttrs {
	id: string;
	userId: string;
	status: OrderStatus;
	version: number;
	price: number;
}
interface OrderDoc extends mongoose.Document {
	userId: string;
	status: OrderStatus;
	version: number;
	price: number;
}
interface OrderModel extends mongoose.Model<OrderDoc> {
	build(attrs: orderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: true,
			enum: Object.values(OrderStatus),
			default: OrderStatus.Created,
		},
		price: {
			type: Number,
			required: true,
		},
	},
	{
		toJSON: {
			transform(doc, ret) {
				ret.id = ret._id;
				delete ret._id;
			},
		},
	}
);

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);
orderSchema.statics.build = (attrs: orderAttrs) => {
	return new Order({
		_id: attrs.id,
		version: attrs.version,
		userId: attrs.userId,
		price: attrs.price,
		status: attrs.status,
	});
};
const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);
export { Order };
