-- Fixed data.sql with INSERT statements instead of COPY

-- Disable triggers temporarily to avoid the automatic item assignment
DO $$
BEGIN
  -- Check if the trigger exists before trying to disable it
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_default_background_trigger') THEN
    EXECUTE 'ALTER TABLE users DISABLE TRIGGER set_default_background_trigger';
  END IF;
END $$;

-- Items table first (to satisfy foreign key constraints)
INSERT INTO public.items (id, name, type, price_gold, price_silver, price_bronze, image_url, style_class) VALUES
(16, 'Red', 'card', 1, 2, 0, NULL, 'red-card'),
(17, 'Blue', 'card', 1, 2, 0, NULL, 'blue-card'),
(18, 'Green', 'card', 1, 2, 0, NULL, 'green-card'),
(19, 'Purple', 'card', 1, 2, 0, NULL, 'purple-card'),
(20, 'Gold', 'card', 1, 2, 0, NULL, 'gold-card'),
(21, 'Platinum', 'card', 50, 0, 0, NULL, 'platinum-card'),
(22, 'Diamond', 'card', 50, 0, 0, NULL, 'diamond-card'),
(23, 'Rainbow', 'card', 50, 0, 0, NULL, 'rainbow-card'),
(24, 'Autumn', 'background', 10, 5, 0, 'images/autumn.jpg', NULL),
(25, 'Cloudy Lighthouse', 'background', 20, 0, 0, '/images/cloudyCastle.jpg', NULL),
(26, 'Farmland', 'background', 5, 10, 10, 'images/farmland.jpg', NULL),
(27, 'Flower Bed', 'background', 10, 10, 10, 'images/flowerbed.jpg', NULL),
(28, 'Glassy Lake', 'background', 25, 0, 5, 'images/glassyLake.jpg', NULL),
(29, 'Grassy Plains', 'background', 10, 0, 0, 'images/grassSky.jpg', NULL),
(30, 'Green Path', 'background', 10, 0, 0, 'images/grassyPath.jpg', NULL),
(31, 'Peaceful Path', 'background', 10, 5, 5, 'images/lonelyChair.jpg', NULL),
(32, 'Still Night', 'background', 20, 10, 10, 'images/lonelyTree.jpg', NULL),
(33, 'Misty Lake', 'background', 20, 10, 10, 'images/mistyLake.jpg', NULL),
(34, 'Moon Sunset', 'background', 5, 5, 5, 'images/moonSunset.jpg', NULL),
(35, 'Northern Lights', 'background', 5, 5, 5, 'images/northernlights.jpg', NULL),
(36, 'Ocean Sunset', 'background', 5, 5, 5, 'images/oceanSunset.jpg', NULL),
(37, 'Red Flight', 'background', 20, 20, 20, 'images/redSunset.jpg', NULL),
(38, 'Jungle River', 'background', 5, 5, 5, 'images/riverJungle.jpg', NULL),
(39, 'Snowy Alps', 'background', 10, 10, 10, 'images/snowyAlps.jpg', NULL),
(40, 'Bamboo', 'avatar', 10, 10, 10, 'images/bamboo.jpg', NULL),
(41, 'Kitten', 'avatar', 10, 0, 0, 'images/cat.jpg', NULL),
(42, 'Cheetah', 'avatar', 20, 10, 10, 'images/cheetah.jpg', NULL),
(43, 'Chickling', 'avatar', 10, 5, 5, 'images/chickling.jpg', NULL),
(44, 'Dolphin', 'avatar', 20, 20, 20, 'images/dolphin.jpg', NULL),
(45, 'Bald Eagle', 'avatar', 30, 20, 10, 'images/eagle.jpg', NULL),
(46, 'Fox', 'avatar', 30, 30, 30, 'images/fox.jpg', NULL),
(47, 'Frog', 'avatar', 10, 10, 10, 'images/gecko.jpg', NULL),
(48, 'Goldfish', 'avatar', 5, 5, 5, 'images/goldfish.jpg', NULL),
(49, 'Hippo', 'avatar', 10, 10, 10, 'images/hippo.jpg', NULL),
(50, 'Horse', 'avatar', 10, 10, 10, 'images/horse.jpg', NULL),
(51, 'Hyena', 'avatar', 20, 20, 10, 'images/hyena.jpg', NULL),
(52, 'Iguana', 'avatar', 20, 20, 20, 'images/iguana.jpg', NULL),
(53, 'Jellyfish', 'avatar', 20, 20, 20, 'images/jellyFish.jpg', NULL),
(54, 'Kawoli', 'avatar', 10, 20, 10, 'images/kawoli.jpg', NULL),
(55, 'Lemur', 'avatar', 20, 20, 10, 'images/lemur.jpg', NULL),
(56, 'Llama', 'avatar', 6, 5, 4, 'images/llama.jpg', NULL),
(57, 'Owl', 'avatar', 30, 20, 10, 'images/owl.jpg', NULL),
(58, 'Panda', 'avatar', 10, 20, 30, 'images/panda.jpg', NULL),
(59, 'Parrot', 'avatar', 20, 20, 20, 'images/parrot.jpg', NULL),
(60, 'Peacock', 'avatar', 30, 30, 30, 'images/peacock.jpg', NULL),
(61, 'Pelican', 'avatar', 10, 20, 40, 'images/pelican.jpg', NULL),
(62, 'Penguin', 'avatar', 20, 30, 10, 'images/penguin.jpg', NULL),
(63, 'Rabbit', 'avatar', 40, 30, 20, 'images/rabbit.jpg', NULL),
(64, 'Rhino', 'avatar', 20, 20, 10, 'images/rhino.jpg', NULL),
(65, 'Rooster', 'avatar', 5, 10, 10, 'images/rooster.jpg', NULL),
(68, 'Sharky', 'avatar', 20, 20, 20, 'images/shark.jpg', NULL),
(69, 'Sheep', 'avatar', 10, 20, 10, 'images/sheep.jpg', NULL),
(70, 'Squirrel', 'avatar', 30, 20, 20, 'images/squirrel.jpg', NULL),
(71, 'Tiger', 'avatar', 50, 40, 30, 'images/tiger.jpg', NULL),
(72, 'Zebra', 'avatar', 20, 10, 20, 'images/zebra.jpg', NULL),
(73, 'Shark', 'avatar', 20, 10, 20, 'images/GWShark.jpg', NULL);

