// Supabase Configuration
// Replace these with your actual Supabase project credentials

const SUPABASE_URL = 'https://mptirjhsftovtnnupjhf.supabase.co'; // e.g., 'https://mptirjhsftovtnnupjhf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdGlyamhzZnRvdnRubnVwamhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTExODYsImV4cCI6MjA3Mzc2NzE4Nn0.cWqWhDJ15p1WxslxPZQ8OP3ha5xU97eyX2E_nemqtEk'; // Your public anon key

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database table name
const ORDERS_TABLE = 'orders';

// Export for use in other files
window.supabase = supabaseClient;
window.ORDERS_TABLE = ORDERS_TABLE;
