class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  }

  setToken(token: string | null) {
    this.token = token
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        let errorMessage = "An error occurred"
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return response.json()
      }
      return response.text()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check if the backend is running.")
      }
      throw error
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(username: string, email: string, password: string) {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    })
  }

  async getCurrentUser() {
    return this.request("/api/auth/me")
  }

  // Questions endpoints
  async getQuestions(
    params: {
      skip?: number
      limit?: number
      filter_type?: string
      search?: string
    } = {},
  ) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    const query = searchParams.toString()
    return this.request(`/api/questions${query ? `?${query}` : ""}`)
  }

  async getQuestion(id: number) {
    return this.request(`/api/questions/${id}`)
  }

  async createQuestion(data: {
    title: string
    content: string
    tag_names: string[]
  }) {
    return this.request("/api/questions/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async voteQuestion(id: number, voteType: string) {
    return this.request(`/api/questions/${id}/vote`, {
      method: "POST",
      body: JSON.stringify({ vote_type: voteType }),
    })
  }

  // Answers endpoints
  async createAnswer(data: {
    content: string
    question_id: number
  }) {
    return this.request("/api/answers/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async voteAnswer(id: number, voteType: string) {
    return this.request(`/api/answers/${id}/vote`, {
      method: "POST",
      body: JSON.stringify({ vote_type: voteType }),
    })
  }

  async acceptAnswer(id: number) {
    return this.request(`/api/answers/${id}/accept`, {
      method: "POST",
    })
  }

  // Tags endpoints
  async getTags() {
    return this.request("/api/tags/")
  }

  async getTagSuggestions() {
    return this.request("/api/tags/suggestions")
  }

  // Notifications endpoints
  async getNotifications() {
    return this.request("/api/notifications/")
  }

  async getUnreadCount() {
    return this.request("/api/notifications/unread-count")
  }

  async markNotificationRead(id: number) {
    return this.request(`/api/notifications/${id}/read`, {
      method: "POST",
    })
  }

  async markAllNotificationsRead() {
    return this.request("/api/notifications/mark-all-read", {
      method: "POST",
    })
  }

  // Moderation endpoints
  async getFlaggedContent() {
    return this.request("/api/moderation/flagged-content")
  }

  async reviewContent(moderationId: number, decision: string, notes?: string) {
    return this.request(`/api/moderation/review/${moderationId}`, {
      method: "POST",
      body: JSON.stringify({
        admin_decision: decision,
        admin_notes: notes,
      }),
    })
  }

  async getModerationStats() {
    return this.request("/api/moderation/stats")
  }

  // Health check endpoint
  async healthCheck() {
    return this.request("/")
  }
}

export const apiClient = new ApiClient()
