const InvariantError = require("../../Commons/exceptions/InvariantError");
const CommentRepository = require("../../Domains/comments/CommentRepository");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment({ threadId, content, owner }) {
    const id = `comment-${this._idGenerator()}`;
    const query = {
      text: "INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, owner",
      values: [id, content, threadId, owner],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }
}

module.exports = CommentRepositoryPostgres;
