# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QA Artifacts is an AI-powered test case generation platform built with Next.js 16, featuring automated test case creation from user stories. The application uses a mock API (json-server) for development and includes comprehensive QA management features for workspaces, projects, stories, test plans, test cases, and test suites.

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Start mock API server (REQUIRED for development)
npm run mock-api

# Start development server (in separate terminal)
npm run dev

# Build for production
npm build

# Start production server
npm start

# Lint code
npm run lint
```

### Environment Setup
```bash
# Copy environment variables
cp .env.example .env
```

The mock API runs on port 3001 and must be running before starting the dev server. The Next.js app runs on port 3000.

**Important:** json-server 1.0.0-beta.5 does not support custom routes, so the mock API serves data without the `/api` prefix:
- Mock API: `http://localhost:3001/workspaces`
- Real Backend: `http://localhost:8080/api/v1/workspaces`

When migrating to the real backend, simply update `NEXT_PUBLIC_API_URL` in `.env`.

## Architecture

### App Router Structure

The app uses Next.js App Router with route groups:
- `app/(auth)/` - Authentication pages (login)
- `app/(dashboard)/` - Main application pages with sidebar layout
  - Dashboard layout applies a persistent sidebar to all child routes
  - Routes: workspaces, stories, test-plans, test-cases, suites, reports, settings

### Data Layer

**TanStack Query** (React Query) is used for all server state management:
- Query client configured with 1-minute stale time and disabled window refocus
- Custom hooks in `src/hooks/` provide data fetching, mutations, and cache invalidation
- Pattern: `useResource()`, `useResources()`, `useCreateResource()`, `useUpdateResource()`, `useDeleteResource()`

**Axios Instance** (`src/lib/axios.ts`):
- Configured with `NEXT_PUBLIC_API_URL` environment variable
- Interceptors set up for request/response handling (auth tokens commented out)
- Base URL defaults to `http://localhost:3001/api`

### Data Model

Key entities in `database/db.json`:
- **Workspaces** - Top-level containers for projects
- **Projects** - Containers for stories and tests (linked by workspaceId)
- **Stories** - User stories with acceptance criteria (linked by projectId)
- **Test Plans** - Collections of test cases (linked by projectId)
- **Test Cases** - Individual test definitions with steps, preconditions, test data
- **Test Suites** - Grouped test cases for organization

### Component Organization

```
components/
├── features/       # Feature-specific components
│   ├── ai/        # AI generation features
│   ├── stories/   # Story management
│   └── test-cases/# Test case components
├── layout/        # Layout components (sidebar, theme provider)
└── ui/            # Shadcn/Radix UI components (button, card, dialog, etc.)
```

### Styling

- **TailwindCSS v4** with `@tailwindcss/postcss` plugin
- **next-themes** for dark mode support
- **class-variance-authority** and **clsx** for component variants
- **tailwind-merge** for class merging
- Custom utilities: `tw-animate-css` for animations

### Key Features

- **React Compiler** enabled in Next.js config for automatic optimization
- **Lucide React** for icons
- **Recharts** for data visualization
- **Radix UI** components for accessible UI primitives

## Git Workflow

### Commit Message Convention (Enforced by Husky)

All commits MUST follow this format:
```
type: message
```

**Allowed types:**
- `feat` - New features
- `fix` - Bug fixes
- `update` - Updates to existing features
- `debug` - Debugging changes
- `test` - Test-related changes
- `refact` - Refactoring
- `chore` - Maintenance tasks

**Examples:**
```
feat: add login endpoint
update: improve documentation
refact: restructure Twitter schemas
fix: resolve crash on startup
```

The commit-msg hook will reject commits that don't follow this format.

### Branch Information

- Main branch: `main`
- Current feature branch: `feature/integrate-ui`

### Husky Setup

Contributors must install Husky:
```bash
# Check if husky exists
which husky  # Linux
where husky  # Windows

# Install globally if not found
npm install -g husky

# Initialize in project
husky install
```

## Development Notes

### Mock API Data Structure

The `database/db.json` file contains sample data for:
- Workspaces (FinTech Core Team)
- Projects (Mobile Redesign V2, Payment Gateway, Security Audit Q3)
- User stories with acceptance criteria
- Test plans with progress tracking
- Test cases with steps, preconditions, and test data
- Test suites for organizing test cases

