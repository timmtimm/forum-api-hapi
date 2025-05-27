const DeleteReply = require("../DeleteReply");

describe("a DeleteReply entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      replyId: "reply-123",
      commentId: "comments-123",
    };

    // Action & Assert
    expect(() => new DeleteReply(payload)).toThrowError(
      "DELETE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      threadId: "thread-123",
      replyId: true,
      commentId: 123,
      owner: 456,
    };

    // Action & Assert
    expect(() => new DeleteReply(payload)).toThrowError(
      "DELETE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create DeleteReply object correctly", () => {
    // Arrange
    const payload = {
      threadId: "thread-123",
      replyId: "reply-123",
      commentId: "comments-123",
      owner: "user-123",
    };

    // Action
    const { threadId, replyId, commentId, owner } = new DeleteReply(payload);

    // Assert
    expect(threadId).toEqual(payload.threadId);
    expect(replyId).toEqual(payload.replyId);
    expect(commentId).toEqual(payload.commentId);
    expect(owner).toEqual(payload.owner);
  });
});
