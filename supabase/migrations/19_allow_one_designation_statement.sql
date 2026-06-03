ALTER TABLE public.user_designation_choices
  DROP CONSTRAINT IF EXISTS selected_statements_length;

ALTER TABLE public.user_designation_choices
  ADD CONSTRAINT selected_statements_length
  CHECK (cardinality(selected_statements) BETWEEN 1 AND 2);
