import swaggerUi from "swagger-ui-express";

const idParam = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string" },
  description: "Ticket id",
};

const jsonBody = (schema, example) => ({
  required: true,
  content: { "application/json": { schema, example } },
});

const errorResponse = {
  description: "Error",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
    },
  },
};

const spec = {
  openapi: "3.0.3",
  info: {
    title: "Support Ticket System API",
    version: "1.0.0",
    description:
      "REST API for the AI-powered support ticket system. Authenticate with the JWT returned from /api/auth/login and send it as `Authorization: Bearer <token>`.",
  },
  servers: [{ url: "/", description: "Current server" }],
  tags: [
    { name: "Auth", description: "Registration and login" },
    { name: "Tickets", description: "Ticket lifecycle" },
    { name: "Comments", description: "Ticket comments" },
    { name: "Users", description: "User directory" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Error: {
        type: "object",
        properties: { message: { type: "string" } },
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          role: { type: "string", enum: ["customer", "agent", "admin"] },
        },
      },
      Ticket: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          status: {
            type: "string",
            enum: ["Open", "In Progress", "Resolved", "Closed"],
          },
          priority: {
            type: "string",
            enum: ["Low", "Medium", "High", "Urgent"],
          },
          category: { type: "string" },
          aiSuggestedCategory: { type: "string" },
          aiSuggestedPriority: { type: "string" },
          createdBy: { $ref: "#/components/schemas/User" },
          assignedTo: {
            nullable: true,
            allOf: [{ $ref: "#/components/schemas/User" }],
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Comment: {
        type: "object",
        properties: {
          _id: { type: "string" },
          ticket: { type: "string" },
          user: { $ref: "#/components/schemas/User" },
          message: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Activity: {
        type: "object",
        properties: {
          _id: { type: "string" },
          ticket: { type: "string" },
          actor: { $ref: "#/components/schemas/User" },
          action: {
            type: "string",
            enum: [
              "created",
              "assigned",
              "reassigned",
              "unassigned",
              "status_changed",
            ],
          },
          meta: { type: "object", additionalProperties: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      PaginatedTickets: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/Ticket" },
          },
          total: { type: "integer" },
          page: { type: "integer" },
          limit: { type: "integer" },
          pages: { type: "integer" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/api/health": {
      get: {
        tags: ["Auth"],
        summary: "Health check",
        security: [],
        responses: {
          200: {
            description: "Server is running",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string" } },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new customer account",
        security: [],
        requestBody: jsonBody(
          {
            type: "object",
            required: ["name", "email", "password"],
            properties: {
              name: { type: "string" },
              email: { type: "string", format: "email" },
              password: { type: "string", minLength: 6 },
            },
          },
          {
            name: "Jane Doe",
            email: "jane@example.com",
            password: "secret123",
          }
        ),
        responses: {
          201: {
            description: "Registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          400: errorResponse,
          409: errorResponse,
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in and receive a JWT",
        security: [],
        requestBody: jsonBody(
          {
            type: "object",
            required: ["email", "password"],
            properties: {
              email: { type: "string", format: "email" },
              password: { type: "string" },
            },
          },
          { email: "customer@example.com", password: "123456" }
        ),
        responses: {
          200: {
            description: "Logged in",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          401: errorResponse,
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get the current user",
        responses: {
          200: {
            description: "Current user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: errorResponse,
        },
      },
    },
    "/api/tickets": {
      get: {
        tags: ["Tickets"],
        summary: "List tickets (paginated, searchable, sortable)",
        parameters: [
          { name: "q", in: "query", schema: { type: "string" } },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["Open", "In Progress", "Resolved", "Closed"],
            },
          },
          {
            name: "priority",
            in: "query",
            schema: {
              type: "string",
              enum: ["Low", "Medium", "High", "Urgent"],
            },
          },
          { name: "category", in: "query", schema: { type: "string" } },
          {
            name: "sort",
            in: "query",
            schema: {
              type: "string",
              enum: ["newest", "oldest", "updated", "priority", "title"],
            },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          200: {
            description: "Paginated tickets",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedTickets" },
              },
            },
          },
          401: errorResponse,
        },
      },
      post: {
        tags: ["Tickets"],
        summary: "Create a ticket (customer only, AI classifies category/priority)",
        requestBody: jsonBody(
          {
            type: "object",
            required: ["title", "description"],
            properties: {
              title: { type: "string" },
              description: { type: "string" },
            },
          },
          {
            title: "Cannot log in",
            description: "I get an error every time I try to log in.",
          }
        ),
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Ticket" },
              },
            },
          },
          403: errorResponse,
        },
      },
    },
    "/api/tickets/improve": {
      post: {
        tags: ["Tickets"],
        summary: "Rewrite a ticket draft (customer only, AI polish)",
        description:
          "Fixes spelling and grammar and makes the ticket clearer. Returns suggested title and description without saving anything.",
        requestBody: jsonBody(
          {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
            },
          },
          {
            title: "loggin problem",
            description: "cant login to my account plz help",
          }
        ),
        responses: {
          200: {
            description: "Improved draft",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                  },
                },
              },
            },
          },
          400: errorResponse,
          403: errorResponse,
        },
      },
    },
    "/api/tickets/stats": {
      get: {
        tags: ["Tickets"],
        summary: "Aggregated ticket statistics",
        responses: {
          200: {
            description: "Stats",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    total: { type: "integer" },
                    byStatus: { type: "object", additionalProperties: { type: "integer" } },
                    byPriority: { type: "object", additionalProperties: { type: "integer" } },
                    byCategory: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          category: { type: "string" },
                          count: { type: "integer" },
                        },
                      },
                    },
                    trend: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          date: { type: "string" },
                          count: { type: "integer" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/tickets/{id}": {
      get: {
        tags: ["Tickets"],
        summary: "Get a ticket by id",
        parameters: [idParam],
        responses: {
          200: {
            description: "Ticket",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Ticket" },
              },
            },
          },
          403: errorResponse,
          404: errorResponse,
        },
      },
    },
    "/api/tickets/{id}/status": {
      patch: {
        tags: ["Tickets"],
        summary: "Update ticket status (agent only, validated transitions)",
        parameters: [idParam],
        requestBody: jsonBody(
          {
            type: "object",
            required: ["status"],
            properties: {
              status: {
                type: "string",
                enum: ["Open", "In Progress", "Resolved", "Closed"],
              },
            },
          },
          { status: "In Progress" }
        ),
        responses: {
          200: {
            description: "Updated ticket",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Ticket" },
              },
            },
          },
          400: errorResponse,
          403: errorResponse,
        },
      },
    },
    "/api/tickets/{id}/assign": {
      patch: {
        tags: ["Tickets"],
        summary: "Assign or unassign a ticket (agent only)",
        parameters: [idParam],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  assignedTo: {
                    type: "string",
                    nullable: true,
                    description:
                      "Agent user id, or null to unassign. Omit to assign to yourself.",
                  },
                },
              },
              example: { assignedTo: "652f1c2b9d3e4f5a6b7c8d9e" },
            },
          },
        },
        responses: {
          200: {
            description: "Updated ticket",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Ticket" },
              },
            },
          },
          400: errorResponse,
          403: errorResponse,
        },
      },
    },
    "/api/tickets/{id}/activity": {
      get: {
        tags: ["Tickets"],
        summary: "Get the activity timeline for a ticket",
        parameters: [idParam],
        responses: {
          200: {
            description: "Timeline",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Activity" },
                },
              },
            },
          },
          403: errorResponse,
        },
      },
    },
    "/api/tickets/{id}/comments": {
      get: {
        tags: ["Comments"],
        summary: "List comments for a ticket",
        parameters: [idParam],
        responses: {
          200: {
            description: "Comments",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Comment" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Comments"],
        summary: "Add a comment",
        parameters: [idParam],
        requestBody: jsonBody(
          {
            type: "object",
            required: ["message"],
            properties: { message: { type: "string" } },
          },
          { message: "We are looking into this." }
        ),
        responses: {
          201: {
            description: "Created comment",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Comment" },
              },
            },
          },
        },
      },
    },
    "/api/users/agents": {
      get: {
        tags: ["Users"],
        summary: "List all agents (agent or admin)",
        responses: {
          200: {
            description: "Agents",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
          403: errorResponse,
        },
      },
      post: {
        tags: ["Users"],
        summary: "Create an agent account (admin only)",
        requestBody: jsonBody(
          {
            type: "object",
            required: ["name", "email", "password"],
            properties: {
              name: { type: "string" },
              email: { type: "string", format: "email" },
              password: { type: "string", minLength: 6 },
            },
          },
          {
            name: "Jane Agent",
            email: "jane.agent@example.com",
            password: "secret123",
          }
        ),
        responses: {
          201: {
            description: "Created agent",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          400: errorResponse,
          403: errorResponse,
          409: errorResponse,
        },
      },
    },
  },
};

const setupSwagger = (app) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(spec, {
      customSiteTitle: "Support Ticket System API",
    })
  );
};

export default setupSwagger;
