"use client"

import Image from "next/image";
import { useState, Fragment, useEffect } from "react"
import { Transition } from "@headlessui/react";
import Link from "next/link";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { FmdGoodOutlined, CalendarMonthOutlined, HourglassEmptyOutlined, PeopleAltOutlined, MonetizationOnOutlined, StarBorderOutlined, KeyboardArrowDownOutlined, KeyboardArrowUpOutlined } from '@mui/icons-material';

export default function Plan() {

  const questions = [
    {question: 'Where do you want to go?', icon: <FmdGoodOutlined />, type: 'text', options: [], placeholder: 'Enter a location'},
    {question: 'What is your start calendar?', icon: <CalendarMonthOutlined />, type: 'calendar', options: [], placeholder: 'DD/MM/YYYY'},
    {question: 'How many days will you spend for your trip?', icon: <HourglassEmptyOutlined />, type: 'dropdown', options: ['1 day', '2 days', '3 days', '4 days', '5 days', '6 days', '7 days'], placeholder: ''},
    {question: 'How many people do you go with?', icon: <PeopleAltOutlined />, type: 'dropdown', options: ['Alone', '2 people', '3 people', '4 people', '5 people'], placeholder: ''},
    {question: 'What is your budget?', icon: <MonetizationOnOutlined />, type: 'dropdown', options: ['Option 1', 'Option 2', 'Option 3'], placeholder: ''},
    {question: 'What is your theme?', icon: <StarBorderOutlined />, type: 'text', options: [], placeholder: 'e.g., “A traditional food tour”'},
  ];

  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>(() => {
    return questions.reduce((acc, question, index) => {
      if (question.type === 'dropdown') {
        acc[index] = question.options[0] || '';
      } 
      else {
        acc[index] = '';
      }
      return acc; 
    }, {} as { [key: number]: string }); 
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    console.log(answers)
  }, [answers])

  const toggleOptionsDropdown = (index: number) => {
    setOpenDropdownIndex(prevIndex => (prevIndex === index ? null : index));
  }

  const handleQuestionOption = (questionIndex: number, option: string) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionIndex]: option,
    }));
    setOpenDropdownIndex(null);
  }

  const handleDateChange = (date: Date | null, questionIndex: number) => {
    setSelectedDate(date);

    const dateString = date ? date.toLocaleDateString('en-GB') : '';

    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionIndex]: dateString,
    }));
  }

  const handleTextChange = (questionIndex: number, value: string) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionIndex]: value,
    }));
  }

  return(
    <>
      <section className="w-full min-h-screen px-4 md:px-5 xl:px-8 2xl:px-[220px] pt-[108px]">
        {/* Left section */}
        <div className="">
          {/* Title */}
          <div className="w-full lg:w-1/2">
            <h3 className="header-h3 text-dark-text">
              Start your smart trip planner
            </h3>
            <p className="paragraph-p2-medium text-sub-text pt-[18px]">
              Please answer these questions
            </p>
          </div>
          {/* Contents */}
          <div className="pt-12 flex flex-col">
            <div className="w-full lg:w-1/2">
              {questions.map((question, questionIndex) => (
                <div key={questionIndex} className="flex items-start justify-start gap-4">
                  
                  {/* Left */}
                  <div className="flex flex-col items-center">
                    {/* Icon Circle */}
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-light-text">
                      {question.icon}
                    </div>
                    {/* Connecting Line */}
                    {questionIndex < questions.length - 1 ? (
                      <div className="h-24 w-px border-l-2 border-dashed border-primary" />
                    ) : (
                      <div className="h-24 w-px" />
                    )}
                  </div>
                  
                  {/* Right */}
                  <div className="flex flex-col gap-4 h-14 w-full">
                    <p className="paragraph-p2-bold mt-4">
                      {question.question}
                    </p>

                    {/* Input / Dropdown Button*/}
                    <div className="relative w-full">

                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sub-text">{question.icon}</div>

                      {question.type === 'calendar' ? (
                        <DatePicker
                          selected={selectedDate}
                          onChange={(date) => handleDateChange(date, questionIndex)}
                          placeholderText={question.placeholder}
                          dateFormat="dd/MM/yyyy"
                          className="w-full rounded-lg border-2 border-sub-text p-3 pl-10 text-dark-text paragraph-p2-medium placeholder-[color-mix(in_srgb,var(--color-hover),black_20%)] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
                          wrapperClassName="w-full" 
                        />
                      ) : question.type === 'text' ? (
                        <input 
                          type='text'
                          placeholder={question.placeholder}
                          value={answers[questionIndex] || ''}
                          onChange={(e) => handleTextChange(questionIndex, e.target.value)}
                          className="w-full rounded-lg border-2 border-sub-text p-3 pl-10 text-dark-text paragraph-p2-medium placeholder-[color-mix(in_srgb,var(--color-hover),black_20%)] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
                        />
                      ) : (
                        <>
                          <button 
                            className="w-full rounded-lg border-2 border-sub-text p-3 pl-10 text-dark-text paragraph-p2-medium text-left placeholder-[color-mix(in_srgb,var(--color-hover),black_20%)] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary flex justify-between items-center relative transition cursor-pointer"
                            onClick={() => toggleOptionsDropdown(questionIndex)}
                          >
                            {answers[questionIndex] || (question.options.length > 0 ? question.options[0] : question.placeholder)}
                            {openDropdownIndex === questionIndex ? <KeyboardArrowUpOutlined /> : <KeyboardArrowDownOutlined />}
                          </button>
                          {/* Dropdown content*/}
                          <Transition
                            as={Fragment}
                            show={openDropdownIndex === questionIndex}
                            enter="transition ease-out duration-100"
                            enterFrom="opacity-0 -translate-y-2"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-75"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 -translate-y-2"
                          >
                            <div className="absolute z-10 right-0 mt-2 w-full origin-top-right rounded-md bg-card shadow-lg focus:outline-none">
                              <div className="py-1">
                                {question.options.map((option, optionIndex) => (
                                  <button 
                                    key={optionIndex} 
                                    onClick={() => handleQuestionOption(questionIndex, option)} 
                                    className="block w-full text-left px-4 py-2 text-dark-text hover:bg-hover transition cursor-pointer" 
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </Transition>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link 
              href={`/plan/ai-generated?location=${encodeURIComponent(answers[0] || '')}&date=${encodeURIComponent(answers[1] || '')}&duration=${encodeURIComponent(answers[2] || '')}&people=${encodeURIComponent(answers[3] || '')}&budget=${encodeURIComponent(answers[4] || '')}&theme=${encodeURIComponent(answers[5] || '')}`}
              className="inline-box paragraph-p2-medium text-light-text px-[25px] py-2.5 bg-secondary rounded-[8px] transition hover:bg-[color-mix(in_srgb,var(--color-secondary),black_10%)] max-w-max ml-[74px] mb-12"
            >
              Generate
            </Link>
          </div>
        </div>

        {/* Image */}
        <div className="hidden lg:block">
          
        </div>
      </section>
    </>
  );
}