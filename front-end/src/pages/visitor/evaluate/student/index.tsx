import { Layout } from "../../../../component/layout";
import { PROTECTED_PATH } from "../../../../constant/path.route";
import { Table } from "../../../../component/table";
import { ReadMoreRounded } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useViewModel from "../viewModel";
const VisitorEvaluateStudent = () => {
  const navigate = useNavigate();
  const { visitorTrainings } = useViewModel();
  return (
    <Layout
      header={[
        {
          path: PROTECTED_PATH.VISITOR_EVALUATE_STUDENT,
          name: "ประเมินนักศึกษา",
        },
      ]}
    >
      <div className="bg-white p-4 mt-4 rounded-lg">
        <h1 className="text-xl font-bold text-secondary-600">
          ประเมินนักศึกษา
        </h1>
        <div className="w-full mt-10">
          <Table
            header={[
              "ชื่อ-นามสกุล",
              "รหัสนักศึกษา",
              "บริษัท",
              "สถานะการประเมิน",
              "เข้าชม",
            ]}
            data={visitorTrainings.map((data, key) => (
              <tr
                key={data.id + key}
                className="border-b border-x border-text-200"
              >
                <td className="ps-5 py-3">
                  {data.studentEnroll.student.name}{" "}
                  {data.studentEnroll.student.surname}
                </td>
                <td>{data.studentEnroll.student.studentId}</td>
                <td>{data.studentEnroll.student_training?.company.companyNameTh}</td>
                <td>{"ยังไม่ได้ประเมิน"}</td>

                <td>
                  <button
                    className="text-primary-600"
                    onClick={() =>
                      navigate(
                        PROTECTED_PATH.VISITOR_EVALUATE_STUDENT_PERSON +
                          `?id=${data.id}`
                      )
                    }
                  >
                    <ReadMoreRounded />
                  </button>
                </td>
              </tr>
            ))}
          />
        </div>
      </div>
    </Layout>
  );
};
export default VisitorEvaluateStudent;
