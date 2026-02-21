import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import Modal from "../components/Modal";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import api from "../services/api";

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

  const grouped = {
    pending: tasks.filter((t) => t.status === "pending"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  return (
    <DashboardLayout>

      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your workflow
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>+ Add Task</Button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">

        <Column title="To Do">
          {grouped.todo.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </Column>

        <Column title="In Progress">
          {grouped.inprogress.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </Column>

        <Column title="Completed">
          {grouped.completed.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </Column>

      </div>

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

function Column({ title, children }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col max-h-[70vh]">
      <h2 className="text-sm text-gray-400 mb-4 uppercase">{title}</h2>
      <div className="space-y-4 overflow-y-auto">{children}</div>
    </div>
  );
}

function TaskCard({ task }) {
  const colors = {
    High: "red",
    Medium: "yellow",
    Low: "green",
  };

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
      <div className="flex justify-between">
        <h3 className="text-sm">{task.title}</h3>
        <Badge color={colors[task.priority]}>
          {task.priority}
        </Badge>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {task.due_date || "No due date"}
      </p>
    </div>
  );
}

export default Tasks;