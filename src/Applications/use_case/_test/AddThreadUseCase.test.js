const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const AddThreadUseCase = require("../AddThreadUseCase");

describe("AddThreadUseCase", () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the create thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      title: "a title",
      body: "a body",
      owner: "user-123",
    };

    const mockCreatedThread = {
      id: "thread-123",
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.addThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockCreatedThread));

    /** creating use case instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const createdThread = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(createdThread).toStrictEqual(mockCreatedThread);
  });
});
