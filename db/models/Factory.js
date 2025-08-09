// app/db/models/Factory.js
import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Factory extends Model {
  static table = 'factories';

  @field('name') name;
  @field('address') address;    // optional
  @field('contact') contact;    // optional, e.g. phone or person
  @field('gstin') gstin;
}
