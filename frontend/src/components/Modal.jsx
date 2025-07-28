import React from "react";
import { Dialog, Transition } from "@headlessui/react";

const Modal = ({ title, isOpen, onClose, onSubmit, form, onChange, buttonText }) => (
  <Transition show={isOpen} as={React.Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
      <Transition.Child
        as={React.Fragment}
        enter="ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        {/* Use a transparent background with a blur effect for exposure */}
        <div
          className="fixed inset-0 bg-[#0000005a] "
         
        />
      </Transition.Child>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel className="mx-auto w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold mb-4">
              {title}
            </Dialog.Title>
            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
              <div>
                <label className="block text-sm mb-1">Subject Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="w-full border rounded px-2 py-2"
                  placeholder="Enter subject name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Subject Code</label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={onChange}
                  className="w-full border rounded px-2 py-2"
                  placeholder="e.g., CS101"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Assigned Teacher</label>
                <select
                  name="teacher"
                  value={form.teacher}
                  onChange={onChange}
                  className="w-full border rounded px-2 py-2"
                  required
                >
                  <option value="">Select teacher</option>
                  <option>Dr. Sarah Wilson</option>
                  <option>Prof. James Miller</option>
                  <option>Dr. Robert Brown</option>
                  <option>Prof. Emily Davis</option>
                  <option>Dr. Michael Lee</option>
                  <option>Prof. Lisa Anderson</option>
                  <option>Dr. David Clark</option>
                  <option>Prof. Rachel Green</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Class Level</label>
                <select
                  name="level"
                  value={form.level}
                  onChange={onChange}
                  className="w-full border rounded px-2 py-2"
                  required
                >
                  <option value="">Select level</option>
                  <option>First Year</option>
                  <option>Second Year</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-[#9886fe] text-white rounded py-2 mt-2 font-semibold hover:bg-purple-500 transition"
              >
                {buttonText}
              </button>
            </form>
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition>
);

export default Modal;
