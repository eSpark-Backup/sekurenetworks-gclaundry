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

import { getKioskQuestions } from "@/api/kiosk";
import ApiLoader from "@/components/api-loader";
import { QuestionsList, QuestionsManipulator } from "./shared";

const Questions = () => {
  const { id } = useParams();
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down("sm"));

  const [isLaoding, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [questionDialog, setQuestionsDialog] = useState({
    isopen: false,
    details: null,
  });

  const fetchKiosksQustions = useCallback(async () => {
    try {
      const res = await getKioskQuestions(id);
      setQuestions(res?.data || []);
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

  useEffect(() => {
    fetchKiosksQustions();
  }, [fetchKiosksQustions]);

  return (
    <Box>
      <Stack spacing={3}>
        <Stack
          direction={matchDownSM ? "column" : "row"}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h3">Manage Questions</Typography>

          {/* <Button
            variant="contained"
            startIcon={<PlusOutlined />}
            onClick={toggleQuestionsManipulator}
          >
            Add New Question
          </Button> */}
        </Stack>
      </Stack>

      <ApiLoader mt="1rem" isLoading={isLaoding}>
        <QuestionsList
          onEditClick={toggleQuestionsManipulator}
          onDelete={onDeleteHandler}
          questions={questions}
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
      </ApiLoader>
    </Box>
  )
};

export default Questions;
