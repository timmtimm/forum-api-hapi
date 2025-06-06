const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const UserRepository = require("../../../Domains/users/UserRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const GetThreadUseCase = require("../GetThreadUseCase");

describe("GetThreadUseCase", () => {
  it("should orchestrating the get thread action correctly", async () => {
    // Arrange
    const useCasePayload = "thread-123";
    const expectedThread = {
      id: useCasePayload,
      title: "sebuah judul",
      body: "sebuah body",
      date: "2023-01-01T00:00:00.000Z",
      username: "dicoding",
      comments: [
        {
          id: "comment-123",
          content: "sebuah comment",
          date: "2023-01-01T00:00:00.000Z",
          username: "dicoding",
          replies: [],
        },
      ],
    };

    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();

    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.findById = jest.fn().mockImplementation(() =>
      Promise.resolve({
        id: "thread-123",
        title: "sebuah judul",
        body: "sebuah body",
        date: "2023-01-01T00:00:00.000Z",
        owner: "user-123",
      })
    );
    mockUserRepository.getUsernameById = jest
      .fn()
      .mockImplementation(() => Promise.resolve("dicoding"));

    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve([
          {
            id: "comment-123",
            content: "sebuah comment",
            thread_id: "thread-123",
            date: "2023-01-01T00:00:00.000Z",
            owner: "user-123",
            is_deleted: false,
          },
        ])
      );
    mockReplyRepository.getRepliesByCommentId = jest
      .fn()
      .mockImplementation(() => Promise.resolve([]));

    const getThreadUseCase = new GetThreadUseCase({
      replyRepository: mockReplyRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      useCasePayload
    );
    expect(mockThreadRepository.findById).toBeCalledWith(useCasePayload);
    expect(mockUserRepository.getUsernameById).toBeCalledWith("user-123");
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      useCasePayload
    );
    expect(thread).toStrictEqual(expectedThread);
  });

  it("should throw one deleted comment as '**komentar telah dihapus**'", async () => {
    // Arrange
    const useCasePayload = "thread-123";
    const expectThread = {
      id: useCasePayload,
      title: "sebuah judul",
      body: "sebuah body",
      date: "2023-01-01T00:00:00.000Z",
      username: "dicoding",
      comments: [
        {
          id: "comment-123",
          content: "**komentar telah dihapus**",
          date: "2023-01-01T00:00:00.000Z",
          replies: [],
          username: "dicoding",
        },
      ],
    };

    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();

    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.findById = jest.fn().mockImplementation(() =>
      Promise.resolve({
        id: "thread-123",
        title: "sebuah judul",
        body: "sebuah body",
        date: "2023-01-01T00:00:00.000Z",
        owner: "user-123",
      })
    );
    mockUserRepository.getUsernameById = jest
      .fn()
      .mockImplementation(() => Promise.resolve("dicoding"));

    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve([
          {
            id: "comment-123",
            content: "sebuah comment",
            thread_id: "thread-123",
            date: "2023-01-01T00:00:00.000Z",
            owner: "user-123",
            is_deleted: true,
          },
        ])
      );
    mockReplyRepository.getRepliesByCommentId = jest
      .fn()
      .mockImplementation(() => Promise.resolve([]));

    const getThreadUseCase = new GetThreadUseCase({
      replyRepository: mockReplyRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      useCasePayload
    );
    expect(mockThreadRepository.findById).toBeCalledWith(useCasePayload);
    expect(mockUserRepository.getUsernameById).toBeCalledWith("user-123");
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      useCasePayload
    );
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(
      "comment-123"
    );
    expect(thread).toStrictEqual(expectThread);
  });

  it("should throw one deleted reply as '**balasan telah dihapus**'", async () => {
    // Arrange
    const useCasePayload = "thread-123";
    const expectThread = {
      id: "thread-123",
      title: "sebuah judul",
      body: "sebuah body",
      date: "2023-01-01T00:00:00.000Z",
      username: "dicoding",
      comments: [
        {
          id: "comment-123",
          content: "sebuah comment",
          date: "2023-01-01T00:00:00.000Z",
          username: "dicoding",
          replies: [
            {
              id: "reply-123",
              content: "**balasan telah dihapus**",
              date: "2023-01-01T00:00:00.000Z",
              username: "dicoding",
            },
          ],
        },
      ],
    };

    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();

    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.findById = jest.fn().mockImplementation(() =>
      Promise.resolve({
        id: "thread-123",
        title: "sebuah judul",
        body: "sebuah body",
        date: "2023-01-01T00:00:00.000Z",
        owner: "user-123",
      })
    );
    mockUserRepository.getUsernameById = jest
      .fn()
      .mockImplementation(() => Promise.resolve("dicoding"));
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve([
          {
            id: "comment-123",
            content: "sebuah comment",
            thread_id: "thread-123",
            date: "2023-01-01T00:00:00.000Z",
            owner: "user-123",
            is_deleted: false,
          },
        ])
      );
    mockReplyRepository.getRepliesByCommentId = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve([
          {
            id: "reply-123",
            content: "sebuah balasan",
            date: "2023-01-01T00:00:00.000Z",
            owner: "user-123",
            is_deleted: true,
          },
        ])
      );
    const getThreadUseCase = new GetThreadUseCase({
      replyRepository: mockReplyRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      useCasePayload
    );
    expect(mockThreadRepository.findById).toBeCalledWith(useCasePayload);
    expect(mockUserRepository.getUsernameById).toBeCalledWith("user-123");
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      useCasePayload
    );
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(
      "comment-123"
    );
    expect(thread).toStrictEqual(expectThread);
  });

  it("should throw one reply", async () => {
    // Arrange
    const useCasePayload = "thread-123";
    const expectThread = {
      id: useCasePayload,
      title: "sebuah judul",
      body: "sebuah body",
      date: "2023-01-01T00:00:00.000Z",
      username: "dicoding",
      comments: [
        {
          id: "comment-123",
          content: "sebuah comment",
          date: "2023-01-01T00:00:00.000Z",
          username: "dicoding",
          replies: [
            {
              id: "reply-123",
              content: "sebuah balasan",
              date: "2023-01-01T00:00:00.000Z",
              username: "dicoding",
            },
          ],
        },
      ],
    };

    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();

    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.findById = jest.fn().mockImplementation(() =>
      Promise.resolve({
        id: "thread-123",
        title: "sebuah judul",
        body: "sebuah body",
        date: "2023-01-01T00:00:00.000Z",
        owner: "user-123",
      })
    );
    mockUserRepository.getUsernameById = jest
      .fn()
      .mockImplementation(() => Promise.resolve("dicoding"));

    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve([
          {
            id: "comment-123",
            content: "sebuah comment",
            thread_id: "thread-123",
            date: "2023-01-01T00:00:00.000Z",
            owner: "user-123",
            is_deleted: false,
          },
        ])
      );
    mockReplyRepository.getRepliesByCommentId = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve([
          {
            id: "reply-123",
            content: "sebuah balasan",
            date: "2023-01-01T00:00:00.000Z",
            owner: "user-123",
          },
        ])
      );

    const getThreadUseCase = new GetThreadUseCase({
      replyRepository: mockReplyRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      useCasePayload
    );
    expect(mockThreadRepository.findById).toBeCalledWith(useCasePayload);
    expect(mockUserRepository.getUsernameById).toBeCalledWith("user-123");
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      useCasePayload
    );
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(
      "comment-123"
    );
    expect(thread).toStrictEqual(expectThread);
  });
});