### TypeScript Configuration

The project uses TypeScript 5 with strict type checking. Type definitions are defined inline within custom hooks (e.g., `Story`, `TestCase`, `AcceptanceCriteria` interfaces).

### Query Patterns

When working with data, follow the established pattern in hooks:
1. Use `useQuery` for fetching data with queryKey and queryFn
2. Use `useMutation` for create/update/delete operations
3. Invalidate relevant queries in `onSuccess` callbacks
4. Enable queries conditionally with `enabled` flag when dependent on parameters

## Backend API Integration

### Backend Technology Stack

The backend is a **Spring Boot 4.0.2** REST API following **Clean Architecture** and **Hexagonal Architecture** principles:
- Java 21
- PostgreSQL 17.6
- Spring Security with OAuth2 Resource Server (JWT)
- Spring Data JPA with Hibernate
- Spring HATEOAS (Richardson Maturity Model Level 3)
- MapStruct for object mapping

### API Response Standards

**CRITICAL**: All backend API responses follow a strict format that the frontend MUST handle correctly.

#### 1. Wrapped Response Format

Every API response is wrapped in a standard envelope:

```typescript
// Success Response Type
interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  timestamp: string; // ISO-8601 format
}

// Error Response Type
interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  timestamp: string;
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
```

**Example Success Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "_links": {
      "self": { "href": "/api/v1/users/123e4567-e89b-12d3-a456-426614174000" },
      "update": { "href": "/api/v1/users/123e4567-e89b-12d3-a456-426614174000" },
      "delete": { "href": "/api/v1/users/123e4567-e89b-12d3-a456-426614174000" }
    }
  },
  "timestamp": "2026-02-05T10:30:00Z"
}
```

**Example Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email must be valid"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "timestamp": "2026-02-05T10:30:00Z"
}
```

#### 2. HATEOAS Links (Level 3 REST)

All resources include hypermedia links under `_links` property:

```typescript
interface HateoasLink {
  href: string;
  templated?: boolean;
}

interface HateoasLinks {
  self: HateoasLink;
  [relation: string]: HateoasLink;
}

interface HateoasResource<T> {
  // Resource data
  [key: string]: any;
  // HATEOAS links
  _links: HateoasLinks;
}
```

**Required links:**
- `self` - Link to the resource itself
- Action links - `update`, `delete`, `create` based on available operations
- Navigation links - Related resources (e.g., `workspace`, `projects`, `testCases`)

**Frontend handling:**
```typescript
// Extract data and links
const { data } = response.data; // Unwrap from ApiResponse
const resourceData = data;
const links = data._links;

// Use links for navigation/actions
if (links.update) {
  // Show update button
}
if (links.delete) {
  // Show delete button
}
```

#### 3. Pagination Response Format

All list endpoints return paginated responses:

```typescript
interface PageMetadata {
  size: number;        // Items per page
  totalElements: number; // Total items
  totalPages: number;    // Total pages
  number: number;        // Current page (0-indexed)
}

interface PaginatedResponse<T> {
  _embedded: {
    [resourceName: string]: T[];
  };
  _links: {
    self: HateoasLink;
    first?: HateoasLink;
    prev?: HateoasLink;
    next?: HateoasLink;
    last?: HateoasLink;
  };
  page: PageMetadata;
}
```

