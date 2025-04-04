--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8 (Ubuntu 16.8-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.8 (Ubuntu 16.8-0ubuntu0.24.04.1)

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
-- Name: set_default_background(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_default_background() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO user_items (user_id, item_id, equipped)
    VALUES (NEW.id, 25, true)
    ON CONFLICT (user_id, item_id) DO UPDATE SET equipped = true;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_default_background() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: aainvites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aainvites (
    id integer NOT NULL,
    from_username character varying(255) NOT NULL,
    to_username character varying(255) NOT NULL,
    status character varying(50) DEFAULT 'Pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.aainvites OWNER TO postgres;

--
-- Name: aainvites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.aainvites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aainvites_id_seq OWNER TO postgres;

--
-- Name: aainvites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.aainvites_id_seq OWNED BY public.aainvites.id;


--
-- Name: achievements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.achievements (
    id integer NOT NULL,
    user_id integer NOT NULL,
    score integer DEFAULT 0,
    bronze integer DEFAULT 0,
    silver integer DEFAULT 0,
    gold integer DEFAULT 0
);


ALTER TABLE public.achievements OWNER TO postgres;

--
-- Name: achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.achievements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.achievements_id_seq OWNER TO postgres;

--
-- Name: achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.achievements_id_seq OWNED BY public.achievements.id;


--
-- Name: invites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invites (
    id integer NOT NULL,
    from_username character varying(255) NOT NULL,
    to_username character varying(255) NOT NULL,
    status character varying(50) DEFAULT 'Pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.invites OWNER TO postgres;

--
-- Name: invites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invites_id_seq OWNER TO postgres;

--
-- Name: invites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invites_id_seq OWNED BY public.invites.id;


--
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(50),
    price_gold integer DEFAULT 0,
    price_silver integer DEFAULT 0,
    price_bronze integer DEFAULT 0,
    image_url text,
    style_class character varying(255) DEFAULT NULL::character varying,
    CONSTRAINT items_type_check CHECK (((type)::text = ANY ((ARRAY['background'::character varying, 'avatar'::character varying, 'card'::character varying])::text[])))
);


ALTER TABLE public.items OWNER TO postgres;

--
-- Name: items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.items_id_seq OWNER TO postgres;

--
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;


--
-- Name: leaderboards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leaderboards (
    id integer NOT NULL,
    user_id integer NOT NULL,
    game_name character varying(255) NOT NULL,
    score integer NOT NULL,
    create_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.leaderboards OWNER TO postgres;

--
-- Name: leaderboards_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leaderboards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leaderboards_id_seq OWNER TO postgres;

--
-- Name: leaderboards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leaderboards_id_seq OWNED BY public.leaderboards.id;


--
-- Name: user_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_items (
    user_id integer NOT NULL,
    item_id integer NOT NULL,
    equipped boolean DEFAULT false
);


ALTER TABLE public.user_items OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: aainvites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aainvites ALTER COLUMN id SET DEFAULT nextval('public.aainvites_id_seq'::regclass);


--
-- Name: achievements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievements ALTER COLUMN id SET DEFAULT nextval('public.achievements_id_seq'::regclass);


--
-- Name: invites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invites ALTER COLUMN id SET DEFAULT nextval('public.invites_id_seq'::regclass);


--
-- Name: items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);


--
-- Name: leaderboards id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaderboards ALTER COLUMN id SET DEFAULT nextval('public.leaderboards_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: aainvites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aainvites (id, from_username, to_username, status, created_at, updated_at) FROM stdin;
14	test	tests	Accepted	2025-03-31 12:01:40.45078	2025-03-31 12:01:40.45078
15	test	tests	Accepted	2025-03-31 12:06:31.137743	2025-03-31 12:06:31.137743
16	tests	test	Accepted	2025-03-31 12:07:36.602998	2025-03-31 12:07:36.602998
\.


--
-- Data for Name: achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.achievements (id, user_id, score, bronze, silver, gold) FROM stdin;
3	4	4	0	0	0
1	1	12540	9402	9341	9110
2	2	2	0	0	0
\.


--
-- Data for Name: invites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invites (id, from_username, to_username, status, created_at, updated_at) FROM stdin;
88	test	test	Pending	2025-04-03 11:56:20.787245	2025-04-03 11:56:20.787245
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items (id, name, type, price_gold, price_silver, price_bronze, image_url, style_class) FROM stdin;
16	Red	card	1	2	0	\N	red-card
17	Blue	card	1	2	0	\N	blue-card
18	Green	card	1	2	0	\N	green-card
19	Purple	card	1	2	0	\N	purple-card
20	Gold	card	1	2	0	\N	gold-card
21	Platinum	card	50	0	0	\N	platinum-card
22	Diamond	card	50	0	0	\N	diamond-card
23	Rainbow	card	50	0	0	\N	rainbow-card
24	Autumn	background	10	5	0	images/autumn.jpg	\N
26	Farmland	background	5	10	10	images/farmland.jpg	\N
25	Cloudy Lighthouse	background	20	0	0	/images/cloudyCastle.jpg	\N
27	Flower Bed	background	10	10	10	images/flowerbed.jpg	\N
28	Glassy Lake	background	25	0	5	images/glassyLake.jpg	\N
29	Grassy Plains	background	10	0	0	images/grassSky.jpg	\N
30	Green Path	background	10	0	0	images/grassyPath.jpg	\N
31	Peaceful Path	background	10	5	5	images/lonelyChair.jpg	\N
32	Still Night	background	20	10	10	images/lonelyTree.jpg	\N
33	Misty Lake	background	20	10	10	images/mistyLake.jpg	\N
34	Moon Sunset	background	5	5	5	images/moonSunset.jpg	\N
35	Northern Lights	background	5	5	5	images/northernlights.jpg	\N
36	Ocean Sunset	background	5	5	5	images/oceanSunset.jpg	\N
37	Red Flight	background	20	20	20	images/redSunset.jpg	\N
38	Jungle River	background	5	5	5	images/riverJungle.jpg	\N
39	Snowy Alps	background	10	10	10	images/snowyAlps.jpg	\N
40	Bamboo	avatar	10	10	10	images/bamboo.jpg	\N
41	Kitten	avatar	10	0	0	images/cat.jpg	\N
42	Cheetah	avatar	20	10	10	images/cheetah.jpg	\N
43	Chickling	avatar	10	5	5	images/chickling.jpg	\N
44	Dolphin	avatar	20	20	20	images/dolphin.jpg	\N
45	Bald Eagle	avatar	30	20	10	images/eagle.jpg	\N
46	Fox	avatar	30	30	30	images/fox.jpg	\N
47	Frog	avatar	10	10	10	images/gecko.jpg	\N
48	Goldfish	avatar	5	5	5	images/goldfish.jpg	\N
49	Hippo	avatar	10	10	10	images/hippo.jpg	\N
50	Horse	avatar	10	10	10	images/horse.jpg	\N
51	Hyena	avatar	20	20	10	images/hyena.jpg	\N
52	Iguana	avatar	20	20	20	images/iguana.jpg	\N
53	Jellyfish	avatar	20	20	20	images/jellyFish.jpg	\N
54	Kawoli	avatar	10	20	10	images/kawoli.jpg	\N
55	Lemur	avatar	20	20	10	images/lemur.jpg	\N
56	Llama	avatar	6	5	4	images/llama.jpg	\N
57	Owl	avatar	30	20	10	images/owl.jpg	\N
58	Panda	avatar	10	20	30	images/panda.jpg	\N
59	Parrot	avatar	20	20	20	images/parrot.jpg	\N
60	Peacock	avatar	30	30	30	images/peacock.jpg	\N
61	Pelican	avatar	10	20	40	images/pelican.jpg	\N
62	Penguin	avatar	20	30	10	images/penguin.jpg	\N
63	Rabbit	avatar	40	30	20	images/rabbit.jpg	\N
64	Rhino	avatar	20	20	10	images/rhino.jpg	\N
65	Rooster	avatar	5	10	10	images/rooster.jpg	\N
68	Sharky	avatar	20	20	20	images/shark.jpg	\N
69	Sheep	avatar	10	20	10	images/sheep.jpg	\N
70	Squirrel	avatar	30	20	20	images/squirrel.jpg	\N
71	Tiger	avatar	50	40	30	images/tiger.jpg	\N
72	Zebra	avatar	20	10	20	images/zebra.jpg	\N
73	Shark	avatar	20	10	20	images/GWShark.jpg	\N
\.


--
-- Data for Name: leaderboards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leaderboards (id, user_id, game_name, score, create_at) FROM stdin;
1	1	Hangman	14	2025-02-27 13:42:54.556016-07
2	1	Hangman	14	2025-02-27 13:42:54.594584-07
3	1	Hangman	7	2025-02-27 14:42:49.106043-07
4	1	Hangman	7	2025-02-27 14:42:49.127967-07
5	1	Hangman	11	2025-02-27 14:49:12.589784-07
6	1	Hangman	14	2025-02-28 12:41:11.47786-07
7	1	Alpha Arena	5	2025-02-28 13:09:24.304566-07
8	1	Terminology Twisters	0	2025-02-28 13:09:51.075028-07
9	1	Terminology Twisters	3	2025-02-28 13:16:17.412834-07
10	1	Terminology Twisters	0	2025-02-28 13:16:47.766865-07
11	1	Terminology Twisters	4	2025-02-28 13:20:37.183808-07
12	1	Terminology Twisters	4	2025-02-28 13:21:10.909302-07
13	1	Terminology Twisters	4	2025-02-28 13:28:16.519302-07
14	1	Click-a-Palooza	1	2025-02-28 13:39:23.613905-07
15	1	Tiles of Terror	30	2025-02-28 13:41:42.270693-07
16	1	Copy Cat	1	2025-02-28 13:47:56.22938-07
17	1	Copy Cat	2	2025-02-28 13:48:06.616756-07
18	1	Copy Cat	3	2025-02-28 13:50:45.04003-07
19	1	Copy Cat	4	2025-02-28 14:07:21.837077-07
20	1	Copy Cat	0	2025-02-28 14:07:41.510964-07
21	1	Copy Cat	0	2025-02-28 14:07:58.726985-07
22	1	Copy Cat	0	2025-02-28 14:08:48.316222-07
23	1	Hangman	10	2025-03-04 10:16:03.480876-07
24	1	Alpha Arena	5	2025-03-04 10:36:39.941191-07
25	1	Alpha Arena	5	2025-03-04 10:38:41.177774-07
26	4	Click-a-Palooza	4	2025-03-05 14:50:27.231496-07
27	1	Key Clash	4971	2025-03-10 11:55:43.543368-07
28	1	Key Clash	5684	2025-03-10 12:08:40.419358-07
29	1	Hangman	8	2025-03-19 11:33:44.6657-07
30	1	Key Clash (Online)	0	2025-03-19 12:54:57.345794-07
31	1	Key Clash (Online)	0	2025-03-19 12:54:57.348553-07
32	2	Key Clash (Online)	431	2025-03-19 12:54:57.349918-07
33	2	Key Clash (Online)	431	2025-03-19 12:54:57.353067-07
34	2	Key Clash (Online)	412	2025-03-19 13:02:46.690218-07
35	1	Key Clash (Online)	1261	2025-03-19 13:02:46.693378-07
36	1	Key Clash (Online)	1261	2025-03-19 13:02:46.696082-07
37	2	Key Clash (Online)	412	2025-03-19 13:02:46.705541-07
38	2	Key Clash (Online)	0	2025-03-19 13:25:40.4993-07
39	1	Key Clash (Online)	934	2025-03-19 13:25:40.504532-07
40	2	Key Clash (Online)	1126	2025-03-21 08:25:30.605115-07
41	1	Key Clash (Online)	0	2025-03-21 08:25:30.609183-07
42	1	Key Clash	0	2025-04-02 09:48:27.172839-07
43	1	Key Clash	1117	2025-04-02 09:50:48.400011-07
44	1	Terminology Twisters	0	2025-04-02 10:04:49.210285-07
45	1	Terminology Twisters	0	2025-04-02 10:30:07.212063-07
46	1	Terminology Twisters	2	2025-04-02 10:33:04.397027-07
47	1	Click-a-Palooza	0	2025-04-02 10:36:09.107855-07
48	1	Terminology Twisters	0	2025-04-02 10:36:12.847588-07
49	1	Click-a-Palooza	0	2025-04-02 10:39:46.287246-07
50	1	Click-a-Palooza	0	2025-04-02 10:40:55.962361-07
51	1	Click-a-Palooza	0	2025-04-02 10:41:18.740519-07
52	1	Click-a-Palooza	0	2025-04-02 10:41:35.140726-07
53	1	Click-a-Palooza	0	2025-04-02 10:41:55.260593-07
54	1	Click-a-Palooza	0	2025-04-02 10:42:44.529182-07
55	1	Click-a-Palooza	0	2025-04-02 10:42:59.639054-07
56	1	Click-a-Palooza	0	2025-04-02 10:43:37.532796-07
57	1	Click-a-Palooza	0	2025-04-02 10:45:25.516775-07
58	1	Click-a-Palooza	0	2025-04-02 10:45:38.426555-07
59	1	Click-a-Palooza	0	2025-04-02 10:46:02.660017-07
60	1	Click-a-Palooza	0	2025-04-02 10:46:41.388741-07
61	1	Click-a-Palooza	0	2025-04-02 10:46:53.26594-07
62	1	Click-a-Palooza	0	2025-04-02 10:48:00.646597-07
63	1	Click-a-Palooza	0	2025-04-02 10:48:47.66149-07
64	1	Click-a-Palooza	0	2025-04-02 10:49:17.243759-07
65	1	Click-a-Palooza	0	2025-04-02 10:49:29.626645-07
66	1	Click-a-Palooza	0	2025-04-02 10:49:44.477784-07
67	1	Click-a-Palooza	0	2025-04-02 10:49:58.817571-07
68	1	Click-a-Palooza	0	2025-04-02 10:50:33.280469-07
69	1	Click-a-Palooza	0	2025-04-02 10:50:54.72076-07
70	1	Click-a-Palooza	0	2025-04-02 10:51:08.054371-07
71	1	Click-a-Palooza	0	2025-04-02 10:52:00.451944-07
72	1	Tiles of Terror	0	2025-04-02 11:04:14.413666-07
73	1	Tiles of Terror	8	2025-04-02 11:06:50.210009-07
74	1	Click-a-Palooza	16	2025-04-02 11:15:06.710398-07
75	1	Copy Cat	0	2025-04-02 11:15:44.317222-07
76	1	Copy Cat	0	2025-04-02 11:18:26.708247-07
77	1	Copy Cat	0	2025-04-02 11:20:12.845399-07
78	1	Copy Cat	1	2025-04-02 11:21:32.303147-07
79	1	Hangman	12	2025-04-02 15:01:11.64298-07
80	1	Alpha Arena	5	2025-04-02 15:06:07.932182-07
81	2	Alpha Arena	0	2025-04-04 08:12:30.745625-07
\.


--
-- Data for Name: user_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_items (user_id, item_id, equipped) FROM stdin;
1	41	f
1	73	f
1	43	f
1	44	f
1	45	f
1	47	f
1	48	f
1	49	f
1	50	f
1	51	f
1	52	f
1	53	f
1	54	f
1	55	f
1	56	f
1	57	f
1	16	f
1	21	f
1	23	f
1	17	f
1	25	t
4	25	t
3	25	t
2	25	t
999	25	t
1	58	f
1	60	f
1	61	f
1	62	f
1	63	f
1	64	f
1	65	f
1	20	f
1	68	f
1	69	f
1	22	t
1	70	f
1	71	f
1	72	f
1	40	f
1	46	f
1	59	f
1	42	t
1	31	f
1	38	f
1	30	f
1	39	f
1	35	f
1	36	f
1	29	f
1	33	f
1	24	f
1	26	f
1	37	f
1	34	f
1	27	f
1	28	f
1	32	f
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password) FROM stdin;
1	test	test@gmail.com	test
2	tests	tests@gmail.com	tests
3	back	back@gmail.com	back
4	ba	ba@gmail.com	ba
999	TestUser	test@example.com	hashed_password
\.


--
-- Name: aainvites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aainvites_id_seq', 16, true);


--
-- Name: achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.achievements_id_seq', 7, true);


--
-- Name: invites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invites_id_seq', 88, true);


--
-- Name: items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.items_id_seq', 73, true);


--
-- Name: leaderboards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leaderboards_id_seq', 81, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: aainvites aainvites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aainvites
    ADD CONSTRAINT aainvites_pkey PRIMARY KEY (id);


--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- Name: invites invites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invites
    ADD CONSTRAINT invites_pkey PRIMARY KEY (id);


--
-- Name: items items_name_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_name_type_key UNIQUE (name, type);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: leaderboards leaderboards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaderboards
    ADD CONSTRAINT leaderboards_pkey PRIMARY KEY (id);


--
-- Name: user_items user_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_items
    ADD CONSTRAINT user_items_pkey PRIMARY KEY (user_id, item_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: users trigger_set_default_background; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_set_default_background AFTER INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_default_background();


--
-- Name: achievements achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: aainvites fk_aa_from_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aainvites
    ADD CONSTRAINT fk_aa_from_user FOREIGN KEY (from_username) REFERENCES public.users(username) ON DELETE CASCADE;


--
-- Name: aainvites fk_aa_to_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aainvites
    ADD CONSTRAINT fk_aa_to_user FOREIGN KEY (to_username) REFERENCES public.users(username) ON DELETE CASCADE;


--
-- Name: invites fk_from_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invites
    ADD CONSTRAINT fk_from_user FOREIGN KEY (from_username) REFERENCES public.users(username) ON DELETE CASCADE;


--
-- Name: invites fk_to_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invites
    ADD CONSTRAINT fk_to_user FOREIGN KEY (to_username) REFERENCES public.users(username) ON DELETE CASCADE;


--
-- Name: leaderboards leaderboards_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaderboards
    ADD CONSTRAINT leaderboards_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_items user_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_items
    ADD CONSTRAINT user_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;


--
-- Name: user_items user_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_items
    ADD CONSTRAINT user_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

