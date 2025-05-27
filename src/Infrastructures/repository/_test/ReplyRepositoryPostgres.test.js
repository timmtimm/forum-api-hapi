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

  // it("addReply function", async () => {
  //   await UsersTableTestHelper.addUser({ username: "dicoding" });
  //   await ThreadsTableTestHelper.addThread({
  //     title: "Thread Title",
  //     owner: "user-123",
  //   });
  //   await CommentsTableTestHelper.addComment({
  //     content: "Comment Content",
  //     threadId: "thread-123",
  //     owner: "user-123",
  //   });

  //   const replyRepositoryPostgres = new ReplyRepositoryPostgres(
  //     pool,
  //     () => "123"
  //   );
  //   const addedReply = await replyRepositoryPostgres.addReply({
  //     content: "Reply Content",
  //     commentId: "comment-123",
  //     owner: "user-123",
  //   });

  //   expect(addedReply).toHaveProperty("id", "reply-123");
  //   expect(addedReply).toHaveProperty("content", "Reply Content");
  //   expect(addedReply).toHaveProperty("owner", "user-123");
  // });
});