**Example Paginated Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "_embedded": {
      "users": [
        {
          "userId": "...",
          "email": "user1@example.com",
          "_links": { "self": {...}, "update": {...} }
        },
        {
          "userId": "...",
          "email": "user2@example.com",
          "_links": { "self": {...}, "update": {...} }
        }
      ]
    },
    "_links": {
      "self": { "href": "/api/v1/users?page=0&size=20" },
      "next": { "href": "/api/v1/users?page=1&size=20" },
      "last": { "href": "/api/v1/users?page=5&size=20" }
    },
    "page": {
      "size": 20,
      "totalElements": 100,
      "totalPages": 5,
      "number": 0
    }
  },
  "timestamp": "2026-02-05T10:30:00Z"
}
```

**Pagination Query Parameters:**
- `page` - Page number (0-indexed, default: 0)
- `size` - Items per page (default: 20, max: 100)
- `sort` - Sort field and direction (e.g., `createdAt,desc`)

**Frontend Usage:**
```typescript
// React Query hook with pagination
function useUsers(page = 0, size = 20) {
  return useQuery({
    queryKey: ["users", page, size],
    queryFn: async () => {
      const { data } = await axios.get("/users", {
        params: { page, size, sort: "createdAt,desc" }
      });
      return {
        users: data.data._embedded.users,
        pagination: data.data.page,
        links: data.data._links
      };
    }
  });
}
```

### Authentication & Authorization

#### JWT Token Flow

1. **Login** - POST `/api/v1/auth/login`
   ```json
   Request: { "email": "user@example.com", "password": "password123" }
   Response: {
     "success": true,
     "data": {
       "accessToken": "eyJhbGc...",
       "refreshToken": "eyJhbGc...",
       "expiresIn": 3600
     }
   }
   ```

2. **Token Storage**
   ```typescript
   // Store in localStorage or secure cookie
   localStorage.setItem("accessToken", token);
   ```

3. **Axios Interceptor** (Already configured in `src/lib/axios.ts`)
   ```typescript
   axiosInstance.interceptors.request.use((config) => {
     const token = localStorage.getItem("accessToken");
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```

4. **Token Refresh** (Handle 401 responses)
   ```typescript
   axiosInstance.interceptors.response.use(
     (response) => response,
     async (error) => {
       if (error.response?.status === 401) {
         // Refresh token logic or redirect to login
         window.location.href = "/login";
       }
       return Promise.reject(error);
     }
   );
   ```

### Entity Mapping: Frontend ↔ Backend

#### Backend Domain Model

The backend uses UUID-based IDs and follows this hierarchy:

```
User (UserEntity)
  ↓
Workspace
  ├── WorkspaceMember
  └── Project
      ├── ProjectMember
      └── UserStory
          ├── AcceptanceCriteria
          ├── BusinessRule
          └── TestCase
              └── customFieldsJson (JSONB)
```

#### Entity ID Types

**IMPORTANT**: Backend uses UUIDs, not integers.

```typescript
// Frontend type definitions should use UUID strings
type UUID = string;

interface User {
  userId: UUID;  // Backend: UUID, not number
  email: string;
  status: string;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
}

interface Workspace {
  workspaceId: UUID;
  name: string;
  description: string;
  ownerId: UUID;
  createdAt: string;
}

interface Project {
  projectId: UUID;
  workspaceId: UUID;
  name: string;
  projectKey: string; // e.g., "PROJ"
  jiraSiteId?: string;
  jiraProjectKey?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserStory {
  storyId: UUID;
  projectId: UUID;
  title: string;
  description: string;
  jiraIssueKey?: string; // e.g., "PROJ-123"
  jiraIssueId?: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

interface AcceptanceCriteria {
  criteriaId: UUID;
  storyId: UUID;
  description: string;
  completed: boolean;
  createdAt: string;
}

interface TestCase {
  testCaseId: UUID;
  storyId: UUID;
  title: string;
  description: string;
  preconditions?: string;
  steps?: string;
  expectedResult?: string;
  customFieldsJson?: Record<string, any>; // JSONB field
  generatedByAi: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### Field Naming Conventions

**Backend (Java/JPA):**
- camelCase for JSON properties
- snake_case for database columns
- UUID for all primary keys

**Frontend (TypeScript):**
- camelCase for all properties
- Use same field names as backend JSON response
- Type `UUID` as `string`

### API Integration Best Practices

#### 1. Response Unwrapping

Always unwrap the API response to extract data:

```typescript
// ❌ Wrong - accessing nested data directly
const user = response.data.data.userId;

// ✅ Correct - unwrap in axios instance
axiosInstance.interceptors.response.use(
  (response) => {
    // Auto-unwrap success responses
    if (response.data?.success && response.data?.data) {
      return { ...response, data: response.data.data };
    }
    return response;
  }
);

// Then in hooks:
const { data } = await axios.get("/users/123");
const userId = data.userId; // Direct access
```

#### 2. Error Handling

Handle API errors consistently:

```typescript
// In axios interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.success === false) {
      const apiError = error.response.data;

      // Show error message to user
      if (apiError.errors && apiError.errors.length > 0) {
        // Validation errors
        const errorMessages = apiError.errors
          .map(e => `${e.field}: ${e.message}`)
          .join(", ");
        console.error(errorMessages);
      } else {
        // General error
        console.error(apiError.message);
      }
    }
    return Promise.reject(error);
  }
);
```

#### 3. Type-Safe API Calls

Create typed API functions:

```typescript
// src/lib/api/users.ts
import axios from "@/lib/axios";

export async function getUser(userId: UUID): Promise<User> {
  const { data } = await axios.get<User>(`/users/${userId}`);
  return data;
}

export async function getUsers(params: {
  page?: number;
  size?: number;
  sort?: string;
}): Promise<{ users: User[]; pagination: PageMetadata }> {
  const { data } = await axios.get<PaginatedResponse<User>>("/users", { params });
  return {
    users: data._embedded.users,
    pagination: data.page
  };
}

export async function createUser(userData: CreateUserRequest): Promise<User> {
  const { data } = await axios.post<User>("/users", userData);
  return data;
}
```

#### 4. React Query Integration

Use typed hooks with proper cache management:

```typescript
// src/hooks/use-users.ts
export function useUser(userId: UUID) {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: () => getUser(userId),
    enabled: !!userId,
  });
}

export function useUsers(page = 0, size = 20) {
  return useQuery({
    queryKey: ["users", page, size],
    queryFn: () => getUsers({ page, size }),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

### API Endpoint Structure

Backend API follows RESTful conventions:

```
Base URL: /api/v1

Authentication:
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh

Users:
GET    /users              (paginated)
GET    /users/{userId}
POST   /users
PATCH  /users/{userId}
DELETE /users/{userId}

Workspaces:
GET    /workspaces         (paginated)
GET    /workspaces/{workspaceId}
POST   /workspaces
PATCH  /workspaces/{workspaceId}
DELETE /workspaces/{workspaceId}
GET    /workspaces/{workspaceId}/projects
POST   /workspaces/{workspaceId}/members

Projects:
GET    /projects           (paginated, filterable by workspaceId)
GET    /projects/{projectId}
POST   /projects
PATCH  /projects/{projectId}
DELETE /projects/{projectId}
GET    /projects/{projectId}/stories
POST   /projects/{projectId}/members

User Stories:
GET    /stories            (paginated, filterable by projectId)
GET    /stories/{storyId}
POST   /stories
PATCH  /stories/{storyId}
DELETE /stories/{storyId}
GET    /stories/{storyId}/acceptance-criteria
POST   /stories/{storyId}/test-cases/generate (AI generation)

Test Cases:
GET    /test-cases         (paginated)
GET    /test-cases/{testCaseId}
POST   /test-cases
PATCH  /test-cases/{testCaseId}
DELETE /test-cases/{testCaseId}

Test Plans:
GET    /test-plans         (paginated)
GET    /test-plans/{testPlanId}
POST   /test-plans
PATCH  /test-plans/{testPlanId}
DELETE /test-plans/{testPlanId}

Test Suites:
GET    /test-suites        (paginated)
GET    /test-suites/{testSuiteId}
POST   /test-suites
PATCH  /test-suites/{testSuiteId}
DELETE /test-suites/{testSuiteId}
```

### Migration from Mock API to Backend

When switching from mock API to real backend:

1. **Update Environment Variables**
   ```bash
   # .env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   ```

2. **Update Axios Response Interceptor**
   ```typescript
   // src/lib/axios.ts
   axiosInstance.interceptors.response.use(
     (response) => {
       // Unwrap backend response format
       if (response.data?.success && response.data?.data) {
         return { ...response, data: response.data.data };
       }
       return response;
     }
   );
   ```

3. **Update Type Definitions**
   - Change all ID types from `number` to `UUID` (string)
   - Add HATEOAS `_links` property to resource types
   - Update timestamps to ISO-8601 strings

4. **Update Custom Hooks**
   - Handle pagination metadata
   - Extract data from `_embedded` for list queries
   - Update error handling for wrapped error responses

5. **Remove Mock API**
   ```bash
   # Remove mock-api script from package.json
   # Delete database/db.json (or keep for reference)
   ```
