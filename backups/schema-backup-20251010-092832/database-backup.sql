--
-- PostgreSQL database dump
--

\restrict psSMVuLsFoO3y3VYivD56JStd5dsATn3qSxpVS2yYsbM4Z2TwonayRNpygpJXkS

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

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
-- Name: ApplicationStatus; Type: TYPE; Schema: public; Owner: macbookpro
--

CREATE TYPE public."ApplicationStatus" AS ENUM (
    'pending',
    'approved',
    'rejected',
    'submitted',
    'documents_ready',
    'documents_delivered',
    'assigned_supervisor',
    'assigned_committee',
    'committee_approved',
    'supervisor_approved',
    'completed'
);


ALTER TYPE public."ApplicationStatus" OWNER TO macbookpro;

--
-- Name: BackupStatus; Type: TYPE; Schema: public; Owner: macbookpro
--

CREATE TYPE public."BackupStatus" AS ENUM (
    'IN_PROGRESS',
    'COMPLETED',
    'FAILED',
    'EXPIRED'
);


ALTER TYPE public."BackupStatus" OWNER TO macbookpro;

--
-- Name: BackupType; Type: TYPE; Schema: public; Owner: macbookpro
--

CREATE TYPE public."BackupType" AS ENUM (
    'FULL',
    'INCREMENTAL',
    'SCHEMA_ONLY',
    'DATA_ONLY'
);


ALTER TYPE public."BackupType" OWNER TO macbookpro;

--
-- Name: CompanySize; Type: TYPE; Schema: public; Owner: macbookpro
--

CREATE TYPE public."CompanySize" AS ENUM (
    'startup',
    'small',
    'medium',
    'large',
    'enterprise'
);


ALTER TYPE public."CompanySize" OWNER TO macbookpro;

--
-- Name: DocumentStatus; Type: TYPE; Schema: public; Owner: macbookpro
--

CREATE TYPE public."DocumentStatus" AS ENUM (
    'pending',
    'approved',
    'rejected',
    'draft',
    'submitted',
    'under_review'
);


ALTER TYPE public."DocumentStatus" OWNER TO macbookpro;

--
-- Name: DocumentType; Type: TYPE; Schema: public; Owner: macbookpro
--

CREATE TYPE public."DocumentType" AS ENUM (
    'cv',
    'transcript',
    'certificate',
    'request_letter',
    'introduction_letter',
    'application_form',
    'evaluation_form',
    'project_proposal',
    'internship_report',
    'company_evaluation',
    'supervisor_evaluation',
    'other'
);


ALTER TYPE public."DocumentType" OWNER TO macbookpro;

--
-- Name: InternshipType; Type: TYPE; Schema: public; Owner: macbookpro
--

CREATE TYPE public."InternshipType" AS ENUM (
    'internship',
    'co_op'
);


ALTER TYPE public."InternshipType" OWNER TO macbookpro;

--
-- Name: LogLevel; Type: TYPE; Schema: public; Owner: macbookpro
--

CREATE TYPE public."LogLevel" AS ENUM (
    'ERROR',
    'WARN',
    'INFO',
    'DEBUG'
);


ALTER TYPE public."LogLevel" OWNER TO macbookpro;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: macbookpro
--

CREATE TYPE public."Role" AS ENUM (
    'admin',
    'staff',
    'courseInstructor',
    'committee',
    'visitor',
    'student'
);


