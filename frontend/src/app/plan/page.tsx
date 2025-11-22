'use client';

import Image from 'next/image';
import { useState, Fragment, useEffect } from 'react';
import { Transition } from '@headlessui/react';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import {
  FmdGoodOutlined,
  CalendarMonthOutlined,
  HourglassEmptyOutlined,
  PeopleAltOutlined,
  MonetizationOnOutlined,
  StarBorderOutlined,
  KeyboardArrowDownOutlined,
  KeyboardArrowUpOutlined,
} from '@mui/icons-material';
import SearchLocationInput from '@/components/ui/searchLocationInput';
import { useRouter } from 'next/navigation';

const questions = [
  {
    question: 'Where do you want to go?',
    icon: <FmdGoodOutlined />,
    type: 'search',
    options: [],
    placeholder: 'Enter a location',
  },
  {
    question: 'What is your start calendar?',
    icon: <CalendarMonthOutlined />,
    type: 'calendar',
    options: [],
    placeholder: 'DD/MM/YYYY',
  },
  {
    question: 'How many days will you spend for your trip?',
    icon: <HourglassEmptyOutlined />,
    type: 'dropdown',
    options: ['1 day', '2 days', '3 days', '4 days', '5 days', '6 days', '7 days'],
    placeholder: '',
  },
  {
    question: 'How many people do you go with?',
    icon: <PeopleAltOutlined />,
    type: 'dropdown',
    options: ['Alone', '2 people', '3 people', '4 people', '5 people'],
    placeholder: '',
  },
  {
    question: 'What is your budget?',
    icon: <MonetizationOnOutlined />,
    type: 'dropdown',
    options: [
      'Economical (~ 75,000 - 90,000 KRW)',
      'Standard (~ 150,000 - 250,000 KRW)',
      'Luxury (> 400,000 KRW)',
    ],
    placeholder: '',
  },
  {
    question: 'What is your theme?',
    icon: <StarBorderOutlined />,
    type: 'dropdown',
    options: [
      'Cultural & Historical',
      'Food & Dining',
      'Shopping & Markets',
      'Nature & Parks',
      'Family Friendly',
      'Nightlife & Entertainment',
      'Art & Museums',
      'Traditional Experience',
    ],
    placeholder: '',
  },
];

const formatDateToLocalISO = (date: Date): string => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
};

