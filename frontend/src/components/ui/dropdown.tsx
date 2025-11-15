"use client";

import { Fragment } from "react";
import { Transition } from "@headlessui/react";

interface DropdownProps {
  isOpen: boolean;
  trigger: React.ReactNode;  // Nút bấm để kích hoạt
  children: React.ReactNode; // Nội dung của dropdown
  widthClass?: string;       // Class để tùy chỉnh độ rộng (ví dụ: "w-48")
}

export default function Dropdown({ 
  isOpen, 
  trigger, 
  children, 
  widthClass = "w-48" // Giá trị mặc định
}: DropdownProps) {

  return (
    <div className="relative">
      {trigger}
      <Transition
        as={Fragment}
        show={isOpen}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-2"
      >
        <div className={`absolute right-0 mt-2 ${widthClass} origin-top-right rounded-md bg-card shadow-lg focus:outline-none`}>
          <div className="py-1">
            {children}
          </div>
        </div>
      </Transition>
    </div>
  );
}