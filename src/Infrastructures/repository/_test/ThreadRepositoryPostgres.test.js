const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
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

      const threadById = await threadRepositoryPostgres.findById("thread-123");
      expectThreadByFindId.date = threadById.date;
      expect(threadById).toStrictEqual(expectThreadByFindId);
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

      const beforeExecureDate = new Date();

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
      const afterExecureDate = new Date();
      const assertDate =
        thread.date >= beforeExecureDate && thread.date <= afterExecureDate;
      expect(assertDate).toBeTruthy();
      expect(thread).toStrictEqual(expectThread);
    });
  });
});
