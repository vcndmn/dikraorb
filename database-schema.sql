-- Supabase Database Schema for DikraOrb Orders
-- Run this SQL in your Supabase SQL Editor

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    
    -- Customer Information
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_address TEXT NOT NULL,
    customer_city VARCHAR(100) NOT NULL,
    delivery_notes TEXT,
    
    -- Order Details
    items JSONB NOT NULL, -- Array of order items with details
    product_color VARCHAR(50) NOT NULL, -- Main product color purchased (red, blue, purple, gold)
    product_quantity INTEGER NOT NULL DEFAULT 1, -- Quantity of main product
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'SAR',
    
    -- Order Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional metadata
    notes TEXT,
    tracking_number VARCHAR(100),
    estimated_delivery DATE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for order submissions)
CREATE POLICY "Allow public order submissions" ON orders
    FOR INSERT WITH CHECK (true);

-- Create policy to allow reading orders by email (for customer lookup)
CREATE POLICY "Allow reading orders by email" ON orders
    FOR SELECT USING (true);

-- Optional: Create a view for order summaries
CREATE OR REPLACE VIEW order_summaries AS
SELECT 
    id,
    order_number,
    customer_name,
    customer_email,
    customer_city,
    total_amount,
    currency,
    status,
    payment_status,
    created_at,
    updated_at
FROM orders
ORDER BY created_at DESC;
