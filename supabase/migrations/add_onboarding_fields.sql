-- Run this in Supabase SQL editor.

alter table student_details
  add column if not exists cgpa_scale text default '10',
  add column if not exists expected_salary text;

alter table professional_details
  add column if not exists previous_projects text,
  add column if not exists reason_for_change text,
  add column if not exists expected_salary text;
