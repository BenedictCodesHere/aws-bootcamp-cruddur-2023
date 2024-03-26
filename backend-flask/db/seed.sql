INSERT INTO public.users (display_name, handle, email, cognito_user_id)
VALUES
  ('Devington Dev', 'Devington' ,'devington@sharklasers.com', 'MOCK'),
  ('David Dev', 'DavidDev' ,'daviddev@sharklasers.com','MOCK'),
  ('Darren Dev', 'DarrenDev' ,'darrendev@sharklasers.com','MOCK');
  

INSERT INTO public.activities (user_uuid, message, expires_at)
VALUES
  (
    (SELECT uuid from public.users WHERE users.handle = 'Devington' LIMIT 1),
    'This was imported as seed data!',
    current_timestamp + interval '10 day'
  ),
  (
    (SELECT uuid from public.users WHERE users.handle = 'DavidDev' LIMIT 1),
    'I am the second dev user.',
    current_timestamp + interval '10 day'
  ),
  (
    (SELECT uuid from public.users WHERE users.handle = 'DarrenDev' LIMIT 1),
    'Guess that makes me the third wheel then.',
    current_timestamp + interval '10 day'
  );