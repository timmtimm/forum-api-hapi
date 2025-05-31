const CreatedThread = require("../CreatedThread");

describe("a CreatedThread entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      title: "a title",
      owner: "user-123",
    };
    // Action & Assert
    expect(() => new CreatedThread(payload)).toThrowError(
      "CREATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      id: 123,
      title: "a title",
      owner: true,
    };
    // Action & Assert
    expect(() => new CreatedThread(payload)).toThrowError(
      "CREATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create CreatedThread object correctly", () => {
    // Arrange
    const payload = {
      id: "thread-123",
      title: "a title",
      owner: "user-123",
    };
    // Action
    const { id, title, owner } = new CreatedThread(payload);
    // Assert
    expect(id).toStrictEqual(payload.id);
    expect(title).toStrictEqual(payload.title);
    expect(owner).toStrictEqual(payload.owner);
  });
});
