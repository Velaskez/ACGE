--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg120+1)
-- Dumped by pg_dump version 15.13 (Debian 15.13-1.pgdg120+1)

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
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: acge_user
--

CREATE TABLE public.documents (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    author_id text NOT NULL,
    folder_id text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.documents OWNER TO acge_user;

--
-- Name: folders; Type: TABLE; Schema: public; Owner: acge_user
--

CREATE TABLE public.folders (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    author_id text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.folders OWNER TO acge_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: acge_user
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'USER'::text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO acge_user;

--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: acge_user
--

COPY public.documents (id, title, description, author_id, folder_id, created_at) FROM stdin;
doc-pg-001	PostgreSQL Document	Document de test PostgreSQL	admin-pg-001	folder-pg-001	2025-08-12 12:06:55.675455
\.


--
-- Data for Name: folders; Type: TABLE DATA; Schema: public; Owner: acge_user
--

COPY public.folders (id, name, description, author_id, created_at) FROM stdin;
folder-pg-001	PostgreSQL Folder	Dossier de test PostgreSQL	admin-pg-001	2025-08-12 12:06:51.071909
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: acge_user
--

COPY public.users (id, name, email, password, role, created_at) FROM stdin;
admin-pg-001	Admin PostgreSQL	admin@test.com	admin123	ADMIN	2025-08-12 12:06:44.324946
\.


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: acge_user
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: folders folders_pkey; Type: CONSTRAINT; Schema: public; Owner: acge_user
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: acge_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: acge_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

