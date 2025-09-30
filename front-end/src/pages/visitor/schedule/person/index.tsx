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
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { PROTECTED_PATH } from "../../../../constant/path.route";
import dayjs from "dayjs";
import { DatePickerField, Field } from "../../../../component/input/field";
import { Form, Formik } from "formik";
const VisitorSchedulePerson = () => {
  const {
    id,
    visitorTraining,
    editSchedule,
    setEditSchedule,
    handleOnSubmit,
    initialValues,
  } = useViewModel();
  const navigate = useNavigate();
  return (
    <Layout
      header={[
        {
          path: PROTECTED_PATH.VISITOR_SCHEDULE,
          name: "นัดหมายนิเทศ",
        },
        {
          path: "",
          name: visitorTraining?.studentEnroll.student.name || "",
        },
      ]}
    >
      <div className="bg-white rounded-lg my-4">
        <div className="flex justify-end p-4">
          <div onClick={() => navigate(PROTECTED_PATH.VISITOR_SCHEDULE)}>
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
              <div className="my-auto">
                {!editSchedule && (
                  <button
                    className="primary-button bg-gradient my-auto"
                    onClick={() => {
                      setEditSchedule({
                        visit_at: "",
                        comment: "",
                        visit_no:
                          (visitorTraining?.schedules.length || 0) + 1,
                        visitor_training_id: visitorTraining?.id || 0,
                      });
                    }}
                  >
                    <AddRounded />
                    เพิ่มตารางการนิเทศ
                  </button>
                )}
              </div>
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
                      <button
                        onClick={() =>
                          setEditSchedule({
                            ...data,
                            visit_no: data.visitNo,
                            visitor_training_id: data.visitorTrainingId,
                          })
                        }
                      >
                        <EditNoteRounded className="text-primary-600" />
                      </button>
                      <button>
                        <DeleteForeverRounded className="text-error" />
                      </button>
                    </div>
                  </div>
                  <div className="ms-2 mt-2">
                    <p>วันที่ : {dayjs(data.visitAt).format("DD/MM/YYYY")}</p>
                    <p>ความคิดเห็น : {data.comment}</p>
                  </div>
                </div>
              ))}
              {editSchedule && (
                <Formik
                  initialValues={initialValues}
                  onSubmit={(e) => handleOnSubmit(e)}
                >
                  <Form>
                    <div className="grid grid-cols-2 gap-3 my-2">
                      <DatePickerField
                        name="visit_at"
                        label_th="วันที่"
                        label_en="Date"
                      />
                      <div className="col-span-2">
                        <Field
                          name="comment"
                          label_th="ความคิดเห็น"
                          label_en="Comment"
                          multiline
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        className="primary-button bg-error"
                        onClick={() => setEditSchedule(null)}
                      >
                        ยกเลิก
                      </button>
                      <button className="primary-button bg-gradient" type="submit">
                        บันทึก
                      </button>
                    </div>
                  </Form>
                </Formik>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default VisitorSchedulePerson;
