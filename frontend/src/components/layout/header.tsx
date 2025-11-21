"use client";

import { useState, Fragment, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from 'next/navigation';

import { LanguageOutlined, KeyboardArrowDownOutlined, KeyboardArrowUpOutlined, AccountCircleOutlined } from '@mui/icons-material';
import logo from "@/assets/logo.svg";
import { useAuth } from "@/contexts/AuthContext";
import Dropdown from "../ui/dropdown";

const navLinks = [
  { title: "Home", path: "/" },
  { title: "Plan", path: "/plan" },
];

const languages = [{ title: "English", code: "EN" }];

export default function Header() {

  const { userLoggedIn, isLoading, logout, user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  const [language, setLanguage] = useState(languages[0].code);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAuthenticated = isMounted && userLoggedIn;

  const getDisplayName = () => {
    const fullName = user?.name || "User";
    const parts = fullName.trim().split(" ");
    return parts[parts.length - 1]; 
  }

  const handleToggleDropdown = (dropdownName: string) => {
    setOpenDropdown(prev => (prev === dropdownName ? null : dropdownName));
  }

  const handleLanguageOption = (code: string) => {
    setLanguage(code);
    setOpenDropdown(null); 
  }

  const handleLogout = () => {
    logout();
    console.log("User logging out");
    setOpenDropdown(null); 
    router.push('/')
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
          {navLinks.map((nav, index) => {
            const isActive = pathname === nav.path;
            const isProtected = nav.path === '/plan';
            const path = (isProtected && !isAuthenticated) ? '/auth/login' : nav.path;
            return(
              <Link key={index} href={path} className={`relative group ${isActive && 'text-primary'}`}>
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
          <Dropdown
            isOpen={openDropdown === 'language'}
            widthClass="w-full" 
            trigger={
              <button 
                onClick={() => handleToggleDropdown('language')} 
                className={`
                  px-[15px] py-2.5 bg-transparent flex justify-center items-center gap-4 border-2 rounded-[8px] relative cursor-pointer transition text-[color-mix(in_srgb,var(--color-sub-text),black_10%)]
                `}
              >
                <div className="flex gap-1.5">
                  <LanguageOutlined />
                  {language}
                </div>
                {openDropdown === 'language' ? <KeyboardArrowUpOutlined /> : <KeyboardArrowDownOutlined />}
              </button>
            }
          >
            {languages.map((language, index) => (
              <button 
                key={index} 
                onClick={() => handleLanguageOption(language.code)} 
                className="block w-full text-left px-4 py-2 text-dark-text hover:bg-hover transition cursor-pointer" 
              >
                {language.title}
              </button>
            ))}
          </Dropdown>
          
          {isAuthenticated ? (
            <Dropdown
              isOpen={openDropdown === 'user'}
              widthClass="w-full" 
              trigger={
                <button 
                  onClick={() => handleToggleDropdown('user')}
                  className="w-40 px-[15px] py-2.5 bg-transparent flex justify-between items-center gap-4 border-2 rounded-[8px] relative cursor-pointer transition text-[color-mix(in_srgb,var(--color-sub-text),black_10%)]"
                >
                  <div className="flex items-center gap-2">
                    <AccountCircleOutlined />
                    {getDisplayName()}
                  </div>
                  {openDropdown === 'user' ? <KeyboardArrowUpOutlined /> : <KeyboardArrowDownOutlined />}
                </button>
              }
            >
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-dark-text hover:bg-hover transition cursor-pointer" 
              >
                Log Out
              </button>
            </Dropdown>
          ) : (
            <>
              <Link href={'/auth/login'} className={`
                  px-[25px] py-2.5 flex justify-center items-center border-2 rounded-[8px] transition-all bg-primary text-light-text border-transparent hover:bg-[color-mix(in_srgb,var(--color-primary),black_10%)]
                `}>Log in</Link>
    
              <Link href={'/auth/signup'} className={`
                  px-[25px] py-2.5 bg-transparent flex justify-center items-center border-2 rounded-[8px] transition-all
                  text-primary border-primary hover:bg-hover
                `}>Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}