const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const pool = require("../../database/postgres/pool");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");

describe("ThreadRepositoryPostgres", () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addThread function", () => {
    it("should persist add thread and return added thread correctly", async () => {
      // Arrange
      const payload = {
        title: "a title",
        body: "a body",
        owner: "user-123",
      };

      const expectThread = {
        id: "thread-123",
        title: payload.title,
        body: payload.body,
        owner: payload.owner,
      };
      await UsersTableTestHelper.addUser({ id: payload.owner });
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      await threadRepositoryPostgres.addThread(payload);

      // Action
      const thread = await threadRepositoryPostgres.findById("thread-123");
      expectThread.date = thread.date;

      // Assert
      expect(thread).toEqual(expectThread);
    });
  });

  describe("findById function", () => {
    it("should return not found thread", async () => {
      // Arrange
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action & Assert
      await expect(
        threadRepositoryPostgres.findById("thread-123")
      ).rejects.toThrowError("thread tidak ditemukan");
    });

    it("should return thread by id", async () => {
      // Arrange
      const payload = {
        title: "a title",
        body: "a body",
        owner: "user-123",
      };

      const expectThread = {
        id: "thread-123",
        title: payload.title,
        body: payload.body,
        owner: payload.owner,
      };

      await UsersTableTestHelper.addUser({ id: payload.owner });
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      await threadRepositoryPostgres.addThread(payload);

      // Action
      const thread = await threadRepositoryPostgres.findById("thread-123");
      expectThread.date = thread.date;

      // Assert
      expect(thread).toEqual(expectThread);
    });
  });
});
