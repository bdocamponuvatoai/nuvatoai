import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
// Short-lived abuse-prevention counters only; no form contents or raw IPs.
export const bookingLimits=sqliteTable('booking_limits',{
 key:text('key').primaryKey(), attempts:integer('attempts').notNull().default(1),expiresAt:integer('expires_at').notNull(),
},table=>[index('booking_limits_expiry').on(table.expiresAt)]);
