import PropType from "prop-types";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { DeleteOutlined, EditOutlined, CheckOutlined } from "@ant-design/icons";

import MainCard from "@/components/MainCard";
import { StyledoptionWrapper } from "./ui";

const QuestionCard = ({
  questionDetails,
  index,
  onEditClick,
  onDeleteClick,
  isDeleteLoading = false,
}) => {
  const question = `Q${index + 1}. ${questionDetails.question}`;

  let kioks = questionDetails.kiosks?.map((kiosk) => kiosk.kioskName).join("\n")

  return (
    <MainCard>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "0.5rem",
          gap: "0.3rem",
        }}
      >

        {questionDetails?.kiosks?.length > 0 &&
          <Tooltip title={<div style={{ minWidth: '80px', whiteSpace: 'pre-wrap' }}>
            {kioks}
          </div>}
            placement="top"
          >
            <Chip sx={{
              backgroundColor: "#f3f3f3",
              color: "#000",
              fontSize: "0.8rem",
            }} size="small" label={"Assigned to"} color={"info"} />
          </Tooltip>

        }

        {questionDetails.isActive ? (
          <Chip size="small" label="Active" color="success" />
        ) : (
          <Chip size="small" label="inactive" />
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5">{question}</Typography>

        <Box sx={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
          <IconButton
            disabled={isDeleteLoading}
            onClick={() => onEditClick({ details: questionDetails })}
          >
            <EditOutlined />
          </IconButton>

          {isDeleteLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                minWidth: "2.4rem",
              }}
            >
              <CircularProgress size="1rem" />
            </Box>
          ) : (
            <IconButton
              color="error"
              onClick={() => onDeleteClick(questionDetails.id)}
            >
              <DeleteOutlined />
            </IconButton>
          )}
        </Box>
      </Box>

      <Box component="ol" type="A">
        {questionDetails.options.map((optionDetails, i) => {
          return (
            <StyledoptionWrapper is_valid={optionDetails.is_valid} key={i}>
              <Typography fontWeight={500} component="li">
                {optionDetails.option}
              </Typography>

              {optionDetails.is_valid && <CheckOutlined color="success" />}
            </StyledoptionWrapper>
          );
        })}
      </Box>
    </MainCard>
  );
};

export default QuestionCard;

QuestionCard.propTypes = {
  index: PropType.number,
  onEditClick: PropType.func,
  questionDetails: PropType.object,
  isDeleteLoading: PropType.bool,
  onDeleteClick: PropType.func,
};
