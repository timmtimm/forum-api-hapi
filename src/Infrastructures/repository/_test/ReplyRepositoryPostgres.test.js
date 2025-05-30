const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const pool = require("../../database/postgres/pool");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");

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

  it("addReply function", async () => {
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
    const addedReply = await replyRepositoryPostgres.addReply({
      content: "Reply Content",
      commentId: "comment-123",
      owner: "user-123",
    });

    expect(addedReply).toHaveProperty("id", "reply-123");
    expect(addedReply).toHaveProperty("content", "Reply Content");
    expect(addedReply).toHaveProperty("owner", "user-123");
  });

  it("verifyReplyAndOwner function should throw NotFoundError when reply is not found", async () => {
    const replyRepositoryPostgres = new ReplyRepositoryPostgres(
      pool,
      () => "123"
    );

    await expect(
      replyRepositoryPostgres.verifyReplyAndOwner("reply-123", "user-123")
    ).rejects.toThrow("balasan tidak ditemukan");
  });

  it("verifyReplyAndOwner function should throw AuthorizationError when owner does not match", async () => {
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

    await expect(
      replyRepositoryPostgres.verifyReplyAndOwner("reply-123", "user-456")
    ).rejects.toThrow("tidak berhak mengakses resource ini");
  });

  it("verifyReplyAndOwner function should return reply when owner matches", async () => {
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
    const reply = await replyRepositoryPostgres.verifyReplyAndOwner(
      "reply-123",
      "user-123"
    );
    expect(reply).toHaveProperty("id", "reply-123");
    expect(reply).toHaveProperty("owner", "user-123");
  });

  it("softDeleteReply function should throw NotFoundError when reply is not found", async () => {
    const replyRepositoryPostgres = new ReplyRepositoryPostgres(
      pool,
      () => "123"
    );

    await expect(
      replyRepositoryPostgres.softDeleteReply("reply-123")
    ).rejects.toThrow("balasan tidak ditemukan");
  });

  it("softDeleteReply function should successfully delete a reply", async () => {
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
    await replyRepositoryPostgres.softDeleteReply("reply-123");

    const reply = await RepliesTableTestHelper.findReplyById("reply-123");
    expect(reply.is_deleted).toBe(true);
  });

  it("getRepliesByCommentId function should return empty array when no replies found", async () => {
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
    const replies = await replyRepositoryPostgres.getRepliesByCommentId(
      "comment-123"
    );

    expect(replies).toEqual([]);
  });

  it("getRepliesByCommentId function should return replies ordered by date", async () => {
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
    const replies = await replyRepositoryPostgres.getRepliesByCommentId(
      "comment-123"
    );

    expect(replies).toHaveLength(2);
    expect(replies[0]).toHaveProperty("id", "reply-123");
    expect(replies[0]).toHaveProperty("content", "Reply Content 1");
    expect(replies[1]).toHaveProperty("id", "reply-124");
    expect(replies[1]).toHaveProperty("content", "Reply Content 2");
  });

  it("verifyCommentReplyAndOwner function should throw NotFoundError when reply is not found", async () => {
    const replyRepositoryPostgres = new ReplyRepositoryPostgres(
      pool,
      () => "123"
    );

    await expect(
      replyRepositoryPostgres.verifyCommentReplyAndOwner(
        "comment-123",
        "reply-123",
        "user-123"
      )
    ).rejects.toThrow("balasan tidak ditemukan");
  });

  it("verifyCommentReplyAndOwner function should throw AuthorizationError when owner does not match", async () => {
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

    await expect(
      replyRepositoryPostgres.verifyCommentReplyAndOwner(
        "comment-123",
        "reply-123",
        "user-456"
      )
    ).rejects.toThrow("tidak berhak mengakses resource ini");
  });

  it("verifyCommentReplyAndOwner function should return reply when owner matches", async () => {
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
    await replyRepositoryPostgres.verifyCommentReplyAndOwner(
      "comment-123",
      "reply-123",
      "user-123"
    );
  });
});
