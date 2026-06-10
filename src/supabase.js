import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://uukpuvizkjgcssmlqltk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1a3B1dml6a2pnY3NzbWxxbHRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODMyMDksImV4cCI6MjA4ODk1OTIwOX0.b6B5JRNsKBnskOZe4PSWoy8_7baBmh9qqG_6ZMJHFiw'
)