-- Users table
INSERT INTO public.users (id, username, email, password) VALUES
(1, 'test', 'test@gmail.com', 'test'),
(2, 'tests', 'tests@gmail.com', 'tests'),
(3, 'back', 'back@gmail.com', 'back'),
(4, 'ba', 'ba@gmail.com', 'ba'),
(999, 'TestUser', 'test@example.com', 'hashed_password');

-- AAInvites table
INSERT INTO public.aainvites (id, from_username, to_username, status, created_at, updated_at) VALUES
(14, 'test', 'tests', 'Accepted', '2025-03-31 12:01:40.45078', '2025-03-31 12:01:40.45078'),
(15, 'test', 'tests', 'Accepted', '2025-03-31 12:06:31.137743', '2025-03-31 12:06:31.137743'),
(16, 'tests', 'test', 'Accepted', '2025-03-31 12:07:36.602998', '2025-03-31 12:07:36.602998');

-- Achievements table
INSERT INTO public.achievements (id, user_id, score, bronze, silver, gold) VALUES
(3, 4, 4, 0, 0, 0),
(2, 2, 2, 0, 0, 0),
(1, 1, 12626, 9409, 9344, 9110);

-- Daily challenges table
INSERT INTO public.daily_challenges (id, date, game, variation, goal, reward, created_at) VALUES
(1, '2025-04-17', 'Hangman', '5 guesses,Timer,Two words instead of one', 'Guess both words in 60s with 5 tries', 50, '2025-04-17 11:45:13.95044'),
(8, '2025-04-18', 'Tiles of Terror', 'Extra Imposter', '30 Seconds instead of 60!', 1, '2025-04-18 11:30:00'),
(9, '2025-04-21', 'Tiles of Terror', 'Time Crunch', 'Complete the level under strict time.', 1, '2025-04-21 12:42:57.72523'),
(10, '2025-04-22', 'Click-a-Palooza', 'Target Specific, Moving Mayhem, Quick Reflex', 'Good Luck', 50, '2025-04-22 13:52:39.817213');

-- Invites table
INSERT INTO public.invites (id, from_username, to_username, status, created_at, updated_at) VALUES
(89, 'test', 'tests', 'Accepted', '2025-04-21 11:33:51.751075', '2025-04-21 11:33:51.751075');

