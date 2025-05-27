/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable("replies", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    content: {
      type: "VARCHAR(255)",
      notNull: true,
    },
    comment_id: {
      type: "VARCHAR(50)",
      NotNull: true,
      references: "comments",
    },
    owner: {
      type: "VARCHAR(50)",
      NotNull: true,
      references: "users",
    },
    date: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
    is_deleted: {
      type: "BOOLEAN",
      notNull: true,
      default: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("replies");
};
