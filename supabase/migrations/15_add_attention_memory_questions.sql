INSERT INTO public.questions (id, step_number, question_text, question_type, answer_options)
VALUES
  ('90110000-0000-4000-8000-000000000001'::uuid, 11, 'כמה פעמים מופיעה האות ק ברצף הבא?', 'attention_memory', '{"options":["3","4","5","6"],"correct_option":1,"level":"קשב חזותי","category":"קשב","stimulus":"ר ק ב מ ק ת כ ק ש ד ק"}'::jsonb),
  ('90110000-0000-4000-8000-000000000002'::uuid, 11, 'איזו רשימה כוללת רק את המספרים הזוגיים הגדולים מ-50?', 'attention_memory', '{"options":["64, 88, 60","42, 64, 88, 60","64, 71, 88","88, 53, 60"],"correct_option":0,"level":"סינון מידע","category":"סינון מידע","stimulus":"42, 64, 71, 88, 53, 60"}'::jsonb),
  ('90110000-0000-4000-8000-000000000003'::uuid, 11, 'מה היה הרצף בסדר הפוך?', 'attention_memory', '{"options":["4 - 9 - 2 - 7","7 - 2 - 9 - 4","4 - 2 - 9 - 7","9 - 4 - 7 - 2"],"correct_option":0,"level":"זיכרון עבודה","category":"זיכרון עבודה","stimulus":"7 - 2 - 9 - 4","stimulus_seconds":5}'::jsonb),
  ('90110000-0000-4000-8000-000000000004'::uuid, 11, 'איזה סימן מופיע הכי הרבה ברצף?', 'attention_memory', '{"options":["▲","●","■","כולם מופיעים אותו מספר פעמים"],"correct_option":0,"level":"קשב מתמשך","category":"קשב","stimulus":"▲ ● ▲ ■ ▲ ● ■ ▲"}'::jsonb),
  ('90110000-0000-4000-8000-000000000005'::uuid, 11, 'התעלם/י מהמילים. כמה מספרים מופיעים ברצף?', 'attention_memory', '{"options":["2","3","4","5"],"correct_option":1,"level":"סינון מסיחים","category":"סינון מידע","stimulus":"כחול 8 ירוק 3 אדום 9 צהוב"}'::jsonb),
  ('90110000-0000-4000-8000-000000000006'::uuid, 11, 'מה הופיע שני ברצף?', 'attention_memory', '{"options":["עיגול","ריבוע","משולש","כוכב"],"correct_option":1,"level":"זיכרון חזותי","category":"זיכרון עבודה","stimulus":"עיגול, ריבוע, משולש, כוכב","stimulus_seconds":5}'::jsonb),
  ('90110000-0000-4000-8000-000000000007'::uuid, 11, 'מה שונה ברצף?', 'attention_memory', '{"options":["ABCD הראשון","ABCD השני","ABDC","ABCD האחרון"],"correct_option":2,"level":"קשב לפרטים","category":"קשב","stimulus":"ABCD, ABCD, ABDC, ABCD"}'::jsonb),
  ('90110000-0000-4000-8000-000000000008'::uuid, 11, 'בחר/י את הפריט שמתחיל באות מ ומכיל 4 אותיות.', 'attention_memory', '{"options":["מחשב","מדף","כיסא","מחברת"],"correct_option":1,"level":"סינון לפי כלל","category":"סינון מידע","stimulus":"מחשב, מדף, כיסא, מחברת"}'::jsonb),
  ('90110000-0000-4000-8000-000000000009'::uuid, 11, 'מה היה המספר השלישי ברצף?', 'attention_memory', '{"options":["3","6","2","8"],"correct_option":2,"level":"זיכרון עבודה","category":"זיכרון עבודה","stimulus":"3, 6, 2, 8, 1","stimulus_seconds":5}'::jsonb),
  ('90110000-0000-4000-8000-000000000010'::uuid, 11, 'כמה מספרים אי-זוגיים מופיעים ברצף?', 'attention_memory', '{"options":["2","3","4","5"],"correct_option":1,"level":"קשב מספרי","category":"קשב","stimulus":"12, 7, 9, 24, 31, 40"}'::jsonb),
  ('90110000-0000-4000-8000-000000000011'::uuid, 11, 'התעלם/י מכל מספר קטן מ-5. מה סכום המספרים שנשארו?', 'attention_memory', '{"options":["10","12","14","16"],"correct_option":2,"level":"סינון וחישוב","category":"סינון מידע","stimulus":"2, 8, 4, 6, 1"}'::jsonb),
  ('90110000-0000-4000-8000-000000000012'::uuid, 11, 'איזו מילה לא הופיעה ברצף?', 'attention_memory', '{"options":["אור","דרך","זמן","ספר"],"correct_option":2,"level":"זיכרון מילולי","category":"זיכרון עבודה","stimulus":"חלון, דרך, אור, ספר","stimulus_seconds":6}'::jsonb),
  ('90110000-0000-4000-8000-000000000013'::uuid, 11, 'כמה פעמים מופיע הרצף 13?', 'attention_memory', '{"options":["2","3","4","5"],"correct_option":2,"level":"קשב חזותי","category":"קשב","stimulus":"131, 213, 134, 513, 31"}'::jsonb),
  ('90110000-0000-4000-8000-000000000014'::uuid, 11, 'אם המילה היא שם של צבע, בחר/י כן. אם לא, בחר/י לא.', 'attention_memory', '{"options":["כן","לא","לא ניתן לדעת","רק אם המילה צבועה"],"correct_option":1,"level":"עיכוב תגובה","category":"סינון מידע","stimulus":"שולחן"}'::jsonb),
  ('90110000-0000-4000-8000-000000000015'::uuid, 11, 'מה הגיע אחרי המילה עבודה?', 'attention_memory', '{"options":["בוקר","שיחה","סיכום","עבודה"],"correct_option":1,"level":"זיכרון וסדר","category":"זיכרון עבודה","stimulus":"בוקר > עבודה > שיחה > סיכום","stimulus_seconds":5}'::jsonb)
ON CONFLICT (id) DO UPDATE
SET step_number = EXCLUDED.step_number,
    question_text = EXCLUDED.question_text,
    question_type = EXCLUDED.question_type,
    answer_options = EXCLUDED.answer_options;

NOTIFY pgrst, 'reload schema';
