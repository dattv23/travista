"use client";

import Image from 'next/image'
import Link from 'next/link';

import HeroBackground from '@/assets/images/hero-image.png';
import Divider from '@/assets/images/divider.png';
import Plane from '@/assets/images/paper-plane.png';
import ExampleImage from '@/assets/images/example-image.jpg';

import { DoneOutlined, InfoOutlined, CheckCircleOutline } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

const howToWorkTexts = [
  {title: "Tell us your theme", description: 'Want a "Historical Food Tour"? Just give our AI a theme. Our AI understands context and builds a logical plan.'},
  {title: "Get your AI Plan", description: 'Instantly receive a full-day, multi-stop itinerary. We find the locations, calculate optimized routes (walking, bus, ect.), and show it all on one map.'},
  {title: "Refine & Personalize", description: "Want to add a cool café? Type in its name, or upload a photo – our AI will find it and add it to your route instantly. You're in control"},
];

const exploreTexts = [
  {text: "View destinations with NAVER's 3D aerial map."},
  {text: "Get AI-powered summaries of history and travel tips."},
  {text: "See real-time public transit info for your route."},
]

export default function Home() {

  const { userLoggedIn } = useAuth();

  return (
    <div className='w-full min-h-screen'>
      {/* Hero section */}
      <section id="hero" className='relative w-full h-[786px]'>
        <Image
          src={HeroBackground}
          alt="Hero image"
          layout="fill"
          objectFit="cover"
          className="-z-10 hidden lg:block"
          priority
        />
        <div className='w-full px-4 md:px-5 xl:px-8 2xl:px-[220px] pt-[210px] flex flex-col justify-center items-center lg:justify-start lg:items-start'>
          <h1 className='header-h1 text-dark-text text-center lg:text-left'>
            Your Smart <span className='text-primary block md:inline'>Itinerary Planner</span>
          </h1>
          <p className='paragraph-p1-semibold pt-10 text-sub-text w-2/3 text-center lg:text-left'>
            Tell our AI what you want to do, and we'll generate a full-day, optimized travel plan just for you.
          </p>
          <div className='mt-10 flex flex-col sm:flex-row sm:items-center sm:gap-6'>
            <Link 
              href={`${userLoggedIn ? '/plan' : '/auth/login'}`} 
              className='inline-block text-center header-h5 px-[46px] py-5 bg-secondary text-light-text rounded-[8px] hover:bg-[color-mix(in_srgb,var(--color-secondary),black_10%)] transition'
            >
              Generate
            </Link>
            <Link 
              href={`#how-it-works`} 
              className='inline-flex items-center justify-center gap-2 paragraph-p1-semibold text-primary rounded-[8px] transition mt-4 sm:mt-0 hover:text-[color-mix(in_srgb,var(--color-primary),black_20%)]'
            >
              <InfoOutlined />
              Learn How it Works
            </Link>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row sm:gap-8 gap-4">
            <div className="flex items-center gap-2 text-sub-text paragraph-p2-medium">
              <CheckCircleOutline className="text-primary" />
              <span>Optimized Routes</span>
            </div>
            <div className="flex items-center gap-2 text-sub-text paragraph-p2-medium">
              <CheckCircleOutline className="text-primary" />
              <span>Personalized Suggestions</span>
            </div>
            <div className="flex items-center gap-2 text-sub-text paragraph-p2-medium">
              <CheckCircleOutline className="text-primary" />
              <span>Time-Saving AI</span>
            </div>
          </div>
        </div>
      </section>

      <div className='w-full flex justify-center mt-[200px] md:mt-[90px]'>
        <Image
          src={Divider}
          alt='Divider'
          objectFit='cover'
          className=''
        />
      </div>

      {/* How to work section*/}
      <section id="how-it-works" className='w-full px-4 md:px-5 xl:px-8 2xl:px-[220px] pt-[108px] flex flex-col justify-center items-center gap-4'>
        <p className='header-h5 text-primary text-center'>How it works</p>
        <h2 className='header-h2 text-dark-text text-center'>Your Smartest Trip, Planned in 3 Steps</h2>
        <p className='paragraph-p1-semibold text-sub-text text-center'>Stop juggling 5 different apps. Travista unifies your entire trip.</p>

        <div className='w-full flex flex-col gap-12 lg:flex-row lg:gap-0 justify-around my-[102px]'>
          {howToWorkTexts.map((text, index) => (
            <div key={index} className='w-full px-12 lg:w-[368px] flex flex-col justify-start items-center'>
              <div className='w-[86px] h-[86px] rounded-full bg-primary text-light-text header-h4 flex justify-center items-center'>
                {index + 1}
              </div>
              <p className='header-h5 text-dark-text mt-[33px]'>
                {text.title}
              </p>
              <p className='paragraph-p1-regular text-sub-text text-center mt-[13px]'>
                {text.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className='w-full flex justify-center mt-12'>
        <Image
          src={Divider}
          alt='Divider'
          objectFit='cover'
          className=''
        />
      </div>
      
      {/* Explore section */}
      <section id="explore"className='w-full px-4 md:px-5 xl:px-8 2xl:px-[220px] pt-[108px] pb-12 flex justify-around items-center'>
        <div className='w-full lg:w-1/2 flex flex-col gap-4 pl-0 md:pl-5 xl:pl-8 2xl:pl-[220px]'>
          <p className='header-h5 text-secondary'>Explore like never before</p>
          <h2 className='header-h2 text-dark-text'>Explore with Street View. <br/> Understand with AI</h2>
          <p className='paragraph-p1-semibold text-sub-text pr-2'>Our split-screen interface connects NAVER's Map and Street View with our AI's insights. <br/> Don't just see where you're going - understand why it's amazing.</p>
          <div className='mt-4'>
            {exploreTexts.map((text, index) => (
              <div key={index} className='mt-4 flex gap-2'>
                <div className='w-[30px] h-[30px] rounded-full bg-secondary text-light-text header-h4 flex justify-center items-center'>
                  <DoneOutlined />
                </div>
                <p className='paragraph-p1-regular text-dark-text'>{text.text}</p>
              </div>
            ))}
          </div>
          <div className='w-full flex justify-end'>
            <Image 
              src={Plane}
              alt={'Plane'}
              className='w-[452px] h-auto'
            />
          </div>
        </div>
        <div className='w-1/2 flex justify-end px-0 md:px-5 xl:px-8 2xl:px-[220px] hidden lg:block'>
          <Image 
            src={ExampleImage}
            alt='example image'
            className='rounded-2xl '
          />
        </div>
      </section>

      <section id="sub-content" className='w-full bg-[color-mix(in_srgb,var(--color-primary),black_30%)] px-4 md:px-5 xl:px-8 2xl:px-[220px] py-[114px] mt-[102px] flex flex-col justify-center items-center text-center'>
        <h2 className='header-h2 text-light-text'>Start creating your itinerary now</h2>
        <p className='paragraph-p1-semibold text-light-text mt-8 mb-[70px]'>Your next adventure in Korea is just one click away.</p>
        <Link 
          href={`${userLoggedIn ? '/plan' : '/auth/login'}`}
          className='bg-secondary text-light-text paragraph-p1-semibold px-6 py-4 rounded-[8px] hover:bg-[color-mix(in_srgb,var(--color-secondary),black_10%)] transition'
        >
          Generate your first plan
        </Link>
      </section>
    </div>
  )
}
