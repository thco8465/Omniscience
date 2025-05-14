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
-- Name: daily_challenges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_challenges (
    id integer NOT NULL,
    date date NOT NULL,
    game text NOT NULL,
    variation text,
    goal text,
    reward integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.daily_challenges OWNER TO postgres;

--
-- Name: daily_challenges_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.daily_challenges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_challenges_id_seq OWNER TO postgres;

--
-- Name: daily_challenges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.daily_challenges_id_seq OWNED BY public.daily_challenges.id;


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
-- Name: user_challenge_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_challenge_log (
    id integer NOT NULL,
    user_id integer,
    date date NOT NULL,
    completed boolean DEFAULT false,
    streak integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_challenge_log OWNER TO postgres;

--
-- Name: user_challenge_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_challenge_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_challenge_log_id_seq OWNER TO postgres;

--
-- Name: user_challenge_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_challenge_log_id_seq OWNED BY public.user_challenge_log.id;


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
-- Name: user_journal_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_journal_entries (
    id integer NOT NULL,
    user_id integer,
    entry_date date NOT NULL,
    mood integer,
    energy integer,
    focus integer,
    notes text,
    CONSTRAINT user_journal_entries_energy_check CHECK (((energy >= 1) AND (energy <= 10))),
    CONSTRAINT user_journal_entries_focus_check CHECK (((focus >= 1) AND (focus <= 10))),
    CONSTRAINT user_journal_entries_mood_check CHECK (((mood >= 1) AND (mood <= 10)))
);


ALTER TABLE public.user_journal_entries OWNER TO postgres;

--
-- Name: user_journal_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_journal_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_journal_entries_id_seq OWNER TO postgres;

--
-- Name: user_journal_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_journal_entries_id_seq OWNED BY public.user_journal_entries.id;


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
-- Name: daily_challenges id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_challenges ALTER COLUMN id SET DEFAULT nextval('public.daily_challenges_id_seq'::regclass);


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
-- Name: user_challenge_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_challenge_log ALTER COLUMN id SET DEFAULT nextval('public.user_challenge_log_id_seq'::regclass);


--
-- Name: user_journal_entries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_journal_entries ALTER COLUMN id SET DEFAULT nextval('public.user_journal_entries_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


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
-- Name: daily_challenges daily_challenges_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_challenges
    ADD CONSTRAINT daily_challenges_date_key UNIQUE (date);


--
-- Name: daily_challenges daily_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_challenges
    ADD CONSTRAINT daily_challenges_pkey PRIMARY KEY (id);


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
-- Name: user_challenge_log user_challenge_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_challenge_log
    ADD CONSTRAINT user_challenge_log_pkey PRIMARY KEY (id);


--
-- Name: user_challenge_log user_challenge_log_user_id_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_challenge_log
    ADD CONSTRAINT user_challenge_log_user_id_date_key UNIQUE (user_id, date);


--
-- Name: user_items user_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_items
    ADD CONSTRAINT user_items_pkey PRIMARY KEY (user_id, item_id);


--
-- Name: user_journal_entries user_journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_journal_entries
    ADD CONSTRAINT user_journal_entries_pkey PRIMARY KEY (id);


--
-- Name: user_journal_entries user_journal_entries_user_id_entry_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_journal_entries
    ADD CONSTRAINT user_journal_entries_user_id_entry_date_key UNIQUE (user_id, entry_date);


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
-- Name: idx_user_journal_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_journal_date ON public.user_journal_entries USING btree (user_id, entry_date);


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
-- Name: user_challenge_log user_challenge_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_challenge_log
    ADD CONSTRAINT user_challenge_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


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
-- Name: user_journal_entries user_journal_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_journal_entries
    ADD CONSTRAINT user_journal_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

