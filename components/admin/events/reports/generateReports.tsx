import { getActiveVolunteerHours, getCurrentEventData, getDateRange, getInternOfficerVolunteer, getLifetime, getPastEventData, getWeeklyUpdate, getYearlyEvent } from '@/actions/admin/reports/report'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export const dateRangeReport = async (start: Date, end: Date, event_id: number, event_name: string) => {
    const workbook = new ExcelJS.Workbook()

    const eventShiftData = await getDateRange(start, end, event_id)
    
    if(!eventShiftData)
        return null

    const workbookName = event_name.replace(' ', '_') + "_" + start.toISOString().substring(0,10).replace('-','_') + "_" + end.toISOString().substring(0,10).replace('-','_')
    const worksheetName = "Master"
    workbook.addWorksheet(worksheetName)

    const worksheet = workbook.getWorksheet(worksheetName)!

    const title = worksheet.getCell('A1')
    title.value = "Master List"
    title.font = { bold: true }
    worksheet.mergeCells('A1:AJ1')

    const labelsArray = ['Registration Approval Date', 'Caller', 'Confirmation', 'ARRIVAL Time', 'Shift Date', 'Shift Name', 'Start Time', 'Member Type', 'Has Discord', 'H Waiver', 'Lanyard', 'Name', 'Cell Phone or Bail Code', 'School', 'Year', 'Instagram URL', 'Friends', 'DOB', 'Age', 'Email', 'Shirt Size', 'Transportation', 'Address', 'City', 'Zip Code', 'E Contact', 'E Phone', 'E DOB', 'Has Name Badge', 'Comment', 'Confirmed']
    const labels = worksheet.addRow(labelsArray)
            labels.font = { bold: true }

    for(var i = 1; i <= labelsArray.length; i++){
        worksheet.getColumn(i).width = 20
    }

    eventShiftData.map((shift) => {
        shift.events_eventshiftmember.map(member => {
            const dataArray = [
                member.registration_approval_date,
                '',
                '',
                new Date(shift.start_time.getTime() - 30 * 60 * 1000).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}),
                shift.start_time.toLocaleDateString('en-US'),
                shift.description,
                shift.start_time.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}) + ' - ' + shift.end_time.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}),
                member.member_member.member_memberprivate?.member_type,
                member.member_member.member_memberprivate?.has_long_sleeves ? "Yes" : "No",
                member.member_member.member_memberprivate?.has_hoodies ? "Yes" : "No",
                member.member_member.member_memberprivate?.has_lanyard ? "Yes" : "No",
                member.member_member.first_name + " " + member.member_member.last_name,
                member.member_member.cell_phone,
                member.member_member.school,
                member.member_member.graduating_year,
                member.member_member.twitter_url,
                member.member_member.friends,
                member.member_member.dob,
                Math.floor(((Date.now() - member.member_member.dob.getTime()) / (1000 * 3600 * 24))/365.25),
                member.member_member.email,
                member.member_member.shirt_size,
                member.transportation,
                member.member_member.address,
                member.member_member.city,
                member.member_member.zip,
                member.member_member.emergency_contact_name,
                member.member_member.emergency_contact_phone,
                member.member_member.emergency_contact_dob,
                member.member_member.member_memberprivate?.has_name_badge ? "Yes" : "No",
                member.member_member.comments,
                member.confirmed ? "Yes" : "No"
            ]

            worksheet.addRow(dataArray)
        })
    })

    workbook.xlsx.writeBuffer().then(res => {
        saveAs(new Blob([res]), workbookName + ".xlsx")
    })
}

export const weeklyUpdateReport = async (start: Date, end: Date) => {
    const workbook = new ExcelJS.Workbook()

    const weeklyMemberData = await getWeeklyUpdate(start, end)
    
    if(!weeklyMemberData)
        return null

    const workbookName = "members"
    const worksheetName = "Members"
    workbook.addWorksheet(worksheetName)

    const worksheet = workbook.getWorksheet(worksheetName)!

    const title = worksheet.getCell('A1')
    title.value = "Members (Generated on " + new Date().toLocaleString('en-US') +")"
    title.font = { bold: true }
    worksheet.mergeCells('A1:AJ1')

    const labelsArray = ['Start Date', 'Name', 'Email', 'Questions or Comments', 'Cell Phone', 'School', 'Graduation Year', 'Friends', 'Referrer', 'Instagram URL', 'ID', 'Homeroom']
    const labels = worksheet.addRow(labelsArray)
            labels.font = { bold: true }

    for(var i = 1; i <= labelsArray.length; i++){
        worksheet.getColumn(i).width = 20
    }

    weeklyMemberData.map((member) => {
        const dataArray = [
            member.member_memberprivate?.start_date,
            member.first_name + " " + member.last_name,
            member.email,
            member.comments,
            member.cell_phone,
            member.school,
            member.graduating_year,
            member.friends,
            member.referrer,
            member.twitter_url,
            member.id,
            member.homeroom
        ]
        
        worksheet.addRow(dataArray)
    })

    workbook.xlsx.writeBuffer().then(res => {
        saveAs(new Blob([res]), workbookName + ".xlsx")
    })
}

