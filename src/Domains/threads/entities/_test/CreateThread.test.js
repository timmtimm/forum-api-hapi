const CreateThread = require("../CreateThread");

describe("a CreateThread entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      title: "a title",
      body: "a body",
    };

    // Action & Assert
    expect(() => new CreateThread(payload)).toThrowError(
      "CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      title: 123,
      body: "a body",
      owner: true,
    };

    // Action & Assert
    expect(() => new CreateThread(payload)).toThrowError(
      "CREATE_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create CreateThread object correctly", () => {
    // Arrange
    const payload = {
      title: "a title",
      body: "a body",
      owner: "user-123",
    };

    // Action
    const { title, owner, body } = new CreateThread(payload);

    // Assert
    expect(title).toEqual(payload.title);
    expect(owner).toEqual(payload.owner);
    expect(body).toEqual(payload.body);
  });
});
