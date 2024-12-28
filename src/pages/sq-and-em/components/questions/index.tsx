import { PlusOutlined } from "@ant-design/icons";
import {
  Box,
  Button,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getAllKioskData, getGeneralQuestions } from "@/api/kiosk";
import ApiLoader from "@/components/api-loader";
import { QuestionsList, QuestionsManipulator } from "./shared";
import KiosksAssigner from "./shared/kiosks-assigner";
import { useRequest } from "ahooks";
import apiService from "@/api/apiService";
import { toast } from "react-toastify";
import ConfirmationDailog from "@/components/ConfirmDailog";
import useFetchKiosks from "@/hooks/useFetchKiosks";

const Questions = () => {
  const { id } = useParams();
  const theme = useTheme();
  const { kiosks, isLoading: kiosksLoading } = useFetchKiosks();
  const matchDownSM = useMediaQuery(theme.breakpoints.down("sm"));

  const [isLaoding, setIsLoading] = useState(true);

  interface Question {
    id: string;
    question: string;
    options: { option: string; is_valid: boolean }[];
    isActive: boolean;
    kioskId: string;
  }

  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionDialog, setQuestionsDialog] = useState({
    isopen: false,
    details: null,
  });
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [openSelectedKioksDialog, setOpenSelectedKioksDialog] = useState(false);
  const [selectedKiosks, setSelectedKiosks] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [openAllKiosksConfirmationDialog, setOpenAllKiosksConfirmationDialog] = useState(false);


  const fetchKiosksQustions = useCallback(async () => {
    try {
      const res = await getGeneralQuestions();
      setQuestions(res?.data || []);
      // setQuestions(dummyQuestions)
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const toggleQuestionsManipulator = ({ details = null } = {}) => {
    setQuestionsDialog((prev) => ({
      ...prev,
      isopen: !prev.isopen,
      details,
    }));
  };

  const onManipulationHandler = ({ data, isCreate }) => {
    if (isCreate) setQuestions((prev) => [...prev, data]);
    else setQuestions((prev) => prev.map((q) => (q.id === data.id ? data : q)));
  };

  const onDeleteHandler = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const toggleSelectedQuestion = (question: Question) => {
    setSelectedQuestions((prev) => {
      const isAlreadySelected = prev.some((q) => q.id === question.id);
      if (isAlreadySelected) {
        return prev.filter((q) => q.id !== question.id);
      }
      return [...prev, question];
    });
  };

  const { runAsync: assignToKiosk } = useRequest(
    (data) => apiService.kisok.assignToKiosk(data),
    {
      manual: true,
      onSuccess: ({ data }: any) => {
        toast(data.message, { type: "success" });
        setAssignLoading(false);
        setOpenSelectedKioksDialog(false);
        setOpenAllKiosksConfirmationDialog(false);
        setSelectedKiosks([]);
        setSelectedQuestions([]);
      },
      onError: (error) => {
        console.error(error);
        toast("An error occured while assigning questions", { type: "error" });
        setAssignLoading(false);
        setOpenSelectedKioksDialog(false);
      },
    }
  );

  const handleKiosksAssign = async () => {
    setAssignLoading(true);
    await assignToKiosk({
      kioskIds: selectedKiosks.map((k) => k.macId),
      dataIds: selectedQuestions.map((q) => q.id),
      type: "QUESTION",
    });

    fetchKiosksQustions();
  }

  const handleAllKiosksAssign = async () => {
    setAssignLoading(true);
    await assignToKiosk({
      kioskIds: kiosks.map((k) => k.macId),
      dataIds: questions.map((q) => q.id),
      type: "QUESTION",
    });

    fetchKiosksQustions();
  }




  useEffect(() => {
    fetchKiosksQustions();
  }, [fetchKiosksQustions]);

  // const fetchKiosks = async () => {
  //     try {
  //         const res = await getAllKioskData();
  //         setKioks(res || []);

  //     } catch (error) {
  //         console.error(error);
  //     } finally {
  //         setIsLoading(false);
  //     }
  // };


  // useEffect(() => {
  //     fetchKiosks();
  // }, []);



  return (
    <Box>
      <Stack spacing={3}>
        <Stack
          direction={matchDownSM ? "column" : "row"}
          justifyContent="space-between"
          sx={{ alignItems: "center", gap: "1rem" }}
        >
          <Typography variant="h3">Manage Questions</Typography>

          <Box sx={{
            display: "flex",
            gap: "1rem",
            flexDirection: { xs: "column", md: "row" },
            mt: { xs: "1rem", md: 0 },
          }}>
            <Button
              variant="contained"
              disabled={!selectedQuestions.length}
              onClick={() => setOpenSelectedKioksDialog(true)}

            >
              Assign Questions
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpenAllKiosksConfirmationDialog(true)}
            >
              Assign to All Kiosks
            </Button>
            <Button
              variant="contained"
              startIcon={<PlusOutlined />}
              onClick={toggleQuestionsManipulator}
            >
              Add New Question
            </Button>
          </Box>
        </Stack>
      </Stack>

      <ApiLoader mt="1rem" isLoading={isLaoding}>
        <QuestionsList
          onEditClick={toggleQuestionsManipulator}
          onDelete={onDeleteHandler}
          questions={questions}
          toggleSelectedQuestion={toggleSelectedQuestion}
          selectedQuestions={selectedQuestions}
        />
        {questionDialog.isopen && (
          <QuestionsManipulator
            kioskId={id}
            isCreate={!questionDialog.details}
            details={questionDialog.details}
            open={questionDialog.isopen}
            handleClose={toggleQuestionsManipulator}
            onManipulation={onManipulationHandler}

          />
        )}


        <KiosksAssigner
          open={openSelectedKioksDialog}
          handleClose={() => setOpenSelectedKioksDialog(false)}
          selectedKiosks={selectedKiosks}
          setSelectedKiosks={setSelectedKiosks}
          onAssign={handleKiosksAssign}
          assignLoading={assignLoading}
          kiosks={kiosks}
          kiosksLoading={kiosksLoading}

        />

        <ConfirmationDailog
          open={openAllKiosksConfirmationDialog}
          handleClose={() => setOpenAllKiosksConfirmationDialog(false)}
          handleConfirm={handleAllKiosksAssign}
          text="Are you sure, you want to Assign below Questions to All kiosks?"
          okBtnText="Assign"
          assignLoading={assignLoading}

        />

      </ApiLoader>
    </Box>
  )
};

export default Questions;
