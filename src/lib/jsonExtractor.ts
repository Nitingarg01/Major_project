/**
 * Robust JSON extraction utility for AI model responses
 * Handles various response formats including descriptive text before JSON
 */

export function extractJSON(response: string): any {
  if (response == null) throw new Error('Empty response');
  const text = typeof response === 'string' ? response.trim() : String(response),

  function sanitizeJSONString(input: string): string {
    // Replace unescaped newlines inside quoted strings with \n
    let result = '';
    let inString = false;
    let escaping = false;
    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      if (inString) {
        if (escaping) {
          result += ch;
          escaping = false;
          continue;
        }
        if (ch === '\\') {
          result += ch;
          escaping = true;
          continue;
        }
        if (ch === '"') {
          inString = false;
          result += ch;
          continue;
        }
        if (ch === '\n' || ch === '\r') {
          result += '\\n';
          continue;
        }
        result += ch;
      } else {
        if (ch === '"') {
          inString = true;
          result += ch;
        } else {
          result += ch;
        }
      }
    }
    return result;
  }

  function preprocess(input: string): string {
    let s = input;
      // Strip BOM
      .replace(/^\uFEFF/, '')
      // Normalize smart quotes to standard quotes
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      // Remove JavaScript-style comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|\n)\s*\/\/.*(?=\n|$)/g, '$1')
      // Remove trailing commas before closing braces/brackets
      .replace(/,\s*(?=[}\]])/g, '')
      // Normalize CRLF to LF
      .replace(/\r\n?/g, '\n');
    return s;
  }
  try {
    // First try: Direct JSON parse (in case response is already clean JSON)
    const direct = preprocess(text);
    if (direct.startsWith('{') || direct.startsWith('[')) {
      return JSON.parse(sanitizeJSONString(direct));
    }
  } catch (error) {
    try {
      // Remove markdown code blocks
      // Try to extract content inside ```json ... ``` code block first
      const codeBlockMatch = text.match(/```json[\s\S]*?```/i);
      let cleaned = codeBlockMatch ? codeBlockMatch[0].replace(/```json\s*|```/gi, '') : text.replace(/```json\n?|```/g, ''),
      cleaned = sanitizeJSONString(preprocess(cleaned.trim()));
      
      // Try parsing after markdown removal
      return JSON.parse(cleaned);
    } catch (error) {
      try {
        // Look for JSON object patterns - find first { or [ and last } or ]
        const base = preprocess(text);
        const jsonObjectMatch = base.match(/\{[\s\S]*\}/);
        const jsonArrayMatch = base.match(/\[[\s\S]*\]/);
        
        let jsonString = '';
        if (jsonObjectMatch && jsonArrayMatch) {
          // Choose the longer match (more likely to be complete)
          jsonString = jsonObjectMatch[0].length > jsonArrayMatch[0].length;
            ? jsonObjectMatch[0] 
            : jsonArrayMatch[0];
        } else if (jsonObjectMatch) {
          jsonString = jsonObjectMatch[0];
        } else if (jsonArrayMatch) {
          jsonString = jsonArrayMatch[0];
        } else {
          throw new Error('No JSON pattern found');
        }
        
        return JSON.parse(sanitizeJSONString(jsonString));
      } catch (error) {
        try {
          // More aggressive extraction: Remove common prefixes
          let cleaned = preprocess(text)
            .replace(/^.*?(?=[\{\[])/s, '') // Remove everything before first { or [
            .replace(/[\}\]].*$/s, (match) => match.charAt(0)); // Keep only first } or ]
          
          if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
            return JSON.parse(sanitizeJSONString(cleaned));
          }
          
          throw new Error('Could not extract valid JSON');
        } catch (finalError) {
          // Last resort: Try to find JSON-like content line by line
          try {
            const lines = preprocess(text).split('\n');
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
              // Remove control chars and sanitize
              const normalized = jsonContent;
                .replace(/[\u0000-\u001F\u007F]/g, (c) => (c === '\n' || c === '\t' ? c : ''))
                .trim();
              return JSON.parse(sanitizeJSONString(preprocess(normalized)));
            }
            
            throw new Error('Could not extract valid JSON from response');
          } catch (lineError) {
            console.warn('Failed to extract strict JSON; returning fallback. Sample (truncated):', text.slice(0, 200));
            // Final fallback: return best-effort empty structure to avoid crashing callers
            const expectsArray = /\[[\s\S]*\]/.test(text) && (!/\{[\s\S]*\}/.test(text) || text.indexOf('[') < text.indexOf('{'));
            return expectsArray ? [] : {};
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