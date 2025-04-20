import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getToken } from 'next-auth/jwt'
import { headers } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(req: Request) {
  try {
    const token = await getToken({ req })

    if (!token?.accessToken) {
      console.error('No access token found in session')
      return NextResponse.json(
        { error: 'Unauthorized - No access token found' },
        { status: 401 }
      )
    }

    console.log('Fetching messages from:', `${API_URL}/users/messages/`)
    const response = await fetch(`${API_URL}/users/messages/`, {
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText)
      const errorData = await response.json().catch(() => ({}))
      console.error('Error data:', errorData)
      return NextResponse.json(
        { error: `API Error: ${response.statusText}`, details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Received data from API:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in messages API route:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const token = await getToken({ req })

    if (!token?.accessToken) {
      console.error('No access token found in session')
      return NextResponse.json(
        { error: 'Unauthorized - No access token found' },
        { status: 401 }
      )
    }

    const body = await req.json()
    console.log('Sending message to:', `${API_URL}/users/messages/`)
    const response = await fetch(`${API_URL}/users/messages/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText)
      const errorData = await response.json().catch(() => ({}))
      console.error('Error data:', errorData)
      return NextResponse.json(
        { error: `API Error: ${response.statusText}`, details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Received data from API:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in messages POST route:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
