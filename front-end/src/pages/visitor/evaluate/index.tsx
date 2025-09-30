import { Layout } from "../../../component/layout";
import { PROTECTED_PATH } from "../../../constant/path.route";
import { useNavigate } from "react-router-dom";
import { ReadMoreRounded } from "@mui/icons-material";
const Evaluate = () => {
  const navigate = useNavigate();
  return (
    <Layout
      header={[
        {
          path: "",
          name: "ประเมิน",
        },
      ]}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-5">
          <p className="font-bold text-secondary-600 text-xl">
            ประเมินสถานประกอบการ
          </p>
          <div className="flex justify-end mt-10">
            <button
              onClick={() => navigate(PROTECTED_PATH.VISITOR_EVALUATE_COMPANY)}
            >
              <ReadMoreRounded fontSize="large" className="text-primary-600" />
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg p-5">
          <p className="font-bold text-secondary-600 text-xl">ประเมินนักศึกษา</p>
          <div className="flex justify-end mt-10">
            <button
              onClick={() => navigate(PROTECTED_PATH.VISITOR_EVALUATE_STUDENT)}
            >
              <ReadMoreRounded fontSize="large" className="text-primary-600" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default Evaluate;
