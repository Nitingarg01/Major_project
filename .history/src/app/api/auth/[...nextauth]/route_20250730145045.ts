import { handlers } from '@/app/auth'

// Export GET directly if it's available from the module
export const { GET, POST } = handlers;