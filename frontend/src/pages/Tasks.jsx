import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import Modal from "../components/Modal";
import {Button} from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import api from "../services/api";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    due_date: "",
    status: "todo",
    priority: "Low",
  });

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async () => {
    try {
      await api.post("/tasks", form);
      setOpen(false);
      setForm({
        title: "",
        due_date: "",
        status: "todo",
        priority: "Low",
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const grouped = {
    todo: tasks.filter((t) => t.status === "todo"),
    inprogress: tasks.filter((t) => t.status === "inprogress"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    updateTaskStatus(draggableId, destination.droppableId);
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-semibold">Task Board</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage workflow visually
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>+ Add Task</Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">

          {["todo", "inprogress", "completed"].map((col) => (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col min-h-[60vh]"
                >
                  <h2 className="text-xs text-gray-400 uppercase mb-4 tracking-wider">
                    {col === "todo"
                      ? "To Do"
                      : col === "inprogress"
                      ? "In Progress"
                      : "Completed"}
                  </h2>

                  <div className="space-y-4 flex-1">
                    {grouped[col].map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={String(task.id)}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 hover:border-neutral-600 transition"
                          >
                            <TaskCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}

        </div>
      </DragDropContext>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add Task">
        <div className="space-y-4">
          <Input
            placeholder="Task Title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <Input
            type="date"
            value={form.due_date}
            onChange={(e) =>
              setForm({ ...form, due_date: e.target.value })
            }
          />

          <select
            className="w-full bg-neutral-800 p-2 rounded-lg"
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value })
            }
          >
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            className="w-full bg-neutral-800 p-2 rounded-lg"
            value={form.priority}
            onChange={(e) =>
              setForm({ ...form, priority: e.target.value })
            }
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <Button className="w-full" onClick={handleSubmit}>
            Save Task
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

function TaskCard({ task }) {
  const colors = {
    High: "red",
    Medium: "yellow",
    Low: "green",
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">{task.title}</h3>
        <Badge color={colors[task.priority]}>
          {task.priority}
        </Badge>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        {task.due_date
          ? new Date(task.due_date).toLocaleDateString()
          : "No due date"}
      </p>
    </>
  );
}

export default Tasks;