export default function Plan() {
  const router = useRouter();
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const [answers, setAnswers] = useState<{ [key: number]: string }>(() => {
    const initialAnswers: { [key: number]: string } = {};

    questions.forEach((question, index) => {
      if (question.type === 'dropdown') {
        initialAnswers[index] = question.options[0] || '';
      } else if (question.type === 'calendar') {
        const today = new Date();
        initialAnswers[index] = today.toLocaleDateString('en-GB');
      } else {
        initialAnswers[index] = '';
      }
    });
    return initialAnswers;
  });

  useEffect(() => {
    console.log({ answers, selectedLocation });
  }, [answers, selectedLocation]);

  const toggleOptionsDropdown = (index: number) => {
    setOpenDropdownIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const handleQuestionOption = (questionIndex: number, option: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: option,
    }));
    setOpenDropdownIndex(null);
  };

  const handleDateChange = (date: Date | null, questionIndex: number) => {
    setSelectedDate(date);

    const dateString = date ? date.toISOString().split('T')[0] : '';

    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: dateString,
    }));
  };

  const handleTextChange = (questionIndex: number, value: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: value,
    }));
  };

  const handleLocationSelect = (location: { name: string; lat: number; lng: number }) => {
    console.log('📍 Location selected:', location);
    setSelectedLocation(location);
    setLocationError(false);
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      0: location.name,
    }));
  };

  const handleGenerateClick = () => {
    if (!selectedLocation) {
      setLocationError(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Get number of days (in number)
    const durationString = answers[2] || '';
    const durationMatch = durationString.match(/\d+/);
    const numberOfDays = durationMatch ? durationMatch[0] : '1';

    const queryParams = new URLSearchParams({
      location: answers[0] || '',
      lat: selectedLocation.lat.toString(),
      lng: selectedLocation.lng.toString(),
      date: answers[1] || '',
      duration: numberOfDays,
      people: answers[3] || '',
      budget: answers[4] || '',
      theme: answers[5] || '',
    });

    console.log('🔗 Generating with:', Object.fromEntries(queryParams.entries()));

    router.push(`plan/ai-generated?${queryParams.toString()}`);
  };

  return (
    <>
      <section className="min-h-screen w-full px-4 pt-[108px] md:px-5 xl:px-8 2xl:px-[220px]">
        {/* Left section */}
        <div className="">
          {/* Title */}
          <div className="w-full lg:w-1/2">
            <h3 className="header-h3 text-dark-text">Start your smart trip planner</h3>
            <p className="paragraph-p2-medium text-sub-text pt-[18px]">
              Please answer these questions
            </p>
          </div>
          {/* Contents */}
          <div className="flex flex-col pt-12">
            <div className="w-full lg:w-1/2">
              {questions.map((question, questionIndex) => (
                <div key={questionIndex} className="flex items-start justify-start gap-4">
                  {/* Left */}
                  <div className="flex flex-col items-center">
                    {/* Icon Circle */}
                    <div className="bg-primary text-light-text flex h-14 w-14 items-center justify-center rounded-full">
                      {question.icon}
                    </div>
                    {/* Connecting Line */}
                    {questionIndex < questions.length - 1 ? (
                      <div className="border-primary h-24 w-px border-l-2 border-dashed" />
                    ) : (
                      <div className="h-24 w-px" />
                    )}
                  </div>

                  {/* Right */}
                  <div className="flex h-14 w-full flex-col gap-4">
                    <p className="paragraph-p2-bold mt-4">{question.question}</p>

                    {/* Input / Dropdown Button*/}
                    <div className="relative w-full">
                      <div className="text-sub-text pointer-events-none absolute top-0 left-0 flex h-12 items-center pl-3">
                        {question.icon}
                      </div>

                      {question.type === 'calendar' ? (
                        <DatePicker
                          selected={selectedDate}
                          onChange={(date) => handleDateChange(date, questionIndex)}
                          placeholderText={question.placeholder}
                          dateFormat="dd/MM/yyyy"
                          className="border-sub-text text-dark-text paragraph-p2-medium focus:border-primary focus:ring-primary w-full rounded-lg border-2 p-3 pl-10 placeholder-[color-mix(in_srgb,var(--color-hover),black_20%)] transition focus:ring-1 focus:outline-none"
                          wrapperClassName="w-full"
                        />
                      ) : question.type === 'text' ? (
                        <input
                          type="text"
                          placeholder={question.placeholder}
                          value={answers[questionIndex] || ''}
                          onChange={(e) => handleTextChange(questionIndex, e.target.value)}
                          className="border-sub-text text-dark-text paragraph-p2-medium focus:border-primary focus:ring-primary w-full rounded-lg border-2 p-3 pl-10 placeholder-[color-mix(in_srgb,var(--color-hover),black_20%)] transition focus:ring-1 focus:outline-none"
                        />
                      ) : question.type === 'search' ? (
                        <>
                          <SearchLocationInput
                            onSelect={handleLocationSelect}
                            error={locationError}
                          />
                          {locationError && (
                            <p className="mt-2 ml-1 text-xs text-red-500">
                              * Please select a destination to continue.
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            className="border-sub-text text-dark-text paragraph-p2-medium focus:border-primary focus:ring-primary relative flex w-full cursor-pointer items-center justify-between rounded-lg border-2 p-3 pl-10 text-left placeholder-[color-mix(in_srgb,var(--color-hover),black_20%)] transition focus:ring-1 focus:outline-none"
                            onClick={() => toggleOptionsDropdown(questionIndex)}
                          >
                            {answers[questionIndex] ||
                              (question.options.length > 0
                                ? question.options[0]
                                : question.placeholder)}
                            {openDropdownIndex === questionIndex ? (
                              <KeyboardArrowUpOutlined />
                            ) : (
                              <KeyboardArrowDownOutlined />
                            )}
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
                            <div className="bg-card absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md shadow-lg focus:outline-none">
                              <div className="py-1">
                                {question.options.map((option, optionIndex) => (
                                  <button
                                    key={optionIndex}
                                    onClick={() => handleQuestionOption(questionIndex, option)}
                                    className="text-dark-text hover:bg-hover block w-full cursor-pointer px-4 py-2 text-left transition"
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
            <button
              onClick={handleGenerateClick}
              className="inline-box paragraph-p2-medium text-light-text bg-secondary mb-12 ml-[74px] max-w-max cursor-pointer rounded-[8px] px-[25px] py-2.5 transition hover:bg-[color-mix(in_srgb,var(--color-secondary),black_10%)]"
            >
              Generate
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="hidden lg:block"></div>
      </section>
    </>
  );
}
