import { createBookingHandler } from '@/lib/booking';
import { bookingRateLimit } from '@/lib/rate-limit';

export const POST = createBookingHandler(bookingRateLimit);
