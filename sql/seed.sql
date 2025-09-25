-- Insert stories
INSERT INTO public.stories (id, title, author, description, cover_image_url, audio_url, tags, is_premium, duration_minutes) VALUES
('11111111-1111-1111-1111-111111111111', 'Forbidden Desire: One Year To Love', 'Amelia Hayes', 
 'With one year left to live, Abigail pursues cold-hearted billionaire Quentin Blackwood, determined to experience love before she dies. As she enters his dangerous world, Abigail must navigate growing passion and protect her heart while the clock ticks down on her life.',
 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80', '#', 
 ARRAY['romance', 'drama'], true, 32),

('22222222-2222-2222-2222-222222222222', 'My Handsome Bodyguard', 'Lucas Grant', 
 'A determined CEO hires a mysterious bodyguard who hides a past that could shatter their worlds.',
 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=800&q=80', '#', 
 ARRAY['thriller', 'romance'], true, 29),

('33333333-3333-3333-3333-333333333333', 'Memory Hack', 'Zoe Walters', 
 'An investigative journalist discovers an underground clinic that lets clients rewrite the past.',
 'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=800&q=80', '#', 
 ARRAY['sci-fi', 'mystery'], false, 24),

('44444444-4444-4444-4444-444444444444', 'Secrets of Serenity Brook', 'Evelyn Cho', 
 'Two rival families in a quiet seaside town unravel a long-buried conspiracy.',
 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80', '#', 
 ARRAY['mystery'], false, 26),

('55555555-5555-5555-5555-555555555555', 'Alpha Heir', 'Jace Sinclair', 
 'A runaway shifter princess returns to claim her throne and the mate she left behind.',
 'https://images.unsplash.com/photo-1521579971123-1192931a1452?auto=format&fit=crop&w=800&q=80', '#', 
 ARRAY['fantasy'], true, 31),

('66666666-6666-6666-6666-666666666666', 'Love in the Storm', 'Isabella Reed', 
 'Stranded during a typhoon, two enemies must rely on each other to make it out alive.',
 'https://images.unsplash.com/photo-1525181261060-3a983f9d1781?auto=format&fit=crop&w=800&q=80', '#', 
 ARRAY['romance', 'adventure'], false, 27);

-- Insert episodes
INSERT INTO public.episodes (story_id, title, duration, listens, episode_number, is_premium) VALUES
('11111111-1111-1111-1111-111111111111', 'Episode 1 - Listening Now', '10 min 26 sec', '6K+', 1, false),
('11111111-1111-1111-1111-111111111111', 'Episode 2 - Collision Course', '9 min 44 sec', '5K+', 2, false),
('11111111-1111-1111-1111-111111111111', 'Episode 3 - Shattered Promises', '8 min 12 sec', '3K+', 3, false),
('11111111-1111-1111-1111-111111111111', 'Episode 4 - The Deal', '7 min 48 sec', '2K+', 4, false),
('11111111-1111-1111-1111-111111111111', 'Episode 5 - Midnight Confessions', '7 min 32 sec', '1.5K+', 5, true);

-- Insert categories
INSERT INTO public.categories (id, title, description) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dangerous Attractions', null),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Unlock Your Mind Today', null),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Dark Obsessions', null),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'New Releases', null);

-- Insert category_stories relationships
INSERT INTO public.category_stories (category_id, story_id, position) VALUES
-- Dangerous Attractions
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 0),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 1),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 2),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '66666666-6666-6666-6666-666666666666', 3),

-- Unlock Your Mind Today
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 0),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 1),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666', 2),

-- Dark Obsessions
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 0),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 1),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555555', 2),

-- New Releases
('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 0),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', 1),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 2);