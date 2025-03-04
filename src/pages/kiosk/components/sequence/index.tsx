import apiService from "@/api/apiService"
import ApiLoader from "@/components/api-loader"
import type { KIOSK } from "@/types/kiosk"
import { Autocomplete, Stack, TextField, Typography } from "@mui/material"
import { useRequest } from "ahooks"
import { useEffect, useMemo, useCallback, useState } from "react"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify"
import type { DropResult } from "react-beautiful-dnd"

const SCREENS = [
  { screen: "WelcomeScreen", text: "Attractor Screen" },
  { screen: "LoginScreen", text: "Login Screen" },
  { screen: "SelectScreen", text: "Dispense Screen" },
  { screen: "SQfollowedbyEM", text: "SQ followed by EM" },
  { screen: "SQ1followedbySQ2", text: "SQ1 followed by SQ2" },
  { screen: "OnlySQ1", text: "Only SQ1" },
]

const SEQUENCE = ["WelcomeScreen", "LoginScreen", "SelectScreen", "SQfollowedbyEM", "SQ1followedbySQ2", "OnlySQ1"]

const Sequence = () => {
  const [items, setItems] = useState(SCREENS.slice(0, 3))

  const params = useParams()

  const navigate = useNavigate()
  const { runAsync: updateKiosk } = useRequest((macId, data) => apiService.kisok.update(macId, data), {
    manual: true,
    onSuccess: ({ data }: any) => {
      toast(data.message, { type: "success" })
    },
  })

  const { loading, runAsync } = useRequest((macId) => apiService.kisok.getKiosk(macId), {
    manual: true,
    onError: () => {
      navigate("/kiosk")
    },
  })

  const fetchKiosk = useCallback(
    async (macId: string): Promise<KIOSK> => {
      const { data } = await runAsync(macId)
      return data
    },
    [runAsync],
  )

  const autocompleteOptions = useMemo(
    () => [
      { screen: "SQfollowedbyEM", text: "SQ followed by EM" },
      { screen: "SQ1followedbySQ2", text: "SQ1 followed by SQ2" },
      { screen: "OnlySQ1", text: "Only SQ1" },
    ],
    [],
  )

  const handleOnDragEnd = useCallback(
    async (result: DropResult) => {
      if (!result.destination || result.destination.index < 3) return

      const newItems = Array.from(items)
      const [movedItem] = newItems.splice(result.source.index, 1)
      newItems.splice(result.destination.index, 0, movedItem)

      setItems(newItems)
      await updateKiosk(params.id!, {
        screen_sequence: newItems.map((e) => e.screen),
      })
    },
    [items, updateKiosk, params.id],
  )

  useEffect(() => {
    const initializeKiosk = async () => {
      const data = await fetchKiosk(params.id!)
      const newSequence = data.screen_sequence.map(
        (screen: string) => SCREENS.find((e) => e.screen === screen) || { screen, text: screen },
      )
      setItems(newSequence)
    }

    initializeKiosk()
  }, [params.id, fetchKiosk])

  const DraggableItem = ({ item, index, isDragDisabled }: any) => (
    <Draggable key={item.screen} draggableId={item.screen} index={index} isDragDisabled={isDragDisabled}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...(isDragDisabled ? {} : provided.draggableProps)}
          {...(isDragDisabled ? {} : provided.dragHandleProps)}
          className={`relative w-full border rounded-lg overflow-hidden transition-transform duration-200 mt-2 cursor-not-allowed ${
            isDragDisabled
              ? "bg-gray-300 opacity-50 cursor-not-allowed"
              : "bg-white shadow-lg hover:shadow-2xl hover:scale-105"
          }`}
          style={{
            ...provided.draggableProps.style,
            height: "180px",
          }}
        >
          <div className="relative w-full h-full">
            <img src="/background.jpg" alt={item.screen} className="w-full h-full object-cover rounded-t-lg" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-red-500 text-xl md:text-5xl font-extrabold bg-opacity-50 px-4 py-2 rounded">
                {item.text}
              </span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )

  const ConditionalBoxes = ({ selectedScreen }: any) => {
    switch (selectedScreen) {
      case SEQUENCE[3]:
        return (
          <>
            <DraggableItem
              item={{ screen: "SQfollowedbyEM", text: "Survey Question" }}
              index={3}
              isDragDisabled={true}
            />
            <DraggableItem
              item={{ screen: "SQfollowedbyEM", text: "Environmental Message" }}
              index={4}
              isDragDisabled={true}
            />
          </>
        )
      case SEQUENCE[4]:
        return (
          <>
            <DraggableItem
              item={{ screen: "SQ1followedbySQ2", text: "Survey Question 1" }}
              index={3}
              isDragDisabled={true}
            />
            <DraggableItem
              item={{ screen: "SQ1followedbySQ2", text: "Survey Question 2" }}
              index={4}
              isDragDisabled={true}
            />
          </>
        )
      case SEQUENCE[5]:
        return (
          <DraggableItem item={{ screen: "OnlySQ1", text: "Survey Question 1" }} index={3} isDragDisabled={true} />
        )
      default:
        return null
    }
  }

  return (
    <ApiLoader isLoading={loading}>
      <Stack spacing={3}>
        <Stack direction={"row"} justifyContent="space-between" alignItems="center">
          <Typography variant="h3">Application Setup</Typography>

          <Autocomplete
            sx={{ width: 300 }}
            options={autocompleteOptions}
            disableClearable
            filterOptions={(options) => options}
            freeSolo={false}
            value={items[3]}
            getOptionLabel={(option) => option.text}
            renderInput={(params) => <TextField {...params} placeholder="Select Screen Sequence" variant="outlined" />}
            onChange={(e, value) => {
              if (value) {
                setItems([...items.slice(0, 3), value])
                updateKiosk(params.id, {
                  screen_sequence: [...items.slice(0, 3), value].map((e) => e.screen),
                })
              }
            }}
          />
        </Stack>
      </Stack>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {items.slice(0, 3).map((item, index) => (
                <DraggableItem key={item.screen} item={item} index={index} isDragDisabled={index < 3} />
              ))}
              <ConditionalBoxes selectedScreen={items[3]?.screen} />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </ApiLoader>
  )
}

export default Sequence

