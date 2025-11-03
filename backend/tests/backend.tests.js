import request from 'supertest';
import  app  from '../server.js';

describe('Backend API Tests', () => {
  let authToken;
  let testTaskId;

  let server;

beforeAll(async () => {
  server = app.listen(5001); 
});

afterAll(async () => {
  await server.close();
});

  // Test 1: Health check endpoint
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  // Test 2: User registration
  describe('POST /register', () => {
    it('should register new user with valid data', async () => {
      const testUser = {
        login: `testuser_${Date.now()}`,
        password: 'password123'
      };

      const response = await request(app)
        .post('/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body.user).toHaveProperty('login', testUser.login);
    });

    it('should return 400 for invalid registration data', async () => {
      const invalidUser = {
        login: 'ab', // Too short
        password: '123' // Too short
      };

      const response = await request(app)
        .post('/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('fieldErrors');
    });

    it('should return 409 for duplicate login', async () => {
      const duplicateUser = {
        login: 'duplicateuser',
        password: 'password123'
      };

      // First registration
      await request(app)
        .post('/register')
        .send(duplicateUser)
        .expect(201);

      // Second registration with same login
      const response = await request(app)
        .post('/register')
        .send(duplicateUser)
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Conflict');
    });
  });

  // Test 3: User login
  describe('POST /login', () => {
    const testUser = {
      login: 'logintestuser',
      password: 'password123'
    };

    beforeAll(async () => {
      // Create user for login tests
      await request(app)
        .post('/register')
        .send(testUser);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send(testUser)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      
      authToken = response.body.token; // Save token for protected routes
    });

    it('should return 401 for invalid credentials', async () => {
      await request(app)
        .post('/login')
        .send({
          login: testUser.login,
          password: 'wrongpassword'
        })
        .expect(401);
    });
  });

  // Test 4: Protected tasks endpoints
  describe('Tasks CRUD operations', () => {
    it('should return 401 without token', async () => {
      await request(app)
        .get('/tasks')
        .expect(401);
    });

    it('should create new task with valid token', async () => {
      const newTask = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'PENDING'
      };

      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTask)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newTask.title);
      
      testTaskId = response.body.id; // Save for update/delete tests
    });

    it('should return tasks for authenticated user', async () => {
      const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 404 for non-existent task', async () => {
      await request(app)
        .get('/tasks/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should update existing task', async () => {
      const updatedTask = {
        title: 'Updated Task Title',
        description: 'Updated Description',
        status: 'COMPLETED'
      };

      const response = await request(app)
        .put(`/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedTask)
        .expect(200);

      expect(response.body.title).toBe(updatedTask.title);
      expect(response.body.status).toBe(updatedTask.status);
    });

    it('should delete task', async () => {
      await request(app)
        .delete(`/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  // Test 5: Validation errors
  describe('Validation tests', () => {
    it('should return 400 for invalid task data', async () => {
      const invalidTask = {
        title: '', // Empty title
        description: 'a'.repeat(1001) // Too long description
      };

      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTask)
        .expect(400);

      expect(response.body).toHaveProperty('fieldErrors');
    });
  });
});