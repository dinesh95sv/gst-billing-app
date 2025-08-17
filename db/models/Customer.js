// app/db/models/Customer.js
import { Model } from '@nozbe/watermelondb';
import { date, field, readonly } from '@nozbe/watermelondb/decorators';

export default class Customer extends Model {
  static table = 'customers';

  @field('name') name;
  @field('address') address;    // optional
  @field('phone') phone;        // optional
  @field('email') email;        // optional
  @field('gstin') gstin;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;
}
