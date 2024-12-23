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
import KiosksAssigner from "./shared/kiosks-assigner";

const Questions = () => {
  const { id } = useParams();
  const theme = useTheme();
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


  const dummyQuestions = [
    {
      "id": "e4446869-b507-4019-9a79-6391124a370d",
      "question": "How much energy is saved using cold versus hot water",
      "options": [
        {
          "option": "27%",
          "is_valid": false
        },
        {
          "option": "66%",
          "is_valid": false
        },
        {
          "option": "50%",
          "is_valid": false
        },
        {
          "option": "93%",
          "is_valid": true
        }
      ],
      "isActive": true,
      "kioskId": "14:f6:d8:31:d3:15"
    },
    {
      "id": "d55156c9-51b8-4edb-9782-570d2f04eb52",
      "question": "Which stains are better removed with cold water?",
      "options": [
        {
          "option": "Food",
          "is_valid": false
        },
        {
          "option": "Blood",
          "is_valid": false
        },
        {
          "option": "Beverage",
          "is_valid": false
        },
        {
          "option": "All of the above",
          "is_valid": true
        }
      ],
      "isActive": true,
      "kioskId": "14:f6:d8:31:d3:15"
    },
    {
      "id": "51c6c4e5-4d4c-4805-b27a-43e68a7f27bb",
      "question": "What fabrics are best preserved by using a drying rack (air dry) instead of a dryer cycle? ",
      "options": [
        {
          "option": "Knitted/Woven fabrics (sweaters, cardigans, wool)",
          "is_valid": false
        },
        {
          "option": "Leather, Suede, Faux Leather, Natural or Faux Fur",
          "is_valid": true
        },
        {
          "option": "Silk, Lingerie, Delicate Fabrics, Spandex/Lycra",
          "is_valid": false
        },
        {
          "option": "All of the above",
          "is_valid": false
        }
      ],
      "isActive": true,
      "kioskId": "14:f6:d8:31:d3:15"
    }
  ]

  const fetchKiosksQustions = useCallback(async () => {
    try {
      const res = await getKioskQuestions(id);
      // setQuestions(res?.data || []);
      setQuestions(dummyQuestions)
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

  const toggleSelectedQuestion = (question: Question) => {
    setSelectedQuestions((prev) => {
      const isAlreadySelected = prev.some((q) => q.id === question.id);
      if (isAlreadySelected) {
        return prev.filter((q) => q.id !== question.id);
      }
      return [...prev, question];
    });
  };

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
            flexDirection: { xs: "column", sm: "row" },
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

        {
          <KiosksAssigner
            open={openSelectedKioksDialog}
            handleClose={() => setOpenSelectedKioksDialog(false)}
          // handleClose={() => { }}
          // selectedQuestions={selectedQuestions}
          />
        }
      </ApiLoader>
    </Box>
  )
};

export default Questions;
