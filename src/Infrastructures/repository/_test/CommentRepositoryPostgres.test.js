const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const pool = require("../../database/postgres/pool");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");

describe("CommentRepositoryPostgres", () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addComment function", () => {
    it("should persist add comment and return added comment correctly", async () => {
      // Arrange
      const payload = {
        content: "a content",
        owner: "user-123",
        threadId: "thread-123",
      };
      await UsersTableTestHelper.addUser({ id: payload.owner });
      await ThreadsTableTestHelper.addThread({ id: payload.threadId });
      const fakeIdGenerator = () => "123"; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await commentRepositoryPostgres.addComment(payload);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById(
        "comment-123"
      );
      expect(comment.thread_id).toBe(payload.threadId);
    });
  });

  describe("verifyCommentAndOwner function", () => {
    it("should throw NotFoundError when comment is not found", async () => {
      // Arrange
      const commentId = "comment-123";
      const owner = "user-123";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAndOwner(commentId, owner)
      ).rejects.toThrow("komentar tidak ditemukan");
    });

    it("should throw AuthorizationError when owner is not the same as the comment owner", async () => {
      // Arrange
      const commentId = "comment-123";
      const owner = "user-123";
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({ id: commentId, owner });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAndOwner(commentId, "other-user")
      ).rejects.toThrow("tidak berhak mengakses resource ini");
    });

    it("should return comment correctly when the owner is the same as the comment owner", async () => {
      // Arrange
      const commentId = "comment-123";
      const owner = "user-123";
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({ id: commentId, owner });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const result = await commentRepositoryPostgres.verifyCommentAndOwner(
        commentId,
        owner
      );

      // Assert
      expect(result).toEqual({
        id: commentId,
        owner,
      });
    });
  });

  describe("softDeleteComment function", () => {
    it("should throw NotFoundError when comment is not found", async () => {
      // Arrange
      const commentId = "comment-123";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.softDeleteComment(commentId)
      ).rejects.toThrow("komentar tidak ditemukan");
    });

    it("should soft delete comment correctly", async () => {
      // Arrange
      const commentId = "comment-123";
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({ id: commentId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.softDeleteComment(commentId);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById(commentId);
      expect(comment.is_deleted).toEqual(true);
    });
  });

  describe("getCommentsByThreadId function", () => {
    it("should return empty array when no comments found for the thread", async () => {
      // Arrange
      const threadId = "thread-123";
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        threadId
      );

      // Assert
      expect(comments).toEqual([]);
    });

    it("should return comments correctly when comments exist for the thread", async () => {
      // Arrange
      const threadId = "thread-123";
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment({ id: "comment-123", threadId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        threadId
      );

      // Assert
      expect(comments).toHaveLength(1);
      expect(comments[0].thread_id).toBe(threadId);
    });
  });
});

module.exports = CommentRepositoryPostgres;
