"use client"

import { createSeason, deleteSeason, getEvents, getSeasons, updateActiveSeasonEvents } from "@/actions/admin/event"
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/ui/formError"
import { FormSuccess } from "@/components/ui/formSuccess"
import { Prisma } from "@prisma/client"
import { useEffect, useState, useTransition } from "react"

const AdminSeasonList = ({seasonData, eventData} : {seasonData: Prisma.PromiseReturnType<typeof getSeasons> | undefined, eventData : Prisma.PromiseReturnType<typeof getEvents> | undefined}) => {
    const [selectedEvents, setSelectedEvents] = useState<boolean[]>() 
    const [selectedSeason, setSelectedSeason] = useState<number>()
    const [newSeason, setNewSeason] = useState<number>()
    const [ isPending, startTransition ] = useTransition()
    const [nRAE, setNRAE] = useState<number>()
    const [error, setError] = useState<string | undefined>(undefined)
    const [success, setSuccess] = useState<string | undefined>(undefined)

    useEffect(() => {
        if(seasonData) {
            setSelectedSeason(seasonData[0].season)
            setNRAE(seasonData[0].n_required_active_events)
        }
    }, [seasonData])

    useEffect(() => {
        if(eventData && seasonData) {
            const mappedEventData = eventData.map(event => {
                return seasonData.some(season => 
                    season.season === selectedSeason && 
                    season.events_eventseason_active_events.some(activeEvent => 
                        activeEvent.events_event.id === event.id
                    )
                )
            })
            setNRAE(selectedSeason !== -1000 ? (seasonData.find(season => season.season === selectedSeason)?.n_required_active_events) : 10)
            setSelectedEvents(mappedEventData)
            setNewSeason(seasonData[seasonData.length-1].season + 1)
        }
    }, [selectedSeason, eventData, seasonData])
    
    const handleSubmit = () => {
        if(eventData && seasonData && selectedSeason)
            if(selectedSeason != -1000) {
                const createActive = selectedEvents?.map((event, key) => {
                    const currentlyExists = seasonData.find(season => season.season === selectedSeason)
                    ?.events_eventseason_active_events.some(activeEvent => activeEvent.events_event.id === eventData[key].id)

                    if(event && !currentlyExists)
                        return { event_id: eventData[key].id, eventseason_id: selectedSeason }
                }).filter(event => event !== undefined)
                const deleteActive = selectedEvents?.map((event, key) => {
                    if(!event) {
                        const activeEvents = seasonData.find(season => season.season === selectedSeason)
                        ?.events_eventseason_active_events.map(activeEvent => {
                            if(activeEvent.events_event.id === eventData[key].id)
                                return activeEvent.id
                        }).filter(event => event !== undefined)

                        if(activeEvents)
                            return activeEvents[0]
                    }
                }).filter(event => event !== undefined)

                startTransition(() => {
                    updateActiveSeasonEvents(createActive as {event_id: number, eventseason_id: number}[], deleteActive as number[], selectedSeason, nRAE)
                    .then((res) => {
                        setError(res.error)
                        if(!res.error)
                            window.location.reload()
                    })
                })
            } else {
                if(newSeason && nRAE) {
                    const createActive = selectedEvents?.map((event, key) => {
                        if(event)
                            return { event_id: eventData[key].id, eventseason_id: newSeason }
                    }).filter(event => event !== undefined)

                    startTransition(() => {
                        createSeason(newSeason, nRAE, createActive as {event_id: number, eventseason_id: number}[])
                        .then((res) => {
                            setError(res.error)
                            if(!res.error)
                                window.location.reload()
                        })
                    })
                }
            }
    }

    const handleDelete = () => {
        if(selectedSeason && confirm("Are you sure you want to delete this season?"))
            startTransition(() => {
                deleteSeason(selectedSeason)
                .then(res => {
                    if(!res.error)
                        window.location.reload()
                })
        })
    }

    return (
<div>
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        {
            seasonData && eventData && 
            <div>
                {
                        selectedSeason !== -1000 &&
                        <div className="mb-5">
                            <Button 
                                disabled={isPending}
                                onClick={handleDelete} 
                                className="flex items-center justify-center text-white bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-500 rounded-lg py-2 px-4 transition duration-300 ease-in-out"
                            >
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    strokeWidth="1.5" 
                                    stroke="currentColor" 
                                    className="h-5 w-5 mr-2"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                                Delete
                            </Button>
                        </div>
                    }
                <div className="mb-4 flex items-center space-x-4"> 
                    <div className="w-full"> 
                        <label className="block text-lg font-medium text-gray-700">Season</label>
                        <select 
                            onChange={(e) => {
                                if(!isNaN(Number(e.target.value)))
                                    setSelectedSeason(Number(e.target.value))
                            }}
                            value={selectedSeason}
                            className="mt-2 block w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isPending}
                        >
                            {
                                seasonData.map((season) => (
                                    <option key={season.season} value={season.season}>
                                        {season.season}
                                    </option>
                                ))
                            }
                            <option value={-1000}>
                                New Season
                            </option>
                        </select>
                    </div>
                    <div>
                            <label className="block text-lg font-medium text-gray-700">Required Active Events:</label>
                            <input 
                                disabled={isPending}
                                type="number" 
                                value={nRAE}
                                onChange={(e) => {
                                    if(!isNaN(Number(e.target.value)))
                                        setNRAE(Number(e.target.value))
                                }}
                                className="mt-2 border border-gray-300 rounded-md px-4 py-2"
                            />
                    </div>
                    {
                        selectedSeason === -1000 &&  
                        <div> 
                            <div>
                                <label className="block text-lg font-medium text-gray-700">Year:</label>
                                <input 
                                    disabled={isPending}
                                    type="number" 
                                    value={newSeason}
                                    onChange={(e) => {
                                        if(!isNaN(Number(e.target.value)))
                                            setNewSeason(Number(e.target.value))
                                    }}
                                    className="mt-2 border border-gray-300 rounded-md px-4 py-2"
                                />
                            </div>
                        </div>
                    }
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {
                        selectedEvents && eventData.map((event, key) => (
                            <div key={key} className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    checked={selectedEvents[key]}
                                    onChange={() => 
                                        setSelectedEvents(selectedEvents.map((event, tempKey) => {
                                            if(tempKey === key) 
                                                return !event
                                            else return event
                                        }))
                                    }
                                    disabled={isPending}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <label className="text-gray-700 ml-2 w-full">{event.name}</label>
                            </div>
                        ))
                    }
                </div>

                <Button disabled={isPending} onClick={handleSubmit} className="text-white flex w-52 mt-11 mb-2 mx-auto rounded-full bg-red-500 hover:bg-red-600 transition duration-300">Save</Button>
                { success ? (
                        <FormSuccess message={ success } />
                    ) : (
                        <FormError message={ error } />
                    )} 
            </div>
        }
    </div>
</div>


    )
}

export default AdminSeasonList