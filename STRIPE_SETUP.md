# Stripe Integration Setup

This guide will walk you through setting up Stripe integration for the PRO subscription system in your inventory management application.

## Prerequisites

1. Create a [Stripe account](https://dashboard.stripe.com/register)
2. Install required dependencies:
   ```bash
   npm install stripe @stripe/stripe-js @stripe/react-stripe-js
   ```

## Configuration Steps

### 1. Set up Environment Variables

Create or update your `.env` file in the server directory with the following Stripe configuration:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
CLIENT_URL=http://localhost:3000

# Stripe Price IDs
STRIPE_MONTHLY_PRICE_ID=price_monthly_id
STRIPE_YEARLY_PRICE_ID=price_yearly_id
```

### 2. Create Products and Prices in Stripe Dashboard

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Products > Create Product
3. Create two subscription products:
   - **Monthly PRO Plan**
     - Name: "StockTrack PRO Monthly"
     - Price: $9.99 per month
     - Recurring: Monthly
   - **Annual PRO Plan**
     - Name: "StockTrack PRO Annual"
     - Price: $99.99 per year
     - Recurring: Yearly
4. After creating each product, copy the `price_id` values and update your environment variables:
   - `STRIPE_MONTHLY_PRICE_ID`: Your monthly plan price ID 
   - `STRIPE_YEARLY_PRICE_ID`: Your yearly plan price ID

### 3. Set Up Stripe Webhook

The application needs to receive events from Stripe (like successful payments) to update user subscriptions.

1. In your Stripe Dashboard, go to Developers > Webhooks
2. Click "Add endpoint"
3. Add your webhook URL: `https://your-domain.com/api/stripe/webhook`
   - For local development, use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward events
4. Select events to listen for:
   - checkout.session.completed
   - invoice.paid
   - invoice.payment_failed
   - customer.subscription.deleted
   - customer.subscription.updated
5. Copy the signing secret and update your `STRIPE_WEBHOOK_SECRET` environment variable

### 4. Local Development with Stripe Webhook

To test Stripe webhooks locally:

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli#install)
2. Login to your Stripe account: `stripe login`
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to http://localhost:5000/api/stripe/webhook
   ```
4. The CLI will provide a webhook signing secret - add this to your `.env` file as `STRIPE_WEBHOOK_SECRET`

### 5. Testing the Integration

1. Start your application
2. Use Stripe test cards for payments:
   - Success card: `4242 4242 4242 4242`
   - Failure card: `4000 0000 0000 0002`
3. Use any future expiration date and any 3-digit CVC
4. Use any name and a valid email to receive receipts

### 6. Going Live

When you're ready to accept real payments:

1. Complete Stripe's account activation process
2. Switch from test to live API keys in your environment variables
3. Update your webhook endpoint URL in the Stripe Dashboard
4. Update your price IDs to the live product price IDs

## Troubleshooting

- **Webhook issues**: Check the Stripe CLI logs and your server logs
- **Payment failures**: Verify your API keys and price IDs are correctly set
- **Session errors**: Ensure your success and cancel URLs are properly configured

For additional help, refer to the [Stripe API Documentation](https://stripe.com/docs/api) or reach out to Stripe support. 