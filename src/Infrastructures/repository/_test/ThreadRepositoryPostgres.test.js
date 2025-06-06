const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const CreateThread = require("../../../Domains/threads/entities/CreateThread");
const CreatedThread = require("../../../Domains/threads/entities/CreatedThread");
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
      const payload = new CreateThread({
        title: "a title",
        body: "a body",
        owner: "user-123",
      });

      const expectThread = new CreatedThread({
        id: "thread-123",
        title: payload.title,
        owner: payload.owner,
      });

      const expectThreadByFindId = {
        id: "thread-123",
        body: payload.body,
        title: payload.title,
        owner: payload.owner,
      };

      await UsersTableTestHelper.addUser({ id: payload.owner });
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const thread = await threadRepositoryPostgres.addThread(payload);

      // Assert
      expect(thread).toStrictEqual(expectThread);

      const threadById = await ThreadsTableTestHelper.findThreadsById(
        expectThread.id
      );
      expectThreadByFindId.date = threadById[0].date;
      expect(threadById[0]).toStrictEqual(expectThreadByFindId);
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
      const payload = new CreateThread({
        title: "a title",
        body: "a body",
        owner: "user-123",
      });

      const expectThread = {
        id: "thread-123",
        title: payload.title,
        body: payload.body,
        owner: payload.owner,
      };

      await UsersTableTestHelper.addUser({ id: payload.owner });
      await ThreadsTableTestHelper.addThread({
        id: expectThread.id,
        title: expectThread.title,
        body: expectThread.body,
        owner: expectThread.owner,
      });
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const thread = await threadRepositoryPostgres.findById("thread-123");

      // Assert
      expectThread.date = thread.date;
      expect(thread).toStrictEqual(expectThread);
    });
  });

  describe("verifyThreadExists function", () => {
    it("should throw error when thread not found", async () => {
      // Arrange
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action & Assert
      await expect(
        threadRepositoryPostgres.verifyThreadExists("thread-123")
      ).rejects.toThrowError(NotFoundError);
    });

    it("should not throw error when thread found", async () => {
      // Arrange
      const payload = new CreateThread({
        title: "a title",
        body: "a body",
        owner: "user-123",
      });

      await UsersTableTestHelper.addUser({ id: payload.owner });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        title: payload.title,
        body: payload.body,
        owner: payload.owner,
      });
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action & Assert
      await expect(
        threadRepositoryPostgres.verifyThreadExists("thread-123")
      ).resolves.not.toThrowError(NotFoundError);
    });
  });
});
