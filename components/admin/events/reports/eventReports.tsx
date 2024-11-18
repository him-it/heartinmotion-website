"use client"

import { activeVolunteerHoursReport, internOfficerVolunteerReport, yearlyEventReport } from './generateReports';

const AdminEventReports = () => {
    return (
        <div>
                <div className='flex flex-col items-center'>
                    <div className='mb-8'>
                        <a
                            href="#"
                            onClick={yearlyEventReport}
                            className='flex items-center bg-red-500 text-white py-2 px-4 rounded-full hover:bg-red-600 transition duration-300'
                        >
                            Yearly Event Report
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 ml-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25" />
                            </svg>
                        </a>
                    </div>
                    <div className='mb-8'>
                        <a
                            href="#"
                            onClick={internOfficerVolunteerReport}
                            className='flex items-center bg-red-500 text-white py-2 px-4 rounded-full hover:bg-red-600 transition duration-300'
                        >
                            Intern/Officer Volunteer Report
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 ml-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25" />
                            </svg>
                        </a>
                    </div>
                    <div className='mb-8'>
                        <a
                            href="#"
                            onClick={internOfficerVolunteerReport}
                            className='flex items-center bg-red-500 text-white py-2 px-4 rounded-full hover:bg-red-600 transition duration-300'
                        >
                            Volunteer Hours Report
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 ml-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25" />
                            </svg>
                        </a>
                    </div>
                    <div>
                        <a
                            href="#"
                            onClick={activeVolunteerHoursReport}
                            className='flex items-center bg-red-500 text-white py-2 px-4 rounded-full hover:bg-red-600 transition duration-300'
                        >
                            Active Volunteer Hours Report
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 ml-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25" />
                            </svg>
                        </a>
                    </div>
                </div>
        </div>
    )
}

export default AdminEventReports