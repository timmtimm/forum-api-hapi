const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const pool = require("../../database/postgres/pool");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const CreateComment = require("../../../Domains/comments/entities/CreateComment");
const CreatedComment = require("../../../Domains/comments/entities/CreatedComment");

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
      const payload = new CreateComment({
        content: "a content",
        owner: "user-123",
        threadId: "thread-123",
      });
      const expectComment = new CreatedComment({
        id: "comment-123",
        content: payload.content,
        owner: payload.owner,
      });
      const expectCommentByFindId = {
        ...expectComment,
        thread_id: payload.threadId,
        is_deleted: false,
      };
      await UsersTableTestHelper.addUser({ id: payload.owner });
      await ThreadsTableTestHelper.addThread({ id: payload.threadId });
      const fakeIdGenerator = () => "123"; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const useCaseResult = await commentRepositoryPostgres.addComment(payload);

      // Assert
      expect(useCaseResult).toStrictEqual(expectComment);

      const commentByFindId = await CommentsTableTestHelper.findCommentById(
        "comment-123"
      );
      expectCommentByFindId.date = commentByFindId.date;
      expect(commentByFindId).toStrictEqual(expectCommentByFindId);
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
      ).rejects.toThrow(NotFoundError);
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
      ).rejects.toThrow(AuthorizationError);
    });

    it("should return comment correctly when the owner is the same as the comment owner", async () => {
      // Arrange
      const commentId = "comment-123";
      const owner = "user-123";
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({ id: commentId, owner });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAndOwner(commentId, owner)
      ).resolves.not.toThrow(NotFoundError);
      await expect(
        commentRepositoryPostgres.verifyCommentAndOwner(commentId, owner)
      ).resolves.not.toThrow(AuthorizationError);
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
      ).rejects.toThrow(NotFoundError);
    });

    it("should soft delete comment correctly", async () => {
      // Arrange
      const commentId = "comment-123";
      const expectComment = {
        id: commentId,
        content: "a comment",
        owner: "user-123",
        thread_id: "thread-123",
        is_deleted: true,
      };
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({ id: commentId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.softDeleteComment(commentId);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById(commentId);
      expectComment.date = comment.date;
      expect(comment).toStrictEqual(expectComment);
    });
  });

  describe("verifyCommentExists function", () => {
    it("should throw NotFoundError when comment is not found", async () => {
      // Arrange
      const commentId = "comment-123";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentExists(commentId)
      ).rejects.toThrow(NotFoundError);
    });

    it("should not throw error when comment exists", async () => {
      // Arrange
      const commentId = "comment-123";
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId: "thread-123",
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentExists(commentId)
      ).resolves.not.toThrow(NotFoundError);
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
      expect(comments).toStrictEqual([]);
    });

    it("should return comments correctly when comments exist for the thread", async () => {
      // Arrange
      const threadId = "thread-123";
      const expectComment = {
        id: "comment-123",
        content: "a comment",
        owner: "user-123",
        thread_id: threadId,
        is_deleted: false,
      };
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment({ id: "comment-123", threadId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        threadId
      );

      // Assert
      expectComment.date = comments[0].date;
      expect(comments).toHaveLength(1);
      expect(comments[0]).toStrictEqual(expectComment);
    });
  });

  describe("verifyCommentAndThreadExists function", () => {
    it("should throw NotFoundError when comment is not found in the thread", async () => {
      // Arrange
      const commentId = "comment-123";
      const threadId = "thread-123";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId });

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAndThreadExists(
          commentId,
          "other-thread"
        )
      ).rejects.toThrow(NotFoundError);
    });

    it("function should return comment when it exists in the thread", async () => {
      // Arrange
      const commentId = "comment-123";
      const threadId = "thread-123";
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAndThreadExists(
          commentId,
          threadId
        )
      ).resolves.not.toThrow(NotFoundError);
    });
  });
});

module.exports = CommentRepositoryPostgres;
