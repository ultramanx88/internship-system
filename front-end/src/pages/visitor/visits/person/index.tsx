import { Layout } from "../../../../component/layout";
import useViewModel from "../viewModel";
import {
  CoopInformation,
  Persona,
} from "../../../../component/information";
import {
  CancelRounded,
  AddRounded,
  DeleteForeverRounded,
  EditNoteRounded,
  ReadMoreRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { PROTECTED_PATH } from "../../../../constant/path.route";
import dayjs from "dayjs";
import { DatePickerField, Field } from "../../../../component/input/field";
import { Form, Formik } from "formik";
const VisitorVisitsPersons = () => {
  const { visitorTraining, id } = useViewModel();
  const navigate = useNavigate();
  return (
    <Layout
      header={[
        {
          path: PROTECTED_PATH.VISITOR_VISITS,
          name: "รายงานผลการนิเทศ",
        },
        {
          path: "",
          name: visitorTraining?.studentEnroll.student.name || "",
        },
      ]}
    >
      <div className="bg-white rounded-lg my-4">
        <div className="flex justify-end p-4">
          <div onClick={() => navigate(PROTECTED_PATH.VISITOR_VISITS)}>
            <CancelRounded
              fontSize="large"
              className="text-secondary-600 cursor-pointer"
            />
          </div>
        </div>
        <div className="p-10">
          {id && <Persona id={id} />}
          {id && <CoopInformation id={id} />}
          <div>
            <div className="flex justify-between my-5">
              <h1 className="text-xl font-bold text-secondary-600 py-5 border-b border-secondary-600 my-5 w-full">
                ตารางการนิเทศ
              </h1>
            </div>
            <div>
              {visitorTraining?.schedules.map((data, key) => (
                <div
                  key={key}
                  className="bg-white shadow-lg rounded-2xl p-5 my-5"
                >
                  <div className="flex justify-between">
                    <p className="font-bold text-lg text-secondary-600">
                      ครั้งที่ {data.visitNo}
                    </p>
                    <div className="flex gap-4">
                      <p>
                        สถานะการประเมิน{" "}
                        <span className="font-bold text-lg text-secondary-600">
                          {" "}
                          ยังไม่ได้ประเมิน
                        </span>
                      </p>
                      <button
                        onClick={() =>
                          navigate(
                            PROTECTED_PATH.VISITOR_EVALUATE + `?id=${data.id}`
                          )
                        }
                      >
                        <p className="font-bold text-lg text-primary-600 underline">
                          ประเมิน
                        </p>
                      </button>
                    </div>
                  </div>
                  <div className="ms-2 mt-2">
                    <p>วันที่ : {dayjs(data.visitAt).format("DD/MM/YYYY")}</p>
                    <p>ความคิดเห็น : {data.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default VisitorVisitsPersons;
