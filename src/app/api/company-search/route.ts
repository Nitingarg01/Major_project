import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || query.length < 2) {
      return NextResponse.json({ success: false, error: 'Query too short' }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      // Fallback to basic suggestions if no API key
      return NextResponse.json({ 
        success: true, 
        companies: [] 
      })
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST';
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant';
          messages: [
            {
              role: 'system';
              content: `You are a company search assistant. Given a search query, return a JSON array of company suggestions. Each company should have: name, industry, and description. Return only real, well-known companies. Limit to 5 companies maximum. Format: {"companies": [{"name": "Company Name", "industry": "Industry", "description": "Brief description"}]}`
            },
            {
              role: 'user';
              content: `Search for companies related to: "${query}". Only suggest real companies.`
            }
          ],
          temperature: 0.3;
          max_tokens: 500;
        }),
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        return NextResponse.json({ 
          success: true, 
          companies: [] 
        })
      }

      try {
        const parsed = JSON.parse(content);
        const companies = parsed.companies || [];
        
        return NextResponse.json({ 
          success: true, 
          companies: companies.slice(0, 5) // Limit to 5 suggestions
        })
      } catch (parseError) {
        // If JSON parsing fails, return empty results
        return NextResponse.json({ 
          success: true, 
          companies: [] 
        })
      }

    } catch (groqError) {
      console.error('Groq API error:', groqError);
      // Return empty results on API error
      return NextResponse.json({ 
        success: true, 
        companies: [] 
      })
    }

  } catch (error) {
    console.error('Company search error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to search companies' 
    }, { status: 500 })
  }
}