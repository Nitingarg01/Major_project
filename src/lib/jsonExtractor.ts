/**
 * Robust JSON extraction utility for AI model responses
 * Handles various response formats including descriptive text before JSON
 */

export function extractJSON(response: string): any {
  try {
    // First try: Direct JSON parse (in case response is already clean JSON)
    return JSON.parse(response);
  } catch (error) {
    try {
      // Remove markdown code blocks
      let cleaned = response.replace(/```json\n?|\n?```/g, '');
      
      // Try parsing after markdown removal
      return JSON.parse(cleaned);
    } catch (error) {
      try {
        // Look for JSON object patterns - find first { or [ and last } or ]
        const jsonObjectMatch = response.match(/\{[\s\S]*\}/);
        const jsonArrayMatch = response.match(/\[[\s\S]*\]/);
        
        let jsonString = '';
        if (jsonObjectMatch && jsonArrayMatch) {
          // Choose the longer match (more likely to be complete)
          jsonString = jsonObjectMatch[0].length > jsonArrayMatch[0].length 
            ? jsonObjectMatch[0] 
            : jsonArrayMatch[0];
        } else if (jsonObjectMatch) {
          jsonString = jsonObjectMatch[0];
        } else if (jsonArrayMatch) {
          jsonString = jsonArrayMatch[0];
        } else {
          throw new Error('No JSON pattern found');
        }
        
        return JSON.parse(jsonString);
      } catch (error) {
        try {
          // More aggressive extraction: Remove common prefixes
          let cleaned = response
            .replace(/^.*?(?=[\{\[])/s, '') // Remove everything before first { or [
            .replace(/[\}\]].*$/s, (match) => match.charAt(0)); // Keep only first } or ]
          
          if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
            return JSON.parse(cleaned);
          }
          
          throw new Error('Could not extract valid JSON');
        } catch (finalError) {
          // Last resort: Try to find JSON-like content line by line
          try {
            const lines = response.split('\n');
            let jsonContent = '';
            let inJsonBlock = false;
            let braceCount = 0;
            let bracketCount = 0;
            
            for (const line of lines) {
              const trimmedLine = line.trim();
              
              // Start collecting when we see opening brace/bracket
              if (!inJsonBlock && (trimmedLine.startsWith('{') || trimmedLine.startsWith('['))) {
                inJsonBlock = true;
                jsonContent = line + '\n';
                braceCount = (trimmedLine.match(/\{/g) || []).length - (trimmedLine.match(/\}/g) || []).length;
                bracketCount = (trimmedLine.match(/\[/g) || []).length - (trimmedLine.match(/\]/g) || []).length;
                continue;
              }
              
              // Continue collecting if we're in a JSON block
              if (inJsonBlock) {
                jsonContent += line + '\n';
                braceCount += (trimmedLine.match(/\{/g) || []).length - (trimmedLine.match(/\}/g) || []).length;
                bracketCount += (trimmedLine.match(/\[/g) || []).length - (trimmedLine.match(/\]/g) || []).length;
                
                // Stop when brackets/braces are balanced
                if (braceCount <= 0 && bracketCount <= 0) {
                  break;
                }
              }
            }
            
            if (jsonContent.trim()) {
              return JSON.parse(jsonContent.trim());
            }
            
            throw new Error('Could not extract valid JSON from response');
          } catch (lineError) {
            console.error('Failed to extract JSON from response:', response);
            console.error('Final extraction error:', lineError);
            throw new Error(`JSON extraction failed: ${lineError instanceof Error ? lineError.message : 'Unknown error'}`);
          }
        }
      }
    }
  }
}

/**
 * Safe JSON extraction that returns a fallback value on failure
 */
export function safeExtractJSON<T>(response: string, fallback: T): T {
  try {
    return extractJSON(response) as T;
  } catch (error) {
    console.warn('JSON extraction failed, using fallback:', error);
    return fallback;
  }
}