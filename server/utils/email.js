export const sendBookingEmail = async (booking, car, user) => {
  // Email sending feature is disabled for now.
  console.log(`Email notification skipped (feature disabled) for Booking ID: ${booking.bookingId} (${user.email})`);
};
