--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6 (Ubuntu 16.6-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.6 (Ubuntu 16.6-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.items (id, name, type, price_gold, price_silver, price_bronze, image_url, style_class) VALUES (6, 'Desert', 'background', 1, 0, 0, 'images/desert.webp', NULL);
INSERT INTO public.items (id, name, type, price_gold, price_silver, price_bronze, image_url, style_class) VALUES (8, 'Ocean', 'background', 1, 0, 0, 'images/ocean.jpg', NULL);
INSERT INTO public.items (id, name, type, price_gold, price_silver, price_bronze, image_url, style_class) VALUES (9, 'Plains', 'background', 1, 0, 0, 'images/plains.jpg', NULL);
INSERT INTO public.items (id, name, type, price_gold, price_silver, price_bronze, image_url, style_class) VALUES (5, 'Swamp', 'background', 1, 0, 0, 'images/swamp1.jpg', NULL);
INSERT INTO public.items (id, name, type, price_gold, price_silver, price_bronze, image_url, style_class) VALUES (1, 'Forest', 'background', 10, 0, 0, '/images/forest.jpg', NULL);
INSERT INTO public.items (id, name, type, price_gold, price_silver, price_bronze, image_url, style_class) VALUES (10, 'Beach Dog', 'avatar', 1, 0, 0, 'images/beachDog.jpg', NULL);
INSERT INTO public.items (id, name, type, price_gold, price_silver, price_bronze, image_url, style_class) VALUES (11, 'Corgi', 'avatar', 1, 0, 0, 'images/corgi.jpg', NULL);
INSERT INTO public.items (id, name, type, price_gold, price_silver, price_bronze, image_url, style_class) VALUES (12, 'Golden Retriever', 'avatar', 1, 0, 0, 'images/golden-ret.jpg', NULL);
INSERT INTO public.items (id, name, type, price_gold, price_silver, price_bronze, image_url, style_class) VALUES (13, 'Labrador', 'avatar', 1, 0, 0, 'images/lab-ret.jpg', NULL);
INSERT INTO public.items (id, name, type, price_gold, price_silver, price_bronze, image_url, style_class) VALUES (14, 'Pug', 'avatar', 1, 0, 0, 'images/pug.jpg', NULL);
INSERT INTO public.items (id, name, type, price_gold, price_silver, price_bronze, image_url, style_class) VALUES (15, 'Sad Eyes', 'avatar', 1, 0, 0, 'images/sadeyes.jpg', NULL);
INSERT INTO public.items (id, name, type, price_gold, price_silver, price_bronze, image_url, style_class) VALUES (16, 'Red', 'card', 1, 2, 0, NULL, 'red-card');
INSERT INTO public.items (id, name, type, price_gold, price_silver, price_bronze, image_url, style_class) VALUES (17, 'Blue', 'card', 1, 2, 0, NULL, 'blue-card');
INSERT INTO public.items (id, name, type, price_gold, price_silver, price_bronze, image_url, style_class) VALUES (18, 'Green', 'card', 1, 2, 0, NULL, 'green-card');
INSERT INTO public.items (id, name, type, price_gold, price_silver, price_bronze, image_url, style_class) VALUES (19, 'Purple', 'card', 1, 2, 0, NULL, 'purple-card');
INSERT INTO public.items (id, name, type, price_gold, price_silver, price_bronze, image_url, style_class) VALUES (20, 'Gold', 'card', 1, 2, 0, NULL, 'gold-card');
INSERT INTO public.items (id, name, type, price_gold, price_silver, price_bronze, image_url, style_class) VALUES (21, 'Platinum', 'card', 50, 0, 0, NULL, 'platinum-card');
INSERT INTO public.items (id, name, type, price_gold, price_silver, price_bronze, image_url, style_class) VALUES (22, 'Diamond', 'card', 50, 0, 0, NULL, 'diamond-card');
INSERT INTO public.items (id, name, type, price_gold, price_silver, price_bronze, image_url, style_class) VALUES (23, 'Rainbow', 'card', 50, 0, 0, NULL, 'rainbow-card');


--
-- Name: items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.items_id_seq', 23, true);


--
-- PostgreSQL database dump complete
--

