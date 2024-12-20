import { useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { Box, Typography } from "@mui/material";

import QuestionCard from "./card";
import { deleteQuestion } from "@/api/kiosk";
import DeleteQuestionConfirmation from "../delete-confirmation";
import ConfirmationDailog from "@/components/ConfirmDailog";

const QuestionsList = ({ questions = [], onEditClick, onDelete, toggleSelectedQuestion, selectedQuestions }) => {
  const [deleteQuestionLoading, setDeleteQuestionLoading] = useState({
    id: null,
    isLoading: false,
  });
  const [deleteQuestionId, setDeleteQuestionId] = useState(null);
  const isDeleteDialogOpen = !!deleteQuestionId;

  const toggleQuestionDialog = ({ id = null } = {}) => {
    setDeleteQuestionId(id);
  };

  const isQuestionSelected = (id) =>
    selectedQuestions.some((question) => question.id === id);

  const updateDeleteQuestionLoading = (isLoading = false, id = null) => {
    setDeleteQuestionLoading({
      id,
      isLoading,
    });
  };

  const deleteQuestionHandler = async () => {
    try {
      toggleQuestionDialog();
      updateDeleteQuestionLoading(true, deleteQuestionId);
      await deleteQuestion(deleteQuestionId);
      onDelete(deleteQuestionId);
      toast("Question Deleted Successfully!", {
        type: "success",
      });
    } catch (error) {
      console.log("Error while deleting", error);
      toast("An error occured while deleting question.", {
        type: "error",
      });
    } finally {
      updateDeleteQuestionLoading(false);
    }
  };

  const deleteCOnfirmationHandler = (id) => {
    toggleQuestionDialog({ id });
  };

  return (
    <Box mt="2rem">
      {questions.length > 0 ? (
        <Box>
          {questions.map((question, i) => {
            const isDeleteLoading = deleteQuestionLoading.id === question.id;
            const isSelected = isQuestionSelected(question.id);
            return (
              <Box my="0.3rem" key={question.id} sx={{ display: "flex", alignItems: "center" }}>
                <Box>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectedQuestion(question)}
                    style={{ marginRight: "1rem", cursor: "pointer", width: "1rem", height: "1rem", accentColor: isSelected ? "red" : "initial", }}
                  />
                </Box>
                <Box sx={{ width: "100%" }}>
                  <QuestionCard
                    index={i}
                    questionDetails={question}
                    isDeleteLoading={isDeleteLoading}
                    onEditClick={onEditClick}
                    onDeleteClick={deleteCOnfirmationHandler}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      ) : (
        <Box>
          <Typography textAlign="center" component="p">
            No Questions Found
          </Typography>
        </Box>
      )}

      <ConfirmationDailog
        open={isDeleteDialogOpen}
        handleClose={toggleQuestionDialog}
        handleConfirm={deleteQuestionHandler}
        text="Are you sure, you want to Delete this Question?"
        okBtnText="Delete"
      />
    </Box>
  );
};

export default QuestionsList;

QuestionsList.propTypes = {
  questions: PropTypes.array,
  onEditClick: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
};
