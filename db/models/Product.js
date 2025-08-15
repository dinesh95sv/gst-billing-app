import { Model } from '@nozbe/watermelondb';
import { date, field, readonly } from '@nozbe/watermelondb/decorators';

export default class Product extends Model {
  static table = 'products';

  @field('name') name;
  @field('hsn') hsn;
  @field('price') price;
  @field('gst_percent') gstPercent;
  @readonly @date('created_at') createdAt
  @readonly @date('updated_at') updatedAt
}
