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
  const [openSelectedUnAssignKioksDialog, setOpenSelectedUnAssignKioksDialog] = useState(false);
  const [selectedKiosks, setSelectedKiosks] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [openAllKiosksConfirmationDialog, setOpenAllKiosksConfirmationDialog] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [kioksByCustomerId, setKiosksByCustomerId] = useState([]);
  const [loadingKioksbyCustomerId, setLoadingKiosksByCustomerId] = useState(false);
  const [openAllKiosksUnAssignConfirmationDialog, setOpenAllKiosksUnAssignConfirmationDialog] = useState(false);
  const [unassingLoading, setUnassignLoading] = useState(false);


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
        setSelectedCustomer(null);
      },
      onError: (error) => {
        console.error(error);
        toast("An error occured while assigning questions", { type: "error" });
        setAssignLoading(false);
      },
    }
  );

  const { runAsync: unassignFromKiosk } = useRequest(
    (data) => apiService.kisok.unassignToKiosk(data),
    {
      manual: true,
      onSuccess: ({ data }: any) => {
        toast(data.message, { type: "success" });
        setUnassignLoading(false);
        setOpenAllKiosksUnAssignConfirmationDialog(false);
        setSelectedQuestions([]);
        setOpenSelectedUnAssignKioksDialog(false);
        setSelectedCustomer(null);
      },
      onError: (error) => {
        console.error(error);
        toast("An error occured while unassigning questions", { type: "error" });
        setUnassignLoading(false);
      },
    }
  );

  const handleKiosksAssign = async () => {

    setAssignLoading(true);
    await assignToKiosk({
      kioskIds: selectedKiosks.length > 0 ? selectedKiosks.map((k) => k.macId) : kioksByCustomerId.map((k) => k.macId),
      dataIds: selectedQuestions.map((q) => q.id),
      type: "QUESTION",
    });

    fetchKiosksQustions();
  }

  const handleAllKiosksAssign = async () => {
    setAssignLoading(true);
    await assignToKiosk({
      kioskIds: kiosks.map((k) => k.macId),
      dataIds: selectedQuestions.map((q) => q.id),
      type: "QUESTION",
    });

    fetchKiosksQustions();
  }

  const handleKiosksUnAssign = async () => {
    const hasNoKiosks = selectedQuestions.some(question => question.kiosks.length === 0);

    if (hasNoKiosks) {
      toast("Some of the selected questions are not assigned to any kiosk", { type: "error" });
      setOpenSelectedUnAssignKioksDialog(false);
      return;
    }

    setUnassignLoading(true);
    await unassignFromKiosk({
      kioskIds: selectedKiosks.length > 0 ? selectedKiosks.map((k) => k.macId) : kioksByCustomerId.map((k) => k.macId),
      dataIds: selectedQuestions.map((q) => q.id),
      type: "QUESTION",
    });

    fetchKiosksQustions();
  }

  const handleAllKiosksUnAssign = async () => {
    const hasNoKiosks = selectedQuestions.some(question => question.kiosks.length === 0);

    if (hasNoKiosks) {
      toast("Some of the selected questions are not assigned to any kiosk", { type: "error" });
      setOpenAllKiosksUnAssignConfirmationDialog(false);
      return;
    }

    const kioskIds = questions
      .map(question => question.kiosks.map(kiosk => kiosk.kioskId)) // Extract kioskId arrays
      .flat(); // Flatten the arrays into a single array

    const uniqueKioskIds = [...new Set(kioskIds)]; // Remove duplicates


    setUnassignLoading(true);
    await unassignFromKiosk({
      kioskIds: uniqueKioskIds,
      dataIds: selectedQuestions.map((q) => q.id),
      type: "QUESTION",
    });

    fetchKiosksQustions();
  }

  const { runAsync: getCustomers } = useRequest(
    (query: any) => apiService.customer.get(query),
    {
      manual: true,
      debounceWait: 1000,
      onSuccess: ({ data }) => setCustomers(data.data),
    }
  );


  useEffect(() => {
    fetchKiosksQustions();
    getCustomers({});
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

  const selectAllQuestions = () => {
    setSelectedQuestions((prev) => {
      if (prev.length === questions.length) return [];
      return questions;
    }
    );
  }

  const isAllQuestionsSelected = selectedQuestions.length === questions.length;

  return (
    <Box>
      <Stack spacing={3}>
        <Stack
          direction={matchDownSM ? "column" : "row"}
          justifyContent="space-between"
          sx={{ alignItems: "center", gap: "1rem" }}
        >
          <Typography variant="h3">Manage Questions</Typography>

          <Box>
            <Box sx={{
              display: "flex",
              gap: "1rem",
              flexDirection: { xs: "column", md: "row" },
              mt: { xs: "1rem", md: 0 },
            }}>

              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={toggleQuestionsManipulator}
              >
                Add New Question
              </Button>

              <Button
                variant="contained"
                onClick={selectAllQuestions}
              >
                {isAllQuestionsSelected ? "Deselect All" : "Select All"}
              </Button>

            </Box>

          </Box>

        </Stack>

        <Stack
          sx={{
            flexDirection: { xs: "column", md: "row" },
            alignItems: "flex-end",
            justifyContent: "flex-end",
            gap: "1rem",
          }}
        >


          <Button
            variant="contained"
            onClick={() => setOpenSelectedKioksDialog(true)}
            disabled={selectedQuestions.length === 0}

          >
            Assign to Customer kiosks
          </Button>
          <Button
            variant="contained"
            onClick={() => setOpenSelectedUnAssignKioksDialog(true)}
            disabled={selectedQuestions.length === 0}

          >
            Unassign to Customer kiosks
          </Button>
          <Button
            variant="contained"
            disabled={selectedQuestions.length === 0}
            onClick={() => setOpenAllKiosksConfirmationDialog(true)}
          >
            Assign to All Kiosks
          </Button>
          <Button
            variant="contained"
            disabled={selectedQuestions.length === 0}
            onClick={() => setOpenAllKiosksUnAssignConfirmationDialog(true)}
          >
            Unassign from All Kiosks
          </Button>
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
          handleClose={() => {
            setOpenSelectedKioksDialog(false);
            setSelectedKiosks([]);
            setSelectedCustomer(null);
            setKiosksByCustomerId([]);
          }
          }
          selectedKiosks={selectedKiosks}
          setSelectedKiosks={setSelectedKiosks}
          onAssign={handleKiosksAssign}
          assignLoading={assignLoading}
          kioksByCustomerId={kioksByCustomerId}
          setKiosksByCustomerId={setKiosksByCustomerId}
          loadingKioksbyCustomerId={loadingKioksbyCustomerId}
          setLoadingKiosksByCustomerId={setLoadingKiosksByCustomerId}
          setSelectedCustomer={setSelectedCustomer}
          customers={customers}
          selectedCustomer={selectedCustomer}
          heading="Assign Questions to Customer Kiosks"
          info="Please Note if kiosk not selected, it will be assign to all Customer Kiosks"
          buttonLabel="Assign"
        />

        <KiosksAssigner
          open={openSelectedUnAssignKioksDialog}
          handleClose={() => {
            setOpenSelectedUnAssignKioksDialog(false);
            setSelectedKiosks([]);
            setSelectedCustomer(null);
            setKiosksByCustomerId([]);
          }
          }
          selectedKiosks={selectedKiosks}
          setSelectedKiosks={setSelectedKiosks}
          onAssign={handleKiosksUnAssign}
          assignLoading={unassingLoading}
          kioksByCustomerId={kioksByCustomerId}
          setKiosksByCustomerId={setKiosksByCustomerId}
          loadingKioksbyCustomerId={loadingKioksbyCustomerId}
          setLoadingKiosksByCustomerId={setLoadingKiosksByCustomerId}
          setSelectedCustomer={setSelectedCustomer}
          customers={customers}
          selectedCustomer={selectedCustomer}
          heading="Unassign Questions to Customer Kiosks"
          info="Please Note if kiosk not selected, it will be Unassign to all Customer Kiosks"
          buttonLabel="Unassign"
        />

        <ConfirmationDailog
          open={openAllKiosksConfirmationDialog}
          handleClose={() => setOpenAllKiosksConfirmationDialog(false)}
          handleConfirm={handleAllKiosksAssign}
          text={`Are you sure, you want to Assign Selected Questions to All kiosks?`}
          okBtnText="Assign"
          assignLoading={assignLoading}

        />

        <ConfirmationDailog
          open={openAllKiosksUnAssignConfirmationDialog}
          handleClose={() => setOpenAllKiosksUnAssignConfirmationDialog(false)}
          handleConfirm={handleAllKiosksUnAssign}
          text={`Are you sure, you want to UnAssign Selected Questions From All kiosks?`}
          okBtnText="UnAssign"
          assignLoading={unassingLoading}

        />

      </ApiLoader>
    </Box>
  )
};

export default Questions;
