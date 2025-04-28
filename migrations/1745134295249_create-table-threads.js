/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable("threads", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    title: {
      type: "VARCHAR(255)",
      notNull: true,
    },
    body: {
      type: "TEXT",
      notNull: true,
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
  });
};

exports.down = (pgm) => {
  pgm.dropTable("threads");
};
