import { VisitorService } from "../../../service/api/visitor";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type {
  VisitorInterface,
  VisitorScheduleDTO,
} from "../../../service/api/visitor/type";

const useViewModel = () => {
  const visitorService = new VisitorService();
  const [searchParams] = useSearchParams();
  const id = Number(searchParams.get("id")) || 0;
  const [visitorTrainings, setVisitorTrainings] = useState<VisitorInterface[]>(
    []
  );
  const [visitorTraining, setVisitorTraining] = useState<VisitorInterface>();

  const [editSchedule, setEditSchedule] =
    useState<VisitorScheduleDTO | null>();

  const initialValues = {
    visit_at: editSchedule?.visit_at || "",
    comment: editSchedule?.comment || "",
    visit_no: editSchedule?.visit_no || 0,
    visitor_training_id: editSchedule?.visitor_training_id || 0,
    id: editSchedule?.id,
  };

  const getVisitorTrainings = async () => {
    try {
      const response = await visitorService.reqGetVisitor();
      setVisitorTrainings(response);
    } catch (err) {
      console.log(err);
    }
  };
  const getVisitorTraining = async () => {
    try {
      const response = await visitorService.reqGetVisitorSchedule(id);
      setVisitorTraining(response);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (id) {
      getVisitorTraining();
    } else {
      getVisitorTrainings();
    }
  }, [id]);

  const handleOnSubmit = (value: VisitorScheduleDTO) => {
    if (value.id) {
      visitorService.reqPutVisitorSchedule(value.id, value).then(() => {
        getVisitorTraining();
        setEditSchedule(null);
      });
    } else {
      visitorService.reqPostVisitorSchedule(value).then(() => {
        getVisitorTraining();
        setEditSchedule(null);
      });
    }
  };

  return {
    visitorTrainings,
    id,
    visitorTraining,
    editSchedule,
    setEditSchedule,
    handleOnSubmit,
    initialValues,
  };
};

export default useViewModel;
