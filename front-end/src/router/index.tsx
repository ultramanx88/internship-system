import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UNPROTECTED_PATH, PROTECTED_PATH } from "../constant/path.route";
import {
  Login,
  Dashboard,
  Setting,
  AddPerson,
  PersonInformation,
  SupervisorReport,
  SupervisorSchedule,
  InternDoc,
  CompanyEvaluate,
  SummaryReport,
  InternDocPerson,
  RegisterPersonalInfo,
  RegisterCoopInfo,
  InternRequest,
  InstructorInternReq,
  InstructorInternReqPerson,
  AssignVisitor,
  VisitorSchedule,
  VisitorSchedulePerson,
  VisitorVisits,
  VisitorVisitsPersons,
  Evaluate,
  VisitorEvaluateCompany,
  VisitorEvaluateCompanyPerson,
  VisitorEvaluateStudent,
  VisitorEvaluateStudentPerson,
  StudentEvaluateCompany,
  StudentEvaluateCompanyPerCompany,
  AttendTraining,
  AssignGrade,
  AssignVisitorPerson,
} from "../pages";
import { useAuth } from "../auth/useAuth";

const UnProtectedRoutes = [
  {
    path: UNPROTECTED_PATH.LOGIN,
    element: <Login />,
  },
];
const ProtectedRoutes = [
  {
    path: PROTECTED_PATH.DASHBOARD,
    element: <Dashboard />,
  },
  {
    path: PROTECTED_PATH.UPLOAD_LIST,
    element: <AddPerson />,
  },
  {
    path: PROTECTED_PATH.UPLOAD_LIST_PERSON,
    element: <PersonInformation />,
  },
  {
    path: PROTECTED_PATH.SUPERVISE_REPORT,
    element: <SupervisorReport />,
  },
  {
    path: PROTECTED_PATH.SUPERVISE_SCHEDULE,
    element: <SupervisorSchedule />,
  },
  {
    path: PROTECTED_PATH.INTERN_DOC,
    element: <InternDoc />,
  },
  {
    path: PROTECTED_PATH.INTERN_DOC_PERSON,
    element: <InternDocPerson />,
  },
  {
    path: PROTECTED_PATH.SUMMARY_REPORT,
    element: <SummaryReport />,
  },
  {
    path: PROTECTED_PATH.COMPANY_EVALUAION,
    element: <CompanyEvaluate />,
  },
  {
    path: PROTECTED_PATH.SETTING,
    element: <Setting />,
  },
  {
    path: PROTECTED_PATH.INTERN_REQUEST,
    element: <InternRequest />,
  },
  {
    path: PROTECTED_PATH.REGISTER_PERSONAL_INFO,
    element: <RegisterPersonalInfo />,
  },
  {
    path: PROTECTED_PATH.REGISTER_COOP_INFO,
    element: <RegisterCoopInfo />,
  },
  {
    path: PROTECTED_PATH.INSTRUCTOR_INTERN_REQUEST,
    element: <InstructorInternReq />,
  },
  {
    path: PROTECTED_PATH.INSTRUCTOR_INTERN_REQUEST_PERSON,
    element: <InstructorInternReqPerson />,
  },
  {
    path: PROTECTED_PATH.ASSIGN_VISITOR,
    element: <AssignVisitor />,
  },
  {
    path: PROTECTED_PATH.ASSIGN_VISITOR_PERSON,
    element: <AssignVisitorPerson />,
  },
  {
    path: PROTECTED_PATH.VISITOR_SCHEDULE,
    element: <VisitorSchedule />,
  },
  {
    path: PROTECTED_PATH.VISITOR_SCHEDULE_PERSON,
    element: <VisitorSchedulePerson />,
  },
  {
    path: PROTECTED_PATH.VISITOR_VISITS,
    element: <VisitorVisits />,
  },
  {
    path: PROTECTED_PATH.VISITOR_VISITS_PERSON,
    element: <VisitorVisitsPersons />,
  },
  {
    path: PROTECTED_PATH.VISITOR_EVALUATE,
    element: <Evaluate />,
  },
  {
    path: PROTECTED_PATH.VISITOR_EVALUATE_COMPANY,
    element: <VisitorEvaluateCompany />,
  },
  {
    path: PROTECTED_PATH.VISITOR_EVALUATE_COMPANY_PERSON,
    element: <VisitorEvaluateCompanyPerson />,
  },
  {
    path: PROTECTED_PATH.VISITOR_EVALUATE_STUDENT,
    element: <VisitorEvaluateStudent />,
  },
  {
    path: PROTECTED_PATH.VISITOR_EVALUATE_STUDENT_PERSON,
    element: <VisitorEvaluateStudentPerson />,
  },
  {
    path: PROTECTED_PATH.EVALUTAE_COMPANY,
    element: <StudentEvaluateCompany />,
  },
  {
    path: PROTECTED_PATH.COMPANY_EVALUAION_PER_COMPANY,
    element: <StudentEvaluateCompanyPerCompany />,
  },
  {
    path: PROTECTED_PATH.ATTEND_TRAINING,
    element: <AttendTraining />,
  },
  {
    path: PROTECTED_PATH.ASSIGN_GRADE,
    element: <AssignGrade />,
  },
];
const Router = () => {
  const { user } = useAuth();
  const routes = user ? ProtectedRoutes : UnProtectedRoutes;
  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
};

export default Router;