export const yearlyEventReport = async () => {
    const workbook = new ExcelJS.Workbook()

    const yearlyEventData = await getYearlyEvent()
        
    if(!yearlyEventData)
        return null    

    const workbookName = "yearly-event-report"

    yearlyEventData[0].map(season => {
        const worksheetName = season.season + "-"  + (season.season + 1) + " Summary"
        workbook.addWorksheet(worksheetName)

        const worksheet = workbook.getWorksheet(worksheetName)!

        const title = worksheet.getCell('A1')
        title.value = worksheetName
        title.font = { bold: true }
        worksheet.mergeCells('A1:AJ1')

        const labelsArray = ['Date', 'Event', 'Hours', 'Volunteers']
        const labels = worksheet.addRow(labelsArray)
            labels.font = { bold: true }

        for(var i = 1; i <= labelsArray.length; i++){
            worksheet.getColumn(i).width = 20
        }

        const filteredEvents = yearlyEventData[1].map(event => {
            return { 
                name: event.name,
                events_eventshift: event.events_eventshift.filter(shift => shift.start_time > new Date(season.season, 7, 1) && shift.start_time < new Date(season.season + 1, 6, 31))
            }
        }).filter(event => event.events_eventshift.length > 0).sort((a,b) => new Date(a.events_eventshift[0].start_time).getTime() - new Date(b.events_eventshift[0].start_time).getTime())

        filteredEvents.map(event => {
            const dataArray = [
                event.events_eventshift[0].start_time.toLocaleDateString('en-US') + " - " + event.events_eventshift[event.events_eventshift.length - 1].start_time.toLocaleDateString('en-US'),
                event.name,
                event.events_eventshift.reduce((acc, shift) => acc + shift.events_eventshiftmember.reduce((acc, member) => acc + member.hours, 0), 0),
                event.events_eventshift.reduce((acc, shift) => acc + shift.events_eventshiftmember.length, 0),
            ]

            worksheet.addRow(dataArray)
        })

        const totalArray = [
            season.season + " - " + (season.season + 1),
            "Total",
            filteredEvents.reduce((acc, event) => acc + event.events_eventshift.reduce((acc, shift) => acc + shift.events_eventshiftmember.reduce((acc, member) => acc + member.hours, 0), 0), 0),
            filteredEvents.reduce((acc, event) => acc + event.events_eventshift.reduce((acc, shift) => acc + shift.events_eventshiftmember.length, 0), 0),
        ]

        const total = worksheet.addRow(totalArray)
            total.font = {bold: true}
    })

    workbook.xlsx.writeBuffer().then(res => {
        saveAs(new Blob([res]), workbookName + ".xlsx")
    })
}

export const activeVolunteerHoursReport = async () => {
    const workbook = new ExcelJS.Workbook()

    const activeVolunteerHoursData = await getActiveVolunteerHours()
        
    if(!activeVolunteerHoursData)
        return null    

    const workbookName = "active-volunteer-hours-reports"

    activeVolunteerHoursData[0].map(season => {
        const worksheetName = season.season + "-"  + (season.season + 1)
        workbook.addWorksheet(worksheetName)

        const worksheet = workbook.getWorksheet(worksheetName)!

        const title = worksheet.getCell('A1')
        title.value = "Active Volunteer Hours " + worksheetName
        title.font = { bold: true }
        worksheet.mergeCells('A1:AJ1')

        const filteredEvents = activeVolunteerHoursData[1].filter(event => event.eventseason_id === season.season).map(event => event.event_id)

        const labelsArray = ['Member', 'School', 'Grad Year', 'Date of Birth', 'Active Events (' +  filteredEvents.length + ')']
        const labels = worksheet.addRow(labelsArray)
            labels.font = { bold: true }

        for(var i = 1; i <= labelsArray.length; i++){
            worksheet.getColumn(i).width = 20
        }

        activeVolunteerHoursData[2].map(member => {
            const dataArray = [
                member.first_name + " " + member.last_name,
                member.school,
                member.graduating_year,
                member.dob,
                [...new Set(member.events_eventshiftmember.filter(shift => shift.events_eventshift.start_time > new Date(season.season, 7, 1) && shift.events_eventshift.start_time < new Date(season.season + 1, 6, 31)).map(shift => shift.events_eventshift.event_id))].filter(eventId => filteredEvents.includes(eventId)).length
            ]

            worksheet.addRow(dataArray)
        })
    })

    workbook.xlsx.writeBuffer().then(res => {
        saveAs(new Blob([res]), workbookName + ".xlsx")
    })
}

