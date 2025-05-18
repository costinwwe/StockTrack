/**
 * Script to create Stripe Products and Prices for StockTrack PRO subscription
 * 
 * This script creates the necessary products and prices in Stripe for the PRO subscription.
 * It should be run once to set up the initial products and prices.
 * 
 * Usage: 
 * 1. Set up your Stripe API key in environment variables or update the script
 * 2. Run with: node create-stripe-products.js
 */

require('dotenv').config({ path: '../config/config.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createProducts() {
  try {
    // Create the PRO product
    const product = await stripe.products.create({
      name: 'StockTrack PRO',
      description: 'Premium features for StockTrack inventory management application',
      metadata: {
        productType: 'subscription'
      }
    });
    
    console.log('✅ Created Stripe Product:');
    console.log(`ID: ${product.id}`);
    console.log(`Name: ${product.name}`);
    
    // Create monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 999, // $9.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      lookup_key: 'stocktrack_pro_monthly',
      metadata: {
        planType: 'monthly'
      }
    });
    
    console.log('\n✅ Created Monthly Price:');
    console.log(`ID: ${monthlyPrice.id}`);
    console.log(`Amount: $${(monthlyPrice.unit_amount / 100).toFixed(2)} per month`);
    
    // Create yearly price
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 9999, // $99.99
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      lookup_key: 'stocktrack_pro_yearly',
      metadata: {
        planType: 'yearly'
      }
    });
    
    console.log('\n✅ Created Yearly Price:');
    console.log(`ID: ${yearlyPrice.id}`);
    console.log(`Amount: $${(yearlyPrice.unit_amount / 100).toFixed(2)} per year`);
    
    console.log('\n⚠️ Important: Update your .env file with these IDs:');
    console.log(`STRIPE_MONTHLY_PRICE_ID=${monthlyPrice.id}`);
    console.log(`STRIPE_YEARLY_PRICE_ID=${yearlyPrice.id}`);
    
  } catch (error) {
    console.error('❌ Error creating Stripe products:', error);
  }
}

createProducts(); 