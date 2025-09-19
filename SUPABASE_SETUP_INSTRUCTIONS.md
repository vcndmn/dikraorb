# Supabase Setup Instructions for DikraOrb

## 🚀 Quick Setup Guide

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `dikraorb-orders`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users (e.g., Middle East)
6. Click "Create new project"

### 2. Get Your Project Credentials

1. Go to **Settings** → **API**
2. Copy your **Project URL** (looks like: `https://your-project.supabase.co`)
3. Copy your **anon public** key (starts with `eyJ...`)

### 3. Configure Your Website

1. Open `supabase-config.js` in your project
2. Replace the placeholder values:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co'; // Your actual URL
const SUPABASE_ANON_KEY = 'eyJ...'; // Your actual anon key
```

### 4. Create Database Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire content from `database-schema.sql`
4. Click "Run" to execute the SQL

This will create:
- ✅ `orders` table with all necessary columns
- ✅ Indexes for better performance
- ✅ Row Level Security (RLS) policies
- ✅ Automatic timestamp updates
- ✅ Order summary view

### 5. Test Your Integration

1. Start your local server: `python -m http.server 8000`
2. Open your website
3. Add items to cart
4. Go through checkout process
5. Check your Supabase **Table Editor** → `orders` table
6. You should see your order data saved!

## 📊 Database Schema

### Orders Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `order_number` | VARCHAR(20) | Unique order number (e.g., DK1A2B3C4D5) |
| `customer_name` | VARCHAR(255) | Customer's full name |
| `customer_email` | VARCHAR(255) | Customer's email address |
| `customer_phone` | VARCHAR(50) | Customer's phone number |
| `customer_address` | TEXT | Full delivery address |
| `customer_city` | VARCHAR(100) | Customer's city |
| `delivery_notes` | TEXT | Special delivery instructions |
| `items` | JSONB | Order items with details (JSON format) |
| `product_color` | VARCHAR(50) | Main product color (red, blue, purple, gold) |
| `product_quantity` | INTEGER | Quantity of main product |
| `total_amount` | DECIMAL(10,2) | Total order amount |
| `currency` | VARCHAR(3) | Currency code (default: SAR) |
| `status` | VARCHAR(50) | Order status (pending, confirmed, etc.) |
| `payment_status` | VARCHAR(50) | Payment status (pending, paid, etc.) |
| `created_at` | TIMESTAMP | When order was created |
| `updated_at` | TIMESTAMP | When order was last updated |
| `notes` | TEXT | Additional notes |
| `tracking_number` | VARCHAR(100) | Shipping tracking number |
| `estimated_delivery` | DATE | Estimated delivery date |

### Sample Order Data

```json
{
  "order_number": "DK1A2B3C4D5",
  "customer_name": "أحمد محمد",
  "customer_email": "ahmed@example.com",
  "customer_phone": "0501234567",
  "customer_address": "شارع الملك فهد، حي النخيل، الرياض",
  "customer_city": "riyadh",
  "delivery_notes": "اتصل قبل التوصيل",
  "items": [
    {
      "id": "dikraorb-classic",
      "name": "ذكرة أورب™ الكلاسيكي",
      "price": 349,
      "color": "red",
      "quantity": 1
    }
  ],
  "product_color": "red",
  "product_quantity": 1,
  "total_amount": 349.00,
  "currency": "SAR",
  "status": "pending",
  "payment_status": "pending"
}
```

## 🔒 Security Features

- **Row Level Security (RLS)** enabled
- **Public insert policy** for order submissions
- **Public read policy** for order lookups
- **Automatic timestamps** for audit trail
- **Unique order numbers** to prevent duplicates

## 🛠️ Advanced Features

### Order Status Management

You can update order statuses in Supabase:

```sql
-- Update order status
UPDATE orders 
SET status = 'confirmed', 
    updated_at = NOW() 
WHERE order_number = 'DK1A2B3C4D5';

-- Add tracking number
UPDATE orders 
SET tracking_number = 'SA123456789', 
    status = 'shipped',
    updated_at = NOW() 
WHERE order_number = 'DK1A2B3C4D5';
```

### View All Orders

```sql
-- Get all orders
SELECT * FROM order_summaries ORDER BY created_at DESC;

-- Get orders by customer email
SELECT * FROM orders WHERE customer_email = 'customer@example.com';

-- Get orders by status
SELECT * FROM orders WHERE status = 'pending';
```

## 🚨 Troubleshooting

### Common Issues

1. **"Supabase not configured" error**
   - Check your `supabase-config.js` file
   - Make sure URL and key are correct
   - Ensure the script is loaded before `script.js`

2. **Database connection errors**
   - Verify your Supabase project is active
   - Check if the `orders` table exists
   - Ensure RLS policies are set up correctly

3. **Order not saving**
   - Check browser console for errors
   - Verify all required fields are filled
   - Check Supabase logs in dashboard

### Debug Mode

Add this to your browser console to test Supabase connection:

```javascript
// Test Supabase connection
supabase.from('orders').select('count').then(console.log);
```

## 📈 Next Steps

1. **Email Notifications**: Set up email triggers for new orders
2. **Admin Dashboard**: Create an admin panel to manage orders
3. **Payment Integration**: Connect with payment gateways
4. **Inventory Management**: Track product stock levels
5. **Analytics**: Add order analytics and reporting

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
