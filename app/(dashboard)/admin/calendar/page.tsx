// app/(dashboard)/admin/calendar/page.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HijriCalendar } from './hijri-calendar'

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Islamic Calendar</CardTitle>
          <p className="text-sm text-gray-500">
            Hijri (Arabic) calendar — based on Umm al-Qura calculations
          </p>
        </CardHeader>
        <CardContent>
          <HijriCalendar />
        </CardContent>
      </Card>
    </div>
  )
}