-- User items with ON CONFLICT DO NOTHING to handle duplicates
INSERT INTO public.user_items (user_id, item_id, equipped) VALUES
(1, 16, false),
(1, 21, false),
(1, 23, false),
(1, 17, false),
(4, 25, true),
(3, 25, true),
(2, 25, true),
(999, 25, true),
(1, 73, false),
(1, 44, false),
(1, 45, false),
(1, 47, false),
(1, 48, false),
(1, 49, false),
(1, 50, false),
(1, 51, false),
(1, 52, false),
(1, 53, false),
(1, 54, false),
(1, 55, false),
(1, 56, false),
(1, 57, false),
(1, 58, false),
(1, 60, false),
(1, 61, false),
(1, 20, false),
(1, 62, false),
(1, 63, false),
(1, 22, true),
(1, 64, false),
(1, 65, false),
(1, 68, false),
(1, 69, false),
(1, 70, false),
(1, 71, false),
(1, 72, false),
(1, 40, false),
(1, 46, false),
(1, 59, false),
(1, 42, false),
(1, 43, false),
(1, 41, true),
(1, 39, false),
(1, 37, false),
(1, 34, false),
(1, 27, false),
(1, 28, false),
(1, 32, false),
(1, 31, false),
(1, 38, false),
(1, 29, false),
(1, 26, false),
(1, 25, false),
(1, 30, false),
(1, 35, false),
(1, 33, false),
(1, 24, false),
(1, 36, true)
ON CONFLICT (user_id, item_id) DO NOTHING;

-- Leaderboards table (first 50 entries)
INSERT INTO public.leaderboards (id, user_id, game_name, score, create_at) VALUES
(1, 1, 'Hangman', 14, '2025-02-27 13:42:54.556016-07'),
(2, 1, 'Hangman', 14, '2025-02-27 13:42:54.594584-07'),
(3, 1, 'Hangman', 7, '2025-02-27 14:42:49.106043-07'),
(4, 1, 'Hangman', 7, '2025-02-27 14:42:49.127967-07'),
(5, 1, 'Hangman', 11, '2025-02-27 14:49:12.589784-07'),
(6, 1, 'Hangman', 14, '2025-02-28 12:41:11.47786-07'),
(7, 1, 'Alpha Arena', 5, '2025-02-28 13:09:24.304566-07'),
(8, 1, 'Terminology Twisters', 0, '2025-02-28 13:09:51.075028-07'),
(9, 1, 'Terminology Twisters', 3, '2025-02-28 13:16:17.412834-07'),
(10, 1, 'Terminology Twisters', 0, '2025-02-28 13:16:47.766865-07'),
(11, 1, 'Terminology Twisters', 4, '2025-02-28 13:20:37.183808-07'),
(12, 1, 'Terminology Twisters', 4, '2025-02-28 13:21:10.909302-07'),
(13, 1, 'Terminology Twisters', 4, '2025-02-28 13:28:16.519302-07'),
(14, 1, 'Click-a-Palooza', 1, '2025-02-28 13:39:23.613905-07'),
(15, 1, 'Tiles of Terror', 30, '2025-02-28 13:41:42.270693-07'),
(16, 1, 'Copy Cat', 1, '2025-02-28 13:47:56.22938-07'),
(17, 1, 'Copy Cat', 2, '2025-02-28 13:48:06.616756-07'),
(18, 1, 'Copy Cat', 3, '2025-02-28 13:50:45.04003-07'),
(19, 1, 'Copy Cat', 4, '2025-02-28 14:07:21.837077-07'),
(20, 1, 'Copy Cat', 0, '2025-02-28 14:07:41.510964-07'),
(21, 1, 'Copy Cat', 0, '2025-02-28 14:07:58.726985-07'),
(22, 1, 'Copy Cat', 0, '2025-02-28 14:08:48.316222-07'),
(23, 1, 'Hangman', 10, '2025-03-04 10:16:03.480876-07'),
(24, 1, 'Alpha Arena', 5, '2025-03-04 10:36:39.941191-07'),
(25, 1, 'Alpha Arena', 5, '2025-03-04 10:38:41.177774-07'),
(26, 4, 'Click-a-Palooza', 4, '2025-03-05 14:50:27.231496-07'),
(27, 1, 'Key Clash', 4971, '2025-03-10 11:55:43.543368-07'),
(28, 1, 'Key Clash', 5684, '2025-03-10 12:08:40.419358-07'),
(29, 1, 'Hangman', 8, '2025-03-19 11:33:44.6657-07'),
(30, 1, 'Key Clash (Online)', 0, '2025-03-19 12:54:57.345794-07'),
(31, 1, 'Key Clash (Online)', 0, '2025-03-19 12:54:57.348553-07'),
(32, 2, 'Key Clash (Online)', 431, '2025-03-19 12:54:57.349918-07'),
(33, 2, 'Key Clash (Online)', 431, '2025-03-19 12:54:57.353067-07'),
(34, 2, 'Key Clash (Online)', 412, '2025-03-19 13:02:46.690218-07'),
(35, 1, 'Key Clash (Online)', 1261, '2025-03-19 13:02:46.693378-07'),
(36, 1, 'Key Clash (Online)', 1261, '2025-03-19 13:02:46.696082-07'),
(37, 2, 'Key Clash (Online)', 412, '2025-03-19 13:02:46.705541-07'),
(38, 2, 'Key Clash (Online)', 0, '2025-03-19 13:25:40.4993-07'),
(39, 1, 'Key Clash (Online)', 934, '2025-03-19 13:25:40.504532-07'),
(40, 2, 'Key Clash (Online)', 1126, '2025-03-21 08:25:30.605115-07'),
(41, 1, 'Key Clash (Online)', 0, '2025-03-21 08:25:30.609183-07'),
(42, 1, 'Key Clash', 0, '2025-04-02 09:48:27.172839-07'),
(43, 1, 'Key Clash', 1117, '2025-04-02 09:50:48.400011-07'),
(44, 1, 'Terminology Twisters', 0, '2025-04-02 10:04:49.210285-07'),
(45, 1, 'Terminology Twisters', 0, '2025-04-02 10:30:07.212063-07'),
(46, 1, 'Terminology Twisters', 2, '2025-04-02 10:33:04.397027-07'),
(47, 1, 'Click-a-Palooza', 0, '2025-04-02 10:36:09.107855-07'),
(48, 1, 'Terminology Twisters', 0, '2025-04-02 10:36:12.847588-07'),
(49, 1, 'Click-a-Palooza', 0, '2025-04-02 10:39:46.287246-07'),
(50, 1, 'Click-a-Palooza', 0, '2025-04-02 10:40:55.962361-07');

