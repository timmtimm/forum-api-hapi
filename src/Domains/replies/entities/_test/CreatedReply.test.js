const CreatedReply = require("../CreatedReply");

describe("a CreatedReply entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      content: "a reply",
      owner: "user-123",
    };
    // Action & Assert
    expect(() => new CreatedReply(payload)).toThrowError(
      "CREATED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      id: 123,
      content: "a reply",
      owner: true,
    };
    // Action & Assert
    expect(() => new CreatedReply(payload)).toThrowError(
      "CREATED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create CreatedReply object correctly", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      content: "a reply",
      owner: "user-123",
    };
    // Action
    const { id, content, owner } = new CreatedReply(payload);
    // Assert
    expect(id).toStrictEqual(payload.id);
    expect(content).toStrictEqual(payload.content);
    expect(owner).toStrictEqual(payload.owner);
  });
});
