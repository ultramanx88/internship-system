import { VisitorService } from "../../../service/api/visitor";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type {
  VisitorInterface,
  VisitorEvaluateStudentInterface,
  VisitorEvaluateStudentDTO,
} from "../../../service/api/visitor/type";

const useViewModel = () => {
  const visitorService = new VisitorService();
  const [searchParams] = useSearchParams();
  const id = Number(searchParams.get("id")) || 0;
  const [visitorTrainings, setVisitorTrainings] = useState<VisitorInterface[]>(
    []
  );

  const [visitorStudentEvaluates, setVisitorStudentEvaluates] = useState<
    VisitorEvaluateStudentInterface[]
  >([]);
  const [visitorCompanyEvaluates, setVisitorCompanyEvaluates] = useState<
    VisitorEvaluateStudentInterface[]
  >([]);

  const getVisitorTrainings = async () => {
    try {
      const response = await visitorService.reqGetVisitor();
      setVisitorTrainings(response);
    } catch (err) {
      console.log(err);
    }
  };
  const getVisitorStudentEvaluate = async () => {
    try {
      const response = await visitorService.reqGetVisitorEvaluateStudent(id);
      setVisitorStudentEvaluates(response);
    } catch (err) {
      console.log(err);
    }
  };
  const getVisitorCompanyEvaluate = async () => {
    try {
      const response = await visitorService.reqGetVisitorEvaluateCompany(id);
      setVisitorCompanyEvaluates(response);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (id) {
      getVisitorStudentEvaluate();
      getVisitorCompanyEvaluate();
    } else {
      getVisitorTrainings();
    }
  }, [id]);

  const handleOnSubmitStudent = (value: VisitorEvaluateStudentDTO) => {
    visitorService.reqPutVisitorEvaluateStudent(id, value).then(() => {
      getVisitorStudentEvaluate();
    });
  };
  const handleOnSubmitCompany = (value: VisitorEvaluateStudentDTO) => {
    visitorService.reqPutVisitorEvaluateCompany(id, value).then(() => {
      getVisitorCompanyEvaluate();
    });
  };

  return {
    visitorTrainings,
    id,
    handleOnSubmitStudent,
    visitorStudentEvaluates,
    handleOnSubmitCompany,
    visitorCompanyEvaluates,
  };
};

export default useViewModel;
