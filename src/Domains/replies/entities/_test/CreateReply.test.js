const CreateReply = require("../CreateReply");

describe("a CreateReply entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      commentId: "comment-123",
      content: "a reply",
    };

    // Action & Assert
    expect(() => new CreateReply(payload)).toThrowError(
      "CREATE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      threadId: 123,
      commentId: 123,
      content: "a reply",
      owner: true,
    };

    // Action & Assert
    expect(() => new CreateReply(payload)).toThrowError(
      "CREATE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create CreateReply object correctly", () => {
    // Arrange
    const payload = {
      threadId: "thread-123",
      commentId: "comment-123",
      content: "a reply",
      owner: "user-123",
    };

    // Action
    const { threadId, commentId, content, owner } = new CreateReply(payload);

    // Assert
    expect(threadId).toEqual(payload.threadId);
    expect(commentId).toEqual(payload.commentId);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