-- More leaderboards entries
INSERT INTO public.leaderboards (id, user_id, game_name, score, create_at) VALUES
(51, 1, 'Click-a-Palooza', 0, '2025-04-02 10:41:18.740519-07'),
(52, 1, 'Click-a-Palooza', 0, '2025-04-02 10:41:35.140726-07'),
(53, 1, 'Click-a-Palooza', 0, '2025-04-02 10:41:55.260593-07'),
(54, 1, 'Click-a-Palooza', 0, '2025-04-02 10:42:44.529182-07'),
(55, 1, 'Click-a-Palooza', 0, '2025-04-02 10:42:59.639054-07'),
(56, 1, 'Click-a-Palooza', 0, '2025-04-02 10:43:37.532796-07'),
(57, 1, 'Click-a-Palooza', 0, '2025-04-02 10:45:25.516775-07'),
(58, 1, 'Click-a-Palooza', 0, '2025-04-02 10:45:38.426555-07'),
(59, 1, 'Click-a-Palooza', 0, '2025-04-02 10:46:02.660017-07'),
(60, 1, 'Click-a-Palooza', 0, '2025-04-02 10:46:41.388741-07'),
(119, 1, 'Terminology Twisters', 2, '2025-04-18 12:08:31.108074-07'),
(120, 1, 'Tiles of Terror', 0, '2025-04-18 14:43:33.164773-07'),
(121, 1, 'Tiles of Terror', 0, '2025-04-18 14:51:15.599705-07'),
(122, 1, 'Tiles of Terror', 0, '2025-04-18 14:52:22.509367-07'),
(123, 1, 'Tiles of Terror', 2, '2025-04-18 15:01:03.243644-07'),
(124, 2, 'Key Clash (Online)', 76, '2025-04-21 11:35:03.187517-07'),
(125, 1, 'Key Clash (Online)', 52, '2025-04-21 11:35:03.194229-07'),
(126, 1, 'Copy Cat', 4, '2025-04-21 12:43:01.195534-07'),
(127, 1, 'Click-a-Palooza', 0, '2025-04-21 12:43:13.771052-07'),
(128, 1, 'Click-a-Palooza', 24, '2025-04-21 12:43:47.151849-07'),
(129, 1, 'Terminology Twisters', 0, '2025-04-21 12:48:31.562614-07'),
(130, 1, 'Click-a-Palooza', 0, '2025-04-22 13:53:42.540574-07'),
(131, 1, 'Click-a-Palooza', 26, '2025-04-22 13:54:22.537254-07'),
(132, 1, 'Copy Cat', 1, '2025-04-22 13:56:29.693177-07'),
(133, 1, 'Copy Cat', 0, '2025-04-22 13:58:23.936676-07'),
(134, 1, 'Copy Cat', 0, '2025-04-22 13:58:47.837339-07'),
(135, 1, 'Copy Cat', 0, '2025-04-22 13:59:21.390974-07'),
(136, 1, 'Copy Cat', 0, '2025-04-22 14:00:22.90624-07'),
(137, 1, 'Copy Cat', 0, '2025-04-22 14:01:02.682705-07'),
(138, 1, 'Copy Cat', 0, '2025-04-22 14:01:30.752099-07'),
(139, 1, 'Copy Cat', 0, '2025-04-22 14:09:10.137289-07'),
(140, 1, 'Copy Cat', 0, '2025-04-22 14:09:40.531078-07'),
(141, 1, 'Copy Cat', 0, '2025-04-22 14:10:47.323571-07'),
(142, 1, 'Copy Cat', 0, '2025-04-22 14:10:53.69786-07'),
(143, 1, 'Copy Cat', 0, '2025-04-22 14:10:58.654471-07'),
(144, 1, 'Copy Cat', 0, '2025-04-22 14:11:03.399066-07'),
(145, 1, 'Copy Cat', 0, '2025-04-22 14:11:07.862818-07'),
(146, 1, 'Copy Cat', 0, '2025-04-22 14:11:16.736994-07'),
(147, 1, 'Copy Cat', 0, '2025-04-22 14:11:21.294058-07'),
(148, 1, 'Copy Cat', 0, '2025-04-22 14:12:31.589071-07'),
(149, 1, 'Copy Cat', 0, '2025-04-22 14:12:37.561297-07'),
(150, 1, 'Copy Cat', 0, '2025-04-22 14:12:47.177338-07'),
(151, 1, 'Copy Cat', 0, '2025-04-22 14:16:04.296665-07'),
(152, 1, 'Copy Cat', 0, '2025-04-22 14:16:09.953103-07');

