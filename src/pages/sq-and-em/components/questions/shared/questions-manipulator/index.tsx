import { useState } from "react";
import PropTypes from "prop-types";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { addGeneralQuestion, updateQuestion } from "@/api/kiosk";

const emptyoption = {
  is_valid: false,
  option: "",
};

const QuestionsManipulator = ({
  open,
  isCreate,
  details,
  onManipulation,
  kioskId,
  handleClose,
}) => {
  const manipulationApi = isCreate ? addGeneralQuestion : updateQuestion;

  const [isLoading, setIsLoading] = useState(false);
  const [questionDetails, setQuestionsDetails] = useState({
    question: details?.question || "",
    options: details?.options || [emptyoption],
    isActive: details?.isActive ?? true,
    kiosks: details?.kiosks || [],
  });


  const isAnyOptionEmpty = questionDetails.options.some((op) => !op.option);
  const isAnyOptionSelected = questionDetails.options.some((op) => op.is_valid);

  const updateQuestionDetails = (name, value) => {
    setQuestionsDetails((prev) => ({
      ...prev,
      [name]: typeof value === "function" ? value(prev[name]) : value,
    }));
  };

  const addOptionHandler = () => {
    updateQuestionDetails("options", (prev) => [...prev, emptyoption]);
  };

  const getDeleteoptionHandler = (dI) => () => {
    updateQuestionDetails("options", (prev) => prev.filter((_, i) => i !== dI));
  };

  const getUpdateOptionsHandler = (optionIndex) => (name, value) => {
    updateQuestionDetails("options", (prev) => {
      return prev.map((op, i) => {
        if (name === "is_valid") return { ...op, [name]: i == value };
        return optionIndex === i ? { ...op, [name]: value } : op;
      });
    });
  };

  const onSubmitHandler = async () => {
    try {
      setIsLoading(true);

      const data = {
        isActive: questionDetails.isActive,
        options: questionDetails.options,
        question: questionDetails.question,
        kiosks: questionDetails.kiosks,
      };

      if (isCreate) {
        data.kioskId = kioskId;
      }

      const payload = {
        data,
        id: details?.id,
      };

      const response = await manipulationApi(payload);
      const manipulationData = { data: response.data, isCreate };
      onManipulation(manipulationData);

      toast(`Question ${isCreate ? "Added" : "Updated"} Successfully`, {
        type: "success",
      });
      handleClose();
    } catch (error) {
      console.log("Question API failed with", error);
      toast(
        `An error occured while ${isCreate ? "Creating" : "updating"} Quesiton`,
        {
          type: "error",
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const disabledMessage = !questionDetails.question
    ? "Please Fill Question Field"
    : isAnyOptionEmpty
    ? "Please fill All options"
    : !isAnyOptionSelected
    ? "Please Select an option"
    : "";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: "1rem 1rem",
        }}
      >
        <Typography variant="h4" fontWeight={600}>
          {isCreate ? "Create New" : "Update"} Question
        </Typography>

        {questionDetails.isActive ? (
          <Chip
            onClick={() => updateQuestionDetails("isActive", false)}
            size="small"
            label="Active"
            color="success"
          />
        ) : (
          <Chip
            onClick={() => updateQuestionDetails("isActive", true)}
            size="small"
            label="inactive"
          />
        )}
      </Box>

      <div></div>
      <DialogContent>
        <TextField
          fullWidth
          label="Question"
          value={questionDetails.question}
          onChange={(e) => updateQuestionDetails("question", e.target.value)}
        />

        <Box type="A" component="ol">
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="female"
            name="radio-buttons-group"
            onChange={(_, i) => getUpdateOptionsHandler(i)("is_valid", i)}
          >
            {questionDetails.options.map((optionDetails, i) => {
              return (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    mt: "0.5rem",
                  }}
                >
                  <FormControlLabel
                    value={i}
                    checked={optionDetails.is_valid}
                    control={<Radio />}
                  />

                  <Box component="li" sx={{ width: "100%" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <TextField
                        fullWidth
                        value={optionDetails?.option || ""}
                        onChange={(e) =>
                          getUpdateOptionsHandler(i)("option", e.target.value)
                        }
                      />

                      <IconButton
                        onClick={getDeleteoptionHandler(i)}
                        disabled={questionDetails.options.length < 2}
                        color="error"
                      >
                        <DeleteOutlined />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              )
            })}
          </RadioGroup>

          <Box sx={{ mt: "0.5rem" }}>
            <Divider sx={{ width: "100%" }} />

            <Tooltip
              title={
                isAnyOptionEmpty && "Please fill all options to add new option"
              }
            >
              <div>
                <Button
                  fullWidth
                  startIcon={<PlusOutlined />}
                  onClick={addOptionHandler}
                  sx={{ mt: "0.5rem" }}
                  disabled={isAnyOptionEmpty  || questionDetails.options.length > 5}
                >
                  Add Option
                </Button>
              </div>
            </Tooltip>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>

        <Tooltip title={disabledMessage}>
          <div>
            <Button
              variant="contained"
              sx={{ fontWeight: 600 }}
              onClick={onSubmitHandler}
              disabled={!!disabledMessage || isLoading}
            >
              {isLoading
                ? isCreate
                  ? "Creating..."
                  : "Updating..."
                : isCreate
                ? "Create"
                : "Update"}
            </Button>
          </div>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
};

export default QuestionsManipulator;

QuestionsManipulator.propTypes = {
  open: PropTypes.bool,
  isCreate: PropTypes.bool,
  onManipulation: PropTypes.func,
  details: PropTypes.object,
  kioskId: PropTypes.string,
  handleClose: PropTypes.func,
};
