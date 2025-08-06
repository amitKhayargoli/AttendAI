import React, { useState } from "react";
import { DataTable } from "./components/data-table";
import Modal from "./components/Modal";
import Sidebar from "./components/StudentSidebar";
import { ChevronDown } from "lucide-react";
import { Avatar, AvatarImage } from "./components/ui/avatar";

const columns = [
  { accessorKey: "name", header: "Subject Name" },
  { accessorKey: "code", header: "Code" },
  { accessorKey: "teacher", header: "Assigned Teacher" },
  { accessorKey: "level", header: "Level" },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => row.original.actions,
  },
];

const initialData = [
  {
    id: 1,
    name: "Computer Science",
    code: "CS101",
    teacher: "Dr. Sarah Wilson",
    level: "First Year",
    actions: (
      <span>
        <button className="mr-2">✏️</button>
        <button>🗑️</button>
      </span>
    ),
  },
  {
    id: 2,
    name: "Mathematics",
    code: "MATH201",
    teacher: "Prof. James Miller",
    level: "Second Year",
    actions: (
      <span>
        <button className="mr-2">✏️</button>
        <button>🗑️</button>
      </span>
    ),
  },
  {
    id: 3,
    name: "Physics",
    code: "PHY101",
    teacher: "Dr. Robert Brown",
    level: "First Year",
    actions: (
      <span>
        <button className="mr-2">✏️</button>
        <button>🗑️</button>
      </span>
    ),
  },
  {
    id: 4,
    name: "Chemistry",
    code: "CHEM201",
    teacher: "Prof. Emily Davis",
    level: "Second Year",
  },
  {
    id: 5,
    name: "Biology",
    code: "BIO101",
    teacher: "Dr. Michael Lee",
    level: "First Year",
  },
  {
    id: 6,
    name: "English Literature",
    code: "ENG201",
    teacher: "Prof. Lisa Anderson",
    level: "Second Year",
  },
  {
    id: 7,
    name: "History",
    code: "HIST101",
    teacher: "Dr. David Clark",
    level: "First Year",
  },
  {
    id: 8,
    name: "Economics",
    code: "ECO201",
    teacher: "Prof. Rachel Green",
    level: "Second Year",
  },
];

const Dashboard = () => {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    teacher: "",
    level: "",
  });

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setForm({ name: "", code: "", teacher: "", level: "" });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    setData([
      ...data,
      {
        id: data.length + 1,
        ...form,
        actions: (
          <span>
            <button className="mr-2">✏️</button>
            <button>🗑️</button>
          </span>
        ),
      },
    ]);
    handleCloseModal();
  };

  return (
    <div className="flex min-h-screen bg-[#F4F4F4]">
      <Sidebar />
      <div className="flex flex-col flex-2">
        <nav className="flex py-5 w-full justify-between items-center px-5 bg-white">
          <div>
            <h1 className="text-xl font-medium text-black">Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <img src="image.png" width={30} height={30} alt="" />
          </div>
        </nav>

        <div className="flex px-4 md:px-8 mb-6">
          <span className="flex gap-2 items-center flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-black">
              Welcome Back, Amit
            </h1>
            <img
              src="wave.png"
              width={32}
              height={32}
              alt=""
              className="mb-2 md:mb-3"
            />
          </span>
        </div>

        <div className="flex flex-col px-2 md:px-8">
          <div className="bg-white rounded-lg shadow p-2 md:p-6 overflow-x-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-2">
              <div className="flex gap-2 flex-wrap">
                <button className="border px-3 py-1 rounded">Filter</button>
                <select className="border px-3 py-1 rounded">
                  <option>All Teachers</option>
                </select>
                <select className="border px-3 py-1 rounded">
                  <option>All Levels</option>
                </select>
              </div>
              <button
                className="text-[#9886fe] font-semibold mt-2 md:mt-0"
                onClick={handleOpenModal}
              >
                + Add New
              </button>
            </div>
            <DataTable columns={columns} data={data} />
          </div>
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          form={form}
          title="Add New Subject"
          onChange={handleChange}
          onSubmit={handleAddSubject}
          buttonText="Add Subject"
        />
      </div>
    </div>
  );
};

export default Dashboard;
