// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xehgyudowioqurxmjoyr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaGd5dWRvd2lvcXVyeG1qb3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNDU3NDcsImV4cCI6MjA2NTYyMTc0N30.0Qi0Q4-jQyozHC0un8Do-Eol-KBmbtWjkRMePJ1irVg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);