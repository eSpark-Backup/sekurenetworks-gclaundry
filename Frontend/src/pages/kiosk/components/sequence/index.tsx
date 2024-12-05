import apiService from "@/api/apiService";
import ApiLoader from "@/components/api-loader";
import { KIOSK } from "@/types/kiosk";
import { Stack, Typography } from "@mui/material";
import { useRequest } from "ahooks";
import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const Sequence = () => {
  const screens = [
    {
      screen: "WelcomeScreen",
      text: "Attractor Screen",
    },
    {
      screen: "LoginScreen",
      text: "Login Screen",
    },
    {
      screen: "SelectScreen",
      text: "Dispense Screen",
    },
    {
      screen: "QuotesScreen",
      text: "Message Screen",
    },
    {
      screen: "SurveyScreen",
      text: "Survey Screen",
    },
  ];

  const [items, setItems] = useState(screens);

  const params = useParams();

  const navigate = useNavigate();
  const { runAsync: updateKiosk } = useRequest(
    (macId, data) => apiService.kisok.update(macId, data),
    {
      manual: true,
      onSuccess: ({ data }: any) => {
        toast(data.message, { type: "success" });
      },
    }
  );

  const { loading, runAsync } = useRequest(
    (macId) => apiService.kisok.getKiosk(macId),
    {
      manual: true,
      onError: () => {
        navigate("/kiosk");
      },
    }
  );

  const fetchKiosk = async (macId: string): Promise<KIOSK> => {
    const { data } = await runAsync(macId);
    return data;
  };

  // Handle drag end event
  const handleOnDragEnd = async (result: any) => {
    if (!result.destination) return;

    const sequence = Array.from(items);

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    // Prevent dropping items into disabled positions
    if (destinationIndex < 3) return;
    // Move item if not disabled
    const [movedItem] = sequence.splice(sourceIndex, 1);
    sequence.splice(destinationIndex, 0, movedItem);
    setItems(sequence);
    await updateKiosk(params.id, {
      screen_sequence: sequence.map((e) => e.screen),
    });
  };

  useEffect(() => {
    (async () => {
      let data = await fetchKiosk(params.id!);
      const newSequence = items
        .slice() // Make a shallow copy of array1 to avoid modifying it
        .sort(
          (a, b) =>
            data.screen_sequence.indexOf(a.screen) -
            data.screen_sequence.indexOf(b.screen)
        );
      setItems(newSequence);
    })();
  }, [params.id]);

  return (
    <ApiLoader isLoading={loading}>
      <Stack spacing={3}>
        <Stack
          direction={"row"}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h3">Manage Sequence of screen's</Typography>
        </Stack>
      </Stack>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {items.map((item, index) => (
                <Draggable
                  key={item.screen}
                  draggableId={item.screen}
                  index={index}
                  isDragDisabled={index < 3} // Disable drag for this item if it's disabled
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...(index < 3
                        ? {}
                        : {
                            ...provided.draggableProps,
                            ...provided.dragHandleProps,
                          })}
                      className={`relative w-full border rounded-lg overflow-hidden transition-transform duration-200 mt-2 ${
                        index < 3
                          ? "bg-gray-300 opacity-50 cursor-not-allowed"
                          : "bg-white shadow-lg hover:shadow-2xl hover:scale-105"
                      }`}
                      style={{
                        ...provided.draggableProps.style,
                        height: "180px",
                      }} // Set fixed height for the entire component
                    >
                      {/* Image */}
                      <div className="relative w-full h-full">
                        <img
                          src="/background.jpg"
                          alt={item.screen}
                          className="w-full h-full object-cover rounded-t-lg"
                        />

                        {/* Centered Text Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-red-500 text-xl md:text-5xl font-extrabold bg-opacity-50 px-4 py-2 rounded">
                            {item.text}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </ApiLoader>
  );
};

export default Sequence;
