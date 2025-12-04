"use client";

import Image from 'next/image'
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

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
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const exploreRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsVisible(true);
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeInUp');
          entry.target.classList.remove('opacity-0');
        } else {
          // Re-trigger animation when element leaves and re-enters viewport
          entry.target.classList.remove('animate-fadeInUp');
          entry.target.classList.add('opacity-0');
        }
      });
    }, observerOptions);

    // Observe sections after a small delay to ensure refs are set
    setTimeout(() => {
      const elements = [howItWorksRef.current, exploreRef.current].filter(Boolean) as HTMLElement[];
      elements.forEach(el => observer.observe(el));
    }, 100);

    // Add parallax effect on scroll
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const hero = heroRef.current;
      if (hero) {
        const heroContent = hero.querySelector('div');
        if (heroContent) {
          heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
          heroContent.style.opacity = `${1 - scrolled / 500}`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Mouse movement parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      const elements = [howItWorksRef.current, exploreRef.current].filter(Boolean) as HTMLElement[];
      elements.forEach(el => observer.unobserve(el));
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className='w-full min-h-screen'>
      {/* Hero section */}
      <section 
        id="hero" 
        ref={heroRef}
        className='relative w-full h-[786px] overflow-hidden'
      >
        <Image
          src={HeroBackground}
          alt="Hero image"
          layout="fill"
          objectFit="cover"
          className="-z-10 hidden lg:block animate-floatSlow"
          priority
        />
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 animate-pulseGlow -z-10 hidden lg:block"></div>
        <div className={`w-full px-4 md:px-5 xl:px-8 2xl:px-[220px] pt-[210px] flex flex-col justify-center items-center lg:justify-start lg:items-start transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className='header-h1 text-dark-text text-center lg:text-left animate-fadeInUp'>
            Your Smart <span className='text-primary block md:inline animate-fadeInUp animate-pulseGlow' style={{ animationDelay: '0.2s' }}>Itinerary Planner</span>
          </h1>
          <p className='paragraph-p1-semibold pt-10 text-sub-text w-2/3 text-center lg:text-left animate-fadeInUp' style={{ animationDelay: '0.4s' }}>
            Tell our AI what you want to do, and we'll generate a full-day, optimized travel plan just for you.
          </p>
          <div className='mt-10 flex flex-col sm:flex-row sm:items-center sm:gap-6 animate-fadeInUp' style={{ animationDelay: '0.6s' }}>
            <Link 
              href={`${userLoggedIn ? '/plan' : '/auth/login'}`} 
              className='inline-block text-center header-h5 px-[46px] py-5 bg-secondary text-light-text rounded-[12px] hover:bg-[color-mix(in_srgb,var(--color-secondary),black_10%)] transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95 font-semibold animate-float relative overflow-hidden group'
            >
              <span className="relative z-10">Generate</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
            </Link>
            <Link 
              href={`#how-it-works`}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('how-it-works');
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className='inline-flex items-center justify-center gap-2 paragraph-p1-semibold text-primary rounded-[12px] transition-all duration-300 mt-4 sm:mt-0 hover:text-[color-mix(in_srgb,var(--color-primary),black_20%)] hover:scale-105 active:scale-95 group'
            >
              <InfoOutlined className="transition-transform duration-300 group-hover:rotate-12" />
              Learn How it Works
            </Link>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row sm:gap-8 gap-4 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
            {[
              { text: 'Optimized Routes', delay: '0s' },
              { text: 'Personalized Suggestions', delay: '0.1s' },
              { text: 'Time-Saving AI', delay: '0.2s' }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-2 text-sub-text paragraph-p2-medium transition-all duration-300 hover:text-primary hover:scale-105"
                style={{ animationDelay: item.delay }}
              >
                <CheckCircleOutline className="text-primary transition-transform duration-300 hover:scale-110 animate-pulseGlow" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className='w-full flex justify-center mt-[200px] md:mt-[90px] opacity-0 animate-fadeIn' style={{ animationDelay: '1s' }}>
        <Image
          src={Divider}
          alt='Divider'
          objectFit='cover'
          className='transition-transform duration-500 hover:scale-110 animate-float'
        />
      </div>

      {/* How to work section*/}
      <section 
        id="how-it-works" 
        ref={howItWorksRef}
        className='w-full px-4 md:px-5 xl:px-8 2xl:px-[220px] pt-[108px] flex flex-col justify-center items-center gap-4 opacity-0'
      >
        <p className='header-h5 text-primary text-center transition-all duration-500 hover:scale-110'>How it works</p>
        <h2 className='header-h2 text-dark-text text-center'>Your Smartest Trip, Planned in 3 Steps</h2>
        <p className='paragraph-p1-semibold text-sub-text text-center'>Stop juggling 5 different apps. Travista unifies your entire trip.</p>

        <div className='w-full flex flex-col gap-12 lg:flex-row lg:gap-0 justify-around my-[102px]'>
          {howToWorkTexts.map((text, index) => (
            <div 
              key={index} 
              className='w-full px-12 lg:w-[368px] flex flex-col justify-start items-center transition-all duration-500 hover:scale-105 group'
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className='w-[86px] h-[86px] rounded-full bg-primary text-light-text header-h4 flex justify-center items-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/50 animate-float' style={{ animationDelay: `${index * 0.5}s` }}>
                {index + 1}
              </div>
              <p className='header-h5 text-dark-text mt-[33px] transition-colors duration-300 group-hover:text-primary'>
                {text.title}
              </p>
              <p className='paragraph-p1-regular text-sub-text text-center mt-[13px] transition-colors duration-300 group-hover:text-dark-text'>
                {text.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className='w-full flex justify-center mt-12 opacity-0 animate-fadeIn' style={{ animationDelay: '1.2s' }}>
        <Image
          src={Divider}
          alt='Divider'
          objectFit='cover'
          className='transition-transform duration-500 hover:scale-110 animate-floatReverse'
        />
      </div>
      
      {/* Explore section */}
      <section 
        id="explore"
        ref={exploreRef}
        className='w-full px-4 md:px-5 xl:px-8 2xl:px-[220px] pt-[108px] pb-12 flex justify-around items-center opacity-0'
      >
        <div className='w-full lg:w-1/2 flex flex-col gap-4 pl-0 md:pl-5 xl:pl-8 2xl:pl-[220px]'>
          <p className='header-h5 text-secondary transition-all duration-300 hover:scale-105'>Explore like never before</p>
          <h2 className='header-h2 text-dark-text'>Explore with Street View. <br/> Understand with AI</h2>
          <p className='paragraph-p1-semibold text-sub-text pr-2'>Our split-screen interface connects NAVER's Map and Street View with our AI's insights. <br/> Don't just see where you're going - understand why it's amazing.</p>
          <div className='mt-4'>
            {exploreTexts.map((text, index) => (
              <div 
                key={index} 
                className='mt-4 flex gap-2 transition-all duration-300 hover:translate-x-2 group'
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className='w-[30px] h-[30px] rounded-full bg-secondary text-light-text header-h4 flex justify-center items-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-lg'>
                  <DoneOutlined />
                </div>
                <p className='paragraph-p1-regular text-dark-text transition-colors duration-300 group-hover:text-primary'>{text.text}</p>
              </div>
            ))}
          </div>
          <div 
            className='w-full flex justify-end'
            style={{
              transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
            }}
          >
            <Image 
              src={Plane}
              alt={'Plane'}
              className='w-[452px] h-auto transition-transform duration-500 hover:scale-110 hover:rotate-12 animate-floatSlow'
            />
          </div>
        </div>
        <div 
          className='w-1/2 flex justify-end px-0 md:px-5 xl:px-8 2xl:px-[220px] hidden lg:block'
          style={{
            transform: `translate(${-mousePosition.x * 0.15}px, ${-mousePosition.y * 0.15}px)`,
          }}
        >
          <Image 
            src={ExampleImage}
            alt='example image'
            className='rounded-2xl transition-all duration-500 hover:scale-110 hover:shadow-2xl animate-float'
          />
        </div>
      </section>

      <section 
        id="sub-content" 
        className='w-full bg-[color-mix(in_srgb,var(--color-primary),black_30%)] px-4 md:px-5 xl:px-8 2xl:px-[220px] py-[114px] mt-[102px] flex flex-col justify-center items-center text-center relative overflow-hidden'
      >
        <div className='absolute inset-0 opacity-10 overflow-hidden'>
          <div className='absolute top-10 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl animate-float'></div>
          <div className='absolute bottom-10 right-10 w-96 h-96 bg-primary rounded-full blur-3xl animate-floatReverse'></div>
          <div className='absolute top-1/2 left-1/2 w-64 h-64 bg-secondary/50 rounded-full blur-3xl animate-pulseGlow'></div>
        </div>
        <div className='relative z-10'>
          <h2 className='header-h2 text-light-text transition-all duration-500 hover:scale-105'>Start creating your itinerary now</h2>
          <p className='paragraph-p1-semibold text-light-text mt-8 mb-[70px] transition-all duration-500 hover:scale-105'>Your next adventure in Korea is just one click away.</p>
          <Link 
            href={`${userLoggedIn ? '/plan' : '/auth/login'}`}
            className='bg-secondary text-light-text paragraph-p1-semibold px-8 py-5 rounded-[12px] hover:bg-[color-mix(in_srgb,var(--color-secondary),black_10%)] transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95 font-semibold inline-block relative overflow-hidden group animate-pulseGlow'
          >
            <span className="relative z-10">Generate your first plan</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
          </Link>
        </div>
      </section>
    </div>
  )
}
