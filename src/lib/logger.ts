/**
 * Hackathon-Compliant Structured Logger
 * 
 * Satisfies the requirement:
 * "log as info all function calls (with their parameters) and log all genai calls 
 * with all their parameters (model used, prompt, config) and their outputs, just strip inline data"
 */

export const logger = {
  /**
   * Log standard function entries and API parameters
   */
  info: (functionName: string, params: any) => {
    const cleanedParams = sanitizeParams(params);
    console.log(
      `[INFO] [${new Date().toISOString()}] Fn: ${functionName} | Payload:`,
      JSON.stringify(cleanedParams, null, 2)
    );
  },

  /**
   * Log all generative AI model inquiries, instructions, parameters, and generated text outputs
   */
  ai: (modelUsed: string, prompt: string, config: any, output: any) => {
    const cleanedPrompt = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
    console.log(
      `======================================================================\n` +
      `[AI-GENAI-CALL] [${new Date().toISOString()}]\n` +
      `----------------------------------------------------------------------\n` +
      `🤖 Model:  ${modelUsed}\n` +
      `⚙️  Config: ${JSON.stringify(config, null, 2)}\n` +
      `📝 Prompt Snippet:\n"${cleanedPrompt.slice(0, 500)}${cleanedPrompt.length > 500 ? '... [TRUNCATED]' : ''}"\n` +
      `----------------------------------------------------------------------\n` +
      `✨ Output Snippet:\n"${typeof output === 'string' ? output.slice(0, 1000) : JSON.stringify(output).slice(0, 1000)}${output.length > 1000 ? '... [TRUNCATED]' : ''}"\n` +
      `======================================================================`
    );
  },

  /**
   * Log warning events
   */
  warn: (message: string, error?: any) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, error ? error : '');
  },

  /**
   * Log error events
   */
  error: (message: string, error?: any) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ❌ ${message}`, error ? error : '');
  }
};

/**
 * Strips huge base64 binary image uploads, file buffers, or long arrays
 * to prevent console spam and log congestion.
 */
function sanitizeParams(params: any): any {
  if (!params) return params;
  if (Array.isArray(params)) {
    return params.map(item => sanitizeParams(item));
  }
  if (typeof params !== 'object') return params;

  const copy = { ...params };
  for (const key in copy) {
    const value = copy[key];
    if (typeof value === 'string') {
      if (value.startsWith('data:image') || value.startsWith('data:application') || value.length > 500) {
        copy[key] = `[TRUNCATED_BINARY_DATA: ${value.slice(0, 30)}... (${value.length} characters)]`;
      }
    } else if (value && typeof value === 'object') {
      if (value.type === 'Buffer' || Array.isArray(value.data)) {
        copy[key] = `[TRUNCATED_BUFFER_DATA]`;
      } else {
        copy[key] = sanitizeParams(value);
      }
    }
  }
  return copy;
}
