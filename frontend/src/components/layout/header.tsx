"use client";

import { useState, Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import { Transition } from "@headlessui/react"; 

import { LanguageOutlined, KeyboardArrowDownOutlined, KeyboardArrowUpOutlined } from '@mui/icons-material';
import logo from "@/assets/logo.svg";

export default function Header() {

  const navLinks = [
    { id: 1, title: "Home", path: "/" },
    { id: 2, title: "Plan", path: "/plan" },
  ];

  const languages = [{ id: 1, title: "English", code: "EN" }, {id: 2, title: "Tiếng Việt", code: "VI"}];

  const [language, setLanguage] = useState(languages[0].code);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const pathname = usePathname();

  const toggleLanguageDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  }

  const handleLanguageOption = (code: string) => {
    setLanguage(code);
    setDropdownOpen(false); 
  }

  return (
    <header className={`fixed top-0 left-0 z-50 w-full h-[92px] px-4 md:px-5 xl:px-8 2xl:px-[220px] transition-all duration-300 ease-in-out bg-background text-dark-text shadow-2xs`}>
      <div className="flex justify-between items-center h-full">
        <div className="">
          <Link href="/" className="flex justify-center items-center gap-1.5 header-h4 text-primary">
            <Image src={logo} alt="logo" width={35} height={35} color="light-text"/>
            Travista
          </Link>
        </div>
        <div className="flex paragraph-p2-medium gap-[50px]">
          {navLinks.map(nav => {
            const isActive = pathname === nav.path;
            return(
              <Link key={nav.id} href={nav.path} className={`relative group ${isActive && 'text-primary'}`}>
                {nav.title}
                <span className={`
                    absolute left-0 -bottom-1 h-[3px] rounded-2xl w-full 
                    bg-primary origin-left transform transition-all duration-300 ease-out 
                    ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'} 
                  `} />
              </Link>
          )})}
        </div>
        <div className="flex paragraph-p2-medium gap-4">
          <div className="relative">
            <button 
              onClick={toggleLanguageDropdown} 
              className={`
                px-[15px] py-2.5 bg-transparent flex justify-center items-center gap-4 border-2 rounded-[8px] relative cursor-pointer transition text-[color-mix(in_srgb,var(--color-sub-text),black_10%)]
              `}
            >
              <div className="flex gap-1.5">
                <LanguageOutlined />
                {language}
              </div>
              {dropdownOpen ? <KeyboardArrowUpOutlined /> : <KeyboardArrowDownOutlined />}
            </button>
            
            <Transition
              as={Fragment}
              show={dropdownOpen}
              enter="transition ease-out duration-100"
              enterFrom="opacity-0 -translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-75"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 -translate-y-2"
            >
              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-card shadow-lg focus:outline-none">
                <div className="py-1">
                  {languages.map(language => (
                    <button 
                      key={language.id} 
                      onClick={() => handleLanguageOption(language.code)} 
                      className="block w-full text-left px-4 py-2 text-dark-text hover:bg-hover transition cursor-pointer" 
                    >
                      {language.title}
                    </button>
                  ))}
                </div>
              </div>
            </Transition>
          </div>

          <Link href={'/auth/login'} className={`
              px-[25px] py-2.5 flex justify-center items-center border-2 rounded-[8px] transition-all bg-primary text-light-text border-transparent hover:bg-[color-mix(in_srgb,var(--color-primary),black_10%)]
            `}>Log in</Link>

          <Link href={'/auth/signup'} className={`
              px-[25px] py-2.5 bg-transparent flex justify-center items-center border-2 rounded-[8px] transition-all
              text-primary border-primary hover:bg-hover
            `}>Sign up</Link>
        </div>
      </div>
    </header>
  );
}