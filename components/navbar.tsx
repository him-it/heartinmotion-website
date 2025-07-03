"use client"

import { useState } from 'react';
import Link from 'next/link';
import { AuthButton } from './auth/authButton';
import { useSession } from 'next-auth/react';

export const Navbar = () => {
    const session = useSession()

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState('');
    
    const handleDropdownToggle = (section:string) => {
        setActiveDropdown(activeDropdown === section ? '' : section);
    };

    return (
        <nav>
            <div className="px-4 md:mx-20 mx-5 sm:px-6">
                <div className="relative pt-7 pb-6 sm:pb-10">
                    <nav className="relative flex items-center justify-between sm:h-10 md:justify-center" aria-label="Global">
                        <div className="flex items-center flex-1 md:absolute md:inset-y-0 md:left-0">
                            <div className="flex items-center justify-between w-full md:w-auto">
                                <Link href="/"><span className="sr-only">Heart in Motion</span>
                                    <img className="w-auto h-16 sm:h-24" src="/assets/logo.png" width="202" height="40" />
                                </Link>
                                <div className="flex items-center -mr-2 md:hidden">
                                    <button
                                        className="inline-flex items-center justify-center p-2 text-gray-400 bg-gray-50 rounded-md hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-50"
                                        type="button"
                                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    >
                                        <span className="sr-only">Open main menu</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex md:space-x-10">
                            {['Volunteer', 'Leadership', 'About'].map((section) => (
                                <div key={section} className="relative group">
                                    <button 
                                        onClick={() => handleDropdownToggle(section.toLowerCase())}
                                        className="flex items-center text-base font-normal text-gray-500 hover:text-gray-900"
                                    >
                                        {section}
                                        <svg className="ml-2 w-4 h-4 text-gray-400 group-hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    <div className={`absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white shadow-lg rounded-lg ${activeDropdown === section.toLowerCase() ? 'block' : 'hidden'}`}>
                                        {section === 'Volunteer' && (
                                            <>
                                                <Link href="/volunteer/events" onClick={()=>setActiveDropdown('')} className="block px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-t-lg hover:text-gray-900 text-center">Events</Link>
                                                <Link href="/volunteer/files" onClick={()=>setActiveDropdown('')} className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 text-center">Files</Link>
                                            </>
                                        )}
                                        {section === 'Leadership' && (
                                            <>
                                                <Link href="/leadership/spotlight" onClick={()=>setActiveDropdown('')} className="block px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-t-lg hover:text-gray-900 text-center">Spotlight</Link>
                                                <Link href="/leadership/internship" onClick={()=>setActiveDropdown('')} className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 text-center">Internship</Link>
                                            </>
                                        )}
                                        {section === 'About' && (
                                            <>
                                                <Link onClick={()=>setActiveDropdown('')} href="/about" className="block px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-t-lg hover:text-gray-900 text-center">About</Link>
                                                <Link onClick={()=>setActiveDropdown('')} href="/about/donate" className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 text-center">Donate</Link>
                                                <Link onClick={()=>setActiveDropdown('')} href="/about/pvsa" className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 text-center">PVSA</Link>
                                                <Link onClick={()=>setActiveDropdown('')} href="/about/faqs" className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 text-center">FAQs</Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="hidden md:absolute md:flex md:items-center md:justify-end md:inset-y-0 md:right-0">
                            { session.status === "authenticated" ? (
                                <div className="relative group">
                                    <button 
                                        onClick={() => handleDropdownToggle('account')}
                                        className="flex items-center justify-center p-2 rounded-md"
                                    >
                                        { 
                                            session.data.user.image ? (
                                                <>
                                                    <img className="w-10 h-10 rounded-full" src={session.data.user.image} alt="Rounded avatar" />
                                                    <svg className="ml-2 w-4 h-4 text-gray-400 group-hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-9 h-9 text-gray-600">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                    </svg>
                                                    <svg className="ml-2 w-4 h-4 text-gray-400 group-hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </>
                                            )
                                        }
                                        
                                        
                                    </button>
                                    <div className={`absolute z-50 left-1/2 transform -translate-x-1/2 mt-1 w-48 bg-white shadow-lg rounded-lg ${activeDropdown === 'account' ? 'block' : 'hidden'}`}>
                                        <div className="py-2">
                                            {
                                                session.data.user.admin_level >= 0 ? (
                                                    <>
                                                        {
                                                            session.data.user.admin_level > 0 &&
                                                            <Link onClick={()=>setActiveDropdown('')} href="/admin" className="block px-4 py-3 text-white rounded-t-lg bg-red-900 hover:bg-red-950 text-center">Admin Panel</Link>
                                                        }
                                                        <Link onClick={()=>setActiveDropdown('')} href="/account/shifts" className="block px-4 py-3 text-gray-500 hover:text-gray-900 rounded-t-lg hover:bg-gray-100 text-center">Registered Shifts</Link>
                                                        <Link onClick={()=>setActiveDropdown('')} href="/account/hours" className="block px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-gray-100 text-center">Hours Earned</Link>
                                                        <Link onClick={()=>setActiveDropdown('')}href="/account/edit" className="block px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-gray-100 text-center">Edit Info</Link>
                                                    </>
                                                ) : (
                                                    <Link href="/account/register" className="block px-4 py-3 text-gray-500 hover:text-gray-900 rounded-t-lg hover:bg-gray-100 text-center">Become a Member</Link>
                                                )
                                            }
                                            <AuthButton action="Log Out" styles='block mt-2 px-4 py-2 text-white bg-gray-900 rounded hover:bg-gray-800 w-[80%] text-center mx-auto' status={ session.status }/>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="inline-flex rounded-full shadow">
                                    <AuthButton action="Log In" styles='inline-flex items-center px-4 py-2 text-base text-white bg-red-500 border border-transparent rounded-full cursor-pointer hover:bg-red-600 transition duration-300' status={ session.status }/>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            </div>

        {mobileMenuOpen && (
            <div className="fixed inset-0 bg-white shadow-lg z-50">
                <div className="flex flex-col p-4">
                    <button
                        className="self-end p-2 text-gray-400 hover:text-gray-500"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="flex justify-center relative group">
                        <Link onClick={() => setMobileMenuOpen(false)} href="/home">
                            <span className="sr-only" >Heart in Motion</span>
                            <img className="w-auto h-36 sm:h-38" src="/assets/logo.png" width="202" height="40" alt="Heart in Motion Logo" />
                        </Link>
                    </div>
                    <div className="flex flex-col space-y-6">
                        {['Volunteer', 'Leadership', 'About'].map((section) => (
                            <div key={section} className="relative group text-center">
                                <button
                                    onClick={() => handleDropdownToggle(`${section.toLowerCase()}-mobile`)}
                                    className="mx-auto flex items-center text-base font-normal text-gray-500 hover:text-gray-900 text-center"
                                >
                                    {section}
                                    <svg className="ml-2 w-4 h-4 text-gray-400 group-hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {activeDropdown === `${section.toLowerCase()}-mobile` && (
                                    <div className="mt-2 w-full bg-white shadow-lg rounded-lg">
                                        {section === 'Volunteer' && (
                                            <>
                                                <Link onClick={() => setMobileMenuOpen(false)} href="/volunteer/events" className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 text-center">Events</Link>
                                                <Link onClick={() => setMobileMenuOpen(false)} href="/volunteer/files" className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 text-center">Files</Link>
                                            </>
                                        )}
                                        {section === 'Leadership' && (
                                            <>
                                                <Link onClick={() => setMobileMenuOpen(false)} href="/leadership/spotlight" className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 text-center">Spotlight</Link>
                                                <Link onClick={() => setMobileMenuOpen(false)} href="/leadership/internship" className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 text-center">Internship</Link>
                                            </>
                                        )}
                                        {section === 'About' && (
                                            <>
                                                <Link onClick={() => setMobileMenuOpen(false)} href="/about" className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 text-center">About</Link>
                                                <Link onClick={() => setMobileMenuOpen(false)} href="/about/donate" className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 text-center">Donate</Link>
                                                <Link onClick={() => setMobileMenuOpen(false)} href="/about/pvsa" className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 text-center">PVSA</Link>
                                                <Link onClick={() => setMobileMenuOpen(false)} href="/about/faqs" className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 text-center">FAQs</Link>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                        { session.status === "authenticated" ? (
                            <>
                                <div className="relative group mt-4 text-center">
                                    <button
                                        onClick={() => handleDropdownToggle('account-mobile')}
                                        className="mx-auto flex items-center text-base font-normal text-gray-500 hover:text-gray-900 text-center"
                                    >
                                        Account
                                        <svg className="ml-2 w-4 h-4 text-gray-400 group-hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {activeDropdown === 'account-mobile' && (
                                        <div className="mt-2 w-full bg-white shadow-lg rounded-lg">
                                            { session.data.user.admin_level >= 0 ? (
                                                <>
                                                {
                                                            session.data.user.admin_level > 0 &&
                                                            <Link href="/admin" onClick={() => setMobileMenuOpen(false)}className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 text-center">Admin</Link>
                                                }
                                                    <Link href="/account/shifts" onClick={() => setMobileMenuOpen(false)}className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 text-center">Registered Shifts</Link>
                                                    <Link href="/account/hours" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 text-center">Hours Earned</Link>
                                                    <Link href="/account/edit" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 text-center">Edit Info</Link>
                                                </>
                                            ) : (
                                                <Link href="/account/register" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 text-center">Become A Member</Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="relative group">
                                    <AuthButton action="Log Out" styles='block px-4 py-2 text-white bg-gray-900 rounded hover:bg-gray-800 w-full text-center' status={ session.status }/>
                                </div>
                            </>
                        ) : (
                            <div className="inline-flex rounded-full shadow mx-auto w-full max-w-6xl">
                                <AuthButton action="Log In" styles='block px-4 py-2 text-gray-900 bg-red-500 text-white border border-transparent rounded-full hover:bg-red-600 transition duration-300 w-full text-center' status={ session.status }/>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
        </nav>
    );
};