export const internOfficerVolunteerReport = async () => {
    const workbook = new ExcelJS.Workbook()

    const internOfficerVolunteerData = await getInternOfficerVolunteer()
        
    if(!internOfficerVolunteerData)
        return null    

    const workbookName = "internofficer-volunteer-reports"

    internOfficerVolunteerData[0].map(season => {
        const worksheetName = season.season + "-"  + (season.season + 1)
        workbook.addWorksheet(worksheetName)

        const worksheet = workbook.getWorksheet(worksheetName)!

        const title = worksheet.getCell('A1')
        title.value = worksheetName
        title.font = { bold: true }
        worksheet.mergeCells('A1:AJ1')

        const labelsArray = ['Name', 'HIM Start', 'Date', 'Event', 'Shift']
        const labels = worksheet.addRow(labelsArray)
            labels.font = { bold: true }

        for(var i = 1; i <= labelsArray.length; i++){
            worksheet.getColumn(i).width = 20
        }

        internOfficerVolunteerData[1].map(member => {
            const filteredShifts = member.events_eventshiftmember.filter(shift => shift.events_eventshift.start_time > new Date(season.season, 7, 1) && shift.events_eventshift.start_time < new Date(season.season + 1, 6, 31))

            worksheet.addRow([])
            const nameLabel = worksheet.addRow([
                member.first_name + " " + member.last_name + " Count: " + filteredShifts.length
            ])
            nameLabel.font = {bold: true}
            
            filteredShifts.map(shift => {
                const dataArray = [
                    member.first_name + " " + member.last_name,
                    member.member_memberprivate?.start_date,
                    shift.events_eventshift.start_time,
                    shift.events_eventshift.events_event.name,
                    shift.events_eventshift.description
                ]
                worksheet.addRow(dataArray)
            })
        })
    })

    workbook.xlsx.writeBuffer().then(res => {
        saveAs(new Blob([res]), workbookName + ".xlsx")
    })
}

export const currentEventDataReport = async (id: number) => {
    const workbook = new ExcelJS.Workbook()

    const currentEventData = await getCurrentEventData(id)
        
    if(!currentEventData)
        return null    

    const workbookName = currentEventData.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-') + "-current"

    const worksheetName = "Master"
    workbook.addWorksheet(worksheetName)

    const worksheet = workbook.getWorksheet(worksheetName)!

    const labelsArray = ['Registration Approval', 'Caller', 'Confirmation', 'ARRIVAL Time', 'Shift Date', 'Shift Name', 'Start Time', 'Member Type', 'Has Discord', 'E Waiver', 'H Waiver', 'Lanyard', 'Name', 'Cell Phone', 'School', 'Year', 'Instagram URL', 'Friends', 'Email', 'DOB', 'Age', 'Shirt Size', 'Via', 'Address', 'City', 'Zip Code', 'E contact', 'E Phone', 'E DOB', 'Has name badge', 'Comment', 'Confirmed']
    const labels = worksheet.addRow(labelsArray)
        labels.font = { bold: true }

    for(var i = 1; i <= labelsArray.length; i++){
        worksheet.getColumn(i).width = 20
    }

    currentEventData.events_eventshift.map(shift => {
        shift.events_eventshiftmember.map(member => {
            const dataArray = [
                member.registration_approval_date,
                '',
                '',
                new Date(shift.start_time.getTime() - 30 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true}),
                shift.start_time.toLocaleDateString('en-US', {timeZone: "UTC"}),
                shift.description,
                shift.start_time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + " - " + shift.end_time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                member.member_member.member_memberprivate?.member_type,
                member.member_member.member_memberprivate?.has_long_sleeves ? "Yes" : "No",
                '',
                member.member_member.member_memberprivate?.has_hoodies ? "Yes" : "No",
                member.member_member.member_memberprivate?.has_lanyard ? "Yes" : "No",
                member.member_member.first_name + " " + member.member_member.last_name,
                member.member_member.cell_phone,
                member.member_member.school,
                member.member_member.graduating_year,
                member.member_member.twitter_url,
                member.member_member.friends,
                member.member_member.dob,
                Math.floor(((Date.now() - member.member_member.dob.getTime()) / (1000 * 3600 * 24))/365.25),
                member.member_member.email,
                member.member_member.shirt_size,
                member.transportation,
                member.member_member.address,
                member.member_member.city,
                member.member_member.zip,
                member.member_member.emergency_contact_name,
                member.member_member.emergency_contact_phone,
                member.member_member.emergency_contact_dob,
                member.member_member.member_memberprivate?.has_name_badge ? "Yes" : "No",
                member.member_member.comments,
                member.confirmed ? "Yes" : "No"
            ]
            worksheet.addRow(dataArray)
        })
    })

    workbook.xlsx.writeBuffer().then(res => {
        saveAs(new Blob([res]), workbookName + ".xlsx")
    })
}

