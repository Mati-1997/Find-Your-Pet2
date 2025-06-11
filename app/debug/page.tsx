"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    checkSupabaseConnection()
  }, [])

  const checkSupabaseConnection = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const info: any = {
        timestamp: new Date().toISOString(),
        environment: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
          urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "No configurada",
          keyValue: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : "No configurada",
        },
      }

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Test connection
        const { data, error } = await supabase.auth.getSession()
        info.connection = {
          success: !error,
          error: error?.message,
          hasSession: !!data.session,
          sessionUser: data.session?.user?.email,
        }

        // Test a simple query
        try {
          const { data: testData, error: testError } = await supabase.from("profiles").select("count").limit(1)

          info.database = {
            canQuery: !testError,
            error: testError?.message,
          }
        } catch (e: any) {
          info.database = {
            canQuery: false,
            error: e.message,
          }
        }
      }

      setDebugInfo(info)
    } catch (error: any) {
      setDebugInfo({
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    }
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  )
}