-- User challenge log
INSERT INTO public.user_challenge_log (id, user_id, date, completed, streak, created_at) VALUES
(1, 1, '2025-04-18', true, 1, '2025-04-18 11:25:44.051312');

-- User journal entries
INSERT INTO public.user_journal_entries (id, user_id, entry_date, mood, energy, focus, notes) VALUES
(1, 1, '2025-04-16', 5, 5, 5, 'nada'),
(2, 1, '2025-04-17', 4, 3, 4, 'sm');

-- Set sequence values
SELECT pg_catalog.setval('public.aainvites_id_seq', 16, true);
SELECT pg_catalog.setval('public.achievements_id_seq', 7, true);
SELECT pg_catalog.setval('public.daily_challenges_id_seq', 10, true);
SELECT pg_catalog.setval('public.invites_id_seq', 89, true);
SELECT pg_catalog.setval('public.items_id_seq', 73, true);
SELECT pg_catalog.setval('public.leaderboards_id_seq', 152, true);
SELECT pg_catalog.setval('public.user_challenge_log_id_seq', 6, true);
SELECT pg_catalog.setval('public.user_journal_entries_id_seq', 5, true);
SELECT pg_catalog.setval('public.users_id_seq', 4, true);

-- Re-enable triggers if needed
DO $$
BEGIN
  -- Check if the trigger exists before trying to enable it
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_default_background_trigger') THEN
    EXECUTE 'ALTER TABLE users ENABLE TRIGGER set_default_background_trigger';
  END IF;
END $$;