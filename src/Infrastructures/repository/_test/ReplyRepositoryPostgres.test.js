const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const pool = require("../../database/postgres/pool");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const CreateReply = require("../../../Domains/replies/entities/CreateReply");
const CreatedReply = require("../../../Domains/replies/entities/CreatedReply");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("ReplyRepositoryPostgres", () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addReply function", () => {
    it("should return created reply correctly", async () => {
      // Arrange
      const payload = new CreateReply({
        threadId: "thread-123",
        commentId: "comment-123",
        content: "Reply Content",
        owner: "user-123",
      });

      const expectReply = new CreatedReply({
        id: "reply-123",
        content: "Reply Content",
        owner: "user-123",
      });

      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        title: "Thread Title",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        content: "Comment Content",
        threadId: "thread-123",
        owner: "user-123",
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        () => "123"
      );

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(payload);

      // Assert
      expect(addedReply).toStrictEqual(expectReply);
    });
  });

  it("verifyReplyAndOwner function should throw NotFoundError when reply is not found", async () => {
    // Arrange
    const replyRepositoryPostgres = new ReplyRepositoryPostgres(
      pool,
      () => "123"
    );

    // Action & Assert
    await expect(
      replyRepositoryPostgres.verifyReplyAndOwner("reply-123", "user-123")
    ).rejects.toThrow(NotFoundError);
  });

  it("verifyReplyAndOwner function should throw AuthorizationError when owner does not match", async () => {
    // Arrange
    await UsersTableTestHelper.addUser({
      id: "user-123",
      username: "dicoding",
    });
    await ThreadsTableTestHelper.addThread({
      title: "Thread Title",
      owner: "user-123",
    });
    await CommentsTableTestHelper.addComment({
      content: "Comment Content",
      threadId: "thread-123",
      owner: "user-123",
    });
    await RepliesTableTestHelper.addReply({
      id: "reply-123",
      content: "Reply Content",
      commentId: "comment-123",
      owner: "user-123",
    });

    const replyRepositoryPostgres = new ReplyRepositoryPostgres(
      pool,
      () => "123"
    );

    // Action & Assert
    await expect(
      replyRepositoryPostgres.verifyReplyAndOwner("reply-123", "user-456")
    ).rejects.toThrow(AuthorizationError);
  });

  it("verifyReplyAndOwner function should return reply when owner matches", async () => {
    // Arrange
    await UsersTableTestHelper.addUser({
      id: "user-123",
      username: "dicoding",
    });
    await ThreadsTableTestHelper.addThread({
      title: "Thread Title",
      owner: "user-123",
    });
    await CommentsTableTestHelper.addComment({
      content: "Comment Content",
      threadId: "thread-123",
      owner: "user-123",
    });
    await RepliesTableTestHelper.addReply({
      id: "reply-123",
      content: "Reply Content",
      commentId: "comment-123",
      owner: "user-123",
    });
    const replyRepositoryPostgres = new ReplyRepositoryPostgres(
      pool,
      () => "123"
    );

    // Action
    const reply = await replyRepositoryPostgres.verifyReplyAndOwner(
      "reply-123",
      "user-123"
    );

    // Assert
    expect(reply).toHaveProperty("id", "reply-123");
    expect(reply).toHaveProperty("owner", "user-123");
  });

  it("softDeleteReply function should throw NotFoundError when reply is not found", async () => {
    // Arrange
    const replyRepositoryPostgres = new ReplyRepositoryPostgres(
      pool,
      () => "123"
    );

    // Action & Assert
    await expect(
      replyRepositoryPostgres.softDeleteReply("reply-123")
    ).rejects.toThrow(NotFoundError);
  });

  it("softDeleteReply function should successfully delete a reply", async () => {
    // Arrange
    await UsersTableTestHelper.addUser({
      id: "user-123",
      username: "dicoding",
    });
    await ThreadsTableTestHelper.addThread({
      title: "Thread Title",
      owner: "user-123",
    });
    await CommentsTableTestHelper.addComment({
      content: "Comment Content",
      threadId: "thread-123",
      owner: "user-123",
    });
    await RepliesTableTestHelper.addReply({
      id: "reply-123",
      content: "Reply Content",
      commentId: "comment-123",
      owner: "user-123",
    });

    const replyRepositoryPostgres = new ReplyRepositoryPostgres(
      pool,
      () => "123"
    );

    // Action
    await replyRepositoryPostgres.softDeleteReply("reply-123");

    // Assert
    const reply = await RepliesTableTestHelper.findReplyById("reply-123");
    expect(reply.is_deleted).toBe(true);
  });

  it("getRepliesByCommentId function should return empty array when no replies found", async () => {
    // Arrange
    await UsersTableTestHelper.addUser({
      id: "user-123",
      username: "dicoding",
    });
    await ThreadsTableTestHelper.addThread({
      title: "Thread Title",
      owner: "user-123",
    });
    await CommentsTableTestHelper.addComment({
      content: "Comment Content",
      threadId: "thread-123",
      owner: "user-123",
    });

    const replyRepositoryPostgres = new ReplyRepositoryPostgres(
      pool,
      () => "123"
    );

    // Action
    const replies = await replyRepositoryPostgres.getRepliesByCommentId(
      "comment-123"
    );

    // Assert
    expect(replies).toStrictEqual([]);
  });

  it("getRepliesByCommentId function should return replies ordered by date", async () => {
    // Arrange
    await UsersTableTestHelper.addUser({
      id: "user-123",
      username: "dicoding",
    });
    await ThreadsTableTestHelper.addThread({
      title: "Thread Title",
      owner: "user-123",
    });
    await CommentsTableTestHelper.addComment({
      content: "Comment Content",
      threadId: "thread-123",
      owner: "user-123",
    });
    await RepliesTableTestHelper.addReply({
      id: "reply-123",
      content: "Reply Content 1",
      commentId: "comment-123",
      owner: "user-123",
      date: new Date("2023-01-01T00:00:00.000Z"),
    });
    await RepliesTableTestHelper.addReply({
      id: "reply-124",
      content: "Reply Content 2",
      commentId: "comment-123",
      owner: "user-123",
      date: new Date("2023-01-02T00:00:00.000Z"),
    });

    const replyRepositoryPostgres = new ReplyRepositoryPostgres(
      pool,
      () => "123"
    );

    // Action
    const replies = await replyRepositoryPostgres.getRepliesByCommentId(
      "comment-123"
    );

    // Assert
    expect(replies).toHaveLength(2);
    expect(replies[0]).toStrictEqual({
      id: "reply-123",
      content: "Reply Content 1",
      owner: "user-123",
      date: replies[0].date,
      is_deleted: false,
      comment_id: "comment-123",
    });
    expect(replies[1]).toStrictEqual({
      id: "reply-124",
      content: "Reply Content 2",
      owner: "user-123",
      date: replies[1].date,
      is_deleted: false,
      comment_id: "comment-123",
    });
  });

  it("verifyCommentReplyAndOwner function should throw NotFoundError when reply is not found", async () => {
    // Arrange
    const replyRepositoryPostgres = new ReplyRepositoryPostgres(
      pool,
      () => "123"
    );

    // Action & Assert
    await expect(
      replyRepositoryPostgres.verifyCommentReplyAndOwner(
        "comment-123",
        "reply-123",
        "user-123"
      )
    ).rejects.toThrow(NotFoundError);
  });

  it("verifyCommentReplyAndOwner function should throw AuthorizationError when owner does not match", async () => {
    // Arrange
    await UsersTableTestHelper.addUser({
      id: "user-123",
      username: "dicoding",
    });
    await ThreadsTableTestHelper.addThread({
      title: "Thread Title",
      owner: "user-123",
    });
    await CommentsTableTestHelper.addComment({
      content: "Comment Content",
      threadId: "thread-123",
      owner: "user-123",
    });
    await RepliesTableTestHelper.addReply({
      id: "reply-123",
      content: "Reply Content",
      commentId: "comment-123",
      owner: "user-123",
    });

    const replyRepositoryPostgres = new ReplyRepositoryPostgres(
      pool,
      () => "123"
    );

    // Action & Assert
    await expect(
      replyRepositoryPostgres.verifyCommentReplyAndOwner(
        "comment-123",
        "reply-123",
        "user-456"
      )
    ).rejects.toThrow(AuthorizationError);
  });

  it("verifyCommentReplyAndOwner function should return reply when owner matches", async () => {
    // Arrange
    await UsersTableTestHelper.addUser({
      id: "user-123",
      username: "dicoding",
    });
    await ThreadsTableTestHelper.addThread({
      title: "Thread Title",
      owner: "user-123",
    });
    await CommentsTableTestHelper.addComment({
      content: "Comment Content",
      threadId: "thread-123",
      owner: "user-123",
    });
    await RepliesTableTestHelper.addReply({
      id: "reply-123",
      content: "Reply Content",
      commentId: "comment-123",
      owner: "user-123",
    });

    const replyRepositoryPostgres = new ReplyRepositoryPostgres(
      pool,
      () => "123"
    );

    // Action & Assert
    await expect(
      replyRepositoryPostgres.verifyCommentReplyAndOwner(
        "comment-123",
        "reply-123",
        "user-123"
      )
    ).resolves.not.toThrow(NotFoundError);
  });
});
