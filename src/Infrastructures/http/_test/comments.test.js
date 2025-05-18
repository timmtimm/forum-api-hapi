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
      expect(responseJson.message).toEqual("thread tidak ditemukan");
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

  describe("when DELETE /threads/{threadId}/comments/{commentId}", () => {
    it("should respond with 404 when thread is not found", async () => {
      const server = await createServer(container);
      const { accessToken } = await EndpointTestHelper.generateAccessToken(
        server
      );
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/thread-123/comments/comment-123`,
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("thread tidak ditemukan");
    });

    it("should respond with 404 when comment is not found", async () => {
      const server = await createServer(container);
      const { accessToken } = await EndpointTestHelper.generateAccessToken(
        server
      );
      const requestPayload = { content: "a comment" };
      await UserTableTestHelper.addUser({ id: "user_123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user_123",
      });
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/thread-123/comments/comment-123`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("komentar tidak ditemukan");
    });

    it("should respond with 403 when user is not the owner of the comment", async () => {
      const server = await createServer(container);
      const { accessToken } = await EndpointTestHelper.generateAccessToken(
        server
      );
      const requestPayload = { content: "a comment" };
      await UserTableTestHelper.addUser({
        id: "user-123",
        username: "user123",
      });
      await UserTableTestHelper.addUser({
        id: "user-456",
        username: "user456",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        owner: "user-123",
        threadId: "thread-123",
      });
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/thread-123/comments/comment-123`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak berhak mengakses resource ini"
      );
    });
  });
});
