import { env } from './env'

export const API_CONFIG = {
  BASE_URL: env.API_URL,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
    },
    USER: {
      PROFILE: '/users/profile',
      UPDATE: '/users/update',
    },
    POSTS: {
      LIST: '/posts',
      DETAIL: (id: string) => `/posts/${id}`,
    },
    PLANNER: {
      CREATE_ITINERARY: '/api/planner/create-itinerary',
    },
  },
}
