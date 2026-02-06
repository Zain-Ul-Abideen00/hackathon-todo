"use client"

import * as React from "react"
import { format } from "date-fns"
import { LuClock as Clock2Icon } from "react-icons/lu"
import { Calendar } from "@/components/lightswind/calendar"
import { Card, CardContent, CardFooter } from "@/components/lightswind/card"
import { Label } from "@/components/lightswind/label"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/lightswind/input-group"

interface DateTimePickerProps {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
}

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {
    const [timeValue, setTimeValue] = React.useState<string>(
        date ? format(date, "HH:mm:ss") : "09:00:00"
    )

    React.useEffect(() => {
        if (date) {
            setTimeValue(format(date, "HH:mm:ss"))
        }
    }, [date])

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = e.target.value
        setTimeValue(newTime)
        if (date) {
            // Parse time manually or using date-fns helpers if dealing with complexity
            const [hours, minutes, seconds] = newTime.split(":").map((v) => parseInt(v, 10) || 0)
            const newDate = new Date(date)
            newDate.setHours(hours)
            newDate.setMinutes(minutes)
            newDate.setSeconds(seconds || 0)
            setDate(newDate)
        }
    }

    const handleDateSelect = (newDate: Date | undefined) => {
        if (newDate) {
            const [hours, minutes, seconds] = timeValue.split(":").map((v) => parseInt(v, 10) || 0)
            newDate.setHours(hours)
            newDate.setMinutes(minutes)
            newDate.setSeconds(seconds || 0)
            setDate(newDate)
        } else {
            setDate(undefined)
        }
    }

    return (
        <Card className="w-auto border-0 shadow-none p-0 inline-block">
            <CardContent className="p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    className="p-2 border rounded-md"
                />
            </CardContent>
            <CardFooter className="p-2 pt-2">
                <div className="w-full space-y-2">
                    <Label htmlFor="time-input" className="text-xs">Time</Label>
                    <InputGroup className="w-full">
                        <InputGroupInput
                            id="time-input"
                            type="time"
                            step="1"
                            value={timeValue}
                            onChange={handleTimeChange}
                            disabled={!date}
                            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none text-sm"
                        />
                        <InputGroupAddon className="bg-muted/50">
                            <Clock2Icon className="text-muted-foreground w-4 h-4" />
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </CardFooter>
        </Card>
    )
}