ALTER TYPE public."Role" OWNER TO macbookpro;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: academic_years; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.academic_years (
    id text NOT NULL,
    year integer NOT NULL,
    name text NOT NULL,
    "nameEn" text,
    "isActive" boolean DEFAULT false NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.academic_years OWNER TO macbookpro;

--
-- Name: application_committees; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.application_committees (
    id text NOT NULL,
    "applicationId" text NOT NULL,
    "committeeId" text NOT NULL,
    status text NOT NULL,
    notes text,
    "reviewedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.application_committees OWNER TO macbookpro;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.applications (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "internshipId" text NOT NULL,
    status public."ApplicationStatus" NOT NULL,
    "dateApplied" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    feedback text,
    "projectTopic" text,
    "projectTopicEn" text,
    "printRecordId" text,
    "projectProposal" text,
    "preferredStartDate" timestamp(3) without time zone,
    "availableDuration" integer,
    "staffReviewed" boolean DEFAULT false NOT NULL,
    "staffReviewedAt" timestamp(3) without time zone,
    "documentReceived" boolean DEFAULT false NOT NULL,
    "documentReceivedAt" timestamp(3) without time zone,
    "documentReviewed" boolean DEFAULT false NOT NULL,
    "documentReviewedAt" timestamp(3) without time zone,
    "documentApproved" boolean DEFAULT false NOT NULL,
    "documentApprovedAt" timestamp(3) without time zone,
    "documentSentToCompany" boolean DEFAULT false NOT NULL,
    "documentSentAt" timestamp(3) without time zone,
    "staffWorkflowNotes" text,
    "courseInstructorId" text,
    "instructorReceived" boolean DEFAULT false NOT NULL,
    "instructorReceivedAt" timestamp(3) without time zone,
    "instructorReviewed" boolean DEFAULT false NOT NULL,
    "instructorReviewedAt" timestamp(3) without time zone,
    "instructorWorkflowNotes" text,
    "supervisorId" text,
    "supervisorAssigned" boolean DEFAULT false NOT NULL,
    "supervisorAssignedAt" timestamp(3) without time zone,
    "supervisorReceived" boolean DEFAULT false NOT NULL,
    "supervisorReceivedAt" timestamp(3) without time zone,
    "supervisorConfirmed" boolean DEFAULT false NOT NULL,
    "supervisorConfirmedAt" timestamp(3) without time zone,
    "appointmentScheduled" boolean DEFAULT false NOT NULL,
    "appointmentScheduledAt" timestamp(3) without time zone,
    "supervisorWorkflowNotes" text,
    "committeeReceived" boolean DEFAULT false NOT NULL,
    "committeeReceivedAt" timestamp(3) without time zone,
    "committeeReviewed" boolean DEFAULT false NOT NULL,
    "committeeReviewedAt" timestamp(3) without time zone,
    "committeeApproved" boolean DEFAULT false NOT NULL,
    "committeeApprovedAt" timestamp(3) without time zone,
    "committeeWorkflowNotes" text,
    "studentWorkflowStep" integer DEFAULT 1 NOT NULL,
    "staffFeedback" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.applications OWNER TO macbookpro;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text,
    "oldValues" jsonb,
    "newValues" jsonb,
    "userId" text,
    "sessionId" text,
    "ipAddress" text,
    "userAgent" text,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO macbookpro;

--
-- Name: backup_records; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.backup_records (
    id text NOT NULL,
    filename text NOT NULL,
    "filePath" text NOT NULL,
    "fileSize" bigint NOT NULL,
    "backupType" public."BackupType" NOT NULL,
    status public."BackupStatus" DEFAULT 'IN_PROGRESS'::public."BackupStatus" NOT NULL,
    "errorMessage" text,
    metadata jsonb,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone
);


ALTER TABLE public.backup_records OWNER TO macbookpro;

--
-- Name: committee_members; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.committee_members (
    id text NOT NULL,
    "committeeId" text NOT NULL,
    "userId" text NOT NULL,
    role text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.committee_members OWNER TO macbookpro;

--
-- Name: committees; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.committees (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.committees OWNER TO macbookpro;

--
-- Name: companies; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.companies (
    id text NOT NULL,
    name text NOT NULL,
    "nameEn" text,
    address text,
    "addressEn" text,
    province text,
    district text,
    subdistrict text,
    "postalCode" text,
    phone text,
    email text,
    website text,
    description text,
    "descriptionEn" text,
    industry text,
    "industryEn" text,
    latitude double precision,
    longitude double precision,
    "provinceIdRef" text,
    "districtIdRef" text,
    "subdistrictIdRef" text,
    size public."CompanySize",
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.companies OWNER TO macbookpro;

--
-- Name: course_categories; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.course_categories (
    id text NOT NULL,
    name text NOT NULL,
    "nameEn" text,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.course_categories OWNER TO macbookpro;

--
-- Name: course_instructors; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.course_instructors (
    id text NOT NULL,
    "courseId" text NOT NULL,
    "userId" text NOT NULL,
    role text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.course_instructors OWNER TO macbookpro;

--
-- Name: courses; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.courses (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "nameEn" text,
    description text,
    "descriptionEn" text,
    credits integer NOT NULL,
    "categoryId" text,
    "facultyId" text,
    "departmentId" text,
    "curriculumId" text,
    "majorId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.courses OWNER TO macbookpro;

--
-- Name: curriculums; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.curriculums (
    id text NOT NULL,
    "nameTh" text NOT NULL,
    "nameEn" text,
    code text,
    degree text,
    "departmentId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.curriculums OWNER TO macbookpro;

--
-- Name: data_anonymization_rules; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.data_anonymization_rules (
    id text NOT NULL,
    "tableName" text NOT NULL,
    "columnName" text NOT NULL,
    "anonymizationType" text NOT NULL,
    "maskPattern" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.data_anonymization_rules OWNER TO macbookpro;

--
-- Name: data_processing_consents; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.data_processing_consents (
    id text NOT NULL,
    "userId" text NOT NULL,
    "consentType" text NOT NULL,
    "isConsented" boolean NOT NULL,
    "consentDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "withdrawalDate" timestamp(3) without time zone,
    "consentVersion" text DEFAULT '1.0'::text NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.data_processing_consents OWNER TO macbookpro;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.departments (
    id text NOT NULL,
    "nameTh" text NOT NULL,
    "nameEn" text,
    code text,
    "facultyId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.departments OWNER TO macbookpro;

--
-- Name: districts; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.districts (
    id text NOT NULL,
    "nameTh" text NOT NULL,
    "nameEn" text,
    code text,
    "isActive" boolean DEFAULT true NOT NULL,
    "provinceId" text NOT NULL
);


ALTER TABLE public.districts OWNER TO macbookpro;

--
-- Name: document_archive; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.document_archive (
    id text NOT NULL,
    "documentNo" bigint NOT NULL,
    "deletedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reason text,
    "metaHash" text
);


ALTER TABLE public.document_archive OWNER TO macbookpro;

--
-- Name: document_sequences; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.document_sequences (
    id integer DEFAULT 1 NOT NULL,
    "nextNumber" bigint DEFAULT 1 NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.document_sequences OWNER TO macbookpro;

--
-- Name: document_templates; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.document_templates (
    id text NOT NULL,
    name text NOT NULL,
    "nameEn" text,
    type text NOT NULL,
    template text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.document_templates OWNER TO macbookpro;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.documents (
    id text NOT NULL,
    "studentId" text NOT NULL,
    name text NOT NULL,
    "nameEn" text,
    type public."DocumentType" NOT NULL,
    status public."DocumentStatus" DEFAULT 'pending'::public."DocumentStatus" NOT NULL,
    size integer NOT NULL,
    url text NOT NULL,
    "uploadDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.documents OWNER TO macbookpro;

--
-- Name: educator_role_assignments; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.educator_role_assignments (
    id text NOT NULL,
    "educatorId" text NOT NULL,
    "academicYearId" text NOT NULL,
    "semesterId" text NOT NULL,
    "educatorRoleId" text,
    roles text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.educator_role_assignments OWNER TO macbookpro;

--
-- Name: educator_roles; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.educator_roles (
    id text NOT NULL,
    name text NOT NULL,
    "nameEn" text,
    description text,
    "descriptionEn" text,
    permissions jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.educator_roles OWNER TO macbookpro;

--
-- Name: evaluation_forms; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.evaluation_forms (
    id text NOT NULL,
    name text NOT NULL,
    "nameEn" text,
    description text,
    "descriptionEn" text,
    type text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.evaluation_forms OWNER TO macbookpro;

--
-- Name: evaluations; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.evaluations (
    id text NOT NULL,
    "formId" text NOT NULL,
    "applicationId" text NOT NULL,
    "evaluatorId" text NOT NULL,
    "evaluatorType" text NOT NULL,
    score integer NOT NULL,
    comments text,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.evaluations OWNER TO macbookpro;

--
-- Name: faculties; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.faculties (
    id text NOT NULL,
    "nameTh" text NOT NULL,
    "nameEn" text,
    code text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.faculties OWNER TO macbookpro;

--
-- Name: faculty_instructor_assignments; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.faculty_instructor_assignments (
    id text NOT NULL,
    "facultyId" text NOT NULL,
    "academicYearId" text NOT NULL,
    "semesterId" text NOT NULL,
    "instructorId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.faculty_instructor_assignments OWNER TO macbookpro;

--
-- Name: holidays; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.holidays (
    id text NOT NULL,
    name text NOT NULL,
    "nameEn" text,
    date timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.holidays OWNER TO macbookpro;

--
-- Name: internships; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.internships (
    id text NOT NULL,
    title text NOT NULL,
    "titleEn" text,
    "companyId" text NOT NULL,
    location text NOT NULL,
    description text NOT NULL,
    "descriptionEn" text,
    type public."InternshipType" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.internships OWNER TO macbookpro;

--
-- Name: log_retention_policies; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.log_retention_policies (
    id text NOT NULL,
    "logType" text NOT NULL,
    "retentionDays" integer DEFAULT 90 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastCleanup" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.log_retention_policies OWNER TO macbookpro;

--
-- Name: majors; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.majors (
    id text NOT NULL,
    "nameTh" text NOT NULL,
    "nameEn" text,
    "curriculumId" text NOT NULL,
    area text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.majors OWNER TO macbookpro;

--
-- Name: print_records; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.print_records (
    id text NOT NULL,
    "documentNumber" text NOT NULL,
    "documentDate" timestamp(3) without time zone NOT NULL,
    "printedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "printedById" text NOT NULL
);


ALTER TABLE public.print_records OWNER TO macbookpro;

--
-- Name: provinces; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.provinces (
    id text NOT NULL,
    "nameTh" text NOT NULL,
    "nameEn" text,
    code text,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.provinces OWNER TO macbookpro;

--
-- Name: semesters; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.semesters (
    id text NOT NULL,
    name text NOT NULL,
    "nameEn" text,
    "academicYearId" text NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.semesters OWNER TO macbookpro;

--
-- Name: subdistricts; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.subdistricts (
    id text NOT NULL,
    "nameTh" text NOT NULL,
    "nameEn" text,
    code text,
    "postalCode" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "districtId" text NOT NULL
);


ALTER TABLE public.subdistricts OWNER TO macbookpro;

--
-- Name: system_logs; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.system_logs (
    id text NOT NULL,
    level public."LogLevel" NOT NULL,
    message text NOT NULL,
    context jsonb,
    "userId" text,
    "sessionId" text,
    "ipAddress" text,
    "userAgent" text,
    endpoint text,
    method text,
    "statusCode" integer,
    duration integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.system_logs OWNER TO macbookpro;

--
-- Name: system_media; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.system_media (
    id text NOT NULL,
    type text NOT NULL,
    name text NOT NULL,
    "originalName" text NOT NULL,
    "filePath" text NOT NULL,
    "fileSize" integer NOT NULL,
    "mimeType" text NOT NULL,
    width integer,
    height integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "uploadedBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.system_media OWNER TO macbookpro;

--
-- Name: titles; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.titles (
    id text NOT NULL,
    "nameTh" text NOT NULL,
    "nameEn" text,
    "applicableTo" text[],
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.titles OWNER TO macbookpro;

--
-- Name: users; Type: TABLE; Schema: public; Owner: macbookpro
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    roles text NOT NULL,
    skills text,
    statement text,
    t_title text,
    t_name text,
    t_middle_name text,
    t_surname text,
    e_title text,
    e_name text,
    e_middle_name text,
    e_surname text,
    "facultyId" text,
    "departmentId" text,
    "curriculumId" text,
    "majorId" text,
    "studentYear" integer,
    phone text,
    campus text,
    gpa text,
    nationality text,
    "passportId" text,
    "visaType" text,
    "profileImage" text,
    "internshipPhoto1" text,
    "internshipPhoto2" text,
    "notifyEmail" boolean DEFAULT true NOT NULL,
    "notifyPush" boolean DEFAULT false NOT NULL,
    "notifySms" boolean DEFAULT false NOT NULL,
    "notifyAppUpdates" boolean DEFAULT true NOT NULL,
    "notifyDeadlines" boolean DEFAULT true NOT NULL,
    "notifyNews" boolean DEFAULT false NOT NULL,
    language text DEFAULT 'th'::text NOT NULL,
    theme text DEFAULT 'light'::text NOT NULL,
    "dateFormat" text DEFAULT 'thai'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO macbookpro;

--
-- Data for Name: academic_years; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.academic_years (id, year, name, "nameEn", "isActive", "startDate", "endDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: application_committees; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.application_committees (id, "applicationId", "committeeId", status, notes, "reviewedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.applications (id, "studentId", "internshipId", status, "dateApplied", feedback, "projectTopic", "projectTopicEn", "printRecordId", "projectProposal", "preferredStartDate", "availableDuration", "staffReviewed", "staffReviewedAt", "documentReceived", "documentReceivedAt", "documentReviewed", "documentReviewedAt", "documentApproved", "documentApprovedAt", "documentSentToCompany", "documentSentAt", "staffWorkflowNotes", "courseInstructorId", "instructorReceived", "instructorReceivedAt", "instructorReviewed", "instructorReviewedAt", "instructorWorkflowNotes", "supervisorId", "supervisorAssigned", "supervisorAssignedAt", "supervisorReceived", "supervisorReceivedAt", "supervisorConfirmed", "supervisorConfirmedAt", "appointmentScheduled", "appointmentScheduledAt", "supervisorWorkflowNotes", "committeeReceived", "committeeReceivedAt", "committeeReviewed", "committeeReviewedAt", "committeeApproved", "committeeApprovedAt", "committeeWorkflowNotes", "studentWorkflowStep", "staffFeedback", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.audit_logs (id, action, "entityType", "entityId", "oldValues", "newValues", "userId", "sessionId", "ipAddress", "userAgent", reason, "createdAt") FROM stdin;
\.


--
-- Data for Name: backup_records; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.backup_records (id, filename, "filePath", "fileSize", "backupType", status, "errorMessage", metadata, "createdBy", "createdAt", "completedAt") FROM stdin;
\.


--
-- Data for Name: committee_members; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.committee_members (id, "committeeId", "userId", role, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: committees; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.committees (id, name, description, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.companies (id, name, "nameEn", address, "addressEn", province, district, subdistrict, "postalCode", phone, email, website, description, "descriptionEn", industry, "industryEn", latitude, longitude, "provinceIdRef", "districtIdRef", "subdistrictIdRef", size, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: course_categories; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.course_categories (id, name, "nameEn", description, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: course_instructors; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.course_instructors (id, "courseId", "userId", role, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.courses (id, code, name, "nameEn", description, "descriptionEn", credits, "categoryId", "facultyId", "departmentId", "curriculumId", "majorId", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: curriculums; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.curriculums (id, "nameTh", "nameEn", code, degree, "departmentId", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: data_anonymization_rules; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.data_anonymization_rules (id, "tableName", "columnName", "anonymizationType", "maskPattern", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: data_processing_consents; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.data_processing_consents (id, "userId", "consentType", "isConsented", "consentDate", "withdrawalDate", "consentVersion", "ipAddress", "userAgent", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.departments (id, "nameTh", "nameEn", code, "facultyId", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: districts; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.districts (id, "nameTh", "nameEn", code, "isActive", "provinceId") FROM stdin;
\.


--
-- Data for Name: document_archive; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.document_archive (id, "documentNo", "deletedAt", reason, "metaHash") FROM stdin;
\.


--
-- Data for Name: document_sequences; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.document_sequences (id, "nextNumber", "updatedAt") FROM stdin;
\.


--
-- Data for Name: document_templates; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.document_templates (id, name, "nameEn", type, template, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.documents (id, "studentId", name, "nameEn", type, status, size, url, "uploadDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: educator_role_assignments; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.educator_role_assignments (id, "educatorId", "academicYearId", "semesterId", "educatorRoleId", roles, "isActive", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: educator_roles; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.educator_roles (id, name, "nameEn", description, "descriptionEn", permissions, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: evaluation_forms; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.evaluation_forms (id, name, "nameEn", description, "descriptionEn", type, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: evaluations; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.evaluations (id, "formId", "applicationId", "evaluatorId", "evaluatorType", score, comments, "submittedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: faculties; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.faculties (id, "nameTh", "nameEn", code, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: faculty_instructor_assignments; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.faculty_instructor_assignments (id, "facultyId", "academicYearId", "semesterId", "instructorId", "isActive", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: holidays; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.holidays (id, name, "nameEn", date, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: internships; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.internships (id, title, "titleEn", "companyId", location, description, "descriptionEn", type, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: log_retention_policies; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.log_retention_policies (id, "logType", "retentionDays", "isActive", "lastCleanup", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: majors; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.majors (id, "nameTh", "nameEn", "curriculumId", area, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: print_records; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.print_records (id, "documentNumber", "documentDate", "printedAt", "printedById") FROM stdin;
\.


--
-- Data for Name: provinces; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.provinces (id, "nameTh", "nameEn", code, "isActive") FROM stdin;
\.


--
-- Data for Name: semesters; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.semesters (id, name, "nameEn", "academicYearId", "startDate", "endDate", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: subdistricts; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.subdistricts (id, "nameTh", "nameEn", code, "postalCode", "isActive", "districtId") FROM stdin;
\.


--
-- Data for Name: system_logs; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.system_logs (id, level, message, context, "userId", "sessionId", "ipAddress", "userAgent", endpoint, method, "statusCode", duration, "createdAt") FROM stdin;
\.


--
-- Data for Name: system_media; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.system_media (id, type, name, "originalName", "filePath", "fileSize", "mimeType", width, height, "isActive", "uploadedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: titles; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.titles (id, "nameTh", "nameEn", "applicableTo", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: macbookpro
--

COPY public.users (id, name, email, password, roles, skills, statement, t_title, t_name, t_middle_name, t_surname, e_title, e_name, e_middle_name, e_surname, "facultyId", "departmentId", "curriculumId", "majorId", "studentYear", phone, campus, gpa, nationality, "passportId", "visaType", "profileImage", "internshipPhoto1", "internshipPhoto2", "notifyEmail", "notifyPush", "notifySms", "notifyAppUpdates", "notifyDeadlines", "notifyNews", language, theme, "dateFormat", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: academic_years academic_years_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.academic_years
    ADD CONSTRAINT academic_years_pkey PRIMARY KEY (id);


--
-- Name: application_committees application_committees_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.application_committees
    ADD CONSTRAINT application_committees_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: backup_records backup_records_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.backup_records
    ADD CONSTRAINT backup_records_pkey PRIMARY KEY (id);


--
-- Name: committee_members committee_members_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.committee_members
    ADD CONSTRAINT committee_members_pkey PRIMARY KEY (id);


--
-- Name: committees committees_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.committees
    ADD CONSTRAINT committees_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: course_categories course_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.course_categories
    ADD CONSTRAINT course_categories_pkey PRIMARY KEY (id);


--
-- Name: course_instructors course_instructors_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.course_instructors
    ADD CONSTRAINT course_instructors_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: curriculums curriculums_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.curriculums
    ADD CONSTRAINT curriculums_pkey PRIMARY KEY (id);


--
-- Name: data_anonymization_rules data_anonymization_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.data_anonymization_rules
    ADD CONSTRAINT data_anonymization_rules_pkey PRIMARY KEY (id);


--
-- Name: data_processing_consents data_processing_consents_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.data_processing_consents
    ADD CONSTRAINT data_processing_consents_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: districts districts_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_pkey PRIMARY KEY (id);


--
-- Name: document_archive document_archive_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.document_archive
    ADD CONSTRAINT document_archive_pkey PRIMARY KEY (id);


--
-- Name: document_sequences document_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.document_sequences
    ADD CONSTRAINT document_sequences_pkey PRIMARY KEY (id);


--
-- Name: document_templates document_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.document_templates
    ADD CONSTRAINT document_templates_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: educator_role_assignments educator_role_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.educator_role_assignments
    ADD CONSTRAINT educator_role_assignments_pkey PRIMARY KEY (id);


--
-- Name: educator_roles educator_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.educator_roles
    ADD CONSTRAINT educator_roles_pkey PRIMARY KEY (id);


--
-- Name: evaluation_forms evaluation_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.evaluation_forms
    ADD CONSTRAINT evaluation_forms_pkey PRIMARY KEY (id);


--
-- Name: evaluations evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_pkey PRIMARY KEY (id);


--
-- Name: faculties faculties_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_pkey PRIMARY KEY (id);


--
-- Name: faculty_instructor_assignments faculty_instructor_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.faculty_instructor_assignments
    ADD CONSTRAINT faculty_instructor_assignments_pkey PRIMARY KEY (id);


--
-- Name: holidays holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (id);


--
-- Name: internships internships_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.internships
    ADD CONSTRAINT internships_pkey PRIMARY KEY (id);


--
-- Name: log_retention_policies log_retention_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.log_retention_policies
    ADD CONSTRAINT log_retention_policies_pkey PRIMARY KEY (id);


--
-- Name: majors majors_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.majors
    ADD CONSTRAINT majors_pkey PRIMARY KEY (id);


--
-- Name: print_records print_records_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.print_records
    ADD CONSTRAINT print_records_pkey PRIMARY KEY (id);


--
-- Name: provinces provinces_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.provinces
    ADD CONSTRAINT provinces_pkey PRIMARY KEY (id);


--
-- Name: semesters semesters_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT semesters_pkey PRIMARY KEY (id);


--
-- Name: subdistricts subdistricts_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.subdistricts
    ADD CONSTRAINT subdistricts_pkey PRIMARY KEY (id);


--
-- Name: system_logs system_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_pkey PRIMARY KEY (id);


--
-- Name: system_media system_media_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.system_media
    ADD CONSTRAINT system_media_pkey PRIMARY KEY (id);


--
-- Name: titles titles_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.titles
    ADD CONSTRAINT titles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: academic_years_year_key; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE UNIQUE INDEX academic_years_year_key ON public.academic_years USING btree (year);


--
-- Name: application_committees_applicationId_committeeId_key; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE UNIQUE INDEX "application_committees_applicationId_committeeId_key" ON public.application_committees USING btree ("applicationId", "committeeId");


--
-- Name: applications_createdAt_idx; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE INDEX "applications_createdAt_idx" ON public.applications USING btree ("createdAt");


--
-- Name: applications_internshipId_idx; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE INDEX "applications_internshipId_idx" ON public.applications USING btree ("internshipId");


--
-- Name: applications_status_idx; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE INDEX applications_status_idx ON public.applications USING btree (status);


--
-- Name: applications_studentId_idx; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE INDEX "applications_studentId_idx" ON public.applications USING btree ("studentId");


--
-- Name: applications_studentId_internshipId_key; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE UNIQUE INDEX "applications_studentId_internshipId_key" ON public.applications USING btree ("studentId", "internshipId");


--
-- Name: committee_members_committeeId_userId_key; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE UNIQUE INDEX "committee_members_committeeId_userId_key" ON public.committee_members USING btree ("committeeId", "userId");


--
-- Name: course_instructors_courseId_userId_key; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE UNIQUE INDEX "course_instructors_courseId_userId_key" ON public.course_instructors USING btree ("courseId", "userId");


--
-- Name: courses_code_key; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE UNIQUE INDEX courses_code_key ON public.courses USING btree (code);


--
-- Name: data_anonymization_rules_tableName_columnName_key; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE UNIQUE INDEX "data_anonymization_rules_tableName_columnName_key" ON public.data_anonymization_rules USING btree ("tableName", "columnName");


--
-- Name: districts_code_key; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE UNIQUE INDEX districts_code_key ON public.districts USING btree (code);


--
-- Name: document_archive_documentNo_key; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE UNIQUE INDEX "document_archive_documentNo_key" ON public.document_archive USING btree ("documentNo");


--
-- Name: educator_role_assignments_educatorId_academicYearId_semeste_key; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE UNIQUE INDEX "educator_role_assignments_educatorId_academicYearId_semeste_key" ON public.educator_role_assignments USING btree ("educatorId", "academicYearId", "semesterId");


--
-- Name: faculty_instructor_assignments_facultyId_academicYearId_sem_key; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE UNIQUE INDEX "faculty_instructor_assignments_facultyId_academicYearId_sem_key" ON public.faculty_instructor_assignments USING btree ("facultyId", "academicYearId", "semesterId");


--
-- Name: holidays_name_date_key; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE UNIQUE INDEX holidays_name_date_key ON public.holidays USING btree (name, date);


--
-- Name: log_retention_policies_logType_key; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE UNIQUE INDEX "log_retention_policies_logType_key" ON public.log_retention_policies USING btree ("logType");


--
-- Name: print_records_documentNumber_key; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE UNIQUE INDEX "print_records_documentNumber_key" ON public.print_records USING btree ("documentNumber");


--
-- Name: provinces_code_key; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE UNIQUE INDEX provinces_code_key ON public.provinces USING btree (code);


--
-- Name: semesters_name_academicYearId_key; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE UNIQUE INDEX "semesters_name_academicYearId_key" ON public.semesters USING btree (name, "academicYearId");


--
-- Name: subdistricts_code_key; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE UNIQUE INDEX subdistricts_code_key ON public.subdistricts USING btree (code);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: macbookpro
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: application_committees application_committees_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.application_committees
    ADD CONSTRAINT "application_committees_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.applications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: application_committees application_committees_committeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.application_committees
    ADD CONSTRAINT "application_committees_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES public.committees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: applications applications_courseInstructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT "applications_courseInstructorId_fkey" FOREIGN KEY ("courseInstructorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: applications applications_internshipId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT "applications_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES public.internships(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: applications applications_printRecordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT "applications_printRecordId_fkey" FOREIGN KEY ("printRecordId") REFERENCES public.print_records(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: applications applications_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT "applications_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: applications applications_supervisorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT "applications_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: backup_records backup_records_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.backup_records
    ADD CONSTRAINT "backup_records_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: committee_members committee_members_committeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.committee_members
    ADD CONSTRAINT "committee_members_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES public.committees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: committee_members committee_members_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.committee_members
    ADD CONSTRAINT "committee_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: companies companies_districtIdRef_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT "companies_districtIdRef_fkey" FOREIGN KEY ("districtIdRef") REFERENCES public.districts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: companies companies_provinceIdRef_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT "companies_provinceIdRef_fkey" FOREIGN KEY ("provinceIdRef") REFERENCES public.provinces(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: companies companies_subdistrictIdRef_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT "companies_subdistrictIdRef_fkey" FOREIGN KEY ("subdistrictIdRef") REFERENCES public.subdistricts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: course_instructors course_instructors_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.course_instructors
    ADD CONSTRAINT "course_instructors_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: course_instructors course_instructors_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.course_instructors
    ADD CONSTRAINT "course_instructors_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: courses courses_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "courses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.course_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: courses courses_curriculumId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "courses_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES public.curriculums(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: courses courses_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "courses_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: courses courses_facultyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "courses_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES public.faculties(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: courses courses_majorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "courses_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES public.majors(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: curriculums curriculums_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.curriculums
    ADD CONSTRAINT "curriculums_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: data_processing_consents data_processing_consents_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.data_processing_consents
    ADD CONSTRAINT "data_processing_consents_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: departments departments_facultyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT "departments_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES public.faculties(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: districts districts_provinceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT "districts_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES public.provinces(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: documents documents_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: educator_role_assignments educator_role_assignments_academicYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.educator_role_assignments
    ADD CONSTRAINT "educator_role_assignments_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES public.academic_years(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: educator_role_assignments educator_role_assignments_educatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.educator_role_assignments
    ADD CONSTRAINT "educator_role_assignments_educatorId_fkey" FOREIGN KEY ("educatorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: educator_role_assignments educator_role_assignments_educatorRoleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.educator_role_assignments
    ADD CONSTRAINT "educator_role_assignments_educatorRoleId_fkey" FOREIGN KEY ("educatorRoleId") REFERENCES public.educator_roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: educator_role_assignments educator_role_assignments_semesterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.educator_role_assignments
    ADD CONSTRAINT "educator_role_assignments_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES public.semesters(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: evaluations evaluations_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT "evaluations_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.applications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: evaluations evaluations_evaluatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT "evaluations_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: evaluations evaluations_formId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT "evaluations_formId_fkey" FOREIGN KEY ("formId") REFERENCES public.evaluation_forms(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: faculty_instructor_assignments faculty_instructor_assignments_academicYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.faculty_instructor_assignments
    ADD CONSTRAINT "faculty_instructor_assignments_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES public.academic_years(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: faculty_instructor_assignments faculty_instructor_assignments_facultyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.faculty_instructor_assignments
    ADD CONSTRAINT "faculty_instructor_assignments_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES public.faculties(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: faculty_instructor_assignments faculty_instructor_assignments_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.faculty_instructor_assignments
    ADD CONSTRAINT "faculty_instructor_assignments_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: faculty_instructor_assignments faculty_instructor_assignments_semesterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.faculty_instructor_assignments
    ADD CONSTRAINT "faculty_instructor_assignments_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES public.semesters(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: internships internships_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.internships
    ADD CONSTRAINT "internships_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: majors majors_curriculumId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.majors
    ADD CONSTRAINT "majors_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES public.curriculums(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: print_records print_records_printedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.print_records
    ADD CONSTRAINT "print_records_printedById_fkey" FOREIGN KEY ("printedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: semesters semesters_academicYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT "semesters_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES public.academic_years(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subdistricts subdistricts_districtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.subdistricts
    ADD CONSTRAINT "subdistricts_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES public.districts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: system_logs system_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT "system_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_curriculumId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES public.curriculums(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_facultyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES public.faculties(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_majorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: macbookpro
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES public.majors(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict psSMVuLsFoO3y3VYivD56JStd5dsATn3qSxpVS2yYsbM4Z2TwonayRNpygpJXkS

