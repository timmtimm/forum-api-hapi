const pool = require("../../database/postgres/pool");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UserTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");
const EndpointTestHelper = require("../../../../tests/EndpointTestHelper");

describe("/threads/{threadId}/comments endpoint", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UserTableTestHelper.cleanTable();
  });

  describe("when POST /threads/{threadId}/comments", () => {
    it("should respond with 400 when request payload not meet data type specification", async () => {
      const server = await createServer(container);
      const { accessToken } = await EndpointTestHelper.generateAccessToken(
        server
      );
      const requestPayload = { content: null };
      await UserTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      const response = await server.inject({
        method: "POST",
        url: `/threads/thread-123/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada"
      );
    });

    it("should respond with 404 when thread is not found", async () => {
      const server = await createServer(container);
      const { accessToken } = await EndpointTestHelper.generateAccessToken(
        server
      );
      const requestPayload = { content: "a comment" };
      await UserTableTestHelper.addUser({ id: "user-123" });
      const response = await server.inject({
        method: "POST",
        url: `/threads/thread-123/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("Thread tidak ditemukan");
    });

    it("should respond with 201 and persisted thread", async () => {
      const server = await createServer(container);
      const { accessToken } = await EndpointTestHelper.generateAccessToken(
        server
      );
      const requestPayload = { content: "a comment" };
      await UserTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      const response = await server.inject({
        method: "POST",
        url: `/threads/thread-123/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedComment).toBeDefined();
    });
  });
});
