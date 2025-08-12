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
-- PostgreSQL database dump complete
--