export const pastEventDataReport = async (id: number) => {
    const workbook = new ExcelJS.Workbook()

    const pastEventData = await getPastEventData(id)
        
    if(!pastEventData)
        return null    

    const workbookName = pastEventData.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-') + "-past"

    const worksheetName = "Master"
    workbook.addWorksheet(worksheetName)

    const worksheet = workbook.getWorksheet(worksheetName)!

    const title = worksheet.getCell('A1')
    title.value = worksheetName
    title.font = { bold: true }
    worksheet.mergeCells('A1:AJ1')

    const labelsArray = ['Registration Approval', 'Caller', 'Confirmation', 'ARRIVAL Time', 'Shift Date', 'Shift Name', 'Start Time', 'Member Type', 'Has Discord', 'E Waiver', 'H Waiver', 'Lanyard', 'Name', 'Cell Phone', 'School', 'Year', 'Instagram URL', 'Friends', 'Email', 'DOB', 'Age', 'Shirt Size', 'Via', 'Address', 'City', 'Zip Code', 'E contact', 'E Phone', 'E DOB', 'Has name badge', 'Comment', 'Confirmed']
    const labels = worksheet.addRow(labelsArray)
        labels.font = { bold: true }

    for(var i = 1; i <= labelsArray.length; i++){
        worksheet.getColumn(i).width = 20
    }

    pastEventData.events_eventshift.map(shift => {
        shift.events_eventshiftmember.map(member => {
            const dataArray = [
                member.registration_approval_date,
                '',
                '',
                new Date(shift.start_time.getTime() - 30 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true}),
                shift.start_time.toLocaleDateString('en-US'),
                shift.description,
                shift.start_time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + " - " + shift.end_time.toLocaleTimeString('en-US', {  hour: '2-digit', minute: '2-digit', hour12: true }),
                member.member_member.member_memberprivate?.member_type,
                member.member_member.member_memberprivate?.has_long_sleeves ? "Yes" : "No",
                '',
                member.member_member.member_memberprivate?.has_hoodies ? "Yes" : "No",
                member.member_member.member_memberprivate?.has_lanyard ? "Yes" : "No",
                member.member_member.first_name + " " + member.member_member.last_name,
                member.member_member.cell_phone,
                member.member_member.school,
                member.member_member.graduating_year,
                member.member_member.twitter_url,
                member.member_member.friends,
                member.member_member.dob,
                Math.floor(((Date.now() - member.member_member.dob.getTime()) / (1000 * 3600 * 24))/365.25),
                member.member_member.email,
                member.member_member.shirt_size,
                member.transportation,
                member.member_member.address,
                member.member_member.city,
                member.member_member.zip,
                member.member_member.emergency_contact_name,
                member.member_member.emergency_contact_phone,
                member.member_member.emergency_contact_dob,
                member.member_member.member_memberprivate?.has_name_badge ? "Yes" : "No",
                member.member_member.comments,
                member.confirmed ? "Yes" : "No"
            ]
            worksheet.addRow(dataArray)
        })
    })

    workbook.xlsx.writeBuffer().then(res => {
        saveAs(new Blob([res]), workbookName + ".xlsx")
    })
}

