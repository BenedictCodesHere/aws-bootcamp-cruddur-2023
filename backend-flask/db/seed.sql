INSERT INTO public.users (display_name, handle, email, cognito_user_id)
VALUES
  ('Kestrel Jack', 'KestrelBlaster' ,'cloudagemthrowaway5@gmail.com', 'MOCK'),
  ('Horace Turnbull', 'turninghorace' ,'timberbertim88@gmail.com','MOCK'),
  ('Neville Tracer', 'tracerneville' ,'idontoashteau@aufhwiewaeivcn.io','MOCK'),
  ('Boris Yeltser', 'BorisYelt' ,'borisyelt@sharklasers.com','MOCK');
  

INSERT INTO public.activities (user_uuid, message, expires_at)
VALUES
  (
    (SELECT uuid from public.users WHERE users.handle = 'KestrelBlaster' LIMIT 1),
    'This was imported as seed data!',
    current_timestamp + interval '10 day'
  ),
  (
    (SELECT uuid from public.users WHERE users.handle = 'BorisYelt' LIMIT 1),
    'I am the other!',
    current_timestamp + interval '10 day'
  );