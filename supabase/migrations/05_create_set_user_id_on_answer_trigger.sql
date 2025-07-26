-- Function to set user_id from the current session
create or replace function public.set_user_id_on_answer() 
returns trigger 
language plpgsql 
security definer
as $$
begin
  new.user_id := auth.uid();
  return new;
end;
$$;

-- Trigger to call the function before insert on answers table
create trigger on_answer_created
  before insert on public.answers
  for each row execute procedure public.set_user_id_on_answer();
