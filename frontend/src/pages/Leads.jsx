import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import Modal from "../components/Modal";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Badge from "../components/ui/Badge";
import api from "../services/api";

function Leads() {
  const [leads, setLeads] = useState([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "New",
  });

  // 🔥 Fetch Leads
  const fetchLeads = async () => {
    try {
      const res = await api.get("/leads");
      setLeads(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // 🔥 Create Lead
  const handleSubmit = async () => {
    try {
      await api.post("/leads", form);
      setOpen(false);
      setForm({ name: "", email: "", phone: "", status: "New" });
      fetchLeads();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>

      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track and manage your sales pipeline
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>
          + Add Lead
        </Button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="bg-neutral-800 text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-t border-neutral-800 hover:bg-neutral-800 transition"
                >
                  <td className="px-6 py-4 text-white">
                    {lead.name}
                  </td>
                  <td className="px-6 py-4">
                    {lead.email}
                  </td>
                  <td className="px-6 py-4">
                    {lead.phone}
                  </td>
                  <td className="px-6 py-4">
                    <Badge color="green">
                      {lead.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Add New Lead"
      >
        <div className="space-y-4">

          <Input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <Input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <Select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value })
            }
          >
            <option>New</option>
            <option>Contacted</option>
            <option>Qualified</option>
            <option>Closed</option>
          </Select>

          <Button className="w-full" onClick={handleSubmit}>
            Save Lead
          </Button>

        </div>
      </Modal>

    </DashboardLayout>
  );
}

export default Leads;