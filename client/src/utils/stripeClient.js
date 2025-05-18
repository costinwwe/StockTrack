import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
// Using a test key - in production this should come from environment variables
const stripePromise = loadStripe('pk_test_51RALDiHVuHqtfaXfrwgiJSN1QcxR8lhOGlt52XAajkMSb3cLxeIfbaQ3rovI5Hm9aJd3cfqZ6QNvPKIyPCEJU3GK00PrBMfPrZ');

export default stripePromise; 