export const lifetimeReport = async (id: number) => {
    const workbook = new ExcelJS.Workbook()

    const lifetimeData = await getLifetime(id)
        
    if(!lifetimeData)
        return null    

    const workbookName = "lifetime-" + lifetimeData.id

    const worksheetName = "Lifetime Report"
    workbook.addWorksheet(worksheetName)

    const worksheet = workbook.getWorksheet(worksheetName)!

    const title = worksheet.getCell('A1')
    title.value = "Member Info"
    title.font = { bold: true }
    worksheet.mergeCells('A1:AJ1')

    const userLabelsArray = ['Name', 'School']
    const userInfoArray = [lifetimeData.first_name + " " + lifetimeData.last_name, lifetimeData.school]
    lifetimeData.events_eventshiftmember.map(shift => {
        if(shift.events_eventshift.start_time > new Date(shift.events_eventshift.start_time.getFullYear() - 1, 7, 1) && shift.events_eventshift.start_time < new Date(shift.events_eventshift.start_time.getFullYear(), 6, 31) && !userLabelsArray.includes('8/' + (shift.events_eventshift.start_time.getFullYear() - 1) + ' - ' + '7/' + shift.events_eventshift.start_time.getFullYear())) {
            userLabelsArray.push('8/' + (shift.events_eventshift.start_time.getFullYear() - 1) + ' - ' + '7/' + shift.events_eventshift.start_time.getFullYear())
            userInfoArray.push(lifetimeData.events_eventshiftmember.filter(shiftMember => shiftMember.events_eventshift.start_time > new Date(shift.events_eventshift.start_time.getFullYear() - 1, 7, 1) && shiftMember.events_eventshift.start_time < new Date(shift.events_eventshift.start_time.getFullYear(), 6, 31) && shiftMember.completed).reduce((sum, shift) => sum + shift.hours, 0).toString())
        } else if(shift.events_eventshift.start_time > new Date(shift.events_eventshift.start_time.getFullYear(), 7, 1) && shift.events_eventshift.start_time < new Date(shift.events_eventshift.start_time.getFullYear() + 1, 6, 31) && !userLabelsArray.includes('8/' + shift.events_eventshift.start_time.getFullYear() + ' - ' + '7/' + (shift.events_eventshift.start_time.getFullYear() + 1))) {
            userLabelsArray.push('8/' + (shift.events_eventshift.start_time.getFullYear()) + ' - ' + '7/' + (shift.events_eventshift.start_time.getFullYear() + 1))
            userInfoArray.push(lifetimeData.events_eventshiftmember.filter(shiftMember => shiftMember.events_eventshift.start_time > new Date(shift.events_eventshift.start_time.getFullYear(), 7, 1) && shiftMember.events_eventshift.start_time < new Date(shift.events_eventshift.start_time.getFullYear() + 1, 6, 31) && shiftMember.completed).reduce((sum, shift) => sum + shift.hours, 0).toString())
        }
    })
    userLabelsArray.push('Recorded Hours')
    userLabelsArray.push('Extra Hours')
    userLabelsArray.push('Total Hours')

    userInfoArray.push(lifetimeData.events_eventshiftmember.filter(shift => shift.completed).reduce((sum, shift) => sum + shift.hours, 0).toString())
    userInfoArray.push(lifetimeData.member_memberprivate ? lifetimeData.member_memberprivate.extra_hours.toString() : "0")
    userInfoArray.push((lifetimeData.events_eventshiftmember.filter(shift => shift.completed).reduce((sum, shift) => sum + shift.hours, 0) + (lifetimeData.member_memberprivate ? lifetimeData.member_memberprivate.extra_hours : 0)).toString())

    const userLabels = worksheet.addRow(userLabelsArray)
        userLabels.font = {bold: true}

    worksheet.addRow(userInfoArray)

    worksheet.addRow([])
    
    const shiftsTitle = worksheet.addRow(['Shifts for ' + lifetimeData.first_name + " " + lifetimeData.last_name + " (as of " + new Date().toISOString() + ")"])
        shiftsTitle.font = { bold: true }
    
    const labelsArray = ['ID', 'Name', 'Event ID', 'Event', 'Shift ID', 'Shift', 'Date', 'Start Time', 'End Time', 'School', 'Graduating Year', 'Confirmed', 'Completed', 'Hours']
    const labels = worksheet.addRow(labelsArray)
        labels.font = { bold: true }

    for(var i = 1; i <= labelsArray.length; i++){
        worksheet.getColumn(i).width = 20
    }

    lifetimeData.events_eventshiftmember.map(shift => {
        const dataArray = [
            lifetimeData.id,
            lifetimeData.first_name + " " + lifetimeData.last_name,
            shift.events_eventshift.events_event.id,
            shift.events_eventshift.events_event.name,
            shift.events_eventshift.id,
            shift.events_eventshift.description,
            shift.events_eventshift.start_time.toLocaleDateString('en-US'),
            shift.events_eventshift.start_time.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}),
            shift.events_eventshift.end_time.toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit'}),
            lifetimeData.school,
            lifetimeData.graduating_year,
            shift.confirmed ? "TRUE" : "FALSE",
            shift.completed ? "TRUE" : "FALSE",
            shift.hours
        ]

        worksheet.addRow(dataArray)
    })

    workbook.xlsx.writeBuffer().then(res => {
        saveAs(new Blob([res]), workbookName + ".xlsx")
    })
}