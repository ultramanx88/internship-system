import { Layout } from "../../../../../component/layout";
import { PROTECTED_PATH } from "../../../../../constant/path.route";
import useViewModel from "../../viewModel";
import { useNavigate } from "react-router-dom";
import {
  CancelRounded,
  AddRounded,
  DeleteForeverRounded,
  EditNoteRounded,
} from "@mui/icons-material";
import {
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table,
  Paper,
  Radio,
} from "@mui/material";
import { Form, Formik } from "formik";
import { Field } from "../../../../../component/input/field";
const VisitorEvaluateCompanyPerson = () => {
  const { id, handleOnSubmitCompany, visitorCompanyEvaluates } =
    useViewModel();
  const navigate = useNavigate();
  return (
    <Layout
      header={[
        {
          path: PROTECTED_PATH.VISITOR_EVALUATE,
          name: "ประเมิน",
        },
        {
          path: PROTECTED_PATH.VISITOR_EVALUATE_COMPANY,
          name: "ประเมินสถานประกอบการ",
        },
        {
          path: "",
          name: "ประเมินสถานประกอบการ",
        },
      ]}
    >
      <div className="bg-white rounded-lg my-4">
        <div className="flex justify-end p-4">
          <div
            onClick={() => navigate(PROTECTED_PATH.VISITOR_EVALUATE_COMPANY)}
          >
            <CancelRounded
              fontSize="large"
              className="text-secondary-600 cursor-pointer"
            />
          </div>
        </div>
        <div className="p-10">
          <Formik
            initialValues={{ ids: [], scores: [], comment: "" }}
            onSubmit={(e) => handleOnSubmitCompany(e)}
          >
            {({ values, setFieldValue }) => (
              <Form>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">หัวข้อประเมิน</TableCell>
                        <TableCell align="center">5</TableCell>
                        <TableCell align="center">4</TableCell>
                        <TableCell align="center">3</TableCell>
                        <TableCell align="center">2</TableCell>
                        <TableCell align="center">1</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visitorCompanyEvaluates.map((item, key) => (
                        <TableRow key={item.id + key}>
                          <TableCell>{item.questions}</TableCell>
                          {[5, 4, 3, 2, 1].map((score) => (
                            <TableCell key={score}>
                              <Radio
                                name={`scores[${key}]`}
                                value={score}
                                checked={values.scores[key] === score}
                                onChange={() => {
                                  const newScores = [...values.scores];
                                  newScores[key] = score;
                                  const newIds = [...values.ids];
                                  newIds[key] = item.id;
                                  setFieldValue("scores", newScores);
                                  setFieldValue("ids", newIds);
                                }}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <div className="my-4">
                  <Field name="comment" label_th="ความคิดเห็น" multiline />
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
            )}
          </Formik>
        </div>
      </div>
    </Layout>
  );
};
export default VisitorEvaluateCompanyPerson;
