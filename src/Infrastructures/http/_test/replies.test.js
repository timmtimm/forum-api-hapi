const pool = require("../../database/postgres/pool");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UserTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");
const EndpointTestHelper = require("../../../../tests/EndpointTestHelper");

describe("/replies endpoint", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UserTableTestHelper.cleanTable();
  });

  describe("when POST /threads/{threadId}/comments/{commentId}/replies", () => {
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
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });
      const response = await server.inject({
        method: "POST",
        url: `/threads/thread-123/comments/comment-123/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada"
      );
    });

    it("should respond with 404 when comment is not found", async () => {
      const server = await createServer(container);
      const { accessToken } = await EndpointTestHelper.generateAccessToken(
        server
      );
      const requestPayload = { content: "a reply" };
      await UserTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      const response = await server.inject({
        method: "POST",
        url: `/threads/thread-123/comments/comment-123/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "komentar tidak ditemukan pada thread ini"
      );
    });

    it("should respond with 201 and persisted reply", async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken } = await EndpointTestHelper.generateAccessToken(
        server
      );

      const requestPayload = { content: "a reply" };
      await UserTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });

      const response = await server.inject({
        method: "POST",
        url: `/threads/thread-123/comments/comment-123/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedReply).toBeDefined();
    });
  });

  describe("when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}", () => {
    it("should respond with 404 when thread is not found", async () => {
      const server = await createServer(container);
      const { accessToken } = await EndpointTestHelper.generateAccessToken(
        server
      );
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/thread-123/comments/comment-123/replies/reply-123`,
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
      await UserTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/thread-123/comments/comment-123/replies/reply-123`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "komentar tidak ditemukan pada thread ini"
      );
    });

    it("should respond with 404 when reply is not found", async () => {
      const server = await createServer(container);
      const { accessToken } = await EndpointTestHelper.generateAccessToken(
        server
      );
      await UserTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/thread-123/comments/comment-123/replies/reply-123`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("balasan tidak ditemukan");
    });

    it("should respond 200 and delete the reply", async () => {
      const server = await createServer(container);
      const { accessToken, owner } =
        await EndpointTestHelper.generateAccessToken(server);
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner,
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner,
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        threadId: "thread-123",
        commentId: "comment-123",
        owner,
      });

      const response = await server.inject({
        method: "DELETE",
        url: `/threads/thread-123/comments/comment-123/replies/reply-123`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.message).toEqual("Balasan berhasil dihapus");

      const reply = await RepliesTableTestHelper.findReplyById("reply-123");
      expect(reply.is_deleted).toEqual(true);
    });
  });
});
