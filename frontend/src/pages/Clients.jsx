import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import Modal from "../components/Modal";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import api from "../services/api";

function Clients() {
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    total_value: "",
  });

  // 🔥 Fetch Clients
  const fetchClients = async () => {
    try {
      const res = await api.get("/clients");
  
      console.log("CLIENT RESPONSE:", res.data);
  
      // 🔥 SAFE EXTRACTION
      const data =
        Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];
  
      setClients(data);
    } catch (err) {
      console.error(err);
      setClients([]);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // 🔥 Create Client
  const handleSubmit = async () => {
    try {
      await api.post("/clients", form);
      setOpen(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        total_value: "",
      });
      fetchClients();
      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>

      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage client relationships
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>
          + Add Client
        </Button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="bg-neutral-800 text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Total Value</th>
              </tr>
            </thead>

            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-t border-neutral-800 hover:bg-neutral-800 transition"
                >
                  <td className="px-6 py-4 text-white">
                    {client.name}
                  </td>
                  <td className="px-6 py-4">
                    {client.email}
                  </td>
                  <td className="px-6 py-4">
                    {client.phone}
                  </td>
                  <td className="px-6 py-4 text-green-400 font-medium">
                    ₹{client.total_value}
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
        title="Add New Client"
      >
        <div className="space-y-4">

          <Input
            placeholder="Company Name"
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

          <Input
            placeholder="Total Project Value"
            value={form.total_value}
            onChange={(e) =>
              setForm({ ...form, total_value: e.target.value })
            }
          />

          <Button className="w-full" onClick={handleSubmit}>
            Save Client
          </Button>

        </div>
      </Modal>

    </DashboardLayout>
  );
}

export default Clients;