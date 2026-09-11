import { User } from './models/User.js';
import { Cart } from './models/Cart.js';

export async function seedDatabase() {
    const users = await User.find({}, { _id: 1 });
    await Promise.all(users.map((user) => Cart.updateOne({ user: user._id }, { $setOnInsert: { user: user._id, items: [] } }, { upsert: true })));
}
