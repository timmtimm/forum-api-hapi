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

  describe("createThread function", () => {
    it("should persist add thread and return added thread correctly", async () => {
      // Arrange
      const payload = {
        title: "a title",
        body: "a body",
        owner: "user-123",
      };
      await UsersTableTestHelper.addUser({ id: payload.owner });
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await threadRepositoryPostgres.addThread(payload);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById(
        "thread-123"
      );
      expect(threads).toHaveLength(1);
    });
  });
});
