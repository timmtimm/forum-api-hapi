const CreateComment = require("../CreateComment");

describe("a CreateComment entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      threadId: "thread-123",
      content: "a comment",
    };

    // Action & Assert
    expect(() => new CreateComment(payload)).toThrowError(
      "CREATE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      threadId: 123,
      content: "a comment",
      owner: true,
    };

    // Action & Assert
    expect(() => new CreateComment(payload)).toThrowError(
      "CREATE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create CreateComment object correctly", () => {
    // Arrange
    const payload = {
      threadId: "thread-123",
      content: "a comment",
      owner: "user-123",
    };

    // Action
    const { threadId, content, owner } = new CreateComment(payload);

    // Assert
    expect(threadId).toEqual(payload.threadId);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
