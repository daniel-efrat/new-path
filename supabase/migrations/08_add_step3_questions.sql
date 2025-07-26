-- Add Step 3 questions to the questions table
-- These are English language assessment questions
-- Note: Using step_number=3 and storing correct answer index in answer_options.correct_option

INSERT INTO questions (id, step_number, question_text, question_type, answer_options) VALUES
('12345678-1234-5678-9abc-123456789001', 3, 'What is the plural of ''child''?', 'multiple_choice', '{"options": ["Childs", "Children", "Childes", "Child"], "correct_option": 1}'),
('12345678-1234-5678-9abc-123456789002', 3, 'Choose the correct verb form: ''She ___ to the store.''', 'multiple_choice', '{"options": ["Go", "Goes", "Gone", "Going"], "correct_option": 1}'),
('12345678-1234-5678-9abc-123456789003', 3, 'Which of these is a pronoun?', 'multiple_choice', '{"options": ["Run", "Happy", "He", "Quickly"], "correct_option": 2}'),
('12345678-1234-5678-9abc-123456789004', 3, 'What is the past tense of ''eat''?', 'multiple_choice', '{"options": ["Eated", "Ate", "Eaten", "Eat"], "correct_option": 1}'),
('12345678-1234-5678-9abc-123456789005', 3, 'Which of the following is a preposition?', 'multiple_choice', '{"options": ["Run", "Quickly", "Under", "Beautiful"], "correct_option": 2}'),
('12345678-1234-5678-9abc-123456789006', 3, 'Select the correct sentence structure.', 'multiple_choice', '{"options": ["She is a doctor good.", "She a good doctor is.", "She is a good doctor.", "A good doctor she is."], "correct_option": 2}'),
('12345678-1234-5678-9abc-123456789007', 3, 'What does ''it''s'' stand for?', 'multiple_choice', '{"options": ["It is", "It was", "It has", "Possessive form of it"], "correct_option": 0}'),
('12345678-1234-5678-9abc-123456789008', 3, 'Which word is an adjective?', 'multiple_choice', '{"options": ["Sing", "Song", "Beautifully", "Beautiful"], "correct_option": 3}'),
('12345678-1234-5678-9abc-123456789009', 3, 'Choose the correct form: ''They ___ watching TV.''', 'multiple_choice', '{"options": ["is", "am", "are", "be"], "correct_option": 2}'),
('12345678-1234-5678-9abc-123456789010', 3, 'What is the comparative form of ''good''?', 'multiple_choice', '{"options": ["Gooder", "More good", "Better", "Best"], "correct_option": 2}'),
('12345678-1234-5678-9abc-123456789011', 3, 'Which sentence uses punctuation correctly?', 'multiple_choice', '{"options": ["Lets eat grandma.", "Let''s eat, grandma.", "Lets eat, grandma.", "Let''s eat grandma."], "correct_option": 1}'),
('12345678-1234-5678-9abc-123456789012', 3, 'Identify the noun in the sentence: ''The cat slept peacefully.''', 'multiple_choice', '{"options": ["The", "cat", "slept", "peacefully"], "correct_option": 1}'),
('12345678-1234-5678-9abc-123456789013', 3, 'What is the opposite of ''happy''?', 'multiple_choice', '{"options": ["Angry", "Sad", "Excited", "Tired"], "correct_option": 1}'),
('12345678-1234-5678-9abc-123456789014', 3, 'Which of these is a conjunction?', 'multiple_choice', '{"options": ["And", "On", "Jump", "Quick"], "correct_option": 0}'),
('12345678-1234-5678-9abc-123456789015', 3, 'Choose the correct spelling.', 'multiple_choice', '{"options": ["Neccessary", "Necesary", "Necessary", "Necessery"], "correct_option": 2}'),
('12345678-1234-5678-9abc-123456789016', 3, 'What type of word is ''quickly''?', 'multiple_choice', '{"options": ["Adjective", "Verb", "Noun", "Adverb"], "correct_option": 3}'),
('12345678-1234-5678-9abc-123456789017', 3, 'Which sentence is in the passive voice?', 'multiple_choice', '{"options": ["The dog chased the ball.", "The ball was chased by the dog.", "The dog is chasing the ball.", "The ball is being chased by the dog."], "correct_option": 1}'),
('12345678-1234-5678-9abc-123456789018', 3, 'What is the superlative form of ''big''?', 'multiple_choice', '{"options": ["Bigger", "Biggest", "More big", "Most big"], "correct_option": 1}'),
('12345678-1234-5678-9abc-123456789019', 3, 'Fill in the blank: ''She has been waiting ___ a long time.''', 'multiple_choice', '{"options": ["for", "since", "at", "in"], "correct_option": 0}'),
('12345678-1234-5678-9abc-123456789020', 3, 'Which of the following is a modal verb?', 'multiple_choice', '{"options": ["Can", "Eat", "Play", "Walk"], "correct_option": 0}');
